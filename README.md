<p align="center">
  <img src="./src/assets/social/og-portfolio-preview.svg" alt="B² Portfolio Experience Preview" width="100%" />
</p>

<h1 align="center">B² Portfolio Experience</h1>

<p align="center">
  <strong>Design. Code. Break the Grid.</strong><br />
  Ein interaktives Angular-Portfolio zwischen Terminal-UI, Glitch-Art, Motion Design und sauberer Full-Stack-Präsentation.
</p>

<p align="center">
  <img alt="Angular" src="https://img.shields.io/badge/Angular-21.2-DD0031?style=for-the-badge&logo=angular&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="SCSS" src="https://img.shields.io/badge/SCSS-Designsystem-C6538C?style=for-the-badge&logo=sass&logoColor=white" />
  <img alt="No Angular Material" src="https://img.shields.io/badge/Angular_Material-no-111111?style=for-the-badge" />
</p>

---

```txt
┌─ status.exe ───────────────────────────────────────────────┐
│ project     B² Portfolio Experience                        │
│ stack       Angular · TypeScript · SCSS                    │
│ style       Terminal · Glitch · Poster UI · Interactive    │
│ focus       Performance · Accessibility · SEO · Motion     │
│ state       break the grid                                 │
└─────────────────────────────────────────────────────────────┘
```

## Inhaltsverzeichnis

