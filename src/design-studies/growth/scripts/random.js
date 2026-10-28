/** @file random.js — Erstellt einen deterministischen Zufallsstrom aus einem vorzeichenlosen 32-Bit-Seed. */

/**
 * Erstellt einen deterministischen Zufallsstrom aus einem vorzeichenlosen 32-Bit-Seed.
 * @param {number} initialSeed - Startwert des 32-Bit-Zufallsstroms.
 * @returns {Function} Gekapselte Generatorfunktion.
 */
export function createRandom(initialSeed) {

  let state = initialSeed >>> 0;  // Aktueller Zustand des deterministischen Zufallsstroms.

  return (

    /**
     * Liefert den nächsten Zufallswert und aktualisiert den privaten Generatorzustand.
     * @returns {number} Berechneter Zahlenwert.
     */
    () => (state = (1664525 * state + 1013904223) >>> 0) / 4294967296
  );
}
