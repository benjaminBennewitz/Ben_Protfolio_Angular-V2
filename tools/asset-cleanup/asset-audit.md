# B² Portfolio – Asset Audit

Stand: 2026-09-04

## Ergebnis

- Assets gesamt: **240 Dateien**
- Sicher ungenutzt: **45 Dateien**
- Einsparung: **4.47 MiB**
- Behalten: **195 Dateien**

Der Audit berücksichtigt direkte Referenzen in Angular/SCSS/HTML, Build-/Tooling-Referenzen sowie dynamisch erzeugte Pfade.

## Wichtig: dynamisch verwendete Assets

Diese Assets sehen bei einer einfachen Textsuche teilweise ungenutzt aus, sind aber **in Benutzung** und dürfen nicht gelöscht werden:

- `src/assets/images/projects/design-catalog/en/catalog-page-01.webp` bis `catalog-page-54.webp`
  - Pfade werden über `getDesignCatalogPagePath()` dynamisch erzeugt.
- Alle 50 vorhandenen Dateien unter `src/assets/images/projects/design-catalog/masonry/`
  - Pfade werden aus `DESIGN_CATALOG_GALLERY_ITEMS[].file` erzeugt.
- `src/assets/fonts/material-symbols-outlined-latin-fill-normal.woff2`
  - Wird als Quelle von `tools/subset-material-symbols.py` benötigt.
- `src/assets/fonts/material-symbols-portfolio.woff2`
  - Wird produktiv durch `src/styles/tokens.scss` geladen.

## Sicher ungenutzte Dateien

### Fonts – 2 Dateien / ca. 1.01 MiB

- `src/assets/fonts/inter-variable.ttf`
- `src/assets/fonts/jetbrains-mono-variable.ttf`

Die produktive Website lädt ausschließlich die jeweiligen `.woff2`-Varianten.

### Allgemeine Bilder – 2 Dateien / ca. 0.59 MiB

- `src/assets/images/brain_rotation.gif`
- `src/assets/images/hero-brain-halftone.webp`

`brain_rotation.webp` wird verwendet; die GIF-Variante nicht.

### Legacy Project Stack – 22 Dateien / ca. 1.13 MiB

- `src/assets/images/project-stack/dont-click-that.webp`
- `src/assets/images/project-stack/peace-cyan.webp`
- `src/assets/images/project-stack/hide-girl-pink.webp`
- `src/assets/images/project-stack/messy-batch.webp`
- `src/assets/images/project-stack/bomb-pink.webp`
- `src/assets/images/project-stack/trust-not-found.webp`
- kompletter Ordner `src/assets/images/project-stack/project_2/` mit 16 WebP-Dateien

Hinweis: `bomb-pink.webp` ist byte-identisch zu dem verwendeten `bomb.webp`.

### Carly Legacy – 8 Dateien / ca. 1.60 MiB

- `src/assets/images/projects/carly-managed/carly-head.webp`
- `src/assets/images/projects/carly-managed/screens/board.webp`
- `src/assets/images/projects/carly-managed/screens/dashboard.webp`
- `src/assets/images/projects/carly-managed/screens/settings.webp`
- `src/assets/images/projects/carly-managed/storybook/carly-story-01.webp`
- `src/assets/images/projects/carly-managed/storybook/carly-story-02.webp`
- `src/assets/images/projects/carly-managed/storybook/carly-story-03.webp`
- `src/assets/images/projects/carly-managed/storybook/carly-story-04.webp`

Drei der alten Screens sind zusätzlich echte Duplikate:

- `board.webp` = `board-overview.webp`
- `dashboard.webp` = `dashboard-light.webp`
- `settings.webp` = `settings-carly.webp`

Die jeweils rechts genannten Varianten sind produktiv referenziert und bleiben erhalten.

### Design-Archiv Legacy – 9 Dateien / ca. 0.11 MiB

- `src/assets/images/projects/design-catalog/catalog-page-01.webp`
- `src/assets/images/projects/design-catalog/gallery-assets.webp`
- `src/assets/images/projects/design-catalog/gallery-color-look.webp`
- `src/assets/images/projects/design-catalog/gallery-cover.webp`
- `src/assets/images/projects/design-catalog/gallery-retouch.webp`
- `src/assets/images/projects/design-catalog/gallery-spread.webp`
- `src/assets/images/projects/design-catalog/gallery-texture.webp`
- `src/assets/images/projects/design-catalog/gallery-typography.webp`
- `src/assets/images/projects/design-catalog/gallery-vector.webp`

Der Reader nutzt ausschließlich `design-catalog/en/catalog-page-XX.webp`; die Galerie nutzt ausschließlich `design-catalog/masonry/*.webp`.

### Sonstiges Legacy – 2 Dateien

- `src/assets/images/projects/pepes-adventure/desert-hero-bg.webp`
- `src/assets/scripts/scroll-restoration.js`

Die Scroll-Restoration befindet sich inzwischen inline in `src/index.html`; die alte Asset-Datei wird nicht eingebunden.

## Empfehlung

`cleanup-unused-assets.cmd` löscht ausschließlich die oben aufgeführten, statisch und semantisch geprüften Dateien. Danach:

```cmd
npm run build:production
```

Anschließend optional mit `git status` kontrollieren, welche Assets entfernt wurden.
