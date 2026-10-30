/** @file Kieselalge mit symmetrischen Porenreihen und gedrehter Doppelschale. */
import { withPose, emit } from './geometry.js';

/** Dreht eine filigrane Doppelschale langsam um ihre Längsachse. */
export function drawDiatom(frame) {
  const state = withPose(frame, -0.2 + Math.sin(frame.time * 0.6) * 0.08 * frame.settings.amplitude, frame.time * 0.16 * frame.settings.frequency);
  drawValve(state, -1);
  drawValve(state, 1);
  drawValveRims(state);
  drawCentralRaphe(state);
}

/** Verteilt die regelmäßigen Rippen einer bootsförmigen Schalenhälfte. */
function drawValve(state, side) {
  const rows = state.compact ? 58 : 82;
  for (let row = 0; row < rows; row++) {
    const v = row / (rows - 1);
    const y = (v - 0.5) * 0.66;
    const width = Math.pow(Math.max(0, Math.sin(v * Math.PI)), 0.72) * 0.155;
    for (let j = 0; j < 52; j++) drawValvePore(state, side, j, y, width, v);
  }
}

/** Setzt einen Porenpunkt auf die leicht gewölbte Schalenoberfläche. */
function drawValvePore(state, side, index, y, width, v) {
  const lateral = (index / 51) * 2 - 1;
  const depth = side * (0.014 + Math.sqrt(Math.max(0, 1 - lateral * lateral)) * 0.035 * Math.sin(v * Math.PI));
  const ridge = Math.cos(index * Math.PI) * 0.0015;
  const active = (index === 1 || index === 50) && Math.sin(v * 12 - state.time * 1.4) > 0.95;
  emit(state, lateral * width, y + ridge, depth, active, active);
}

/** Verbindet die beiden Schalen mit drei umlaufenden Randlagen. */
function drawValveRims(state) {
  for (const side of [-1, 1]) {
    for (let i = 0; i < 260; i++) {
      const v = i / 259;
      const width = Math.pow(Math.max(0, Math.sin(v * Math.PI)), 0.72) * 0.155;
      for (const depth of [-0.014, 0, 0.014]) emit(state, side * width, (v - 0.5) * 0.66, depth);
    }
  }
}

/** Markiert die zentrale Schalennaht durch einen langsam wandernden Impuls. */
function drawCentralRaphe(state) {
  for (let i = 0; i < 260; i++) {
    const v = i / 259;
    const bend = Math.sin(v * Math.PI * 2) * 0.009;
    const pulse = Math.sin(v * 10 - state.time * 1.7) > 0.95;
    for (const side of [-1, 1]) emit(state, bend, (v - 0.5) * 0.59, side * 0.053, pulse, pulse);
  }
}
