/* src/app/core/models/home.models.ts */

/** @file Inhaltsmodelle der Startseite und ihrer interaktiven Abschnitte. */

import type { HighlightItem, StatItem } from './shared.models';

/** Textblock für die Hero-Section. */
export interface HeroContent {
  readonly eyebrow: string;                        // Kleine Beschriftung oberhalb der Überschrift.
  readonly title: string;                          // Sichtbare Überschrift.
  readonly hook: string;                           // Prägnanter Hero-Hook für die persönliche Portfolio-Positionierung.
  readonly subtitle: string;                       // Einleitung unter der Überschrift.
  readonly primaryCta: string;                     // Beschriftung des primären Aktionslinks.
  readonly secondaryCta: string;                   // Beschriftung des sekundären Aktionslinks.
  readonly consoleLines: readonly string[];        // Zeilen des dekorativen Konsolenfensters.
  readonly dialogLabel: string;                    // Zugängliche Beschriftung des Dialogs.
  readonly dialogText: string;                     // Übersetzter Text des interaktiven Mixed-Reactions-Dialogs.
  readonly statusLabel: string;                    // Beschriftung des Status.
  readonly statusItems: readonly HeroStatusItem[]; // Übersetzte Systemstatus-Zeilen im Hero.
  readonly stats: readonly StatItem[];             // Kompakte Kennzahlen im Hero.
}

/** Einzelne übersetzbare Zeile im Hero-Systemstatus. */
export interface HeroStatusItem {
  readonly label: string; // Sichtbare Beschriftung.
  readonly value: string; // Angezeigter Wert.
}

/** Inhalt der Über-mich-Section. */
export interface AboutContent {
  readonly eyebrow: string;                      // Kleine Beschriftung oberhalb der Überschrift.
  readonly title: string;                        // Sichtbare Überschrift.
  readonly text: readonly string[];              // Beschreibender Inhalt.
  readonly highlights: readonly HighlightItem[]; // Hervorgehobene Aussagen.
  readonly metrics: AboutMetricsContent;         // Interaktive Fun-Kennzahlen mit Einheitenwechsel.
  readonly imageLabel: string;                   // Zugängliche Beschriftung des About-Bildbereichs.
  readonly imageAlt: string;                     // Alternativtext für das About-Kaffeebild.
  readonly dialogLabel: string;                  // Zugängliche Beschriftung des interaktiven About-Dialogs.
  readonly dialogText: string;                   // Text im interaktiven About-Dialog.
  readonly dialogAction: string;                 // Beschriftung des Dialog-Aktionsbuttons.
  readonly dialogActionAfterClick: string;       // Beschriftung des Dialog-Aktionsbuttons nach dem ersten Klick.
  readonly dialogCloseLabel: string;             // Zugängliche Beschriftung des Dialog-Schließen-Buttons.
}

/** Inhalt des interaktiven Fun-Metrics-Fensters. */
export interface AboutMetricsContent {
  readonly triggerLabel: string;                      // Beschriftung des Buttons zum Öffnen des Fensters.
  readonly dialogLabel: string;                       // Zugängliche Beschriftung des Dialogfensters.
  readonly title: string;                             // Titel in der MS-DOS-Titelleiste.
  readonly closeLabel: string;                        // Zugängliche Beschriftung zum Schließen des Fensters.
  readonly metricLabel: string;                       // Beschriftung des normalen Einheitenmodus.
  readonly weirdLabel: string;                        // Beschriftung des absurden Einheitenmodus.
  readonly unitSwitcherLabel: string;                 // Zugängliche Beschriftung der Modus-Umschaltung.
  readonly precisionText: string;                     // Kurzer Genauigkeitshinweis im Fenster.
  readonly statusText: string;                        // Kleine Statuszeile im Fenster.
  readonly facts: readonly AboutMetricFact[];         // Kennzahlen, die zwischen normal und absurd wechseln.
  readonly calculator: AboutMetricsCalculatorContent; // Inhalte und Labels für den verzögerten Absurditäten-Rechner.
}

/** Verfügbare Einheiten des Absurditäten-Rechners. */
export type AboutMetricsCalculatorUnitKey = 'miniSpringRoll' | 'wiener' | 'mentos' | 'gummyBear';

