/* src/app/core/models/blood.models.ts */

/** @file Modelle für Blutanalyse- und Daten-Showcases. */

/** Beispielwert im Blutanalyse-Hero und im Werte-Guide. */
export interface ProjectBloodValuePreview {
  readonly label: string;                             // Abkürzung oder Laborwert-Name.
  readonly value: string;                             // Beispielwert oder verdichteter Status.
  readonly unit: string;                              // Einheit oder Kontext des Laborwerts.
  readonly range: string;                             // Referenz- oder Orientierungsbereich als UI-Text.
  readonly position: number;                          // Prozentuale Position auf einer visuellen Referenzskala.
  readonly tone: 'low' | 'normal' | 'high' | 'watch'; // Zustand für visuelle Einordnung und Hilfetext.
  readonly hint: string;                              // Benutzernahe Erklärung oder Hinweis zum Wert.
}

/** Schritt im Dokumenten- und Datenfluss der Blutanalyse. */
export interface ProjectBloodPipelineStep {
  readonly icon: string;              // Material-Symbol des Prozessschritts.
  readonly title: string;             // Kurzer Titel des Prozessschritts.
  readonly text: string;              // Benutzernahe Beschreibung des Prozessschritts.
  readonly points: readonly string[]; // Technische oder fachliche Detailpunkte.
}

/** Darstellungsmodus im Werte-Guide der Daten-Dashboard-Seite. */
export type ProjectBloodGuideModeKey = 'scale' | 'bar' | 'chart';

/** Umschaltbarer Diagrammstil im Werte-Guide. */
export interface ProjectBloodGuideMode {
  readonly key: ProjectBloodGuideModeKey; // Stabile ID für Zustand und CSS-Variante.
  readonly label: string;                 // Sichtbares Label des Diagrammstils.
  readonly description: string;           // Kurze Zusatzbeschreibung des Diagrammstils.
  readonly icon: string;                  // Material-Symbol für den Modusbutton.
}

/** Inhalt für Import-, Analyse- und Hilfesystem einer Blutanalyse-Detailseite. */
export interface ProjectBloodShowcase {
  readonly eyebrow: string;                                    // Kleine technische Beschriftung im Hero-Showcase.
  readonly title: string;                                      // Titel des Analyse-Frames.
  readonly status: string;                                     // Kurzer Status- oder Modulhinweis.
  readonly lead: string;                                       // Erklärender Text zum Analyse-Showcase.
  readonly ctaLabel: string;                                   // Beschriftung des primären Hero-Links.
  readonly chips: readonly string[];                           // Kleine technische oder fachliche Tags im Showcase.
  readonly documentTitle: string;                              // Titel des Dokumentenbereichs im Hero.
  readonly documentText: string;                               // Hilfetext des Dokumentenbereichs im Hero.
  readonly heroChartTitle: string;                             // Titel der großen Hero-Datengrafik.
  readonly heroChartText: string;                              // Hilfetext der großen Hero-Datengrafik.
  readonly previewLabel: string;                               // Zugängliche Beschriftung des Analyse-Containers.
  readonly values: readonly ProjectBloodValuePreview[];        // Beispielwerte für Vorschau und Werte-Guide.
  readonly pipelineEyebrow: string;                            // Eyebrow für den Datenfluss.
  readonly pipelineTitle: string;                              // Überschrift für den Datenfluss.
  readonly pipelineSteps: readonly ProjectBloodPipelineStep[]; // Schritte vom Dokument zur Auswertung.
  readonly guideEyebrow: string;                               // Eyebrow für den Werte-Guide.
  readonly guideTitle: string;                                 // Überschrift für den Werte-Guide.
  readonly guideModeLabel: string;                             // Zugängliche Beschriftung der Diagrammstil-Umschaltung.
  readonly guideModes: readonly ProjectBloodGuideMode[];       // Sichtbare Diagrammstile für den Werte-Guide.
  readonly roadmapNote?: string;                               // Optionaler Hinweis zu geplanten, aber noch nicht umgesetzten Visualisierungsfunktionen.
  readonly disclaimer: string;                                 // Hinweis, dass die Oberfläche Erklärung statt Diagnose liefert.
  readonly galleryEyebrow: string;                             // Eyebrow für die Galerie.
  readonly galleryTitle: string;                               // Überschrift für die Galerie.
}
