/** Feste relative Ausgangspositionen der neun Zellen. */
const CELL_POSITIONS = [
  [0, 0],
  [-0.12, -0.1],
  [0.1, -0.12],
  [0.16, 0.06],
  [-0.12, 0.13],
  [0.03, 0.18],
  [-0.23, -0.045],
  [0.035, -0.27],
  [0.235, -0.17],
];
/** @file colony.js — Geometrie und Bewegung der PHASE-Probe. */

/** Verbundene Zellkörper atmen mit versetzten Phasen und tauschen sichtbare Impulse aus. */
export function drawColony(frame) {
  const state = createColonyState(frame);
  drawColonyCells(state);
}

/** Berechnet die gemeinsamen Geometriewerte eines Frames. */
function createColonyState(frame) {
  const state = { ...frame };
  state.positions = CELL_POSITIONS;
  state.turn = Math.sin(state.time * 0.27) * 0.17 * state.settings.amplitude;
  state.cells = state.positions.map(
    /** Berechnet die lokale Pulsphase einer einzelnen Zelle. */ ([x, y], i) => {
      const phase = state.time * 1.65 - i * 0.6 * state.settings.frequency;
      return {
        x: x + Math.sin(state.time * 0.7 + i * 2) * 0.012 * state.settings.amplitude,
        y: y + Math.cos(state.time * 0.6 + i) * 0.012 * state.settings.amplitude,
        z: Math.sin(i * 2.4 + state.time * 0.3) * 0.035,
        radius: (0.062 + (i % 3) * 0.008) * (1 + Math.sin(phase) * 0.11 * state.settings.amplitude),
        phase,
      };
    },
  );
  state.samples = state.compact ? 330 : 520;
  return state;
}

/** Zeichnet die einzelnen Zellen des verbundenen Verbunds. */
function drawColonyCells(state) {
  for (const [index, cell] of state.cells.entries()) {
    drawColonyCell(state.samples, state.time, cell, state.settings, state.addPoint, state.turn, index, state.cells);
  }
}

/** Dreht den gesamten Verbund, während die einzelnen Zellen ihre relative Lage halten. */
function colonyPoint({ addPoint, turn }, x, y, z, tip = false, pulse = false) {
  addPoint(x * Math.cos(turn) - y * Math.sin(turn), x * Math.sin(turn) + y * Math.cos(turn), z, tip, pulse);
}

/** Zeichnet einen feinen Impulskanal zwischen zwei Zellen. */
function drawCellConnection(strand, time, index, addPoint, turn, parent, cell) {
  for (let j = 0; j < 55; j++) {
    const v = j / 54;
    const offset = (strand - 2) * 0.0025 * Math.sin(v * Math.PI);
    const active = Math.sin(v * 9 - time * 2.3 + index) > 0.95;
    colonyPoint(
      { addPoint, turn },
      parent.x + (cell.x - parent.x) * v + offset,
      parent.y + (cell.y - parent.y) * v + Math.sin(v * Math.PI) * 0.012 * Math.sin(time + index),
      parent.z + (cell.z - parent.z) * v + offset,
      active,
      active,
    );
  }
}

/** Zeichnet Membran, Kern und Verbindungen einer Zelle. */
function drawColonyCell(samples, time, cell, settings, addPoint, turn, index, cells) {
  drawColonyMembrane(samples, time, cell, settings, addPoint, turn);
  drawColonyNucleus(cell, addPoint, turn);
  if (index === 0) return;
  const parent = cells[Math.floor((index - 1) / 2)];
  for (let strand = 0; strand < 5; strand++) {
    drawCellConnection(strand, time, index, addPoint, turn, parent, cell);
  }
}

/** Zeichnet die durchscheinende Zellmembran. */
function drawColonyMembrane(samples, time, cell, settings, addPoint, turn) {
  for (let i = 0; i < samples; i++) {
    const y = 1 - (2 * (i + 0.5)) / samples;
    const ring = Math.sqrt(1 - y * y);
    const angle = i * 2.399963 + time * 0.12;
    const distortion = 1 + Math.sin(angle * 3 + cell.phase) * 0.025 * settings.amplitude;
    colonyPoint(
      { addPoint, turn },
      cell.x + Math.cos(angle) * ring * cell.radius * distortion,
      cell.y + y * cell.radius,
      cell.z + Math.sin(angle) * ring * cell.radius * 0.75,
    );
  }
}

/** Zeichnet den kleinen pulsierenden Zellkern. */
function drawColonyNucleus(cell, addPoint, turn) {
  for (let i = 0; i < 65; i++) {
    const y = 1 - (2 * (i + 0.5)) / 65;
    const ring = Math.sqrt(1 - y * y);
    const angle = i * 2.399963;
    colonyPoint(
      { addPoint, turn },
      cell.x + Math.cos(angle) * ring * 0.012,
      cell.y + y * 0.015,
      cell.z - 0.025 + Math.sin(angle) * ring * 0.01,
      true,
      Math.sin(cell.phase) > 0.45,
    );
  }
}
