<p align="center">
  <img src="./src/assets/social/og-portfolio-preview.svg" alt="B2FOLIO.DE Developer-Tag mit Design-, Code-, Debug- und Deploy-Workflow" width="100%" />
</p>

<h1 align="center">B2FOLIO.DE</h1>

<p align="center">
  <strong>Design. Code. Repeat.</strong><br />
  Eine interaktive Angular-Experience zwischen Full-Stack-Webentwicklung, UI/UX, Grafikdesign und kontrolliertem Chaos.
</p>

<p align="center">
  <a href="https://b2folio.de/"><img alt="Live: b2folio.de" src="https://img.shields.io/badge/Live-b2folio.de-a7ff19?style=for-the-badge&labelColor=111111" /></a>
  <img alt="Angular" src="https://img.shields.io/badge/Angular-21.2-DD0031?style=for-the-badge&logo=angular&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="SCSS" src="https://img.shields.io/badge/SCSS-Designsystem-C6538C?style=for-the-badge&logo=sass&logoColor=white" />
</p>

> [!IMPORTANT]
> Dieses Repository ist öffentlich einsehbar, aber **kein Open-Source-Projekt**. Gestattet ist ausschließlich die Betrachtung und Bewertung der Arbeit. Kopieren, Klonen, Verändern, Ausführen, Veröffentlichen, Weitergeben und Wiederverwenden sind ohne vorherige schriftliche Genehmigung untersagt. Maßgeblich ist die [B2FOLIO.DE Read-Only Source License](./LICENSE).

---

```txt
┌─ b2folio.system ────────────────────────────────────────────┐
│ project     B2FOLIO.DE                                     │
│ stack       Angular · TypeScript · SCSS                    │
│ craft       Full Stack · UI/UX · Grafikdesign              │
│ focus       Performance · Accessibility · SEO · Motion     │
│ state       clean structure / controlled chaos             │
└─────────────────────────────────────────────────────────────┘
```

## Inhaltsverzeichnis

