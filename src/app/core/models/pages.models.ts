/* src/app/core/models/pages.models.ts */

/** @file Modelle für Navigation, Kontakt, Footer und eigenständige Seiten. */

/** Grundlegende SEO-Daten einer Seite. */
export interface SeoContent {
  readonly title: string;       // Titel der aktuellen Seite.
  readonly description: string; // Meta-Description der aktuellen Seite.
  readonly keywords: string;    // Suchbegriffe für Meta- und JSON-LD-Daten.
  readonly imageAlt: string;    // Alternativtext für das Social-Preview-Bild.
  readonly hiddenTitle: string; // Titel, der bei inaktivem Browser-Tab angezeigt wird.
}

/** Navigations- und Bedienlabels. */
export interface NavigationContent {
  readonly home: string;               // Navigations- oder Bedienlabel für „Startseite“.
  readonly about: string;              // Navigations- oder Bedienlabel für „Über mich“.
  readonly skills: string;             // Navigations- oder Bedienlabel für „Skills“.
  readonly projects: string;           // Navigations- oder Bedienlabel für „Projekte“.
  readonly portfolio: string;          // Navigationslabel für die ausgelagerte Portfolio-Route.
  readonly snippets: string;           // Navigations- oder Bedienlabel für „Code-Snippets“.
  readonly process: string;            // Navigations- oder Bedienlabel für „Arbeitsprozess“.
  readonly faq: string;                // Navigations- oder Bedienlabel für „FAQ“.
  readonly contact: string;            // Navigations- oder Bedienlabel für „Kontakt“.
  readonly menu: string;               // Navigations- oder Bedienlabel für „Menü öffnen“.
  readonly close: string;              // Navigations- oder Bedienlabel für „Menü schließen“.
  readonly theme: string;              // Navigations- oder Bedienlabel für „Theme-Auswahl“.
  readonly language: string;           // Navigations- oder Bedienlabel für „Sprachauswahl“.
  readonly brandLabel: string;         // Zugängliches Label für den Markenlink.
  readonly achievementLabel: string;   // Zugängliches Label für den Achievement-Link.
  readonly contactAccessLabel: string; // Zugängliches Label für den schnellen Kontaktlink.
}

/** Thema im Kontaktformular. */
export interface ContactTopic {
  readonly value: string; // Stabiler technischer Wert für Formularlogik und Backend-Payload.
  readonly label: string; // Sichtbares Label des Themas.
  readonly icon: string;  // Material-Symbol für die visuelle Chip-Darstellung.
}

