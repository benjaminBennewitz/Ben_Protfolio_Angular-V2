/** @file worm.js — Geometrie und Bewegung der PHASE-Probe. */

/** Erhält die freigegebene Wurmform einschließlich ausschließlich oberer Tastfäden. */
export function drawWorm(frame) {
  const state = createWormState(frame);
  drawWormBody(state);
  drawWormBristles(state);
  drawWormFeelers(state);
}

/** Berechnet die gemeinsamen Geometriewerte eines Frames. */
function createWormState(frame) {
  const state = { ...frame };
  state.segments = state.compact ? 140 : 190;
  state.ribs = state.compact ? 58 : 76;
  state.samples = state.compact ? 34 : 46;
  state.headFrame = wormBodyFrame({ settings: state.settings, time: state.time }, 0);
  return state;
}

/** Zeichnet die aufeinanderfolgenden Körperquerschnitte. */
function drawWormBody(state) {
  for (let i = 0; i < state.segments; i++) {
    drawBodySegment(i, state.segments, state.settings, state.time, state.addPoint);
  }
}

/** Verteilt die Borstenpaare entlang der Körperachse. */
function drawWormBristles(state) {
  for (let i = 0; i < state.ribs; i++) {
    drawBristlePair(i, state.ribs, state.settings, state.time, state.samples, state.addPoint);
  }
}

/** Zeichnet ausschließlich die Tastfäden am Kopf. */
function drawWormFeelers(state) {
  for (const side of [-1, 1]) {
    drawFeelers(side, state.time, state.addPoint, state.headFrame);
  }
}

/**
 * Die Schwimmwelle wächst vom ruhigeren Kopf zum beweglicheren Schwanz.
 * Eine schwächere zweite Welle bricht die Gleichmäßigkeit der Silhouette auf.
 */
function wormSpine({ settings, time }, u) {
  const phase = u * Math.PI * 2 * settings.frequency - time;
  const envelope = 0.35 + 0.65 * u;
  const x = (Math.sin(phase) * 0.15 * envelope + Math.sin(phase * 2 - 0.7) * 0.018 * u) * settings.amplitude;
  const y = (u - 0.5) * 0.94;
  const z = Math.sin(phase - 0.5) * 0.028;
  return { x, y, z };
}

/** Liefert eine normierte lokale Körperbasis statt einer vollständigen Bandverdrehung. */
function wormBodyFrame({ settings, time }, u) {
  const center = wormSpine({ settings, time }, u);
  const next = wormSpine({ settings, time }, u + 0.001);
  const dx = next.x - center.x,
    dy = next.y - center.y;
  const length = Math.hypot(dx, dy);
  return { center, tx: dx / length, ty: dy / length, nx: dy / length, ny: -dx / length };
}

/** Körperquerschnitt: kräftigerer Vorderkörper, feiner auslaufender Schwanz. */
function wormBodyWidth(u) {
  return 0.002 + 0.023 * Math.pow(Math.sin(Math.PI * u), 0.65) * (1.15 - 0.65 * u) + 0.009 * Math.exp(-Math.pow((u - 0.075) / 0.06, 2));
}

/** Zeichnet die beiden oberen Tastfäden. */
function drawFeelers(side, time, addPoint, headFrame) {
  for (let j = 0; j < 45; j++) {
    const v = j / 44;
    const forward = -v * 0.075;
    const spread = side * (0.005 + v * v * 0.034) + Math.sin(time * 2.2 - v * 3 + side) * v * v * 0.009;
    addPoint(
      headFrame.center.x + headFrame.tx * forward + headFrame.nx * spread,
      headFrame.center.y + headFrame.ty * forward + headFrame.ny * spread,
      headFrame.center.z,
      j === 44,
    );
  }
}

/** Berechnet einen Punkt einer seitlichen Borste. */
function drawBristlePoint(j, samples, side, radius, reach, opening, sweep, phase, taper, u, time, frame, recovery, addPoint, stroke) {
  const v = j / (samples - 1);
  const lateral = side * (radius * 0.72 + reach * v * opening);
  const bend = sweep * v * v + Math.sin(v * 3.5 + phase) * 0.016 * v * v * taper;
  const roll = Math.sin(u * 5 - time * 0.35) * 0.3;
  const x = frame.center.x + frame.nx * lateral * Math.cos(roll) + frame.tx * bend;
  const y = frame.center.y + frame.ny * lateral * Math.cos(roll) + frame.ty * bend;
  const z = frame.center.z + lateral * Math.sin(roll) + Math.sin(v * Math.PI) * recovery * 0.016;
  addPoint(x, y, z, j >= samples - 2, stroke > 0.45);
}

/** Zeichnet ein zeitlich versetztes Borstenpaar. */
function drawBristlePair(i, ribs, settings, time, samples, addPoint) {
  const u = 0.055 + (i / (ribs - 1)) * 0.91;
  const frame = wormBodyFrame({ settings, time }, u);
  const taper = Math.pow(Math.sin(Math.PI * u), 0.72) * (1.12 - 0.3 * u);
  const radius = wormBodyWidth(u);
  for (const side of [-1, 1]) {
    const phase = u * 24 - time * 3.1 + side * 0.75;
    const stroke = Math.sin(phase);
    const recovery = Math.cos(phase);
    const reach = (0.115 + 0.017 * Math.sin(i * 1.73)) * taper;
    const opening = 0.86 + 0.14 * stroke;
    const sweep = 0.025 + 0.052 * recovery;
    for (let j = 0; j < samples; j++) {
      drawBristlePoint(j, samples, side, radius, reach, opening, sweep, phase, taper, u, time, frame, recovery, addPoint, stroke);
    }
  }
}

/** Zeichnet einen Querschnitt des Wurmkörpers. */
function drawBodySegment(i, segments, settings, time, addPoint) {
  const u = i / (segments - 1);
  const frame = wormBodyFrame({ settings, time }, u);
  const radius = wormBodyWidth(u);
  const breathing = 1 + 0.045 * Math.sin(time * 1.4 - u * 8);
  for (let j = 0; j < 14; j++) {
    const angle = (j / 14) * Math.PI * 2;
    const offset = Math.cos(angle) * radius * breathing;
    addPoint(frame.center.x + frame.nx * offset, frame.center.y + frame.ny * offset, frame.center.z + Math.sin(angle) * radius * 0.7);
  }
}
