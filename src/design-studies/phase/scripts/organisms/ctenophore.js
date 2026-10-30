/** @file Rippenqualle mit acht wandernden Lichtkämmen und transparentem Körper. */
import { withPose, emit, ellipsoid } from './geometry.js';

/** Kombiniert einen ruhigen Glaskörper mit acht unabhängig versetzten Lichtbahnen. */
export function drawCtenophore(frame) {
  const state = withPose(frame, Math.sin(frame.time * 0.35) * 0.1, frame.time * 0.09);
  state.breath = 1 + Math.sin(frame.time * 1.5) * 0.045 * frame.settings.amplitude;
  ellipsoid(state, [0, 0, 0], [0.17 * state.breath, 0.28, 0.13 * state.breath], state.compact ? 1600 : 2600);
  for (let row = 0; row < 8; row++) drawCombRow(state, row);
  drawCombCanal(state);
}

/** Verteilt kleine Wimpernkämme entlang einer Körperrippe. */
function drawCombRow(state, row) {
  const angle = (row / 8) * Math.PI * 2;
  const count = state.compact ? 44 : 62;
  for (let i = 0; i < count; i++) {
    const v = 0.06 + (i / (count - 1)) * 0.88;
    const latitude = v * Math.PI;
    const signal = Math.sin(v * 17 - state.time * 3.5 * state.settings.frequency + row * 0.8);
    drawComb(state, angle, latitude, signal);
  }
}

/** Fächert einen Lichtkamm tangential auf der Rippe auf. */
function drawComb(state, angle, latitude, signal) {
  const pulse = signal > 0.65;
  for (let j = 0; j < 8; j++) {
    const offset = (j / 7 - 0.5) * (0.06 + Math.sin(state.time * 3 - latitude * 8) * 0.012 * state.settings.amplitude);
    emit(
      state,
      Math.cos(angle + offset) * Math.sin(latitude) * 0.176 * state.breath,
      Math.cos(latitude) * 0.28,
      Math.sin(angle + offset) * Math.sin(latitude) * 0.136 * state.breath,
      pulse,
      pulse,
    );
  }
}

/** Zeigt den inneren Kanal mit vier weich schwingenden Ausläufern am unteren Pol. */
function drawCombCanal(state) {
  for (let i = 0; i < 200; i++) {
    const v = i / 199;
    emit(state, Math.sin(v * 8 - state.time) * 0.008, (v - 0.5) * 0.46, -0.015);
  }
  for (let side = 0; side < 4; side++) {
    for (let i = 0; i < 65; i++) {
      const v = i / 64;
      const angle = (side * Math.PI) / 2;
      emit(
        state,
        Math.cos(angle) * v * 0.045 + Math.sin(state.time * 2 - v * 6 + side) * v * v * 0.018,
        0.27 + v * 0.09,
        Math.sin(angle) * v * 0.035,
        i === 64,
      );
    }
  }
}
