/* src/app/core/models/shared.models.ts */

/** @file Gemeinsame Sprach-, Theme- und kleine Inhaltsmodelle. */

/** Verfügbare Sprachen der Portfolio-Oberfläche. */
export type PortfolioLanguage = 'de' | 'en';

/** Verfügbare Theme-Varianten. */
export type PortfolioTheme = 'dark' | 'light';

/** Kurzer Kennzahlenblock. */
export interface StatItem {
  readonly value: string; // Angezeigter Wert.
  readonly label: string; // Sichtbare Beschriftung.
}

/** Kurzer Highlight-Eintrag. */
export interface HighlightItem {
  readonly icon: string;  // Name des Material-Symbols.
  readonly title: string; // Sichtbare Überschrift.
  readonly text: string;  // Beschreibender Inhalt.
}

/** Kleine Projektkennzahl für Detailseiten. */
export interface ProjectMetric {
  readonly value: string; // Kompakter Wert oder Status der Kennzahl.
  readonly label: string; // Beschriftung der Kennzahl.
  readonly text: string;  // Ergänzende Kurzinfo zur Kennzahl.
}