/** Inhalt des Kontaktformulars. */
export interface ContactContent {
  readonly eyebrow: string;                     // Kleine Beschriftung oberhalb der Überschrift.
  readonly title: string;                       // Sichtbare Überschrift.
  readonly subtitle: string;                    // Einleitung unter der Überschrift.
  readonly modalTitle: string;                  // Titel des Kontaktfensters.
  readonly modalCloseLabel: string;             // Zugängliche Beschriftung zum Schließen des Kontaktfensters.
  readonly topicLabel: string;                  // Beschriftung der Themenauswahl.
  readonly topicHint: string;                   // Hilfetext zur Themenauswahl.
  readonly topics: readonly ContactTopic[];     // Verfügbare Themen für die Kontaktanfrage.
  readonly nameLabel: string;                   // Beschriftung des Namensfelds.
  readonly emailLabel: string;                  // Beschriftung des E-Mail-Felds.
  readonly messageLabel: string;                // Beschriftung des Nachrichtenfelds.
  readonly requiredHint: string;                // Hinweis auf Pflichtfelder im Formular.
  readonly requiredMarkLabel: string;           // Zugängliches Label für den Pflichtstern.
  readonly submitLabel: string;                 // Beschriftung des Absende-Buttons.
  readonly sendingLabel: string;                // Beschriftung während des serverseitigen Versands.
  readonly successMessage: string;              // Bestätigung nach erfolgreichem Versand.
  readonly errorMessage: string;                // Allgemeine Fehlermeldung beim Versand.
  readonly validationErrorMessage: string;      // Fehlermeldung bei einer serverseitig abgelehnten Eingabe.
  readonly csrfErrorMessage: string;            // Fehlermeldung nach fehlgeschlagener CSRF-Erneuerung.
  readonly payloadTooLargeErrorMessage: string; // Fehlermeldung bei einer zu großen Anfrage.
  readonly rateLimitErrorMessage: string;       // Fehlermeldung bei zu vielen Anfragen in kurzer Zeit.
  readonly temporaryErrorMessage: string;       // Fehlermeldung bei vorübergehend nicht verfügbarer Infrastruktur.
  readonly networkErrorMessage: string;         // Fehlermeldung bei einem Netzwerkfehler.
  readonly serverErrorMessage: string;          // Allgemeine Fehlermeldung für unerwartete Serverfehler.
  readonly nameRequiredError: string;           // Fehlermeldung für einen fehlenden Namen.
  readonly nameLengthError: string;             // Fehlermeldung für einen zu kurzen Namen.
  readonly emailRequiredError: string;          // Fehlermeldung für eine fehlende E-Mail-Adresse.
  readonly emailFormatError: string;            // Fehlermeldung für ein ungültiges E-Mail-Format.
  readonly messageRequiredError: string;        // Fehlermeldung für eine fehlende Nachricht.
  readonly messageLengthError: string;          // Fehlermeldung für eine zu kurze Nachricht.
  readonly honeypotLabel: string;               // Beschriftung des unsichtbaren Honeypot-Felds.
  readonly privacy: string;                     // Hinweistext zur Kenntnisnahme der Datenschutzerklärung.
  readonly privacyLinkLabel: string;            // Linktext zur Datenschutzerklärung.
  readonly privacyRequiredError: string;        // Fehlermeldung für eine nicht bestätigte Datenschutz-Kenntnisnahme.
}

/** Inhalt der Dankeseite nach erfolgreichem Kontaktformular-Versand. */
export interface ThankYouContent {
  readonly metaTitle: string;              // Meta-Titel der Dankeseite.
  readonly metaDescription: string;        // Meta-Description der Dankeseite.
  readonly eyebrow: string;                // Kleine technische Beschriftung über dem Seitentitel.
  readonly title: string;                  // Hauptüberschrift der Dankeseite.
  readonly text: string;                   // Erklärungstext nach erfolgreichem Versand.
  readonly backLabel: string;              // Beschriftung des Zurück-Links.
  readonly dialogTitle: string;            // Titel des dekorativen Statusfensters.
  readonly dialogCloseLabel: string;       // Zugängliche Beschriftung zum Schließen des Statusfensters.
  readonly dialogLines: readonly string[]; // Zeilen im dekorativen Statusfenster.
}

/** Inhalt der eigenständigen 404-Fehlerseite. */
export interface NotFoundPageContent {
  readonly metaTitle: string;                      // Meta-Titel der Fehlerseite.
  readonly metaDescription: string;                // Meta-Description der Fehlerseite.
  readonly eyebrow: string;                        // Kleine technische Beschriftung oberhalb des Fehlers.
  readonly title: string;                          // Technische Hauptüberschrift der Fehlerseite.
  readonly text: string;                           // Kurzer erklärender Fehlertext.
  readonly actionsAriaLabel: string;               // Zugängliche Beschriftung der primären Recovery-Aktionen.
  readonly homeLabel: string;                      // Label des Links zur Startseite.
  readonly contactLabel: string;                   // Label des Links zum Kontaktbereich.
  readonly terminalTitle: string;                  // Titel des Recovery-Terminals.
  readonly terminalCloseLabel: string;             // Zugängliche Beschriftung zum Schließen des Recovery-Terminals.
  readonly requestedPathLabel: string;             // Label für die angeforderte Route.
  readonly terminalLines: readonly string[];       // Statische Terminal-Zeilen unterhalb der angeforderten Route.
  readonly sitemapAriaLabel: string;               // Zugängliche Beschriftung der Mini-Sitemap.
  readonly sitemapTitle: string;                   // Überschrift der Mini-Sitemap.
  readonly sitemapText: string;                    // Kurzer Hinweis oberhalb der Sitemap-Links.
  readonly sitemapGroups: readonly FooterColumn[]; // Gruppierte interne Recovery-Links.
}