/** Inhalt des verzögerten Absurditäten-Rechners. */
export interface AboutMetricsCalculatorContent {
  readonly teaserTitle: string;                                 // Hauptzeile des seitlichen Teaser-Buttons.
  readonly teaserText: string;                                  // Unterzeile des seitlichen Teaser-Buttons.
  readonly dialogLabel: string;                                 // Zugängliche Beschriftung des Rechner-Dialogs.
  readonly title: string;                                       // Titel in der MS-DOS-Titelleiste.
  readonly intro: string;                                       // Kurzer Erklärungstext im Rechner.
  readonly heightLabel: string;                                 // Label für die Größeneingabe.
  readonly weightLabel: string;                                 // Label für die Gewichtseingabe.
  readonly unitLabel: string;                                   // Label für die Einheitenauswahl.
  readonly heightResultLabel: string;                           // Ergebnislabel für die Größe.
  readonly weightResultLabel: string;                           // Ergebnislabel für das Gewicht.
  readonly closeLabel: string;                                  // Zugängliche Beschriftung zum Schließen des Rechners.
  readonly units: readonly AboutMetricsCalculatorUnitContent[]; // Sichtbare Einheitennamen für die Auswahl.
}

/** Sichtbarer Einheitenname des Absurditäten-Rechners. */
export interface AboutMetricsCalculatorUnitContent {
  readonly key: AboutMetricsCalculatorUnitKey; // Stabile Einheit zur Verknüpfung mit den Rechenwerten.
  readonly label: string;                      // Voller sichtbarer Einheitenname.
  readonly shortLabel: string;                 // Kurzer Name für kompakte Ergebniszeilen.
}

/** Einzelne Kennzahl im Fun-Metrics-Fenster. */
export interface AboutMetricFact {
  readonly id: string;          // Stabile ID für Tracking und Animation.
  readonly icon: string;        // Material-Symbol der Kennzahl.
  readonly label: string;       // Sichtbarer Name der Kennzahl.
  readonly metricValue: string; // Normaler metrischer oder sachlicher Wert.
  readonly metricUnit: string;  // Einheit des normalen Werts.
  readonly metricNote: string;  // Kurzer Hinweis zum normalen Wert.
  readonly weirdValue: string;  // Absurder Alternativwert.
  readonly weirdUnit: string;   // Absurde Einheit oder leere Einheit bei Textwerten.
  readonly weirdNote: string;   // Kurzer Hinweis zum absurden Wert.
}

/** Inhalt des Erfahrungsbereichs. */
export interface ExperienceContent {
  readonly eyebrow: string;                  // Kleine Beschriftung oberhalb der Überschrift.
  readonly title: string;                    // Sichtbare Überschrift.
  readonly subtitle: string;                 // Einleitung unter der Überschrift.
  readonly items: readonly ExperienceItem[]; // Einzelne Erfahrungswerte.
}

/** Einzelner Erfahrungswert mit kurzer Einordnung. */
export interface ExperienceItem {
  readonly value: string;  // Angezeigter Wert.
  readonly suffix: string; // Einheit oder Zusatz hinter dem Zahlenwert.
  readonly label: string;  // Sichtbare Beschriftung.
  readonly text: string;   // Beschreibender Inhalt.
  readonly claim: string;  // Kurze Kernaussage zum Erfahrungswert.
}

/** Inhalt des Skillbereichs. */
export interface SkillsContent {
  readonly eyebrow: string;                // Kleine Beschriftung oberhalb der Überschrift.
  readonly title: string;                  // Sichtbare Überschrift.
  readonly subtitle: string;               // Einleitung unter der Überschrift.
  readonly groups: readonly SkillGroup[];  // Thematisch gruppierte Werkzeuge und Kenntnisse.
  readonly levelsTitle: string;            // Überschrift des Einsatzprofils.
  readonly levelsSubtitle: string;         // Einordnung der Werkzeugnutzung.
  readonly levelsDialogTitle: string;      // Titel des kleinen Skill-Dialogfensters.
  readonly levelsDialogText: string;       // Text des kleinen Skill-Dialogfensters.
  readonly levelsDialogCloseLabel: string; // Zugängliche Beschriftung zum Schließen des Skill-Dialogfensters.
  readonly levels: readonly SkillLevel[];  // Projektbasierte Nutzungstiefe der Werkzeuge.
  readonly marquee: readonly string[];     // Werkzeugnamen im laufenden Textband.
}

/** Gruppe zusammengehöriger Skills. */
export interface SkillGroup {
  readonly title: string;            // Sichtbare Überschrift.
  readonly items: readonly string[]; // Werkzeuge und Kenntnisse der Gruppe.
}

/** Status eines Werkzeugs innerhalb des projektbasierten Einsatzprofils. */
export type SkillUsageStatus = 'CORE' | 'ACTIVE' | 'ROUTINE' | 'SPECIALIZED';

/** Projektbasierte Nutzungstiefe eines Tech-, Design- oder Automatisierungswerkzeugs. */
export interface SkillLevel {
  readonly label: string;            // Sichtbare Beschriftung.
  readonly depth: number;            // Relative Nutzungstiefe ausschließlich für die visuelle Balkendarstellung.
  readonly status: SkillUsageStatus; // Lesbarer Status anstelle einer pseudo-genauen Prozentbewertung.
  readonly group: string;            // Thematische Zuordnung des Werkzeugs.
}

