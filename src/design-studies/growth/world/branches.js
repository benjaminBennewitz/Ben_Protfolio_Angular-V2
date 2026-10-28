/** @file world/branches.js — Prozeduraler Aufbau des zugehörigen Weltbereichs. */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

/**
 * Erzeugt das Astgerüst und sammelt Anker für die spätere Belaubung.
 * @param {object} context - Explizite Abhängigkeiten beziehungsweise aktueller Dateneintrag.
 * @returns {object} Ergebnis der beschriebenen Operation.
 */
export function buildBranches({
  useLayer,
  trunkCenterAt,
  between,
  vec,
  curvedBranch,
  bark,
  betweenInt,
  branch,
  config,
  barkLight,
  random,
}) {
  useLayer('branches');

  const leafAnchors = [];                        // Anschlusspositionen für Blattmassen.
  const majorLeaders = [];                       // Kurven der dominanten Kronenäste.
  const leaderBaseHeights = [32.8, 35.1, 37.1];  // Ansatzhöhen der Hauptäste.
  const leaderAngles = [-0.6, 1.55, 3.65];       // Umlaufwinkel der Hauptäste.

  buildMajorLeaders();

  const primaryBranchTargets = [];               // Ziele der primären Kronenäste.

  buildLeaderTwigs();
  {

    const leader = majorLeaders[1];  // Aktueller dominanter Kronenast.

    for (const fraction of [0.34, 0.57, 0.78]) {

      const start = leader.curve.getPoint(fraction);                                       // Startpunkt des aktuellen Kurvenabschnitts.
      const angle = leader.angle - between(0.38, 0.78);                                    // Lokaler Winkel um den Stamm beziehungsweise Geometrieanker.
      const length = between(5.8, 8.4);                                                    // Länge des aktuellen Vektors oder Geometrieabschnitts.
      const mid = start
        .clone()
        .add(
          vec(Math.cos(angle) * length * 0.49, between(0.35, 1.4), Math.sin(angle) * length * 0.49),
        );                                                                                 // Mittlerer Kontrollpunkt der Kurve.
      const end = start
        .clone()
        .add(vec(Math.cos(angle) * length, between(1.4, 2.8), Math.sin(angle) * length));  // Endpunkt des aktuellen Kurvenabschnitts.
      const curve = new THREE.CatmullRomCurve3([start, mid, end]);                         // Räumliche Kurve für die aktuelle Ast- oder Wurzelform.
      const thickness = leader.thickness * between(0.32, 0.44);                            // Lokale Dicke des aktuellen Asts.

      curvedBranch(curve, thickness, 0.055, bark, 18, 8);
      primaryBranchTargets.push({
        start,
        end,
        angle,
        thickness,
        curve,
      });
      leafAnchors.push({
        point: end.clone(),
        direction: angle,
        size: between(1.0, 1.3),
        kind: 'primary-end',
      });
    }
  }
  buildSideLimbs();
  buildRearLimbs();
  buildBranchFamilies();

  /**
   * Berechnet die gebogene Einzelform eines Kapok-Blättchens.
   * @returns {THREE.BufferGeometry} Ergebnis der beschriebenen Operation.
   */
  function createKapokLeaflet() {

    const positions = [];                         // Positionspuffer der aktuell erzeugten oder animierten Geometrie.
    const indices = [];                           // Dreiecksindizes der aktuellen Geometrie.
    const rows = 9;                               // Anzahl der Reihen im Oberflächenraster.

    for (let row = 0; row <= rows; row++) {

      const t = row / rows;                                                                  // Normierter Fortschritt entlang des aktuellen Abschnitts.
      const width = Math.pow(Math.sin(Math.PI * t), 0.84) * (0.04 + 0.11 * (1 - t * 0.12));  // Breite der aktuellen Oberflächenform.
      const ridge = Math.sin(Math.PI * t) * 0.02;                                            // Unregelmäßige Erhebung der Oberflächenkontur.

      positions.push(-width, t * 1.05, ridge, width, t * 1.05, ridge);
      if (row < rows) {

        const a = row * 2;  // Erster Vergleichs- oder Interpolationswert.

        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }

    const geometry = new THREE.BufferGeometry();  // Geometrie des aktuell aufgebauten Szeneobjekts.

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }

  /**
   * Vereint transformierte Einzelgeometrien zu einem gemeinsamen Positions-/Normalenpuffer.
   * @param {Array} entries - Zu vereinigende Geometrien mit ihren Transformationen.
   * @returns {THREE.BufferGeometry} Ergebnis der beschriebenen Operation.
   */
  function mergeTransformedGeometries(entries) {

    const positions = [];                       // Positionspuffer der aktuell erzeugten oder animierten Geometrie.
    const indices = [];                         // Dreiecksindizes der aktuellen Geometrie.
    let vertexOffset = 0;                       // Indexversatz der nächsten Teilgeometrie.

    for (const entry of entries) {

      const geometry = entry.geometry.clone();        // Geometrie des aktuell aufgebauten Szeneobjekts.

      geometry.applyMatrix4(entry.matrix);

      const pos = geometry.getAttribute('position');  // Abgetastete Position der aktuellen Geometrie.

      for (let i = 0; i < pos.count; i++) positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));

      const index = geometry.getIndex();              // Index des aktuellen Eintrags.

      if (index) {
        for (let i = 0; i < index.count; i++) indices.push(index.array[i] + vertexOffset);
      } else {
        for (let i = 0; i < pos.count; i += 3)
          indices.push(vertexOffset + i, vertexOffset + i + 1, vertexOffset + i + 2);
      }
      vertexOffset += pos.count;
    }

    const merged = new THREE.BufferGeometry();  // Zusammengeführte Geometrie der Einzelblätter.

    merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    merged.setIndex(indices);
    merged.computeVertexNormals();
    return merged;
  }

  /**
   * Setzt eine kompakte Blattmasse aus transformierten Kapok-Blättchen zusammen.
   * @returns {THREE.BufferGeometry} Ergebnis der beschriebenen Operation.
   */
  function createCanopyMassGeometry() {

    const leaflet = createKapokLeaflet();  // Einzelnes Kapok-Blättchen.
    const entries = [];                    // Zu vereinigende Geometrien mit ihren Transformationen.

    for (let i = 0; i < 46; i++) {

      const theta = between(0, Math.PI * 2);                                                          // Umlaufwinkel der aktuellen Oberfläche.
      const radius = Math.pow(random(), 0.56);                                                        // Lokaler Radius der aktuellen Geometrie oder Umlaufbahn.
      const x = Math.cos(theta) * radius * between(0.35, 0.95);                                       // Horizontale X-Koordinate des aktuellen Punkts.
      const z = Math.sin(theta) * radius * between(0.35, 0.9);                                        // Räumliche Z-Koordinate des aktuellen Punkts.
      const y = between(-0.24, 0.34);                                                                 // Lokale Höhen- beziehungsweise zweite Flächenkoordinate.
      const translate = new THREE.Matrix4().makeTranslation(x, y, z);                                 // Verschiebung der zusammengeführten Teilgeometrie.
      const rotY = new THREE.Matrix4().makeRotationY(between(-Math.PI, Math.PI));                     // Drehwinkel um die lokale Y-Achse.
      const rotZ = new THREE.Matrix4().makeRotationZ(between(-1.15, 1.15));                           // Drehwinkel um die lokale Z-Achse.
      const rotX = new THREE.Matrix4().makeRotationX(between(-0.6, 0.38));                            // Drehwinkel um die lokale X-Achse.
      const scale = new THREE.Matrix4().makeScale(
        between(0.42, 0.82),
        between(0.44, 0.86),
        between(0.72, 0.96),
      );                                                                                              // Skalierung der aktuellen Geometrieinstanz.
      const matrix = translate.clone().multiply(rotY).multiply(rotZ).multiply(rotX).multiply(scale);  // Transformation der aktuellen Geometrieinstanz.

      entries.push({
        geometry: leaflet,
        matrix,
      });
    }
    return mergeTransformedGeometries(entries);
  }

  /**
   * Erzeugt lockere Blattfächer für den unregelmäßigen Kronenrand.
   * @returns {THREE.BufferGeometry} Ergebnis der beschriebenen Operation.
   */
  function createKapokEdgeSprayGeometry() {

    const leaflet = createKapokLeaflet();                         // Einzelnes Kapok-Blättchen.
    const entries = [];                                           // Zu vereinigende Geometrien mit ihren Transformationen.
    const directions = [-0.9, -0.55, -0.25, 0, 0.25, 0.55, 0.9];  // Verwendete radiale Wachstumsrichtungen.

    for (let i = 0; i < directions.length; i++) {

      const tilt = directions[i];                                                      // Neigung der aktuellen Pflanzen- oder Blattinstanz.
      const translate = new THREE.Matrix4().makeTranslation(0, 0.14, 0);               // Verschiebung der zusammengeführten Teilgeometrie.
      const rotZ = new THREE.Matrix4().makeRotationZ(tilt);                            // Drehwinkel um die lokale Z-Achse.
      const rotX = new THREE.Matrix4().makeRotationX(-0.12 - Math.abs(tilt) * 0.08);   // Drehwinkel um die lokale X-Achse.
      const scale = new THREE.Matrix4().makeScale(
        0.62 + Math.abs(tilt) * 0.05,
        0.68 + (i === 3 ? 0.08 : 0),
        0.8,
      );                                                                               // Skalierung der aktuellen Geometrieinstanz.
      const matrix = translate.clone().multiply(rotZ).multiply(rotX).multiply(scale);  // Transformation der aktuellen Geometrieinstanz.

      entries.push({
        geometry: leaflet,
        matrix,
      });
    }
    return mergeTransformedGeometries(entries);
  }

  /**
   * Erzeugt die drei dominanten Kronenäste mit ihren primären Anschlusszielen.
   * @returns {void} Kein Rückgabewert.
   */
  function buildMajorLeaders() {
    for (let i = 0; i < 3; i++) {

      const start = trunkCenterAt(leaderBaseHeights[i]);            // Startpunkt des aktuellen Kurvenabschnitts.
      const angle = leaderAngles[i] + between(-0.26, 0.26);         // Lokaler Winkel um den Stamm beziehungsweise Geometrieanker.
      const end = start
        .clone()
        .add(
          vec(
            Math.cos(angle) * between(4.6, 7.2),
            between(8.4, 10.2),
            Math.sin(angle) * between(4.6, 7.2),
          ),
        );                                                          // Endpunkt des aktuellen Kurvenabschnitts.
      const mid = start
        .clone()
        .lerp(end, 0.48)
        .add(
          vec(
            Math.cos(angle + Math.PI * 0.5) * between(-0.8, 0.8),
            between(1.0, 2.4),
            Math.sin(angle + Math.PI * 0.5) * between(-0.8, 0.8),
          ),
        );                                                          // Mittlerer Kontrollpunkt der Kurve.
      const leaderThickness = between(0.92, 1.36);                  // Dicke des dominanten Kronenasts.
      const curve = new THREE.CatmullRomCurve3([start, mid, end]);  // Räumliche Kurve für die aktuelle Ast- oder Wurzelform.

      curvedBranch(curve, leaderThickness, leaderThickness * 0.24, bark, 28, 11);
      majorLeaders.push({
        start,
        mid,
        end,
        angle,
        thickness: leaderThickness,
        curve,
      });

      const tipCount = betweenInt(2, 3);                            // Anzahl der Blattspitzen.

      for (let t = 0; t < tipCount; t++) {

        const tipDir = angle + between(-0.55, 0.55);  // Richtung des abschließenden Zweigs.
        const tipEnd = end
          .clone()
          .add(
            vec(
              Math.cos(tipDir) * between(1.0, 2.8),
              between(1.2, 2.9),
              Math.sin(tipDir) * between(1.0, 2.8),
            ),
          );                                          // Endpunkt des abschließenden Zweigs.

        branch(end, tipEnd, leaderThickness * 0.14, 0.035, bark, 6);
        leafAnchors.push({
          point: tipEnd.clone(),
          direction: tipDir,
          size: between(1.0, 1.35),
          kind: 'leader-tip',
        });
      }
    }
  }

  /**
   * Ergänzt Zweige und Blattanker entlang der dominanten Kronenäste.
   * @returns {void} Kein Rückgabewert.
   */
  function buildLeaderTwigs() {
    for (const leader of majorLeaders) {

      const primaryCount = betweenInt(config.canopy.primaryMin, config.canopy.primaryMax);  // Anzahl primärer Seitenäste.

      for (let i = 0; i < primaryCount; i++) {

        const t = between(0.22, 0.91);                                                              // Normierter Fortschritt entlang des aktuellen Abschnitts.
        const start = leader.curve.getPoint(t);                                                     // Startpunkt des aktuellen Kurvenabschnitts.
        const side = i % 2 === 0 ? 1 : -1;                                                          // Horizontale Ausrichtung des Popovers zum Marker.
        const angle = leader.angle + side * between(0.38, 1.2);                                     // Lokaler Winkel um den Stamm beziehungsweise Geometrieanker.
        const horizontalLength = between(4.5, 8.6) * (1.08 - t * 0.15);                             // Horizontale Ausladung der aktuellen Form.
        const lift = between(0.1, 2.2);                                                             // Vertikaler Versatz der Brettwurzelform.
        const end = start
          .clone()
          .add(vec(Math.cos(angle) * horizontalLength, lift, Math.sin(angle) * horizontalLength));  // Endpunkt des aktuellen Kurvenabschnitts.
        const mid = start
          .clone()
          .lerp(end, 0.58)
          .add(
            vec(
              Math.cos(angle + Math.PI * 0.5) * between(-0.9, 0.9),
              between(0.1, 1.1),
              Math.sin(angle + Math.PI * 0.5) * between(-0.9, 0.9),
            ),
          );                                                                                        // Mittlerer Kontrollpunkt der Kurve.
        const thickness = leader.thickness * between(0.4, 0.62);                                    // Lokale Dicke des aktuellen Asts.
        const curve = new THREE.CatmullRomCurve3([start, mid, end]);                                // Räumliche Kurve für die aktuelle Ast- oder Wurzelform.

        curvedBranch(curve, thickness, thickness * 0.14, bark, 18, 8);
        primaryBranchTargets.push({
          start,
          end,
          angle,
          thickness,
          curve,
        });
        leafAnchors.push({
          point: end.clone(),
          direction: angle,
          size: between(1.18, 1.62),
          kind: 'primary-end',
        });
      }
    }
  }

  /**
   * Ergänzt die seitlichen Astfamilien der Krone.
   * @returns {void} Kein Rückgabewert.
   */
  function buildSideLimbs() {
    for (const [index, side] of [0, 1].entries()) {

      const leader = majorLeaders[index === 0 ? 0 : 2];                               // Aktueller dominanter Kronenast.
      const start = leader.curve.getPoint(index === 0 ? 0.48 : 0.7);                  // Startpunkt des aktuellen Kurvenabschnitts.
      const angle = index === 0 ? -0.16 : -1.1;                                       // Lokaler Winkel um den Stamm beziehungsweise Geometrieanker.
      const mid = start
        .clone()
        .add(vec(Math.cos(angle) * 3.8, between(0.55, 1.5), Math.sin(angle) * 3.8));  // Mittlerer Kontrollpunkt der Kurve.
      const end = start
        .clone()
        .add(
          vec(
            Math.cos(angle) * between(7.5, 9.2),
            between(2.0, 3.6),
            Math.sin(angle) * between(7.5, 9.2),
          ),
        );                                                                            // Endpunkt des aktuellen Kurvenabschnitts.
      const curve = new THREE.CatmullRomCurve3([start, mid, end]);                    // Räumliche Kurve für die aktuelle Ast- oder Wurzelform.
      const thickness = leader.thickness * between(0.32, 0.43);                       // Lokale Dicke des aktuellen Asts.

      curvedBranch(curve, thickness, 0.055, bark, 23, 9);
      primaryBranchTargets.push({
        start,
        end,
        angle,
        thickness,
        curve,
      });
      leafAnchors.push({
        point: end.clone(),
        direction: angle,
        size: 1.3,
        kind: 'primary-end',
      });
    }
  }

  /**
   * Schließt die hinteren Kronenlücken mit zusätzlichen verbundenen Astfamilien.
   * @returns {void} Kein Rückgabewert.
   */
  function buildRearLimbs() {
    for (const fill of [
      {
        leaderIndex: 1,
        t: 0.62,
        angle: -0.48,
        len: 8.7,
        rise: 2.8,
      },
      {
        leaderIndex: 2,
        t: 0.78,
        angle: 0.22,
        len: 7.4,
        rise: 2.2,
      },
    ]) {

      const leader = majorLeaders[fill.leaderIndex];                // Aktueller dominanter Kronenast.
      const start = leader.curve.getPoint(fill.t);                  // Startpunkt des aktuellen Kurvenabschnitts.
      const mid = start
        .clone()
        .add(
          vec(
            Math.cos(fill.angle) * (fill.len * 0.42),
            between(0.5, 1.2),
            Math.sin(fill.angle) * (fill.len * 0.42),
          ),
        );                                                          // Mittlerer Kontrollpunkt der Kurve.
      const end = start
        .clone()
        .add(
          vec(
            Math.cos(fill.angle) * fill.len,
            fill.rise + between(0.2, 0.9),
            Math.sin(fill.angle) * fill.len,
          ),
        );                                                          // Endpunkt des aktuellen Kurvenabschnitts.
      const curve = new THREE.CatmullRomCurve3([start, mid, end]);  // Räumliche Kurve für die aktuelle Ast- oder Wurzelform.
      const thickness = leader.thickness * between(0.31, 0.39);     // Lokale Dicke des aktuellen Asts.

      curvedBranch(curve, thickness, 0.052, bark, 20, 8);
      primaryBranchTargets.push({
        start,
        end,
        angle: fill.angle,
        thickness,
        curve,
      });
      leafAnchors.push({
        point: end.clone(),
        direction: fill.angle,
        size: between(1.2, 1.45),
        kind: 'primary-end',
      });
      for (let b = 0; b < 2; b++) {

        const tt = 0.45 + b * 0.24 + between(-0.06, 0.06);                                      // Zusätzlicher normierter Kurvenparameter.
        const origin = curve.getPoint(tt);                                                      // Ausgangsposition der aktuellen Pflanzen- oder Astform.
        const dir = fill.angle + between(-0.88, 0.88);                                          // Richtungsvektor des aktuellen Seitenasts.
        const branchLen = between(2.0, 3.6);                                                    // Länge des aktuellen Asts.
        const branchEnd = origin
          .clone()
          .add(vec(Math.cos(dir) * branchLen, between(0.12, 0.9), Math.sin(dir) * branchLen));  // Endpunkt des aktuellen Asts.
        const subCurve = new THREE.CatmullRomCurve3([
          origin,
          origin
            .clone()
            .lerp(branchEnd, 0.55)
            .add(vec(0, between(0.12, 0.42), 0)),
          branchEnd,
        ]);                                                                                     // Kurve eines Seitenasts.

        curvedBranch(subCurve, thickness * between(0.36, 0.48), 0.038, bark, 10, 6);
        leafAnchors.push({
          point: branchEnd.clone(),
          direction: dir,
          size: between(0.88, 1.08),
          kind: 'secondary',
        });
      }
    }
  }

  /**
   * Ergänzt sekundäre, tertiäre und feinere Astfamilien an den Primärzielen.
   * @returns {void} Kein Rückgabewert.
   */
  function buildBranchFamilies() {
    for (const primary of primaryBranchTargets) {

      const secondaryCount = betweenInt(config.canopy.secondaryMin, config.canopy.secondaryMax);  // Anzahl sekundärer Seitenäste.

      for (let i = 0; i < secondaryCount; i++) {

        const t = between(0.28, 0.96);                                                        // Normierter Fortschritt entlang des aktuellen Abschnitts.
        const origin = primary.curve.getPoint(t);                                             // Ausgangsposition der aktuellen Pflanzen- oder Astform.
        const dir = primary.angle + between(-1.02, 1.02);                                     // Richtungsvektor des aktuellen Seitenasts.
        const len = between(1.6, 4.4) * (1.03 - t * 0.24);                                    // Länge des aktuellen Kurvenabschnitts.
        const rise = between(-0.1, 1.15);                                                     // Lokaler Höhenzuwachs.
        const end = origin.clone().add(vec(Math.cos(dir) * len, rise, Math.sin(dir) * len));  // Endpunkt des aktuellen Kurvenabschnitts.
        const mid = origin
          .clone()
          .lerp(end, 0.56)
          .add(
            vec(
              Math.cos(dir + Math.PI * 0.5) * between(-0.5, 0.5),
              between(0.02, 0.55),
              Math.sin(dir + Math.PI * 0.5) * between(-0.5, 0.5),
            ),
          );                                                                                  // Mittlerer Kontrollpunkt der Kurve.
        const radius = primary.thickness * between(0.28, 0.42);                               // Lokaler Radius der aktuellen Geometrie oder Umlaufbahn.
        const secondaryCurve = new THREE.CatmullRomCurve3([origin, mid, end]);                // Kurve eines sekundären Asts.

        curvedBranch(secondaryCurve, radius, 0.04, bark, 12, 6);
        leafAnchors.push({
          point: end.clone(),
          direction: dir,
          size: between(0.92, 1.22),
          kind: 'secondary',
        });

        const spurCount = betweenInt(1, 2);                                                   // Anzahl seitlicher Wurzelausläufer.

        for (let s = 0; s < spurCount; s++) {

          const spurDir = dir + between(-0.72, 0.72);  // Richtung eines Wurzelausläufers.
          const spurEnd = end
            .clone()
            .add(
              vec(
                Math.cos(spurDir) * between(0.9, 2.1),
                between(-0.06, 0.52),
                Math.sin(spurDir) * between(0.9, 2.1),
              ),
            );                                         // Endpunkt eines Wurzelausläufers.

          branch(end, spurEnd, between(0.06, 0.1), 0.02, bark, 5, {
            startJoint: true,
            endJoint: false,
            startJointScale: 1.05,
            startRandomness: 0.08,
          });
          leafAnchors.push({
            point: spurEnd.clone(),
            direction: spurDir,
            size: between(0.52, 0.78),
            kind: 'tertiary',
          });
        }

        const tertiaryCount = betweenInt(2, 4);                                               // Anzahl tertiärer Seitenäste.

        for (let j = 0; j < tertiaryCount; j++) {

          const tt = between(0.4, 0.98);                   // Zusätzlicher normierter Kurvenparameter.
          const twigOrigin = secondaryCurve.getPoint(tt);  // Ansatzpunkt eines kleinen Zweigs.
          const twigDir = dir + between(-1.0, 1.0);        // Richtung eines kleinen Zweigs.
          const twigLen = between(0.8, 1.9);               // Länge eines kleinen Zweigs.
          const twigEnd = twigOrigin
            .clone()
            .add(
              vec(Math.cos(twigDir) * twigLen, between(-0.06, 0.45), Math.sin(twigDir) * twigLen),
            );                                             // Endpunkt eines kleinen Zweigs.

          branch(twigOrigin, twigEnd, between(0.045, 0.075), 0.015, bark, 5);
          leafAnchors.push({
            point: twigEnd.clone(),
            direction: twigDir,
            size: between(0.58, 0.88),
            kind: 'tertiary',
          });

          const quaternaryCount = betweenInt(1, 2);        // Anzahl feinster Seitenäste.

          for (let q = 0; q < quaternaryCount; q++) {

            const qDir = twigDir + between(-1.08, 1.08);  // Richtung des feinsten Seitenasts.
            const qEnd = twigEnd
              .clone()
              .add(
                vec(
                  Math.cos(qDir) * between(0.45, 1.15),
                  between(-0.04, 0.28),
                  Math.sin(qDir) * between(0.45, 1.15),
                ),
              );                                          // Endpunkt des feinsten Seitenasts.

            branch(twigEnd, qEnd, between(0.018, 0.03), 0.008, barkLight, 5, {
              startJoint: true,
              endJoint: false,
              startJointScale: 1.18,
              startSquash: 1.02,
              startRandomness: 0.08,
            });
            leafAnchors.push({
              point: qEnd.clone(),
              direction: qDir,
              size: between(0.38, 0.58),
              kind: 'quaternary',
            });
          }
        }
      }
    }
  }
  return {
    leafAnchors,
    createCanopyMassGeometry,
    createKapokEdgeSprayGeometry,
  };
}
