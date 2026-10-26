import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { createRandom } from './random.js';

/** Creates the existing GROWTH scene without changing its camera or document scroll. */
export function createGrowthWorld(scene, renderer, config) {
// Reproducible procedural geometry. No external meshes are required.
// Each subsystem owns a stable random stream. Edits to the ground never reseed the canopy.
const streams = Object.fromEntries(Object.entries(config.seeds).map(([name, seed]) => [name, createRandom(seed)]));
let activeLayer = 'trunk';
let random = streams.trunk;
const layers = Object.fromEntries(Object.keys(streams).map(name => [name, new Set()]));
const rawAdd = scene.add.bind(scene);
scene.add = (...objects) => {
  for (const object of objects) {
    if (object.isObject3D) layers[activeLayer]?.add(object);
  }
  return rawAdd(...objects);
};
function useLayer(name) {
  activeLayer = name;
  random = streams[name];
}
const between = (a, b) => a + random() * (b - a);
const betweenInt = (a, b) => Math.floor(between(a, b + 1));
const bark = new THREE.MeshStandardMaterial({ color: '#65503a', roughness: 1, flatShading: true });
const barkLight = new THREE.MeshStandardMaterial({ color: '#887353', roughness: 1, flatShading: true });
/** Generates a lightweight, tileable bark texture without external assets. */
function createBarkTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  context.fillStyle = '#9a896b';
  context.fillRect(0, 0, 256, 512);
  let state = 14791;
  const nextRandom = () => ((state = (1664525 * state + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < 1550; i++) {
    const x = nextRandom() * 256;
    const y = nextRandom() * 512;
    const height = 10 + nextRandom() * 95;
    const drift = (nextRandom() - .5) * 13;
    const light = nextRandom() > .48;
    context.strokeStyle = light ? `rgba(218,198,151,${.03 + nextRandom() * .14})` : `rgba(41,32,23,${.04 + nextRandom() * .22})`;
    context.lineWidth = .5 + nextRandom() * 3.8;
    context.beginPath();
    context.moveTo(x, y);
    context.bezierCurveTo(x + drift, y + height * .35, x - drift, y + height * .7, x + drift, y + height);
    context.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.2, 1.8);
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return texture;
}
const barkTexture = createBarkTexture();
bark.map = barkTexture;
barkLight.map = barkTexture;
bark.color.set('#8b795d');
barkLight.color.set('#a59778');
const vineMaterial = new THREE.MeshStandardMaterial({ color: '#56783b', roughness: 1 });
const earth = new THREE.MeshStandardMaterial({ color: '#302a1e', roughness: 1 });
const leafMaterials = ['#284b2e', '#426e3a', '#608648', '#789957', '#a1a962'].map(color => new THREE.MeshStandardMaterial({ color, roughness: .94, side: THREE.DoubleSide }));

/** Creates a tapered branch between two world coordinates. */
function addBranchJoint(position, radius, material = bark, squash = 1, randomness = .14) {
  const joint = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), material);
  joint.position.copy(position);
  joint.scale.set(
    radius * between(1 - randomness, 1 + randomness),
    radius * squash * between(1 - randomness * .8, 1 + randomness * .8),
    radius * between(1 - randomness, 1 + randomness)
  );
  scene.add(joint);
  return joint;
}
function branch(from, to, r0, r1, material = bark, sides = 7, opts = {}) {
  const {
    startJoint = r0 > .18,
    endJoint = r1 > .08,
    startJointScale = 1.05,
    endJointScale = 1.16,
    startSquash = 1.08,
    endSquash = 1.04,
    startRandomness = .14,
    endRandomness = .14
  } = opts;
  const direction = new THREE.Vector3().subVectors(to, from);
  const length = direction.length();
  const geometry = new THREE.CylinderGeometry(r1, r0, length, Math.max(sides, 8), 5);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(from).addScaledVector(direction, .5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  scene.add(mesh);
  if (startJoint) addBranchJoint(from, r0 * startJointScale, material, startSquash, startRandomness);
  if (endJoint) addBranchJoint(to, r1 * endJointScale, material, endSquash, endRandomness);
  return mesh;
}
const vec = (x, y, z) => new THREE.Vector3(x, y, z);

/** Returns the slightly meandering center line of the kapok trunk. */
const trunkCenterAt = (height) => {
  const n = THREE.MathUtils.clamp((height + 1.2) / 52, 0, 1);
  const sway = 0.78 - n * 0.26;
  return vec(
    Math.sin(height * 0.072) * sway + Math.sin(height * 0.023) * 0.22,
    height,
    Math.cos(height * 0.061) * (0.52 - n * 0.12) + Math.sin(height * 0.037) * 0.18
  );
};
/** Approximates the elephant-foot trunk flare of a kapok tree.
 * The trunk now stays fuller until around the middle of chapter 03 and only tapers more clearly above that. */
const trunkRadiusAt = (height) => {
  const lowerSettle = THREE.MathUtils.smoothstep(height, 7.5, 24);
  const upperTaper = THREE.MathUtils.smoothstep(height, 24, 46.5);
  const crownPull = THREE.MathUtils.smoothstep(height, 34, 46.5);
  const column = 1.92 - 0.13 * lowerSettle - 0.62 * upperTaper - 0.18 * crownPull;
  const flare = 0.56 * Math.exp(-Math.pow((height - 5.9) / 8.3, 2));
  return (column + flare) * .8;
};

useLayer('trunk');
// 50-metre tree: tapering trunk with kapok-like flare, roots below grade and a large crown.
// The main trunk now ends earlier so the canopy can split more naturally into major leaders.
let previous = trunkCenterAt(-1.2);
const trunkTopY = 41.3;
for (let i = 1; i <= 40; i++) {
  const y = -1.2 + (i / 40) * (trunkTopY + 1.2);
  const next = trunkCenterAt(y);
  const isMilestone = i % 7 === 0 || i === 40;
  branch(previous, next, trunkRadiusAt(previous.y), trunkRadiusAt(y), i % 4 === 0 ? barkLight : bark, 13, {
    startJoint: false,
    endJoint: isMilestone,
    endJointScale: between(.94, 1.06),
    endSquash: between(1.0, 1.12),
    endRandomness: .08
  });
  previous = next;
}
// Elephant-foot flare volumes around the lower trunk break the cylindrical silhouette.
for (let i = 0; i < 7; i++) {
  const angle = i * Math.PI * 2 / 7 + between(-0.22, 0.22);
  const y = between(1.4, 7.2);
  const center = trunkCenterAt(y);
  const lobe = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), i % 2 === 0 ? barkLight : bark);
  const radial = trunkRadiusAt(y) * between(0.5, 0.72);
  lobe.position.set(center.x + Math.cos(angle) * radial, y, center.z + Math.sin(angle) * radial);
  lobe.scale.set(between(1.1, 1.9), between(1.8, 4.3), between(0.9, 1.7));
  lobe.rotation.set(between(-0.35, 0.35), angle, between(-0.35, 0.35));
  scene.add(lobe);
}
// Subtle upper-trunk collars break the remaining segmented look without becoming repetitive ribs.
for (let i = 0; i < 4; i++) {
  const y = between(18, 37);
  const center = trunkCenterAt(y);
  const collar = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), i % 2 === 0 ? bark : barkLight);
  collar.position.copy(center).add(vec(between(-.15,.15), 0, between(-.15,.15)));
  collar.scale.set(between(1.2, 1.55), between(.5, .9), between(1.2, 1.55));
  scene.add(collar);
}
useLayer('buttress');
// Kapok buttresses: fused, irregular flanges that blend into one another near the trunk base.
function createButtressRib(angle, height, reach, width, lift = 0) {
  const positions = [];
  const indices = [];
  const uvs = [];
  const sections = 34;
  const irregularity = between(.08, .18);
  const phase = between(0, Math.PI * 2);
  const radial = vec(Math.cos(angle), 0, Math.sin(angle));
  const tangent = vec(-Math.sin(angle), 0, Math.cos(angle));
  const rowWidth = 7;

  for (let i = 0; i <= sections; i++) {
    const t = i / sections;
    const y = -.22 + t * height + lift * Math.sin(t * Math.PI) * .25;
    const center = trunkCenterAt(y);
    const trunkRadius = trunkRadiusAt(Math.max(y, 0));
    const fade = Math.pow(1 - t, .92);
    const baseFan = Math.pow(1 - t, .56);
    const merge = THREE.MathUtils.smoothstep(1 - t, .02, .92);
    const waves = 1 + irregularity * (
      Math.sin(9 * t + phase) * .35 +
      Math.sin(17 * t + phase * .7) * .18 +
      Math.sin(29 * t + phase * .43) * .09
    );
    const spread = reach * fade * waves;
    const innerRadius = trunkRadius * (.8 + .18 * fade);
    const shoulderRadius = trunkRadius * (.92 + .24 * merge) + spread * (.34 + .08 * baseFan);
    const outerRadius = trunkRadius * (1.0 + .28 * merge) + spread * (1.02 + .14 * baseFan);
    const halfWidth = (width * (1.02 + .78 * baseFan) * (1 + .06 * Math.sin(12 * t + phase)) + .22) * (1 - .03 * t);
    const edgeWidth = halfWidth * .94;
    const shoulderWidth = halfWidth * .62;
    const centerWobble = Math.sin(t * 9 + phase) * .05;
    const pts = [
      center.clone().addScaledVector(radial, innerRadius).addScaledVector(tangent, -edgeWidth),
      center.clone().addScaledVector(radial, shoulderRadius).addScaledVector(tangent, -shoulderWidth),
      center.clone().addScaledVector(radial, outerRadius * .9).addScaledVector(tangent, -halfWidth * .16),
      center.clone().addScaledVector(radial, outerRadius).addScaledVector(tangent, centerWobble),
      center.clone().addScaledVector(radial, outerRadius * .9).addScaledVector(tangent, halfWidth * .16),
      center.clone().addScaledVector(radial, shoulderRadius).addScaledVector(tangent, shoulderWidth),
      center.clone().addScaledVector(radial, innerRadius).addScaledVector(tangent, edgeWidth)
    ];
    for (const point of pts) positions.push(point.x, point.y, point.z);
    for (const u of [0, .14, .32, .5, .68, .86, 1]) uvs.push(u, y * .15);
    if (i < sections) {
      const a = i * rowWidth;
      for (let j = 0; j < rowWidth - 1; j++) {
        indices.push(a + j, a + j + 1, a + j + rowWidth);
        indices.push(a + j + 1, a + j + rowWidth + 1, a + j + rowWidth);
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
function angleDelta(a, b) {
  return Math.atan2(Math.sin(a - b), Math.cos(a - b));
}
function buttressInfluence(theta, spec, rowT) {
  const diff = Math.abs(angleDelta(theta, spec.angle));
  const sigma = 0.68 + (1 - rowT) * 0.28;
  return Math.exp(-(diff * diff) / (2 * sigma * sigma));
}
function createButtressWeb(specs) {
  const radialSegments = 88;
  const rows = 15;
  const positions = [];
  const uvs = [];
  const indices = [];
  for (let r = 0; r <= rows; r++) {
    const t = r / rows;
    const y = -.22 + t * 8.8;
    const center = trunkCenterAt(y);
    const trunkRadius = trunkRadiusAt(Math.max(y, 0));
    for (let s = 0; s <= radialSegments; s++) {
      const theta = s / radialSegments * Math.PI * 2;
      let flare = trunkRadius * (0.08 + 0.1 * (1 - t));
      for (const spec of specs) {
        flare += spec.reach * 0.46 * Math.pow(1 - t, 1.18) * buttressInfluence(theta, spec, t);
      }
      flare += 0.06 * Math.sin(theta * 5 + t * 4) * (1 - t);
      const radius = trunkRadius * (0.9 + 0.04 * t) + flare;
      const x = center.x + Math.cos(theta) * radius;
      const z = center.z + Math.sin(theta) * radius;
      positions.push(x, y, z);
      uvs.push(s / radialSegments, t);
      if (r < rows && s < radialSegments) {
        const a = r * (radialSegments + 1) + s;
        indices.push(a, a + radialSegments + 1, a + 1, a + 1, a + radialSegments + 1, a + radialSegments + 2);
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
const buttressSpecs = [];
const sectorWeights = [1.24, .86, 1.08, .74, 1.18, .92];
for (let i = 0; i < config.trunk.buttressCount; i++) {
  const spec = {
    angle: i * Math.PI * 2 / config.trunk.buttressCount + between(-.12, .12),
    height: between(10.8, 14.6),
    reach: between(3.8, 5.8) * sectorWeights[i % sectorWeights.length],
    width: between(1.0, 1.75) * sectorWeights[i % sectorWeights.length] * .88,
    lift: between(-.14, .14)
  };
  buttressSpecs.push(spec);
}
const buttressWeb = new THREE.Mesh(createButtressWeb(buttressSpecs), bark);
buttressWeb.material.side = THREE.DoubleSide;
scene.add(buttressWeb);
for (const spec of buttressSpecs) {
  const rib = new THREE.Mesh(createButtressRib(spec.angle, spec.height, spec.reach, spec.width, spec.lift), bark);
  rib.material.side = THREE.DoubleSide;
  scene.add(rib);
}
// Smaller connector buttresses soften the gaps between the main fins.
for (let i = 0; i < buttressSpecs.length; i++) {
  const a = buttressSpecs[i];
  const b = buttressSpecs[(i + 1) % buttressSpecs.length];
  const midAngle = Math.atan2(Math.sin(a.angle) + Math.sin(b.angle), Math.cos(a.angle) + Math.cos(b.angle));
  const joiner = new THREE.Mesh(
    createButtressRib(midAngle, Math.min(a.height, b.height) * between(.58, .74), (a.reach + b.reach) * between(.18, .28), (a.width + b.width) * between(.34, .48), between(-.08, .08)),
    i % 2 === 0 ? barkLight : bark
  );
  joiner.material.side = THREE.DoubleSide;
  scene.add(joiner);
}
// Blend collars bridge neighbouring buttresses so the trunk base reads as one continuous organism.
const baseBlendCount = buttressSpecs.length;
for (let i = 0; i < baseBlendCount; i++) {
  const a = buttressSpecs[i];
  const b = buttressSpecs[(i + 1) % baseBlendCount];
  const midAngle = Math.atan2(Math.sin(a.angle) + Math.sin(b.angle), Math.cos(a.angle) + Math.cos(b.angle));
  for (let j = 0; j < 4; j++) {
    const y = .85 + j * 1.25 + between(-.16, .16);
    const center = trunkCenterAt(y);
    const trunkRadius = trunkRadiusAt(y);
    const bridge = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), j % 2 === 0 ? bark : barkLight);
    const radialOffset = trunkRadius * (.82 + .08 * j);
    bridge.position.set(center.x + Math.cos(midAngle) * radialOffset, y, center.z + Math.sin(midAngle) * radialOffset);
    bridge.scale.set(between(1.25, 2.2), between(.75, 1.45), between(1.15, 1.95));
    bridge.rotation.set(between(-.18, .18), midAngle, between(-.22, .22));
    scene.add(bridge);
  }
}
useLayer('surfaceRoots');
// Raised surface roots radiate from the buttress base and gently sink into soil.
// Their origin overlaps the trunk; tips remain low so plants can surround them.
for (let i = 0; i < 13; i++) {
  const angle = i * Math.PI * 2 / 13 + between(-.19, .19);
  const radial = vec(Math.cos(angle), 0, Math.sin(angle));
  const tangent = vec(-Math.sin(angle), 0, Math.cos(angle));
  const center = trunkCenterAt(-.12);
  const distance = between(5.6, 13.5);
  const start = center.clone().addScaledVector(radial, trunkRadiusAt(0) * .77);
  start.y = between(.05, .32);
  const mid = start.clone().addScaledVector(radial, distance * .47)
    .addScaledVector(tangent, between(-.8, .8));
  mid.y = between(.12, .38);
  const end = start.clone().addScaledVector(radial, distance)
    .addScaledVector(tangent, between(-1.3, 1.3));
  end.y = between(-.29, -.11);
  const curve = new THREE.CatmullRomCurve3([start, mid, end]);
  const radius = between(.16, .35);
  const root = new THREE.Mesh(new THREE.TubeGeometry(curve, 21, radius, 7), bark);
  scene.add(root);
  for (let j = 0; j < 2; j++) {
    const origin = curve.getPoint(between(.4, .8));
    const tip = origin.clone().addScaledVector(radial, between(1.0, 2.7))
      .addScaledVector(tangent, between(-1.5, 1.5));
    tip.y = -.23;
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([origin, origin.clone().lerp(tip, .5).add(vec(0, .08, 0)), tip]),
      9, radius * .3, 5), barkLight));
  }
}
useLayer('underground');
// Recover more subterranean mass around the trunk base so the below-ground
// chapter feels fuller again.
for (let i = 0; i < 6; i++) {
  const angle = i * Math.PI * 2 / 6 + between(-0.28, 0.28);
  const y = between(-1.7, 1.0);
  const center = trunkCenterAt(Math.max(y, -0.8));
  const mound = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), i % 2 === 0 ? bark : barkLight);
  const radial = trunkRadiusAt(Math.max(y, 0)) * between(0.42, 0.66);
  mound.position.set(center.x + Math.cos(angle) * radial, y, center.z + Math.sin(angle) * radial);
  mound.scale.set(between(1.2, 1.95), between(1.6, 3.1), between(1.0, 1.75));
  mound.rotation.set(between(-0.25, 0.25), angle, between(-0.25, 0.25));
  scene.add(mound);
}
// Strong buttress roots continue into the darker underground section.
for (let i = 0; i < 11; i++) {
  const a = i * Math.PI * 2 / 11 + between(-.16, .16);
  const outer = vec(Math.cos(a) * between(8, 17), between(-4.8, -.9), Math.sin(a) * between(8, 17));
  const mid = vec(Math.cos(a) * between(3, 6), between(-2.1, .7), Math.sin(a) * between(3, 6));
  const curve = new THREE.CatmullRomCurve3([trunkCenterAt(1.8), mid, outer]);
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 15, between(.32, .62), 6), barkLight);
  scene.add(mesh);
  for (let j = 0; j < 4; j++) {
    const tip = outer.clone().add(vec(between(-4, 4), between(-1, -3), between(-4, 4)));
    branch(outer, tip, .18, .025, bark, 5);
  }
}
useLayer('terrain');
// The soil is a bounded cross-section rather than a solid opaque floor above the camera.
const soil = new THREE.Mesh(new THREE.CylinderGeometry(23, 24, 2.1, 40), earth);
soil.position.y = -5.8;
scene.add(soil);
// Swamp rotated into the viewer-facing side so it is visible earlier in the ascent.
const swampCenter = vec(7.4, 0, 6.2);
function swampDepth(x, z) {
  const dx = (x - swampCenter.x) / 8.4;
  const dz = (z - swampCenter.z) / 5.8;
  const ellipse = dx * dx + dz * dz;
  if (ellipse >= 1) return 0;
  const falloff = Math.pow(1 - ellipse, 1.7);
  return falloff * .68;
}
function terrainHeight(x, z) {
  const distance = Math.hypot(x, z);
  const fade = 1 - THREE.MathUtils.smoothstep(distance, 8, 29);
  const base = -.14 + fade * (
    .17 * Math.sin(x * .57) * Math.cos(z * .49) +
    .09 * Math.sin(x * 1.34 + z * .38) +
    .06 * Math.cos(z * 1.92 - x * .41)
  );
  return base - swampDepth(x, z);
}
function createTerrain() {
  const rings = 38;
  const sides = 96;
  const positions = [];
  const uvs = [];
  const indices = [];
  for (let r = 0; r <= rings; r++) {
    const radius = 1.9 + (100 - 1.9) * r / rings;
    for (let s = 0; s <= sides; s++) {
      const angle = s * 2 * Math.PI / sides;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      positions.push(x, terrainHeight(x, z), z);
      uvs.push(x * .06, z * .06);
      if (r < rings && s < sides) {
        const a = r * (sides + 1) + s;
        indices.push(a, a + sides + 1, a + 1, a + 1, a + sides + 1, a + sides + 2);
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
const floor = new THREE.Mesh(
  createTerrain(),
  new THREE.MeshStandardMaterial({ color: '#273124', roughness: 1, side: THREE.DoubleSide, flatShading: true })
);
scene.add(floor);
// One side of the kapok sits in a shallow wetland pocket rather than on perfectly dry, flat soil.
// Densely tessellated disc so waves can deform the surface rather than only its outline.
function makePondGeometry(radius = 5.9, rings = 54, sectors = 96) {
  const vertices = [0, 0, 0];
  const uv = [.5, .5];
  const triangles = [];
  for (let ring = 1; ring <= rings; ring++) {
    const distance = radius * ring / rings;
    for (let section = 0; section < sectors; section++) {
      const angle = section / sectors * Math.PI * 2;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      vertices.push(x, y, 0);
      uv.push((x / radius + 1) / 2, (y / radius + 1) / 2);
    }
  }
  for (let section = 0; section < sectors; section++) {
    triangles.push(0, 1 + section, 1 + (section + 1) % sectors);
  }
  for (let ring = 1; ring < rings; ring++) {
    const current = 1 + (ring - 1) * sectors;
    const next = current + sectors;
    for (let section = 0; section < sectors; section++) {
      const nextSection = (section + 1) % sectors;
      triangles.push(current + section, next + section, current + nextSection);
      triangles.push(current + nextSection, next + section, next + nextSection);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(triangles);
  geo.computeVertexNormals();
  return geo;
}
const swampWaterGeometry = makePondGeometry();
const swampWater = new THREE.Mesh(
  swampWaterGeometry,
  new THREE.MeshPhysicalMaterial({ color: '#536e59', roughness: .18, metalness: 0, transmission: .06, transparent: true, opacity: .94, clearcoat: .63, side: THREE.DoubleSide })
);
swampWater.rotation.x = -Math.PI / 2;
swampWater.position.set(swampCenter.x, -0.17, swampCenter.z);
swampWater.scale.set(1.38, 1.0, 1);
scene.add(swampWater);
const swampWaterPositions = swampWaterGeometry.attributes.position;
const swampWaterBasePositions = Float32Array.from(swampWaterPositions.array);
const swampWaterState = { mesh: swampWater, positions: swampWaterPositions, basePositions: swampWaterBasePositions };
const floatingWaterLeaves = [];
const waterLeafShape = new THREE.Shape();
waterLeafShape.moveTo(0, .32);
waterLeafShape.quadraticCurveTo(.22, .18, .15, -.05);
waterLeafShape.quadraticCurveTo(0, -.32, -.15, -.05);
waterLeafShape.quadraticCurveTo(-.22, .18, 0, .32);
const waterLeafGeo = new THREE.ShapeGeometry(waterLeafShape);
const waterLeafMats = ['#6d8a48', '#879d58', '#5d783d'].map(color => new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, roughness: .95 }));
for (let i = 0; i < 8; i++) {
  const angle = .4 + i * .58;
  const radius = 3.1 + (i % 3) * .75 + Math.sin(i * 1.7) * .25;
  const leaf = new THREE.Mesh(waterLeafGeo, waterLeafMats[i % waterLeafMats.length]);
  leaf.rotation.x = -Math.PI / 2;
  leaf.rotation.z = angle + (i % 2 ? .35 : -.22);
  leaf.scale.set(.58 + (i % 4) * .1, .84 + (i % 3) * .08, 1);
  leaf.position.set(swampCenter.x + Math.cos(angle) * radius * 1.18, -0.135 + Math.sin(i * 2.1) * .01, swampCenter.z + Math.sin(angle) * radius * .88);
  leaf.userData = { baseX: leaf.position.x, baseY: leaf.position.y, baseZ: leaf.position.z, baseRot: leaf.rotation.z, phase: i * .8, speed: .65 + i * .05 };
  scene.add(leaf);
  floatingWaterLeaves.push(leaf);
}
// Graduated, irregular shoreline: wet silt next to the pond blends into forest earth.
// These annular bands follow the same elliptical footprint as the pond and are
// offset just above the soil. No random calls: other subsystems keep their seeds.
function createShoreBand(inner, outer, yOffset = .022) {
  const segments = 128;
  const rings = 7;
  const positions = [];
  const uv = [];
  const indices = [];
  for (let r = 0; r <= rings; r++) {
    const t = r / rings;
    for (let i = 0; i <= segments; i++) {
      const a = i / segments * Math.PI * 2;
      const wobble = 1 + .047 * Math.sin(a * 7 + .3) + .025 * Math.cos(a * 13 - .8);
      const radius = THREE.MathUtils.lerp(inner, outer, t) * wobble;
      const x = swampCenter.x + Math.cos(a) * radius * 1.38;
      const z = swampCenter.z + Math.sin(a) * radius;
      // Soil at the waterline is visibly lower and gradually rejoins the terrain.
      const wetness = 1 - THREE.MathUtils.smoothstep(t, .08, .9);
      const y = THREE.MathUtils.lerp(terrainHeight(x, z), -.185, wetness * .75) + yOffset;
      positions.push(x, y, z);
      uv.push(t, i / segments);
      if (r < rings && i < segments) {
        const n = r * (segments + 1) + i;
        indices.push(n, n + segments + 1, n + 1, n + 1, n + segments + 1, n + segments + 2);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
const shoreMaterials = [
  new THREE.MeshStandardMaterial({ color: '#524c34', roughness: .96, side: THREE.DoubleSide, transparent: true, opacity: .95, depthWrite: true }),
  new THREE.MeshStandardMaterial({ color: '#484b32', roughness: 1, side: THREE.DoubleSide, transparent: true, opacity: .88, depthWrite: false })
];
const wetBank = new THREE.Mesh(createShoreBand(5.2, 6.45, .032), shoreMaterials[0]);
const earthBank = new THREE.Mesh(createShoreBand(6.25, 7.9, .045), shoreMaterials[1]);
scene.add(earthBank, wetBank);
// Sparse pebbles and hummocks trace the visible shore, without a circular stone border.
const bankStone = new THREE.DodecahedronGeometry(1, 0);
const bankMaterial = new THREE.MeshStandardMaterial({ color: '#655e49', roughness: 1, flatShading: true });
for (let i = 0; i < 38; i++) {
  const a = i * 2.399963 + Math.sin(i * 8.31) * .15;
  const r = 6.5 + .95 * Math.sin(i * 2.73);
  const x = swampCenter.x + Math.cos(a) * r * 1.38;
  const z = swampCenter.z + Math.sin(a) * r;
  const stone = new THREE.Mesh(bankStone, bankMaterial);
  const size = .12 + .19 * (0.5 + 0.5 * Math.sin(i * 17.1));
  stone.scale.set(size * 1.8, size * .42, size);
  stone.position.set(x, terrainHeight(x, z) + size * .12, z);
  stone.rotation.y = a;
  scene.add(stone);
}
const marshMaterials = ['#3a5a2c', '#56733a', '#719049'].map(color =>
  new THREE.MeshStandardMaterial({ color, roughness: .94, side: THREE.DoubleSide }));
for (let i = 0; i < 18; i++) {
  const tuft = new THREE.Group();
  const angle = between(0, Math.PI * 2);
  const radius = between(4.6, 7.2);
  const x = swampCenter.x + Math.cos(angle) * radius;
  const z = swampCenter.z + Math.sin(angle) * radius * .86;
  const y = terrainHeight(x, z) - .03;
  tuft.position.set(x, y, z);
  for (let j = 0; j < betweenInt(4, 7); j++) {
    const blade = new THREE.Mesh(new THREE.PlaneGeometry(.09, between(.8, 1.4)), marshMaterials[(i + j) % marshMaterials.length]);
    blade.position.y = .35 + j * .02;
    blade.rotation.set(between(-.18, .18), between(0, Math.PI * 2), between(-.42, .42));
    tuft.add(blade);
  }
  scene.add(tuft);
}
// A continuous earth ceiling closes the underground view without blocking the
// surface chapter. The annular opening leaves the trunk and buttress roots visible.
const earthCeilingMaterial = new THREE.MeshStandardMaterial({
  color: '#28261b', roughness: 1, side: THREE.DoubleSide,
  transparent: true, opacity: 1, depthWrite: true
});
const earthCeiling = new THREE.Mesh(new THREE.RingGeometry(2.25, 95, 64, 1), earthCeilingMaterial);
earthCeiling.rotation.x = -Math.PI / 2;
earthCeiling.position.y = -.23;
scene.add(earthCeiling);
// The underside has shallow strata, giving the roof visible earth texture.
const ceilingStrata = new THREE.Group();
scene.add(ceilingStrata);
const ceilingColors = ['#302c21', '#463b2b', '#4a4533'].map(color =>
  new THREE.MeshStandardMaterial({ color, roughness: 1, flatShading: true }));
for (let i = 0; i < 90; i++) {
  const angle = between(0, Math.PI * 2);
  const radius = between(3.1, 24);
  const shard = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), ceilingColors[i % ceilingColors.length]);
  shard.position.set(Math.cos(angle) * radius, between(-.44, -.30), Math.sin(angle) * radius);
  shard.scale.set(between(.35, 1.4), between(.06, .18), between(.4, 1.7));
  ceilingStrata.add(shard);
}
useLayer('groundLife');
// Understory: procedural low-poly plants and soil details, all generated locally.
// Kept in a separate group so the forest floor can be developed without changing the camera.
const forestFloorLife = new THREE.Group();
scene.add(forestFloorLife);
const dirtMaterials = ['#34291b', '#574431', '#766244', '#444832'].map(color =>
  new THREE.MeshStandardMaterial({ color, roughness: 1, flatShading: true }));
const fernMaterials = ['#30582b', '#497737', '#709247', '#87a251'].map(color =>
  new THREE.MeshStandardMaterial({ color, roughness: .94, flatShading: true, side: THREE.DoubleSide }));
const mushroomStalk = new THREE.MeshStandardMaterial({ color: '#d5c9a4', roughness: 1, flatShading: true });
const mushroomCaps = ['#a36d3e', '#c78b57', '#adac73', '#e2be85'].map(color =>
  new THREE.MeshStandardMaterial({ color, roughness: 1, flatShading: true, side: THREE.DoubleSide }));
const groundHeight = -.14;
function groundPoint(minRadius = 3.6, maxRadius = 18) {
  const a = between(0, Math.PI * 2);
  const r = Math.sqrt(between(minRadius * minRadius, maxRadius * maxRadius));
  const x = Math.cos(a) * r;
  const z = Math.sin(a) * r;
  return vec(x, terrainHeight(x, z), z);
}
/** Adds a tapered, naturally curved blade of foliage. */
function placeBlade(parent, origin, angle, length, material, width = .12, lean = .52) {
  const center = origin.clone().add(vec(Math.cos(angle) * lean * length, length * .62, Math.sin(angle) * lean * length));
  const tip = origin.clone().add(vec(Math.cos(angle) * length * .85, length, Math.sin(angle) * length * .85));
  const axis = new THREE.CatmullRomCurve3([origin, center, tip]);
  // A flat ribbon with a shaped tip reads as a real leaf, not a sharp cone.
  const points = [], indices = [];
  const segments = 7;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const p = axis.getPoint(t);
    const w = width * Math.sin(Math.PI * t) ** .7;
    points.push(p.x - Math.sin(angle) * w, p.y, p.z + Math.cos(angle) * w);
    points.push(p.x + Math.sin(angle) * w, p.y, p.z - Math.cos(angle) * w);
    if (i < segments) { const k = i * 2; indices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  parent.add(new THREE.Mesh(geometry, material));
}
// Ferns: arched fronds with rounded side leaflets along each midrib.
for (let i = 0; i < 68; i++) {
  const point = groundPoint(3.1, 17);
  const fern = new THREE.Group();
  fern.position.copy(point);
  for (let frond = 0; frond < 5; frond++) {
    const angle = frond * Math.PI * 2 / 5 + between(-.2, .2);
    const length = between(.45, 1.2);
    placeBlade(fern, vec(0, 0, 0), angle, length, fernMaterials[i % fernMaterials.length], .13, .72);
    for (let n = 1; n <= 4; n++) {
      const t = n / 5;
      const rootlet = vec(Math.cos(angle) * length * t * .65, length * t * .68, Math.sin(angle) * length * t * .65);
      for (const side of [-1, 1]) {
        placeBlade(fern, rootlet, angle + side * 1.1, length * (.30 - t * .11), fernMaterials[(i + n) % fernMaterials.length], .05, .65);
      }
    }
  }
  forestFloorLife.add(fern);
}
// Tufts and small shrubs: clumped low foliage, not a uniform grass carpet.
for (let i = 0; i < 190; i++) {
  const point = groundPoint(2.9, 22);
  const tuft = new THREE.Group();
  const blades = i % 6 === 0 ? 12 : 5;
  for (let j = 0; j < blades; j++) {
    placeBlade(tuft, vec(between(-.12, .12), 0, between(-.12, .12)),
      j * Math.PI * 2 / blades + between(-.17, .17), between(.18, i % 6 === 0 ? 1.1 : .55),
      fernMaterials[Math.floor(random() * fernMaterials.length)], between(.026, .09), .7);
  }
  tuft.position.copy(point);
  forestFloorLife.add(tuft);
}
// Distinct mushroom silhouettes: pale stems and broad, slightly flared caps.
const capGeometry = new THREE.CylinderGeometry(.07, .27, .18, 9, 1);
const stalkGeometry = new THREE.CylinderGeometry(.046, .07, .48, 7);
for (let i = 0; i < 47; i++) {
  const point = groundPoint(3.0, 14);
  const clusterSize = i % 4 === 0 ? 3 : 1;
  for (let j = 0; j < clusterSize; j++) {
    const height = between(.22, .67);
    const scale = height / .48;
    const offset = vec(between(-.28, .28), 0, between(-.28, .28));
    const stem = new THREE.Mesh(stalkGeometry, mushroomStalk);
    stem.scale.setScalar(scale);
    stem.position.copy(point).add(offset).add(vec(0, height * .5, 0));
    forestFloorLife.add(stem);
    const cap = new THREE.Mesh(capGeometry, mushroomCaps[(i + j) % mushroomCaps.length]);
    cap.position.copy(point).add(offset).add(vec(0, height, 0));
    cap.scale.set(scale, scale * .8, scale);
    forestFloorLife.add(cap);
  }
}
// Leaf litter and broken bark sit directly on the forest floor.
const litterGeometry = new THREE.PlaneGeometry(1, .34);
for (let i = 0; i < 210; i++) {
  const point = groundPoint(2.6, 22);
  const litter = new THREE.Mesh(litterGeometry, dirtMaterials[i % dirtMaterials.length]);
  litter.rotation.set(-Math.PI / 2, 0, between(0, Math.PI * 2));
  litter.position.copy(point).add(vec(0, .014, 0));
  litter.scale.set(between(.13, .57), between(.2, .8), 1);
  forestFloorLife.add(litter);
}
useLayer('stones');
// Surface details: stones, humus mounds and low irregular terrain clutter.
const surfaceMaterials = ['#3c3528', '#554938', '#776d55', '#403d30'].map(color =>
  new THREE.MeshStandardMaterial({ color, roughness: 1, flatShading: true }));
const pebbleGeometry = new THREE.DodecahedronGeometry(1, 0);
const moundGeometry = new THREE.IcosahedronGeometry(1, 1);
for (let i = 0; i < config.ground.stoneCount; i++) {
  const a = between(0, Math.PI * 2);
  const r = between(3.6, 26);
  const x = Math.cos(a) * r;
  const z = Math.sin(a) * r;
  const stone = new THREE.Mesh(pebbleGeometry, surfaceMaterials[i % surfaceMaterials.length]);
  const size = between(.11, .55);
  stone.position.set(x, terrainHeight(x, z) + size * .13, z);
  stone.scale.set(size * between(.7, 1.5), size * between(.25, .65), size * between(.8, 1.5));
  stone.rotation.set(between(-.3, .3), between(0, Math.PI), between(-.3, .3));
  scene.add(stone);
}
for (let i = 0; i < config.ground.moundCount; i++) {
  const a = between(0, Math.PI * 2);
  const r = between(4.3, 23);
  const x = Math.cos(a) * r;
  const z = Math.sin(a) * r;
  const mound = new THREE.Mesh(moundGeometry, surfaceMaterials[i % 2]);
  mound.position.set(x, terrainHeight(x, z) - .06, z);
  mound.scale.set(between(.55, 1.6), between(.09, .25), between(.55, 1.4));
  scene.add(mound);
}
useLayer('underground');
// Underground cut-away: low-poly earth bands and fine roots are placed below
// the surface and remain independent of the existing 0.6 m camera anchor.
const underground = new THREE.Group();
scene.add(underground);
const soilBandMaterials = ['#352b21', '#473725', '#55422e', '#2e291f'].map(color =>
  new THREE.MeshStandardMaterial({ color, roughness: 1, flatShading: true, side: THREE.DoubleSide }));
for (let band = 0; band < 3; band++) {
  const y = -1.05 - band * 1.35;
  // Irregular horizontal slices imply stratified soil rather than a blank void.
  for (let i = 0; i < 26; i++) {
    const angle = i * Math.PI * 2 / 26;
    const radius = between(16, 23);
    const clod = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), soilBandMaterials[(band + i) % 4]);
    clod.position.set(Math.cos(angle) * radius, y + between(-.32, .32), Math.sin(angle) * radius);
    clod.scale.set(between(.65, 2), between(.17, .45), between(.5, 1.6));
    underground.add(clod);
  }
}
const rootFilamentMaterials = ['#665238', '#8b7652', '#4d4330'].map(color =>
  new THREE.MeshStandardMaterial({ color, roughness: 1, flatShading: true }));
for (let i = 0; i < 170; i++) {
  const angle = between(0, Math.PI * 2);
  const r = between(2.4, 17.5);
  const start = vec(Math.cos(angle) * r, between(-2.4, -.4), Math.sin(angle) * r);
  const end = start.clone().add(vec(between(-2.7, 2.7), between(-1.9, -.4), between(-2.7, 2.7)));
  const middle = start.clone().lerp(end, .5).add(vec(between(-.45, .45), -.16, between(-.45, .45)));
  const filament = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([start, middle, end]), 7, between(.012, .045), 4), rootFilamentMaterials[i % 3]);
  underground.add(filament);
}
for (let i = 0; i < 170; i++) {
  const position = groundPoint(4.5, 19);
  const pebble = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), dirtMaterials[i % dirtMaterials.length]);
  pebble.position.set(position.x, between(-3.6, -.6), position.z);
  pebble.scale.set(between(.035, .15), between(.04, .14), between(.035, .16));
  underground.add(pebble);
}

// Large foreground root: passes diagonally down the right-hand underground
// composition to provide spatial depth without covering the footer typography.
const foregroundRoot = new THREE.Group();
scene.add(foregroundRoot);
const rootPath = new THREE.CatmullRomCurve3([
  vec(5.7, -.9, 4.1),
  vec(6.1, -1.8, 6.0),
  vec(7.0, -3.3, 8.5),
  vec(8.5, -5.2, 10.2),
  vec(10.8, -7.2, 13.0)
]);
const foregroundRootMesh = new THREE.Mesh(
  new THREE.TubeGeometry(rootPath, 35, .74, 9, false), barkLight
);
foregroundRoot.add(foregroundRootMesh);
for (let i = 0; i < 8; i++) {
  const t = .15 + i * .09;
  const base = rootPath.getPoint(t);
  const angle = i * 2.4;
  const tip = base.clone().add(vec(Math.cos(angle) * between(.6, 1.7), between(-1.1, -.35), Math.sin(angle) * between(.6, 1.8)));
  const twig = new THREE.Mesh(new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([base, base.clone().lerp(tip, .55).add(vec(0, -.12, 0)), tip]), 8, .075, 5
  ), bark);
  foregroundRoot.add(twig);
}
// Extra compact soil clumps visually occupy the lower edge of the root chamber.
for (let i = 0; i < 65; i++) {
  const a = between(-.6, 2.8);
  const r = between(7, 19);
  const clod = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), soilBandMaterials[i % soilBandMaterials.length]);
  clod.position.set(Math.cos(a) * r, between(-5.7, -4.2), Math.sin(a) * r);
  clod.scale.set(between(.3, 1.3), between(.2, .65), between(.3, 1.4));
  underground.add(clod);
}
// A continuous tapered mesh follows the same curve used for child attachments.
function curvedBranch(curve, r0, r1, material = bark, rings = 18, sides = 9) {
  const vertices = [];
  const indices = [];
  const frames = curve.computeFrenetFrames(rings, false);
  for (let i = 0; i <= rings; i++) {
    const t = i / rings;
    const center = curve.getPointAt(t);
    const radius = THREE.MathUtils.lerp(r0, r1, t) * (1 + .035 * Math.sin(t * Math.PI));
    for (let j = 0; j < sides; j++) {
      const angle = j * 2 * Math.PI / sides;
      const normal = frames.normals[i].clone().multiplyScalar(Math.cos(angle));
      normal.addScaledVector(frames.binormals[i], Math.sin(angle));
      const point = center.clone().addScaledVector(normal, radius);
      vertices.push(point.x, point.y, point.z);
      if (i < rings) {
        const a = i * sides + j;
        const b = i * sides + (j + 1) % sides;
        indices.push(a, b, a + sides, b, b + sides, a + sides);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  return mesh;
}
useLayer('branches');
// Crown branches: three dominant leaders continue upward and carry the denser
// canopy. Secondary and tertiary branches emerge inward and outward from them.
const leafAnchors = [];
const majorLeaders = [];
const leaderBaseHeights = [32.8, 35.1, 37.1];
const leaderAngles = [-0.6, 1.55, 3.65];
for (let i = 0; i < 3; i++) {
  const start = trunkCenterAt(leaderBaseHeights[i]);
  const angle = leaderAngles[i] + between(-0.26, 0.26);
  const end = start.clone().add(vec(Math.cos(angle) * between(4.6, 7.2), between(8.4, 10.2), Math.sin(angle) * between(4.6, 7.2)));
  const mid = start.clone().lerp(end, .48).add(vec(
    Math.cos(angle + Math.PI * .5) * between(-.8, .8), between(1.0, 2.4), Math.sin(angle + Math.PI * .5) * between(-.8, .8)
  ));
  const leaderThickness = between(.92, 1.36);
  const curve = new THREE.CatmullRomCurve3([start, mid, end]);
  curvedBranch(curve, leaderThickness, leaderThickness * .24, bark, 28, 11);
  majorLeaders.push({ start, mid, end, angle, thickness: leaderThickness, curve });
  // continuation twigs so the tree doesn't feel flat-cut on top
  const tipCount = betweenInt(2, 3);
  for (let t = 0; t < tipCount; t++) {
    const tipDir = angle + between(-.55, .55);
    const tipEnd = end.clone().add(vec(Math.cos(tipDir) * between(1.0, 2.8), between(1.2, 2.9), Math.sin(tipDir) * between(1.0, 2.8)));
    branch(end, tipEnd, leaderThickness * .14, .035, bark, 6);
    leafAnchors.push({ point: tipEnd.clone(), direction: tipDir, size: between(1.0, 1.35), kind: 'leader-tip' });
  }
}
const primaryBranchTargets = [];
for (const leader of majorLeaders) {
  const primaryCount = betweenInt(config.canopy.primaryMin, config.canopy.primaryMax);
  for (let i = 0; i < primaryCount; i++) {
    const t = between(.22, .91);
    const start = leader.curve.getPoint(t);
    const side = i % 2 === 0 ? 1 : -1;
    const angle = leader.angle + side * between(.38, 1.2);
    const horizontalLength = between(4.5, 8.6) * (1.08 - t * .15);
    const lift = between(.1, 2.2);
    const end = start.clone().add(vec(Math.cos(angle) * horizontalLength, lift, Math.sin(angle) * horizontalLength));
    const mid = start.clone().lerp(end, .58).add(vec(
      Math.cos(angle + Math.PI * .5) * between(-.9, .9), between(.1, 1.1), Math.sin(angle + Math.PI * .5) * between(-.9, .9)
    ));
    const thickness = leader.thickness * between(.4, .62);
    const curve = new THREE.CatmullRomCurve3([start, mid, end]);
    curvedBranch(curve, thickness, thickness * .14, bark, 18, 8);
    primaryBranchTargets.push({ start, end, angle, thickness, curve });
    leafAnchors.push({ point: end.clone(), direction: angle, size: between(1.18, 1.62), kind: 'primary-end' });
  }
}
// Rear-right gap fill: a connected branch family, not free-floating foliage.
// Branches originate on the second leader and carry their own visible twigs.
{
  const leader = majorLeaders[1];
  for (const fraction of [.34, .57, .78]) {
    const start = leader.curve.getPoint(fraction);
    const angle = leader.angle - between(.38, .78);
    const length = between(5.8, 8.4);
    const mid = start.clone().add(vec(Math.cos(angle) * length * .49,
      between(.35, 1.4), Math.sin(angle) * length * .49));
    const end = start.clone().add(vec(Math.cos(angle) * length,
      between(1.4, 2.8), Math.sin(angle) * length));
    const curve = new THREE.CatmullRomCurve3([start, mid, end]);
    const thickness = leader.thickness * between(.32, .44);
    curvedBranch(curve, thickness, .055, bark, 18, 8);
    primaryBranchTargets.push({ start, end, angle, thickness, curve });
    leafAnchors.push({ point: end.clone(), direction: angle, size: between(1.0, 1.3), kind: 'primary-end' });
  }
}
// Two supplementary crown limbs cover rear and right-side gaps.
for (const [index, side] of [0, 1].entries()) {
  const leader = majorLeaders[index === 0 ? 0 : 2];
  const start = leader.curve.getPoint(index === 0 ? .48 : .7);
  const angle = index === 0 ? -.16 : -1.1;
  const mid = start.clone().add(vec(
    Math.cos(angle) * 3.8, between(.55, 1.5), Math.sin(angle) * 3.8
  ));
  const end = start.clone().add(vec(
    Math.cos(angle) * between(7.5, 9.2), between(2.0, 3.6),
    Math.sin(angle) * between(7.5, 9.2)
  ));
  const curve = new THREE.CatmullRomCurve3([start, mid, end]);
  const thickness = leader.thickness * between(.32, .43);
  curvedBranch(curve, thickness, .055, bark, 23, 9);
  primaryBranchTargets.push({ start, end, angle, thickness, curve });
  leafAnchors.push({ point: end.clone(), direction: angle, size: 1.3, kind: 'primary-end' });
}
// Fill the remaining right/rear canopy voids with two larger articulated limbs.
for (const fill of [
  { leaderIndex: 1, t: .62, angle: -.48, len: 8.7, rise: 2.8 },
  { leaderIndex: 2, t: .78, angle: .22, len: 7.4, rise: 2.2 }
]) {
  const leader = majorLeaders[fill.leaderIndex];
  const start = leader.curve.getPoint(fill.t);
  const mid = start.clone().add(vec(Math.cos(fill.angle) * (fill.len * .42), between(.5, 1.2), Math.sin(fill.angle) * (fill.len * .42)));
  const end = start.clone().add(vec(Math.cos(fill.angle) * fill.len, fill.rise + between(.2, .9), Math.sin(fill.angle) * fill.len));
  const curve = new THREE.CatmullRomCurve3([start, mid, end]);
  const thickness = leader.thickness * between(.31, .39);
  curvedBranch(curve, thickness, .052, bark, 20, 8);
  primaryBranchTargets.push({ start, end, angle: fill.angle, thickness, curve });
  leafAnchors.push({ point: end.clone(), direction: fill.angle, size: between(1.2, 1.45), kind: 'primary-end' });
  for (let b = 0; b < 2; b++) {
    const tt = .45 + b * .24 + between(-.06, .06);
    const origin = curve.getPoint(tt);
    const dir = fill.angle + between(-.88, .88);
    const branchLen = between(2.0, 3.6);
    const branchEnd = origin.clone().add(vec(Math.cos(dir) * branchLen, between(.12, .9), Math.sin(dir) * branchLen));
    const subCurve = new THREE.CatmullRomCurve3([origin, origin.clone().lerp(branchEnd, .55).add(vec(0, between(.12, .42), 0)), branchEnd]);
    curvedBranch(subCurve, thickness * between(.36, .48), .038, bark, 10, 6);
    leafAnchors.push({ point: branchEnd.clone(), direction: dir, size: between(.88, 1.08), kind: 'secondary' });
  }
}
for (const primary of primaryBranchTargets) {
  const secondaryCount = betweenInt(config.canopy.secondaryMin, config.canopy.secondaryMax);
  for (let i = 0; i < secondaryCount; i++) {
    const t = between(.28, .96);
    const origin = primary.curve.getPoint(t);
    const dir = primary.angle + between(-1.02, 1.02);
    const len = between(1.6, 4.4) * (1.03 - t * .24);
    const rise = between(-.1, 1.15);
    const end = origin.clone().add(vec(Math.cos(dir) * len, rise, Math.sin(dir) * len));
    const mid = origin.clone().lerp(end, .56).add(vec(
      Math.cos(dir + Math.PI * .5) * between(-.5, .5), between(.02, .55), Math.sin(dir + Math.PI * .5) * between(-.5, .5)
    ));
    const radius = primary.thickness * between(.28, .42);
    const secondaryCurve = new THREE.CatmullRomCurve3([origin, mid, end]);
    curvedBranch(secondaryCurve, radius, .04, bark, 12, 6);
    leafAnchors.push({ point: end.clone(), direction: dir, size: between(.92, 1.22), kind: 'secondary' });

    const spurCount = betweenInt(1, 2);
    for (let s = 0; s < spurCount; s++) {
      const spurDir = dir + between(-.72, .72);
      const spurEnd = end.clone().add(vec(Math.cos(spurDir) * between(.9, 2.1), between(-.06, .52), Math.sin(spurDir) * between(.9, 2.1)));
      branch(end, spurEnd, between(.06, .1), .02, bark, 5, { startJoint: true, endJoint: false, startJointScale: 1.05, startRandomness: .08 });
      leafAnchors.push({ point: spurEnd.clone(), direction: spurDir, size: between(.52, .78), kind: 'tertiary' });
    }

    const tertiaryCount = betweenInt(2, 4);
    for (let j = 0; j < tertiaryCount; j++) {
      const tt = between(.4, .98);
      const twigOrigin = secondaryCurve.getPoint(tt);
      const twigDir = dir + between(-1.0, 1.0);
      const twigLen = between(.8, 1.9);
      const twigEnd = twigOrigin.clone().add(vec(Math.cos(twigDir) * twigLen, between(-.06, .45), Math.sin(twigDir) * twigLen));
      branch(twigOrigin, twigEnd, between(.045, .075), .015, bark, 5);
      leafAnchors.push({ point: twigEnd.clone(), direction: twigDir, size: between(.58, .88), kind: 'tertiary' });

      const quaternaryCount = betweenInt(1, 2);
      for (let q = 0; q < quaternaryCount; q++) {
        const qDir = twigDir + between(-1.08, 1.08);
        const qEnd = twigEnd.clone().add(vec(Math.cos(qDir) * between(.45, 1.15), between(-.04, .28), Math.sin(qDir) * between(.45, 1.15)));
        branch(twigEnd, qEnd, between(.018, .03), .008, barkLight, 5, { startJoint: true, endJoint: false, startJointScale: 1.18, startSquash: 1.02, startRandomness: .08 });
        leafAnchors.push({ point: qEnd.clone(), direction: qDir, size: between(.38, .58), kind: 'quaternary' });
      }
    }
  }
}
/** Creates one slim kapok leaflet oriented along +Y. */
function createKapokLeaflet() {
  const positions = [], indices = [];
  const rows = 9;
  for (let row = 0; row <= rows; row++) {
    const t = row / rows;
    const width = Math.pow(Math.sin(Math.PI * t), .84) * (.04 + .11 * (1 - t * .12));
    const ridge = Math.sin(Math.PI * t) * .02;
    positions.push(-width, t * 1.05, ridge, width, t * 1.05, ridge);
    if (row < rows) {
      const a = row * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
function mergeTransformedGeometries(entries) {
  const positions = [];
  const indices = [];
  let vertexOffset = 0;
  for (const entry of entries) {
    const geometry = entry.geometry.clone();
    geometry.applyMatrix4(entry.matrix);
    const pos = geometry.getAttribute('position');
    for (let i = 0; i < pos.count; i++) positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
    const index = geometry.getIndex();
    if (index) {
      for (let i = 0; i < index.count; i++) indices.push(index.array[i] + vertexOffset);
    } else {
      for (let i = 0; i < pos.count; i += 3) indices.push(vertexOffset + i, vertexOffset + i + 1, vertexOffset + i + 2);
    }
    vertexOffset += pos.count;
  }
  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  merged.setIndex(indices);
  merged.computeVertexNormals();
  return merged;
}
function createCanopyMassGeometry() {
  const leaflet = createKapokLeaflet();
  const entries = [];
  for (let i = 0; i < 46; i++) {
    const theta = between(0, Math.PI * 2);
    const radius = Math.pow(random(), .56);
    const x = Math.cos(theta) * radius * between(.35, .95);
    const z = Math.sin(theta) * radius * between(.35, .9);
    const y = between(-.24, .34);
    const translate = new THREE.Matrix4().makeTranslation(x, y, z);
    const rotY = new THREE.Matrix4().makeRotationY(between(-Math.PI, Math.PI));
    const rotZ = new THREE.Matrix4().makeRotationZ(between(-1.15, 1.15));
    const rotX = new THREE.Matrix4().makeRotationX(between(-.6, .38));
    const scale = new THREE.Matrix4().makeScale(between(.42, .82), between(.44, .86), between(.72, .96));
    const matrix = translate.clone().multiply(rotY).multiply(rotZ).multiply(rotX).multiply(scale);
    entries.push({ geometry: leaflet, matrix });
  }
  return mergeTransformedGeometries(entries);
}
function createKapokEdgeSprayGeometry() {
  const leaflet = createKapokLeaflet();
  const entries = [];
  const directions = [-.9, -.55, -.25, 0, .25, .55, .9];
  for (let i = 0; i < directions.length; i++) {
    const tilt = directions[i];
    const translate = new THREE.Matrix4().makeTranslation(0, .14, 0);
    const rotZ = new THREE.Matrix4().makeRotationZ(tilt);
    const rotX = new THREE.Matrix4().makeRotationX(-.12 - Math.abs(tilt) * .08);
    const scale = new THREE.Matrix4().makeScale(.62 + Math.abs(tilt) * .05, .68 + (i === 3 ? .08 : 0), .8);
    const matrix = translate.clone().multiply(rotZ).multiply(rotX).multiply(scale);
    entries.push({ geometry: leaflet, matrix });
  }
  return mergeTransformedGeometries(entries);
}
useLayer('leaves');
const canopyMassGeometry = createCanopyMassGeometry();
const edgeSprayGeometry = createKapokEdgeSprayGeometry();
const clusterDummy = new THREE.Object3D();
const edgeDummy = new THREE.Object3D();
const massMatrices = leafMaterials.map(() => []);
const edgeMatrices = leafMaterials.map(() => []);
for (const anchor of leafAnchors) {
  const branchOut = vec(Math.cos(anchor.direction), 0, Math.sin(anchor.direction));
  const massCopies = anchor.kind === 'primary-end' ? betweenInt(5, 8)
                    : anchor.kind === 'leader-tip' ? betweenInt(4, 6)
                    : anchor.kind === 'secondary' ? betweenInt(3, 6)
                    : anchor.kind === 'tertiary' ? betweenInt(2, 3)
                    : betweenInt(1, 2);
  for (let i = 0; i < massCopies; i++) {
    const materialIndex = Math.floor(random() * leafMaterials.length);
    const localOffset = branchOut.clone().multiplyScalar(between(.06, .78) * anchor.size)
      .add(vec(between(-.34, .34), between(-.16, .28), between(-.34, .34)));
    clusterDummy.position.copy(anchor.point).add(localOffset);
    clusterDummy.rotation.set(between(-.22, .22), anchor.direction + between(-.52, .52), between(-.22, .22));
    const scale = (anchor.kind === 'primary-end' ? between(1.0, 1.55)
                : anchor.kind === 'leader-tip' ? between(.9, 1.28)
                : anchor.kind === 'secondary' ? between(.84, 1.2)
                : anchor.kind === 'tertiary' ? between(.6, .84)
                : between(.4, .58)) * anchor.size;
    clusterDummy.scale.set(scale * between(1.12, 1.45), scale * between(.72, .98), scale * between(1.0, 1.28));
    clusterDummy.updateMatrix();
    massMatrices[materialIndex].push(clusterDummy.matrix.clone());
  }
  const edgeCount = anchor.kind === 'primary-end' ? betweenInt(2, 3)
                   : anchor.kind === 'leader-tip' ? betweenInt(2, 3)
                   : anchor.kind === 'secondary' ? betweenInt(1, 2)
                   : anchor.kind === 'tertiary' ? 1
                   : anchor.kind === 'quaternary' ? 0
                   : 1;
  for (let i = 0; i < edgeCount; i++) {
    const materialIndex = Math.floor(random() * leafMaterials.length);
    edgeDummy.position.copy(anchor.point)
      .add(branchOut.clone().multiplyScalar(between(.18, .62) * anchor.size))
      .add(vec(between(-.1, .1), between(-.04, .12), between(-.1, .1)));
    edgeDummy.rotation.set(between(-.16, .16), anchor.direction + between(-.34, .34), between(-.16, .16));
    const scale = (anchor.kind === 'primary-end' || anchor.kind === 'leader-tip' ? between(.34, .5) : anchor.kind === 'secondary' ? between(.24, .34) : between(.16, .26)) * anchor.size;
    edgeDummy.scale.setScalar(scale);
    edgeDummy.scale.y *= between(.92, 1.08);
    edgeDummy.updateMatrix();
    edgeMatrices[materialIndex].push(edgeDummy.matrix.clone());
  }
}
// Additional bridging masses between neighboring anchors create a much denser,
// more continuous canopy envelope, especially in the top view.
const bridgeAnchors = leafAnchors.filter(anchor => anchor.kind !== 'quaternary');
for (let i = 0; i < bridgeAnchors.length; i += 2) {
  const a = bridgeAnchors[i];
  const b = bridgeAnchors[(i + 1) % bridgeAnchors.length];
  const distance = a.point.distanceTo(b.point);
  if (distance > 5.2) continue;
  const midpoint = a.point.clone().lerp(b.point, .5).add(vec(between(-.22, .22), between(-.12, .18), between(-.22, .22)));
  const materialIndex = Math.floor(random() * leafMaterials.length);
  clusterDummy.position.copy(midpoint);
  clusterDummy.rotation.set(between(-.2, .2), between(-Math.PI, Math.PI), between(-.2, .2));
  const scale = between(.82, 1.2);
  clusterDummy.scale.set(scale * between(1.12, 1.38), scale * between(.74, .92), scale * between(1.04, 1.28));
  clusterDummy.updateMatrix();
  massMatrices[materialIndex].push(clusterDummy.matrix.clone());
}
const leaves = [];
for (let materialIndex = 0; materialIndex < leafMaterials.length; materialIndex++) {
  const massMesh = new THREE.InstancedMesh(canopyMassGeometry, leafMaterials[materialIndex], massMatrices[materialIndex].length);
  massMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
  massMatrices[materialIndex].forEach((matrix, index) => massMesh.setMatrixAt(index, matrix));
  massMesh.instanceMatrix.needsUpdate = true;
  massMesh.computeBoundingSphere();
  scene.add(massMesh);
  leaves.push(massMesh);

  const edgeMesh = new THREE.InstancedMesh(edgeSprayGeometry, leafMaterials[materialIndex], edgeMatrices[materialIndex].length);
  edgeMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
  edgeMatrices[materialIndex].forEach((matrix, index) => edgeMesh.setMatrixAt(index, matrix));
  edgeMesh.instanceMatrix.needsUpdate = true;
  edgeMesh.computeBoundingSphere();
  scene.add(edgeMesh);
  leaves.push(edgeMesh);
}
useLayer('moss');
// Lightweight bark relief and moss patches provide close-up depth without
// introducing large external meshes or affecting the existing camera flight.
const mossMaterials = ['#314e2e', '#3d6637', '#567b42'].map(color =>
  new THREE.MeshStandardMaterial({ color, roughness: 1, flatShading: true }));
const mossGeometry = new THREE.IcosahedronGeometry(1, 1);
const mossDummy = new THREE.Object3D();
const mossCountPerTone = 390;
for (let materialIndex = 0; materialIndex < mossMaterials.length; materialIndex++) {
  const moss = new THREE.InstancedMesh(mossGeometry, mossMaterials[materialIndex], mossCountPerTone);
  for (let index = 0; index < mossCountPerTone; index++) {
    const height = between(.25, 21.5);
    const angle = between(0, Math.PI * 2);
    const center = trunkCenterAt(height);
    const trunkX = center.x;
    const trunkZ = center.z;
    const radius = trunkRadiusAt(height);
    mossDummy.position.set(trunkX + Math.cos(angle) * (radius + .015), height, trunkZ + Math.sin(angle) * (radius + .015));
    mossDummy.quaternion.setFromUnitVectors(vec(0, 0, 1), vec(Math.cos(angle), 0, Math.sin(angle)));
    mossDummy.rotateZ(between(-.65, .65));
    mossDummy.scale.set(between(.09, .4), between(.14, .62), between(.025, .075));
    mossDummy.updateMatrix();
    moss.setMatrixAt(index, mossDummy.matrix);
  }
  moss.instanceMatrix.needsUpdate = true;
  scene.add(moss);
}
useLayer('vines');
// Hanging lianas: every control point descends from the anchor; no upward loops.
for (let i = 0; i < 9; i++) {
  const top = between(14, 38);
  const angle = between(0, Math.PI * 2);
  const base = trunkCenterAt(top);
  const radial = vec(Math.cos(angle), 0, Math.sin(angle));
  const anchor = base.addScaledVector(radial, trunkRadiusAt(top) + .08);
  const length = between(5, 13);
  const points = [];
  for (let j = 0; j <= 20; j++) {
    const t = j / 20;
    const h = top - length * t;
    const center = trunkCenterAt(h);
    const outward = trunkRadiusAt(h) + .13 + .25 * t;
    points.push(vec(center.x + radial.x * outward + .14 * Math.sin(t * 5 + angle), h,
      center.z + radial.z * outward + .13 * Math.sin(t * 4 + angle)));
  }
  points[0].copy(anchor);
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 42, .025, 5), vineMaterial));
}
useLayer('epiphytes');
// Curved, rounded leaf blades replace the original angular cones.
function createLeafBlade() {
  const positions = [];
  const indices = [];
  const rows = 8;
  const cols = 4;
  for (let row = 0; row <= rows; row++) {
    const t = row / rows;
    const width = Math.pow(Math.sin(Math.PI * t), .8) * .34;
    for (let col = 0; col <= cols; col++) {
      const u = col / cols * 2 - 1;
      positions.push(u * width, t * 1.65, Math.sin(Math.PI * t) * .19 + .11 * (1 - u * u));
    }
  }
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const a = row * (cols + 1) + col;
      indices.push(a, a + cols + 1, a + 1, a + 1, a + cols + 1, a + cols + 2);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
const bladeGeometry = createLeafBlade();
for (let cluster = 0; cluster < 36; cluster++) {
  const y = between(8, 42);
  const angle = between(0, Math.PI * 2);
  const center = trunkCenterAt(y);
  const radius = trunkRadiusAt(y) + .08;
  const position = vec(center.x + Math.cos(angle) * radius, y, center.z + Math.sin(angle) * radius);
  for (let j = 0; j < 9; j++) {
    const blade = new THREE.Mesh(bladeGeometry, leafMaterials[(cluster + j) % leafMaterials.length]);
    blade.position.copy(position).add(vec(between(-.06, .06), between(-.08, .08), between(-.06, .06)));
    blade.rotation.set(between(-.28, .28), j * Math.PI * 2 / 9, between(-.83, .83));
    blade.scale.set(between(.55, 1.2), between(.6, 1.2), 1);
    scene.add(blade);
  }
}
// Epiphytic rosettes: curved, broad leaves rather than sharp cone clusters.
// Each group is anchored to the changing trunk radius.
const epiphyteLeaf = createLeafBlade();
const epiphyteColors = ['#719848', '#90a954', '#567a3e', '#a18449'].map(color =>
  new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, roughness: .94 }));
const redBractMaterials = ['#d94a45', '#ee5a44', '#c93d5f', '#f07d45'].map(color =>
  new THREE.MeshStandardMaterial({ color, roughness: .82, side: THREE.DoubleSide }));
function addBromeliadBracts(target, bractCount = 6, spread = .28) {
  for (let n = 0; n < bractCount; n++) {
    const bract = new THREE.Mesh(epiphyteLeaf, redBractMaterials[n % redBractMaterials.length]);
    bract.position.y = .16 + n * .06;
    bract.rotation.set(-.18, n * Math.PI * 2 / bractCount, -.18 - (n % 2) * .07);
    bract.scale.set(spread, Math.max(.2, .5 - n * .03), .85);
    target.add(bract);
  }
}
for (let groupIndex = 0; groupIndex < 18; groupIndex++) {
  const height = between(7, 39);
  const angle = between(0, Math.PI * 2);
  const center = trunkCenterAt(height);
  const anchor = vec(center.x + Math.cos(angle) * (trunkRadiusAt(height) + .09), height,
    center.z + Math.sin(angle) * (trunkRadiusAt(height) + .09));
  const rosette = new THREE.Group();
  rosette.position.copy(anchor);
  rosette.rotation.y = -angle;
  for (let leafIndex = 0; leafIndex < 7; leafIndex++) {
    const leaf = new THREE.Mesh(epiphyteLeaf, epiphyteColors[(groupIndex + leafIndex) % epiphyteColors.length]);
    leaf.rotation.set(-.22, leafIndex * Math.PI * 2 / 7, -.35 - (leafIndex % 3) * .11);
    leaf.scale.set(between(.35, .72), between(.42, .75), 1);
    rosette.add(leaf);
  }
  // Some flowering bromeliads carry striking red/orange bracts above the green rosette.
  // Avoid colouring every specimen: flowering is a distinct state, not a permanent trait.
  if (groupIndex % 2 === 0 || (height > 18 && height < 32 && groupIndex % 3 === 1)) {
    addBromeliadBracts(rosette, betweenInt(5, 7), between(.22, .3));
  }
  scene.add(rosette);
}
// Additional bark microhabitats: flat bracket fungi, varied cap fungi and dense grass tufts.
const bracketMaterials = ['#b58e5b','#b9a47b','#805d42','#c1b69a'].map(color =>
  new THREE.MeshStandardMaterial({ color, roughness: 1, side: THREE.DoubleSide, flatShading: true }));
const bracketGeo = new THREE.SphereGeometry(1, 12, 5, 0, Math.PI, 0, Math.PI);
for (let i = 0; i < 115; i++) {
  const y = between(.35, 19.5);
  const a = between(0, Math.PI * 2);
  const center = trunkCenterAt(y);
  const out = vec(Math.cos(a), 0, Math.sin(a));
  const p = center.clone().addScaledVector(out, trunkRadiusAt(y) + .04);
  const fan = new THREE.Mesh(bracketGeo, bracketMaterials[i % bracketMaterials.length]);
  fan.position.copy(p);
  fan.rotation.set(between(-.18,.18), -a + Math.PI / 2, between(-.25,.25));
  fan.scale.set(between(.13,.38), between(.08,.15), between(.16,.43));
  scene.add(fan);
}
for (let i = 0; i < 170; i++) {
  const y = between(.2, 20);
  const a = between(0, Math.PI * 2);
  const center = trunkCenterAt(y);
  const p = center.add(vec(Math.cos(a) * (trunkRadiusAt(y)+.035), 0, Math.sin(a) * (trunkRadiusAt(y)+.035)));
  for (let j = 0; j < 4; j++) {
    const blade = new THREE.Mesh(bladeGeometry, leafMaterials[(i+j)%leafMaterials.length]);
    blade.position.copy(p);
    blade.rotation.set(between(-.5,.5), a + between(-.7,.7), between(-1.0,-.28));
    blade.scale.set(between(.09,.21), between(.15,.32), .75);
    scene.add(blade);
  }
}
// Representative specimens own their fixed anchor meshes and discovery positions.
// A separate object per point keeps the UI anchored even if other procedural seeds change.
const infoPoints = [];
function addSpecimen(type, label, height, angle, geometry, material, scale, chapterMin, chapterMax, options = {}) {
  const center = trunkCenterAt(height);
  const radial = vec(Math.cos(angle),0,Math.sin(angle));
  const specimen = new THREE.Mesh(geometry, material);
  specimen.position.copy(center).addScaledVector(radial, trunkRadiusAt(height) + .13);
  specimen.scale.set(...scale);
  specimen.rotation.y = -angle + Math.PI / 2;
  scene.add(specimen);
  const normal = radial.clone();
  const anchor = specimen.position.clone().addScaledVector(normal, options.markerOffset ?? Math.min(.24, scale[0]*.2)).add(options.anchorOffset || vec());
  infoPoints.push({type,label,height,position:anchor,object:specimen,normal,chapterMin,chapterMax,bubbleSide:options.bubbleSide,bubbleVertical:options.bubbleVertical});
}
// Deliberately visible at ORIGIN: a separate bracket-fungus colony on the front root,
// outside the broad buttress silhouette. Marker and specimen share the same fixed anchor.
{
  const angle = 2.27;
  const radial = vec(Math.cos(angle), 0, Math.sin(angle));
  const center = trunkCenterAt(.92);
  const fungus = new THREE.Group();
  fungus.position.copy(center).addScaledVector(radial, 6.45);
  fungus.position.y = 1.0;
  for (let n = 0; n < 5; n++) {
    const shelf = new THREE.Mesh(bracketGeo, bracketMaterials[n % bracketMaterials.length]);
    shelf.position.set((n - 2) * .24, n * .17, .03 + Math.sin(n * 2) * .07);
    shelf.scale.set(.53 + n * .04, .15, .42 + n * .035);
    shelf.rotation.y = -.14 + n * .11;
    fungus.add(shelf);
  }
  fungus.rotation.y = -angle + Math.PI / 2;
  scene.add(fungus);
  infoPoints.push({type:'fungi',label:'Fächerpilze',height:1.0,
    position:fungus.position.clone().add(vec(0,.66,0)).addScaledVector(radial,.22),
    object:fungus,normal:radial,chapterMin:-.15,chapterMax:5.0,
    bubbleSide:'right',bubbleVertical:'down',skipOcclusion:true});
}
addSpecimen('moss','Moospolster',5.7,2.9,mossGeometry,mossMaterials[1],[.55,.72,.17],2,9.5,{ markerOffset:1.1, bubbleSide:'right', bubbleVertical:'down' });
addSpecimen('leaves','Aufsitzerpflanzen',12.4,3.8,bladeGeometry,leafMaterials[3],[.9,1.45,1],8.5,18,{ bubbleSide:'left', bubbleVertical:'up', anchorOffset: vec(0,.12,0) });
// Larger grouped bromeliad: the same group receives the anchored discovery marker.
{
  const y=23.3, angle=5.2, center=trunkCenterAt(y);
  const plant=new THREE.Group();
  plant.position.copy(center).add(vec(Math.cos(angle)*(trunkRadiusAt(y)+.16),0,Math.sin(angle)*(trunkRadiusAt(y)+.16)));
  plant.rotation.y=-angle;
  for(let j=0;j<11;j++) {
    const leaf=new THREE.Mesh(epiphyteLeaf, j%4===0?epiphyteColors[1]:epiphyteColors[j%epiphyteColors.length]);
    leaf.rotation.set(-.25,j*Math.PI*2/11,-.43);
    leaf.scale.set(.76,1.12,1);
    plant.add(leaf);
  }
  addBromeliadBracts(plant, 7, .34);
  scene.add(plant);
  const normal=vec(Math.cos(angle),0,Math.sin(angle));
  infoPoints.push({type:'bromeliad',label:'Bromelien',height:y,position:plant.position.clone().addScaledVector(normal,.25).add(vec(0,.7,0)),object:plant,normal,chapterMin:18,chapterMax:29,bubbleSide:'right',bubbleVertical:'up'});
}
// Extra surrounding bromeliads, denser at chapter 03, sparse above it.
for (let i=0;i<26;i++) {
  const y=between(18.5,31.5), angle=between(.55,2.6), center=trunkCenterAt(y);
  const plant=new THREE.Group();
  plant.position.set(center.x+Math.cos(angle)*(trunkRadiusAt(y)+.1),y,center.z+Math.sin(angle)*(trunkRadiusAt(y)+.1));
  plant.rotation.y=-angle;
  for (let j=0;j<8;j++) {
    const leaf=new THREE.Mesh(epiphyteLeaf,epiphyteColors[(i+j)%epiphyteColors.length]);
    leaf.rotation.set(-.24,j*Math.PI*2/8,-.4);
    leaf.scale.set(between(.52,.82),between(.67,1.08),1);
    plant.add(leaf);
  }
  if (i % 2 === 0) addBromeliadBracts(plant, betweenInt(4, 6), between(.2, .28));
  scene.add(plant);
}

// Hidden worlds point in chapter 04: a visible tank bromeliad higher up the trunk/branch transition.
{
  const y=31.0, angle=6.2, center=trunkCenterAt(y);
  const plant=new THREE.Group();
  plant.position.copy(center).add(vec(Math.cos(angle)*(trunkRadiusAt(y)+.18),0,Math.sin(angle)*(trunkRadiusAt(y)+.18)));
  plant.rotation.y=-angle;
  for(let j=0;j<10;j++) {
    const leaf=new THREE.Mesh(epiphyteLeaf, epiphyteColors[(j+1)%epiphyteColors.length]);
    leaf.rotation.set(-.22,j*Math.PI*2/10,-.4);
    leaf.scale.set(.7,1.0,1);
    plant.add(leaf);
  }
  addBromeliadBracts(plant, 6, .3);
  scene.add(plant);
  const normal=vec(Math.cos(angle),0,Math.sin(angle));
  infoPoints.push({type:'symbiosis',label:'Zusammenleben',height:y,position:plant.position.clone().addScaledVector(normal,.9).add(vec(0,.62,0)),object:plant,normal,chapterMin:26,chapterMax:37,bubbleSide:'left',bubbleVertical:'down'});
}
// Chapter 06/07 discovery marker uses a deliberately unobtrusive screen-space
// anchor over the existing left crown. Do not create a separate floating plant.
infoPoints.push({
  type:'air',label:'Luftreinigung',height:50,
  position:vec(0,50,0),normal:vec(0,1,0),
  chapterMin:46,chapterMax:58,
  screenAnchor:{x:.34,y:.39},
  bubbleSide:'left',bubbleVertical:'down'
});
useLayer('atmosphere');
// Procedural multi-octave cloud alpha: irregular silhouette, no circular sprite boundaries.
function makeCloudTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(size, size);
  const noiseSeed = 10991;
  const hash = (x, y) => {
    let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + noiseSeed;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  };
  const fade = t => t * t * (3 - 2 * t);
  function valueNoise(x, y) {
    const ix = Math.floor(x), iy = Math.floor(y), fx = fade(x - ix), fy = fade(y - iy);
    const a = hash(ix, iy) * (1 - fx) + hash(ix + 1, iy) * fx;
    const b = hash(ix, iy + 1) * (1 - fx) + hash(ix + 1, iy + 1) * fx;
    return a * (1 - fy) + b * fy;
  }
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = (x + .5) / size * 2 - 1, v = (y + .5) / size * 2 - 1;
    const shape = Math.exp(-Math.pow(Math.abs(u) / .86, 4) * 1.8 - Math.pow(Math.abs(v) / .68, 4) * 1.6);
    const noise = .53 * valueNoise(u * 3 + 8, v * 3 + 8)
                + .30 * valueNoise(u * 8 + 21, v * 8 + 21)
                + .17 * valueNoise(u * 19 + 35, v * 19 + 35);
    const wisps = THREE.MathUtils.smoothstep(noise * shape, .18, .49);
    const alpha = Math.min(1, wisps * shape * .77);
    const i = (y * size + x) * 4;
    image.data[i] = 250; image.data[i + 1] = 253; image.data[i + 2] = 244;
    image.data[i + 3] = Math.round(alpha * 255);
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
const cloudTexture = makeCloudTexture();
// One continuous fog volume over the forest floor. Animated domain-warped noise
// varies density inside a seamless plane, rather than revealing sprite boundaries.
const mistMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  side: THREE.DoubleSide,
  uniforms: { uTime: { value: 0 }, uOpacity: { value: .33 } },
  vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    uniform float uTime;
    uniform float uOpacity;
    varying vec2 vUv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),
                 mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);
    }
    float fbm(vec2 p) {
      float n=0., a=.5;
      for(int i=0;i<4;i++){ n += a*noise(p); p=p*2.07+vec2(13.7,5.1); a*=.5; }
      return n;
    }
    void main() {
      vec2 uv = vUv * 5.0;
      float time = uTime;
      vec2 warp = vec2(fbm(uv*.48+vec2(time*.045,0.)),fbm(uv*.48+vec2(0.,-time*.035)));
      float density = fbm(uv+warp*1.45+vec2(time*.065,time*.025));
      float billow = smoothstep(.19,.75,density);
      float edge = smoothstep(0.,.18,vUv.x)*smoothstep(0.,.18,vUv.y)
                 *smoothstep(0.,.18,1.-vUv.x)*smoothstep(0.,.18,1.-vUv.y);
      float alpha = (0.50 + billow*.5) * edge * uOpacity;
      gl_FragColor = vec4(vec3(.68,.80,.70), alpha);
    }`
});
const cloudMat = new THREE.SpriteMaterial({ map: cloudTexture, transparent: true, opacity: .52, depthWrite: false, fog: false, color: '#f5f7e9' });
const mistGroups = [];
const fogSurface = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), mistMat);
fogSurface.rotation.x = -Math.PI / 2;
fogSurface.position.y = .13;
scene.add(fogSurface);
// Multiple overlapping irregular cloud cards create light wisps above the crown.
for (let i = 0; i < 46; i++) {
  const sprite = new THREE.Sprite(cloudMat);
  sprite.position.set(between(-44, 44), between(51, 67), between(-44, 44));
  sprite.scale.set(between(17, 39), between(7, 16), 1);
  scene.add(sprite);
  mistGroups.push({ blob: sprite, originX: sprite.position.x, originZ: sprite.position.z, originY: sprite.position.y, phase: random() * Math.PI * 2, velocity: between(.08, .19), drift: between(.12, .3), range: between(2, 4.5), type: "cloud" });
}
const particlesCount = 400;
const particlePositions = new Float32Array(particlesCount * 3);
for (let i = 0; i < particlesCount; i++) {
  particlePositions[i * 3] = between(-30, 30);
  particlePositions[i * 3 + 1] = between(-6, 55);
  particlePositions[i * 3 + 2] = between(-30, 30);
}
const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({ color: '#e0ecc1', size: .08, transparent: true, opacity: .55, sizeAttenuation: true }));
scene.add(particles);


  // Restore the original scene method; layers remain stable until the next rebuild.
  scene.add = rawAdd;
  const layerVisibility = new Map(Object.keys(layers).map(name => [name, true]));
  function setLayerVisible(name, visible) {
    layerVisibility.set(name, visible);
    for (const object of layers[name] ?? []) object.visible = visible;
  }
  function restoreLayerVisibility() {
    for (const [name, visible] of layerVisibility) {
      if (!visible) for (const object of layers[name] ?? []) object.visible = false;
    }
  }
  return { mistMat, mistGroups, earthCeilingMaterial, ceilingStrata, foregroundRoot, infoPoints, layers, setLayerVisible, restoreLayerVisibility, swampWaterState, floatingWaterLeaves };
}
