/** @file math.js — Teilbereich der verbundenen FOLD-Papierexperience. */

export /**
 * Begrenzt einen Zahlenwert auf das angegebene beziehungsweise normierte Intervall.
 * @param {number} v - Eingabewert „v“.
 * @param {number} [a] - Erster Interpolationswert beziehungsweise berechneter Scharnierwinkel.
 * @param {number} [b] - Zweiter Interpolationswert beziehungsweise obere Intervallgrenze.
 * @returns {number} Berechneter Zahlenwert.
 */
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export /**
 * Berechnet einen geglätteten Übergang mit ruhenden Endpunkten.
 * @param {number} v - Eingabewert „v“.
 * @returns {number} Berechneter Zahlenwert.
 */
  const ease = v => {

    const t = clamp(v);  // Normierter lokaler Interpolationswert.

    return t * t * (3 - 2 * t);
  };
export /**
 * Interpoliert linear zwischen zwei Zahlenwerten.
 * @param {number} a - Erster Interpolationswert beziehungsweise berechneter Scharnierwinkel.
 * @param {number} b - Zweiter Interpolationswert beziehungsweise obere Intervallgrenze.
 * @param {number} t - Normierter lokaler Interpolationswert.
 * @returns {number} Berechneter Zahlenwert.
 */
  const mix = (a, b, t) => a + (b - a) * t;
