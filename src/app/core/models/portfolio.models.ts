/* src/app/core/models/portfolio.models.ts */

/**
 * @file Typdefinitionen für Portfolio-Inhalte, UI-Zustände und Projektseiten.
 * @description Bündelt die gemeinsam genutzten Interfaces der Anwendung.
 */

/** Verfügbare Sprachen der Portfolio-Oberfläche. */
export type PortfolioLanguage = 'de' | 'en';

/** Verfügbare Theme-Varianten. */
export type PortfolioTheme = 'dark' | 'light';

/** Grundlegende SEO-Daten einer Seite. */
export interface SeoContent {
  /** Titel der aktuellen Seite. */
  readonly title: string;
  /** Meta-Description der aktuellen Seite. */
  readonly description: string;
  /** Suchbegriffe für Meta- und JSON-LD-Daten. */
  readonly keywords: string;
  /** Alternativtext für das Social-Preview-Bild. */
  readonly imageAlt: string;
  /** Titel, der bei inaktivem Browser-Tab angezeigt wird. */
  readonly hiddenTitle: string;
}

/** Navigations- und Bedienlabels. */
export interface NavigationContent {
  readonly home: string;
  readonly about: string;
  readonly skills: string;
  readonly projects: string;
  readonly blog: string;
  readonly process: string;
  readonly faq: string;
  readonly contact: string;
  readonly menu: string;
  readonly close: string;
  readonly theme: string;
  readonly language: string;
  /** Zugängliches Label für den Markenlink. */
  readonly brandLabel: string;
  /** Zugängliches Label für den Achievement-Link. */
  readonly achievementLabel: string;
  /** Zugängliches Label für den schnellen Kontaktlink. */
  readonly contactAccessLabel: string;
}

/** Textblock für die Hero-Section. */
export interface HeroContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly subtitle: string;
  readonly primaryCta: string;
  readonly secondaryCta: string;
  readonly consoleLines: readonly string[];
  readonly dialogLabel: string;
  readonly statusLabel: string;
  readonly stats: readonly StatItem[];
}

/** Kurzer Kennzahlenblock. */
export interface StatItem {
  readonly value: string;
  readonly label: string;
}

/** Inhalt der Über-mich-Section. */
export interface AboutContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly text: readonly string[];
  readonly highlights: readonly HighlightItem[];
  /** Zugängliche Beschriftung des About-Bildbereichs. */
  readonly imageLabel: string;
  /** Alternativtext für das About-Kaffeebild. */
  readonly imageAlt: string;
  /** Zugängliche Beschriftung des interaktiven About-Dialogs. */
  readonly dialogLabel: string;
  /** Text im interaktiven About-Dialog. */
  readonly dialogText: string;
  /** Beschriftung des Dialog-Aktionsbuttons. */
  readonly dialogAction: string;
  /** Zugängliche Beschriftung des Dialog-Schließen-Buttons. */
  readonly dialogCloseLabel: string;
}

/** Kurzer Highlight-Eintrag. */
export interface HighlightItem {
  readonly icon: string;
  readonly title: string;
  readonly text: string;
}

/** Inhalt des Erfahrungsbereichs. */
export interface ExperienceContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly subtitle: string;
  readonly items: readonly ExperienceItem[];
}

/** Einzelner Erfahrungswert mit kurzer Einordnung. */
export interface ExperienceItem {
  readonly value: string;
  readonly suffix: string;
  readonly label: string;
  readonly text: string;
}

/** Inhalt des Skillbereichs. */
export interface SkillsContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly subtitle: string;
  readonly groups: readonly SkillGroup[];
  readonly levelsTitle: string;
  readonly levelsSubtitle: string;
  /** Titel des kleinen Skill-Dialogfensters. */
  readonly levelsDialogTitle: string;
  /** Text des kleinen Skill-Dialogfensters. */
  readonly levelsDialogText: string;
  /** Zugängliche Beschriftung zum Schließen des Skill-Dialogfensters. */
  readonly levelsDialogCloseLabel: string;
  readonly levels: readonly SkillLevel[];
  readonly marquee: readonly string[];
}

/** Gruppe zusammengehöriger Skills. */
export interface SkillGroup {
  readonly title: string;
  readonly items: readonly string[];
}

/** Prozentuale Selbsteinschätzung eines Tech- oder Design-Skills. */
export interface SkillLevel {
  readonly label: string;
  readonly value: number;
  readonly group: string;
}

