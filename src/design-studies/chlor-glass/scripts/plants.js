/* src/design-studies/chlor-glass/scripts/plants.js */

/**
 * @file Prozedurales Blattwerk des botanischen Lichtlabors.
 * @description Verbindet geaderte Blattoberflächen, organische Formen und drei räumliche Vegetationsschichten.
 * @author Benjamin Bennewitz
 */

import * as THREE from '../../bentendo/vendor/three/three.module.js';
import { createRandom } from './content.js';

/** Räumliche Staffelung von Blattgröße, Pflanzendichte und Tiefe hinter der Scheibe. */
const PLANT_LAYERS = Object.freeze([
  { id: 'canopy', depth: -12.5, spread: 3, size: 0.65, count: 1.4 },
  { id: 'middle', depth: -6.6, spread: 3, size: 1, count: 1 },
  { id: 'near', depth: -1.9, spread: 1.4, size: 1.2, count: 0.65 },
]);

/**
 * Erzeugt fein verzweigte Adern, Pigmentflecken und ein gemeinsames Höhen-/Rauheitsrelief.
 * @returns {{color: THREE.CanvasTexture, relief: THREE.CanvasTexture}} Lokal generierte Texturen.
 */
function createLeafTextures() {
  const width = 256;
  const height = 512;
  const colorCanvas = document.createElement('canvas');
  const reliefCanvas = document.createElement('canvas');
  colorCanvas.width = reliefCanvas.width = width;
  colorCanvas.height = reliefCanvas.height = height;
  const colorContext = colorCanvas.getContext('2d');
  const reliefContext = reliefCanvas.getContext('2d');
  const pixels = colorContext.createImageData(width, height);
  const reliefPixels = reliefContext.createImageData(width, height);
  const random = createRandom(1729);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const cross = Math.abs(x / width - 0.5) * 2;
      const pigment = Math.sin(x * 0.045 + Math.sin(y * 0.028) * 2.5) * Math.sin(y * 0.029) * 19
        + Math.sin(x * 0.12 + y * 0.071) * 5;
      const pores = (random() - 0.5) * 11;
      const value = 210 - cross * 52 + pigment + pores;
      pixels.data.set([value * 0.54, value * 0.73, value * 0.35, 255], index);
      const relief = 151 + pores * 1.3 + pigment * 0.5;
      reliefPixels.data.set([relief, relief, relief, 255], index);
    }
  }
  colorContext.putImageData(pixels, 0, 0);
  reliefContext.putImageData(reliefPixels, 0, 0);

  /** Zeichnet die Ader in Farbe und Relief mit demselben geometrischen Verlauf. */
  function strokeVein(start, control, end, thickness, primary = false) {
    for (const [context, color, width] of [
      [colorContext, '#3e542b', thickness * 1.9],
      [colorContext, primary ? '#afbc7c' : '#839b57', thickness],
      [reliefContext, primary ? '#e5e5e5' : '#bfbfbf', thickness],
    ]) {
      context.strokeStyle = color;
      context.lineWidth = width;
      context.beginPath();
      context.moveTo(...start);
      context.quadraticCurveTo(...control, ...end);
      context.stroke();
    }
  }

  strokeVein([128, 512], [124, 240], [128, 0], 5.2, true);
  for (let row = 38; row < height - 18; row += 37) {
    for (const side of [-1, 1]) {
      const origin = row + (random() - 0.5) * 13;
      strokeVein([128, origin], [128 + side * 58, origin + 12], [128 + side * 126, origin + 82], 2.7);
      for (let branch = 1; branch <= 4; branch += 1) {
        const offset = branch * 23;
        strokeVein([128 + side * offset, origin + offset * 0.36], [128 + side * (offset + 15), origin + offset * 0.36 - 9], [128 + side * (offset + 28), origin + offset * 0.36 - 20], 0.9);
      }
    }
  }
  const color = new THREE.CanvasTexture(colorCanvas);
  color.colorSpace = THREE.SRGBColorSpace;
  const relief = new THREE.CanvasTexture(reliefCanvas);
  color.anisotropy = relief.anisotropy = 4;
  return { color, relief };
}

/**
 * Modelliert asymmetrische Blattflächen mit Mittelrippe, Randwellen und eingerollter Spitze.
 * @param {number} species Form: 0 = breit, 1 = lanzettlich, 2 = gelappt.
 * @param {number} variation Unterschiedliche Krümmung derselben Pflanzenform.
 * @returns {THREE.BufferGeometry} Beleuchtbare Geometrie mit UVs und Oberflächennormalen.
 */
