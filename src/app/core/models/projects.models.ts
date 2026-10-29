/* src/app/core/models/projects.models.ts */

/** @file Projektübersicht, Detaildaten und gemeinsame Projektbausteine. */

import type { ProjectBloodShowcase } from './blood.models';
import type { ProjectBoardShowcase } from './board.models';
import type { ProjectCatalogShowcase } from './catalog.models';
import type { HighlightItem, ProjectMetric } from './shared.models';

/** Inhalt der Projektübersicht. */
export interface ProjectsContent {
  readonly eyebrow: string;                // Kleine Beschriftung oberhalb der Überschrift.
  readonly title: string;                  // Sichtbare Überschrift.
  readonly subtitle: string;               // Einleitung unter der Überschrift.
  readonly introText: readonly string[];   // Ergänzende Einleitungstexte vor dem Projekt-Stack.
  readonly homeBackLabel: string;          // Beschriftung des Rücklinks von der Portfolio-Seite zur Experience.
  readonly dialogTitle: string;            // Titel des dekorativen Projekt-Terminalfensters.
  readonly dialogCloseLabel: string;       // ARIA-Label zum Schließen des Projekt-Terminalfensters.
  readonly dialogLines: readonly string[]; // Zeilen im dekorativen Projekt-Terminalfenster.
  readonly detailLabel: string;            // Beschriftung des Links zur Projekt-Detailseite.
  readonly projectComingSoonLabel: string; // Hinweis für vorübergehend deaktivierte Case-Studies.
  readonly jumpNavAriaLabel: string;       // Zugängliche Beschriftung der Sprungnavigation innerhalb der Portfolio-Seite.
  readonly caseStudiesJumpLabel: string;   // Beschriftung des Sprunglinks zu den Case Studies.
  readonly designStudiesJumpLabel: string; // Beschriftung des Sprunglinks zu den Design Studies.
  readonly designStudiesEyebrow: string;   // Kleine Beschriftung der eigenständigen visuellen Designstudien.
  readonly designStudiesTitle: string;     // Überschrift der Design-Study-Section.
  readonly designStudiesText: string;      // Einordnung der Designstudien als visuelle Experimente außerhalb der Case Studies.
  readonly designStudiesOpenLabel: string; // Beschriftung des Links zur eigenständigen Designstudie.
  readonly designStudiesAriaLabel: string; // Zugängliche Beschriftung der Design-Study-Liste.
  readonly overviewLabel: string;          // Beschriftung der Projektübersicht.
  readonly typeLabel: string;              // Beschriftung des Projekttyps.
  readonly yearLabel: string;              // Beschriftung des Projektzeitraums.
  readonly stackLabel: string;             // Beschriftung des Technologie-Stacks.
  readonly descriptionLabel: string;       // Überschrift der Projektbeschreibung.
  readonly goalLabel: string;              // Überschrift des Projektziels.
  readonly roleLabel: string;              // Überschrift der eigenen Rolle.
  readonly highlightsEyebrow: string;      // Kleine Beschriftung der Projekt-Highlights.
  readonly highlightsTitle: string;        // Überschrift der Projekt-Highlights.
  readonly metaAriaLabel: string;          // Zugängliche Beschriftung der Projektmetadaten.
  readonly techStackAriaLabel: string;     // Zugängliche Beschriftung der Technologieliste.
  readonly previewAriaLabel: string;       // Zugängliche Beschriftung der Projektvorschau.
  readonly trashPaperLabel: string;        // Zugängliche Beschriftung der Papierkorb-Interaktion.
  readonly typewriterLabel: string;        // Zugängliche Beschriftung der Schreibmaschinen-Interaktion.
  readonly eyeButtonLabel: string;         // Zugängliche Beschriftung für das interaktive Auge.
  readonly bombButtonLabel: string;        // Zugängliche Beschriftung für die interaktive Bombe.
  readonly bloodButtonLabel: string;       // Zugängliche Beschriftung für die Blutanalyse-Interaktion.
  readonly metricsLabel: string;           // Zugängliche Beschriftung für kompakte Projektkennzahlen.
  readonly caseStudyLabel: string;         // Überschrift für Case-Study- und Deep-Dive-Bereiche.
  readonly architectureLabel: string;      // Überschrift für Architekturkarten und Systemübersichten.
  readonly architectureHint: string;       // Kurzer Hinweis zur Architekturkarte und zu technischen Diagrammen.
  readonly liveDemoLabel: string;          // Überschrift für Demo- und Prototypbereiche.
  readonly galleryLabel: string;           // Überschrift für Screenshot- und Mockup-Galerien.
  readonly imageLabel: string;             // Beschriftung für das zusätzliche Bild unter dem Projekt-Terminal.
  readonly imageAlt: string;               // Alternativtext für das zusätzliche Bild unter dem Projekt-Terminal.
  readonly imageActionLabel: string;       // Buttontext zum Wechseln des zusätzlichen Projektbildes.
  readonly imageActionActiveLabel: string; // Buttontext nach dem Wechsel des zusätzlichen Projektbildes.
  readonly openDemoLabel: string;          // Beschriftung für einen externen Live-Demo-Link.
  readonly demoUnavailableLabel: string;   // Hinweis, wenn eine Live-Demo bewusst noch nicht öffentlich ist.
  readonly insightsLabel: string;          // Überschrift für Erkenntnisse und technische Learnings.
  readonly detailLayerLabel: string;       // Überschrift für ausgelagerte technische Umsetzungskapitel.
  readonly appLandscapeLabel: string;      // Kleine Beschriftung für die App-Landschaft auf Detailseiten.
  readonly appLandscapeTitle: string;      // Überschrift für die App-Landschaft auf Detailseiten.
  readonly demoRequestLabel: string;       // Beschriftung für eine Demo-Anfrage.
  readonly githubLabel: string;            // Beschriftung für den externen GitHub-Link eines Projekts.
  readonly zoomLabel: string;              // Zugängliches Label zum Vergrößern oder Prüfen eines Evidence-Screens.
  readonly lightboxCloseLabel: string;     // Zugängliches Label zum Schließen der gemeinsamen Projekt-Lightbox.
  readonly lightboxPreviousLabel: string;  // Zugängliches Label für das vorherige Bild der gemeinsamen Projekt-Lightbox.
  readonly lightboxNextLabel: string;      // Zugängliches Label für das nächste Bild der gemeinsamen Projekt-Lightbox.
}