/** Inhalt der Projektübersicht. */
export interface ProjectsContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly subtitle: string;
  /** Ergänzende Einleitungstexte vor dem Projekt-Stack. */
  readonly introText: readonly string[];
  /** Titel des dekorativen Projekt-Terminalfensters. */
  readonly dialogTitle: string;
  /** ARIA-Label zum Schließen des Projekt-Terminalfensters. */
  readonly dialogCloseLabel: string;
  /** Zeilen im dekorativen Projekt-Terminalfenster. */
  readonly dialogLines: readonly string[];
  readonly detailLabel: string;
  readonly overviewLabel: string;
  readonly typeLabel: string;
  readonly yearLabel: string;
  readonly stackLabel: string;
  readonly descriptionLabel: string;
  readonly goalLabel: string;
  readonly roleLabel: string;
  readonly highlightsEyebrow: string;
  readonly highlightsTitle: string;
  readonly metaAriaLabel: string;
  readonly techStackAriaLabel: string;
  readonly previewAriaLabel: string;
  readonly trashPaperLabel: string;
  readonly typewriterLabel: string;
  /** Zugängliche Beschriftung für das interaktive Auge. */
  readonly eyeButtonLabel: string;
  /** Zugängliche Beschriftung für die interaktive Bombe. */
  readonly bombButtonLabel: string;
  /** Zugängliche Beschriftung für die Blutanalyse-Interaktion. */
  readonly bloodButtonLabel: string;
  /** Zugängliche Beschriftung für kompakte Projektkennzahlen. */
  readonly metricsLabel: string;
  /** Überschrift für Case-Study- und Deep-Dive-Bereiche. */
  readonly caseStudyLabel: string;
  /** Überschrift für Architekturkarten und Systemübersichten. */
  readonly architectureLabel: string;
  /** Kurzer Hinweis zur Architekturkarte und zu technischen Diagrammen. */
  readonly architectureHint: string;
  /** Überschrift für Demo- und Prototypbereiche. */
  readonly liveDemoLabel: string;
  /** Überschrift für Screenshot- und Mockup-Galerien. */
  readonly galleryLabel: string;
  /** Beschriftung für einen externen Live-Demo-Link. */
  readonly openDemoLabel: string;
  /** Hinweis, wenn eine Live-Demo bewusst noch nicht öffentlich ist. */
  readonly demoUnavailableLabel: string;
  /** Überschrift für Erkenntnisse und technische Learnings. */
  readonly insightsLabel: string;
  /** Überschrift für ausgelagerte technische Umsetzungskapitel. */
  readonly detailLayerLabel: string;
  /** Kleine Beschriftung für die App-Landschaft auf Detailseiten. */
  readonly appLandscapeLabel: string;
  /** Überschrift für die App-Landschaft auf Detailseiten. */
  readonly appLandscapeTitle: string;
  /** Beschriftung für eine Demo-Anfrage. */
  readonly demoRequestLabel: string;
  /** Zugängliches Label zum Vergrößern oder Prüfen eines Evidence-Screens. */
  readonly zoomLabel: string;
}



/** Layout-Variante für projektspezifische Detailmodule. */
export type ProjectDetailMode = 'case-study' | 'demo' | 'productivity' | 'data' | 'editorial';

/** Kleine Projektkennzahl für Detailseiten. */
export interface ProjectMetric {
  /** Kompakter Wert oder Status der Kennzahl. */
  readonly value: string;
  /** Beschriftung der Kennzahl. */
  readonly label: string;
  /** Ergänzende Kurzinfo zur Kennzahl. */
  readonly text: string;
}

/** Inhaltlicher Abschnitt für Case Study, Workflow oder Projektanalyse. */
export interface ProjectDetailChapter {
  /** Kleine Kategorie oder technische Einordnung. */
  readonly eyebrow: string;
  /** Überschrift des Abschnitts. */
  readonly title: string;
  /** Beschreibungstext des Abschnitts. */
  readonly text: string;
  /** Kurze Punkte, die den Abschnitt scannbar machen. */
  readonly points: readonly string[];
}

/** Interaktiver Knoten einer Architekturkarte. */
export interface ProjectArchitectureNode {
  /** Stabile ID für Auswahlzustand und Tastaturbedienung. */
  readonly id: string;
  /** Sichtbarer Name des Architekturbausteins. */
  readonly label: string;
  /** Material-Symbol des Knotens. */
  readonly icon: string;
  /** Kurze technische Rolle des Knotens. */
  readonly role: string;
  /** Beschreibung des Knotens. */
  readonly text: string;
  /** Verbundene Knoten als sichtbare Systembeziehungen. */
  readonly connections: readonly string[];
}

