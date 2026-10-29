/* src/app/core/models/achievement.models.ts */

/** @file Gemeinsame Typen für Trophäendaten, Fortschritt und Darstellung. */

import type { StudyAchievementId } from '../../../design-studies/shared/achievement-catalog.js';

/** Verfügbare Achievement-IDs der Portfolio-Interaktionen. */
export type AchievementId =
  | 'loader-human'
  | 'hero-face-switch'
  | 'nostalgia-hater'
  | 'coffee-glitch'
  | 'weird-units'
  | 'sugar-covered'
  | 'eye-poke'
  | 'bomb-defused'
  | 'trash-dunk'
  | 'blood-complete'
  | 'cta-contact'
  | 'skilled-driver'
  | 'rescue-lane-404'
  | 'world-upside-down'
  | 'loyal-companion'
  | 'platinum-complete'
  | StudyAchievementId;

/** Technische Definition einer Trophäe. */
export interface AchievementDefinition {
  readonly id: AchievementId; // Stabile ID für Persistenz und Unlocks.
  readonly icon: string;      // Material-Symbol für die freigeschaltete Trophäe.
  readonly category: string;  // Kurze Kategorie der Interaktion.
  readonly dlc?: boolean;     // Zusatzinhalte gehören nicht zum Platin-Abschluss.
}

/** Übersetzbarer Text einer Trophäe. */
export interface AchievementTranslation {
  readonly title: string;       // Sichtbarer Titel nach Freischaltung.
  readonly description: string; // Beschreibung nach Freischaltung.
  readonly hint: string;        // Hinweis, der vor Freischaltung manuell eingeblendet werden kann.
}

/** Sichtbarer View-Status einer Trophäe. */
export interface AchievementView extends AchievementDefinition, AchievementTranslation {
  readonly unlocked: boolean;    // Gibt an, ob die Trophäe freigeschaltet wurde.
  readonly hintVisible: boolean; // Gibt an, ob der Hinweis auf der geheimen Seite eingeblendet wurde.
}

/** Persistierte Achievement-Daten. */
export interface StoredAchievementState {
  readonly unlocked: readonly AchievementId[]; // Freigeschaltete Achievement-IDs.
  readonly hints: readonly AchievementId[];    // Sichtbare Hinweis-IDs.
}