/** Layout-Variante für projektspezifische Detailmodule. */
export type ProjectDetailMode = 'case-study' | 'demo' | 'productivity' | 'data' | 'editorial';

/** Unterstützte Diagrammvarianten der Arcade-Tech-Telemetrie. */
export type TelemetryChartVariant = 'radial' | 'area' | 'step';

/** Einzelner numerischer Datenpunkt für wiederverwendbare SVG-Charts. */
export interface TelemetryChartDataPoint {
  readonly label: string; // Kurze Achsen- oder Legendenbeschriftung.
  readonly value: number; // Numerischer Mess- oder Indexwert.
}

/** Konfiguration eines einzelnen Telemetrie-Charts. */
export interface ProjectTelemetryChart {
  readonly id: string;                               // Stabile ID für SVG-IDs und Tracking.
  readonly eyebrow: string;                          // Kleine technische Beschriftung.
  readonly title: string;                            // Sichtbarer Chart-Titel.
  readonly description: string;                      // Kurze Einordnung der Datenquelle oder Skala.
  readonly variant: TelemetryChartVariant;           // Chart-Typ innerhalb des gemeinsamen Visualisierungssystems.
  readonly data: readonly TelemetryChartDataPoint[]; // Numerische Datenpunkte.
  readonly valueSuffix?: string;                     // Optionales Suffix für Messwerte.
  readonly maxValue?: number;                        // Optional fest definierter Maximalwert der Skala.
}

/** Vollbild-Telemetrie einer Projekt-Detailseite. */
export interface ProjectTelemetryContent {
  readonly eyebrow: string;                          // Kleine Beschriftung oberhalb der Überschrift.
  readonly title: string;                            // Sichtbare Überschrift.
  readonly subtitle: string;                         // Einleitung unter der Überschrift.
  readonly statusLabel: string;                      // Beschriftung des Status.
  readonly statusValue: string;                      // Angezeigter Statuswert.
  readonly source: string;                           // Hinweis zur Quelle der Telemetriedaten.
  readonly kpiAriaLabel: string;                     // Zugängliche Beschriftung der Kennzahlen.
  readonly charts: readonly ProjectTelemetryChart[]; // Konfigurationen der Telemetrie-Diagramme.
}

/** Inhaltlicher Abschnitt für Case Study, Workflow oder Projektanalyse. */
export interface ProjectDetailChapter {
  readonly eyebrow: string;           // Kleine Kategorie oder technische Einordnung.
  readonly title: string;             // Überschrift des Abschnitts.
  readonly text: string;              // Beschreibungstext des Abschnitts.
  readonly points: readonly string[]; // Kurze Punkte, die den Abschnitt scannbar machen.
}