/** Interaktive App-Karte innerhalb einer Projekt-Detailseite. */
export interface ProjectAppModule {
  /** Stabile ID für Hover-, Fokus- und Auswahlzustände. */
  readonly id: string;
  /** Sichtbarer App- oder Modulname. */
  readonly title: string;
  /** Kurze fachliche Beschreibung des Moduls. */
  readonly text: string;
  /** Material-Symbol für die App-Karte. */
  readonly icon: string;
  /** Beschriftung der Modulaktion. */
  readonly actionLabel: string;
  /** Optionaler Status oder Badge der Karte. */
  readonly badge?: string;
  /** Zustand des Moduls im Portfolio-Kontext. */
  readonly status?: 'live' | 'private' | 'soon';
}

/** Kleines schließbares Terminal- oder MS-DOS-Fenster auf Detailseiten. */
export interface ProjectTerminalWidget {
  /** Stabile ID für Sichtbarkeitszustände. */
  readonly id: string;
  /** Fenstertitel im MS-DOS-Stil. */
  readonly title: string;
  /** Kurze Terminalzeilen im Fenster. */
  readonly lines: readonly string[];
  /** Visuelle Position im Hero. */
  readonly position: 'status' | 'events' | 'auth' | 'queue';
}

/** Platzhalter oder echtes Bild für eine Projektgalerie. */
export interface ProjectGalleryItem {
  /** Titel des Screenshot-, Mockup- oder Asset-Slots. */
  readonly title: string;
  /** Kurze Einordnung des visuellen Inhalts. */
  readonly text: string;
  /** Optionaler Bildpfad für echte Screenshots. */
  readonly image?: string;
  /** Alternativtext für echte Screenshots. */
  readonly alt?: string;
  /** Visuelle Gewichtung im Masonry-Layout. */
  readonly size: 'sm' | 'md' | 'lg';
  /** Kurze Callout-Texte für annotierte Screenshot-Karten. */
  readonly annotations?: readonly string[];
  /** Material-Symbol für Platzhalter- und Mockup-Previews. */
  readonly icon?: string;
}


/** Optionaler Live-Demo-Hinweis oder externer Demo-Link. */
export interface ProjectLiveDemo {
  /** Aktueller Status der Demo. */
  readonly status: 'planned' | 'private' | 'available';
  /** Kurzer erklärender Text zur Demo. */
  readonly text: string;
  /** Optionaler externer Link zur Demo. */
  readonly url?: string;
}

/** Detaildaten eines Portfolio-Projekts. */
export interface PortfolioProject {
  readonly slug: string;
  readonly name: string;
  readonly kicker: string;
  readonly summary: string;
  readonly description: string;
  readonly goal: string;
  readonly role: string;
  readonly year: string;
  readonly type: string;
  readonly accent: 'lime' | 'pink' | 'violet' | 'blue' | 'orange';
  readonly techStack: readonly string[];
  readonly highlights: readonly string[];
  /** Optionaler Titel des technischen Terminalfensters auf der Detailseite. */
  readonly terminalTitle?: string;
  /** Optionale Terminalzeilen für Projektstatus, Architektur und technische Fakten. */
  readonly terminalLines?: readonly string[];
  /** Optionale technische Highlight-Karten für den oberen Detailbereich. */
  readonly technicalHighlights?: readonly HighlightItem[];
  /** Optionaler Stapel aus Produkt- und App-Karten im Hero. */
  readonly appModules?: readonly ProjectAppModule[];
  /** Optionale schließbare Terminalfenster im Hero. */
  readonly terminalWidgets?: readonly ProjectTerminalWidget[];
  /** Projektindividuelle Darstellungsvariante der Detailseite. */
  readonly detailMode: ProjectDetailMode;
  /** Kompakte Projektkennzahlen für den oberen Detailbereich. */
  readonly metrics: readonly ProjectMetric[];
  /** Tiefere Inhaltsabschnitte für Projektstory, Workflow oder Learnings. */
  readonly chapters: readonly ProjectDetailChapter[];
  /** Optionale Architekturkarte für komplexe Systemprojekte. */
  readonly architecture?: readonly ProjectArchitectureNode[];
  /** Screenshot-, Mockup- oder Platzhalter-Galerie. */
  readonly gallery: readonly ProjectGalleryItem[];
  /** Optionaler Live-Demo-Status oder externer Demo-Link. */
  readonly liveDemo?: ProjectLiveDemo;
  readonly requirements: readonly string[];
}

