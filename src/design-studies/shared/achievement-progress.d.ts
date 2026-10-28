/**
 * @file achievement-progress.d.ts
 * @description Typisierte Schnittstelle für lokal gespeicherte Designstudien-Erfolge.
 */

import { StudyAchievementId } from './achievement-catalog.js';

/** Prefix der einzelnen LocalStorage-Schlüssel für Erfolge. */
export const STUDY_STORAGE_PREFIX: string;

/**
 * Liest alle bereits freigeschalteten Erfolge.
 *
 * @returns Kennungen der gespeicherten Erfolge.
 */
export function readStudyAchievements(): StudyAchievementId[];

/**
 * Schaltet einen Erfolg frei und meldet ihn im aktuellen Dokument.
 *
 * @param id - Kennung des freizuschaltenden Erfolgs.
 * @returns Kein Rückgabewert.
 */
export function unlockStudyAchievement(id: StudyAchievementId): void;

/**
 * Löscht ausschließlich den lokal gespeicherten Designstudien-Fortschritt.
 *
 * @returns Kein Rückgabewert.
 */
export function resetStudyAchievements(): void;
