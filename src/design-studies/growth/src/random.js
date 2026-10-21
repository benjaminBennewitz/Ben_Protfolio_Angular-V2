/** Deterministic random stream derived from an unsigned 32-bit seed. */
export function createRandom(initialSeed) {
  let state = initialSeed >>> 0;
  return () => ((state = (1664525 * state + 1013904223) >>> 0) / 4294967296);
}
