/** @file sun.js — Geometrie und Bewegung der PHASE-Probe. */

/** Räumliche Kugel und fein aufgefächerte radiale Strahlen mit wandernden Impulsen. */
export function drawSun(frame) {
  const state = createSunState(frame);
  drawSunBody(state);
  drawSunRays(state);
}

/** Berechnet die gemeinsamen Geometriewerte eines Frames. */
function createSunState(frame) {
  const state = { ...frame };
  state.pulse = Math.sin(state.time * 2.5 * state.settings.frequency);
  state.radius = 0.105 * (1 + state.pulse * 0.07 * state.settings.amplitude);
  state.turn = state.time * 0.055;
  state.count = state.compact ? 1000 : 1700;
  state.rays = state.compact ? 62 : 90;
  return state;
}

/** Verteilt Punkte gleichmäßig auf der Kugeloberfläche. */
function drawSunBody(state) {
  for (let i = 0; i < state.count; i++) {
    const y = 1 - (2 * (i + 0.5)) / state.count;
    const ring = Math.sqrt(1 - y * y);
    const angle = i * 2.399963 + state.turn;
    state.addPoint(Math.cos(angle) * ring * state.radius, y * state.radius, Math.sin(angle) * ring * state.radius);
  }
}

/** Verteilt die Strahlen um den Kugelkörper. */
function drawSunRays(state) {
  for (let i = 0; i < state.rays; i++) {
    drawSunRay(i, state.rays, state.turn, state.time, state.settings, state.radius, state.addPoint);
  }
}

/** Zeichnet einen radialen Strahl mit wanderndem Impuls. */
function drawSunRay(i, rays, turn, time, settings, radius, addPoint) {
  const y = 1 - (2 * (i + 0.5)) / rays;
  const ring = Math.sqrt(1 - y * y);
  const angle = i * 2.399963 + turn;
  const dx = Math.cos(angle) * ring,
    dz = Math.sin(angle) * ring;
  const reach = 0.21 + 0.13 * (0.5 + 0.5 * Math.sin(i * 7.13));
  const wave = time * settings.frequency * 0.5 - i * 0.073;
  const impulse = wave - Math.floor(wave);
  for (let j = 0; j < 49; j++) {
    const v = j / 48;
    const distance = radius + v * reach;
    const bend = Math.sin(time * 1.3 + i * 1.9 - v * 3) * v * v * 0.012 * settings.amplitude;
    const active = Math.abs(v - impulse) < 0.035;
    addPoint(dx * distance - y * bend, y * distance + dx * bend, dz * distance, active || j === 48, active);
  }
}