/** Interaktiver Knoten einer Architekturkarte. */
export interface ProjectArchitectureNode {
  readonly id: string;                     // Stabile ID für Auswahlzustand und Tastaturbedienung.
  readonly label: string;                  // Sichtbarer Name des Architekturbausteins.
  readonly icon: string;                   // Material-Symbol des Knotens.
  readonly role: string;                   // Kurze technische Rolle des Knotens.
  readonly text: string;                   // Beschreibung des Knotens.
  readonly connections: readonly string[]; // Verbundene Knoten als sichtbare Systembeziehungen.
}

/** Einzelne Zeile des listenbasierten Projekt-Feature-Index. */
export interface ProjectCapabilityItem {
  readonly label: string; // Kurze fachliche oder technische Kategorie der Fähigkeit.
  readonly title: string; // Prägnanter Titel der Fähigkeit.
  readonly text: string;  // Kompakte technische Beschreibung ohne Wiederholung der Modulkarte.
}

/** Listenbasierter Feature-Index für zusätzliche Projektfähigkeiten. */
export interface ProjectCapabilityIndex {
  readonly eyebrow: string;                         // Kleine technische Kennung oberhalb der Section.
  readonly title: string;                           // Überschrift des Feature-Index.
  readonly text: string;                            // Kurze Einordnung, warum die Liste ergänzend zur sichtbaren UI existiert.
  readonly items: readonly ProjectCapabilityItem[]; // Kompakte, scanbare Fähigkeiten des Systems.
}

/** Interaktive App-Karte innerhalb einer Projekt-Detailseite. */
export interface ProjectAppModule {
  readonly id: string;                           // Stabile ID für Hover-, Fokus- und Auswahlzustände.
  readonly title: string;                        // Sichtbarer App- oder Modulname.
  readonly text: string;                         // Kurze fachliche Beschreibung des Moduls.
  readonly icon: string;                         // Material-Symbol für die App-Karte.
  readonly badge?: string;                       // Optionaler Status oder Badge der Karte.
  readonly status?: 'live' | 'private' | 'soon'; // Zustand des Moduls im Portfolio-Kontext.
}

/** Kleines schließbares Terminal- oder MS-DOS-Fenster auf Detailseiten. */
export interface ProjectTerminalWidget {
  readonly id: string;                                       // Stabile ID für Sichtbarkeitszustände.
  readonly title: string;                                    // Fenstertitel im MS-DOS-Stil.
  readonly lines: readonly string[];                         // Kurze Terminalzeilen im Fenster.
  readonly position: 'status' | 'events' | 'auth' | 'queue'; // Visuelle Position im Hero.
}

/** Platzhalter oder echtes Bild für eine Projektgalerie. */
export interface ProjectGalleryItem {
  readonly title: string;                   // Titel des Screenshot-, Mockup- oder Asset-Slots.
  readonly text: string;                    // Kurze Einordnung des visuellen Inhalts.
  readonly image?: string;                  // Optionaler Bildpfad für echte Screenshots oder Galeriebilder.
  readonly backgroundColor?: string;        // Dominante Hintergrundfarbe für rahmende Bildcontainer.
  readonly imageHint?: string;              // Geplanter Dateipfad, wenn ein Galeriebild später ergänzt wird.
  readonly alt?: string;                    // Alternativtext für echte Screenshots.
  readonly size: 'sm' | 'md' | 'lg';        // Visuelle Gewichtung im Masonry-Layout.
  readonly annotations?: readonly string[]; // Kurze Callout-Texte für annotierte Screenshot-Karten.
  readonly icon?: string;                   // Material-Symbol für Platzhalter- und Mockup-Previews.
  readonly detail?: string;                 // Optionaler Detailtext für Lightbox- und Galerieansichten.
  readonly tools?: readonly string[];       // Optionale Werkzeug- oder Kontext-Tags für visuelle Arbeiten.
  readonly year?: string;                   // Optionaler Jahrgang oder Zeitraum der visuellen Arbeit.
}

/** Optionaler Live-Demo-Hinweis oder externer Demo-Link. */
export interface ProjectLiveDemo {
  readonly status: 'planned' | 'private' | 'available'; // Aktueller Status der Demo.
  readonly text: string;                                // Kurzer erklärender Text zur Demo.
  readonly url?: string;                                // Optionaler externer Link zur Demo.
  readonly githubUrl?: string;                          // Optionaler externer Link zum Repository.
}

