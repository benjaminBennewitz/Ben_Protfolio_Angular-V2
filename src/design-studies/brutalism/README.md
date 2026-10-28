# RAW/FORM — Brutalist Festival Study

[← Study overview](../../../README.md#standalone-design-studies) · [View live study](https://b2folio.de/design-studies/brutalism/)

A graphic-design-led study translating brutalist and neo-brutalist visual principles into a responsive festival website. RAW/FORM starts with a visual language; browser interaction is the means of making that language work on screen.

> [!NOTE]
> This is a non-commercial, experimental study in graphic design and web development, created for personal learning. It is not a production product or a commercial service. Its specific design and technical objectives are described below. Accessibility and production readiness are not the primary evaluation goals; support varies, and no comprehensive accessibility audit or WCAG conformance is claimed.

> [!IMPORTANT]
> The source is published for inspection and evaluation only. Public visibility does not grant permission to clone, copy, run, modify, or reuse it. The [portfolio license](../../../LICENSE) applies to original project contributions; third-party components retain their own terms.

## Intent and learning focus

**Primary focus: graphic design — translating a visual concept into a web format.**

The starting point is brutalist graphic design: an exposed grid, uncompromising typographic scale, hard divisions, a restricted palette, and deliberately direct visual communication. The question is how those principles can form a coherent website rather than remain a static poster or moodboard.

The fictional festival provides a setting for that translation. Headlines act as compositional blocks, rules make the grid visible, and orange creates a repeatable system for emphasis. Image cropping, density, spacing, and the relationship between text and image establish the identity across different sections and screen sizes. Concrete architecture supports the subject matter; it is not the sole reason for calling the graphic direction brutalist.

Responsive layout, reveals, and lightweight interaction are a second challenge: they must preserve the intended visual hierarchy and rhythm when the poster-like composition becomes a changing browser viewport. The purpose is to study that transfer from graphic design to the web, not to build an operational festival platform.

## Concept and visual direction

Large Anton headlines, technical information in IBM Plex Mono, hard grid lines, and orange accents establish the visual identity. Photography, SVG doodles, and contrasting content blocks combine the language of festival posters with editorial layouts.

The page moves from the oversized opening through the line-up, location, experience, and manifesto to ticket cards and a newsletter section. These are fictional content and interface demonstrations; the study does not process ticket purchases or newsletter subscriptions.

## Interaction experiments

- Chapter navigation and a mobile menu with state changes and Escape handling.
- Staggered text reveals and offset image reveals when content enters the viewport.
- Hover and focus reactions on links, buttons, and cards.
- A scroll-to-top control and an explicitly labelled demo cookie dialog. Its dismissed state is stored for the browser session in `sessionStorage`.
- Illustrative audio bars used as a graphic element rather than a functioning audio player.

## Technical approach

HTML, CSS, and VanillaJS are separated into the entry page, a stylesheet, and one deferred script. `IntersectionObserver` activates the reveals while the page follows normal document scrolling. The relevant motion is disabled under `prefers-reduced-motion`, leaving the content visible.

| Area | File / directory |
| --- | --- |
| Semantic page structure | [index.html](index.html) |
| Design tokens, layout, and visual states | [styles.css](styles.css) |
| Menu, demo actions, and reveals | [scripts/main.js](scripts/main.js) |
| Images and SVG graphics | `assets/` |
| Local fonts and license records | `assets/fonts/` |

The learning focus is the relationship between typographic scale, grid structure, visual contrast, and lightweight browser interactions. The implementation includes a skip link, focus styling, and semantic content areas; these are individual implementation choices, not a claim of complete accessibility coverage.

## Portfolio integration

The study is served at `/design-studies/brutalism/`. Angular's asset configuration publishes the standalone page alongside the main portfolio. Its visual rules and interaction code remain within the study directory.

## Credits and source notes

Design and implementation: Benjamin Bennewitz / B². Font license records remain with the local font directories and are not replaced by the portfolio license.

The photographic-looking festival, crowd, performance, and venue images are AI-generated and identified by visible AI badges in the study. They illustrate a fictional event rather than document a real festival. Their origin is separate from the authored graphic design, layout, and interface code.


## Wartung nach dem Refactoring vom 28.10.2026

Die eingebetteten CSS- und JavaScript-Blöcke wurden vollständig aus `index.html` entfernt. Auch der Inline-Submit-Handler der Newsletter-Demo und der Inline-Stil ihres zugänglichen Labels liegen jetzt in den zuständigen Dateien. Die HTML enthält nur noch Struktur, Inhalte und Dateiverweise.

| Datei | Zuständigkeit |
| --- | --- |
| `index.html` | Semantische Bereiche, Inhalte, Formulare, Navigation und Verweise auf CSS/JavaScript. |
| `styles.css` | Unveränderte visuelle Regeln und die aus dem Newsletter-Label übernommene `.sr-only`-Regel. |
| `scripts/main.js` | Kleine, private Initialisierungsfunktionen für Demo-Aktionen, Menü, Cookie-Hinweis, Scroll-to-top und Reveals. |

Für die überschaubare Logik genügt ein klassisches, mit `defer` eingebundenes Skript. Es benötigt weder ES-Modulimporte noch Bibliotheken, einen Bundler oder einen zusätzlichen Build-Schritt. Die Funktionen bleiben innerhalb einer privaten Startfunktion; es werden keine neuen globalen API-Objekte angelegt. Die vorhandenen Assetpfade funktionieren unverändert, weil die CSS-Datei neben der HTML liegt.

### Schreibstil

Alle 20 Funktionen besitzen JSDoc mit Parametern und Rückgabewerten. Normale Variablen haben rechts ausgerichtete einzeilige Kommentare. Variablenblöcke innerhalb von Funktionen werden durch Leerzeilen vom übrigen Code getrennt; zwischen Funktionen steht eine Leerzeile. Die eigentliche Ablauf- und Ereignislogik ist in kleine Aufgaben unterteilt. Die private Startfunktion und die Menü-/Cookie-Initialisierungen enthalten ihre eng zugehörigen privaten Helfer.

`styles.css` enthält Entwicklerkopf, Autor und Signatur nach dem Swiss-Muster sowie ein Inhaltsverzeichnis mit 17 passenden Abschnittsmarkierungen. Die Regeln bleiben in der bisherigen Kaskadenreihenfolge. Die einzige zusätzliche CSS-Regel übernimmt die vorherigen Inline-Deklarationen des Newsletter-Labels unverändert.

### Verhalten und gezielte Absicherung

Menü-Breakpoints, ARIA-Zustände, Escape-Verhalten, Cookie-Speicherschlüssel, Scroll-to-top-Schwelle, Reveal-Auswahl, Verzögerungen und Observer-Einstellungen bleiben erhalten. Newsletter und Social-Verweise bleiben ausdrücklich funktionslose Demos; ihre Standardaktionen werden jetzt über benannte Event-Handler verhindert.

Ein gesperrter `sessionStorage` unterbricht die Seite nicht mehr. Der Cookie-Hinweis lässt sich weiterhin ausblenden, seine Entscheidung kann dann jedoch nicht für einen erneuten Seitenaufruf gespeichert werden. Diese kleine Absicherung ist die einzige beabsichtigte funktionale Erweiterung.

### Prüfung

- JavaScript-Syntax, JSDoc-Abdeckung, Variablenkommentare und lokale HTML-Dateiverweise geprüft.
- Menü inklusive Escape und Ankernavigation, Cookie-Ausblendung mit Wiederherstellung nach Neuladen, Scroll-to-top, Newsletter-Demo und Social-Platzhalter auf Desktop und Mobilansicht gegen den Ausgangsstand geprüft.
- Die 213 bisherigen CSSOM-Regeln nach reiner Formatierungsnormalisierung verglichen: unverändert. Die neue `.sr-only`-Regel entspricht dem ausgelagerten Inline-Stil.
- Ganzseitenaufnahmen mit vollständig geladenen Bildern und Schriften bei Reduced Motion verglichen: bei 390 Pixeln Breite pixelgleich; bei 1440 Pixeln Breite unterscheiden sich lediglich 94 Pixel um maximal eine Farbstufe. Seitengrößen und Geometrie stimmen überein.
- Gesperrten Sitzungsspeicher geprüft: Seite und Cookie-Ausblendung bleiben bedienbar.
- Alle 46 Reveal-Ziele beim Scrollen freigegeben; ohne `IntersectionObserver` bleiben die Inhalte sichtbar.

Die Prüfung ist kein vollständiger Accessibility- oder Cross-Browser-Audit; ein vollständiger Angular-Build wurde nicht ausgeführt. Testwerkzeuge sind keine neuen Projektabhängigkeiten.

### Änderungs-ZIP übernehmen

Im Projektwurzelverzeichnis entpacken. Es enthält nur die vier geänderten oder neuen Dateien unter `src/design-studies/brutalism/`. Keine bisherigen Dateien müssen gelöscht werden. Die vorhandene Angular-Asset-Konfiguration übernimmt die neuen CSS- und JavaScript-Dateien automatisch.
