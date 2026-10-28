/** @file eye-motion.js — Gekapselter Teilbereich der SCOOP!-Studie. */

/**
 * Erstellt die Blicksteuerung mit Zugriff auf die aktuelle Pointerposition.
 * @param {object} context - Explizite Abhängigkeiten dieses Bereichs.
 * @returns {Function} Ergebnis der beschriebenen Operation.
 */
export function createEyeMotion({ finePointer, automaticHover, loader, getPointer }) {

  /**
   * Bewegt eine Pupille geglättet zum begrenzten Blickziel.
   * @param {object} actor - Animierbarer Zustand einer SVG-Figur.
   * @param {object} eye - Augenanker mit beweglicher Pupille.
   * @param {number} time - Eingabewert der Operation.
   * @returns {boolean} Ergebnis der beschriebenen Operation.
   */
  function updateEye(actor, eye, time) {
    if (!eye.base) eye.base = eyeOrigin(eye);
    // Begrenzter Zielversatz der Pupille.
    const offset = eyeOffset(actor, eye, time);
    if (!offset) return false;
    // Die aktuelle Bewegung ist noch nicht abgeschlossen.
    const moving = Math.abs(offset.x - eye.x) > 0.05 || Math.abs(offset.y - eye.y) > 0.05;
    eye.x += (offset.x - eye.x) * 0.25;
    eye.y += (offset.y - eye.y) * 0.25;
    eye.mover.setAttribute(
      'transform',
      'translate(' + (eye.base.centerX + eye.x) + ',' + (eye.base.centerY + eye.y) + ')',
    );
    return moving;
  }

  /**
   * Berechnet Augenmittelpunkt und Zentrierung der ursprünglichen Pupille.
   * @param {object} eye - Augenanker mit beweglicher Pupille.
   * @returns {object} Ergebnis der beschriebenen Operation.
   */
  function eyeOrigin(eye) {
    // Begrenzungsrahmen des Augenweißes.
    const white = eye.white.getBBox();
    // Begrenzungsrahmen der ursprünglichen Pupille.
    const pupil = eye.mover.getBBox();
    return {
      x: white.x + white.width / 2,
      y: white.y + white.height / 2,
      centerX: white.x + white.width / 2 - pupil.x - pupil.width / 2,
      centerY: white.y + white.height / 2 - pupil.y - pupil.height / 2,
    };
  }

  /**
   * Berechnet den begrenzten Blickversatz aus Pointer oder simuliertem Hover.
   * @param {object} actor - Animierbarer Zustand einer SVG-Figur.
   * @param {object} eye - Augenanker mit beweglicher Pupille.
   * @param {number} time - Eingabewert der Operation.
   * @returns {object|null} Ergebnis der beschriebenen Operation.
   */
  function eyeOffset(actor, eye, time) {
    // Letzte Mausposition im Viewport.
    const pointer = getPointer();
    // Horizontaler Zielversatz.
    let x = 0;
    // Vertikaler Zielversatz.
    let y = 0;
    if (pointer && finePointer.matches) {
      // Transformation zwischen SVG- und Viewport-Koordinaten.
      const matrix = actor.svg.getScreenCTM();
      if (!matrix) return null;
      // Berechneter Punkt im lokalen Koordinatensystem.
      const point = new DOMPoint(pointer.x, pointer.y).matrixTransform(matrix.inverse());
      // Horizontaler Richtungsvektor.
      const dx = point.x - eye.base.x;
      // Vertikaler Richtungsvektor.
      const dy = point.y - eye.base.y;
      // Länge des Richtungsvektors zur Normalisierung.
      const magnitude = Math.hypot(dx, dy);
      if (magnitude) {
        x = (dx / magnitude) * Math.min(10, magnitude * 0.04);
        y = (dy / magnitude) * Math.min(7, magnitude * 0.025);
      }
    }
    if (automaticHover.matches && loader.hidden && !finePointer.matches) {
      x = Math.sin(time * 0.9 + actor.gazePhase) * 5;
      y = Math.cos(time * 0.65 + actor.gazePhase) * 2;
    }
    return {
      x,
      y,
    };
  }

  /**
   * Lässt die Augen zum Pointer oder zu einer simulierten Position blicken.
   *
   * @param {object} actor - Figur mit Augenankern.
   * @param {number} time - Animationszeit in Sekunden.
   * @returns {boolean} Ob die Blickbewegung weiterläuft.
   */
  function updateEyes(actor, time) {
    // Die aktuelle Bewegung ist noch nicht abgeschlossen.
    let moving = false;
    for (const eye of actor.eyes) {
      moving = updateEye(actor, eye, time) || moving;
    }
    return moving;
  }
  return updateEyes;
}
