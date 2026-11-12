/* src/design-studies/chlor-glass/scripts/frogs.js */

/**
 * @file Prozeduraler Pfeilgiftfrosch auf der Innenseite der Glasscheibe.
 * @description Verbindet blau-violette Hautzeichnung, inverse Kinematik und haftende Kletterschritte und gefaltete Hinterbeine.
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

/** Drei kurze Kletterabschnitte mit bewusst ungleichen Ruhezeiten. */
const BOUTS = Object.freeze([
  { start: 4.2, duration: 5.4, firstStep: 0 },
  { start: 16.4, duration: 4.9, firstStep: 4 },
  { start: 31.1, duration: 6.2, firstStep: 8 },
]);
const UP = new THREE.Vector3(0, 1, 0);

/** Liefert nur vorhandene Routenpunkte; das Tier kehrt nicht rückwärts an den Start zurück. */
function routePoint(step) {
  return ROUTE[THREE.MathUtils.clamp(step, 0, ROUTE.length - 1)];
}

/** Ermittelt die Körperausrichtung aus der lokalen Vorwärtsrichtung der Route. */
function routeAngle(step) {
  const before = routePoint(step - 1);
  const after = routePoint(step + 1);
  return -Math.atan2(after[0] - before[0], Math.max(0.001, after[1] - before[1]));
}

