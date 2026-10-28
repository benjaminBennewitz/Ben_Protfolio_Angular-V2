/** @file world/ground.js — Prozeduraler Aufbau des zugehörigen Weltbereichs. */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

/**
 * Baut Bodenbewuchs, Streu, Steine und unterirdische Detailgeometrie auf.
 * @param {object} context - Explizite Abhängigkeiten beziehungsweise aktueller Dateneintrag.
 * @returns {object} Ergebnis der beschriebenen Operation.
 */
export function buildGround({
  useLayer,
  scene,
  between,
  vec,
  terrainHeight,
  random,
  config,
  barkLight,
  bark,
}) {
  useLayer('groundLife');

  const forestFloorLife = new THREE.Group();                               // Gemeinsame Gruppe des Bodenbewuchses.

  scene.add(forestFloorLife);

  const dirtMaterials = ['#34291b', '#574431', '#766244', '#444832'].map(

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
  );                                                                       // Farbtöne von Steinen und Humus.
  const fernMaterials = ['#30582b', '#497737', '#709247', '#87a251'].map(

    /**
     * Erstellt die gemeinsame Geometrie oder das Material des aktuellen Eintrags.
     * @param {string} color - Eingabewert „color“.
     * @returns {unknown} Ergebnis der beschriebenen Operation.
     */
    color =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.94,
        flatShading: true,
        side: THREE.DoubleSide,
      }),
  );                                                                       // Farbtöne der Farnwedel.
  const mushroomStalk = new THREE.MeshStandardMaterial({
    color: '#d5c9a4',
    roughness: 1,
    flatShading: true,
  });                                                                      // Material kleiner Pilzstiele.
  const mushroomCaps = ['#a36d3e', '#c78b57', '#adac73', '#e2be85'].map(

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
        side: THREE.DoubleSide,
      }),
  );                                                                       // Materialien der Pilzhüte.
  const groundHeight = -0.14;                                              // Tatsächliche Geländeoberkante am Anker.

  /**
   * Bestimmt eine zufällige Position auf der tatsächlichen Geländeoberfläche.
   * @param {number} [minRadius] - Innerer Radius der Platzierungszone.
   * @param {number} [maxRadius] - Äußerer Radius der Platzierungszone.
   * @returns {THREE.Vector3} Ergebnis der beschriebenen Operation.
   */
  function groundPoint(minRadius = 3.6, maxRadius = 18) {

    const a = between(0, Math.PI * 2);                                           // Erster Vergleichs- oder Interpolationswert.
    const r = Math.sqrt(between(minRadius * minRadius, maxRadius * maxRadius));  // Index oder Radius des aktuellen Rings.
    const x = Math.cos(a) * r;                                                   // Horizontale X-Koordinate des aktuellen Punkts.
    const z = Math.sin(a) * r;                                                   // Räumliche Z-Koordinate des aktuellen Punkts.

    return vec(x, terrainHeight(x, z), z);
  }

  /**
   * Platziert eine gebogene Blattspreite mit definierter Breite und Neigung.
   * @param {object} parent - Zielgruppe der neuen Blattspreite.
   * @param {object} origin - Ausgangsposition der aktuellen Pflanzen- oder Astform.
   * @param {number} angle - Lokaler Winkel um den Stamm beziehungsweise Geometrieanker.
   * @param {number} length - Länge des aktuellen Vektors oder Geometrieabschnitts.
   * @param {object} material - Material der erzeugten Oberfläche.
   * @param {number} [width] - Breite der aktuellen Oberflächenform.
   * @param {number} [lean] - Neigung der Blattspreite.
   * @returns {void} Kein Rückgabewert.
   */
  function placeBlade(parent, origin, angle, length, material, width = 0.12, lean = 0.52) {

    const center = origin
      .clone()
      .add(vec(Math.cos(angle) * lean * length, length * 0.62, Math.sin(angle) * lean * length));  // Mittelpunkt der aktuellen Geometrie beziehungsweise des Viewports.
    const tip = origin
      .clone()
      .add(vec(Math.cos(angle) * length * 0.85, length, Math.sin(angle) * length * 0.85));         // Spitze des aktuellen Blatts oder Zweigs.
    const axis = new THREE.CatmullRomCurve3([origin, center, tip]);                                // Lokale Dreh- oder Ausrichtungsachse.
    const points = [];                                                                             // Kontrollpunkte der aktuellen Kurve.
    const indices = [];                                                                            // Dreiecksindizes der aktuellen Geometrie.
    const segments = 7;                                                                            // Anzahl der Kurven- oder Umfangssegmente.

    for (let i = 0; i <= segments; i++) {

      const t = i / segments;                          // Normierter Fortschritt entlang des aktuellen Abschnitts.
      const p = axis.getPoint(t);                      // Aktueller abgetasteter Kurvenpunkt.
      const w = width * Math.sin(Math.PI * t) ** 0.7;  // Lokale Breite der aktuellen Teilgeometrie.

      points.push(p.x - Math.sin(angle) * w, p.y, p.z + Math.cos(angle) * w);
      points.push(p.x + Math.sin(angle) * w, p.y, p.z - Math.cos(angle) * w);
      if (i < segments) {

        const k = i * 2;  // Laufender Index der aktuellen Teilstruktur.

        indices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
      }
    }

    const geometry = new THREE.BufferGeometry();                                                   // Geometrie des aktuell aufgebauten Szeneobjekts.

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    parent.add(new THREE.Mesh(geometry, material));
  }
  buildFerns();
  for (let i = 0; i < 190; i++) {

    const point = groundPoint(2.9, 22);   // Aktueller räumlicher Anker- oder Abtastpunkt.
    const tuft = new THREE.Group();       // Gruppe eines kleinen Bodenstrauchs.
    const blades = i % 6 === 0 ? 12 : 5;  // Anzahl der Blattspreiten.

    for (let j = 0; j < blades; j++) {
      placeBlade(
        tuft,
        vec(between(-0.12, 0.12), 0, between(-0.12, 0.12)),
        (j * Math.PI * 2) / blades + between(-0.17, 0.17),
        between(0.18, i % 6 === 0 ? 1.1 : 0.55),
        fernMaterials[Math.floor(random() * fernMaterials.length)],
        between(0.026, 0.09),
        0.7,
      );
    }
    tuft.position.copy(point);
    forestFloorLife.add(tuft);
  }

  const capGeometry = new THREE.CylinderGeometry(0.07, 0.27, 0.18, 9, 1);  // Gemeinsame Geometrie kleiner Pilzhüte.
  const stalkGeometry = new THREE.CylinderGeometry(0.046, 0.07, 0.48, 7);  // Gemeinsame Geometrie der Pilzstiele.

  buildMushrooms();

  const litterGeometry = new THREE.PlaneGeometry(1, 0.34);                 // Gemeinsame Geometrie der Laubstreu.

  for (let i = 0; i < 210; i++) {

    const point = groundPoint(2.6, 22);                                                      // Aktueller räumlicher Anker- oder Abtastpunkt.
    const litter = new THREE.Mesh(litterGeometry, dirtMaterials[i % dirtMaterials.length]);  // Einzelnes Blatt der Bodenstreu.

    litter.rotation.set(-Math.PI / 2, 0, between(0, Math.PI * 2));
    litter.position.copy(point).add(vec(0, 0.014, 0));
    litter.scale.set(between(0.13, 0.57), between(0.2, 0.8), 1);
    forestFloorLife.add(litter);
  }
  useLayer('stones');

  const surfaceMaterials = ['#3c3528', '#554938', '#776d55', '#403d30'].map(

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
  );                                                                       // Materialien des Bodenbewuchses.
  const pebbleGeometry = new THREE.DodecahedronGeometry(1, 0);             // Gemeinsame Geometrie kleiner Ufersteine.
  const moundGeometry = new THREE.IcosahedronGeometry(1, 1);               // Gemeinsame Geometrie der Humushügel.

  for (let i = 0; i < config.ground.stoneCount; i++) {

    const a = between(0, Math.PI * 2);                                                            // Erster Vergleichs- oder Interpolationswert.
    const r = between(3.6, 26);                                                                   // Index oder Radius des aktuellen Rings.
    const x = Math.cos(a) * r;                                                                    // Horizontale X-Koordinate des aktuellen Punkts.
    const z = Math.sin(a) * r;                                                                    // Räumliche Z-Koordinate des aktuellen Punkts.
    const stone = new THREE.Mesh(pebbleGeometry, surfaceMaterials[i % surfaceMaterials.length]);  // Einzelner Stein der Geländeoberfläche.
    const size = between(0.11, 0.55);                                                             // Texturgröße beziehungsweise lokale Instanzgröße.

    stone.position.set(x, terrainHeight(x, z) + size * 0.13, z);
    stone.scale.set(size * between(0.7, 1.5), size * between(0.25, 0.65), size * between(0.8, 1.5));
    stone.rotation.set(between(-0.3, 0.3), between(0, Math.PI), between(-0.3, 0.3));
    scene.add(stone);
  }
  for (let i = 0; i < config.ground.moundCount; i++) {

    const a = between(0, Math.PI * 2);                                     // Erster Vergleichs- oder Interpolationswert.
    const r = between(4.3, 23);                                            // Index oder Radius des aktuellen Rings.
    const x = Math.cos(a) * r;                                             // Horizontale X-Koordinate des aktuellen Punkts.
    const z = Math.sin(a) * r;                                             // Räumliche Z-Koordinate des aktuellen Punkts.
    const mound = new THREE.Mesh(moundGeometry, surfaceMaterials[i % 2]);  // Einzelner Humushügel.

    mound.position.set(x, terrainHeight(x, z) - 0.06, z);
    mound.scale.set(between(0.55, 1.6), between(0.09, 0.25), between(0.55, 1.4));
    scene.add(mound);
  }
  useLayer('underground');

  const underground = new THREE.Group();                                   // Gruppe der unterirdischen Bodendetails.

  scene.add(underground);

  const soilBandMaterials = ['#352b21', '#473725', '#55422e', '#2e291f'].map(

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
        side: THREE.DoubleSide,
      }),
  );                                                                       // Materialien der unterirdischen Bodenschichten.

  for (let band = 0; band < 3; band++) {

    const y = -1.05 - band * 1.35;  // Lokale Höhen- beziehungsweise zweite Flächenkoordinate.

    for (let i = 0; i < 26; i++) {

      const angle = (i * Math.PI * 2) / 26;  // Lokaler Winkel um den Stamm beziehungsweise Geometrieanker.
      const radius = between(16, 23);        // Lokaler Radius der aktuellen Geometrie oder Umlaufbahn.
      const clod = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1, 0),
        soilBandMaterials[(band + i) % 4],
      );                                     // Kompakter Erdklumpen.

      clod.position.set(
        Math.cos(angle) * radius,
        y + between(-0.32, 0.32),
        Math.sin(angle) * radius,
      );
      clod.scale.set(between(0.65, 2), between(0.17, 0.45), between(0.5, 1.6));
      underground.add(clod);
    }
  }

  const rootFilamentMaterials = ['#665238', '#8b7652', '#4d4330'].map(

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
  );                                                                       // Materialien feiner Wurzelfäden.

  for (let i = 0; i < 170; i++) {

    const angle = between(0, Math.PI * 2);                                                            // Lokaler Winkel um den Stamm beziehungsweise Geometrieanker.
    const r = between(2.4, 17.5);                                                                     // Index oder Radius des aktuellen Rings.
    const start = vec(Math.cos(angle) * r, between(-2.4, -0.4), Math.sin(angle) * r);                 // Startpunkt des aktuellen Kurvenabschnitts.
    const end = start.clone().add(vec(between(-2.7, 2.7), between(-1.9, -0.4), between(-2.7, 2.7)));  // Endpunkt des aktuellen Kurvenabschnitts.
    const middle = start
      .clone()
      .lerp(end, 0.5)
      .add(vec(between(-0.45, 0.45), -0.16, between(-0.45, 0.45)));                                   // Mittlerer Anschlussbereich der Kurve.
    const filament = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([start, middle, end]),
        7,
        between(0.012, 0.045),
        4,
      ),
      rootFilamentMaterials[i % 3],
    );                                                                                                // Dünner Wurzelfaden.

    underground.add(filament);
  }
  for (let i = 0; i < 170; i++) {

    const position = groundPoint(4.5, 19);  // Räumliche Position des aktuellen Objekts.
    const pebble = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1, 0),
      dirtMaterials[i % dirtMaterials.length],
    );                                      // Kleiner Uferstein.

    pebble.position.set(position.x, between(-3.6, -0.6), position.z);
    pebble.scale.set(between(0.035, 0.15), between(0.04, 0.14), between(0.035, 0.16));
    underground.add(pebble);
  }

  const foregroundRoot = new THREE.Group();                                // Große Vordergrundwurzel im unterirdischen Kapitel.

  scene.add(foregroundRoot);

  const rootPath = new THREE.CatmullRomCurve3([
    vec(5.7, -0.9, 4.1),
    vec(6.1, -1.8, 6.0),
    vec(7.0, -3.3, 8.5),
    vec(8.5, -5.2, 10.2),
    vec(10.8, -7.2, 13.0),
  ]);                                                                      // Kurve der großen Vordergrundwurzel.
  const foregroundRootMesh = new THREE.Mesh(
    new THREE.TubeGeometry(rootPath, 35, 0.74, 9, false),
    barkLight,
  );                                                                       // Mesh der großen Vordergrundwurzel.

  foregroundRoot.add(foregroundRootMesh);
  buildForegroundSpurs();
  for (let i = 0; i < 65; i++) {

    const a = between(-0.6, 2.8);  // Erster Vergleichs- oder Interpolationswert.
    const r = between(7, 19);      // Index oder Radius des aktuellen Rings.
    const clod = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1, 0),
      soilBandMaterials[i % soilBandMaterials.length],
    );                             // Kompakter Erdklumpen.

    clod.position.set(Math.cos(a) * r, between(-5.7, -4.2), Math.sin(a) * r);
    clod.scale.set(between(0.3, 1.3), between(0.2, 0.65), between(0.3, 1.4));
    underground.add(clod);
  }

  /**
   * Berechnet einen kontinuierlich verjüngten Ast entlang einer räumlichen Kurve.
   * @param {object} curve - Räumliche Kurve für die aktuelle Ast- oder Wurzelform.
   * @param {number} r0 - Radius am Astanfang.
   * @param {number} r1 - Radius am Astende.
   * @param {object} [material] - Material der erzeugten Oberfläche.
   * @param {number} [rings] - Anzahl der Längsringe der Geometrie.
   * @param {number} [sides] - Anzahl der Umfangssegmente der Geometrie.
   * @returns {THREE.BufferGeometry} Ergebnis der beschriebenen Operation.
   */
  function curvedBranch(curve, r0, r1, material = bark, rings = 18, sides = 9) {

    const vertices = [];                                     // Scheitelpunktpuffer der aktuellen Geometrie.
    const indices = [];                                      // Dreiecksindizes der aktuellen Geometrie.
    const frames = curve.computeFrenetFrames(rings, false);  // Lokale Frenet-Koordinatensysteme entlang der Kurve.

    for (let i = 0; i <= rings; i++) {

      const t = i / rings;                                                                   // Normierter Fortschritt entlang des aktuellen Abschnitts.
      const center = curve.getPointAt(t);                                                    // Mittelpunkt der aktuellen Geometrie beziehungsweise des Viewports.
      const radius = THREE.MathUtils.lerp(r0, r1, t) * (1 + 0.035 * Math.sin(t * Math.PI));  // Lokaler Radius der aktuellen Geometrie oder Umlaufbahn.

      for (let j = 0; j < sides; j++) {

        const angle = (j * 2 * Math.PI) / sides;                                   // Lokaler Winkel um den Stamm beziehungsweise Geometrieanker.
        const normal = frames.normals[i].clone().multiplyScalar(Math.cos(angle));  // Oberflächennormale der aktuellen Geometrie.

        normal.addScaledVector(frames.binormals[i], Math.sin(angle));

        const point = center.clone().addScaledVector(normal, radius);              // Aktueller räumlicher Anker- oder Abtastpunkt.

        vertices.push(point.x, point.y, point.z);
        if (i < rings) {

          const a = i * sides + j;                  // Erster Vergleichs- oder Interpolationswert.
          const b = i * sides + ((j + 1) % sides);  // Zweiter Vergleichs- oder Interpolationswert.

          indices.push(a, b, a + sides, b, b + sides, a + sides);
        }
      }
    }

    const geometry = new THREE.BufferGeometry();             // Geometrie des aktuell aufgebauten Szeneobjekts.

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const mesh = new THREE.Mesh(geometry, material);         // Aktuell erzeugtes renderbares Geometrieobjekt.

    scene.add(mesh);
    return mesh;
  }

  /**
   * Erzeugt gebogene Farnwedel auf dem Waldboden.
   * @returns {void} Kein Rückgabewert.
   */
  function buildFerns() {
    for (let i = 0; i < 68; i++) {

      const point = groundPoint(3.1, 17);  // Aktueller räumlicher Anker- oder Abtastpunkt.
      const fern = new THREE.Group();      // Gruppe eines einzelnen Farns.

      fern.position.copy(point);
      for (let frond = 0; frond < 5; frond++) {

        const angle = (frond * Math.PI * 2) / 5 + between(-0.2, 0.2);  // Lokaler Winkel um den Stamm beziehungsweise Geometrieanker.
        const length = between(0.45, 1.2);                             // Länge des aktuellen Vektors oder Geometrieabschnitts.

        placeBlade(
          fern,
          vec(0, 0, 0),
          angle,
          length,
          fernMaterials[i % fernMaterials.length],
          0.13,
          0.72,
        );
        for (let n = 1; n <= 4; n++) {

          const t = n / 5;  // Normierter Fortschritt entlang des aktuellen Abschnitts.
          const rootlet = vec(
            Math.cos(angle) * length * t * 0.65,
            length * t * 0.68,
            Math.sin(angle) * length * t * 0.65,
          );                // Feine Wurzel im unterirdischen Kapitel.

          for (const side of [-1, 1]) {
            placeBlade(
              fern,
              rootlet,
              angle + side * 1.1,
              length * (0.3 - t * 0.11),
              fernMaterials[(i + n) % fernMaterials.length],
              0.05,
              0.65,
            );
          }
        }
      }
      forestFloorLife.add(fern);
    }
  }

  /**
   * Verteilt Pilze mit getrennten Stiel- und Hutgeometrien.
   * @returns {void} Kein Rückgabewert.
   */
  function buildMushrooms() {
    for (let i = 0; i < 47; i++) {

      const point = groundPoint(3.0, 14);       // Aktueller räumlicher Anker- oder Abtastpunkt.
      const clusterSize = i % 4 === 0 ? 3 : 1;  // Lokale Ausdehnung einer Blattgruppe.

      for (let j = 0; j < clusterSize; j++) {

        const height = between(0.22, 0.67);                                                    // Höhe des aktuellen Kapitels oder Geometrieabschnitts.
        const scale = height / 0.48;                                                           // Skalierung der aktuellen Geometrieinstanz.
        const offset = vec(between(-0.28, 0.28), 0, between(-0.28, 0.28));                     // Schreibposition im zusammengeführten Puffer.
        const stem = new THREE.Mesh(stalkGeometry, mushroomStalk);                             // Stiel oder Stamm der aktuellen Teilform.

        stem.scale.setScalar(scale);
        stem.position
          .copy(point)
          .add(offset)
          .add(vec(0, height * 0.5, 0));
        forestFloorLife.add(stem);

        const cap = new THREE.Mesh(capGeometry, mushroomCaps[(i + j) % mushroomCaps.length]);  // Hut eines einzelnen Pilzes.

        cap.position
          .copy(point)
          .add(offset)
          .add(vec(0, height, 0));
        cap.scale.set(scale, scale * 0.8, scale);
        forestFloorLife.add(cap);
      }
    }
  }

  /**
   * Ergänzt seitliche Ausläufer der großen Vordergrundwurzel.
   * @returns {void} Kein Rückgabewert.
   */
  function buildForegroundSpurs() {
    for (let i = 0; i < 8; i++) {

      const t = 0.15 + i * 0.09;          // Normierter Fortschritt entlang des aktuellen Abschnitts.
      const base = rootPath.getPoint(t);  // Ausgangsposition oder Grundskala der aktuellen Form.
      const angle = i * 2.4;              // Lokaler Winkel um den Stamm beziehungsweise Geometrieanker.
      const tip = base
        .clone()
        .add(
          vec(
            Math.cos(angle) * between(0.6, 1.7),
            between(-1.1, -0.35),
            Math.sin(angle) * between(0.6, 1.8),
          ),
        );                                // Spitze des aktuellen Blatts oder Zweigs.
      const twig = new THREE.Mesh(
        new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3([
            base,
            base
              .clone()
              .lerp(tip, 0.55)
              .add(vec(0, -0.12, 0)),
            tip,
          ]),
          8,
          0.075,
          5,
        ),
        bark,
      );                                  // Feiner Seitenzweig.

      foregroundRoot.add(twig);
    }
  }
  return {
    foregroundRoot,
    curvedBranch,
  };
}
