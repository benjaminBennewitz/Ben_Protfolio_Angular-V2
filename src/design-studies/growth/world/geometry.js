/** @file world/geometry.js — Prozeduraler Aufbau des zugehörigen Weltbereichs. */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

/**
 * Setzt Positions-, UV- und Indexdaten zu einer Oberfläche mit Normalen zusammen.
 * @param {Array} positions - Positionspuffer der aktuell erzeugten oder animierten Geometrie.
 * @param {Array} uvs - Texturkoordinaten der aktuellen Oberfläche.
 * @param {Array} indices - Dreiecksindizes der aktuellen Geometrie.
 * @returns {THREE.BufferGeometry} Ergebnis der beschriebenen Operation.
 */
export function createIndexedSurface(positions, uvs, indices) {

  const geometry = new THREE.BufferGeometry();  // Geometrie des aktuell aufgebauten Szeneobjekts.

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
