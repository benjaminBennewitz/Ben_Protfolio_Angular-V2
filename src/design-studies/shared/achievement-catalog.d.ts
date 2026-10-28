/**
 * @file achievement-catalog.d.ts
 * @description Typdeklarationen für den gemeinsamen Erfolgskatalog der Designstudien.
 */

/** Kennungen aller freischaltbaren Erfolge einschließlich der studienübergreifenden Trophäe. */
export type StudyAchievementId =
  'study-growth-ascent'
  | 'study-growth-discovery'
  | 'study-fold-perspectives'
  | 'study-type-reform'
  | 'study-type-poster'
  | 'study-scoop-mix'
  | 'study-ctrl-reception'
  | 'study-bentendo-turn'
  | 'study-field-research';

/** Sprachabhängige Texte für einen Erfolg. */
export interface StudyAchievementText {
  /** Angezeigter Name der Trophäe. */
  readonly title: string;
  /** Beschreibung im Benachrichtigungsfenster. */
  readonly description: string;
  /** Hinweis auf die Freischaltbedingung. */
  readonly hint: string;
}

/** Definition eines Erfolgs samt Studienzuordnung und Übersetzungen. */
export interface StudyAchievement {
  /** Eindeutige, persistierte Kennung. */
  readonly id: StudyAchievementId;
  /** Zugehörige Designstudie; `null` für übergreifende Erfolge. */
  readonly study: string | null;
  /** Kategorie in der Achievement-Übersicht. */
  readonly category: string;
  /** Material-Symbol-Kennung. */
  readonly icon: string;
  /** Deutsche Texte. */
  readonly de: StudyAchievementText;
  /** Englische Texte. */
  readonly en: StudyAchievementText;
}

/** Zentraler Katalog aller verfügbaren Erfolge. */
export const STUDY_ACHIEVEMENTS: readonly StudyAchievement[];
