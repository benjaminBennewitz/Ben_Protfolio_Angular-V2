/** @file camera-flight.js — Kapselt Kamerafortschritt, Blickführung und den Zustand des Aufstiegs-Achievements. */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

/**
 * Kapselt Kamerafortschritt, Blickführung und den Zustand des Aufstiegs-Achievements.
 * @param {object} context - Explizite Abhängigkeiten beziehungsweise aktueller Dateneintrag.
 * @returns {object} Ergebnis der beschriebenen Operation.
 */
export function createCameraFlight({ camera, scene, sun, sections, reducedMotion }) {

  let positionProgress = 0;     // Aktuell geglätteter Fortschritt der Kamerafahrt.
  let ascentStarted = false;    // Die Kamera hat den Beginn des Aufstiegs erreicht.
  let ascentCompleted = false;  // Das Aufstiegs-Achievement wurde bereits ausgelöst.
  let ascentReady = false;      // Der Seitenstart hat die Aufstiegsprüfung freigegeben.

  /**
   * Berechnet und sortiert die Scroll- und Höhenanker der Kapitel.
   * @param {number} scrollRange - Nutzbarer Scrollbereich des Dokuments.
   * @returns {Array<object>} Ergebnis der beschriebenen Operation.
   */
  function chapterAnchors(scrollRange) {

    const anchors = sections
      .map(

        /**
         * Berechnet den Zielwert für den aktuellen Geometrie- oder Dateneintrag.
         * @param {HTMLElement} section - Aktuell geprüftes Kapitel.
         * @returns {unknown} Ergebnis der beschriebenen Operation.
         */
        section => ({
          scroll: Math.min(
            scrollRange,
            Math.max(0, section.offsetTop + (section.offsetHeight - window.innerHeight) / 2),
          ),
          height: Number(section.dataset.height),
        }),
      )
      .sort(

        /**
         * Vergleicht zwei Einträge für die aufsteigende Reihenfolge.
         * @param {object} a - Erster Vergleichs- oder Interpolationswert.
         * @param {object} b - Zweiter Vergleichs- oder Interpolationswert.
         * @returns {number} Berechneter Zahlenwert.
         */
        (a, b) => a.scroll - b.scroll,
      );  // Nach Scrollposition sortierte Kapitel-Höhenanker.

    return anchors;
  }

  /**
   * Interpoliert die Kamerahöhe anhand der realen Kapitelpositionen im Dokument.
   * @param {number} progress - Normierter Fortschritt der Kamerafahrt.
   * @returns {number} Berechneter Zahlenwert.
   */
  function cameraHeightForProgress(progress) {

    const scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);  // Nutzbarer Scrollbereich des Dokuments.
    const scrollY = (1 - progress) * scrollRange;                                                 // Scrollposition zum angegebenen Fortschritt.
    const anchors = chapterAnchors(scrollRange);                                                  // Nach Scrollposition sortierte Kapitel-Höhenanker.

    if (scrollY <= anchors[0].scroll) return anchors[0].height;
    for (let i = 1; i < anchors.length; i++) {
      if (scrollY <= anchors[i].scroll) {

        const a = anchors[i - 1];  // Erster Vergleichs- oder Interpolationswert.
        const b = anchors[i];      // Zweiter Vergleichs- oder Interpolationswert.
        const t = THREE.MathUtils.clamp(
          (scrollY - a.scroll) / Math.max(1, b.scroll - a.scroll),
          0,
          1,
        );                         // Normierter Fortschritt entlang des aktuellen Abschnitts.

        return THREE.MathUtils.lerp(a.height, b.height, t);
      }
    }
    return anchors[anchors.length - 1].height;
  }

  /**
   * Passt Hintergrund, Nebelfarbe und Sonnenintensität an die Kamerahöhe an.
   * @param {number} height - Höhe des aktuellen Kapitels oder Geometrieabschnitts.
   * @returns {void} Kein Rückgabewert.
   */
  function updateLighting(height) {

    const sky = new THREE.Color('#718f85');        // Himmelsfarbe oberhalb der Krone.
    const forest = new THREE.Color('#193324');     // Hintergrundfarbe im Wald.
    const soilColor = new THREE.Color('#100d09');  // Hintergrundfarbe im unterirdischen Wurzelraum.
    let background;                                // Aus der Kamerahöhe interpolierte Hintergrundfarbe.

    if (height < 1)
      background = soilColor.clone().lerp(forest, THREE.MathUtils.smoothstep(height, -3, 1));
    else background = forest.clone().lerp(sky, THREE.MathUtils.smoothstep(height, 39, 63));
    scene.background.copy(background);
    scene.fog.color.copy(background);
    scene.fog.density = height < 2 ? 0.014 : height > 40 ? 0.009 : 0.014;
    sun.intensity = THREE.MathUtils.lerp(1.7, 4, THREE.MathUtils.smoothstep(height, 0, 63));
  }

  /**
   * Richtet den Blick mit weichen Übergängen zwischen Wurzelraum und Krone aus.
   * @param {number} height - Höhe des aktuellen Kapitels oder Geometrieabschnitts.
   * @returns {void} Kein Rückgabewert.
   */
  function aimCamera(height) {

    const lowerLook = THREE.MathUtils.lerp(
      -1.5,
      height + 2.7,
      THREE.MathUtils.smoothstep(height, 0.6, 7),
    );                                                                                         // Blickhöhe im Übergang vom Wurzelraum zum Stamm.
    const upperLook = THREE.MathUtils.lerp(
      height + 2.7,
      height - 7,
      THREE.MathUtils.smoothstep(height, 44, 52),
    );                                                                                         // Blickhöhe im Übergang zur oberen Krone.
    const lookHeight =
      height <= 44
        ? lowerLook
        : height <= 52
          ? upperLook
          : THREE.MathUtils.lerp(height - 7, 44, THREE.MathUtils.smoothstep(height, 52, 58));  // Interpolierte Zielhöhe der Kameraausrichtung.

    camera.lookAt(Math.sin(height * 0.075) * 0.7, lookHeight, Math.cos(height * 0.064) * 0.46);
  }

  /**
   * Berechnet die räumliche Kameraposition auf der höhenabhängigen Umlaufbahn.
   * @param {number} height - Höhe des aktuellen Kapitels oder Geometrieabschnitts.
   * @returns {void} Kein Rückgabewert.
   */
  function positionCamera(height) {

    const orbit = 1.8 + Math.min((height + 3) / 59, 1) * Math.PI * 2.45;  // Höhenabhängiger Umlaufwinkel der Kamera.
    const radius =
      height > 54
        ? THREE.MathUtils.lerp(23, 29, THREE.MathUtils.clamp((height - 54) / 9, 0, 1))
        : height > 34
          ? THREE.MathUtils.lerp(11, 23, (height - 34) / 22)
          : 11;                                                           // Lokaler Radius der aktuellen Geometrie oder Umlaufbahn.
    const entryPullback =
      2.8 *
      THREE.MathUtils.smoothstep(height, -1, 1.5) *
      (1 - THREE.MathUtils.smoothstep(height, 7, 11));                    // Zusätzlicher Kameraabstand beim Eintritt in den Waldboden.
    const cameraRadius = radius + entryPullback;                          // Umlaufradius einschließlich des Eintrittsabstands.

    camera.position.set(Math.cos(orbit) * cameraRadius, height, Math.sin(orbit) * cameraRadius);
  }

  /**
   * Registriert den vollständig durchlaufenen Aufstieg genau einmal.
   * @param {number} height - Höhe des aktuellen Kapitels oder Geometrieabschnitts.
   * @returns {void} Kein Rückgabewert.
   */
  function updateAscent(height) {
    if (ascentReady && height <= 1) ascentStarted = true;
    if (ascentStarted && !ascentCompleted && height >= 60) {
      ascentCompleted = true;
      document.dispatchEvent(
        new CustomEvent('bp:study-achievement', {
          detail: 'study-growth-ascent',
        }),
      );
    }
  }

  /**
   * Aktualisiert Kamerafortschritt, Blickführung, Beleuchtung und Aufstiegsstatus.
   * @param {number} desiredProgress - Aus dem Dokument bestimmte Zielposition der Kamerafahrt.
   * @param {number} delta - Auf 50 Millisekunden begrenzte vergangene Frame-Zeit in Sekunden.
   * @returns {object} Ergebnis der beschriebenen Operation.
   */
  function update(desiredProgress, delta) {
    positionProgress = reducedMotion.matches
      ? desiredProgress
      : THREE.MathUtils.damp(positionProgress, desiredProgress, 3.2, delta);

    const height = cameraHeightForProgress(positionProgress);  // Höhe des aktuellen Kapitels oder Geometrieabschnitts.

    updateAscent(height);
    positionCamera(height);
    aimCamera(height);
    updateLighting(height);
    return {
      height,
      progress: positionProgress,
    };
  }

  /**
   * Gibt den Aufstieg frei und synchronisiert den Startfortschritt mit dem Dokument.
   * @param {number} progress - Normierter Fortschritt der Kamerafahrt.
   * @returns {void} Kein Rückgabewert.
   */
  function start(progress) {
    ascentReady = true;
    positionProgress = progress;
  }
  return {
    update,
    start,
  };
}
