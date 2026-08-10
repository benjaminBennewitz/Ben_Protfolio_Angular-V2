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
  /** Navigationslabel für die Angebots- und Preissektion. */
  readonly services: string;
  /** Navigationslabel für die ausgelagerte Portfolio-Route. */
  readonly portfolio: string;
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
  /** Business-orientierter Hero-Hook. */
  readonly hook: string;
  readonly subtitle: string;
  readonly primaryCta: string;
  readonly secondaryCta: string;
  readonly consoleLines: readonly string[];
  readonly dialogLabel: string;
  /** Übersetzter Text des interaktiven Mixed-Reactions-Dialogs. */
  readonly dialogText: string;
  readonly statusLabel: string;
  /** Übersetzte Systemstatus-Zeilen im Hero. */
  readonly statusItems: readonly HeroStatusItem[];
  readonly stats: readonly StatItem[];
}

/** Einzelne übersetzbare Zeile im Hero-Systemstatus. */
export interface HeroStatusItem {
  readonly label: string;
  readonly value: string;
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
  /** Interaktive Fun-Kennzahlen mit Einheitenwechsel. */
  readonly metrics: AboutMetricsContent;
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
  /** Beschriftung des Dialog-Aktionsbuttons nach dem ersten Klick. */
  readonly dialogActionAfterClick: string;
  /** Zugängliche Beschriftung des Dialog-Schließen-Buttons. */
  readonly dialogCloseLabel: string;
}

/** Inhalt des interaktiven Fun-Metrics-Fensters. */
export interface AboutMetricsContent {
  /** Beschriftung des Buttons zum Öffnen des Fensters. */
  readonly triggerLabel: string;
  /** Zugängliche Beschriftung des Dialogfensters. */
  readonly dialogLabel: string;
  /** Titel in der MS-DOS-Titelleiste. */
  readonly title: string;
  /** Zugängliche Beschriftung zum Schließen des Fensters. */
  readonly closeLabel: string;
  /** Beschriftung des normalen Einheitenmodus. */
  readonly metricLabel: string;
  /** Beschriftung des absurden Einheitenmodus. */
  readonly weirdLabel: string;
  /** Zugängliche Beschriftung der Modus-Umschaltung. */
  readonly unitSwitcherLabel: string;
  /** Kurzer Genauigkeitshinweis im Fenster. */
  readonly precisionText: string;
  /** Kleine Statuszeile im Fenster. */
  readonly statusText: string;
  /** Kennzahlen, die zwischen normal und absurd wechseln. */
  readonly facts: readonly AboutMetricFact[];
  /** Inhalte und Labels für den verzögerten Absurditäten-Rechner. */
  readonly calculator: AboutMetricsCalculatorContent;
}

/** Einzelne Kennzahl im Fun-Metrics-Fenster. */
/** Verfügbare Einheiten des Absurditäten-Rechners. */
export type AboutMetricsCalculatorUnitKey = 'miniSpringRoll' | 'wiener' | 'mentos' | 'gummyBear';

/** Inhalt des verzögerten Absurditäten-Rechners. */
export interface AboutMetricsCalculatorContent {
  /** Hauptzeile des seitlichen Teaser-Buttons. */
  readonly teaserTitle: string;
  /** Unterzeile des seitlichen Teaser-Buttons. */
  readonly teaserText: string;
  /** Zugängliche Beschriftung des Rechner-Dialogs. */
  readonly dialogLabel: string;
  /** Titel in der MS-DOS-Titelleiste. */
  readonly title: string;
  /** Kurzer Erklärungstext im Rechner. */
  readonly intro: string;
  /** Label für die Größeneingabe. */
  readonly heightLabel: string;
  /** Label für die Gewichtseingabe. */
  readonly weightLabel: string;
  /** Label für die Einheitenauswahl. */
  readonly unitLabel: string;
  /** Ergebnislabel für die Größe. */
  readonly heightResultLabel: string;
  /** Ergebnislabel für das Gewicht. */
  readonly weightResultLabel: string;
  /** Zugängliche Beschriftung zum Schließen des Rechners. */
  readonly closeLabel: string;
  /** Sichtbare Einheitennamen für die Auswahl. */
  readonly units: readonly AboutMetricsCalculatorUnitContent[];
}

