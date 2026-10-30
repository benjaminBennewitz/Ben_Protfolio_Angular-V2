/** @file Augentierchen mit schlankem Körper, Augenfleck und frei schlagender Geißel. */
import { withPose, emit, ellipsoid } from './geometry.js';

/** Verbindet die gleitende Zellform mit einem einzelnen langen Antriebsfaden. */
export function drawEuglena(frame) {
  const state = withPose(frame, 0.22 + Math.sin(frame.time * 0.6) * 0.1 * frame.settings.amplitude, frame.time * 0.05);
  drawSpindle(state);
  drawFlagellum(state);
  ellipsoid(state, [0.028, -0.18, -0.05], [0.015, 0.021, 0.009], 200, true);
  ellipsoid(state, [-0.006, 0.035, -0.045], [0.029, 0.043, 0.016], 380);
  drawInnerFibres(state);
}

/** Formt eine an beiden Enden spitz auslaufende Zellhülle. */
function drawSpindle(state) {
  const rows = state.compact ? 85 : 120;
  for (let i = 0; i < rows; i++) {
    const v = i / (rows - 1);
    const radius = Math.pow(Math.max(0, Math.sin(v * Math.PI)), 0.8) * 0.085;
    const wave = Math.sin(state.time * 1.5 - v * 5) * 0.008 * state.settings.amplitude;
    for (let j = 0; j < 60; j++) {
      const angle = (j / 60) * Math.PI * 2 + v * 1.2;
      emit(state, Math.cos(angle) * radius + wave, (v - 0.5) * 0.61, Math.sin(angle) * radius * 0.65);
    }
  }
}

/** Erzeugt den vom Vorderpol ausgehenden, nachlaufenden Geißelschlag. */
function drawFlagellum(state) {
  for (let i = 0; i < 200; i++) {
    const v = i / 199;
    const phase = state.time * 3 * state.settings.frequency - v * 9;
    const x = Math.sin(phase) * v * v * 0.085 * state.settings.amplitude;
    const y = -0.305 - v * 0.18 + Math.cos(phase) * v * v * 0.022 * state.settings.amplitude;
    emit(state, x, y, Math.cos(phase) * v * 0.025, i > 196, Math.sin(phase) > 0.75);
  }
}

/** Zeichnet mehrere leicht verdrehte innere Faserzüge. */
function drawInnerFibres(state) {
  for (let fibre = 0; fibre < 6; fibre++) {
    for (let i = 0; i < 90; i++) {
      const v = i / 89;
      const angle = (fibre / 6) * Math.PI * 2 + v * 3 + state.time * 0.08;
      const radius = Math.sin(v * Math.PI) * 0.052;
      emit(state, Math.cos(angle) * radius, (v - 0.5) * 0.49, Math.sin(angle) * radius * 0.6);
    }
  }
}
