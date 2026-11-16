/** @file Inhaltsmodelle für Datenschutz und die Achievement-Übersicht. */

/** Einzelner Datenschutzpunkt innerhalb eines Bento-Panels. */
export interface PrivacyChapter {
  readonly number: string;                           // Sichtbare Nummer des Datenschutzkapitels.
  readonly title: string;                            // Überschrift des Inhaltsbereichs.
  readonly text: readonly string[];                  // Absätze des Datenschutzkapitels.
  readonly tone?: 'accent' | 'soft' | 'success';     // Optionale visuelle Tonalität der Kapitelkarte.
  readonly size?: 'side' | 'wide' | 'full' | 'tall'; // Optionale Größenvariante der Kapitelkarte.
  readonly icon?: string;                            // Optionales Material-Symbol der Kapitelkarte.
}

/** Übersetzter Inhalt der Datenschutzroute. */
export interface PrivacyPageContent {
  readonly metaTitle: string;                                                     // SEO-Titel der Datenschutzroute.
  readonly metaDescription: string;                                               // Meta-Beschreibung der Datenschutzroute.
  readonly eyebrow: string;                                                       // Kleine technische Beschriftung der Seite.
  readonly title: string;                                                         // Überschrift des Inhaltsbereichs.
  readonly intro: string;                                                         // Einleitung zu den Datenschutzinformationen.
  readonly status: string;                                                        // Sichtbarer Datenschutz-Statushinweis.
  readonly backLabel: string;                                                     // Beschriftung des Rücklinks zur Experience.
  readonly contactLabel: string;                                                  // Beschriftung des Kontaktlinks.
  readonly scrollLabel: string;                                                   // Bedienhinweis für das horizontale Deck.
  readonly previousLabel: string;                                                 // Beschriftung der Navigation zum vorherigen Panel.
  readonly nextLabel: string;                                                     // Beschriftung der Navigation zum nächsten Panel.
  readonly overviewLabel: string;                                                 // Beschriftung der Kapitelübersicht.
  readonly signals: readonly { readonly icon: string; readonly label: string }[]; // Kompakte Hinweise zu eingesetzten Technologien.
  readonly chapters: readonly PrivacyChapter[];                                   // Geordnete Datenschutzkapitel der aktuellen Sprache.
}

/** Übersetzte Seitentexte der Achievement-Seite. */
export interface AchievementPageTexts {
  readonly metaTitle: string;       // Meta-Titel der Route.
  readonly metaDescription: string; // Meta-Description der Route.
  readonly backLabel: string;       // Link zurück zur Startseite.
  readonly eyebrow: string;         // Kleine technische Beschriftung.
  readonly title: string;           // Haupttitel.
  readonly intro: string;           // Introtext.
  readonly progressLabel: string;   // Fortschrittslabel.
  readonly lockedTitle: string;     // Label für gesperrte Trophäen.
  readonly hintButton: string;      // Button zum Einblenden von Hinweisen.
  readonly resetButton: string;     // Button zum Zurücksetzen.
}
