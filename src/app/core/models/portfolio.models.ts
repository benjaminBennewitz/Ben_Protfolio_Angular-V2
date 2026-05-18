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
  /** Titel, der bei inaktivem Browser-Tab angezeigt wird. */
  readonly hiddenTitle: string;
}

/** Navigations- und Bedienlabels. */
export interface NavigationContent {
  readonly home: string;
  readonly about: string;
  readonly skills: string;
  readonly projects: string;
  readonly process: string;
  readonly faq: string;
  readonly contact: string;
  readonly menu: string;
  readonly close: string;
  readonly theme: string;
  readonly language: string;
}

/** Textblock für die Hero-Section. */
export interface HeroContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly subtitle: string;
  readonly primaryCta: string;
  readonly secondaryCta: string;
  readonly consoleLines: readonly string[];
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
  /** Stabiler technischer Wert für Mailto und Tracking-freie Formularlogik. */
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
  readonly topicLabel: string;
  readonly topicHint: string;
  readonly topics: readonly ContactTopic[];
  readonly nameLabel: string;
  readonly emailLabel: string;
  readonly messageLabel: string;
  readonly submitLabel: string;
  readonly successMessage: string;
  readonly errorMessage: string;
  readonly privacy: string;
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
  /** Inhalte der Impressumsseite. */
  readonly imprint: ImprintContent;
  readonly footer: FooterContent;
  readonly notFoundTitle: string;
  readonly notFoundText: string;
}