/** Inhalt der Prozess-Section. */
export interface ProcessContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly subtitle: string;
  readonly hint: string;
  readonly steps: readonly ProcessStep[];
}

/** Einzelner Prozessschritt. */
export interface ProcessStep {
  readonly number: string;
  readonly title: string;
  readonly text: string;
  readonly command: string;
}

/** FAQ-Eintrag. */
export interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

/** Inhalt des Kundenbereichs. */
export interface ClientsContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly subtitle: string;
  readonly items: readonly ClientItem[];
}

/** Einzelner Kunde oder Referenzlink. */
export interface ClientItem {
  readonly name: string;
  readonly url: string;
  readonly label: string;
  /** Technischer Stack der referenzierten Website. */
  readonly stack: readonly string[];
}

/** Inhalt der chaotischen CTA-Section. */
export interface CtaContent {
  /** Kleine technische Beschriftung über der CTA. */
  readonly eyebrow: string;
  /** Titel der CTA-Section. */
  readonly title: string;
  /** Bedienhinweis für die interaktiven Bausteine. */
  readonly hint: string;
  /** Einzelne physikähnliche Wortbausteine. */
  readonly words: readonly string[];
}

/** Schmale Qualitäts- und Arbeitsweise-Section. */
export interface BuiltWithoutContent {
  /** Kleine technische Beschriftung über der Section. */
  readonly eyebrow: string;
  /** Kurzer Titel der Section. */
  readonly title: string;
  /** Kurzer erklärender Text. */
  readonly text: string;
  /** Label für bewusst ausgeschlossene Lösungen. */
  readonly withoutLabel: string;
  /** Label für ergänzende gefragte Fähigkeiten. */
  readonly capabilityLabel: string;
  /** Bewusst nicht verwendete generische Hilfsmittel. */
  readonly withoutItems: readonly string[];
  /** Ergänzende, nachgefragte Arbeitsweisen und Qualitätsmerkmale. */
  readonly capabilityItems: readonly string[];
}

/** Thema im Kontaktformular. */
export interface ContactTopic {
  /** Stabiler technischer Wert für Formularlogik und Backend-Payload. */
  readonly value: string;
  /** Sichtbares Label des Themas. */
  readonly label: string;
  /** Material-Symbol für die visuelle Chip-Darstellung. */
  readonly icon: string;
}

/** Inhalt des Kontaktformulars. */
export interface ContactContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly subtitle: string;
  readonly modalTitle: string;
  readonly modalCloseLabel: string;
  /** Ziel-Endpunkt für den späteren serverseitigen Mailversand. */
  readonly endpoint: string;
  readonly topicLabel: string;
  readonly topicHint: string;
  readonly topics: readonly ContactTopic[];
  readonly nameLabel: string;
  readonly emailLabel: string;
  readonly messageLabel: string;
  /** Hinweis auf Pflichtfelder im Formular. */
  readonly requiredHint: string;
  /** Zugängliches Label für den Pflichtstern. */
  readonly requiredMarkLabel: string;
  readonly submitLabel: string;
  /** Beschriftung während des serverseitigen Versands. */
  readonly sendingLabel: string;
  readonly successMessage: string;
  readonly errorMessage: string;
  /** Fehlermeldung bei fehlendem oder nicht erreichbarem Backend. */
  readonly serverErrorMessage: string;
  /** Fehlermeldung für einen fehlenden Namen. */
  readonly nameRequiredError: string;
  /** Fehlermeldung für einen zu kurzen Namen. */
  readonly nameLengthError: string;
  /** Fehlermeldung für eine fehlende E-Mail-Adresse. */
  readonly emailRequiredError: string;
  /** Fehlermeldung für ein ungültiges E-Mail-Format. */
  readonly emailFormatError: string;
  /** Fehlermeldung für eine fehlende Nachricht. */
  readonly messageRequiredError: string;
  /** Fehlermeldung für eine zu kurze Nachricht. */
  readonly messageLengthError: string;
  /** Beschriftung des unsichtbaren Honeypot-Felds. */
  readonly honeypotLabel: string;
  readonly privacy: string;
}

