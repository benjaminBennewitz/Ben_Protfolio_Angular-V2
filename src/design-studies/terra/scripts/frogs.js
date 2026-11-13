/* src/design-studies/terra/scripts/frogs.js */

/**
 * @file Prozeduraler Pfeilgiftfrosch auf der Innenseite der Glasscheibe.
 * @description Verbindet blau-violette Hautzeichnung, inverse Kinematik und haftende Kletterschritte, getrennte Trittspuren und gefaltete Hinterbeine.
 * @author Benjamin Bennewitz
 */

import * as THREE from '../../bentendo/vendor/three/three.module.js';
import { createRandom } from './content.js';

/** Vorwärts gerichtete Route mit kleinen Richtungsänderungen, ohne künstliche Rückkehrschleife. */
const ROUTE = Object.freeze([
  [0, 0], [0.025, 0.12], [0.05, 0.24], [0.08, 0.36], [0.12, 0.48],
  [0.15, 0.6], [0.17, 0.72], [0.18, 0.84], [0.18, 0.96],
  [0.16, 1.08], [0.13, 1.2], [0.1, 1.32], [0.08, 1.44],
]);

/** Drei Kletterabschnitte je Zeitzyklus; die Route läuft danach kontinuierlich vorwärts weiter. */
const BOUTS = Object.freeze([
  { start: 4.2, duration: 5.4, firstStep: 0 },
  { start: 16.4, duration: 4.9, firstStep: 4 },
  { start: 31.1, duration: 6.2, firstStep: 8 },
]);
const MOTION_PERIOD = 48;
const SETTLE_DURATION = 0.65;

/** Ungleiche Finger-/Zehenlängen, vom inneren kurzen Finger zum äußeren Rand. */
const DIGIT_LENGTHS = Object.freeze({
  front: Object.freeze([0.11, 0.255, 0.315, 0.215]),
  rear: Object.freeze([0.12, 0.225, 0.3, 0.35, 0.245]),
});
const UP = new THREE.Vector3(0, 1, 0);

/** Verlängert die Anfangsroute aufwärts, ohne sichtbaren Rücksprung oder rückwärts gerichtete Bewegung. */
function routePoint(step) {
  const index = Math.max(0, Math.floor(step));
  if (index < ROUTE.length) return ROUTE[index];
  const offset = index - (ROUTE.length - 1);
  return [0.08 + Math.sin(offset * 0.18) * 0.1, 1.44 + offset * 0.12];
}

/** Ermittelt die Körperausrichtung aus der lokalen Vorwärtsrichtung der Route. */
function routeAngle(step) {
  const before = routePoint(step - 1);
  const after = routePoint(step + 1);
  return -Math.atan2(after[0] - before[0], Math.max(0.001, after[1] - before[1]));
}

/** Liefert kontinuierlichen Schrittfortschritt mit Anlauf, Abbremsen und echten Ruhephasen. */
function climbProgress(time) {
  const cycleSteps = Math.floor(time / MOTION_PERIOD) * 12;
  time %= MOTION_PERIOD;
  let progress = cycleSteps;
  for (const bout of BOUTS) {
    if (time < bout.start) break;
    if (time >= bout.start + bout.duration) {
      progress = cycleSteps + bout.firstStep + 4;
      continue;
    }
    const fraction = (time - bout.start) / bout.duration;
    return cycleSteps + bout.firstStep + ease(fraction) * 4;
  }
  return progress;
}

/** Löst den Bauchkontakt vor einem Kletterabschnitt und baut ihn danach langsam wieder auf. */
function bellyContact(time) {
  time %= MOTION_PERIOD;
  let contact = 1;
  for (const bout of BOUTS) {
    const end = bout.start + bout.duration;
    if (time >= bout.start - 1 && time <= end + SETTLE_DURATION) {
      const release = time < bout.start ? ease(bout.start - time) : 0;
      const settle = time > end ? ease((time - end) / SETTLE_DURATION) : 0;
      contact = Math.min(contact, Math.max(release, settle));
    }
  }
  return contact;
}

