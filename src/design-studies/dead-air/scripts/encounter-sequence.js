/**
 * @file Gemeinsame Zeitmarken für die gestörte Begegnung auf CAM 03.
 * @description Reine Zustandsabfragen auf der bestehenden pausierbaren Storyuhr.
 * @author Benjamin Bennewitz
 */
export const ENCOUNTER = Object.freeze({
  laughAt: 4200,
  firstCutAt: 9400,
  standingAt: 10500,
  secondCutAt: 15800,
  closeAt: 16900,
  finalCutAt: 22000,
  takeoverAt: 23000,
  ronnieAt: 3500,
  statusAt: 13000,
});

/** Liefert Bildzustand und eindeutige Tonmarke ohne eigene Timer.
 * @param {number} elapsedMs Aktive Zeit seit dem Öffnen von CAM 03.
 * @returns {{stage: string, cue: number, shaken: boolean}} Kamera- und Störzustand.
 */
export function getEncounterFrame(elapsedMs) {
  if (elapsedMs >= ENCOUNTER.finalCutAt) return { stage: 'blackout', cue: 5, shaken: true };
  if (elapsedMs >= ENCOUNTER.closeAt) return { stage: 'closeup', cue: 4, shaken: true };
  if (elapsedMs >= ENCOUNTER.secondCutAt) return { stage: 'blackout', cue: 3, shaken: true };
  if (elapsedMs >= ENCOUNTER.standingAt) return { stage: 'standing', cue: 2, shaken: false };
  if (elapsedMs >= ENCOUNTER.firstCutAt) return { stage: 'blackout', cue: 1, shaken: true };
  for (const [at, cue] of [[0, 6], [700, 7], [1600, 8]]) {
    if (elapsedMs >= at && elapsedMs < at + 260) return { stage: 'blackout', cue, shaken: true };
  }
  return { stage: 'swing', cue: 0, shaken: elapsedMs < 2300 };
}

/** Zeitmarken für verzögerte persönliche Übertragung und vorausgehende dunkle Aussetzer. */
export const NAME_SIGNAL = Object.freeze({ delayMs: 3800, firstAt: 700, secondAt: 1900, thirdAt: 3000 });

/** Dunkle Einzelimpulse statt schneller heller Vollbildblitze.
 * @param {number} elapsedMs Aktive Zeit seit der Synchronisierung.
 * @returns {number} Stärke des aktuellen Vorzeichens von 0 bis 1.
 */
export function getNameOmen(elapsedMs) {
  for (const at of [NAME_SIGNAL.firstAt, NAME_SIGNAL.secondAt, NAME_SIGNAL.thirdAt]) {
    if (elapsedMs >= at && elapsedMs < at + 350) return 1;
  }
  return 0;
}
