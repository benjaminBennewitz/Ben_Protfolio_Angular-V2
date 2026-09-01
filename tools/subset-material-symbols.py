# tools/subset-material-symbols.py

"""Erzeugt den lokalen Material-Symbols-Subset aus den tatsächlich verwendeten Icons."""

from __future__ import annotations

import re
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE_FONT = ROOT / "src/assets/fonts/material-symbols-outlined-latin-fill-normal.woff2"
OUTPUT_FONT = ROOT / "src/assets/fonts/material-symbols-portfolio.woff2"
SOURCE_ROOT = ROOT / "src"

STATIC_ICON_PATTERN = re.compile(
    r'class="[^"]*material-symbols-outlined[^"]*"[^>]*>\s*([a-z0-9_]+)\s*<',
)
ICON_PROPERTY_PATTERN = re.compile(r"\bicon\s*:\s*['\"]([a-z0-9_]+)['\"]")
ICON_WORD_PATTERN = re.compile(r"['\"]icon:([a-z0-9_]+)['\"]")


def collect_icon_names() -> set[str]:
    """Sammelt statische und datengetriebene Material-Symbol-Namen aus dem Quellcode."""
    icons: set[str] = set()

    for path in SOURCE_ROOT.rglob("*.html"):
        icons.update(STATIC_ICON_PATTERN.findall(path.read_text(encoding="utf-8")))

    for path in SOURCE_ROOT.rglob("*.ts"):
        content = path.read_text(encoding="utf-8")
        icons.update(ICON_PROPERTY_PATTERN.findall(content))
        icons.update(ICON_WORD_PATTERN.findall(content))

    return icons


def ascii_glyph_map(font: TTFont) -> dict[str, str]:
    """Erstellt eine Glyph-zu-Zeichen-Abbildung für die Ligatursequenzen des Icon-Fonts."""
    mapping: dict[str, str] = {}

    for table in font["cmap"].tables:
        if not table.isUnicode():
            continue

        for codepoint, glyph_name in table.cmap.items():
            if 32 <= codepoint < 127:
                mapping.setdefault(glyph_name, chr(codepoint))

    return mapping


def prune_gsub(font: TTFont, icons: set[str]) -> tuple[set[str], set[str]]:
    """Reduziert GSUB auf die im Portfolio verwendeten Ligaturen und FILL-Varianten."""
    glyph_to_ascii = ascii_glyph_map(font)
    kept_outputs: set[str] = set()
    found_icons: set[str] = set()

    for lookup in font["GSUB"].table.LookupList.Lookup:
        for subtable in lookup.SubTable:
            actual = subtable.ExtSubTable if subtable.__class__.__name__ == "ExtensionSubst" else subtable

            if actual.__class__.__name__ != "LigatureSubst":
                continue

            reduced_ligatures = {}
            for first_glyph, ligatures in actual.ligatures.items():
                kept_ligatures = []

                for ligature in ligatures:
                    glyph_sequence = [first_glyph, *ligature.Component]
                    icon_name = "".join(glyph_to_ascii.get(glyph, "") for glyph in glyph_sequence).lower()

                    if icon_name in icons:
                        kept_ligatures.append(ligature)
                        kept_outputs.add(ligature.LigGlyph)
                        found_icons.add(icon_name)

                if kept_ligatures:
                    reduced_ligatures[first_glyph] = kept_ligatures

            actual.ligatures = reduced_ligatures

    for lookup in font["GSUB"].table.LookupList.Lookup:
        for subtable in lookup.SubTable:
            actual = subtable.ExtSubTable if subtable.__class__.__name__ == "ExtensionSubst" else subtable

            if actual.__class__.__name__ != "SingleSubst":
                continue

            actual.mapping = {
                source: target
                for source, target in actual.mapping.items()
                if source in kept_outputs or target in kept_outputs or source.removesuffix(".fill") in kept_outputs
            }

    return kept_outputs, found_icons


def build_subset() -> None:
    """Schreibt einen WOFF2-Subset und bricht bei unbekannten Icon-Namen kontrolliert ab."""
    icons = collect_icon_names()
    font = TTFont(SOURCE_FONT)
    _, found_icons = prune_gsub(font, icons)
    missing_icons = sorted(icons - found_icons)

    if missing_icons:
        raise RuntimeError(f"Material-Symbol-Ligaturen fehlen: {', '.join(missing_icons)}")

    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.name_legacy = True
    options.name_languages = ["*"]
    options.glyph_names = True
    options.notdef_glyph = True
    options.notdef_outline = True
    options.recommended_glyphs = True

    subsetter = subset.Subsetter(options=options)
    subsetter.populate(text=" ".join(sorted(icons)))
    subsetter.subset(font)
    font.flavor = "woff2"
    font.save(OUTPUT_FONT)

    source_size = SOURCE_FONT.stat().st_size
    output_size = OUTPUT_FONT.stat().st_size
    reduction = 100 - ((output_size / source_size) * 100)
    print(f"{len(icons)} Icons: {source_size / 1024:.1f} KiB -> {output_size / 1024:.1f} KiB ({reduction:.1f}% kleiner)")


if __name__ == "__main__":
    build_subset()
