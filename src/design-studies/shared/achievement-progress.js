/**
 * @file achievement-progress.js
 * @description Verwaltet freigeschaltete Designstudien-Erfolge unabhängig von Angular.
 */

import { STUDY_ACHIEVEMENTS } from './achievement-catalog.js';

/* ===========================================================================
   INHALTSVERZEICHNIS

   01   Speicher und Zustände
   02   Fortschritt lesen und freischalten
   03   Fortschritt zurücksetzen
   ========================================================================== */

/* ===========================================================================
   01   Speicher und Zustände
   ========================================================================== */

/** Prefix für die getrennt gespeicherten Erfolge. */
export const STUDY_STORAGE_PREFIX = 'bp-study-achievement:';

/** @type {Set<string>} Kennungen der im Katalog definierten Erfolge. */
const knownIds = new Set(STUDY_ACHIEVEMENTS.map(item => item.id));

/** @type {Set<string>} Sitzungs-Fallback bei blockiertem LocalStorage. */
const fallback = new Set();

/* ===========================================================================
   02   Fortschritt lesen und freischalten
   ========================================================================== */

/**
 * Liest die gespeicherten Erfolge über unabhängige Schlüssel pro Trophäe.
 * Dadurch überschreiben sich gleichzeitige Browser-Tabs nicht gegenseitig.
 *
 * @returns {import('./achievement-catalog.js').StudyAchievementId[]} Kennungen aller freigeschalteten Erfolge.
 */
export function readStudyAchievements() {
  return STUDY_ACHIEVEMENTS.filter(item => {
    try {
      return localStorage.getItem(STUDY_STORAGE_PREFIX + item.id) === '1' || fallback.has(item.id);
    } catch {
      return fallback.has(item.id);
    }
  }).map(item => item.id);
}

/**
 * Speichert einen Erfolg und meldet die Freischaltung im aktuellen Dokument.
 * Ab vier unterschiedlichen Studien wird zusätzlich der DLC-Erfolg vergeben.
 *
 * @param {import('./achievement-catalog.js').StudyAchievementId} id - Kennung des freizuschaltenden Erfolgs.
 * @returns {void} Kein Rückgabewert.
 */
export function unlockStudyAchievement(id) {
  if (!knownIds.has(id) || readStudyAchievements().includes(id)) return;

  try {
    localStorage.setItem(STUDY_STORAGE_PREFIX + id, '1');
  } catch {
    fallback.add(id);
  }

  document.dispatchEvent(new CustomEvent('bp:study-unlocked', { detail: id }));

  const unlocked = readStudyAchievements();
  const studies = new Set(
    STUDY_ACHIEVEMENTS.filter(item => item.study && unlocked.includes(item.id)).map(item => item.study)
  );

  if (studies.size >= 4 && id !== 'study-field-research') unlockStudyAchievement('study-field-research');
}

/* ===========================================================================
   03   Fortschritt zurücksetzen
   ========================================================================== */

/**
 * Entfernt ausschließlich die Achievement-Einträge aus dem lokalen Speicher.
 * Informiert anschließend alle Listener im aktuellen Dokument über den Reset.
 *
 * @returns {void} Kein Rückgabewert.
 */
export function resetStudyAchievements() {
  fallback.clear();

  for (const id of knownIds) {
    try {
      localStorage.removeItem(STUDY_STORAGE_PREFIX + id);
    } catch {
      // Ohne LocalStorage wird nur der Sitzungszustand zurückgesetzt.
    }
  }

  document.dispatchEvent(new Event('bp:study-reset'));
}
