/** @file world/trunk.js — Prozeduraler Aufbau des zugehörigen Weltbereichs. */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

/**
 * Erzeugt den Stamm mit unregelmäßigem Fuß und dezenten oberen Rindenwülsten.
 * @param {object} context - Explizite Abhängigkeiten beziehungsweise aktueller Dateneintrag.
 * @returns {void} Kein Rückgabewert.
 */
export function buildTrunk({
  useLayer,
  trunkCenterAt,
  branch,
  trunkRadiusAt,
  barkLight,
  bark,
  between,
  scene,
  vec,
}) {
  useLayer('trunk');

  let previous = trunkCenterAt(-1.2);  // Vorheriger Anschluss- oder Interpolationspunkt.
  const trunkTopY = 41.3;              // Oberes Stammende.

  for (let i = 1; i <= 40; i++) {

    const y = -1.2 + (i / 40) * (trunkTopY + 1.2);  // Lokale Höhen- beziehungsweise zweite Flächenkoordinate.
    const next = trunkCenterAt(y);                  // Nächster Anschluss- oder Interpolationspunkt.
    const isMilestone = i % 7 === 0 || i === 40;    // Das Stammsegment erhält ein sichtbares Übergangsgelenk.

    branch(
      previous,
      next,
      trunkRadiusAt(previous.y),
      trunkRadiusAt(y),
      i % 4 === 0 ? barkLight : bark,
      13,
      {
        startJoint: false,
        endJoint: isMilestone,
        endJointScale: between(0.94, 1.06),
        endSquash: between(1.0, 1.12),
        endRandomness: 0.08,
      },
    );
    previous = next;
  }
  for (let i = 0; i < 7; i++) {

    const angle = (i * Math.PI * 2) / 7 + between(-0.22, 0.22);  // Lokaler Winkel um den Stamm beziehungsweise Geometrieanker.
    const y = between(1.4, 7.2);                                 // Lokale Höhen- beziehungsweise zweite Flächenkoordinate.
    const center = trunkCenterAt(y);                             // Mittelpunkt der aktuellen Geometrie beziehungsweise des Viewports.
    const lobe = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1, 1),
      i % 2 === 0 ? barkLight : bark,
    );                                                           // Unregelmäßiges Volumen des Stamm- oder Wurzelfußes.
    const radial = trunkRadiusAt(y) * between(0.5, 0.72);        // Radialer Abstand oder Richtungsvektor zur Stammachse.

    lobe.position.set(center.x + Math.cos(angle) * radial, y, center.z + Math.sin(angle) * radial);
    lobe.scale.set(between(1.1, 1.9), between(1.8, 4.3), between(0.9, 1.7));
    lobe.rotation.set(between(-0.35, 0.35), angle, between(-0.35, 0.35));
    scene.add(lobe);
  }
  for (let i = 0; i < 4; i++) {

    const y = between(18, 37);        // Lokale Höhen- beziehungsweise zweite Flächenkoordinate.
    const center = trunkCenterAt(y);  // Mittelpunkt der aktuellen Geometrie beziehungsweise des Viewports.
    const collar = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1, 1),
      i % 2 === 0 ? bark : barkLight,
    );                                // Verbindender Stamm- oder Wurzelwulst.

    collar.position.copy(center).add(vec(between(-0.15, 0.15), 0, between(-0.15, 0.15)));
    collar.scale.set(between(1.2, 1.55), between(0.5, 0.9), between(1.2, 1.55));
    scene.add(collar);
  }
}
