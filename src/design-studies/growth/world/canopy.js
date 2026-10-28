/** @file world/canopy.js — Prozeduraler Aufbau des zugehörigen Weltbereichs. */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

/**
 * Baut Blattmassen, Rindenmoos und abwärts hängende Lianen auf.
 * @param {object} context - Explizite Abhängigkeiten beziehungsweise aktueller Dateneintrag.
 * @returns {object} Ergebnis der beschriebenen Operation.
 */
export function buildCanopy({
  useLayer,
  createCanopyMassGeometry,
  createKapokEdgeSprayGeometry,
  leafMaterials,
  leafAnchors,
  vec,
  betweenInt,
  random,
  between,
  scene,
  trunkCenterAt,
  trunkRadiusAt,
  vineMaterial,
}) {
  useLayer('leaves');

  const canopyMassGeometry = createCanopyMassGeometry();     // Zusammengesetzte Geometrie einer Blattmasse.
  const edgeSprayGeometry = createKapokEdgeSprayGeometry();  // Lockere Blattfächer am Kronenrand.
  const clusterDummy = new THREE.Object3D();                 // Wiederverwendete Transformation einer Blattgruppe.
  const edgeDummy = new THREE.Object3D();                    // Wiederverwendete Transformation eines Randfächers.
  const massMatrices = leafMaterials.map(

    /**
     * Ordnet dem aktuellen Eintrag seinen zugehörigen Zustand zu.
     * @returns {unknown} Ergebnis der beschriebenen Operation.
     */
    () => [],
  );                                                         // Transformationen dichter Blattmassen.
  const edgeMatrices = leafMaterials.map(

    /**
     * Ordnet dem aktuellen Eintrag seinen zugehörigen Zustand zu.
     * @returns {unknown} Ergebnis der beschriebenen Operation.
     */
    () => [],
  );                                                         // Transformationen lockerer Randfächer.

  distributeCanopyMasses();

  const bridgeAnchors = leafAnchors.filter(

    /**
     * Prüft, ob der aktuelle Eintrag in der Auswahl verbleibt.
     * @param {object} anchor - Ankerpunkt der aktuellen Geometrie oder Download-Link.
     * @returns {unknown} Ergebnis der beschriebenen Operation.
     */
    anchor => anchor.kind !== 'quaternary',
  );                                                         // Zwischenanker zum Schließen der Kronenlücken.

  for (let i = 0; i < bridgeAnchors.length; i += 2) {

    const a = bridgeAnchors[i];                                                     // Erster Vergleichs- oder Interpolationswert.
    const b = bridgeAnchors[(i + 1) % bridgeAnchors.length];                        // Zweiter Vergleichs- oder Interpolationswert.
    const distance = a.point.distanceTo(b.point);                                   // Abstand zwischen den aktuellen räumlichen Positionen.

    if (distance > 5.2) continue;

    const midpoint = a.point
      .clone()
      .lerp(b.point, 0.5)
      .add(vec(between(-0.22, 0.22), between(-0.12, 0.18), between(-0.22, 0.22)));  // Interpolierter Mittelpunkt des aktuellen Abschnitts.
    const materialIndex = Math.floor(random() * leafMaterials.length);              // Index des aktuell verwendeten Materialtons.

    clusterDummy.position.copy(midpoint);
    clusterDummy.rotation.set(between(-0.2, 0.2), between(-Math.PI, Math.PI), between(-0.2, 0.2));

    const scale = between(0.82, 1.2);                                               // Skalierung der aktuellen Geometrieinstanz.

    clusterDummy.scale.set(
      scale * between(1.12, 1.38),
      scale * between(0.74, 0.92),
      scale * between(1.04, 1.28),
    );
    clusterDummy.updateMatrix();
    massMatrices[materialIndex].push(clusterDummy.matrix.clone());
  }

  const leaves = [];                                         // Anzahl der Blätter einer Rosette.

  mountCanopyInstances();
  useLayer('moss');

  const mossMaterials = ['#314e2e', '#3d6637', '#567b42'].map(

    /**
     * Erstellt die gemeinsame Geometrie oder das Material des aktuellen Eintrags.
     * @param {string} color - Eingabewert „color“.
     * @returns {unknown} Ergebnis der beschriebenen Operation.
     */
    color =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 1,
        flatShading: true,
      }),
  );                                                         // Farbtöne der Moospolster.
  const mossGeometry = new THREE.IcosahedronGeometry(1, 1);  // Gemeinsame Geometrie eines Moospolsters.
  const mossDummy = new THREE.Object3D();                    // Wiederverwendete Transformation der Moospolster.
  const mossCountPerTone = 390;                              // Anzahl der Moospolster je Materialton.

  mountMossInstances();
  useLayer('vines');
  buildHangingVines();

  /**
   * Verteilt verdichtete Blattmassen und lockere Randfächer an den Astankern.
   * @returns {void} Kein Rückgabewert.
   */
  function distributeCanopyMasses() {
    for (const anchor of leafAnchors) {

      const branchOut = vec(Math.cos(anchor.direction), 0, Math.sin(anchor.direction));  // Radiale Ausladung des aktuellen Asts.
      const massCopies =
        anchor.kind === 'primary-end'
          ? betweenInt(5, 8)
          : anchor.kind === 'leader-tip'
            ? betweenInt(4, 6)
            : anchor.kind === 'secondary'
              ? betweenInt(3, 6)
              : anchor.kind === 'tertiary'
                ? betweenInt(2, 3)
                : betweenInt(1, 2);                                                      // Anzahl dichter Blattmassen am aktuellen Anker.

      for (let i = 0; i < massCopies; i++) {

        const materialIndex = Math.floor(random() * leafMaterials.length);              // Index des aktuell verwendeten Materialtons.
        const localOffset = branchOut
          .clone()
          .multiplyScalar(between(0.06, 0.78) * anchor.size)
          .add(vec(between(-0.34, 0.34), between(-0.16, 0.28), between(-0.34, 0.34)));  // Versatz im lokalen Geometrie-Koordinatensystem.

        clusterDummy.position.copy(anchor.point).add(localOffset);
        clusterDummy.rotation.set(
          between(-0.22, 0.22),
          anchor.direction + between(-0.52, 0.52),
          between(-0.22, 0.22),
        );

        const scale =
          (anchor.kind === 'primary-end'
            ? between(1.0, 1.55)
            : anchor.kind === 'leader-tip'
              ? between(0.9, 1.28)
              : anchor.kind === 'secondary'
                ? between(0.84, 1.2)
                : anchor.kind === 'tertiary'
                  ? between(0.6, 0.84)
                  : between(0.4, 0.58)) * anchor.size;                                  // Skalierung der aktuellen Geometrieinstanz.

        clusterDummy.scale.set(
          scale * between(1.12, 1.45),
          scale * between(0.72, 0.98),
          scale * between(1.0, 1.28),
        );
        clusterDummy.updateMatrix();
        massMatrices[materialIndex].push(clusterDummy.matrix.clone());
      }

      const edgeCount =
        anchor.kind === 'primary-end'
          ? betweenInt(2, 3)
          : anchor.kind === 'leader-tip'
            ? betweenInt(2, 3)
            : anchor.kind === 'secondary'
              ? betweenInt(1, 2)
              : anchor.kind === 'tertiary'
                ? 1
                : anchor.kind === 'quaternary'
                  ? 0
                  : 1;                                                                   // Anzahl lockerer Randfächer.

      for (let i = 0; i < edgeCount; i++) {

        const materialIndex = Math.floor(random() * leafMaterials.length);  // Index des aktuell verwendeten Materialtons.

        edgeDummy.position
          .copy(anchor.point)
          .add(branchOut.clone().multiplyScalar(between(0.18, 0.62) * anchor.size))
          .add(vec(between(-0.1, 0.1), between(-0.04, 0.12), between(-0.1, 0.1)));
        edgeDummy.rotation.set(
          between(-0.16, 0.16),
          anchor.direction + between(-0.34, 0.34),
          between(-0.16, 0.16),
        );

        const scale =
          (anchor.kind === 'primary-end' || anchor.kind === 'leader-tip'
            ? between(0.34, 0.5)
            : anchor.kind === 'secondary'
              ? between(0.24, 0.34)
              : between(0.16, 0.26)) * anchor.size;                         // Skalierung der aktuellen Geometrieinstanz.

        edgeDummy.scale.setScalar(scale);
        edgeDummy.scale.y *= between(0.92, 1.08);
        edgeDummy.updateMatrix();
        edgeMatrices[materialIndex].push(edgeDummy.matrix.clone());
      }
    }
  }

  /**
   * Überträgt vorbereitete Blatttransformationen in InstancedMesh-Gruppen je Material.
   * @returns {void} Kein Rückgabewert.
   */
  function mountCanopyInstances() {
    for (let materialIndex = 0; materialIndex < leafMaterials.length; materialIndex++) {

      const massMesh = new THREE.InstancedMesh(
        canopyMassGeometry,
        leafMaterials[materialIndex],
        massMatrices[materialIndex].length,
      );  // Instanziertes Mesh dichter Blattmassen.

      massMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
      massMatrices[materialIndex].forEach(

        /**
         * Aktualisiert die Darstellung des aktuellen Eintrags.
         * @param {unknown} matrix - Transformation der aktuellen Geometrieinstanz.
         * @param {unknown} index - Index des aktuellen Eintrags.
         * @returns {unknown} Ergebnis der beschriebenen Operation.
         */
        (matrix, index) => massMesh.setMatrixAt(index, matrix),
      );
      massMesh.instanceMatrix.needsUpdate = true;
      massMesh.computeBoundingSphere();
      scene.add(massMesh);
      leaves.push(massMesh);

      const edgeMesh = new THREE.InstancedMesh(
        edgeSprayGeometry,
        leafMaterials[materialIndex],
        edgeMatrices[materialIndex].length,
      );  // Instanziertes Mesh lockerer Randfächer.

      edgeMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
      edgeMatrices[materialIndex].forEach(

        /**
         * Aktualisiert die Darstellung des aktuellen Eintrags.
         * @param {unknown} matrix - Transformation der aktuellen Geometrieinstanz.
         * @param {unknown} index - Index des aktuellen Eintrags.
         * @returns {unknown} Ergebnis der beschriebenen Operation.
         */
        (matrix, index) => edgeMesh.setMatrixAt(index, matrix),
      );
      edgeMesh.instanceMatrix.needsUpdate = true;
      edgeMesh.computeBoundingSphere();
      scene.add(edgeMesh);
      leaves.push(edgeMesh);
    }
  }

  /**
   * Verteilt instanziierte Moospolster entlang des Stamms.
   * @returns {void} Kein Rückgabewert.
   */
  function mountMossInstances() {
    for (let materialIndex = 0; materialIndex < mossMaterials.length; materialIndex++) {

      const moss = new THREE.InstancedMesh(
        mossGeometry,
        mossMaterials[materialIndex],
        mossCountPerTone,
      );  // Einzelnes Moospolster.

      for (let index = 0; index < mossCountPerTone; index++) {

        const height = between(0.25, 21.5);     // Höhe des aktuellen Kapitels oder Geometrieabschnitts.
        const angle = between(0, Math.PI * 2);  // Lokaler Winkel um den Stamm beziehungsweise Geometrieanker.
        const center = trunkCenterAt(height);   // Mittelpunkt der aktuellen Geometrie beziehungsweise des Viewports.
        const trunkX = center.x;                // Stammzentrum auf der X-Achse.
        const trunkZ = center.z;                // Stammzentrum auf der Z-Achse.
        const radius = trunkRadiusAt(height);   // Lokaler Radius der aktuellen Geometrie oder Umlaufbahn.

        mossDummy.position.set(
          trunkX + Math.cos(angle) * (radius + 0.015),
          height,
          trunkZ + Math.sin(angle) * (radius + 0.015),
        );
        mossDummy.quaternion.setFromUnitVectors(
          vec(0, 0, 1),
          vec(Math.cos(angle), 0, Math.sin(angle)),
        );
        mossDummy.rotateZ(between(-0.65, 0.65));
        mossDummy.scale.set(between(0.09, 0.4), between(0.14, 0.62), between(0.025, 0.075));
        mossDummy.updateMatrix();
        moss.setMatrixAt(index, mossDummy.matrix);
      }
      moss.instanceMatrix.needsUpdate = true;
      scene.add(moss);
    }
  }

  /**
   * Erzeugt Lianen mit konsequent abwärts verlaufenden Kontrollpunkten.
   * @returns {void} Kein Rückgabewert.
   */
  function buildHangingVines() {
    for (let i = 0; i < 9; i++) {

      const top = between(14, 38);                                             // Oberer Kontroll- oder Anschlussbereich.
      const angle = between(0, Math.PI * 2);                                   // Lokaler Winkel um den Stamm beziehungsweise Geometrieanker.
      const base = trunkCenterAt(top);                                         // Ausgangsposition oder Grundskala der aktuellen Form.
      const radial = vec(Math.cos(angle), 0, Math.sin(angle));                 // Radialer Abstand oder Richtungsvektor zur Stammachse.
      const anchor = base.addScaledVector(radial, trunkRadiusAt(top) + 0.08);  // Ankerpunkt der aktuellen Geometrie oder Download-Link.
      const length = between(5, 13);                                           // Länge des aktuellen Vektors oder Geometrieabschnitts.
      const points = [];                                                       // Kontrollpunkte der aktuellen Kurve.

      for (let j = 0; j <= 20; j++) {

        const t = j / 20;                                    // Normierter Fortschritt entlang des aktuellen Abschnitts.
        const h = top - length * t;                          // Lokale Höhe der aktuellen Teilgeometrie.
        const center = trunkCenterAt(h);                     // Mittelpunkt der aktuellen Geometrie beziehungsweise des Viewports.
        const outward = trunkRadiusAt(h) + 0.13 + 0.25 * t;  // Radiale Wachstumsrichtung vom Stamm weg.

        points.push(
          vec(
            center.x + radial.x * outward + 0.14 * Math.sin(t * 5 + angle),
            h,
            center.z + radial.z * outward + 0.13 * Math.sin(t * 4 + angle),
          ),
        );
      }
      points[0].copy(anchor);
      scene.add(
        new THREE.Mesh(
          new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 42, 0.025, 5),
          vineMaterial,
        ),
      );
    }
  }
  return {
    mossMaterials,
    mossGeometry,
  };
}
