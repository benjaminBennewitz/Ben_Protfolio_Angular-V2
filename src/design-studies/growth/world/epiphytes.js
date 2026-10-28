/** @file world/epiphytes.js — Prozeduraler Aufbau des zugehörigen Weltbereichs. */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

/**
 * Erzeugt Aufsitzerpflanzen und die fest verankerten Discovery-Exemplare.
 * @param {object} context - Explizite Abhängigkeiten beziehungsweise aktueller Dateneintrag.
 * @returns {object} Ergebnis der beschriebenen Operation.
 */
export function buildEpiphytes({
  useLayer,
  between,
  trunkCenterAt,
  trunkRadiusAt,
  vec,
  leafMaterials,
  scene,
  betweenInt,
}) {
  useLayer('epiphytes');

  /**
   * Berechnet eine gebogene, gerundete Blattspreite für Aufsitzerpflanzen.
   * @returns {THREE.BufferGeometry} Ergebnis der beschriebenen Operation.
   */
  function createLeafBlade() {

    const positions = [];                         // Positionspuffer der aktuell erzeugten oder animierten Geometrie.
    const indices = [];                           // Dreiecksindizes der aktuellen Geometrie.
    const rows = 8;                               // Anzahl der Reihen im Oberflächenraster.
    const cols = 4;                               // Anzahl der Spalten im Oberflächenraster.

    for (let row = 0; row <= rows; row++) {

      const t = row / rows;                                       // Normierter Fortschritt entlang des aktuellen Abschnitts.
      const width = Math.pow(Math.sin(Math.PI * t), 0.8) * 0.34;  // Breite der aktuellen Oberflächenform.

      for (let col = 0; col <= cols; col++) {

        const u = (col / cols) * 2 - 1;  // Normierte horizontale Textur- oder Flächenkoordinate.

        positions.push(u * width, t * 1.65, Math.sin(Math.PI * t) * 0.19 + 0.11 * (1 - u * u));
      }
    }
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {

        const a = row * (cols + 1) + col;  // Erster Vergleichs- oder Interpolationswert.

        indices.push(a, a + cols + 1, a + 1, a + 1, a + cols + 1, a + cols + 2);
      }
    }

    const geometry = new THREE.BufferGeometry();  // Geometrie des aktuell aufgebauten Szeneobjekts.

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }

  const bladeGeometry = createLeafBlade();                                        // Gemeinsame Geometrie einer Blattspreite.

  buildLeafRosettes();

  const epiphyteLeaf = createLeafBlade();                                         // Gemeinsame Blattgeometrie der Aufsitzer.
  const epiphyteColors = ['#719848', '#90a954', '#567a3e', '#a18449'].map(

    /**
     * Erstellt die gemeinsame Geometrie oder das Material des aktuellen Eintrags.
     * @param {string} color - Eingabewert „color“.
     * @returns {unknown} Ergebnis der beschriebenen Operation.
     */
    color =>
      new THREE.MeshStandardMaterial({
        color,
        side: THREE.DoubleSide,
        roughness: 0.94,
      }),
  );                                                                              // Farbtöne der Aufsitzerpflanzen.
  const redBractMaterials = ['#d94a45', '#ee5a44', '#c93d5f', '#f07d45'].map(

    /**
     * Erstellt die gemeinsame Geometrie oder das Material des aktuellen Eintrags.
     * @param {string} color - Eingabewert „color“.
     * @returns {unknown} Ergebnis der beschriebenen Operation.
     */
    color =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.82,
        side: THREE.DoubleSide,
      }),
  );                                                                              // Rote Farbtöne der Bromelien-Hochblätter.

  /**
   * Ergänzt rote Hochblätter in der Mitte einer Bromelie.
   * @param {object} target - Zielgruppe der zusätzlichen Pflanzengeometrie.
   * @param {number} [bractCount] - Anzahl roter Hochblätter.
   * @param {number} [spread] - Lokale Ausladung der Pflanzen- oder Wurzelform.
   * @returns {void} Kein Rückgabewert.
   */
  function addBromeliadBracts(target, bractCount = 6, spread = 0.28) {
    for (let n = 0; n < bractCount; n++) {

      const bract = new THREE.Mesh(epiphyteLeaf, redBractMaterials[n % redBractMaterials.length]);  // Rotes Hochblatt einer Bromelie.

      bract.position.y = 0.16 + n * 0.06;
      bract.rotation.set(-0.18, (n * Math.PI * 2) / bractCount, -0.18 - (n % 2) * 0.07);
      bract.scale.set(spread, Math.max(0.2, 0.5 - n * 0.03), 0.85);
      target.add(bract);
    }
  }
  buildBromeliadRosettes();

  const bracketMaterials = ['#b58e5b', '#b9a47b', '#805d42', '#c1b69a'].map(

    /**
     * Erstellt die gemeinsame Geometrie oder das Material des aktuellen Eintrags.
     * @param {string} color - Eingabewert „color“.
     * @returns {unknown} Ergebnis der beschriebenen Operation.
     */
    color =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 1,
        side: THREE.DoubleSide,
        flatShading: true,
      }),
  );                                                                              // Farbtöne der Konsolenpilze.
  const bracketGeo = new THREE.SphereGeometry(1, 12, 5, 0, Math.PI, 0, Math.PI);  // Gemeinsame Geometrie der Konsolenpilze.

  for (let i = 0; i < 115; i++) {

    const y = between(0.35, 19.5);                                                          // Lokale Höhen- beziehungsweise zweite Flächenkoordinate.
    const a = between(0, Math.PI * 2);                                                      // Erster Vergleichs- oder Interpolationswert.
    const center = trunkCenterAt(y);                                                        // Mittelpunkt der aktuellen Geometrie beziehungsweise des Viewports.
    const out = vec(Math.cos(a), 0, Math.sin(a));                                           // Ausgabepuffer der aktuellen Geometrieoperation.
    const p = center.clone().addScaledVector(out, trunkRadiusAt(y) + 0.04);                 // Aktueller abgetasteter Kurvenpunkt.
    const fan = new THREE.Mesh(bracketGeo, bracketMaterials[i % bracketMaterials.length]);  // Blattfächer der aktuellen Pflanze.

    fan.position.copy(p);
    fan.rotation.set(between(-0.18, 0.18), -a + Math.PI / 2, between(-0.25, 0.25));
    fan.scale.set(between(0.13, 0.38), between(0.08, 0.15), between(0.16, 0.43));
    scene.add(fan);
  }
  for (let i = 0; i < 170; i++) {

    const y = between(0.2, 20);         // Lokale Höhen- beziehungsweise zweite Flächenkoordinate.
    const a = between(0, Math.PI * 2);  // Erster Vergleichs- oder Interpolationswert.
    const center = trunkCenterAt(y);    // Mittelpunkt der aktuellen Geometrie beziehungsweise des Viewports.
    const p = center.add(
      vec(Math.cos(a) * (trunkRadiusAt(y) + 0.035), 0, Math.sin(a) * (trunkRadiusAt(y) + 0.035)),
    );                                  // Aktueller abgetasteter Kurvenpunkt.

    for (let j = 0; j < 4; j++) {

      const blade = new THREE.Mesh(bladeGeometry, leafMaterials[(i + j) % leafMaterials.length]);  // Einzelne Blattspreite.

      blade.position.copy(p);
      blade.rotation.set(between(-0.5, 0.5), a + between(-0.7, 0.7), between(-1.0, -0.28));
      blade.scale.set(between(0.09, 0.21), between(0.15, 0.32), 0.75);
      scene.add(blade);
    }
  }

  const infoPoints = [];                                                          // Stabile Discovery-Anker mit Höhenfreigabe und Beschriftung.

  /**
   * Registriert ein fest verankertes Pflanzenexemplar samt Discovery-Punkt.
   * @param {string} type - Eingabewert „type“.
   * @param {string} label - Beschriftung des aktuellen Steuerelements.
   * @param {number} height - Höhe des aktuellen Kapitels oder Geometrieabschnitts.
   * @param {number} angle - Lokaler Winkel um den Stamm beziehungsweise Geometrieanker.
   * @param {object} geometry - Geometrie des aktuell aufgebauten Szeneobjekts.
   * @param {object} material - Material der erzeugten Oberfläche.
   * @param {object} scale - Skalierung der aktuellen Geometrieinstanz.
   * @param {unknown} chapterMin - Eingabewert „chapterMin“.
   * @param {unknown} chapterMax - Eingabewert „chapterMax“.
   * @param {object} [options] - Optionale Darstellungseinstellungen des Discovery-Exemplars.
   * @returns {void} Kein Rückgabewert.
   */
  function addSpecimen(
    type,
    label,
    height,
    angle,
    geometry,
    material,
    scale,
    chapterMin,
    chapterMax,
    options = {},
  ) {

    const center = trunkCenterAt(height);                     // Mittelpunkt der aktuellen Geometrie beziehungsweise des Viewports.
    const radial = vec(Math.cos(angle), 0, Math.sin(angle));  // Radialer Abstand oder Richtungsvektor zur Stammachse.
    const specimen = new THREE.Mesh(geometry, material);      // Fest verankerte Discovery-Pflanzengruppe.

    specimen.position.copy(center).addScaledVector(radial, trunkRadiusAt(height) + 0.13);
    specimen.scale.set(...scale);
    specimen.rotation.y = -angle + Math.PI / 2;
    scene.add(specimen);

    const normal = radial.clone();                            // Oberflächennormale der aktuellen Geometrie.
    const anchor = specimen.position
      .clone()
      .addScaledVector(normal, options.markerOffset ?? Math.min(0.24, scale[0] * 0.2))
      .add(options.anchorOffset || vec());                    // Ankerpunkt der aktuellen Geometrie oder Download-Link.

    infoPoints.push({
      type,
      label,
      height,
      position: anchor,
      object: specimen,
      normal,
      chapterMin,
      chapterMax,
      bubbleSide: options.bubbleSide,
      bubbleVertical: options.bubbleVertical,
    });
  }
  {

    const angle = 2.27;                                       // Lokaler Winkel um den Stamm beziehungsweise Geometrieanker.
    const radial = vec(Math.cos(angle), 0, Math.sin(angle));  // Radialer Abstand oder Richtungsvektor zur Stammachse.
    const center = trunkCenterAt(0.92);                       // Mittelpunkt der aktuellen Geometrie beziehungsweise des Viewports.
    const fungus = new THREE.Group();                         // Gruppe eines kleinen Pilzes.

    fungus.position.copy(center).addScaledVector(radial, 6.45);
    fungus.position.y = 1.0;
    for (let n = 0; n < 5; n++) {

      const shelf = new THREE.Mesh(bracketGeo, bracketMaterials[n % bracketMaterials.length]);  // Einzelner Konsolenpilz.

      shelf.position.set((n - 2) * 0.24, n * 0.17, 0.03 + Math.sin(n * 2) * 0.07);
      shelf.scale.set(0.53 + n * 0.04, 0.15, 0.42 + n * 0.035);
      shelf.rotation.y = -0.14 + n * 0.11;
      fungus.add(shelf);
    }
    fungus.rotation.y = -angle + Math.PI / 2;
    scene.add(fungus);
    infoPoints.push({
      type: 'fungi',
      label: 'Fächerpilze',
      height: 1.0,
      position: fungus.position
        .clone()
        .add(vec(0, 0.66, 0))
        .addScaledVector(radial, 0.22),
      object: fungus,
      normal: radial,
      chapterMin: -0.15,
      chapterMax: 5.0,
      bubbleSide: 'right',
      bubbleVertical: 'down',
      skipOcclusion: true,
    });
  }
  addSpecimen(
    'leaves',
    'Aufsitzerpflanzen',
    12.4,
    3.8,
    bladeGeometry,
    leafMaterials[3],
    [0.9, 1.45, 1],
    8.5,
    18,
    {
      bubbleSide: 'left',
      bubbleVertical: 'up',
      anchorOffset: vec(0, 0.12, 0),
    },
  );
  {

    const y = 23.3;                                           // Lokale Höhen- beziehungsweise zweite Flächenkoordinate.
    const angle = 5.2;                                        // Lokaler Winkel um den Stamm beziehungsweise Geometrieanker.
    const center = trunkCenterAt(y);                          // Mittelpunkt der aktuellen Geometrie beziehungsweise des Viewports.
    const plant = new THREE.Group();                          // Gruppe der aktuellen Aufsitzerpflanze.

    plant.position
      .copy(center)
      .add(
        vec(
          Math.cos(angle) * (trunkRadiusAt(y) + 0.16),
          0,
          Math.sin(angle) * (trunkRadiusAt(y) + 0.16),
        ),
      );
    plant.rotation.y = -angle;
    for (let j = 0; j < 11; j++) {

      const leaf = new THREE.Mesh(
        epiphyteLeaf,
        j % 4 === 0 ? epiphyteColors[1] : epiphyteColors[j % epiphyteColors.length],
      );  // Aktuelles Blattobjekt.

      leaf.rotation.set(-0.25, (j * Math.PI * 2) / 11, -0.43);
      leaf.scale.set(0.76, 1.12, 1);
      plant.add(leaf);
    }
    addBromeliadBracts(plant, 7, 0.34);
    scene.add(plant);

    const normal = vec(Math.cos(angle), 0, Math.sin(angle));  // Oberflächennormale der aktuellen Geometrie.

    infoPoints.push({
      type: 'bromeliad',
      label: 'Bromelien',
      height: y,
      position: plant.position
        .clone()
        .addScaledVector(normal, 0.25)
        .add(vec(0, 0.7, 0)),
      object: plant,
      normal,
      chapterMin: 18,
      chapterMax: 29,
      bubbleSide: 'right',
      bubbleVertical: 'up',
    });
  }
  for (let i = 0; i < 26; i++) {

    const y = between(18.5, 31.5);     // Lokale Höhen- beziehungsweise zweite Flächenkoordinate.
    const angle = between(0.55, 2.6);  // Lokaler Winkel um den Stamm beziehungsweise Geometrieanker.
    const center = trunkCenterAt(y);   // Mittelpunkt der aktuellen Geometrie beziehungsweise des Viewports.
    const plant = new THREE.Group();   // Gruppe der aktuellen Aufsitzerpflanze.

    plant.position.set(
      center.x + Math.cos(angle) * (trunkRadiusAt(y) + 0.1),
      y,
      center.z + Math.sin(angle) * (trunkRadiusAt(y) + 0.1),
    );
    plant.rotation.y = -angle;
    for (let j = 0; j < 8; j++) {

      const leaf = new THREE.Mesh(epiphyteLeaf, epiphyteColors[(i + j) % epiphyteColors.length]);  // Aktuelles Blattobjekt.

      leaf.rotation.set(-0.24, (j * Math.PI * 2) / 8, -0.4);
      leaf.scale.set(between(0.52, 0.82), between(0.67, 1.08), 1);
      plant.add(leaf);
    }
    if (i % 2 === 0) addBromeliadBracts(plant, betweenInt(4, 6), between(0.2, 0.28));
    scene.add(plant);
  }
  {

    const y = 31.0;                                           // Lokale Höhen- beziehungsweise zweite Flächenkoordinate.
    const angle = 6.2;                                        // Lokaler Winkel um den Stamm beziehungsweise Geometrieanker.
    const center = trunkCenterAt(y);                          // Mittelpunkt der aktuellen Geometrie beziehungsweise des Viewports.
    const plant = new THREE.Group();                          // Gruppe der aktuellen Aufsitzerpflanze.

    plant.position
      .copy(center)
      .add(
        vec(
          Math.cos(angle) * (trunkRadiusAt(y) + 0.18),
          0,
          Math.sin(angle) * (trunkRadiusAt(y) + 0.18),
        ),
      );
    plant.rotation.y = -angle;
    for (let j = 0; j < 10; j++) {

      const leaf = new THREE.Mesh(epiphyteLeaf, epiphyteColors[(j + 1) % epiphyteColors.length]);  // Aktuelles Blattobjekt.

      leaf.rotation.set(-0.22, (j * Math.PI * 2) / 10, -0.4);
      leaf.scale.set(0.7, 1.0, 1);
      plant.add(leaf);
    }
    addBromeliadBracts(plant, 6, 0.3);
    scene.add(plant);

    const normal = vec(Math.cos(angle), 0, Math.sin(angle));  // Oberflächennormale der aktuellen Geometrie.

    infoPoints.push({
      type: 'symbiosis',
      label: 'Zusammenleben',
      height: y,
      position: plant.position
        .clone()
        .addScaledVector(normal, 0.9)
        .add(vec(0, 0.62, 0)),
      object: plant,
      normal,
      chapterMin: 26,
      chapterMax: 37,
      bubbleSide: 'left',
      bubbleVertical: 'down',
    });
  }
  infoPoints.push({
    type: 'air',
    label: 'Luftreinigung',
    height: 50,
    position: vec(0, 50, 0),
    normal: vec(0, 1, 0),
    chapterMin: 46,
    chapterMax: 58,
    screenAnchor: {
      x: 0.34,
      y: 0.39,
    },
    bubbleSide: 'left',
    bubbleVertical: 'down',
  });

  /**
   * Verteilt grüne Blattrosetten auf der Stammoberfläche.
   * @returns {void} Kein Rückgabewert.
   */
  function buildLeafRosettes() {
    for (let cluster = 0; cluster < 36; cluster++) {

      const y = between(8, 42);                // Lokale Höhen- beziehungsweise zweite Flächenkoordinate.
      const angle = between(0, Math.PI * 2);   // Lokaler Winkel um den Stamm beziehungsweise Geometrieanker.
      const center = trunkCenterAt(y);         // Mittelpunkt der aktuellen Geometrie beziehungsweise des Viewports.
      const radius = trunkRadiusAt(y) + 0.08;  // Lokaler Radius der aktuellen Geometrie oder Umlaufbahn.
      const position = vec(
        center.x + Math.cos(angle) * radius,
        y,
        center.z + Math.sin(angle) * radius,
      );                                       // Räumliche Position des aktuellen Objekts.

      for (let j = 0; j < 9; j++) {

        const blade = new THREE.Mesh(
          bladeGeometry,
          leafMaterials[(cluster + j) % leafMaterials.length],
        );  // Einzelne Blattspreite.

        blade.position
          .copy(position)
          .add(vec(between(-0.06, 0.06), between(-0.08, 0.08), between(-0.06, 0.06)));
        blade.rotation.set(between(-0.28, 0.28), (j * Math.PI * 2) / 9, between(-0.83, 0.83));
        blade.scale.set(between(0.55, 1.2), between(0.6, 1.2), 1);
        scene.add(blade);
      }
    }
  }

  /**
   * Verteilt farbige Bromelienrosetten auf der Stammoberfläche.
   * @returns {void} Kein Rückgabewert.
   */
  function buildBromeliadRosettes() {
    for (let groupIndex = 0; groupIndex < 18; groupIndex++) {

      const height = between(7, 39);          // Höhe des aktuellen Kapitels oder Geometrieabschnitts.
      const angle = between(0, Math.PI * 2);  // Lokaler Winkel um den Stamm beziehungsweise Geometrieanker.
      const center = trunkCenterAt(height);   // Mittelpunkt der aktuellen Geometrie beziehungsweise des Viewports.
      const anchor = vec(
        center.x + Math.cos(angle) * (trunkRadiusAt(height) + 0.09),
        height,
        center.z + Math.sin(angle) * (trunkRadiusAt(height) + 0.09),
      );                                      // Ankerpunkt der aktuellen Geometrie oder Download-Link.
      const rosette = new THREE.Group();      // Blattrosette der aktuellen Pflanze.

      rosette.position.copy(anchor);
      rosette.rotation.y = -angle;
      for (let leafIndex = 0; leafIndex < 7; leafIndex++) {

        const leaf = new THREE.Mesh(
          epiphyteLeaf,
          epiphyteColors[(groupIndex + leafIndex) % epiphyteColors.length],
        );  // Aktuelles Blattobjekt.

        leaf.rotation.set(-0.22, (leafIndex * Math.PI * 2) / 7, -0.35 - (leafIndex % 3) * 0.11);
        leaf.scale.set(between(0.35, 0.72), between(0.42, 0.75), 1);
        rosette.add(leaf);
      }
      if (groupIndex % 2 === 0 || (height > 18 && height < 32 && groupIndex % 3 === 1)) {
        addBromeliadBracts(rosette, betweenInt(5, 7), between(0.22, 0.3));
      }
      scene.add(rosette);
    }
  }
  return {
    infoPoints,
  };
}