/** Detaildaten eines Portfolio-Projekts. */
export interface PortfolioProject {
  readonly slug: string;                                           // Stabile Projektkennung für die Detailroute.
  readonly name: string;                                           // Sichtbarer Name.
  readonly availability?: 'available' | 'coming-soon';             // Öffentlicher Status der Case-Study in der Projektübersicht.
  readonly titleLines?: readonly string[];                         // Optionale Zeilen für eine bewusst gesetzte Hero-Headline.
  readonly kicker: string;                                         // Kurze Einordnung oberhalb der Projektbeschreibung.
  readonly summary: string;                                        // Kurzbeschreibung des Projekts.
  readonly overviewKicker?: string;                                // Optionaler Kurz-Kicker für Projektübersichten, wenn Detailseiten ausführlicher formuliert sind.
  readonly overviewSummary?: string;                               // Optionaler Kurztext für Projektübersichten, ohne die Detailseite inhaltlich zu verkürzen.
  readonly overviewTechStack?: readonly string[];                  // Optionaler kompakter Techstack für Projektübersichten und Projektkarten.
  readonly description: string;                                    // Ausführliche Projektbeschreibung.
  readonly goal: string;                                           // Zielsetzung des Projekts.
  readonly role: string;                                           // Eigene Rolle und Verantwortlichkeiten.
  readonly year: string;                                           // Jahr oder Zeitraum des Projekts.
  readonly type: string;                                           // Fachlicher oder gestalterischer Projekttyp.
  readonly accent: 'lime' | 'pink' | 'violet' | 'blue' | 'orange'; // Akzentfarbe für die Projektdarstellung.
  readonly techStack: readonly string[];                           // Eingesetzte Technologien und Werkzeuge.
  readonly highlights: readonly string[];                          // Hervorgehobene Aussagen.
  readonly terminalTitle?: string;                                 // Optionaler Titel des technischen Terminalfensters auf der Detailseite.
  readonly terminalLines?: readonly string[];                      // Optionale Terminalzeilen für Projektstatus, Architektur und technische Fakten.
  readonly technicalHighlights?: readonly HighlightItem[];         // Optionale technische Highlight-Karten für den oberen Detailbereich.
  readonly boardShowcase?: ProjectBoardShowcase;                   // Optionaler Board-Showcase für Kanban- und Gamification-Projekte.
  readonly bloodShowcase?: ProjectBloodShowcase;                   // Optionaler Blood-Showcase für Dokumentenimport und Laborwert-Auswertung.
  readonly catalogShowcase?: ProjectCatalogShowcase;               // Optionaler Designkatalog-Showcase für grafische Editorial-Projekte.
  readonly appModules?: readonly ProjectAppModule[];               // Optionaler Stapel aus Produkt- und App-Karten im Hero.
  readonly terminalWidgets?: readonly ProjectTerminalWidget[];     // Optionale schließbare Terminalfenster im Hero.
  readonly detailMode: ProjectDetailMode;                          // Projektindividuelle Darstellungsvariante der Detailseite.
  readonly metrics: readonly ProjectMetric[];                      // Kompakte Projektkennzahlen für den oberen Detailbereich.
  readonly telemetry?: ProjectTelemetryContent;                    // Vollflächiges KPI- und Chart-Dashboard der Projektseite.
  readonly chapters: readonly ProjectDetailChapter[];              // Tiefere Inhaltsabschnitte für Projektstory, Workflow oder Learnings.
  readonly architecture?: readonly ProjectArchitectureNode[];      // Optionale Architekturkarte für komplexe Systemprojekte.
  readonly capabilities?: ProjectCapabilityIndex;                  // Optionaler listenbasierter Index zusätzlicher Projektfähigkeiten.
  readonly gallery: readonly ProjectGalleryItem[];                 // Screenshot-, Mockup- oder Platzhalter-Galerie.
  readonly liveDemo?: ProjectLiveDemo;                             // Optionaler Live-Demo-Status oder externer Demo-Link.
  readonly requirements: readonly string[];                        // Anforderungen an das Projekt.
}

/** Konfiguration einer eigenständigen visuellen Designstudie. */
export interface DesignStudy {
  readonly id: string;              // Stabile Kennung der Studie.
  readonly name: string;            // Sichtbarer Projektname.
  readonly subtitle: string;        // Kurze visuelle Einordnung.
  readonly href: string;            // Öffentlicher Pfad der statischen Microsite.
  readonly preview: string;         // Vorschaubild innerhalb der Portfolio-Section.
  readonly tags: readonly string[]; // Kompakte Gestaltungsschwerpunkte.
}
