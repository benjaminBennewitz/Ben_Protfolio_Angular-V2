/** @file arm-motion.js — Gekapselter Teilbereich der SCOOP!-Studie. */

/**
 * Erzeugt einen Bézierpfad aus den aktuellen Armankern.
 *
 * @param {Array<{x:number,y:number}>} points - Verformte Ankerpunkte.
 * @returns {string} SVG-Pfaddaten.
 */
function armPath(points) {
  
  let d = `M${points[0].x},${points[0].y}`;               // Aufgebaute SVG-Pfaddaten.
  
  for (let i = 0; i < points.length - 1; i++) {
    
    const a = points[Math.max(0, i - 1)];                 // Vorheriger Kurvenanker.
    const b = points[i];                                  // Aktueller Kurvenanker.
    const c = points[i + 1];                              // Nachfolgender Kurvenanker.
    const e = points[Math.min(points.length - 1, i + 2)]; // Übernächster Kurvenanker.

    d += ` C${b.x + (c.x - a.x) / 6},${b.y + (c.y - a.y) / 6} ${c.x - (e.x - b.x) / 6},${c.y - (e.y - b.y) / 6} ${c.x},${c.y}`;
  }
  return d;
}

/**
 * Berechnet die Armbewegung der aktiven Figur.
 *
 * @param {object} actor - Figur mit Armankern.
 * @param {number} time - Animationszeit in Sekunden.
 * @returns {void} Kein Rückgabewert.
 */
export function updateArms(actor, time) {
  for (const arm of actor.arms) {

    // Stützpunkte für die aktuelle SVG-Geometrie.
    const points = arm.points.map(

      /**
       * Berechnet den Zielwert für den aktuellen Listeneintrag.
       * @param {unknown} p - Berechneter Punkt oder normierter Animationsfortschritt.
       * @param {number} i - Laufender Index der aktuellen Berechnung.
       * @returns {unknown} Ergebnis der Verarbeitung.
       */
      (p, i) => {
        return {
          x: p.x + Math.sin(time * 2.9 + arm.phase - i * 0.9) * i * 6,
          y: p.y + Math.sin(time * 2.1 + arm.phase - i * 1.2) * i * 5,
        };
      },
    );
    arm.path.setAttribute('d', armPath(points));
    
    const last = points[3];     // Letzter verformter Armanker.
    const previous = points[2]; // Vorherige Menge beziehungsweise vorheriger Armanker.
    const base = arm.points[3]; // Ursprünglicher Handanker.
    
    // Drehwinkel der Hand.
    const angle = ((Math.atan2(last.y - previous.y, last.x - previous.x) - arm.angle) * 180) / Math.PI;
    arm.hand.setAttribute(
      'transform',
      `translate(${last.x - base.x},${last.y - base.y}) rotate(${angle},${base.x},${base.y})`,
    );
  }
}

/**
 * Stellt die ursprünglichen Arm-Pfade einer Founder-Figur wieder her.
 *
 * @param {object} actor - Founder-Figur.
 * @returns {void} Kein Rückgabewert.
 */
export function resetFounderArms(actor) {
  for (const arm of actor.arms) {
    arm.path.setAttribute('d', arm.original);
    arm.hand.removeAttribute('transform');
  }
}