/** Interpoliert ohne Geschwindigkeitssprünge zwischen Ruhe- und Bewegungsphasen. */
function ease(value) {
  const clamped = THREE.MathUtils.clamp(value, 0, 1);
  return clamped * clamped * (3 - 2 * clamped);
}

/** Erzeugt eine umlaufende, blau-violette Haut mit dunklen, unregelmäßigen Flecken ohne externe Bildressourcen. */
function createSkinTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  const pixels = context.createImageData(canvas.width, canvas.height);
  const random = createRandom(4261);
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const longitude = x / canvas.width * Math.PI * 2;
      const latitude = y / canvas.height * Math.PI;
      const bands = Math.sin(longitude * 3 + Math.sin(latitude * 4) * 0.85 + Math.cos(longitude * 2) * 0.4);
      const spots = Math.sin(longitude * 5 + latitude * 4) * Math.sin(longitude * 3 - latitude * 6);
      const ink = ease((Math.max(bands - 0.62, spots - 0.48) + 0.035) / 0.07);
      const violet = 0.35 + Math.sin(latitude * 2 + longitude) * 0.23;
      const grain = (random() - 0.5) * 9;
      const index = (y * canvas.width + x) * 4;
      pixels.data.set([
        (57 + violet * 45) * (1 - ink) + ink * 10 + grain,
        (98 - violet * 31) * (1 - ink) + ink * 13 + grain,
        (219 - violet * 12) * (1 - ink) + ink * 25 + grain * 0.5,
        255,
      ], index);
    }
  }
  context.putImageData(pixels, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/**
 * Erstellt einen stilisierten Pfeilgiftfrosch mit vier unabhängig haftenden Füßen.
 * @returns {{group: THREE.Group, update: function(number): void, dispose: function(): void}}
 */
export function createFrogs() {
  const group = new THREE.Group();
  const frog = new THREE.Group();
  frog.name = 'poison-frog';
  frog.position.set(-1.2, -0.3, 0);
  frog.scale.setScalar(1.12);
  group.add(frog);
  const sphere = new THREE.SphereGeometry(1, 24, 16);
  const cylinder = new THREE.CylinderGeometry(0.82, 1, 1, 10);
  const texture = createSkinTexture();
  const skin = new THREE.MeshStandardMaterial({ color: '#c7c6ef', map: texture, roughness: 0.52, emissive: '#15102f', emissiveIntensity: 0.04 });
  const underside = new THREE.MeshStandardMaterial({ color: '#a3a2d1', map: texture, roughness: 0.61 });
  const pads = new THREE.MeshStandardMaterial({ color: '#7a83c8', roughness: 0.55 });
  const webMaterial = new THREE.MeshStandardMaterial({ color: '#7177bc', roughness: 0.7, side: THREE.DoubleSide });
  const webGeometries = [];
  const eyes = new THREE.MeshStandardMaterial({ color: '#101021', roughness: 0.25 });
  const body = new THREE.Group();
  body.name = 'body';
  frog.add(body);

  /** Erstellt eine organische Teilform aus der geteilten Kugelgeometrie. */
  function ellipsoid(parent, material, position, scale, name = '') {
    const mesh = new THREE.Mesh(sphere, material);
    mesh.position.set(...position);
    mesh.scale.set(...scale);
    mesh.name = name;
    parent.add(mesh);
    return mesh;
  }

  const torso = ellipsoid(body, skin, [0, -0.07, -0.79], [0.36, 0.54, 0.23], 'torso');
  const abdomen = ellipsoid(body, underside, [0, -0.08, -0.51], [0.29, 0.42, 0.075], 'contact-abdomen');
  const head = new THREE.Group();
  head.position.set(0, 0.34, -0.68);
  body.add(head);
  const headGeometry = sphere.clone();
  const headPositions = headGeometry.attributes.position;
  for (let index = 0; index < headPositions.count; index += 1) {
    const taper = 1 - (headPositions.getY(index) + 1) * 0.14;
    headPositions.setX(index, headPositions.getX(index) * taper);
  }
  headGeometry.computeVertexNormals();
  const crown = new THREE.Mesh(headGeometry, skin);
  crown.name = 'tapered-head';
  crown.position.set(0, 0.08, 0);
  crown.scale.set(0.35, 0.255, 0.19);
  head.add(crown);
  ellipsoid(head, underside, [0, -0.02, 0.14], [0.25, 0.15, 0.06], 'jaw');
  for (const side of [-1, 1]) ellipsoid(head, eyes, [side * 0.27, 0.18, -0.01], [0.095, 0.1, 0.1]);

  const direction = new THREE.Vector3();
  const bend = new THREE.Vector3();
  const lateralBend = new THREE.Vector3();
  const foldBend = new THREE.Vector3();
  const fingerWidth = new THREE.Vector3();
  const fingerDepth = new THREE.Vector3();
  const fingerFrame = new THREE.Matrix4();
  const joint = new THREE.Vector3();
  const wrist = new THREE.Vector3();
  const hip = new THREE.Vector3();
  const legs = [];

  /** Erzeugt einen Abschnitt, dessen Geometrie während der Animation unverändert bleibt. */
  function bone(parent, material, radius, name = '', rounded = false, depth = radius) {
    const mesh = new THREE.Mesh(rounded ? sphere : cylinder, material);
    mesh.name = name;
    parent.add(mesh);
    return { mesh, radius, rounded, depth };
  }

  /**
   * Aktualisiert ein Segment; abgeflachte Finger behalten ihre breite Querachse parallel zum Glas.
   * So dringt beim Abrollen keine seitlich verdrehte Fingerkante durch die Scheibe.
   */
  function poseBone(segment, start, end) {
    direction.subVectors(end, start);
    const length = Math.max(direction.length(), 0.001);
    direction.multiplyScalar(1 / length);
    segment.mesh.position.lerpVectors(start, end, 0.5);
    if (segment.depth !== segment.radius) {
      fingerWidth.set(direction.y, -direction.x, 0).normalize();
      fingerDepth.crossVectors(fingerWidth, direction);
      fingerFrame.makeBasis(fingerWidth, direction, fingerDepth);
      segment.mesh.quaternion.setFromRotationMatrix(fingerFrame);
    } else {
      segment.mesh.quaternion.setFromUnitVectors(UP, direction);
    }
    segment.mesh.scale.set(segment.radius, length * (segment.rounded ? 0.58 : 1), segment.depth);
  }

  /** Erstellt flache, konkav ausgerundete Schwimmhäute zwischen benachbarten Fingeransätzen. */
  function createWebbing(foot, digits) {
    const samples = 8;
    const verticesPerGap = samples + 2;
    const positions = new Float32Array((digits.length - 1) * verticesPerGap * 3);
    const indices = [];
    for (let gap = 0; gap < digits.length - 1; gap += 1) {
      const first = gap * verticesPerGap;
      for (let sample = 0; sample < samples; sample += 1) indices.push(first, first + sample + 1, first + sample + 2);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(positions.length), 3).setUsage(THREE.DynamicDrawUsage));
    geometry.setIndex(indices);
    const mesh = new THREE.Mesh(geometry, webMaterial);
    mesh.name = 'webbing';
    mesh.frustumCulled = false;
    foot.add(mesh);
    webGeometries.push(geometry);
    return { geometry, samples, verticesPerGap };
  }

  /** Verformt nur die vorhandenen Membranpunkte mit den abrollenden Fingern. */
  function updateWebbing(webbing, digits) {
    const positions = webbing.geometry.attributes.position;
    for (let gap = 0; gap < digits.length - 1; gap += 1) {
      const a = digits[gap].knuckle;
      const b = digits[gap + 1].knuckle;
      const first = gap * webbing.verticesPerGap;
      positions.setXYZ(first, 0, 0.014, -0.006);
      for (let sample = 0; sample <= webbing.samples; sample += 1) {
        const t = sample / webbing.samples;
        const inverse = 1 - t;
        const x = (inverse * inverse * a.x + 2 * inverse * t * (a.x + b.x) * 0.18 + t * t * b.x) * 1.12;
        const y = (inverse * inverse * a.y + 2 * inverse * t * (a.y + b.y) * 0.18 + t * t * b.y) * 1.12;
        positions.setXYZ(first + sample + 1, x, y, THREE.MathUtils.lerp(a.z, b.z, t) + 0.012);
      }
    }
    positions.needsUpdate = true;
    webbing.geometry.computeVertexNormals();
  }

  for (const [order, side, rear] of [[0, -1, false], [1, -1, true], [2, 1, false], [3, 1, true]]) {
    const foot = new THREE.Group();
    foot.name = `foot-${rear ? 'rear' : 'front'}-${side < 0 ? 'left' : 'right'}`;
    frog.add(foot);
    const footX = side * (rear ? 0.44 : 0.56);
    const footY = rear ? -0.32 : 0.52;
    const limbName = `${rear ? 'rear' : 'front'}-${side < 0 ? 'left' : 'right'}`;
    const upper = bone(frog, skin, rear ? 0.12 : 0.067, `${limbName}-upper`, true);
    const lower = bone(frog, skin, rear ? 0.085 : 0.052, `${limbName}-lower`, true);
    const knee = ellipsoid(frog, skin, [0, 0, -0.7], rear ? [0.12, 0.13, 0.11] : [0.068, 0.072, 0.055], `${limbName}-joint`);
    const tarsus = rear ? bone(frog, skin, 0.06, `${limbName}-tarsus`, true) : null;
    const ankleJoint = rear ? ellipsoid(frog, skin, [0, 0, -0.4], [0.075, 0.085, 0.06], `${limbName}-ankle`) : null;
    const thigh = rear ? ellipsoid(frog, skin, [0, 0, -0.7], [0.13, 0.25, 0.105], `${limbName}-thigh`) : null;
    const palm = ellipsoid(foot, underside, [0, 0, -0.031], [0.075, 0.085, 0.029], 'contact-palm');
    const digits = [];
    const lengths = DIGIT_LENGTHS[rear ? 'rear' : 'front'];
    for (let digit = 0; digit < lengths.length; digit += 1) {
      const spread = side * (digit - (lengths.length - 1) * 0.5) * (rear ? 0.075 : 0.083);
      const tip = new THREE.Vector3(spread + (rear ? side * 0.025 : 0), lengths[digit], -0.018);
      const knuckle = new THREE.Vector3(spread * 0.68, tip.y * 0.52, -0.018);
      const first = bone(foot, skin, 0.025, 'contact-digit-base', false, 0.016);
      const second = bone(foot, pads, 0.023, 'contact-digit-tip', false, 0.016);
      const jointPad = ellipsoid(foot, skin, knuckle.toArray(), [0.025, 0.027, 0.016], 'contact-knuckle');
      const padSize = 0.026 + lengths[digit] * 0.034;
      const pad = ellipsoid(foot, pads, tip.toArray(), [padSize, padSize * 1.12, 0.016], 'contact-pad');
      digits.push({ tip, knuckle, first, second, jointPad, pad });
    }
    const webbing = createWebbing(foot, digits);
    legs.push({ order, side, rear, foot, footX, footY, upper, lower, knee, tarsus, ankleJoint, thigh, palm, digits, webbing });
  }

  /**
   * Führt den Oberschenkel körpernah; Schienbein und Fußwurzel lösen den Weg zum Haftpunkt.
   * Knie und Sprunggelenk bleiben beide neben der Körperkontur.
   * Die körpernahen Fußziele verhindern ein seitliches Ausstellen der Fußwurzel.
   * Vorderbeine behalten ihre bisherige Zwei-Segment-Lösung.
   */
  function poseLeg(leg, bodyX, bodyY, angle) {
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    const localX = leg.side * 0.25;
    const localY = leg.rear ? -0.43 : 0.24;
    hip.set(bodyX + localX * cosine - localY * sine,
      bodyY + localX * sine + localY * cosine, -0.7 + body.position.z);
    wrist.set(leg.foot.position.x, leg.foot.position.y, leg.foot.position.z - 0.06);

    if (leg.rear) {
      const thighLength = 0.38;
      const outward = 0.11 + leg.swing * 0.025;
      const depth = 0.06 + leg.swing * 0.025;
      const forward = Math.sqrt(thighLength * thighLength - outward * outward - depth * depth);
      leg.knee.position.set(hip.x + leg.side * outward * cosine - forward * sine,
        hip.y + leg.side * outward * sine + forward * cosine, hip.z + depth);
      poseBone(leg.upper, hip, leg.knee.position);
      leg.thigh.position.copy(leg.upper.mesh.position);
      leg.thigh.quaternion.copy(leg.upper.mesh.quaternion);
      leg.thigh.scale.set(0.15, thighLength * 0.62, 0.14);
    }

    const start = leg.rear ? leg.knee.position : hip;
    const firstLength = leg.rear ? 0.56 : 0.38;
    const secondLength = leg.rear ? 0.61 : 0.58;
    direction.subVectors(wrist, start);
    const distance = Math.max(direction.length(), 0.001);
    direction.multiplyScalar(1 / distance);
    const reach = Math.min(distance, (firstLength + secondLength) * 0.999);
    const along = (firstLength ** 2 - secondLength ** 2 + reach ** 2) / (2 * reach);
    const height = Math.sqrt(Math.max(0, firstLength ** 2 - along ** 2));
    if (leg.rear) {
      lateralBend.set(leg.side * cosine, leg.side * sine, 0);
      const outward = direction.dot(lateralBend);
      lateralBend.addScaledVector(direction, -outward);
      const lateralReach = lateralBend.length();
      lateralBend.normalize();
      foldBend.crossVectors(direction, lateralBend);
      if (-sine * foldBend.x + cosine * foldBend.y > 0) foldBend.negate();
      const centerOutward = (start.x - bodyX) * leg.side * cosine
        + (start.y - bodyY) * leg.side * sine + along * outward;
      const lateral = THREE.MathUtils.clamp((0.42 - centerOutward) / Math.max(height * lateralReach, 0.001), -0.98, 0.98);
      bend.copy(lateralBend).multiplyScalar(lateral).addScaledVector(foldBend, Math.sqrt(1 - lateral * lateral));
    } else {
      bend.set(leg.side * cosine + 0.5 * sine, leg.side * sine - 0.5 * cosine, -0.16);
      bend.addScaledVector(direction, -bend.dot(direction)).normalize();
    }
    joint.copy(start).addScaledVector(direction, along).addScaledVector(bend, height);
    if (leg.rear) {
      leg.ankleJoint.position.copy(joint);
      poseBone(leg.lower, start, joint);
      poseBone(leg.tarsus, joint, wrist);
    } else {
      leg.knee.position.copy(joint);
      poseBone(leg.upper, hip, joint);
      poseBone(leg.lower, joint, wrist);
    }
  }

  const digitBase = new THREE.Vector3(0, 0, -0.018);

  /**
   * Setzt den Fuß auf getrennten Vorder-/Hinterbein-Trittspuren voraus.
   * Der Abstand berücksichtigt die vollständigen Fingerfächer, nicht nur die Ballenmitten.
   * Jeder Hinterfuß folgt erst nach dem Vorderfuß derselben Seite; Haftanker bleiben unverändert.
   */
  function poseFoot(leg, progress) {
    const step = Math.floor(progress);
    const fraction = progress - step;
    const active = step % 4 === leg.order;
    const previousStep = step - (((step - leg.order) % 4) + 4) % 4;
    const target = routePoint(previousStep + 2);
    const targetAngle = routeAngle(previousStep + 2);
    let x = target[0];
    let y = target[1];
    let angle = targetAngle;
    let lift = 0;
    let swing = 1;
    if (active) {
      const start = routePoint(step - 2);
      const end = routePoint(step + 2);
      swing = THREE.MathUtils.clamp((fraction - 0.08) / 0.57, 0, 1);
      const blend = ease(swing);
      x = THREE.MathUtils.lerp(start[0], end[0], blend);
      y = THREE.MathUtils.lerp(start[1], end[1], blend);
      angle = THREE.MathUtils.lerp(routeAngle(step - 2), routeAngle(step + 2), blend);
      lift = Math.sin(swing * Math.PI) * 0.1;
    }
    leg.foot.position.set(x + leg.footX * Math.cos(angle) - leg.footY * Math.sin(angle), y + leg.footX * Math.sin(angle) + leg.footY * Math.cos(angle), -lift);
    leg.foot.rotation.z = angle - (leg.rear ? leg.side * 0.22 : 0);
    leg.swing = active ? Math.sin(swing * Math.PI) : 0;
    leg.foot.userData.planted = lift < 0.001;
    leg.digits.forEach((digit, index) => {
      const digitSwing = active ? THREE.MathUtils.clamp((swing - index * 0.025) / (1 - (leg.digits.length - 1) * 0.025), 0, 1) : 1;
      const peel = Math.max(0, Math.sin(digitSwing * Math.PI));
      const toeLift = active ? peel * 0.1 : 0;
      const curl = active ? peel * (0.018 + index * 0.004) : 0;
      digit.tip.z = -0.018 + lift - toeLift - curl;
      digit.knuckle.z = -0.018 + lift * 0.4 - toeLift * 0.5;
      digit.pad.position.copy(digit.tip);
      digit.jointPad.position.copy(digit.knuckle);
      poseBone(digit.first, digitBase, digit.knuckle);
      poseBone(digit.second, digit.knuckle, digit.tip);
    });
    updateWebbing(leg.webbing, leg.digits);
  }

  /** Lässt den Körper während der gestützten Schritte vorwärts gleiten und dazwischen ruhen. */
  function update(time) {
    const progress = climbProgress(time);
    const step = Math.floor(progress);
    const fraction = progress - step;
    const from = routePoint(step);
    const to = routePoint(step + 1);
    const bodyX = THREE.MathUtils.lerp(from[0], to[0], fraction);
    const bodyY = THREE.MathUtils.lerp(from[1], to[1], fraction);
    const angle = THREE.MathUtils.lerp(routeAngle(step), routeAngle(step + 1), fraction);
    const contact = bellyContact(time);
    body.position.set(bodyX, bodyY, contact * 0.4);
    body.rotation.z = angle;
    body.scale.x = 1 + Math.sin(time * 1.7) * 0.008;
    abdomen.position.z = THREE.MathUtils.lerp(-0.51, -0.463, contact);
    torso.scale.z = THREE.MathUtils.lerp(0.23, 0.275, contact);
    abdomen.scale.x = THREE.MathUtils.lerp(0.29, 0.31, contact);
    abdomen.scale.y = THREE.MathUtils.lerp(0.42, 0.435, contact);
    abdomen.scale.z = THREE.MathUtils.lerp(0.075 * (1 + Math.sin(time * 1.7) * 0.04), 0.06, contact);
    head.position.y = 0.34 + (1 - contact) * 0.025;
    head.rotation.x = -0.055 + (1 - contact) * 0.015;
    head.rotation.y = Math.sin(time * 0.23) * 0.018;
    for (const leg of legs) {
      poseFoot(leg, progress);
      poseLeg(leg, bodyX, bodyY, angle);
    }
    const phase = time % MOTION_PERIOD;
    frog.userData.motion = BOUTS.some(bout => phase > bout.start && phase < bout.start + bout.duration) ? 'climbing' : 'resting';
  }

  update(0);

  return {
    group, update,
    /** Gibt die gemeinsam genutzten Ressourcen ohne laufzeitabhängige Geometrieallokationen frei. */
    dispose() {
      sphere.dispose();
      headGeometry.dispose();
      cylinder.dispose();
      texture.dispose();
      for (const geometry of webGeometries) geometry.dispose();
      for (const material of [skin, underside, pads, eyes, webMaterial]) material.dispose();
      group.clear();
    },
  };
}