- [Über das Projekt](#über-das-projekt)
- [Highlights](#highlights)
- [Projektbereiche](#projektbereiche)
- [Ausgewählte Case Studies](#ausgewählte-case-studies)
- [Architektur](#architektur)
- [Tech Stack](#tech-stack)
- [Projektstruktur](#projektstruktur)
- [Qualität und Barrierefreiheit](#qualität-und-barrierefreiheit)
- [Autorisierte lokale Entwicklung](#autorisierte-lokale-entwicklung)
- [Skripte](#skripte)
- [Build und Deployment](#build-und-deployment)
- [Lizenz und Nutzung](#lizenz-und-nutzung)
- [Autor](#autor)

## Über das Projekt

**B2FOLIO.DE** ist kein klassischer Portfolio-Onepager, sondern eine animierte, bilinguale Web-Experience. Das Projekt verbindet eine professionelle Portfolio-Struktur mit einem eigenständigen visuellen System aus MS-DOS-Dialogen, Terminal-Elementen, Halftone-Assets, Glitch-Layern, Poster-UI, Scroll-Snap und interaktiven Projektszenen.

Der Fokus liegt auf einer Seite, die visuell auffällt und technisch kontrolliert bleibt: komponentenbasiert, responsiv, SEO-freundlich, barrierearm und ohne eine fertige UI-Komponentenbibliothek.

**Live-Version:** [https://b2folio.de/](https://b2folio.de/)

## Highlights

| Bereich | Umsetzung |
| --- | --- |
| **Hero Experience** | Fullscreen-Hero mit Poster-UI, Halftone-Porträt, Glitch-Layern und Systemdialog |
| **Startloader** | Eigene B²-Bootsequenz mit reduzierter Alternative für entsprechende Motion-Präferenzen |
| **Themes** | Persistenter Dark und Light Mode über zentrale Theme-Tokens und Services |
| **Accessibility** | Einstellbare Kontrast-, Farbseh-, Schrift-, Komfort- und Bewegungspräferenzen |
| **Sprachen** | Vollständige deutsche und englische Inhalte mit persistentem Language Switcher |
| **Navigation** | Sticky Navigation, Custom Cursor, Scroll-to-top und Body-basiertes Scroll-Snap |
| **Motion** | Viewport-gesteuerte Reveals, gestaffelte Animationen und performante Deferred Sections |
| **Case Studies** | Eigenständige Detailseiten mit Architektur, Rolle, Stack, Highlights und visuellen Szenen |
| **SEO** | Routenbezogene Metadaten, Canonicals, strukturierte Daten, Sitemap und Social-Meta-Tags |
| **Kontakt** | Angular-Formular mit CSRF-gestützter Anbindung an die zentrale Infrastructure API |

## Projektbereiche

| Route / Bereich | Beschreibung |
| --- | --- |
| **`/`** | Startseite mit Hero, Über-mich-Bereich, Erfahrung, Skills, Prozess, Projekten, FAQ und Kontakt |
| **`/portfolio`** | Übersicht der ausgewählten Case Studies |
| **`/projects/:slug`** | Dynamische, projektspezifisch inszenierte Detailseiten |
| **`/snippets`** | Technische Kurzbeispiele mit isolierten Demo-Assets |
| **`/achievements`** | Freischaltbare Interaktionen und Portfolio-Achievements |
| **`/danke`** | Bestätigungsseite nach erfolgreicher Kontaktaufnahme |
| **`/impressum`** | Anbieterkennzeichnung |
| **`/datenschutz`** | Datenschutzerklärung |
| **Fallback** | Eigene 404-Seite für unbekannte Routen |

## Ausgewählte Case Studies

| Projekt | Fokus |
| --- | --- |
| **Intranet** | Modulares Angular-/Django-System mit Apps, Rollen, Rechten, Kommunikation und Automatisierung |
| **Dein Fußabdruck** | Interaktives Web-/Game-Projekt mit Simulation, Animationen und Spiellogik |
| **Carly Managed** | Projektmanagement-Anwendung mit Boards, Tasks, Live-Sync und Gamification |
| **Globi Flow** | Lokales Laborwerte-Assistenzsystem mit OCR, Review, Wissensbasis und Patientenbericht |
| **Grafikdesign-Katalog** | Editorialer Designkatalog mit Reader, Galerie und kreativer Projektinszenierung |

## Architektur

| Schicht | Verantwortung |
| --- | --- |
| **Core** | Zentrale Inhalte, Datenmodelle sowie Services für SEO, Sprache, Theme, API und Anwendungszustände |
| **Layout** | Globale App-Shell mit Navigation, Loader, Footer, Overlays, Toasts und Accessibility-Steuerung |
| **Pages** | Lazy geladene Routenseiten und deren seitenbezogene Orchestrierung |
| **Shared** | Wiederverwendbare Experience-, Visual-, Dialog-, Projekt- und Motion-Komponenten |
| **Styles** | Globale Tokens, Basisregeln, Utilities und projektspezifische Case-Study-Styles |
| **Environments** | Ausschließlich öffentliche, umgebungsabhängige Frontend-Konfiguration |

## Tech Stack

| Layer | Technologien |
| --- | --- |
| **Framework** | Angular 21.2 mit Standalone Components und Signals |
| **Sprache** | TypeScript 5.9 im Strict Mode |
| **Reaktivität** | Angular Signals und RxJS 7.8 |
| **Styling** | SCSS, CSS Custom Properties und semantische Design Tokens |
| **UI-Konzept** | Eigene Komponenten ohne Angular Material |
| **Routing** | Angular Router mit lazy geladenen Seiten und dynamischen Projekt-Detailseiten |
| **Testing** | Vitest 4 mit jsdom über den Angular Unit-Test-Builder |
| **SEO** | Angular Meta-Service, Canonicals, strukturierte Daten, OpenGraph und Twitter Cards |
| **Assets** | Lokale variable Fonts, reduzierte Material Symbols sowie WebP- und SVG-Grafiken |

## Projektstruktur

```txt
src/
├─ app/
│  ├─ core/
│  │  ├─ data/                 # Portfolio-Inhalte, Übersetzungen und Projektdaten
│  │  ├─ models/               # Content- und Projektmodelle
│  │  └─ services/             # API, SEO, Sprache, Theme und Anwendungszustände
│  ├─ layout/                  # Globale App-Shell und systemweite UI
│  ├─ pages/                   # Routenseiten
│  └─ shared/                  # Wiederverwendbare UI- und Experience-Komponenten
├─ assets/
│  ├─ fonts/                   # Lokale Fonts und reduzierter Icon-Font
│  ├─ images/                  # Hero-, Loader- und Projektassets
│  ├─ snippet-demos/           # Isolierte Beispiele für die Snippet-Seite
│  └─ social/                  # Social- und Repository-Preview
├─ environments/              # Öffentliche Frontend-Konfiguration je Umgebung
├─ styles/                    # Tokens, Basisstyles, Utilities und Case-Study-Styles
├─ styles.scss                # Globaler SCSS-Einstieg
├─ robots.txt                 # Crawler-Konfiguration
└─ sitemap.xml                # Öffentliche Sitemap
```

## Qualität und Barrierefreiheit

- strikte TypeScript- und Angular-Template-Prüfung
- semantische HTML-Struktur und konsistente Überschriften-Hierarchie
- sichtbare Fokuszustände und tastaturbedienbare Interaktionen
- ARIA-Beschriftungen für interaktive und erklärungsbedürftige Elemente
- kontrastbewusste Dark-/Light-Themes und zusätzliche Accessibility-Präferenzen
- Berücksichtigung reduzierter oder deaktivierter Bewegung
- responsive Layouts vom kleinen Smartphone bis zum Ultrawide-Viewport
- lazy geladene Routenseiten sowie `@defer` für aufwendige Sektionen
- Unit-Tests für zentrale Content-Integrität und Kontakt-API-Verhalten
- Production-Budgets für Initial Bundle und Komponentenstyles

Die Material-Symbols werden als reduzierter lokaler Font eingebunden. Dadurch benötigt das Icon-Rendering kein externes Font-CDN.

## Autorisierte lokale Entwicklung

> [!CAUTION]
> Die folgenden Befehle dokumentieren den internen Entwicklungsablauf. Ihre Veröffentlichung stellt keine Erlaubnis dar, das Projekt herunterzuladen, auszuführen oder weiterzuverwenden. Sie dürfen ausschließlich vom Rechteinhaber oder ausdrücklich schriftlich autorisierten Personen verwendet werden.

Vorausgesetzt wird eine von Angular 21 unterstützte Node.js-Version mit npm.

```bash
npm ci
npm run start
```

Der lokale Angular Dev Server läuft anschließend standardmäßig unter:

```txt
http://localhost:4200
```

## Skripte

| Befehl | Zweck |
| --- | --- |
| `npm run start` | Startet den Angular Dev Server |
| `npm run build` | Erstellt den standardmäßig produktiven Build |
| `npm run build:production` | Erstellt den Production-Build explizit |
| `npm run watch` | Baut fortlaufend mit Development-Konfiguration |
| `npm run test` | Startet die Unit-Tests |

## Build und Deployment

```bash
npm run build:production
```

Der deploybare Browser-Build wird erzeugt unter:

```txt
dist/ben-portfolio-experience/browser
```

Die Production-Konfiguration aktiviert Optimierung, Hashing, umgebungsbezogene Frontend-Konfiguration und Bundle-Budgets. `.htaccess`, `robots.txt`, `sitemap.xml` und die lokalen Assets werden in den Build übernommen.

## Lizenz und Nutzung

Dieses Projekt ist **proprietär und nicht Open Source**. Die öffentliche Sichtbarkeit dient ausschließlich der fachlichen und gestalterischen Bewertung.

Ohne vorherige ausdrückliche schriftliche Genehmigung ist insbesondere nicht gestattet:

- Quellcode oder Assets zu kopieren, zu klonen oder dauerhaft zu speichern,
- das Projekt auszuführen, zu bauen, zu verändern, zu veröffentlichen oder zu hosten,
- Code, Layouts, Texte, Grafiken, Animationen, Branding oder Case Studies zu übernehmen,
- das Projekt ganz oder teilweise in privaten, öffentlichen oder kommerziellen Arbeiten zu verwenden,
- Inhalte für KI-/ML-Training, Datensätze oder automatisierte Reproduktion zu verwenden,
- persönliche Daten, Kontaktangaben oder Impressumsinformationen zu übernehmen.

Aus der öffentlichen Sichtbarkeit oder einer technisch verfügbaren GitHub-Funktion folgt keine weitergehende Nutzungserlaubnis. Es gilt ausschließlich die vollständige [B2FOLIO.DE Read-Only Source License](./LICENSE). Davon ausgenommen sind eindeutig gekennzeichnete Drittanbieterbestandteile, für die deren jeweilige Lizenzbedingungen gelten.

## Autor

**Benjamin Bennewitz**  
Full Stack Webentwicklung · UI/UX · Grafikdesign

[b2folio.de](https://b2folio.de/) · [GitHub](https://github.com/benjaminBennewitz) · [LinkedIn](https://www.linkedin.com/in/benjamin-bennewitz-116a12306/)

```txt
clean structure / loud visuals / controlled chaos
```