/** Inhalt der Impressumsseite. */
export interface ImprintContent {
  readonly metaTitle: string;                   // Meta-Titel der Impressumsseite.
  readonly metaDescription: string;             // Meta-Description der Impressumsseite.
  readonly eyebrow: string;                     // Kleine technische Beschriftung über dem Seitentitel.
  readonly title: string;                       // Hauptüberschrift der Impressumsseite.
  readonly intro: string;                       // Kurze Einordnung oberhalb der Pflichtangaben.
  readonly backLabel: string;                   // Beschriftung des Zurück-Links.
  readonly sections: readonly ImprintSection[]; // Inhaltliche Blöcke der Impressumsseite.
}

/** Einzelner Informationsblock im Impressum. */
export interface ImprintSection {
  readonly title: string;            // Überschrift des Informationsblocks.
  readonly lines: readonly string[]; // Zeilen des Informationsblocks.
}

/** Footer-Inhalte und Linkgruppen. */
export interface FooterContent {
  readonly eyebrow: string;                       // Kleine Beschriftung oberhalb der Überschrift.
  readonly title: string;                         // Sichtbare Überschrift.
  readonly text: string;                          // Beschreibender Inhalt.
  readonly dialogTitle: string;                   // Titel des dekorativen Footer-Dialogfensters.
  readonly dialogText: string;                    // Text des dekorativen Footer-Dialogfensters.
  readonly dialogCloseLabel: string;              // Zugängliche Beschriftung zum Schließen des Footer-Dialogfensters.
  readonly petDialogTitle: string;                // Titel des kleinen Fülli-Hover-Dialogfensters.
  readonly petDialogText: string;                 // Text des kleinen Fülli-Hover-Dialogfensters.
  readonly petDialogLabel: string;                // Zugängliche Beschriftung des Fülli-Auslösers.
  readonly repositoryGate: RepositoryGateContent; // Texte der spielerischen Repository-Zugangsabfrage.
  readonly socialLinks: readonly FooterLink[];    // Social-Media-Links als kompakte Icon-Gruppe im Footer.
  readonly columns: readonly FooterColumn[];      // Gruppierte Links im Footer.
}

/** Übersetzte Texte der Repository-Sicherheitsfrage im Footer. */
export interface RepositoryGateContent {
  readonly triggerLabel: string;      // Beschriftung des Auslösers.
  readonly dialogTitle: string;       // Titel des Dialogfensters.
  readonly dialogLabel: string;       // Zugängliche Beschriftung des Dialogs.
  readonly closeLabel: string;        // Zugängliche Beschriftung zum Schließen.
  readonly intro: string;             // Einleitung zur Sicherheitsfrage.
  readonly question: string;          // Sichtbare Frage.
  readonly inputLabel: string;        // Beschriftung des Antwortfelds.
  readonly inputPlaceholder: string;  // Platzhalter im Antwortfeld.
  readonly submitLabel: string;       // Beschriftung des Absende-Buttons.
  readonly failureTitle: string;      // Titel des Dialogs bei falscher Antwort.
  readonly failureLabel: string;      // Zugängliche Beschriftung des Fehlerdialogs.
  readonly failureText: string;       // Rückmeldung bei falscher Antwort.
  readonly failureCloseLabel: string; // Zugängliche Beschriftung zum Schließen des Fehlerdialogs.
}

/** Linkgruppe im Footer. */
export interface FooterColumn {
  readonly title: string;                // Sichtbare Überschrift.
  readonly links: readonly FooterLink[]; // Links innerhalb der Gruppe.
}

/** Einzelner Footer-Link. */
export interface FooterLink {
  readonly label: string; // Sichtbare Beschriftung.
  readonly href: string;  // Zieladresse des Links.
}