/** Inhalt der Dankeseite nach erfolgreichem Kontaktformular-Versand. */
export interface ThankYouContent {
  /** Meta-Titel der Dankeseite. */
  readonly metaTitle: string;
  /** Meta-Description der Dankeseite. */
  readonly metaDescription: string;
  /** Kleine technische Beschriftung über dem Seitentitel. */
  readonly eyebrow: string;
  /** Hauptüberschrift der Dankeseite. */
  readonly title: string;
  /** Erklärungstext nach erfolgreichem Versand. */
  readonly text: string;
  /** Beschriftung des Zurück-Links. */
  readonly backLabel: string;
  /** Titel des dekorativen Statusfensters. */
  readonly dialogTitle: string;
  /** Zugängliche Beschriftung zum Schließen des Statusfensters. */
  readonly dialogCloseLabel: string;
  /** Zeilen im dekorativen Statusfenster. */
  readonly dialogLines: readonly string[];
}

/** Inhalt der Impressumsseite. */
export interface ImprintContent {
  /** Meta-Titel der Impressumsseite. */
  readonly metaTitle: string;
  /** Meta-Description der Impressumsseite. */
  readonly metaDescription: string;
  /** Kleine technische Beschriftung über dem Seitentitel. */
  readonly eyebrow: string;
  /** Hauptüberschrift der Impressumsseite. */
  readonly title: string;
  /** Kurze Einordnung oberhalb der Pflichtangaben. */
  readonly intro: string;
  /** Beschriftung des Zurück-Links. */
  readonly backLabel: string;
  /** Titel des dekorativen Hinweisfensters. */
  readonly dialogTitle: string;
  /** Text des dekorativen Hinweisfensters. */
  readonly dialogText: string;
  /** Inhaltliche Blöcke der Impressumsseite. */
  readonly sections: readonly ImprintSection[];
}

/** Einzelner Informationsblock im Impressum. */
export interface ImprintSection {
  /** Überschrift des Informationsblocks. */
  readonly title: string;
  /** Zeilen des Informationsblocks. */
  readonly lines: readonly string[];
}

/** Footer-Inhalte und Linkgruppen. */
export interface FooterContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly text: string;
  /** Titel des dekorativen Footer-Dialogfensters. */
  readonly dialogTitle: string;
  /** Text des dekorativen Footer-Dialogfensters. */
  readonly dialogText: string;
  /** Zugängliche Beschriftung zum Schließen des Footer-Dialogfensters. */
  readonly dialogCloseLabel: string;
  /** Titel des kleinen Fülli-Hover-Dialogfensters. */
  readonly petDialogTitle: string;
  /** Text des kleinen Fülli-Hover-Dialogfensters. */
  readonly petDialogText: string;
  /** Zugängliche Beschriftung des Fülli-Auslösers. */
  readonly petDialogLabel: string;
  /** Social-Media-Links als kompakte Icon-Gruppe im Footer. */
  readonly socialLinks: readonly FooterLink[];
  readonly columns: readonly FooterColumn[];
}

/** Linkgruppe im Footer. */
export interface FooterColumn {
  readonly title: string;
  readonly links: readonly FooterLink[];
}

/** Einzelner Footer-Link. */
export interface FooterLink {
  readonly label: string;
  readonly href: string;
}

/** Vollständiger übersetzter Inhalt einer Sprache. */
export interface PortfolioContent {
  readonly meta: SeoContent;
  readonly nav: NavigationContent;
  readonly hero: HeroContent;
  readonly about: AboutContent;
  readonly experience: ExperienceContent;
  readonly skills: SkillsContent;
  readonly projectsIntro: ProjectsContent;
  readonly projects: readonly PortfolioProject[];
  readonly process: ProcessContent;
  readonly cta: CtaContent;
  readonly faqTitle: string;
  readonly faqSubtitle: string;
  readonly faqs: readonly FaqItem[];
  readonly clients: ClientsContent;
  /** Schmale Qualitäts-Section mit bewussten technischen Entscheidungen. */
  readonly builtWithout: BuiltWithoutContent;
  readonly contact: ContactContent;
  /** Inhalte der Dankeseite. */
  readonly thankYou: ThankYouContent;
  /** Inhalte der Impressumsseite. */
  readonly imprint: ImprintContent;
  readonly footer: FooterContent;
  readonly notFoundTitle: string;
  readonly notFoundText: string;
}