- [Über das Projekt](#über-das-projekt)
- [Highlights](#highlights)
- [Tech Stack](#tech-stack)
- [Projektbereiche](#projektbereiche)
- [Projektstruktur](#projektstruktur)
- [Installation](#installation)
- [Scripte](#scripte)
- [Designsystem](#designsystem)
- [SEO und Accessibility](#seo-und-accessibility)
- [Lokale Assets](#lokale-assets)
- [Build](#build)
- [Autor](#autor)

## Über das Projekt

**B² Portfolio Experience** ist kein klassisches Onepager-Portfolio, sondern eine animierte Web-Experience. Das Projekt verbindet eine professionelle Portfolio-Struktur mit einem starken visuellen System: MS-DOS-Dialoge, Terminal-Elemente, Halftone-Assets, Glitch-Layer, Scroll-Snap, Custom Cursor und interaktive Projekt-Szenen.

Der Fokus liegt auf einer Seite, die auffällt, aber trotzdem sauber gebaut bleibt: komponentenbasiert, dokumentiert, responsiv, SEO-freundlich und ohne unnötige UI-Bibliotheken.

## Highlights

| Bereich | Umsetzung |
| --- | --- |
| **Hero Experience** | Fullscreen-Hero mit Poster-UI, animierten Layern, Dialogfenstern und starkem visuellen Einstieg |
| **Startloader** | Eigene Loading-Experience mit mindestens 3 Sekunden Sichtbarkeit und interaktiven Details |
| **Themes** | Dark Mode und Light Mode über Theme-Service und Design Tokens |
| **Sprache** | Deutsch als Standardsprache, Englisch per Language Switcher vorbereitet |
| **Navigation** | Sticky Navigation, Custom Cursor, Scroll-to-top und Body-basiertes Scroll Snap |
| **Process Section** | Scroll-Lock-Section mit schrittweisem Reveal statt klassischer Timeline |
| **Projekt-Stack** | Fullscreen-Projektbereich mit überlagernden Panels, Szenen und spielerischen Assets |
| **CTA** | Chaos-CTA mit beweglichen Wortbausteinen und Kontaktfokus |
| **SEO** | Routenbezogene Meta-Titel, Descriptions, OpenGraph- und Twitter-Meta-Tags |
| **Accessibility** | Semantische Struktur, ARIA-Labels, Fokuszustände und kontrastbewusste Themes |

## Tech Stack

| Layer | Technologien |
| --- | --- |
| **Framework** | Angular 21.2 |
| **Sprache** | TypeScript 5.9 |
| **Styling** | SCSS, Design Tokens, CSS Custom Properties |
| **UI-Konzept** | Eigene Komponenten, keine Angular-Material-Abhängigkeit |
| **Icons** | Material Symbols als lokale Font-Datei über `src/assets/fonts` |
| **Routing** | Angular Router mit Projekt-Detailseiten |
| **SEO** | Angular Meta-Service, dynamischer Tab-Titel, OpenGraph-Vorbereitung |
| **Content** | Zentrale bilinguale Content-Datei für Deutsch und Englisch |

## Projektbereiche

| Route / Bereich | Beschreibung |
| --- | --- |
| **Start / Hero** | Visueller Einstieg mit Terminal-, Poster- und Glitch-Ästhetik |
| **Über mich** | Persönliche Positionierung zwischen Webentwicklung, UI/UX und Grafikdesign |
| **Techstack** | Gruppierte Skills und Infinity Tech Stack Bar |
| **Projekte** | Interaktiver Projekt-Stack mit fünf ausgewählten Arbeiten |
| **Projekt-Detailseiten** | Eigene Detailseiten mit Beschreibung, Zielsetzung, Rolle, Stack und Highlights |
| **Prozess** | Scroll-Lock-Abschnitt mit ganzheitlicher Arbeitsweise |
| **FAQ** | Kompakte Antworten zu Arbeitsweise, Technik und Projektfokus |
| **Kontakt** | Kontaktbereich mit Formular und großem SEO-freundlichem Footer |

### Enthaltene Projekte

| Projekt | Fokus |
| --- | --- |
| **Intranet** | Modulares Angular-/Django-System mit Apps, Rollen, Rechten, Kommunikation und Automatisierung |
| **HTML5 Browser Game** | Interaktives Web-/Game-Projekt mit Animationen und Spiellogik |
| **Carly Managed** | Projektmanagement-Tool und Kanban-Klon mit Gamification, Boards, Tasks, Nutzern und Live-Sync |
| **Globi Flow** | Lokales Laborwerte-Assistenzsystem mit OCR, Review, Wissensbasis und Patientenbericht |
| **Grafikdesign-Katalog** | Editorialer, visueller Designkatalog mit kreativer Projektinszenierung |

## Projektstruktur

```txt
src/
├─ app/
│  ├─ core/
│  │  ├─ data/                 # Zentrale Portfolio-Texte und Übersetzungen
│  │  ├─ models/               # Content- und Projektmodelle
│  │  └─ services/             # Sprache, Theme, SEO und Tab-Titel
│  ├─ layout/                  # Navigation, Loader, Footer, Cursor, Scroll-to-top
│  ├─ pages/                   # Startseite und Projekt-Detailseiten
│  └─ shared/                  # Wiederverwendbare UI- und Experience-Komponenten
├─ assets/
│  ├─ fonts/                   # Lokale Material-Symbols-Font
│  ├─ images/                  # Hero-, Loader- und Projektassets
│  └─ social/                  # OpenGraph-/Social-Preview
├─ styles/                     # Globale Tokens, Basisstyles und Utilities
├─ styles.scss                 # Globaler SCSS-Einstieg
├─ robots.txt                  # SEO-Crawler-Hinweise
└─ sitemap.xml                 # Sitemap-Vorbereitung
```

## Installation

```bash
npm install
npm run start
```

Die lokale Entwicklungsumgebung läuft danach über den Angular Dev Server.

```txt
http://localhost:4200
```

Für eine reproduzierbare Installation auf Basis der Lockfile kann alternativ verwendet werden:

```bash
npm ci
```

## Scripte

| Befehl | Zweck |
| --- | --- |
| `npm run start` | Startet die lokale Angular-Entwicklung |
| `npm run build` | Erstellt den Production-Build |
| `npm run watch` | Baut im Watch-Modus mit Development-Konfiguration |
| `npm run test` | Startet die Unit-Test-Konfiguration |

## Designsystem

Das Portfolio nutzt ein eigenes Designsystem statt einer fertigen UI-Bibliothek. Farben, Abstände, Oberflächen, Kontraste, Animationen und wiederkehrende UI-Patterns sind über SCSS und CSS Custom Properties organisiert.

```txt
┌─ design.tokens ─────────────────────────────────────────────┐
│ themes      dark · light                                    │
│ surfaces    cards · panels · dialogs · overlays             │
│ motion      reveal · hover · scroll · glitch                │
│ ui          buttons · tags · cards · sections · forms       │
│ assets      halftone · stickers · terminal · poster layers  │
└─────────────────────────────────────────────────────────────┘
```

### Stilrichtung

- Terminal- und MS-DOS-Anmutung
- Glitch-, Poster- und Halftone-Optik
- starke Akzentfarben
- interaktive Fullscreen-Abschnitte
- bewusst eingesetzte Animationen
- klare Lesbarkeit trotz experimenteller Oberfläche

## SEO und Accessibility

Das Projekt ist auf eine saubere öffentliche Präsentation vorbereitet:

- semantische HTML-Struktur
- sinnvolle Überschriften-Hierarchie
- dynamische Meta-Titel und Descriptions
- OpenGraph- und Twitter-Meta-Tags
- `robots.txt` und `sitemap.xml`
- ALT-Texte für visuelle Inhalte
- ARIA-Labels für interaktive Elemente
- sichtbare Fokuszustände
- kontrastbewusste Dark-/Light-Themes

## Lokale Assets

Die Material Symbols werden lokal eingebunden. Die Font liegt unter:

```txt
src/assets/fonts/material-symbols-outlined-latin-fill-normal.woff2
```

Dadurch bleibt das Icon-Rendering unabhängig von externen Font-CDNs und passt besser zu Performance- und Datenschutzanforderungen.

## Build

```bash
npm run build
```

Der Production-Build wird gemäß Angular-Konfiguration erzeugt unter:

```txt
dist/ben-portfolio-experience
```

In der Production-Konfiguration sind Budgets für Initial Bundle und Komponentenstyles hinterlegt, damit die Experience trotz vieler visueller Elemente kontrolliert bleibt.


## Autor

**Benjamin Bennewitz**  
Full Stack Webentwicklung · UI/UX · Grafikdesign

```txt
clean structure / loud visuals / controlled chaos
```