/** Sichtbarer Einheitenname des Absurditäten-Rechners. */
export interface AboutMetricsCalculatorUnitContent {
  /** Stabile Einheit zur Verknüpfung mit den Rechenwerten. */
  readonly key: AboutMetricsCalculatorUnitKey;
  /** Voller sichtbarer Einheitenname. */
  readonly label: string;
  /** Kurzer Name für kompakte Ergebniszeilen. */
  readonly shortLabel: string;
}

export interface AboutMetricFact {
  /** Stabile ID für Tracking und Animation. */
  readonly id: string;
  /** Material-Symbol der Kennzahl. */
  readonly icon: string;
  /** Sichtbarer Name der Kennzahl. */
  readonly label: string;
  /** Normaler metrischer oder sachlicher Wert. */
  readonly metricValue: string;
  /** Einheit des normalen Werts. */
  readonly metricUnit: string;
  /** Kurzer Hinweis zum normalen Wert. */
  readonly metricNote: string;
  /** Absurder Alternativwert. */
  readonly weirdValue: string;
  /** Absurde Einheit oder leere Einheit bei Textwerten. */
  readonly weirdUnit: string;
  /** Kurzer Hinweis zum absurden Wert. */
  readonly weirdNote: string;
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
  readonly claim: string;
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

/** Status eines Werkzeugs innerhalb des projektbasierten Einsatzprofils. */
export type SkillUsageStatus = 'CORE' | 'ACTIVE' | 'ROUTINE' | 'SPECIALIZED';

/** Projektbasierte Nutzungstiefe eines Tech-, Design- oder Automatisierungswerkzeugs. */
export interface SkillLevel {
  readonly label: string;
  /** Relative Nutzungstiefe ausschließlich für die visuelle Balkendarstellung. */
  readonly depth: number;
  /** Lesbarer Status anstelle einer pseudo-genauen Prozentbewertung. */
  readonly status: SkillUsageStatus;
  readonly group: string;
}



/** Inhalt der kompakten Leistungs-Bridge auf der Startseite. */
export interface ServicesTeaserContent {
  /** Kleine technische Beschriftung oberhalb der Bridge. */
  readonly eyebrow: string;
  /** Hauptaussage der kompakten Leistungs-Bridge. */
  readonly title: string;
  /** Kurze Verbindung zwischen Techstack und Leistungsroute. */
  readonly subtitle: string;
  /** Beschriftung des Links zur vollständigen Leistungsseite. */
  readonly ctaLabel: string;
  /** Zugängliche Beschriftung der drei Lösungsbereiche. */
  readonly ariaLabel: string;
  /** Drei bewusst reduzierte Lösungsbereiche. */
  readonly items: readonly ServicesTeaserItem[];
}

/** Einzelner Lösungsbereich der Leistungs-Bridge. */
export interface ServicesTeaserItem {
  /** Kurzes Systemlabel wie WEB, APP oder SYSTEM. */
  readonly label: string;
  /** Business-orientierte Kurzbeschreibung. */
  readonly text: string;
}

/** Inhalt der Angebots- und Preiskarten-Section. */
export interface PricingContent {
  /** SEO-Titel der eigenständigen Leistungsroute. */
  readonly metaTitle: string;
  /** SEO-Beschreibung der eigenständigen Leistungsroute. */
  readonly metaDescription: string;
  /** Kleine technische Beschriftung des Leistungs-Heros. */
  readonly eyebrow: string;
  /** Hauptüberschrift des Leistungs-Heros. */
  readonly title: string;
  /** Einleitung unter der Hero-Überschrift. */
  readonly subtitle: string;
  /** Primärer CTA zur Angebotsübersicht. */
  readonly heroPrimaryCtaLabel: string;
  /** Sekundärer CTA zum Kontaktbereich. */
  readonly heroSecondaryCtaLabel: string;
  /** Zugängliche Beschriftung des Scope-Dialog-Schließen-Buttons. */
  readonly heroDialogCloseLabel: string;
  /** Kleine Beschriftung oberhalb der Angebotsübersicht. */
  readonly offersEyebrow: string;
  /** Überschrift oberhalb der drei Angebotsstufen. */
  readonly offersTitle: string;
  /** Kurze Einleitung in die drei Angebotsstufen. */
  readonly offersSubtitle: string;
  /** Allgemeiner CTA unterhalb der Angebotsübersicht. */
  readonly offersCtaLabel: string;
  /** Hinweistext zu Einstiegspreisen und Aufwandsschätzung. */
  readonly note: string;
  /** Qualitätsstandard, der für jede Angebotskarte gilt. */
  readonly qualityBaseline: string;
  /** ARIA-Label der Angebotskartenliste. */
  readonly ariaLabel: string;
  /** Technisches Label des Maintenance-Bereichs. */
  readonly supportTitle: string;
  /** Aussagekräftige Überschrift des Maintenance-Bereichs. */
  readonly supportHeadline: string;
  /** Einleitungstext des Maintenance-Bereichs. */
  readonly supportText: string;
  /** CTA am Ende des Maintenance-Bereichs. */
  readonly supportCtaLabel: string;
  /** Technisches Label der abschließenden Kontakt-Section. */
  readonly outroEyebrow: string;
  /** Persönliche Abschlussüberschrift vor dem Footer. */
  readonly outroTitle: string;
  /** Kurzer persönlicher Abschluss- und Kontakttext. */
  readonly outroText: string;
  /** Primärer CTA der Abschluss-Section. */
  readonly outroPrimaryCtaLabel: string;
  /** Sekundärer CTA der Abschluss-Section. */
  readonly outroSecondaryCtaLabel: string;
  /** Kleine Terminal-Statuszeile der Abschluss-Section. */
  readonly outroStatus: string;
  /** Sichtbare Abo-Preise im Maintenance-Bereich. */
  readonly supportPlans: readonly PricingSupportPlan[];
  /** Sichtbare Angebotskarten. */
  readonly cards: readonly PricingCard[];
}

/** Einzelner monatlicher Support-Baustein. */
export interface PricingSupportPlan {
  /** Name des Support-Bausteins. */
  readonly name: string;
  /** Monatlicher Einstiegspreis des Support-Bausteins. */
  readonly price: string;
  /** Kurze Beschreibung des enthaltenen Supports. */
  readonly text: string;
}

/** Einzelne Angebots- oder Preiskarte. */
export interface PricingCard {
  /** Name des Angebots. */
  readonly title: string;
  /** Einstiegspreis als kompakte UI-Zeile. */
  readonly price: string;
  /** Kurzer Claim der Angebotsstufe. */
  readonly claim: string;
  /** Kurze Positionierung des Angebots. */
  readonly description: string;
  /** Kurzer Badge, zum Beispiel Empfehlung. */
  readonly badge?: string;
  /** Gibt an, ob die Karte visuell hervorgehoben wird. */
  readonly featured?: boolean;
  /** Kleine Terminal-Zeile als technischer Schnellscan. */
  readonly command: string;
  /** Enthaltene Leistungsbausteine. */
  readonly features: readonly string[];
  /** Buttontext der Karte. */
  readonly ctaLabel: string;
}

/** Inhalt der Projektübersicht. */
export interface ProjectsContent {
  readonly eyebrow: string;
  readonly title: string;
  readonly subtitle: string;
  /** Ergänzende Einleitungstexte vor dem Projekt-Stack. */
  readonly introText: readonly string[];
  /** Beschriftung des Rücklinks von der Portfolio-Seite zu den Leistungen. */
  readonly servicesBackLabel: string;
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
  /** Beschriftung für das zusätzliche Bild unter dem Projekt-Terminal. */
  readonly imageLabel: string;
  /** Alternativtext für das zusätzliche Bild unter dem Projekt-Terminal. */
  readonly imageAlt: string;
  /** Buttontext zum Wechseln des zusätzlichen Projektbildes. */
  readonly imageActionLabel: string;
  /** Buttontext nach dem Wechsel des zusätzlichen Projektbildes. */
  readonly imageActionActiveLabel: string;
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
  /** Beschriftung für den externen GitHub-Link eines Projekts. */
  readonly githubLabel: string;
  /** Zugängliches Label zum Vergrößern oder Prüfen eines Evidence-Screens. */
  readonly zoomLabel: string;
  /** Zugängliches Label zum Schließen der gemeinsamen Projekt-Lightbox. */
  readonly lightboxCloseLabel: string;
  /** Zugängliches Label für das vorherige Bild der gemeinsamen Projekt-Lightbox. */
  readonly lightboxPreviousLabel: string;
  /** Zugängliches Label für das nächste Bild der gemeinsamen Projekt-Lightbox. */
  readonly lightboxNextLabel: string;
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
  /** Optionaler Bildpfad für echte Screenshots oder Galeriebilder. */
  readonly image?: string;
  /** Dominante Hintergrundfarbe für rahmende Bildcontainer. */
  readonly backgroundColor?: string;
  /** Geplanter Dateipfad, wenn ein Galeriebild später ergänzt wird. */
  readonly imageHint?: string;
  /** Alternativtext für echte Screenshots. */
  readonly alt?: string;
  /** Visuelle Gewichtung im Masonry-Layout. */
  readonly size: 'sm' | 'md' | 'lg';
  /** Kurze Callout-Texte für annotierte Screenshot-Karten. */
  readonly annotations?: readonly string[];
  /** Material-Symbol für Platzhalter- und Mockup-Previews. */
  readonly icon?: string;
  /** Optionaler Detailtext für Lightbox- und Galerieansichten. */
  readonly detail?: string;
  /** Optionale Werkzeug- oder Kontext-Tags für visuelle Arbeiten. */
  readonly tools?: readonly string[];
  /** Optionaler Jahrgang oder Zeitraum der visuellen Arbeit. */
  readonly year?: string;
}

/** Einzelne Seite im digitalen Designkatalog. */
export interface ProjectCatalogPage {
  /** Sichtbare Seitenzahl oder Seitenkennung. */
  readonly number: string;
  /** Position der Seite im Spread, wenn nur eine Seite sichtbar ist. */
  readonly side?: 'left' | 'right';
  /** Kleine Kapitel- oder Bildbeschriftung. */
  readonly eyebrow: string;
  /** Titel der Katalogseite. */
  readonly title: string;
  /** Kurzer editorialer Seiteninhalt. */
  readonly text: string;
  /** Optionaler Dateipfad für ein echtes Katalogseitenmotiv. */
  readonly image?: string;
  /** Sprachabhängige Dateipfade für lokalisierte Katalogseiten. */
  readonly imageByLanguage?: Partial<Record<PortfolioLanguage, string>>;
  /** Dateityp des Katalogseitenmotivs. */
  readonly assetType?: 'image' | 'pdf';
  /** Alternativtext für das Katalogseitenmotiv. */
  readonly alt: string;
  /** Geplanter Dateipfad, wenn das Motiv später ergänzt wird. */
  readonly imageHint: string;
  /** Visuelle Stimmung der Seite für CSS-Varianten. */
  readonly mood: 'cover' | 'image' | 'type' | 'detail';
}

/** Eintrag im Katalog-Inhaltsverzeichnis. */
export interface ProjectCatalogTocItem {
  /** Sichtbare Kapitelnummer. */
  readonly number: string;
  /** Titel des Kapitels. */
  readonly title: string;
  /** Untertitel des Kapitels. */
  readonly subtitle: string;
  /** Kurzer Kontexttext zum Kapitel. */
  readonly text: string;
  /** Optionaler Werkzeug- oder Themenschwerpunkt. */
  readonly tool?: string;
  /** Zielindex im Reader. */
  readonly targetSpreadIndex: number;
}

/** Doppelseite des digitalen Designkatalogs. */
export interface ProjectCatalogSpread {
  /** Stabile ID für Navigation und Tracking. */
  readonly id: string;
  /** Titel der Doppelseite. */
  readonly title: string;
  /** Kurzer Kontext zur Doppelseite. */
  readonly text: string;
  /** Linke und rechte Katalogseite im proportionalen Sonderformat-Spread. */
  readonly pages: readonly ProjectCatalogPage[];
}

/** Inhalt für interaktive Editorial- und Designkatalog-Projekte. */
export interface ProjectCatalogShowcase {
  /** Kleine Beschriftung im Hero-Showcase. */
  readonly eyebrow: string;
  /** Titel des Katalog-Showcases. */
  readonly title: string;
  /** Kurzer Status- oder Format-Hinweis. */
  readonly status: string;
  /** Editorialer Einführungstext zum Katalog. */
  readonly lead: string;
  /** Beschriftung des primären Hero-Links. */
  readonly ctaLabel: string;
  /** Kleine Tags zu Werkzeugen, Medien oder Gestaltung. */
  readonly chips: readonly string[];
  /** Zugängliche Beschriftung des Katalog-Readers. */
  readonly readerLabel: string;
  /** Eyebrow für die große Reader-Section. */
  readonly readerEyebrow: string;
  /** Überschrift für die große Reader-Section. */
  readonly readerTitle: string;
  /** Hinweis zur Interaktion mit dem Reader. */
  readonly readerHint: string;
  /** Beschriftung für den Button zum Öffnen des Inhaltsverzeichnisses. */
  readonly tocOpenLabel: string;
  /** Beschriftung für den Button zum Schließen des Inhaltsverzeichnisses. */
  readonly tocCloseLabel: string;
  /** Titel des Inhaltsverzeichnis-Overlays. */
  readonly tocTitle: string;
  /** Beschriftung für vorherige Doppelseite. */
  readonly previousLabel: string;
  /** Beschriftung für nächste Doppelseite. */
  readonly nextLabel: string;
  /** Kapitel aus dem sichtbaren Katalog-Inhaltsverzeichnis. */
  readonly tocItems?: readonly ProjectCatalogTocItem[];
  /** Interaktive Doppelseiten des Katalogs. */
  readonly spreads: readonly ProjectCatalogSpread[];
  /** Eyebrow für die Masonry-Galerie. */
  readonly galleryEyebrow: string;
  /** Überschrift für die Masonry-Galerie. */
  readonly galleryTitle: string;
  /** Beschriftung für Lightbox-Buttons. */
  readonly lightboxOpenLabel: string;
  /** Beschriftung für Lightbox schließen. */
  readonly lightboxCloseLabel: string;
  /** Beschriftung für vorheriges Galeriebild. */
  readonly lightboxPreviousLabel: string;
  /** Beschriftung für nächstes Galeriebild. */
  readonly lightboxNextLabel: string;
}


/** Einzelne schwebende To-do-Karte im Hero eines Projektmanagement-Projekts. */
export interface ProjectBoardHeroTask {
  /** Sichtbarer Aufgabenname. */
  readonly title: string;
  /** Auf maximal etwa 100 Zeichen gekürzte Aufgabenbeschreibung. */
  readonly excerpt: string;
  /** Initialen der verantwortlichen Person. */
  readonly ownerInitials: string;
  /** Lokalisiertes Fälligkeitsdatum. */
  readonly dueDate: string;
  /** Maschinenlesbares Fälligkeitsdatum für das Time-Element. */
  readonly dueDateIso: string;
  /** Anzahl der angehängten Dateien. */
  readonly attachmentCount: number;
  /** Anzahl der Kommentare. */
  readonly commentCount: number;
  /** Gibt an, ob eine Automatisierungsregel aktiv ist. */
  readonly hasRule: boolean;
}

/** Lokalisierte Beschriftungen für Metadaten der Hero-Aufgabenkarten. */
export interface ProjectBoardHeroTaskLabels {
  /** Statuslabel der Karte. */
  readonly todo: string;
  /** Beschriftung der verantwortlichen Person. */
  readonly owner: string;
  /** Beschriftung des Fälligkeitsdatums. */
  readonly dueDate: string;
  /** Beschriftung der Anhänge. */
  readonly attachments: string;
  /** Beschriftung der Kommentare. */
  readonly comments: string;
  /** Beschriftung der Automatisierungsregel. */
  readonly rule: string;
}

/** Kleine Karte für Workflow-, UX- oder Gamification-Schwerpunkte. */
export interface ProjectBoardWorkflowCard {
  /** Material-Symbol der Schwerpunktkarte. */
  readonly icon: string;
  /** Titel des Schwerpunkts. */
  readonly title: string;
  /** Kurzer erklärender Text. */
  readonly text: string;
  /** Scannbare Detailpunkte. */
  readonly points: readonly string[];
}

/** Profil des Maskottchens einer Projektmanagement-App. */
export interface ProjectBoardMascotProfile {
  /** Kleine Beschriftung über dem Profil. */
  readonly eyebrow: string;
  /** Überschrift der Profil-Section. */
  readonly title: string;
  /** Name des Maskottchens. */
  readonly name: string;
  /** Rolle des Maskottchens im Produkt. */
  readonly role: string;
  /** Story- und UX-Text zum Maskottchen. */
  readonly text: string;
  /** Optionaler Bildpfad für ein echtes Maskottchen-Asset. */
  readonly asset?: string;
  /** Alternativtext für das Maskottchen-Asset. */
  readonly assetAlt: string;
  /** Geplanter Dateipfad, wenn das Asset später ergänzt wird. */
  readonly assetHint: string;
  /** Kompakte Fakten zur Maskottchen-Funktion. */
  readonly facts: readonly ProjectMetric[];
}

/** Projektspezifischer Showcase für Kanban-, Board- und Gamification-Projekte. */
export interface ProjectBoardShowcase {
  /** Kleine technische Beschriftung im Hero-Showcase. */
  readonly eyebrow: string;
  /** Titel des Board-Frames. */
  readonly title: string;
  /** Kurzer Status- oder Produkt-Hinweis im Board-Frame. */
  readonly status: string;
  /** Erklärender Text zum Board-Showcase. */
  readonly lead: string;
  /** Beschriftung des primären Hero-Links. */
  readonly ctaLabel: string;
  /** Kleine technische oder fachliche Tags im Showcase. */
  readonly chips: readonly string[];
  /** Zugängliche Beschriftung des Board-Containers. */
  readonly boardLabel: string;
  /** Lokalisierte Beschriftungen der Aufgabenmetadaten. */
  readonly heroTaskLabels: ProjectBoardHeroTaskLabels;
  /** Fünf schwebende Beispielaufgaben im Hero. */
  readonly heroTasks: readonly ProjectBoardHeroTask[];
  /** Eyebrow für die Workflow-Section. */
  readonly workflowEyebrow: string;
  /** Überschrift für die Workflow-Section. */
  readonly workflowTitle: string;
  /** Workflow-, UX- und Gamification-Karten. */
  readonly workflowCards: readonly ProjectBoardWorkflowCard[];
  /** Maskottchen-Profil des Projektmanagement-Systems. */
  readonly mascot: ProjectBoardMascotProfile;
  /** Eyebrow für die Galerie. */
  readonly galleryEyebrow: string;
  /** Überschrift für die Galerie. */
  readonly galleryTitle: string;
}

/** Schmaler Lauf-Showcase für ein spielbares Webprojekt. */
export interface ProjectGameRunner {
  /** Kleine Beschriftung über dem Laufband. */
  readonly eyebrow: string;
  /** Überschrift der Laufband-Section. */
  readonly title: string;
  /** Kurzer erklärender Text zum animierten Asset. */
  readonly text: string;
  /** Optionaler Bildpfad für ein echtes Character- oder Sprite-Asset. */
  readonly asset?: string;
  /** Alternativtext für das Character- oder Sprite-Asset. */
  readonly assetAlt: string;
  /** Geplanter Dateipfad, wenn das Asset später ergänzt wird. */
  readonly assetHint: string;
  /** Kurzes Label für die dekorative Laufspur. */
  readonly trackLabel: string;
}

/** Steckbrief des Hauptcharakters eines Webspiels. */
export interface ProjectGameCharacterProfile {
  /** Kleine Beschriftung über dem Charakterprofil. */
  readonly eyebrow: string;
  /** Überschrift der Charakterprofil-Section. */
  readonly title: string;
  /** Name des Characters. */
  readonly name: string;
  /** Kurze Rollenbeschreibung des Characters. */
  readonly role: string;
  /** Story- und Profiltext des Characters. */
  readonly text: string;
  /** Optionaler Bildpfad für ein echtes Character-Asset. */
  readonly asset?: string;
  /** Alternativtext für das Character-Asset. */
  readonly assetAlt: string;
  /** Geplanter Dateipfad, wenn das Character-Bild später ergänzt wird. */
  readonly assetHint: string;
  /** Kompakte Steckbriefdaten. */
  readonly facts: readonly ProjectMetric[];
}

/** Projektspezifischer Hero- und Abschnittsinhalt für spielbare Webprojekte. */
export interface ProjectGameShowcase {
  /** Kleine technische Beschriftung im Hero-Showcase. */
  readonly eyebrow: string;
  /** Titel des schrägen Video-Frames. */
  readonly title: string;
  /** Kurzer Status- oder Build-Hinweis im Video-Frame. */
  readonly status: string;
  /** Erklärender Text zum Video-Frame. */
  readonly lead: string;
  /** Beschriftung des primären Hero-Links. */
  readonly ctaLabel: string;
  /** Kleine technische Tags im Game-Showcase. */
  readonly chips: readonly string[];
  /** Optionaler Pfad für ein echtes Gameplay-Video. */
  readonly videoSrc?: string;
  /** Optionales Posterbild für das Gameplay-Video. */
  readonly videoPoster?: string;
  /** Zugängliche Beschriftung des Video-Containers. */
  readonly videoLabel: string;
  /** Fallback-Text, solange kein Gameplay-Video eingebunden ist. */
  readonly videoFallbackText: string;
  /** Geplanter Dateipfad für das Gameplay-Video. */
  readonly videoFileHint: string;
  /** Optionaler Pfad für das Hero-Wüstenbild. */
  readonly heroBackdropAsset?: string;
  /** Geplanter Dateipfad für das Hero-Wüstenbild. */
  readonly heroBackdropHint: string;
  /** Kompakte Fakten für Kunden und Recruiter. */
  readonly facts: readonly ProjectMetric[];
  /** Eyebrow für die Umsetzungskapitel. */
  readonly chaptersEyebrow: string;
  /** Überschrift für die Umsetzungskapitel. */
  readonly chaptersTitle: string;
  /** Eyebrow für die Galerie. */
  readonly galleryEyebrow: string;
  /** Überschrift für die Galerie. */
  readonly galleryTitle: string;
  /** Animiertes Laufband für ein Character-Asset. */
  readonly runner: ProjectGameRunner;
  /** Charakterprofil des Webspiels. */
  readonly character: ProjectGameCharacterProfile;
}



/** Beispielwert im Blutanalyse-Hero und im Werte-Guide. */
export interface ProjectBloodValuePreview {
  /** Abkürzung oder Laborwert-Name. */
  readonly label: string;
  /** Beispielwert oder verdichteter Status. */
  readonly value: string;
  /** Einheit oder Kontext des Laborwerts. */
  readonly unit: string;
  /** Referenz- oder Orientierungsbereich als UI-Text. */
  readonly range: string;
  /** Prozentuale Position auf einer visuellen Referenzskala. */
  readonly position: number;
  /** Zustand für visuelle Einordnung und Hilfetext. */
  readonly tone: 'low' | 'normal' | 'high' | 'watch';
  /** Benutzernahe Erklärung oder Hinweis zum Wert. */
  readonly hint: string;
}

/** Schritt im Dokumenten- und Datenfluss der Blutanalyse. */
export interface ProjectBloodPipelineStep {
  /** Material-Symbol des Prozessschritts. */
  readonly icon: string;
  /** Kurzer Titel des Prozessschritts. */
  readonly title: string;
  /** Benutzernahe Beschreibung des Prozessschritts. */
  readonly text: string;
  /** Technische oder fachliche Detailpunkte. */
  readonly points: readonly string[];
}


/** Darstellungsmodus im Werte-Guide der Daten-Dashboard-Seite. */
export type ProjectBloodGuideModeKey = 'scale' | 'bar' | 'chart';

/** Umschaltbarer Diagrammstil im Werte-Guide. */
export interface ProjectBloodGuideMode {
  /** Stabile ID für Zustand und CSS-Variante. */
  readonly key: ProjectBloodGuideModeKey;
  /** Sichtbares Label des Diagrammstils. */
  readonly label: string;
  /** Kurze Zusatzbeschreibung des Diagrammstils. */
  readonly description: string;
  /** Material-Symbol für den Modusbutton. */
  readonly icon: string;
}

/** Inhalt für Import-, Analyse- und Hilfesystem einer Blutanalyse-Detailseite. */
export interface ProjectBloodShowcase {
  /** Kleine technische Beschriftung im Hero-Showcase. */
  readonly eyebrow: string;
  /** Titel des Analyse-Frames. */
  readonly title: string;
  /** Kurzer Status- oder Modulhinweis. */
  readonly status: string;
  /** Erklärender Text zum Analyse-Showcase. */
  readonly lead: string;
  /** Beschriftung des primären Hero-Links. */
  readonly ctaLabel: string;
  /** Kleine technische oder fachliche Tags im Showcase. */
  readonly chips: readonly string[];
  /** Titel des Dokumentenbereichs im Hero. */
  readonly documentTitle: string;
  /** Hilfetext des Dokumentenbereichs im Hero. */
  readonly documentText: string;
  /** Titel der großen Hero-Datengrafik. */
  readonly heroChartTitle: string;
  /** Hilfetext der großen Hero-Datengrafik. */
  readonly heroChartText: string;
  /** Zugängliche Beschriftung des Analyse-Containers. */
  readonly previewLabel: string;
  /** Beispielwerte für Vorschau und Werte-Guide. */
  readonly values: readonly ProjectBloodValuePreview[];
  /** Eyebrow für den Datenfluss. */
  readonly pipelineEyebrow: string;
  /** Überschrift für den Datenfluss. */
  readonly pipelineTitle: string;
  /** Schritte vom Dokument zur Auswertung. */
  readonly pipelineSteps: readonly ProjectBloodPipelineStep[];
  /** Eyebrow für den Werte-Guide. */
  readonly guideEyebrow: string;
  /** Überschrift für den Werte-Guide. */
  readonly guideTitle: string;
  /** Zugängliche Beschriftung der Diagrammstil-Umschaltung. */
  readonly guideModeLabel: string;
  /** Sichtbare Diagrammstile für den Werte-Guide. */
  readonly guideModes: readonly ProjectBloodGuideMode[];
  /** Optionaler Hinweis zu geplanten, aber noch nicht umgesetzten Visualisierungsfunktionen. */
  readonly roadmapNote?: string;
  /** Hinweis, dass die Oberfläche Erklärung statt Diagnose liefert. */
  readonly disclaimer: string;
  /** Eyebrow für die Galerie. */
  readonly galleryEyebrow: string;
  /** Überschrift für die Galerie. */
  readonly galleryTitle: string;
}

/** Optionaler Live-Demo-Hinweis oder externer Demo-Link. */
export interface ProjectLiveDemo {
  /** Aktueller Status der Demo. */
  readonly status: 'planned' | 'private' | 'available';
  /** Kurzer erklärender Text zur Demo. */
  readonly text: string;
  /** Optionaler externer Link zur Demo. */
  readonly url?: string;
  /** Optionaler externer Link zum zugehörigen GitHub-Repository. */
  readonly githubUrl?: string;
}

/** Detaildaten eines Portfolio-Projekts. */
export interface PortfolioProject {
  readonly slug: string;
  readonly name: string;
  /** Optionale Zeilen für eine bewusst gesetzte Hero-Headline. */
  readonly titleLines?: readonly string[];
  readonly kicker: string;
  readonly summary: string;
  /** Optionaler Kurz-Kicker für Projektübersichten, wenn Detailseiten ausführlicher formuliert sind. */
  readonly overviewKicker?: string;
  /** Optionaler Kurztext für Projektübersichten, ohne die Detailseite inhaltlich zu verkürzen. */
  readonly overviewSummary?: string;
  /** Optionaler kompakter Techstack für Projektübersichten und Projektkarten. */
  readonly overviewTechStack?: readonly string[];
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
  /** Optionaler Game-Showcase für spielbare Webprojekte. */
  readonly gameShowcase?: ProjectGameShowcase;
  /** Optionaler Board-Showcase für Kanban- und Gamification-Projekte. */
  readonly boardShowcase?: ProjectBoardShowcase;
  /** Optionaler Blood-Showcase für Dokumentenimport und Laborwert-Auswertung. */
  readonly bloodShowcase?: ProjectBloodShowcase;
  /** Optionaler Designkatalog-Showcase für grafische Editorial-Projekte. */
  readonly catalogShowcase?: ProjectCatalogShowcase;
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
  /** Label für das optionale Gutscheincode-Feld. */
  readonly couponCodeLabel: string;
  /** Platzhalter für das optionale Gutscheincode-Feld. */
  readonly couponCodePlaceholder: string;
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
  /** Kompakte Bridge von der Startseite zur Leistungsroute. */
  readonly servicesTeaser: ServicesTeaserContent;
  /** Inhalte der eigenständigen Leistungs- und Preisseite. */
  readonly pricing: PricingContent;
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