function createLeafGeometry(species, variation) {
  const positions = [];
  const uvs = [];
  const indices = [];
  const rows = 32;
  const columns = 8;
  for (let row = 0; row <= rows; row += 1) {
    const progress = row / rows;
    const envelope = Math.pow(Math.max(0, Math.sin(progress * Math.PI)), species === 1 ? 0.95 : 0.72);
    const breadth = species === 1 ? 0.17 : species === 2 ? 0.43 : 0.34;
    for (let column = 0; column <= columns; column += 1) {
      const cross = column / columns * 2 - 1;
      const lobes = species === 2 ? 0.72 + 0.28 * Math.cos(progress * Math.PI * 9 + 0.8) : 1;
      const asymmetry = 1 + cross * Math.sin(progress * 6 + variation) * 0.13;
      const serration = 1 + Math.sin(progress * 95) * 0.017;
      const width = envelope * breadth * lobes * asymmetry * serration;
      const edgeCurl = Math.abs(cross) ** 2 * envelope * Math.sin(progress * 15 + variation * 2) * 0.046;
      const ridge = (1 - Math.abs(cross)) * envelope * 0.045;
      const tipCurl = Math.pow(progress, 4) * (variation ? -0.23 : 0.16);
      positions.push(cross * width + Math.sin(progress * 4) * variation * 0.04, progress,
        envelope * 0.13 - Math.abs(cross) * width * 0.42 + edgeCurl + ridge + tipCurl);
      uvs.push(column / columns, progress);
      if (row < rows && column < columns) {
        const index = row * (columns + 1) + column;
        indices.push(index, index + 1, index + columns + 1, index + 1, index + columns + 2, index + columns + 1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Baut drei Vegetationsebenen mit gemeinsam genutzten Geometrien und instanzierten Blättern.
 * Niedrige Bodenpflanzen werden pro Ebene in horizontalen Teilbereichen verteilt.
 * Ein eigener Zufallsstrom erhält dabei die bestehende Anordnung der hohen Pflanzen.
 * @param {object} scenario Aktive Versuchsanordnung.
 * @returns {{group: THREE.Group, update: function(number): void, dispose: function(): void}}
 */
export function createPlants(scenario) {
  const random = createRandom(scenario.seed);
  const group = new THREE.Group();
  const textures = createLeafTextures();
  const geometries = Array.from({ length: 6 }, (_, index) => createLeafGeometry(Math.floor(index / 2), index % 2));
  const materials = ['#b5c69b', '#8fa67e', '#a4b88a'].map((color) => new THREE.MeshPhysicalMaterial({
    color, map: textures.color, bumpMap: textures.relief, bumpScale: 0.024,
    roughnessMap: textures.relief, roughness: 0.85, metalness: 0, side: THREE.DoubleSide,
    clearcoat: 0.09, clearcoatRoughness: 0.56, emissive: color, emissiveIntensity: 0.025,
  }));
  const stemMaterial = new THREE.MeshStandardMaterial({ color: '#536145', roughness: 0.9 });
  const stemGeometries = [];
  const layers = [];
  const instanceMatrix = new THREE.Matrix4();

  for (const definition of PLANT_LAYERS) {
    const layer = new THREE.Group();
    layer.name = definition.id;
    const branches = [];
    const batches = new Map();
    const count = Math.round(scenario.branches * definition.count);
    const groundCount = Math.round(scenario.branches * (definition.id === 'near' ? 1.2 : 0.9));
    const groundRandom = createRandom(scenario.seed + 1000 + layers.length * 97);
    for (let index = 0; index < count + groundCount; index += 1) {
      const groundCover = index >= count;
      const placementRandom = groundCover ? groundRandom : random;
      const branch = new THREE.Group();
      branch.name = groundCover ? 'ground-cover' : 'climbing-stem';
      const height = groundCover ? 1.4 + placementRandom() * 1.8
        : definition.id === 'canopy' ? 11 + placementRandom() * 7
        : definition.id === 'middle' ? 6 + placementRandom() * 7 : 5 + placementRandom() * 5;
      const lean = (placementRandom() - 0.5) * (groundCover ? 1.7 : definition.id === 'canopy' ? 6 : 3.5);
      const depth = definition.depth - placementRandom() * definition.spread;
      const width = groundCover && definition.id === 'near' ? 22 : 28;
      const x = groundCover
        ? ((index - count + 0.5 + (placementRandom() - 0.5) * 0.55) / groundCount - 0.5) * width
        : -14 + placementRandom() * 28;
      branch.position.set(x, -5.9, depth);
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(lean * 0.12, height * 0.32, 0.16),
        new THREE.Vector3(lean * 0.65, height * 0.73, -0.12),
        new THREE.Vector3(lean, height, 0),
      ]);
      const stemGeometry = new THREE.TubeGeometry(curve, 24, definition.id === 'canopy' ? 0.025 : 0.018, 5, false);
      stemGeometries.push(stemGeometry);
      branch.add(new THREE.Mesh(stemGeometry, stemMaterial));
      const species = groundCover || scenario.id === 'understory' ? index % 3 : index % 5 === 0 ? 1 : 0;
      const leafCount = groundCover ? 10 : definition.id === 'canopy' ? Math.round(scenario.leaves * 0.8) : scenario.leaves;
      for (let leafIndex = 0; leafIndex < leafCount; leafIndex += 1) {
        const progress = (groundCover ? 0.06 : 0.12) + leafIndex / leafCount * 0.84;
        const side = leafIndex % 2 ? -1 : 1;
        const materialIndex = Math.floor(placementRandom() * materials.length);
        const geometryIndex = species * 2 + Math.floor(placementRandom() * 2);
        const leaf = new THREE.Object3D();
        leaf.position.copy(curve.getPoint(progress));
        leaf.rotation.set((placementRandom() - 0.45) * 1.5, side * (0.12 + placementRandom() * 0.8), side * ((groundCover ? 0.95 : 0.7) + placementRandom() * 0.9));
        const size = (0.8 + placementRandom() * 0.85) * (1.1 - progress * 0.4) * definition.size;
        leaf.scale.set(size * (0.85 + placementRandom() * 0.3), size * (species === 1 ? 1.25 : 1), size);
        leaf.updateMatrix();
        const batchKey = `${geometryIndex}-${materialIndex}`;
        if (!batches.has(batchKey)) batches.set(batchKey, { geometry: geometries[geometryIndex], material: materials[materialIndex], placements: [] });
        batches.get(batchKey).placements.push({ branch, leaf });
      }
      branches.push({ object: branch, angle: branch.rotation.z, phase: placementRandom() * Math.PI * 2, speed: 0.25 + placementRandom() * 0.2 });
      layer.add(branch);
    }
    for (const batch of batches.values()) {
      batch.mesh = new THREE.InstancedMesh(batch.geometry, batch.material, batch.placements.length);
      batch.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      batch.mesh.frustumCulled = false;
      layer.add(batch.mesh);
    }
    group.add(layer);
    layers.push({ group: layer, branches, batches });
  }

  /** Überträgt die lokalen Rankenmatrizen in die gemeinsamen Blatt-Drawcalls. */
  function updateInstances(layer) {
    for (const branch of layer.branches) branch.object.updateMatrix();
    for (const batch of layer.batches.values()) {
      batch.placements.forEach(({ branch, leaf }, index) => {
        batch.mesh.setMatrixAt(index, instanceMatrix.multiplyMatrices(branch.matrix, leaf.matrix));
      });
      batch.mesh.instanceMatrix.needsUpdate = true;
    }
  }

  for (const layer of layers) updateInstances(layer);

  return {
    group,
    /** Bewegt die Zweige um ihren Bodenansatz; die Perspektivkamera übernimmt die Parallax. */
    update(time) {
      for (const layer of layers) {
        for (const branch of layer.branches) {
          branch.object.rotation.z = branch.angle + Math.sin(time * branch.speed + branch.phase) * 0.025;
          branch.object.rotation.y = Math.sin(time * 0.17 + branch.phase) * 0.045;
        }
        updateInstances(layer);
      }
    },
    /** Gibt nur die von diesem Pflanzenbestand erzeugten Instanzen und Ressourcen frei. */
    dispose() {
      for (const layer of layers) {
        for (const batch of layer.batches.values()) batch.mesh.dispose();
        layer.batches.clear();
      }
      textures.color.dispose();
      textures.relief.dispose();
      for (const geometry of [...geometries, ...stemGeometries]) geometry.dispose();
      for (const material of [...materials, stemMaterial]) material.dispose();
      group.clear();
    },
  };
}
