/** @file frame-loop.js — Teilbereich der verbundenen FOLD-Papierexperience. */

import { mix } from './math.js';

/**
 * Kapselt Frame-Zustand und überspringt unveränderte CSS3D-Ansichten.
 * @param {object} context - Explizite Abhängigkeiten beziehungsweise aktueller Dateneintrag.
 * @returns {object} Ergebnis der beschriebenen Operation.
 */
export function createFrameLoop({
  renderer,
  scene,
  camera,
  update,
  mobile,
  measure,
  mobileQuery,
  reduced,
}) {

  let current = 0;      // Aktuell geglätteter Fortschritt der Kamera.
  let lastRender = -1;  // Zuletzt mit CSS3D gerenderter Fortschritt.
  let lastFloat = 0;    // Zeitstempel des letzten Schwebebewegungs-Frames.

  /**
   * Aktualisiert bei sichtbarer Seite und geändertem Fortschritt die CSS3D-Ausgabe.
   * @param {number} now - Aktueller Zeitstempel in Millisekunden.
   * @returns {void} Kein Rückgabewert.
   */
  function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden) return;

    const desired = mobile.preview ?? measure();                                     // Aus Scrollposition oder Vorschau bestimmter Zielfortschritt.
    const delta = Math.abs(current - desired);                                       // Abstand zwischen geglättetem und gewünschtem Fortschritt.

    if (delta > 0.00006)
      current = reduced ? desired : mix(current, desired, mobileQuery.matches ? 0.29 : 0.17);
    else current = desired;

    const hoveringNet = current > 0.997 && !reduced;                                 // Das vollständig geöffnete Netz darf leicht schweben.
    const netTick = hoveringNet && (!mobileQuery.matches || now - lastFloat >= 34);  // Das offene Netz benötigt einen weiteren Schwebebewegungs-Frame.

    if (netTick) lastFloat = now;

    const changed = Math.abs(current - lastRender) > 0.000015 || netTick;            // Die Ansicht benötigt neue CSS3D-Matrizen.

    if (!changed) return;
    update(current);
    if (netTick) {

      const t = now * 0.001;  // Normierter lokaler Interpolationswert.

      camera.position.y += Math.sin(t * 0.62) * 0.105;
      camera.position.x += Math.cos(t * 0.45) * 0.055;
    }
    renderer.render(scene, camera);
    lastRender = current;
  }
  return {

    /**
     * Plant den ersten Frame der aktiven CSS3D-Experience.
     * @returns {void} Kein Rückgabewert.
     */
    start() {
      requestAnimationFrame(frame);
    },

    /**
     * Erzwingt nach einer Größenänderung die Aktualisierung der Projektion und Eingabefläche.
     * @returns {void} Kein Rückgabewert.
     */
    invalidate() {
      lastRender = -1;
    },
  };
}
