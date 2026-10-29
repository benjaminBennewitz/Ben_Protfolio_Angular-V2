/* src/app/core/models/pricing.models.ts */

/** @file Inhaltsmodelle für Leistungen, Preise und Support. */

/** Inhalt der Angebots- und Preiskarten-Section. */
export interface PricingContent {
  readonly metaTitle: string;                           // SEO-Titel der eigenständigen Leistungsroute.
  readonly metaDescription: string;                     // SEO-Beschreibung der eigenständigen Leistungsroute.
  readonly eyebrow: string;                             // Kleine technische Beschriftung des Leistungs-Heros.
  readonly title: string;                               // Hauptüberschrift des Leistungs-Heros.
  readonly subtitle: string;                            // Einleitung unter der Hero-Überschrift.
  readonly heroPrimaryCtaLabel: string;                 // Primärer CTA zur Angebotsübersicht.
  readonly heroSecondaryCtaLabel: string;               // Sekundärer CTA zum Kontaktbereich.
  readonly heroDialogCloseLabel: string;                // Zugängliche Beschriftung des Scope-Dialog-Schließen-Buttons.
  readonly offersEyebrow: string;                       // Kleine Beschriftung oberhalb der Angebotsübersicht.
  readonly offersTitle: string;                         // Überschrift oberhalb der drei Angebotsstufen.
  readonly offersSubtitle: string;                      // Kurze Einleitung in die drei Angebotsstufen.
  readonly offersCtaLabel: string;                      // Allgemeiner CTA unterhalb der Angebotsübersicht.
  readonly note: string;                                // Hinweistext zu Einstiegspreisen und Aufwandsschätzung.
  readonly qualityBaseline: string;                     // Qualitätsstandard, der für jede Angebotskarte gilt.
  readonly ariaLabel: string;                           // ARIA-Label der Angebotskartenliste.
  readonly supportTitle: string;                        // Technisches Label des Maintenance-Bereichs.
  readonly supportHeadline: string;                     // Aussagekräftige Überschrift des Maintenance-Bereichs.
  readonly supportText: string;                         // Einleitungstext des Maintenance-Bereichs.
  readonly supportCtaLabel: string;                     // CTA am Ende des Maintenance-Bereichs.
  readonly outroEyebrow: string;                        // Technisches Label der abschließenden Kontakt-Section.
  readonly outroTitle: string;                          // Persönliche Abschlussüberschrift vor dem Footer.
  readonly outroText: string;                           // Kurzer persönlicher Abschluss- und Kontakttext.
  readonly outroPrimaryCtaLabel: string;                // Primärer CTA der Abschluss-Section.
  readonly outroSecondaryCtaLabel: string;              // Sekundärer CTA der Abschluss-Section.
  readonly outroStatus: string;                         // Kleine Terminal-Statuszeile der Abschluss-Section.
  readonly supportPlans: readonly PricingSupportPlan[]; // Sichtbare Abo-Preise im Maintenance-Bereich.
  readonly cards: readonly PricingCard[];               // Sichtbare Angebotskarten.
}

/** Einzelner monatlicher Support-Baustein. */
export interface PricingSupportPlan {
  readonly name: string;  // Name des Support-Bausteins.
  readonly price: string; // Monatlicher Einstiegspreis des Support-Bausteins.
  readonly text: string;  // Kurze Beschreibung des enthaltenen Supports.
}

/** Einzelne Angebots- oder Preiskarte. */
export interface PricingCard {
  readonly title: string;               // Name des Angebots.
  readonly price: string;               // Einstiegspreis als kompakte UI-Zeile.
  readonly claim: string;               // Kurzer Claim der Angebotsstufe.
  readonly description: string;         // Kurze Positionierung des Angebots.
  readonly badge?: string;              // Kurzer Badge, zum Beispiel Empfehlung.
  readonly featured?: boolean;          // Gibt an, ob die Karte visuell hervorgehoben wird.
  readonly command: string;             // Kleine Terminal-Zeile als technischer Schnellscan.
  readonly features: readonly string[]; // Enthaltene Leistungsbausteine.
  readonly ctaLabel: string;            // Buttontext der Karte.
}
