/**
 * @file Gemeinsame Licht-, Echo- und Abgleichmuster der NCBS-Station.
 * @description Reine Signalberechnungen für Bild, Ton und prüfbare Rätselbedingungen.
 * @author Benjamin Bennewitz
 */

export const MORSE_DIGITS = Object.freeze(['-----', '.----', '..---', '...--', '....-', '.....', '-....', '--...', '---..', '----.']);
export const MORSE_UNIT_MS = 180;

/** Drei gespeicherte Echokennungen; der lange Zwischenraum identifiziert die Gruppe. */
export const RELAY_PATTERNS = Object.freeze({
  A: { pulses: [0, 140, 430], drift: 0, short: '••   •', intervals: '140 / 290 ms' },
  B: { pulses: [0, 430, 570], drift: 64, short: '•   ••', intervals: '430 / 140 ms' },
  C: { pulses: [0, 290, 720], drift: -46, short: '•  •   •', intervals: '290 / 430 ms' },
});

/** Baut den Code mit eindeutigen Zeichen- und Wiederholungspausen auf. */
export function createMorseTimeline(digits) {
  const segments = [];
  let cursor = 0;
  for (const digit of String(digits)) {
    for (const symbol of MORSE_DIGITS[Number(digit)] ?? '') {
      const duration = (symbol === '.' ? 1 : 3) * MORSE_UNIT_MS;
      segments.push({ start: cursor, end: cursor + duration });
      cursor += duration + MORSE_UNIT_MS;
    }
    cursor += MORSE_UNIT_MS * 2;
  }
  return { segments, duration: cursor + MORSE_UNIT_MS * 5 };
}

/** Dieselbe Abfrage schaltet Mastlicht und Audioton zur selben aktiven Spielzeit. */
export function isMorseOn(timeline, elapsedMs) {
  const position = ((elapsedMs % timeline.duration) + timeline.duration) % timeline.duration;
  return timeline.segments.some(segment => position >= segment.start && position < segment.end);
}

/** Prüft die aufgezeichnete Dreiergruppe statt einer beliebigen Sinusüberlagerung. */
export function isSignalAligned(relay, offset) {
  return Math.abs(RELAY_PATTERNS[relay].drift + Number(offset)) <= 3;
}

/** Zeichnet echte Kennungen und zwei ähnlich aussehende Störgruppen in einer Spur. */
export function sampleRelayWave(relay, timeMs, offset = 0) {
  const pattern = RELAY_PATTERNS[relay];
  const position = timeMs - pattern.drift - Number(offset);
  let envelope = 0;
  for (const start of [780, 1260, 1740]) {
    const pulses = start === 1260 ? pattern.pulses : [0, 180, 360];
    for (const pulse of pulses) {
      const distance = position - start - pulse;
      envelope += Math.exp(-(distance * distance) / (2 * 22 * 22));
    }
  }
  return Math.sin(position / 8) * Math.min(1, envelope) * 30;
}
