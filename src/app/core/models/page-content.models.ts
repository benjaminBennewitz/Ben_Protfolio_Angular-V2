/* src/app/core/models/page-content.models.ts */

/** @file Inhaltsmodelle für Snippets, Datenschutz und die Achievement-Übersicht. */

/** Übersetzte Snippet-Seitentexte. */
export interface SnippetPageTexts {
  readonly metaTitle: string;                 // Meta-Titel der Snippet-Route.
  readonly metaDescription: string;           // Meta-Description der Snippet-Route.
  readonly backLabel: string;                 // Linklabel zurück zur Startseite.
  readonly eyebrow: string;                   // Kleine technische Beschriftung.
  readonly title: string;                     // Hauptüberschrift der Seite.
  readonly intro: string;                     // Einleitung unter der Hauptüberschrift.
  readonly listTitle: string;                 // Titel der linken Eintragsliste.
  readonly searchLabel: string;               // Label der Suchleiste.
  readonly searchPlaceholder: string;         // Platzhalter der Suchleiste.
  readonly searchResultLabel: string;         // Label für die Ergebnisanzahl.
  readonly clearSearchLabel: string;          // Zugängliche Beschriftung zum Leeren der Suche.
  readonly desktopLabel: string;              // Zugängliche Beschriftung des Fensterbereichs.
  readonly closeWindowLabel: string;          // Zugängliche Beschriftung zum Schließen eines Fensters.
  readonly emptySearchText: string;           // Text, wenn keine Suche treffer liefert.
  readonly openAllLabel: string;              // Label für den Button, der alle Fenster öffnet.
  readonly closeAllLabel: string;             // Label für den Button, der alle Fenster schließt.
  readonly dragLabel: string;                 // Hinweis für verschiebbare Fenstertitelleisten.
  readonly resizeLabel: string;               // Label für den Resize-Handle eines Fensters.
  readonly codeExampleLabel: string;          // Zugängliches Label für einen Code-Beispielbereich.
  readonly copyLabel: string;                 // Label für das Kopieren eines Code-Snippets.
  readonly copySuccess: string;               // Meldung nach erfolgreichem Kopieren.
  readonly emptyTitle: string;                // Meldung, wenn keine Fenster geöffnet sind.
  readonly emptyText: string;                 // Hinweistext, wenn keine Fenster geöffnet sind.
  readonly supportLabel: string;              // Label für Browser-Support-Informationen.
  readonly previewLabel: string;              // Label für den Vorschau-Bereich.
  readonly previewFlexText: string;           // Erklärung für Flex-Vorschau.
  readonly previewGridText: string;           // Erklärung für Grid-Vorschau.
  readonly previewNthChildText: string;       // Erklärung für klassische Zähl-Vorschau.
  readonly previewSiblingText: string;        // Erklärung für moderne Zähl-Vorschau.
  readonly previewDefaultSelectText: string;  // Erklärung für normales Native-Select als Ausgangszustand.
  readonly previewDefaultSelectLabel: string; // Zugängliche Beschriftung der klassischen Select-Vorschau.
  readonly previewNativeSelectText: string;   // Erklärung für native Select-Vorschau.
  readonly previewNativeSelectLabel: string;  // Zugängliche Beschriftung der modernen Select-Vorschau.
  readonly oldCodeLabel: string;              // Label für alte Code-Variante.
  readonly newCodeLabel: string;              // Label für neue Code-Variante.
  readonly demoLabel: string;                 // Label für den Demo-Download.
  readonly notesLabel: string;                // Label für den Notizbereich.
  readonly entries: readonly SnippetEntry[];  // Snippeteinträge der aktuellen Sprache.
}

/** Einzelner kurzer Snippet- oder Snippet-Eintrag. */
export interface SnippetEntry {
  readonly slug: string;                                                                   // Stabiler technischer Schlüssel.
  readonly index: string;                                                                  // Nummer zur visuellen Sortierung.
  readonly title: string;                                                                  // Fenstertitel und Listentitel.
  readonly subtitle: string;                                                               // Kurzer Untertitel im Fenster.
  readonly category: string;                                                               // Kategorie des Eintrags.
  readonly summary: string;                                                                // Kurzbeschreibung des Snippets.
  readonly tags: readonly string[];                                                        // Kleine technische Tags.
  readonly support: string;                                                                // Lesbares Browser- oder Tool-Support-Label.
  readonly supportTone: 'stable' | 'experimental' | 'workflow';                            // Tonalität des Support-Badges.
  readonly codeLanguage: string;                                                           // Sprache des Code-Beispiels.
  readonly code: string;                                                                   // Code-Beispiel des Eintrags.
  readonly oldCode: string;                                                                // Klassische oder alte Code-Variante.
  readonly newCode: string;                                                                // Moderne oder neue Code-Variante.
  readonly oldCodeLabel?: string;                                                          // Optionales Label für die linke Vergleichsspalte.
  readonly newCodeLabel?: string;                                                          // Optionales Label für die rechte Vergleichsspalte.
  readonly demoHref?: string;                                                              // Optionaler Downloadpfad für eine eigenständige Demo-Datei.
  readonly previewType: 'layout' | 'count' | 'select' | 'spinner' | 'signals' | 'console'; // Visueller Vorschau-Typ des Eintrags.
  readonly notes: readonly string[];                                                       // Kurze Hinweise zum Eintrag.
}

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