/** Liefert kontinuierlichen Schrittfortschritt mit Anlauf, Abbremsen und echten Ruhephasen. */
function climbProgress(time) {
  let progress = 0;
  for (const bout of BOUTS) {
    if (time < bout.start) break;
    if (time >= bout.start + bout.duration) {
      progress = bout.firstStep + 4;
      continue;
    }
    const fraction = (time - bout.start) / bout.duration;
    return bout.firstStep + ease(fraction) * 4;
  }
  return progress;
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

  ellipsoid(body, skin, [0, -0.07, -0.79], [0.36, 0.54, 0.23]);
  const abdomen = ellipsoid(body, underside, [0, -0.08, -0.51], [0.29, 0.42, 0.075]);
  const head = new THREE.Group();
  head.position.set(0, 0.34, -0.68);
  body.add(head);
  ellipsoid(head, skin, [0, 0.08, 0], [0.38, 0.25, 0.19]);
  ellipsoid(head, underside, [0, -0.02, 0.14], [0.27, 0.17, 0.06]);
  for (const side of [-1, 1]) ellipsoid(head, eyes, [side * 0.29, 0.18, -0.01], [0.1, 0.105, 0.105]);

  const direction = new THREE.Vector3();
  const bend = new THREE.Vector3();
  const bendSide = new THREE.Vector3();
  const bendBack = new THREE.Vector3();
  const fingerWidth = new THREE.Vector3();
  const fingerDepth = new THREE.Vector3();
  const fingerFrame = new THREE.Matrix4();
  const joint = new THREE.Vector3();
  const wrist = new THREE.Vector3();
  const ankle = new THREE.Vector3();
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

  for (const [order, side, rear] of [[0, -1, false], [1, 1, true], [2, 1, false], [3, -1, true]]) {
    const foot = new THREE.Group();
    foot.name = `foot-${rear ? 'rear' : 'front'}-${side < 0 ? 'left' : 'right'}`;
    frog.add(foot);
    const footX = side * (rear ? 0.38 : 0.5);
    const footY = rear ? -0.32 : 0.4;
    const limbName = `${rear ? 'rear' : 'front'}-${side < 0 ? 'left' : 'right'}`;
    const upper = bone(frog, skin, rear ? 0.09 : 0.043, `${limbName}-upper`, rear);
    const lower = bone(frog, skin, rear ? 0.055 : 0.031, `${limbName}-lower`, rear);
    const knee = ellipsoid(frog, skin, [0, 0, -0.7], rear ? [0.095, 0.11, 0.095] : [0.05, 0.055, 0.045], `${limbName}-joint`);
    const tarsus = rear ? bone(frog, skin, 0.045, `${limbName}-tarsus`, true) : null;
    const ankleJoint = rear ? ellipsoid(frog, skin, [0, 0, -0.4], [0.055, 0.065, 0.045], `${limbName}-ankle`) : null;
    const thigh = rear ? ellipsoid(frog, skin, [0, 0, -0.7], [0.13, 0.25, 0.105], `${limbName}-thigh`) : null;
    const palm = ellipsoid(foot, underside, [0, 0, -0.031], [0.075, 0.085, 0.029], 'contact-palm');
    const digits = [];
    for (let digit = 0; digit < 4; digit += 1) {
      const spread = (digit - 1.5) * 0.09;
      const tip = new THREE.Vector3(spread + (rear ? side * 0.045 : 0), 0.19 + Math.sin(digit / 3 * Math.PI) * 0.105, -0.018);
      const knuckle = new THREE.Vector3(spread * 0.68, tip.y * 0.52, -0.018);
      const first = bone(foot, skin, 0.025, 'contact-digit-base', false, 0.016);
      const second = bone(foot, pads, 0.023, 'contact-digit-tip', false, 0.016);
      const jointPad = ellipsoid(foot, skin, knuckle.toArray(), [0.025, 0.027, 0.016], 'contact-knuckle');
      const pad = ellipsoid(foot, pads, tip.toArray(), [0.037, 0.042, 0.016], 'contact-pad');
      digits.push({ tip, knuckle, first, second, jointPad, pad });
    }
    legs.push({ order, side, rear, foot, footX, footY, upper, lower, knee, tarsus, ankleJoint, thigh, palm, digits });
  }

  /**
   * Löst die Gliedmaßen bei festem Fußkontakt mit unveränderlichen Segmentlängen.
   * Hinterbeine falten sich vorwiegend in die Tiefe statt seitlich vom Körper weg.
   * Die Wahl auf dem IK-Lösungskreis hält das Knie im körpernahen Seitenabstand.
   * Ein körpernaher Knöchel und überlappende Ellipsoide halten die Kontur kompakt und rund.
   */
  function poseLeg(leg, bodyX, bodyY, angle) {
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    const localX = leg.side * 0.25;
    const localY = leg.rear ? -0.36 : 0.24;
    hip.set(bodyX + localX * cosine - localY * sine, bodyY + localX * sine + localY * cosine, -0.7);
    wrist.set(leg.foot.position.x, leg.foot.position.y, leg.foot.position.z - 0.06);
    ankle.copy(wrist);
    if (leg.rear) {
      const footAngle = leg.foot.rotation.z;
      const ankleX = -leg.side * 0.025;
      const ankleY = -0.3;
      ankle.x += ankleX * Math.cos(footAngle) - ankleY * Math.sin(footAngle);
      ankle.y += ankleX * Math.sin(footAngle) + ankleY * Math.cos(footAngle);
      ankle.z -= 0.49;
    }
    direction.subVectors(ankle, hip);
    const distance = Math.max(direction.length(), 0.001);
    direction.multiplyScalar(1 / distance);
    const upperLength = leg.rear ? 0.4 : 0.38;
    const lowerLength = leg.rear ? 0.46 : 0.58;
    const reach = Math.min(distance, (upperLength + lowerLength) * 0.999);
    const along = (upperLength ** 2 - lowerLength ** 2 + reach ** 2) / (2 * reach);
    const height = Math.sqrt(Math.max(0, upperLength ** 2 - along ** 2));
    if (leg.rear) {
      bendSide.set(leg.side * cosine, leg.side * sine, 0);
      const outward = direction.dot(bendSide);
      bendSide.addScaledVector(direction, -outward);
      const lateralReach = bendSide.length();
      bendSide.normalize();
      bendBack.crossVectors(direction, bendSide);
      if (bendBack.z > 0) bendBack.negate();
      const centerOutward = (hip.x - bodyX) * leg.side * cosine
        + (hip.y - bodyY) * leg.side * sine + along * outward;
      const lateral = THREE.MathUtils.clamp((0.4 - centerOutward) / Math.max(height * lateralReach, 0.001), -0.98, 0.98);
      bend.copy(bendSide).multiplyScalar(lateral).addScaledVector(bendBack, Math.sqrt(1 - lateral * lateral));
    } else {
      bend.set(leg.side * cosine + 0.5 * sine, leg.side * sine - 0.5 * cosine, -0.16);
      bend.addScaledVector(direction, -bend.dot(direction)).normalize();
    }
    joint.copy(hip).addScaledVector(direction, along).addScaledVector(bend, height);
    leg.knee.position.copy(joint);
    poseBone(leg.upper, hip, joint);
    poseBone(leg.lower, joint, ankle);
    if (leg.rear) {
      leg.ankleJoint.position.copy(ankle);
      poseBone(leg.tarsus, ankle, wrist);
      leg.thigh.position.copy(leg.upper.mesh.position);
      leg.thigh.quaternion.copy(leg.upper.mesh.quaternion);
      leg.thigh.scale.set(0.125, upperLength * 0.6, 0.115);
    }
  }

  const digitBase = new THREE.Vector3(0, 0, -0.018);

  /** Setzt den Fuß voraus; Innenfläche und Zehen liegen in der Haftphase flach am Glas an. */
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
    leg.foot.rotation.z = angle;
    leg.foot.userData.planted = lift < 0.001;
    leg.digits.forEach((digit, index) => {
      const digitSwing = active ? THREE.MathUtils.clamp((swing - index * 0.025) / 0.925, 0, 1) : 1;
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
    body.position.set(bodyX, bodyY, 0);
    body.rotation.z = angle;
    body.scale.x = 1 + Math.sin(time * 1.7) * 0.008;
    abdomen.scale.z = 0.075 * (1 + Math.sin(time * 1.7) * 0.04);
    head.rotation.y = Math.sin(time * 0.23) * 0.035;
    for (const leg of legs) {
      poseFoot(leg, progress);
      poseLeg(leg, bodyX, bodyY, angle);
    }
    frog.userData.motion = BOUTS.some(bout => time > bout.start && time < bout.start + bout.duration) ? 'climbing' : 'resting';
  }

  update(0);

  return {
    group, update,
    /** Gibt die gemeinsam genutzten Ressourcen ohne laufzeitabhängige Geometrieallokationen frei. */
    dispose() {
      sphere.dispose();
      cylinder.dispose();
      texture.dispose();
      for (const material of [skin, underside, pads, eyes]) material.dispose();
      group.clear();
    },
  };
}
