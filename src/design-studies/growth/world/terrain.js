/** @file world/terrain.js — Prozeduraler Aufbau des zugehörigen Weltbereichs. */

import { createIndexedSurface } from './geometry.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

/**
 * Erzeugt Gelände, Teich, Ufer und die Decke des unterirdischen Wurzelraums.
 * @param {object} context - Explizite Abhängigkeiten beziehungsweise aktueller Dateneintrag.
 * @returns {object} Ergebnis der beschriebenen Operation.
 */
export function buildTerrain({ useLayer, earth, scene, vec, between, betweenInt }) {
  useLayer('terrain');

  const soil = new THREE.Mesh(new THREE.CylinderGeometry(23, 24, 2.1, 40), earth);         // Teilfläche der unterirdischen Erdwand.

  soil.position.y = -5.8;
  scene.add(soil);

  const swampCenter = vec(7.4, 0, 6.2);                                                    // Mittelpunkt der elliptischen Feuchtzone.

  /**
   * Berechnet die lokale Absenkung des Geländes für die Feuchtzone.
   * @param {number} x - Horizontale X-Koordinate des aktuellen Punkts.
   * @param {number} z - Räumliche Z-Koordinate des aktuellen Punkts.
   * @returns {number} Berechneter Zahlenwert.
   */
  function swampDepth(x, z) {

    const dx = (x - swampCenter.x) / 8.4;        // Horizontaler Richtungsanteil auf der X-Achse.
    const dz = (z - swampCenter.z) / 5.8;        // Horizontaler Richtungsanteil auf der Z-Achse.
    const ellipse = dx * dx + dz * dz;           // Elliptische Anpassung der Teichkontur.

    if (ellipse >= 1) return 0;

    const falloff = Math.pow(1 - ellipse, 1.7);  // Zum Rand abnehmender Formeinfluss.

    return falloff * 0.68;
  }

  /**
   * Berechnet die Geländeoberkante einschließlich Bodenschwankungen und Teichmulde.
   * @param {number} x - Horizontale X-Koordinate des aktuellen Punkts.
   * @param {number} z - Räumliche Z-Koordinate des aktuellen Punkts.
   * @returns {number} Berechneter Zahlenwert.
   */
  function terrainHeight(x, z) {

    const distance = Math.hypot(x, z);                             // Abstand zwischen den aktuellen räumlichen Positionen.
    const fade = 1 - THREE.MathUtils.smoothstep(distance, 8, 29);  // Zum oberen Ende abnehmender Formeinfluss.
    const base =
      -0.14 +
      fade *
        (0.17 * Math.sin(x * 0.57) * Math.cos(z * 0.49) +
          0.09 * Math.sin(x * 1.34 + z * 0.38) +
          0.06 * Math.cos(z * 1.92 - x * 0.41));                   // Ausgangsposition oder Grundskala der aktuellen Form.

    return base - swampDepth(x, z);
  }

  /**
   * Berechnet die verformte Geländeoberfläche mit lokal abgesenkter Feuchtzone.
   * @returns {THREE.BufferGeometry} Ergebnis der beschriebenen Operation.
   */
  function createTerrain() {

    const rings = 38;      // Anzahl der Längsringe der Geometrie.
    const sides = 96;      // Anzahl der Umfangssegmente der Geometrie.
    const positions = [];  // Positionspuffer der aktuell erzeugten oder animierten Geometrie.
    const uvs = [];        // Texturkoordinaten der aktuellen Oberfläche.
    const indices = [];    // Dreiecksindizes der aktuellen Geometrie.

    for (let r = 0; r <= rings; r++) {

      const radius = 1.9 + ((100 - 1.9) * r) / rings;  // Lokaler Radius der aktuellen Geometrie oder Umlaufbahn.

      for (let s = 0; s <= sides; s++) {

        const angle = (s * 2 * Math.PI) / sides;  // Lokaler Winkel um den Stamm beziehungsweise Geometrieanker.
        const x = Math.cos(angle) * radius;       // Horizontale X-Koordinate des aktuellen Punkts.
        const z = Math.sin(angle) * radius;       // Räumliche Z-Koordinate des aktuellen Punkts.

        positions.push(x, terrainHeight(x, z), z);
        uvs.push(x * 0.06, z * 0.06);
        if (r < rings && s < sides) {

          const a = r * (sides + 1) + s;  // Erster Vergleichs- oder Interpolationswert.

          indices.push(a, a + sides + 1, a + 1, a + 1, a + sides + 1, a + sides + 2);
        }
      }
    }
    return createIndexedSurface(positions, uvs, indices);
  }

  const floor = new THREE.Mesh(
    createTerrain(),
    new THREE.MeshStandardMaterial({
      color: '#273124',
      roughness: 1,
      side: THREE.DoubleSide,
      flatShading: true,
    }),
  );                                                                                       // Unterer Abschluss des Wurzelraums.

  scene.add(floor);

  /**
   * Berechnet eine fein unterteilte Teichfläche mit stabiler Uferhöhe.
   * @param {number} [radius] - Lokaler Radius der aktuellen Geometrie oder Umlaufbahn.
   * @param {number} [rings] - Anzahl der Längsringe der Geometrie.
   * @param {number} [sectors] - Anzahl der Umfangssegmente.
   * @returns {THREE.BufferGeometry} Ergebnis der beschriebenen Operation.
   */
  function makePondGeometry(radius = 5.9, rings = 54, sectors = 96) {

    const vertices = [0, 0, 0];              // Scheitelpunktpuffer der aktuellen Geometrie.
    const uv = [0.5, 0.5];                   // Texturkoordinate des aktuellen Scheitelpunkts.
    const triangles = [];                    // Dreiecksflächen der aktuellen Geometrie.

    for (let ring = 1; ring <= rings; ring++) {

      const distance = (radius * ring) / rings;  // Abstand zwischen den aktuellen räumlichen Positionen.

      for (let section = 0; section < sectors; section++) {

        const angle = (section / sectors) * Math.PI * 2;  // Lokaler Winkel um den Stamm beziehungsweise Geometrieanker.
        const x = Math.cos(angle) * distance;             // Horizontale X-Koordinate des aktuellen Punkts.
        const y = Math.sin(angle) * distance;             // Lokale Höhen- beziehungsweise zweite Flächenkoordinate.

        vertices.push(x, y, 0);
        uv.push((x / radius + 1) / 2, (y / radius + 1) / 2);
      }
    }
    for (let section = 0; section < sectors; section++) {
      triangles.push(0, 1 + section, 1 + ((section + 1) % sectors));
    }
    for (let ring = 1; ring < rings; ring++) {

      const current = 1 + (ring - 1) * sectors;  // Aktueller Anschluss des verfolgten Pfads.
      const next = current + sectors;            // Nächster Anschluss- oder Interpolationspunkt.

      for (let section = 0; section < sectors; section++) {

        const nextSection = (section + 1) % sectors;  // Nächster Kurvenabschnitt.

        triangles.push(current + section, next + section, current + nextSection);
        triangles.push(current + nextSection, next + section, next + nextSection);
      }
    }

    const geo = new THREE.BufferGeometry();  // Geometrie der aktuellen Teilstruktur.

    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(triangles);
    geo.computeVertexNormals();
    return geo;
  }

  const swampWaterGeometry = makePondGeometry();                                           // Fein unterteilte Wassergeometrie.
  const swampWater = new THREE.Mesh(
    swampWaterGeometry,
    new THREE.MeshPhysicalMaterial({
      color: '#536e59',
      roughness: 0.18,
      metalness: 0,
      transmission: 0.06,
      transparent: true,
      opacity: 0.94,
      clearcoat: 0.63,
      side: THREE.DoubleSide,
    }),
  );                                                                                       // Mesh der Wasserfläche.

  swampWater.rotation.x = -Math.PI / 2;
  swampWater.position.set(swampCenter.x, -0.17, swampCenter.z);
  swampWater.scale.set(1.38, 1.0, 1);
  scene.add(swampWater);

  const swampWaterPositions = swampWaterGeometry.attributes.position;                      // Verformbarer Wasser-Positionspuffer.
  const swampWaterBasePositions = Float32Array.from(swampWaterPositions.array);            // Unveränderte Wasser-Ausgangspositionen.
  const swampWaterState = {
    mesh: swampWater,
    positions: swampWaterPositions,
    basePositions: swampWaterBasePositions,
  };                                                                                       // Wassermesh mit unverformten und animierten Positionspuffern.
  const floatingWaterLeaves = [];                                                          // Schwimmende Blätter mit stabilen Bewegungsankern.
  const waterLeafShape = new THREE.Shape();                                                // Umriss eines schwimmenden Blatts.

  waterLeafShape.moveTo(0, 0.32);
  waterLeafShape.quadraticCurveTo(0.22, 0.18, 0.15, -0.05);
  waterLeafShape.quadraticCurveTo(0, -0.32, -0.15, -0.05);
  waterLeafShape.quadraticCurveTo(-0.22, 0.18, 0, 0.32);

  const waterLeafGeo = new THREE.ShapeGeometry(waterLeafShape);                            // Gemeinsame Geometrie schwimmender Blätter.
  const waterLeafMats = ['#6d8a48', '#879d58', '#5d783d'].map(

    /**
     * Erstellt die gemeinsame Geometrie oder das Material des aktuellen Eintrags.
     * @param {string} color - Eingabewert „color“.
     * @returns {unknown} Ergebnis der beschriebenen Operation.
     */
    color =>
      new THREE.MeshStandardMaterial({
        color,
        side: THREE.DoubleSide,
        roughness: 0.95,
      }),
  );                                                                                       // Farbtöne der schwimmenden Blätter.

  buildFloatingLeaves();

  /**
   * Berechnet einen unregelmäßigen Uferstreifen entlang des elliptischen Teichs.
   * @param {number} inner - Innerer Radius des Uferstreifens.
   * @param {number} outer - Äußerer Anschlussbereich der Oberfläche.
   * @param {number} [yOffset] - Vertikaler Abstand zur Geländeoberfläche.
   * @returns {THREE.BufferGeometry} Ergebnis der beschriebenen Operation.
   */
  function createShoreBand(inner, outer, yOffset = 0.022) {

    const segments = 128;                         // Anzahl der Kurven- oder Umfangssegmente.
    const rings = 7;                              // Anzahl der Längsringe der Geometrie.
    const positions = [];                         // Positionspuffer der aktuell erzeugten oder animierten Geometrie.
    const uv = [];                                // Texturkoordinate des aktuellen Scheitelpunkts.
    const indices = [];                           // Dreiecksindizes der aktuellen Geometrie.

    for (let r = 0; r <= rings; r++) {

      const t = r / rings;  // Normierter Fortschritt entlang des aktuellen Abschnitts.

      for (let i = 0; i <= segments; i++) {

        const a = (i / segments) * Math.PI * 2;                                                 // Erster Vergleichs- oder Interpolationswert.
        const wobble = 1 + 0.047 * Math.sin(a * 7 + 0.3) + 0.025 * Math.cos(a * 13 - 0.8);      // Unregelmäßige Abweichung der lokalen Kontur.
        const radius = THREE.MathUtils.lerp(inner, outer, t) * wobble;                          // Lokaler Radius der aktuellen Geometrie oder Umlaufbahn.
        const x = swampCenter.x + Math.cos(a) * radius * 1.38;                                  // Horizontale X-Koordinate des aktuellen Punkts.
        const z = swampCenter.z + Math.sin(a) * radius;                                         // Räumliche Z-Koordinate des aktuellen Punkts.
        const wetness = 1 - THREE.MathUtils.smoothstep(t, 0.08, 0.9);                           // Lokaler Einfluss der Feuchtzone.
        const y = THREE.MathUtils.lerp(terrainHeight(x, z), -0.185, wetness * 0.75) + yOffset;  // Lokale Höhen- beziehungsweise zweite Flächenkoordinate.

        positions.push(x, y, z);
        uv.push(t, i / segments);
        if (r < rings && i < segments) {

          const n = r * (segments + 1) + i;  // Normierter Zwischenwert der lokalen Formberechnung.

          indices.push(n, n + segments + 1, n + 1, n + 1, n + segments + 1, n + segments + 2);
        }
      }
    }

    const geometry = new THREE.BufferGeometry();  // Geometrie des aktuell aufgebauten Szeneobjekts.

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }

  const shoreMaterials = [
    new THREE.MeshStandardMaterial({
      color: '#524c34',
      roughness: 0.96,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      depthWrite: true,
    }),
    new THREE.MeshStandardMaterial({
      color: '#484b32',
      roughness: 1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
    }),
  ];                                                                                       // Farbtöne der Uferstreifen.
  const wetBank = new THREE.Mesh(createShoreBand(5.2, 6.45, 0.032), shoreMaterials[0]);    // Feuchter Uferstreifen.
  const earthBank = new THREE.Mesh(createShoreBand(6.25, 7.9, 0.045), shoreMaterials[1]);  // Erdhülle der Geländeoberfläche.

  scene.add(earthBank, wetBank);

  const bankStone = new THREE.DodecahedronGeometry(1, 0);                                  // Einzelner Uferstein.
  const bankMaterial = new THREE.MeshStandardMaterial({
    color: '#655e49',
    roughness: 1,
    flatShading: true,
  });                                                                                      // Material der Ufersteine.

  for (let i = 0; i < 38; i++) {

    const a = i * 2.399963 + Math.sin(i * 8.31) * 0.15;           // Erster Vergleichs- oder Interpolationswert.
    const r = 6.5 + 0.95 * Math.sin(i * 2.73);                    // Index oder Radius des aktuellen Rings.
    const x = swampCenter.x + Math.cos(a) * r * 1.38;             // Horizontale X-Koordinate des aktuellen Punkts.
    const z = swampCenter.z + Math.sin(a) * r;                    // Räumliche Z-Koordinate des aktuellen Punkts.
    const stone = new THREE.Mesh(bankStone, bankMaterial);        // Einzelner Stein der Geländeoberfläche.
    const size = 0.12 + 0.19 * (0.5 + 0.5 * Math.sin(i * 17.1));  // Texturgröße beziehungsweise lokale Instanzgröße.

    stone.scale.set(size * 1.8, size * 0.42, size);
    stone.position.set(x, terrainHeight(x, z) + size * 0.12, z);
    stone.rotation.y = a;
    scene.add(stone);
  }

  const marshMaterials = ['#3a5a2c', '#56733a', '#719049'].map(

    /**
     * Erstellt die gemeinsame Geometrie oder das Material des aktuellen Eintrags.
     * @param {string} color - Eingabewert „color“.
     * @returns {unknown} Ergebnis der beschriebenen Operation.
     */
    color =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.94,
        side: THREE.DoubleSide,
      }),
  );                                                                                       // Materialien der Feuchtzonenpflanzen.

  for (let i = 0; i < 18; i++) {

    const tuft = new THREE.Group();                             // Gruppe eines kleinen Bodenstrauchs.
    const angle = between(0, Math.PI * 2);                      // Lokaler Winkel um den Stamm beziehungsweise Geometrieanker.
    const radius = between(4.6, 7.2);                           // Lokaler Radius der aktuellen Geometrie oder Umlaufbahn.
    const x = swampCenter.x + Math.cos(angle) * radius;         // Horizontale X-Koordinate des aktuellen Punkts.
    const z = swampCenter.z + Math.sin(angle) * radius * 0.86;  // Räumliche Z-Koordinate des aktuellen Punkts.
    const y = terrainHeight(x, z) - 0.03;                       // Lokale Höhen- beziehungsweise zweite Flächenkoordinate.

    tuft.position.set(x, y, z);
    for (let j = 0; j < betweenInt(4, 7); j++) {

      const blade = new THREE.Mesh(
        new THREE.PlaneGeometry(0.09, between(0.8, 1.4)),
        marshMaterials[(i + j) % marshMaterials.length],
      );  // Einzelne Blattspreite.

      blade.position.y = 0.35 + j * 0.02;
      blade.rotation.set(between(-0.18, 0.18), between(0, Math.PI * 2), between(-0.42, 0.42));
      tuft.add(blade);
    }
    scene.add(tuft);
  }

  const earthCeilingMaterial = new THREE.MeshStandardMaterial({
    color: '#28261b',
    roughness: 1,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 1,
    depthWrite: true,
  });                                                                                      // Beim Auftauchen ausblendbares Material der Erddecke.
  const earthCeiling = new THREE.Mesh(
    new THREE.RingGeometry(2.25, 95, 64, 1),
    earthCeilingMaterial,
  );                                                                                       // Ausblendbare Erddecke des Wurzelraums.

  earthCeiling.rotation.x = -Math.PI / 2;
  earthCeiling.position.y = -0.23;
  scene.add(earthCeiling);

  const ceilingStrata = new THREE.Group();                                                 // Flache Erdschichten an der Unterseite der Decke.

  scene.add(ceilingStrata);

  const ceilingColors = ['#302c21', '#463b2b', '#4a4533'].map(

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
  );                                                                                       // Farbtöne der unterirdischen Erdschichten.

  for (let i = 0; i < 90; i++) {

    const angle = between(0, Math.PI * 2);  // Lokaler Winkel um den Stamm beziehungsweise Geometrieanker.
    const radius = between(3.1, 24);        // Lokaler Radius der aktuellen Geometrie oder Umlaufbahn.
    const shard = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1, 0),
      ceilingColors[i % ceilingColors.length],
    );                                      // Flache Erdscholle unter der Decke.

    shard.position.set(Math.cos(angle) * radius, between(-0.44, -0.3), Math.sin(angle) * radius);
    shard.scale.set(between(0.35, 1.4), between(0.06, 0.18), between(0.4, 1.7));
    ceilingStrata.add(shard);
  }

  /**
   * Verteilt schwimmende Blätter mit stabilen Ausgangspositionen auf dem Wasser.
   * @returns {void} Kein Rückgabewert.
   */
  function buildFloatingLeaves() {
    for (let i = 0; i < 8; i++) {

      const angle = 0.4 + i * 0.58;                                                        // Lokaler Winkel um den Stamm beziehungsweise Geometrieanker.
      const radius = 3.1 + (i % 3) * 0.75 + Math.sin(i * 1.7) * 0.25;                      // Lokaler Radius der aktuellen Geometrie oder Umlaufbahn.
      const leaf = new THREE.Mesh(waterLeafGeo, waterLeafMats[i % waterLeafMats.length]);  // Aktuelles Blattobjekt.

      leaf.rotation.x = -Math.PI / 2;
      leaf.rotation.z = angle + (i % 2 ? 0.35 : -0.22);
      leaf.scale.set(0.58 + (i % 4) * 0.1, 0.84 + (i % 3) * 0.08, 1);
      leaf.position.set(
        swampCenter.x + Math.cos(angle) * radius * 1.18,
        -0.135 + Math.sin(i * 2.1) * 0.01,
        swampCenter.z + Math.sin(angle) * radius * 0.88,
      );
      leaf.userData = {
        baseX: leaf.position.x,
        baseY: leaf.position.y,
        baseZ: leaf.position.z,
        baseRot: leaf.rotation.z,
        phase: i * 0.8,
        speed: 0.65 + i * 0.05,
      };
      scene.add(leaf);
      floatingWaterLeaves.push(leaf);
    }
  }
  return {
    terrainHeight,
    swampWaterState,
    floatingWaterLeaves,
    earthCeilingMaterial,
    ceilingStrata,
  };
}
