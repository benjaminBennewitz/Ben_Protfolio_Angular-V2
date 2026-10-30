/** @file ciliate.js — Geometrie und Bewegung der PHASE-Probe. */

/** Schmale Zellhülle, gekrümmte Mundfurche, Zellkern und umlaufende Flimmerhärchen. */
export function drawCiliate(frame) {
  const state = createCiliateState(frame);
  drawCellMembrane(state);
  drawCellCilia(state);
  drawCellNucleus(state);
  drawCellGroove(state);
}

/** Berechnet die gemeinsamen Geometriewerte eines Frames. */
function createCiliateState(frame) {
  const state = { ...frame };
  state.tilt = -0.25 + Math.sin(state.time * 0.45) * 0.09 * state.settings.amplitude;
  state.width = 0.17;
  state.length = 0.35;
  state.breathing = 1 + Math.sin(state.time * 1.7) * 0.025 * state.settings.amplitude;
  state.rings = state.compact ? 48 : 66;
  state.hairs = state.compact ? 95 : 135;
  return state;
}

/** Zeichnet die ovale Hülle aus räumlichen Querschnitten. */
function drawCellMembrane(state) {
  for (let i = 0; i <= state.rings; i++) {
    const latitude = (i / state.rings) * Math.PI;
    const taper = 1 + 0.17 * Math.cos(latitude);
    for (let j = 0; j < 68; j++) {
      const angle = (j / 68) * Math.PI * 2;
      ciliatePoint(
        { addPoint: state.addPoint, tilt: state.tilt },
        Math.cos(angle) * Math.sin(latitude) * state.width * taper * state.breathing,
        Math.cos(latitude) * state.length,
        Math.sin(angle) * Math.sin(latitude) * state.width * 0.7,
      );
    }
  }
}

/** Verteilt die Flimmerhärchen entlang der Zellkontur. */
function drawCellCilia(state) {
  for (let i = 0; i < state.hairs; i++) {
    drawCilium(i, state.hairs, state.width, state.breathing, state.length, state.time, state.settings, state.addPoint, state.tilt);
  }
}

/** Zeichnet den inneren Zellkern. */
function drawCellNucleus(state) {
  for (let i = 0; i < 750; i++) {
    const angle = i * 2.399963;
    const radius = Math.sqrt((i + 0.5) / 750);
    ciliatePoint(
      { addPoint: state.addPoint, tilt: state.tilt },
      Math.cos(angle) * radius * 0.058 - 0.025,
      Math.sin(angle) * radius * 0.085 - 0.015,
      -0.045 - Math.sqrt(1 - radius * radius) * 0.025,
      i % 43 === 0,
      true,
    );
  }
}

/** Zeichnet die gebogene Mundfurche. */
function drawCellGroove(state) {
  for (let row = 0; row < 4; row++) {
    for (let j = 0; j < 95; j++) {
      const v = j / 94;
      ciliatePoint({ addPoint: state.addPoint, tilt: state.tilt }, 0.055 + Math.sin(v * Math.PI) * 0.035 + row * 0.003, (v - 0.5) * 0.43, -0.08);
    }
  }
}

/** Dreht Hülle, Organellen und Härchen gemeinsam um den Zellmittelpunkt. */
function ciliatePoint({ addPoint, tilt }, x, y, z, tip = false, pulse = false) {
  addPoint(x * Math.cos(tilt) - y * Math.sin(tilt), x * Math.sin(tilt) + y * Math.cos(tilt), z, tip, pulse);
}

/** Zeichnet ein einzelnes schlagendes Flimmerhärchen. */
function drawCilium(i, hairs, width, breathing, length, time, settings, addPoint, tilt) {
  const angle = (i / hairs) * Math.PI * 2;
  const x = Math.cos(angle) * width * (1 + 0.17 * Math.sin(angle)) * breathing;
  const y = Math.sin(angle) * length;
  const phase = angle * 12 - time * 5 * settings.frequency;
  const reach = 0.024 + 0.009 * Math.sin(phase);
  for (let j = 0; j < 13; j++) {
    const v = j / 12;
    const sweep = Math.sin(phase + v * 1.4) * 0.021 * v * v * settings.amplitude;
    ciliatePoint(
      { addPoint, tilt },
      x + Math.cos(angle) * reach * v - Math.sin(angle) * sweep,
      y + Math.sin(angle) * reach * v + Math.cos(angle) * sweep,
      0.015,
      j === 12,
      Math.sin(phase) > 0.75,
    );
  }
}
