/** @file environment-motion.js — Koordiniert Nebeldichte, unterirdische Sichtbarkeit und Wolkenbewegung. */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

/**
 * Berechnet überlagerte Wind- und Ringwellen mit abgeflachter Uferzone.
 * @param {number} x - Horizontale X-Koordinate des aktuellen Punkts.
 * @param {number} y - Lokale Höhen- beziehungsweise zweite Flächenkoordinate.
 * @param {number} waterTime - Bei Reduced Motion eingefrorene Zeit der Wasserwellen.
 * @returns {number} Berechneter Zahlenwert.
 */
function waterHeight(x, y, waterTime) {

  const radial = Math.hypot(x, y);                                                             // Radialer Abstand oder Richtungsvektor zur Stammachse.
  const edgeFade = 1 - THREE.MathUtils.smoothstep(radial, 4.6, 5.9);                           // Zum Ufer hin abgeflachter Einfluss der Wasserwellen.
  const bankFade = 0.22 + 0.78 * edgeFade;                                                     // Restbewegung der Wasseroberfläche am Ufer.
  const stemDistance = Math.hypot((x + 4.0) * 1.38, y + 0.2);                                  // Elliptisch gewichteter Abstand zur stammnahen Wellenquelle.
  const shoreDistance = Math.hypot(x - 1.8, y + 3.2);                                          // Abstand zur zweiten Wellenquelle am Ufer.
  const stemRings =
    Math.sin(stemDistance * 3.5 - waterTime * 3.0) * 0.095 * Math.exp(-stemDistance * 0.24);   // Gedämpfte Ringwellen von der stammnahen Wellenquelle.
  const shoreRings =
    Math.sin(shoreDistance * 3.0 - waterTime * 2.4) * 0.058 * Math.exp(-shoreDistance * 0.3);  // Gedämpfte Ringwellen von der ufernahen Wellenquelle.
  const wind =
    Math.sin(x * 2.5 + y * 0.8 + waterTime * 1.9) * 0.06 +
    Math.sin(y * 3.9 - x * 0.5 - waterTime * 2.3) * 0.038;                                     // Überlagerte gerichtete Windwellen.

  return (stemRings + shoreRings + wind) * bankFade;
}

/**
 * Verformt den Wasserpuffer und berechnet seine Oberflächennormalen neu.
 * @param {unknown} swampWaterState - Wassermesh mit unverformten und animierten Positionspuffern.
 * @param {number} frame - Aufsummierte Animationszeit in Sekunden.
 * @param {object} reducedMotion - Medienabfrage für reduzierte Bewegung.
 * @returns {void} Kein Rückgabewert.
 */
