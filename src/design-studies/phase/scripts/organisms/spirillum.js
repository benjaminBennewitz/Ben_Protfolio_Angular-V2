/** @file spirillum.js — Geometrie und Bewegung der PHASE-Probe. */

/** Ein räumlicher Schraubenkörper rotiert; frei schwingende Geißeln laufen verzögert nach. */
export function drawSpirillum(frame) {
  const state = createSpirillumState(frame);
  drawSpiralBody(state);
  drawSpiralFlagella(state);
}

/** Berechnet die gemeinsamen Geometriewerte eines Frames. */
function createSpirillumState(frame) {
  const state = { ...frame };
  state.turns = 2.8 + state.settings.frequency * 1.4;
  state.tilt = -0.15 + Math.sin(state.time * 0.45) * 0.1 * state.settings.amplitude;
  state.segments = state.compact ? 290 : 410;
  return state;
}

/** Zeichnet aufeinanderfolgende Querschnitte des Helixkörpers. */
function drawSpiralBody(state) {
  for (let i = 0; i < state.segments; i++) {
    drawHelixSegment(i, state.segments, state.turns, state.time, state.settings, state.addPoint, state.tilt);
  }
}

/** Verteilt Geißeln an beiden Körperenden. */
function drawSpiralFlagella(state) {
  for (const end of [0, 1]) {
    const root = spirillumHelix({ turns: state.turns, time: state.time, settings: state.settings }, end);
    for (let strand = 0; strand < 5; strand++) {
      drawFlagellum(strand, state.time, state.settings, state.addPoint, state.tilt, root, end);
    }
  }
}

/** Dreht alle Bestandteile in dieselbe leicht schräg stehende Schwimmrichtung. */
function spirillumPoint({ addPoint, tilt }, x, y, z, tip = false, pulse = false) {
  addPoint(x * Math.cos(tilt) - y * Math.sin(tilt), x * Math.sin(tilt) + y * Math.cos(tilt), z, tip, pulse);
}

/** Liefert die Mittellinie der Helix einschließlich ihrer langsamen Körperwelle. */
function spirillumHelix({ turns, time, settings }, u) {
  const phase = u * Math.PI * 2 * turns - time * 2.1;
  const radius = 0.065 + Math.sin(Math.PI * u) * 0.026;
  return {
    x: Math.cos(phase) * radius + Math.sin(u * 5 - time) * 0.026 * settings.amplitude,
    y: (u - 0.5) * 0.7,
    z: Math.sin(phase) * radius,
    phase,
  };
}

/** Zeichnet eine verzögert nachlaufende Geißel. */
function drawFlagellum(strand, time, settings, addPoint, tilt, root, end) {
  const phase = (strand / 5) * Math.PI * 2;
  for (let j = 0; j < 65; j++) {
    const v = j / 64;
    const free = v * v;
    const angle = phase - time * 2.1 + v * 7;
    const spread = (0.008 + 0.043 * free) * settings.amplitude;
    spirillumPoint(
      { addPoint, tilt },
      root.x + Math.cos(angle) * spread * v,
      root.y + (end === 0 ? -1 : 1) * v * 0.105,
      root.z + Math.sin(angle) * spread * v,
      j === 64,
      Math.sin(time * 2 + phase) > 0.6,
    );
  }
}

/** Zeichnet den feinen Querschnitt eines Helixsegments. */
function drawHelixSegment(i, segments, turns, time, settings, addPoint, tilt) {
  const u = i / (segments - 1);
  const center = spirillumHelix({ turns, time, settings }, u);
  const radius = 0.011 * (0.55 + 0.45 * Math.sin(Math.PI * u));
  for (let j = 0; j < 12; j++) {
    const angle = (j / 12) * Math.PI * 2;
    const offset = Math.cos(angle) * radius;
    const active = Math.sin(u * 15 - time * 3) > 0.97;
    spirillumPoint(
      { addPoint, tilt },
      center.x + Math.cos(center.phase) * offset,
      center.y + Math.sin(angle) * radius,
      center.z + Math.sin(center.phase) * offset,
      active && j % 3 === 0,
      active,
    );
  }
}
