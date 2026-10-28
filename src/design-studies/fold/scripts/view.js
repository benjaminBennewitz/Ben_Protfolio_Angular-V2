/** @file view.js — Teilbereich der verbundenen FOLD-Papierexperience. */

import { clamp, ease } from './math.js';

/**
 * Kapselt Ansichtsfortschritt und den Besuchszustand der sechs Perspektiven.
 * @param {object} context - Explizite Abhängigkeiten beziehungsweise aktueller Dateneintrag.
 * @returns {object} Ergebnis der beschriebenen Operation.
 */
export function createView({
  THREE,
  camera,
  root,
  shadow,
  S,
  faces,
  fold,
  poses,
  midpoint,
  counter,
  instruction,
}) {

  const visitedPerspectives = new Set();  // An Ruhepositionen bereits betrachtete Würfelseiten.
  let perspectivesCompleted = false;      // Das Achievement für alle sechs Perspektiven wurde bereits ausgelöst.

  /**
   * Interpoliert die Kameradrehung und führt die Kamera außerhalb des geschlossenen Würfels.
   * @param {number} section - Aktuelle Papierstation oder DOM-Abschnitt der archivierten Version.
   * @param {number} next - Nächste Perspektive während des aktuellen Übergangs.
   * @param {number} spin - Geglätteter Drehfortschritt zum nächsten Würfelfeld.
   * @returns {void} Kein Rückgabewert.
   */
  function updateClosedCamera(section, next, spin) {

    const q = new THREE.Quaternion();                                // Interpolierte Kameraausrichtung zwischen benachbarten Perspektiven.

    if (section === 0) {
      if (spin < 0.5) q.copy(poses[0].quat).slerp(midpoint, ease(spin * 2));
      else q.copy(midpoint).slerp(poses[1].quat, ease((spin - 0.5) * 2));
    } else q.copy(poses[section].quat).slerp(poses[next].quat, spin);

    const vFov = THREE.MathUtils.degToRad(camera.fov);               // Vertikaler Sichtwinkel der Perspektivkamera.
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);  // Horizontaler Sichtwinkel der Perspektivkamera.
    const close = (S / 2 / Math.tan(hFov / 2)) * 0.93;               // Kameraabstand für eine unverzerrte viewportfüllende Quadratfläche.
    const pull = 1.7 * Math.sin(Math.PI * spin);                     // Zusätzlicher Kameraabstand während eines Perspektivwechsels.

    camera.quaternion.copy(q);

    const cubeCenter = new THREE.Vector3(0, 0, -S / 2);              // Geometrischer Mittelpunkt des geschlossenen Würfels.
    const outward = new THREE.Vector3(0, 0, 1).applyQuaternion(q);   // Äußere Blickrichtung des geschlossenen Würfels.

    camera.position.copy(cubeCenter).addScaledVector(outward, S / 2 + close + pull);
  }

  /**
   * Synchronisiert Eingabefreigabe, Sichtbarkeit und ARIA-Zustände der aktiven Würfelseite.
   * @param {number} selected - Kennung der aktuell ausgewählten Würfelperspektive.
   * @param {number} spin - Geglätteter Drehfortschritt zum nächsten Würfelfeld.
   * @returns {void} Kein Rückgabewert.
   */
  function updateActiveFace(selected, spin) {
    faces.forEach(

      /**
       * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
       * @param {object} f - Papierfläche mit HTML-Inhalt und räumlicher Trägergruppe.
       * @returns {void} Kein Rückgabewert.
       */
      f => {

        const on = f.data.id === selected;  // Diese Papierfläche ist aktuell zur Kamera ausgerichtet.

        f.el.classList.toggle('is-current', on);
        f.el.style.zIndex = on ? '20' : '0';
        f.el.classList.remove('net');
        f.el.inert = !on;
        f.el.style.visibility = !on && spin < 0.015 ? 'hidden' : 'visible';
        f.el.setAttribute('aria-hidden', String(!on));
      },
    );
    counter.textContent = `${String(selected + 1).padStart(2, '0')} / 06`;
    instruction.textContent = 'SCROLL TO FLIP ↓';
  }

  /**
   * Koordiniert die geschlossene Würfelansicht und ihre aktive Perspektive.
   * @param {number} phase - Gemeinsame Zeitachse für sechs Ansichten und das Öffnen des Netzes.
   * @returns {void} Kein Rückgabewert.
   */
  function updateClosedCube(phase) {
    fold(1);
    root.quaternion.identity();

    const section = Math.min(5, Math.floor(phase / 1.5));  // Aktuelle Papierstation oder DOM-Abschnitt der archivierten Version.
    const part = (phase - section * 1.5) / 1.5;            // Lokaler Fortschritt innerhalb einer Würfelstation.
    const spin = ease((part - 0.66) / 0.28);               // Geglätteter Drehfortschritt zum nächsten Würfelfeld.
    const next = Math.min(5, section + 1);                 // Nächste Perspektive während des aktuellen Übergangs.

    updateClosedCamera(section, next, spin);

    const selected = spin < 0.5 ? section : next;          // Kennung der aktuell ausgewählten Würfelperspektive.

    if (spin < 0.015) visitedPerspectives.add(selected);
    updateActiveFace(selected, spin);
  }

  /**
   * Führt Rückzug, Ausrichtung und Kameraposition des aufgeklappten Finales zusammen.
   * @param {number} retreat - Rückzugsfortschritt vor der Netzausrichtung.
   * @param {number} turn - Ausrichtungsfortschritt des Würfels vor dem Öffnen der Scharniere.
   * @returns {void} Kein Rückgabewert.
   */
  function alignFinaleCamera(retreat, turn) {

    const tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.23, 0, -0.12));         // Leichte Ausrichtung des Würfels während der finalen Entfaltung.
    const finalCenter = new THREE.Vector3(S * 0.5, 0, 0);                                       // Gemeinsamer Zielmittelpunkt des geöffneten Netzes.
    const netDistance = Math.max(23, 14 / camera.aspect);                                       // Seitenverhältnisabhängiger Kameraabstand zum vollständigen Netz.
    const endPos = new THREE.Vector3(S * 0.5, 0, netDistance);                                  // Endgültige Kameraposition vor dem geöffneten Netz.
    const facePos = poses[5].center
      .clone()
      .add(new THREE.Vector3(0, 0, 5).applyQuaternion(poses[5].quat));                          // Äußere Kameraposition der sechsten Würfelseite.
    const faceQuat = poses[5].quat;                                                             // Kameraausrichtung der sechsten Würfelseite.
    const aligned = facePos.clone().add(new THREE.Vector3(0, 0, 7).applyQuaternion(faceQuat));  // Zurückgezogene Kameraposition vor der Netzausrichtung.

    camera.position.copy(facePos).lerp(aligned, retreat).lerp(endPos, turn);

    const lookQuat = new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().lookAt(endPos, finalCenter, new THREE.Vector3(0, 1, 0)),
    );                                                                                          // Kameraausrichtung auf den Mittelpunkt des geöffneten Netzes.

    camera.quaternion.copy(faceQuat).slerp(lookQuat, turn);
    root.quaternion.copy(tilt.clone().slerp(new THREE.Quaternion(), 1 - turn));
  }

  /**
   * Synchronisiert die sechs verbundenen Papierflächen für das interaktive Netz.
   * @param {number} opening - Nach Rückzug und Ausrichtung einsetzender Scharnier-Öffnungsfortschritt.
   * @returns {void} Kein Rückgabewert.
   */
  function updateNetFaces(opening) {
    faces.forEach(

      /**
       * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
       * @param {object} item - Papierfläche mit HTML-Inhalt und zugehörigen Inhaltsdaten.
       * @returns {void} Kein Rückgabewert.
       */
      item => {
        item.el.classList.toggle('net', opening > 0.75);
        item.el.style.zIndex = '0';
        item.el.classList.toggle('is-current', opening > 0.75);
        item.el.inert = opening <= 0.75;
        item.el.style.visibility = 'visible';
        item.el.setAttribute('aria-hidden', String(opening <= 0.75));
        item.el.dataset.go = String(item.data.id);
      },
    );
  }

  /**
   * Koordiniert Rückzug, Ausrichtung und die zeitlich nachgelagerte Scharnieröffnung.
   * @param {number} phase - Gemeinsame Zeitachse für sechs Ansichten und das Öffnen des Netzes.
   * @returns {void} Kein Rückgabewert.
   */
  function updateUnfoldedNet(phase) {

    const p = clamp((phase - 9) / 0.75);      // Normierter Fortschritt des aktuellen Übergangs.
    const retreat = ease(p / 0.27);           // Rückzugsfortschritt vor der Netzausrichtung.
    const turn = ease((p - 0.24) / 0.34);     // Ausrichtungsfortschritt des Würfels vor dem Öffnen der Scharniere.
    const opening = ease((p - 0.56) / 0.44);  // Nach Rückzug und Ausrichtung einsetzender Scharnier-Öffnungsfortschritt.

    fold(1 - opening);
    alignFinaleCamera(retreat, turn);
    updateNetFaces(opening);
    counter.textContent = '07 / UNFOLDED';
    instruction.textContent = opening > 0.98 ? 'CHOOSE A FACE TO RETURN ↑' : 'SCROLL TO UNFOLD ↓';
  }

  /**
   * Aktualisiert die zugehörige Faltansicht aus dem aktuellen Fortschritt.
   * @param {number} t - Normierter lokaler Interpolationswert.
   * @returns {void} Kein Rückgabewert.
   */
  function update(t) {
    if (!perspectivesCompleted && t >= 0.997 && visitedPerspectives.size === 6) {
      perspectivesCompleted = true;
      document.dispatchEvent(
        new CustomEvent('bp:study-achievement', {
          detail: 'study-fold-perspectives',
        }),
      );
    }

    const phase = t * 9.75;  // Gemeinsame Zeitachse für sechs Ansichten und das Öffnen des Netzes.

    shadow.style.opacity = phase > 9 ? String(ease((phase - 9.53) / 0.17) * 0.38) : '0';
    if (phase < 9) {
      updateClosedCube(phase);
    } else {
      updateUnfoldedNet(phase);
    }
  }
  return {
    update,
  };
}
