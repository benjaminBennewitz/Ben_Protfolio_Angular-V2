/** @file Gemeinsamer lokaler DLC-Fortschritt ohne Abhängigkeit von Angular. */
import { STUDY_ACHIEVEMENTS } from './achievement-catalog.js';

export const STUDY_STORAGE_PREFIX = 'bp-study-achievement:';
const knownIds = new Set(STUDY_ACHIEVEMENTS.map(item => item.id));
const fallback = new Set();

/** Liest einzelne Schlüssel, damit gleichzeitige Tabs keine fremden Erfolge überschreiben. */
export function readStudyAchievements() {
  return STUDY_ACHIEVEMENTS.filter(item => {
    try { return localStorage.getItem(STUDY_STORAGE_PREFIX + item.id) === '1' || fallback.has(item.id); }
    catch { return fallback.has(item.id); }
  }).map(item => item.id);
}

/** Speichert einen neuen Erfolg und meldet ihn ausschließlich im auslösenden Dokument. */
export function unlockStudyAchievement(id) {
  if (!knownIds.has(id) || readStudyAchievements().includes(id)) return;
  try { localStorage.setItem(STUDY_STORAGE_PREFIX + id, '1'); }
  catch { fallback.add(id); }
  document.dispatchEvent(new CustomEvent('bp:study-unlocked', { detail: id }));
  const unlocked = readStudyAchievements();
  const studies = new Set(STUDY_ACHIEVEMENTS.filter(item => item.study && unlocked.includes(item.id)).map(item => item.study));
  if (studies.size >= 4 && id !== 'study-field-research') unlockStudyAchievement('study-field-research');
}

/** Setzt nur den gemeinsamen DLC-Fortschritt zurück. */
export function resetStudyAchievements() {
  fallback.clear();
  for (const id of knownIds) {
    try { localStorage.removeItem(STUDY_STORAGE_PREFIX + id); } catch { /* Ohne Speicher bleibt nur der Sitzungszustand. */ }
  }
  document.dispatchEvent(new Event('bp:study-reset'));
}
