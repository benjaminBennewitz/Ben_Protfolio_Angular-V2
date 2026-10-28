/** @file world/roots.js — Prozeduraler Aufbau des zugehörigen Weltbereichs. */

import { createIndexedSurface } from './geometry.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

/**
 * Erzeugt Brettwurzeln, oberirdische Ausläufer und unterirdische Wurzelmasse.
 * @param {object} context - Explizite Abhängigkeiten beziehungsweise aktueller Dateneintrag.
 * @returns {void} Kein Rückgabewert.
 */
export function buildRoots({
  useLayer,
  between,
  vec,
  trunkCenterAt,
  trunkRadiusAt,
  config,
  bark,
  scene,
  barkLight,
  branch,
}) {
  useLayer('buttress');

  /**
   * Berechnet die unregelmäßige Oberflächengeometrie einer Brettwurzel.
   * @param {number} angle - Lokaler Winkel um den Stamm beziehungsweise Geometrieanker.
   * @param {number} height - Höhe des aktuellen Kapitels oder Geometrieabschnitts.
   * @param {unknown} reach - Eingabewert „reach“.
   * @param {number} width - Breite der aktuellen Oberflächenform.
   * @param {number} [lift] - Vertikaler Versatz der Brettwurzelform.
   * @returns {THREE.BufferGeometry} Ergebnis der beschriebenen Operation.
   */
  function createButtressRib(angle, height, reach, width, lift = 0) {

    const positions = [];                                       // Positionspuffer der aktuell erzeugten oder animierten Geometrie.
    const indices = [];                                         // Dreiecksindizes der aktuellen Geometrie.
    const uvs = [];                                             // Texturkoordinaten der aktuellen Oberfläche.
    const sections = 34;                                        // Kapitel des Dokuments beziehungsweise Abschnitte der aktuellen Oberfläche.
    const irregularity = between(0.08, 0.18);                   // Stärke der lokalen Formabweichung.
    const phase = between(0, Math.PI * 2);                      // Feste Zufallsphase der lokalen Form oder Bewegung.
    const radial = vec(Math.cos(angle), 0, Math.sin(angle));    // Radialer Abstand oder Richtungsvektor zur Stammachse.
    const tangent = vec(-Math.sin(angle), 0, Math.cos(angle));  // Tangentialer Richtungsvektor.
    const rowWidth = 7;                                         // Scheitelpunkte je Oberflächenreihe.

    for (let i = 0; i <= sections; i++) {

      const t = i / sections;                                                                         // Normierter Fortschritt entlang des aktuellen Abschnitts.
      const y = -0.22 + t * height + lift * Math.sin(t * Math.PI) * 0.25;                             // Lokale Höhen- beziehungsweise zweite Flächenkoordinate.
      const center = trunkCenterAt(y);                                                                // Mittelpunkt der aktuellen Geometrie beziehungsweise des Viewports.
      const trunkRadius = trunkRadiusAt(Math.max(y, 0));                                              // Lokaler Stammradius.
      const fade = Math.pow(1 - t, 0.92);                                                             // Zum oberen Ende abnehmender Formeinfluss.
      const baseFan = Math.pow(1 - t, 0.56);                                                          // Verbreiterung am Brettwurzelfuß.
      const merge = THREE.MathUtils.smoothstep(1 - t, 0.02, 0.92);                                    // Übergang zwischen Stamm und Brettwurzel.
      const waves =
        1 +
        irregularity *
          (Math.sin(9 * t + phase) * 0.35 +
            Math.sin(17 * t + phase * 0.7) * 0.18 +
            Math.sin(29 * t + phase * 0.43) * 0.09);                                                  // Mehrfrequente lokale Formabweichung.
      const spread = reach * fade * waves;                                                            // Lokale Ausladung der Pflanzen- oder Wurzelform.
      const innerRadius = trunkRadius * (0.8 + 0.18 * fade);                                          // Innerer Anschlussradius.
      const shoulderRadius = trunkRadius * (0.92 + 0.24 * merge) + spread * (0.34 + 0.08 * baseFan);  // Radius der seitlichen Wurzelschulter.
      const outerRadius = trunkRadius * (1.0 + 0.28 * merge) + spread * (1.02 + 0.14 * baseFan);      // Äußerer Anschlussradius.
      const halfWidth =
        (width * (1.02 + 0.78 * baseFan) * (1 + 0.06 * Math.sin(12 * t + phase)) + 0.22) *
        (1 - 0.03 * t);                                                                               // Halbe Breite der aktuellen Form.
      const edgeWidth = halfWidth * 0.94;                                                             // Breite am Flossenrand.
      const shoulderWidth = halfWidth * 0.62;                                                         // Breite an der Flossenschulter.
      const centerWobble = Math.sin(t * 9 + phase) * 0.05;                                            // Seitliche Unregelmäßigkeit des Flossenkamms.
      const pts = [
        center.clone().addScaledVector(radial, innerRadius).addScaledVector(tangent, -edgeWidth),
        center
          .clone()
          .addScaledVector(radial, shoulderRadius)
          .addScaledVector(tangent, -shoulderWidth),
        center
          .clone()
          .addScaledVector(radial, outerRadius * 0.9)
          .addScaledVector(tangent, -halfWidth * 0.16),
        center.clone().addScaledVector(radial, outerRadius).addScaledVector(tangent, centerWobble),
        center
          .clone()
          .addScaledVector(radial, outerRadius * 0.9)
          .addScaledVector(tangent, halfWidth * 0.16),
        center
          .clone()
          .addScaledVector(radial, shoulderRadius)
          .addScaledVector(tangent, shoulderWidth),
        center.clone().addScaledVector(radial, innerRadius).addScaledVector(tangent, edgeWidth),
      ];                                                                                              // Stützpunkte der aktuellen Oberflächenreihe.

      for (const point of pts) positions.push(point.x, point.y, point.z);
      for (const u of [0, 0.14, 0.32, 0.5, 0.68, 0.86, 1]) uvs.push(u, y * 0.15);
      if (i < sections) {

        const a = i * rowWidth;  // Erster Vergleichs- oder Interpolationswert.

        for (let j = 0; j < rowWidth - 1; j++) {
          indices.push(a + j, a + j + 1, a + j + rowWidth);
          indices.push(a + j + 1, a + j + rowWidth + 1, a + j + rowWidth);
        }
      }
    }
    return createIndexedSurface(positions, uvs, indices);
  }

  /**
   * Berechnet die kürzeste vorzeichenbehaftete Winkeldifferenz.
   * @param {number} a - Erster Vergleichs- oder Interpolationswert.
   * @param {number} b - Zweiter Vergleichs- oder Interpolationswert.
   * @returns {number} Berechneter Zahlenwert.
   */
  function angleDelta(a, b) {
    return Math.atan2(Math.sin(a - b), Math.cos(a - b));
  }

  /**
   * Berechnet den gaußförmigen Einfluss einer Brettwurzel auf die Stammhülle.
   * @param {number} theta - Umlaufwinkel der aktuellen Oberfläche.
   * @param {object} spec - Parameter der aktuellen Brettwurzel.
   * @param {number} rowT - Normierter Höhenanteil der Oberfläche.
   * @returns {number} Berechneter Zahlenwert.
   */
  function buttressInfluence(theta, spec, rowT) {

    const diff = Math.abs(angleDelta(theta, spec.angle));  // Betrag der kürzesten Winkeldifferenz.
    const sigma = 0.68 + (1 - rowT) * 0.28;                // Breite des gaußförmigen Brettwurzeleinflusses.

    return Math.exp(-(diff * diff) / (2 * sigma * sigma));
  }

  /**
   * Verbindet die einzelnen Brettwurzelflossen durch eine gemeinsame Stammhülle.
   * @param {Array} specs - Eingabewert „specs“.
   * @returns {THREE.BufferGeometry} Ergebnis der beschriebenen Operation.
   */
  function createButtressWeb(specs) {

    const radialSegments = 88;  // Anzahl der Umfangssegmente der Oberfläche.
    const rows = 15;            // Anzahl der Reihen im Oberflächenraster.
    const positions = [];       // Positionspuffer der aktuell erzeugten oder animierten Geometrie.
    const uvs = [];             // Texturkoordinaten der aktuellen Oberfläche.
    const indices = [];         // Dreiecksindizes der aktuellen Geometrie.

    for (let r = 0; r <= rows; r++) {

      const t = r / rows;                                 // Normierter Fortschritt entlang des aktuellen Abschnitts.
      const y = -0.22 + t * 8.8;                          // Lokale Höhen- beziehungsweise zweite Flächenkoordinate.
      const center = trunkCenterAt(y);                    // Mittelpunkt der aktuellen Geometrie beziehungsweise des Viewports.
      const trunkRadius = trunkRadiusAt(Math.max(y, 0));  // Lokaler Stammradius.

      for (let s = 0; s <= radialSegments; s++) {

        const theta = (s / radialSegments) * Math.PI * 2;       // Umlaufwinkel der aktuellen Oberfläche.
        let flare = trunkRadius * (0.08 + 0.1 * (1 - t));       // Lokale Verbreiterung des Stamm- oder Wurzelfußes.

        for (const spec of specs) {
          flare += spec.reach * 0.46 * Math.pow(1 - t, 1.18) * buttressInfluence(theta, spec, t);
        }
        flare += 0.06 * Math.sin(theta * 5 + t * 4) * (1 - t);

        const radius = trunkRadius * (0.9 + 0.04 * t) + flare;  // Lokaler Radius der aktuellen Geometrie oder Umlaufbahn.
        const x = center.x + Math.cos(theta) * radius;          // Horizontale X-Koordinate des aktuellen Punkts.
        const z = center.z + Math.sin(theta) * radius;          // Räumliche Z-Koordinate des aktuellen Punkts.

        positions.push(x, y, z);
        uvs.push(s / radialSegments, t);
        if (r < rows && s < radialSegments) {

          const a = r * (radialSegments + 1) + s;  // Erster Vergleichs- oder Interpolationswert.

          indices.push(
            a,
            a + radialSegments + 1,
            a + 1,
            a + 1,
            a + radialSegments + 1,
            a + radialSegments + 2,
          );
        }
      }
    }
    return createIndexedSurface(positions, uvs, indices);
  }

  const buttressSpecs = [];                                                    // Brettwurzelparameter.
  const sectorWeights = [1.24, 0.86, 1.08, 0.74, 1.18, 0.92];                  // Gewichtung der Brettwurzelsektoren.

  for (let i = 0; i < config.trunk.buttressCount; i++) {

    const spec = {
      angle: (i * Math.PI * 2) / config.trunk.buttressCount + between(-0.12, 0.12),
      height: between(10.8, 14.6),
      reach: between(3.8, 5.8) * sectorWeights[i % sectorWeights.length],
      width: between(1.0, 1.75) * sectorWeights[i % sectorWeights.length] * 0.88,
      lift: between(-0.14, 0.14),
    };  // Parameter der aktuellen Brettwurzel.

    buttressSpecs.push(spec);
  }

  const buttressWeb = new THREE.Mesh(createButtressWeb(buttressSpecs), bark);  // Verbindende Brettwurzelhülle.

  buttressWeb.material.side = THREE.DoubleSide;
  scene.add(buttressWeb);
  for (const spec of buttressSpecs) {

    const rib = new THREE.Mesh(
      createButtressRib(spec.angle, spec.height, spec.reach, spec.width, spec.lift),
      bark,
    );  // Geometrie einer einzelnen Brettwurzelflosse.

    rib.material.side = THREE.DoubleSide;
    scene.add(rib);
  }
  for (let i = 0; i < buttressSpecs.length; i++) {

    const a = buttressSpecs[i];                               // Erster Vergleichs- oder Interpolationswert.
    const b = buttressSpecs[(i + 1) % buttressSpecs.length];  // Zweiter Vergleichs- oder Interpolationswert.
    const midAngle = Math.atan2(
      Math.sin(a.angle) + Math.sin(b.angle),
      Math.cos(a.angle) + Math.cos(b.angle),
    );                                                        // Winkel zwischen zwei benachbarten Wurzelsektoren.
    const joiner = new THREE.Mesh(
      createButtressRib(
        midAngle,
        Math.min(a.height, b.height) * between(0.58, 0.74),
        (a.reach + b.reach) * between(0.18, 0.28),
        (a.width + b.width) * between(0.34, 0.48),
        between(-0.08, 0.08),
      ),
      i % 2 === 0 ? barkLight : bark,
    );                                                        // Verbindungsvolumen zweier Astabschnitte.

    joiner.material.side = THREE.DoubleSide;
    scene.add(joiner);
  }

  const baseBlendCount = buttressSpecs.length;                                 // Anzahl der verbindenden Wurzelvolumen.

  buildRootCollars();
  useLayer('surfaceRoots');
  buildSurfaceRoots();
  useLayer('underground');
  for (let i = 0; i < 6; i++) {

    const angle = (i * Math.PI * 2) / 6 + between(-0.28, 0.28);          // Lokaler Winkel um den Stamm beziehungsweise Geometrieanker.
    const y = between(-1.7, 1.0);                                        // Lokale Höhen- beziehungsweise zweite Flächenkoordinate.
    const center = trunkCenterAt(Math.max(y, -0.8));                     // Mittelpunkt der aktuellen Geometrie beziehungsweise des Viewports.
    const mound = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1, 1),
      i % 2 === 0 ? bark : barkLight,
    );                                                                   // Einzelner Humushügel.
    const radial = trunkRadiusAt(Math.max(y, 0)) * between(0.42, 0.66);  // Radialer Abstand oder Richtungsvektor zur Stammachse.

    mound.position.set(center.x + Math.cos(angle) * radial, y, center.z + Math.sin(angle) * radial);
    mound.scale.set(between(1.2, 1.95), between(1.6, 3.1), between(1.0, 1.75));
    mound.rotation.set(between(-0.25, 0.25), angle, between(-0.25, 0.25));
    scene.add(mound);
  }
  for (let i = 0; i < 11; i++) {

    const a = (i * Math.PI * 2) / 11 + between(-0.16, 0.16);                                        // Erster Vergleichs- oder Interpolationswert.
    const outer = vec(
      Math.cos(a) * between(8, 17),
      between(-4.8, -0.9),
      Math.sin(a) * between(8, 17),
    );                                                                                              // Äußerer Anschlussbereich der Oberfläche.
    const mid = vec(Math.cos(a) * between(3, 6), between(-2.1, 0.7), Math.sin(a) * between(3, 6));  // Mittlerer Kontrollpunkt der Kurve.
    const curve = new THREE.CatmullRomCurve3([trunkCenterAt(1.8), mid, outer]);                     // Räumliche Kurve für die aktuelle Ast- oder Wurzelform.
    const mesh = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 15, between(0.32, 0.62), 6),
      barkLight,
    );                                                                                              // Aktuell erzeugtes renderbares Geometrieobjekt.

    scene.add(mesh);
    for (let j = 0; j < 4; j++) {

      const tip = outer.clone().add(vec(between(-4, 4), between(-1, -3), between(-4, 4)));  // Spitze des aktuellen Blatts oder Zweigs.

      branch(outer, tip, 0.18, 0.025, bark, 5);
    }
  }

  /**
   * Verbindet benachbarte Brettwurzeln durch unregelmäßige Übergangsvolumen.
   * @returns {void} Kein Rückgabewert.
   */
  function buildRootCollars() {
    for (let i = 0; i < baseBlendCount; i++) {

      const a = buttressSpecs[i];                         // Erster Vergleichs- oder Interpolationswert.
      const b = buttressSpecs[(i + 1) % baseBlendCount];  // Zweiter Vergleichs- oder Interpolationswert.
      const midAngle = Math.atan2(
        Math.sin(a.angle) + Math.sin(b.angle),
        Math.cos(a.angle) + Math.cos(b.angle),
      );                                                  // Winkel zwischen zwei benachbarten Wurzelsektoren.

      for (let j = 0; j < 4; j++) {

        const y = 0.85 + j * 1.25 + between(-0.16, 0.16);      // Lokale Höhen- beziehungsweise zweite Flächenkoordinate.
        const center = trunkCenterAt(y);                       // Mittelpunkt der aktuellen Geometrie beziehungsweise des Viewports.
        const trunkRadius = trunkRadiusAt(y);                  // Lokaler Stammradius.
        const bridge = new THREE.Mesh(
          new THREE.IcosahedronGeometry(1, 1),
          j % 2 === 0 ? bark : barkLight,
        );                                                     // Verbindende Blattmasse zwischen benachbarten Kronenankern.
        const radialOffset = trunkRadius * (0.82 + 0.08 * j);  // Radialer Versatz des aktuellen Ankers.

        bridge.position.set(
          center.x + Math.cos(midAngle) * radialOffset,
          y,
          center.z + Math.sin(midAngle) * radialOffset,
        );
        bridge.scale.set(between(1.25, 2.2), between(0.75, 1.45), between(1.15, 1.95));
        bridge.rotation.set(between(-0.18, 0.18), midAngle, between(-0.22, 0.22));
        scene.add(bridge);
      }
    }
  }

  /**
   * Erzeugt radial auslaufende Wurzeln, die zum Boden hin absinken.
   * @returns {void} Kein Rückgabewert.
   */
  function buildSurfaceRoots() {
    for (let i = 0; i < 13; i++) {

      const angle = (i * Math.PI * 2) / 13 + between(-0.19, 0.19);                      // Lokaler Winkel um den Stamm beziehungsweise Geometrieanker.
      const radial = vec(Math.cos(angle), 0, Math.sin(angle));                          // Radialer Abstand oder Richtungsvektor zur Stammachse.
      const tangent = vec(-Math.sin(angle), 0, Math.cos(angle));                        // Tangentialer Richtungsvektor.
      const center = trunkCenterAt(-0.12);                                              // Mittelpunkt der aktuellen Geometrie beziehungsweise des Viewports.
      const distance = between(5.6, 13.5);                                              // Abstand zwischen den aktuellen räumlichen Positionen.
      const start = center.clone().addScaledVector(radial, trunkRadiusAt(0) * 0.77);    // Startpunkt des aktuellen Kurvenabschnitts.

      start.y = between(0.05, 0.32);

      const mid = start
        .clone()
        .addScaledVector(radial, distance * 0.47)
        .addScaledVector(tangent, between(-0.8, 0.8));                                  // Mittlerer Kontrollpunkt der Kurve.

      mid.y = between(0.12, 0.38);

      const end = start
        .clone()
        .addScaledVector(radial, distance)
        .addScaledVector(tangent, between(-1.3, 1.3));                                  // Endpunkt des aktuellen Kurvenabschnitts.

      end.y = between(-0.29, -0.11);

      const curve = new THREE.CatmullRomCurve3([start, mid, end]);                      // Räumliche Kurve für die aktuelle Ast- oder Wurzelform.
      const radius = between(0.16, 0.35);                                               // Lokaler Radius der aktuellen Geometrie oder Umlaufbahn.
      const root = new THREE.Mesh(new THREE.TubeGeometry(curve, 21, radius, 7), bark);  // DOM-Container der WebGL-Zeichenfläche.

      scene.add(root);
      for (let j = 0; j < 2; j++) {

        const origin = curve.getPoint(between(0.4, 0.8));  // Ausgangsposition der aktuellen Pflanzen- oder Astform.
        const tip = origin
          .clone()
          .addScaledVector(radial, between(1.0, 2.7))
          .addScaledVector(tangent, between(-1.5, 1.5));   // Spitze des aktuellen Blatts oder Zweigs.

        tip.y = -0.23;
        scene.add(
          new THREE.Mesh(
            new THREE.TubeGeometry(
              new THREE.CatmullRomCurve3([
                origin,
                origin
                  .clone()
                  .lerp(tip, 0.5)
                  .add(vec(0, 0.08, 0)),
                tip,
              ]),
              9,
              radius * 0.3,
              5,
            ),
            barkLight,
          ),
        );
      }
    }
  }
}
