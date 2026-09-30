# [WHATWESEE] — Design Study

Statische Onepager-Studie im Swiss-/International-Typographic-Style.

## Struktur

- `index.html`
- `styles.css`
- `script.js`
- `assets/favicon.svg`
- `assets/images/*.webp`

## Bildstatus

Die aktuell enthaltenen Bilder wurden ausschließlich aus dem freigegebenen Layout-Entwurf als **temporäre Entwicklungs-Platzhalter** ausgeschnitten. Vor Veröffentlichung bitte durch die finalen Fotografien von Benjamin Bennewitz ersetzen.

Die sichtbaren `figcaption`-Credits sind deshalb absichtlich als `DEMO IMAGE · FINAL PHOTOGRAPHY © BENJAMIN BENNEWITZ` formuliert. Nach Austausch der Bilder können sie auf `© Benjamin Bennewitz` verkürzt werden.

## Geplante Bildrollen

- `hero-landscape.webp` — Hero-Slider / Landscape
- `archive-landscape.webp` — Landscape
- `archive-architecture.webp` — Architecture
- `archive-animals.webp` — Animals
- `archive-flowers.webp` — Flowers
- `article-landscape.webp` — Journal / Artikel
- `cta-landscape.webp` — CTA / Archive

Für den Hero-Slider werden die vorhandenen Archivbilder ebenfalls als temporäre Slides verwendet.

## Technik

- reines HTML / CSS / Vanilla JavaScript
- max. Seitenbreite: 1920 px
- responsive Grid-Layouts
- Mobile-Burger-Menü
- Hero-Slider mit Autoplay und manueller Navigation
- IntersectionObserver-Reveals
- alternierende Archive-Reveals: 01/03 von links, 02/04 von rechts
- `prefers-reduced-motion` berücksichtigt
- semantische `<figure>` / `<figcaption>`-Struktur für Bildcredits