function updatePondWaves(swampWaterState, frame, reducedMotion) {

  const { mesh, basePositions, positions } = swampWaterState;  // Benötigte Werte und Aktionen dieses Teilbereichs.
  const array = positions.array;                               // Direkter Zugriff auf den animierten Wasser-Positionspuffer.
  const waterTime = reducedMotion.matches ? 0 : frame;         // Bei Reduced Motion eingefrorene Zeit der Wasserwellen.

  for (let i = 0; i < array.length; i += 3) {

    const x = basePositions[i];      // Horizontale X-Koordinate des aktuellen Punkts.
    const y = basePositions[i + 1];  // Lokale Höhen- beziehungsweise zweite Flächenkoordinate.

    array[i + 2] = waterHeight(x, y, waterTime);
  }
  positions.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

/**
 * Bewegt schwimmende Blätter relativ zu ihren festen Ausgangswerten.
 * @param {Array} floatingWaterLeaves - Schwimmende Blätter mit stabilen Bewegungsankern.
 * @param {number} frame - Aufsummierte Animationszeit in Sekunden.
 * @returns {void} Kein Rückgabewert.
 */
function updateFloatingLeaves(floatingWaterLeaves, frame) {
  for (const leaf of floatingWaterLeaves) {
    leaf.position.y =
      leaf.userData.baseY + Math.sin(frame * leaf.userData.speed + leaf.userData.phase) * 0.035;
    leaf.rotation.z =
      leaf.userData.baseRot +
      Math.sin(frame * (leaf.userData.speed * 0.6) + leaf.userData.phase) * 0.22;
    leaf.position.x =
      leaf.userData.baseX +
      Math.cos(frame * (leaf.userData.speed * 0.4) + leaf.userData.phase) * 0.16;
    leaf.position.z =
      leaf.userData.baseZ +
      Math.sin(frame * (leaf.userData.speed * 0.33) + leaf.userData.phase * 1.4) * 0.06;
  }
}

/**
 * Koordiniert Wellen und die Bewegung schwimmender Blätter.
 * @param {object} context - Explizite Abhängigkeiten beziehungsweise aktueller Dateneintrag.
 * @param {number} frame - Aufsummierte Animationszeit in Sekunden.
 * @param {object} reducedMotion - Medienabfrage für reduzierte Bewegung.
 * @returns {void} Kein Rückgabewert.
 */
export function updateWater({ swampWaterState, floatingWaterLeaves }, frame, reducedMotion) {
  if (swampWaterState) {
    updatePondWaves(swampWaterState, frame, reducedMotion);
  }
  if (floatingWaterLeaves?.length) {
    updateFloatingLeaves(floatingWaterLeaves, frame);
  }
}

/**
 * Blendet die unterirdische Decke und Vordergrundwurzel beim Auftauchen aus.
 * @param {object} earthCeilingMaterial - Beim Auftauchen ausblendbares Material der Erddecke.
 * @param {object} ceilingStrata - Flache Erdschichten an der Unterseite der Decke.
 * @param {object} foregroundRoot - Große Vordergrundwurzel im unterirdischen Kapitel.
 * @param {number} height - Höhe des aktuellen Kapitels oder Geometrieabschnitts.
 * @returns {void} Kein Rückgabewert.
 */
function updateUndergroundVisibility(earthCeilingMaterial, ceilingStrata, foregroundRoot, height) {

  const undergroundVisibility = 1 - THREE.MathUtils.smoothstep(height, -1.0, 0.5);  // Ausblendfaktor unterirdischer Objekte beim Auftauchen.

  earthCeilingMaterial.opacity = Math.max(0.001, undergroundVisibility);
  earthCeilingMaterial.depthWrite = undergroundVisibility > 0.98;
  ceilingStrata.visible = undergroundVisibility > 0.5;
  foregroundRoot.visible = undergroundVisibility > 0.35;
}

/**
 * Bewegt Wolken relativ zu ihren unveränderten Ausgangspositionen.
 * @param {Array} mistGroups - Wolkenobjekte mit stabilen Bewegungsankern.
 * @param {number} atmosphericTime - Bei Reduced Motion eingefrorene Atmosphärenzeit.
 * @returns {void} Kein Rückgabewert.
 */
function driftMistLayers(mistGroups, atmosphericTime) {
  for (const layer of mistGroups) {

    const phase = atmosphericTime * layer.velocity + layer.phase;  // Feste Zufallsphase der lokalen Form oder Bewegung.

    layer.blob.position.x = layer.originX + Math.sin(phase) * layer.range;
    layer.blob.position.z = layer.originZ + Math.cos(phase * 0.63) * layer.range * 0.46;
    layer.blob.position.y =
      layer.originY + Math.sin(phase * 0.42) * (layer.type === 'cloud' ? 0.45 : 0.08);
  }
}

/**
 * Koordiniert Nebeldichte, unterirdische Sichtbarkeit und Wolkenbewegung.
 * @param {object} context - Explizite Abhängigkeiten beziehungsweise aktueller Dateneintrag.
 * @param {number} height - Höhe des aktuellen Kapitels oder Geometrieabschnitts.
 * @param {number} frame - Aufsummierte Animationszeit in Sekunden.
 * @param {object} reducedMotion - Medienabfrage für reduzierte Bewegung.
 * @returns {void} Kein Rückgabewert.
 */
export function updateAtmosphere(
  { mistMat, mistGroups, earthCeilingMaterial, ceilingStrata, foregroundRoot },
  height,
  frame,
  reducedMotion,
) {

  const atmosphericTime = reducedMotion.matches ? 0 : frame;         // Bei Reduced Motion eingefrorene Atmosphärenzeit.

  mistMat.uniforms.uTime.value = atmosphericTime;

  const surfaceFog = THREE.MathUtils.smoothstep(height, -1.1, 0.6);  // Höhenabhängiger Übergang der Nebeldichte an der Bodenoberfläche.

  mistMat.uniforms.uOpacity.value =
    THREE.MathUtils.lerp(0.045, 0.29, surfaceFog) *
    (1 - THREE.MathUtils.smoothstep(height, 2.0, 8.0) * 0.72);
  updateUndergroundVisibility(earthCeilingMaterial, ceilingStrata, foregroundRoot, height);
  driftMistLayers(mistGroups, atmosphericTime);
}
