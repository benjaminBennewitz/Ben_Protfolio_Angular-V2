/** @file world/core.js — Prozeduraler Aufbau des zugehörigen Weltbereichs. */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { createRandom } from '../scripts/random.js';

/**
 * Erstellt gemeinsame Materialien, Geometriehelfer und die aktive Layer-/Zufallsverwaltung.
 * @param {object} context - Explizite Abhängigkeiten beziehungsweise aktueller Dateneintrag.
 * @returns {object} Ergebnis der beschriebenen Operation.
 */
export function createWorldCore({ config, scene, renderer }) {

  const streams = Object.fromEntries(
    Object.entries(config.seeds).map(

      /**
       * Ordnet dem aktuellen Eintrag seinen zugehörigen Zustand zu.
       * @param {Array} entry - Explizite Abhängigkeiten beziehungsweise aktueller Dateneintrag.
       * @returns {unknown} Ergebnis der beschriebenen Operation.
       */
      ([name, seed]) => [name, createRandom(seed)],
    ),
  );                                        // Unabhängige deterministische Zufallsströme je Layer.
  let activeLayer = 'trunk';                // Layer für die Registrierung neu hinzugefügter Objekte.
  let activeRandom = streams.trunk;         // Zufallsstrom des aktuell ausgewählten Layers.

  /**
   * Leitet einen Zufallszugriff an den aktuell ausgewählten Layer-Stream weiter.
   * @returns {number} Berechneter Zahlenwert.
   */
  const random = () => activeRandom();
  const layers = Object.fromEntries(
    Object.keys(streams).map(

      /**
       * Ordnet dem aktuellen Eintrag seinen zugehörigen Zustand zu.
       * @param {string} name - Kennung des aktuellen Welt-Layers.
       * @returns {unknown} Ergebnis der beschriebenen Operation.
       */
      name => [name, new Set()],
    ),
  );                                        // Registrierte Weltobjekte je Layer.
  const rawAdd = scene.add.bind(scene);     // Ursprüngliche, an die Szene gebundene add-Methode.

  scene.add =

    /**
     * Registriert neue Szeneobjekte im aktiven Layer und ruft die ursprüngliche add-Methode auf.
     * @param {...object} objects - Eingabewert „objects“.
     * @returns {unknown} Ergebnis der beschriebenen Operation.
     */
    (...objects) => {
      for (const object of objects) {
        if (object.isObject3D) layers[activeLayer]?.add(object);
      }
      return rawAdd(...objects);
    };

  /**
   * Wählt den aktiven Layer und dessen reproduzierbaren Zufallsstrom.
   * @param {string} name - Kennung des aktuellen Welt-Layers.
   * @returns {void} Kein Rückgabewert.
   */
  function useLayer(name) {
    activeLayer = name;
    activeRandom = streams[name];
  }

  /**
   * Liefert eine Zufallszahl im angegebenen Intervall aus dem aktiven Layer-Stream.
   * @param {number} a - Erster Vergleichs- oder Interpolationswert.
   * @param {number} b - Zweiter Vergleichs- oder Interpolationswert.
   * @returns {number} Berechneter Zahlenwert.
   */
  const between = (a, b) => a + random() * (b - a);

  /**
   * Liefert eine ganzzahlige Zufallszahl einschließlich beider Intervallgrenzen.
   * @param {number} a - Erster Vergleichs- oder Interpolationswert.
   * @param {number} b - Zweiter Vergleichs- oder Interpolationswert.
   * @returns {number} Berechneter Zahlenwert.
   */
  const betweenInt = (a, b) => Math.floor(between(a, b + 1));
  const bark = new THREE.MeshStandardMaterial({
    color: '#65503a',
    roughness: 1,
    flatShading: true,
  });                                       // Rindenmaterial.
  const barkLight = new THREE.MeshStandardMaterial({
    color: '#887353',
    roughness: 1,
    flatShading: true,
  });                                       // Heller Rindenton.

  /**
   * Zeichnet eine deterministische, kachelbare Rindentextur auf ein Canvas.
   * @returns {THREE.CanvasTexture} Ergebnis der beschriebenen Operation.
   */
  function createBarkTexture() {

    const canvas = document.createElement('canvas');  // Canvas für eine lokal erzeugte Textur.

    canvas.width = 256;
    canvas.height = 512;

    const context = canvas.getContext('2d');          // 2D-Zeichenkontext der prozeduralen Rindentextur.

    context.fillStyle = '#9a896b';
    context.fillRect(0, 0, 256, 512);

    let state = 14791;                                // Aktueller Zustand des deterministischen Zufallsstroms.

    /**
     * Liefert den nächsten deterministischen Zufallswert der Rindentextur.
     * @returns {number} Berechneter Zahlenwert.
     */
    const nextRandom = () => (state = (1664525 * state + 1013904223) >>> 0) / 4294967296;
    for (let i = 0; i < 1550; i++) {

      const x = nextRandom() * 256;             // Horizontale X-Koordinate des aktuellen Punkts.
      const y = nextRandom() * 512;             // Lokale Höhen- beziehungsweise zweite Flächenkoordinate.
      const height = 10 + nextRandom() * 95;    // Höhe des aktuellen Kapitels oder Geometrieabschnitts.
      const drift = (nextRandom() - 0.5) * 13;  // Seitlicher Versatz der Rindenzeichnung.
      const light = nextRandom() > 0.48;        // Der Rindenstrich verwendet den hellen Farbton.

      context.strokeStyle = light
        ? `rgba(218,198,151,${0.03 + nextRandom() * 0.14})`
        : `rgba(41,32,23,${0.04 + nextRandom() * 0.22})`;
      context.lineWidth = 0.5 + nextRandom() * 3.8;
      context.beginPath();
      context.moveTo(x, y);
      context.bezierCurveTo(
        x + drift,
        y + height * 0.35,
        x - drift,
        y + height * 0.7,
        x + drift,
        y + height,
      );
      context.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);  // Aus dem Canvas erzeugte Three.js-Textur.

    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1.2, 1.8);
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return texture;
  }

  const barkTexture = createBarkTexture();  // Rindentextur.

  bark.map = barkTexture;
  barkLight.map = barkTexture;
  bark.color.set('#8b795d');
  barkLight.color.set('#a59778');

  const vineMaterial = new THREE.MeshStandardMaterial({
    color: '#56783b',
    roughness: 1,
  });                                       // Lianenmaterial.
  const earth = new THREE.MeshStandardMaterial({
    color: '#302a1e',
    roughness: 1,
  });                                       // Erdmaterial.
  const leafMaterials = ['#284b2e', '#426e3a', '#608648', '#789957', '#a1a962'].map(

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
  );                                        // Blattmaterialien.

  /**
   * Erzeugt ein unregelmäßig skaliertes Gelenk am Übergang zweier Äste.
   * @param {object} position - Räumliche Position des aktuellen Objekts.
   * @param {number} radius - Lokaler Radius der aktuellen Geometrie oder Umlaufbahn.
   * @param {object} [material] - Material der erzeugten Oberfläche.
   * @param {number} [squash] - Vertikale Stauchung des Gelenks.
   * @param {number} [randomness] - Stärke der zufälligen Gelenkverformung.
   * @returns {THREE.Mesh} Ergebnis der beschriebenen Operation.
   */
  function addBranchJoint(position, radius, material = bark, squash = 1, randomness = 0.14) {

    const joint = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), material);  // Übergangsgelenk zwischen Astabschnitten.

    joint.position.copy(position);
    joint.scale.set(
      radius * between(1 - randomness, 1 + randomness),
      radius * squash * between(1 - randomness * 0.8, 1 + randomness * 0.8),
      radius * between(1 - randomness, 1 + randomness),
    );
    scene.add(joint);
    return joint;
  }

  /**
   * Erzeugt einen verjüngten Ast und seine optionalen Übergangsgelenke.
   * @param {object} from - Anfangsposition des Asts.
   * @param {object} to - Endposition des Asts.
   * @param {number} r0 - Radius am Astanfang.
   * @param {number} r1 - Radius am Astende.
   * @param {object} [material] - Material der erzeugten Oberfläche.
   * @param {number} [sides] - Anzahl der Umfangssegmente der Geometrie.
   * @param {object} [opts] - Optionale Einstellungen der Astgelenke.
   * @returns {THREE.Mesh} Ergebnis der beschriebenen Operation.
   */
  function branch(from, to, r0, r1, material = bark, sides = 7, opts = {}) {

    const {
      startJoint = r0 > 0.18,
      endJoint = r1 > 0.08,
      startJointScale = 1.05,
      endJointScale = 1.16,
      startSquash = 1.08,
      endSquash = 1.04,
      startRandomness = 0.14,
      endRandomness = 0.14,
    } = opts;                                                                            // Benötigte Werte und Aktionen dieses Teilbereichs.
    const direction = new THREE.Vector3().subVectors(to, from);                          // Richtungsvektor zwischen zwei räumlichen Positionen.
    const length = direction.length();                                                   // Länge des aktuellen Vektors oder Geometrieabschnitts.
    const geometry = new THREE.CylinderGeometry(r1, r0, length, Math.max(sides, 8), 5);  // Geometrie des aktuell aufgebauten Szeneobjekts.
    const mesh = new THREE.Mesh(geometry, material);                                     // Aktuell erzeugtes renderbares Geometrieobjekt.

    mesh.position.copy(from).addScaledVector(direction, 0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    scene.add(mesh);
    if (startJoint)
      addBranchJoint(from, r0 * startJointScale, material, startSquash, startRandomness);
    if (endJoint) addBranchJoint(to, r1 * endJointScale, material, endSquash, endRandomness);
    return mesh;
  }

  /**
   * Erstellt einen dreidimensionalen Positions- oder Richtungsvektor.
   * @param {number} x - Horizontale X-Koordinate des aktuellen Punkts.
   * @param {number} y - Lokale Höhen- beziehungsweise zweite Flächenkoordinate.
   * @param {number} z - Räumliche Z-Koordinate des aktuellen Punkts.
   * @returns {THREE.Vector3} Ergebnis der beschriebenen Operation.
   */
  const vec = (x, y, z) => new THREE.Vector3(x, y, z);

  /**
   * Berechnet die leicht gewundene Mittellinie des Stamms für eine Höhe.
   * @param {number} height - Höhe des aktuellen Kapitels oder Geometrieabschnitts.
   * @returns {THREE.Vector3} Ergebnis der beschriebenen Operation.
   */
  const trunkCenterAt = height => {

    const n = THREE.MathUtils.clamp((height + 1.2) / 52, 0, 1);  // Normierter Zwischenwert der lokalen Formberechnung.
    const sway = 0.78 - n * 0.26;                                // Höhenabhängige seitliche Stammschwankung.

    return vec(
      Math.sin(height * 0.072) * sway + Math.sin(height * 0.023) * 0.22,
      height,
      Math.cos(height * 0.061) * (0.52 - n * 0.12) + Math.sin(height * 0.037) * 0.18,
    );
  };

  /**
   * Berechnet Stammverjüngung und den verbreiterten Kapok-Stammfuß.
   * @param {number} height - Höhe des aktuellen Kapitels oder Geometrieabschnitts.
   * @returns {number} Berechneter Zahlenwert.
   */
  const trunkRadiusAt = height => {

    const lowerSettle = THREE.MathUtils.smoothstep(height, 7.5, 24);                  // Glättung der unteren Stammverjüngung.
    const upperTaper = THREE.MathUtils.smoothstep(height, 24, 46.5);                  // Glättung der oberen Stammverjüngung.
    const crownPull = THREE.MathUtils.smoothstep(height, 34, 46.5);                   // Einzug des Stamms am Kronenansatz.
    const column = 1.92 - 0.13 * lowerSettle - 0.62 * upperTaper - 0.18 * crownPull;  // Verjüngter Grundradius des Stamms.
    const flare = 0.56 * Math.exp(-Math.pow((height - 5.9) / 8.3, 2));                // Lokale Verbreiterung des Stamm- oder Wurzelfußes.

    return (column + flare) * 0.8;
  };
  return {
    random,
    layers,
    rawAdd,
    useLayer,
    between,
    betweenInt,
    bark,
    barkLight,
    vineMaterial,
    earth,
    leafMaterials,
    branch,
    vec,
    trunkCenterAt,
    trunkRadiusAt,
  };
}