/** Inhalt des kompakten Kompetenzprofils auf der Startseite. */
export interface CapabilityShowcaseContent {
  readonly eyebrow: string;                          // Kleine technische Beschriftung oberhalb des Kompetenzprofils.
  readonly title: string;                            // Hauptaussage des kompakten Kompetenzprofils.
  readonly subtitle: string;                         // Kurze Verbindung zwischen Techstack und Case Studies.
  readonly ctaLabel: string;                         // Beschriftung des Links zu den Case Studies.
  readonly ariaLabel: string;                        // Zugängliche Beschriftung der Kompetenzfelder.
  readonly items: readonly CapabilityShowcaseItem[]; // Bewusst reduzierte Kompetenzfelder.
}

/** Einzelnes Kompetenzfeld des Portfolio-Profils. */
export interface CapabilityShowcaseItem {
  readonly label: string; // Kurzes Systemlabel wie WEB, APP oder SYSTEM.
  readonly text: string;  // Technisch-neutrale Kurzbeschreibung.
}

/** Inhalt der Prozess-Section. */
export interface ProcessContent {
  readonly eyebrow: string;               // Kleine Beschriftung oberhalb der Überschrift.
  readonly title: string;                 // Sichtbare Überschrift.
  readonly subtitle: string;              // Einleitung unter der Überschrift.
  readonly hint: string;                  // Kurzer Bedien- oder Erklärungshinweis.
  readonly steps: readonly ProcessStep[]; // Geordnete Schritte des Arbeitsprozesses.
}

/** Einzelner Prozessschritt. */
export interface ProcessStep {
  readonly number: string;  // Sichtbare Nummer des Prozessschritts.
  readonly title: string;   // Sichtbare Überschrift.
  readonly text: string;    // Beschreibender Inhalt.
  readonly command: string; // Dekorative Befehlszeile zum Prozessschritt.
}

/** FAQ-Eintrag. */
export interface FaqItem {
  readonly question: string; // Sichtbare Frage.
  readonly answer: string;   // Antwort auf die Frage.
}

/** Inhalt des Kundenbereichs. */
export interface ClientsContent {
  readonly eyebrow: string;              // Kleine Beschriftung oberhalb der Überschrift.
  readonly title: string;                // Sichtbare Überschrift.
  readonly subtitle: string;             // Einleitung unter der Überschrift.
  readonly items: readonly ClientItem[]; // Kunden und Referenzlinks.
}

/** Einzelner Kunde oder Referenzlink. */
export interface ClientItem {
  readonly name: string;             // Sichtbarer Name.
  readonly url: string;              // Externer Link zur Referenz.
  readonly label: string;            // Sichtbare Beschriftung.
  readonly stack: readonly string[]; // Technischer Stack der referenzierten Website.
}

/** Inhalt der chaotischen CTA-Section. */
export interface CtaContent {
  readonly eyebrow: string;          // Kleine technische Beschriftung über der CTA.
  readonly title: string;            // Titel der CTA-Section.
  readonly hint: string;             // Bedienhinweis für die interaktiven Bausteine.
  readonly words: readonly string[]; // Einzelne physikähnliche Wortbausteine.
}

/** Schmale Qualitäts- und Arbeitsweise-Section. */
export interface BuiltWithoutContent {
  readonly eyebrow: string;                    // Kleine technische Beschriftung über der Section.
  readonly title: string;                      // Kurzer Titel der Section.
  readonly text: string;                       // Kurzer erklärender Text.
  readonly withoutLabel: string;               // Label für bewusst ausgeschlossene Lösungen.
  readonly capabilityLabel: string;            // Label für ergänzende gefragte Fähigkeiten.
  readonly withoutItems: readonly string[];    // Bewusst nicht verwendete generische Hilfsmittel.
  readonly capabilityItems: readonly string[]; // Ergänzende, nachgefragte Arbeitsweisen und Qualitätsmerkmale.
  readonly telemetryEyebrow: string;           // Eyebrow der automatisch aus den Case Studies abgeleiteten Telemetrie.
  readonly telemetryTitle: string;             // Titel der globalen Portfolio-Telemetrie.
  readonly telemetryText: string;              // Erklärung zur Datenquelle der Portfolio-Telemetrie.
  readonly recurrenceTitle: string;            // Titel des Technologie-Wiederholungs-Charts.
  readonly recurrenceText: string;             // Erklärung des Technologie-Wiederholungs-Charts.
  readonly breadthTitle: string;               // Titel des Stack-Breiten-Charts.
  readonly breadthText: string;                // Erklärung des Stack-Breiten-Charts.
}
