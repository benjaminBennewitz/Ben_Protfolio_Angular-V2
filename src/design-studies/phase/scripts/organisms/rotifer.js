/** @file Rädertierchen mit zwei phasenversetzten Wimpernkränzen. */
import { withPose, emit, ellipsoid, ellipse } from './geometry.js';

/** Verbindet den tropfenförmigen Körper mit den beiden aktiven Wimpernrädern. */
export function drawRotifer(frame) {
  const state = withPose(frame, Math.sin(frame.time * 0.5) * 0.08);
  drawRotiferBody(state);
  drawRotiferOrgans(state);
  for (const side of [-1, 1]) drawWheel(state, side);
  drawRotiferFoot(state);
}

/** Zeichnet einen transparenten Körper mit nach hinten abnehmendem Durchmesser. */
function drawRotiferBody(state) {
  const rows = state.compact ? 65 : 90;
  for (let row = 0; row < rows; row++) {
    const v = row / (rows - 1);
    const width = Math.pow(Math.sin(Math.PI * v), 0.65) * (0.115 - v * 0.055);
    for (let i = 0; i < 56; i++) {
      const angle = (i / 56) * Math.PI * 2;
      const breath = 1 + Math.sin(state.time * 1.5 - v * 6) * 0.035 * state.settings.amplitude;
      emit(state, Math.cos(angle) * width * breath, -0.16 + v * 0.48, Math.sin(angle) * width * 0.6);
    }
  }
}

/** Macht innere Organe als kleine, unterschiedlich pulsierende Punktkörper sichtbar. */
function drawRotiferOrgans(state) {
  for (let i = 0; i < 3; i++) {
    const pulse = 1 + Math.sin(state.time * 2 - i) * 0.13 * state.settings.amplitude;
    ellipsoid(state, [0, -0.06 + i * 0.095, -0.035], [0.028 * pulse, 0.035 * pulse, 0.015], 190, i === 0);
  }
}

/** Verankert jeden Wimpernkranz an einem eigenen hellen Ring. */
function drawWheel(state, side) {
  const center = [side * 0.075, -0.2, -0.005];
  ellipse(state, center, [0.069, 0.035, 0.035], 170);
  const count = state.compact ? 42 : 58;
  for (let i = 0; i < count; i++) drawWheelCilium(state, center, side, i, count);
}

/** Lässt eine koordinierte Schlagwelle um den Wimpernkranz wandern. */
function drawWheelCilium(state, center, side, index, count) {
  const angle = (index / count) * Math.PI * 2;
  const phase = angle * 7 - state.time * 5 * state.settings.frequency + side;
  for (let i = 0; i < 20; i++) {
    const v = i / 19;
    const bend = Math.sin(phase + v * 2) * v * v * 0.35 * state.settings.amplitude;
    const radius = 0.069 + v * (0.027 + Math.sin(phase) * 0.009);
    emit(
      state,
      center[0] + Math.cos(angle + bend) * radius,
      center[1] + Math.sin(angle + bend) * radius * 0.5,
      center[2] + Math.sin(angle + bend) * radius * 0.5,
      i === 19,
      Math.sin(phase) > 0.65,
    );
  }
}

/** Zeichnet den schmalen Fuß mit zwei auslaufenden Zehen. */
function drawRotiferFoot(state) {
  for (const side of [-1, 1]) {
    for (let i = 0; i < 80; i++) {
      const v = i / 79;
      const bend = Math.sin(state.time * 1.4 - v * 4) * v * v * 0.012 * state.settings.amplitude;
      emit(state, side * v * v * 0.022 + bend, 0.31 + v * 0.1, 0.005, i === 79);
    }
  }
}
