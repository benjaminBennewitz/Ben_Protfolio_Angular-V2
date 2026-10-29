/* src/app/core/models/catalog.models.ts */

/** @file Modelle des Designkatalogs und seines Readers. */

import type { PortfolioLanguage } from './shared.models';

/** Einzelne Seite im digitalen Designkatalog. */
export interface ProjectCatalogPage {
  readonly number: string;                                               // Sichtbare Seitenzahl oder Seitenkennung.
  readonly side?: 'left' | 'right';                                      // Position der Seite im Spread, wenn nur eine Seite sichtbar ist.
  readonly eyebrow: string;                                              // Kleine Kapitel- oder Bildbeschriftung.
  readonly title: string;                                                // Titel der Katalogseite.
  readonly text: string;                                                 // Kurzer editorialer Seiteninhalt.
  readonly image?: string;                                               // Optionaler Dateipfad für ein echtes Katalogseitenmotiv.
  readonly imageByLanguage?: Partial<Record<PortfolioLanguage, string>>; // Sprachabhängige Dateipfade für lokalisierte Katalogseiten.
  readonly assetType?: 'image' | 'pdf';                                  // Dateityp des Katalogseitenmotivs.
  readonly alt: string;                                                  // Alternativtext für das Katalogseitenmotiv.
  readonly imageHint: string;                                            // Geplanter Dateipfad, wenn das Motiv später ergänzt wird.
  readonly mood: 'cover' | 'image' | 'type' | 'detail';                  // Visuelle Stimmung der Seite für CSS-Varianten.
}

/** Eintrag im Katalog-Inhaltsverzeichnis. */
export interface ProjectCatalogTocItem {
  readonly number: string;            // Sichtbare Kapitelnummer.
  readonly title: string;             // Titel des Kapitels.
  readonly subtitle: string;          // Untertitel des Kapitels.
  readonly text: string;              // Kurzer Kontexttext zum Kapitel.
  readonly tool?: string;             // Optionaler Werkzeug- oder Themenschwerpunkt.
  readonly targetSpreadIndex: number; // Zielindex im Reader.
}

/** Doppelseite des digitalen Designkatalogs. */
export interface ProjectCatalogSpread {
  readonly id: string;                           // Stabile ID für Navigation und Tracking.
  readonly title: string;                        // Titel der Doppelseite.
  readonly text: string;                         // Kurzer Kontext zur Doppelseite.
  readonly pages: readonly ProjectCatalogPage[]; // Linke und rechte Katalogseite im proportionalen Sonderformat-Spread.
}

/** Inhalt für interaktive Editorial- und Designkatalog-Projekte. */
export interface ProjectCatalogShowcase {
  readonly eyebrow: string;                             // Kleine Beschriftung im Hero-Showcase.
  readonly title: string;                               // Titel des Katalog-Showcases.
  readonly status: string;                              // Kurzer Status- oder Format-Hinweis.
  readonly lead: string;                                // Editorialer Einführungstext zum Katalog.
  readonly ctaLabel: string;                            // Beschriftung des primären Hero-Links.
  readonly chips: readonly string[];                    // Kleine Tags zu Werkzeugen, Medien oder Gestaltung.
  readonly readerLabel: string;                         // Zugängliche Beschriftung des Katalog-Readers.
  readonly readerEyebrow: string;                       // Eyebrow für die große Reader-Section.
  readonly readerTitle: string;                         // Überschrift für die große Reader-Section.
  readonly readerHint: string;                          // Hinweis zur Interaktion mit dem Reader.
  readonly tocOpenLabel: string;                        // Beschriftung für den Button zum Öffnen des Inhaltsverzeichnisses.
  readonly tocCloseLabel: string;                       // Beschriftung für den Button zum Schließen des Inhaltsverzeichnisses.
  readonly tocTitle: string;                            // Titel des Inhaltsverzeichnis-Overlays.
  readonly previousLabel: string;                       // Beschriftung für vorherige Doppelseite.
  readonly nextLabel: string;                           // Beschriftung für nächste Doppelseite.
  readonly tocItems?: readonly ProjectCatalogTocItem[]; // Kapitel aus dem sichtbaren Katalog-Inhaltsverzeichnis.
  readonly spreads: readonly ProjectCatalogSpread[];    // Interaktive Doppelseiten des Katalogs.
  readonly galleryEyebrow: string;                      // Eyebrow für die Masonry-Galerie.
  readonly galleryTitle: string;                        // Überschrift für die Masonry-Galerie.
  readonly lightboxOpenLabel: string;                   // Beschriftung für Lightbox-Buttons.
  readonly lightboxCloseLabel: string;                  // Beschriftung für Lightbox schließen.
  readonly lightboxPreviousLabel: string;               // Beschriftung für vorheriges Galeriebild.
  readonly lightboxNextLabel: string;                   // Beschriftung für nächstes Galeriebild.
}
