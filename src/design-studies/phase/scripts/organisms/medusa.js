/** @file medusa.js — Geometrie und Bewegung der PHASE-Probe. */

/**
 * Elastischer Schirm mit wandernden Randfalten, inneren Schleiern und verzögerten Fäden.
 * Alle Bewegungen sind zeitbasiert; Pause und Einzelbild-Rendering benötigen keine Historie.
 */
export function drawMedusa(frame) {
  const state = createMedusaState(frame);
  drawBellMeridians(state);
  drawBellRings(state);
  drawMedusaCore(state);
  drawMedusaNerves(state);
  drawMedusaVeils(state);
  drawMedusaTentacles(state);
}

/** Berechnet die gemeinsamen Geometriewerte eines Frames. */
function createMedusaState(frame) {
  const state = { ...frame };
  state.strength = state.settings.amplitude;
  state.contraction = Math.min(0.8, 0.3 * state.settings.frequency * state.strength);
  state.yaw = state.time * 0.065 + Math.sin(state.time * 0.4) * 0.16;
  state.tilt = Math.sin(state.time * 0.61) * 0.12 * state.strength;
  state.drift = Math.sin(state.time * 0.52) * 0.025 * state.strength;
  state.lift = Math.sin(state.time * 1.8 - 0.5) * 0.027 * state.strength;
  state.meridians = state.compact ? 48 : 72;
  state.steps = state.compact ? 36 : 50;
  state.corePulse = medusaBeat(state.time + 0.2);
  state.coreRadius = 0.025 + state.corePulse * 0.012 * state.strength;
  state.coreY = -0.215;
  state.coreZ = -0.045;
  state.corePoints = state.compact ? 360 : 580;
  state.tentacles = state.compact ? 18 : 24;
  return state;
}

/** Verteilt die Längsrippen des Schirms. */
function drawBellMeridians(state) {
  for (let i = 0; i < state.meridians; i++) {
    drawBellMeridian(state, i);
  }
}

/** Ergänzt die feinen Querringe der Schirmoberfläche. */
function drawBellRings(state) {
  for (let ring = 1; ring <= 10; ring++) {
    const v = ring / 10;
    for (let j = 0; j < 130; j++) {
      const surface = medusaBell(state, v, (j / 130) * Math.PI * 2);
      medusaPoint(state, surface.x, surface.y, surface.z);
    }
  }
}

/** Zeichnet den pulsierenden Lichtkern im Schirm. */
function drawMedusaCore(state) {
  for (let i = 0; i < state.corePoints; i++) {
    drawCorePoint(state, i);
  }
}

/** Führt Lichtimpulse entlang der radialen Adern. */
function drawMedusaNerves(state) {
  for (let nerve = 0; nerve < 12; nerve++) {
    const angle = (nerve / 12) * Math.PI * 2;
    for (let j = 0; j < 50; j++) {
      drawNervePoint(state, j, angle);
    }
  }
}

/** Verteilt die vier gefalteten Mundarme. */
function drawMedusaVeils(state) {
  for (let arm = 0; arm < 4; arm++) {
    const baseAngle = (arm / 4) * Math.PI * 2;
    const armLength = 0.4 + 0.045 * Math.sin(arm * 2.4);
    for (let j = 0; j < (state.compact ? 75 : 100); j++) {
      drawVeilSection(state, j, baseAngle, arm, armLength);
    }
  }
}

/** Verteilt lange Randfäden mit zeitlichem Nachlauf. */
function drawMedusaTentacles(state) {
  for (let i = 0; i < state.tentacles; i++) {
    const angle = (i / state.tentacles) * Math.PI * 2;
    const length = 0.33 + 0.15 * (0.5 + 0.5 * Math.sin(i * 2.7));
    const steps = state.compact ? 75 : 100;
    for (let j = 0; j < steps; j++) {
      drawTentaclePoint(state, j, steps, angle, i, length);
    }
  }
}

/** Kurzer Kraftimpuls mit längerem Öffnen zwischen den Kontraktionen. */
function medusaBeat(t) {
  return Math.pow((1 + Math.sin(t * 1.8)) * 0.5, 4);
}

/** Deformiert die Schirmoberfläche vom Scheitel bis zum weich eingerollten Rand. */
function medusaBell({ time, contraction, strength }, v, angle, t = time) {
  const pulse = medusaBeat(t - v * 0.19);
  const opening = 1 - contraction * pulse;
  const radius = Math.sin(v * Math.PI * 0.57) * 0.25 * opening;
  const fringe = Math.pow(v, 5);
  const fold = Math.sin(angle * 11 + v * 4 - t * 1.2) * 0.012 * fringe * strength;
  const ripple = Math.sin(angle * 5 - t * 1.4) * 0.012 * fringe * strength;
  return {
    x: Math.cos(angle) * (radius + fold),
    y: -0.3 + (1 - Math.cos(v * Math.PI * 0.5)) * (0.165 + pulse * contraction * 0.17) + ripple - Math.pow(Math.max(0, v - 0.83) / 0.17, 2) * 0.018 * opening,
    z: Math.sin(angle) * (radius + fold) * 0.62,
  };
}

/** Hält Schirm, innere Schleier und Tentakel in einer gemeinsamen schwebenden Pose. */
function medusaPoint({ yaw, addPoint, tilt, drift, lift }, x, y, z, tip = false, pulse = false) {
  const rx = x * Math.cos(yaw) + z * Math.sin(yaw);
  const rz = -x * Math.sin(yaw) + z * Math.cos(yaw);
  addPoint(rx * Math.cos(tilt) - y * Math.sin(tilt) + drift, rx * Math.sin(tilt) + y * Math.cos(tilt) + lift, rz, tip, pulse);
}

/** Berechnet einen verzögert nachschwingenden Tentakelpunkt. */
function drawTentaclePoint(state, j, steps, angle, i, length) {
  const v = j / (steps - 1);
  const lagTime = state.time - v * 0.9;
  const root = medusaBell(state, 1, angle, lagTime);
  const free = v * v;
  const wave = Math.sin(lagTime * 1.8 - v * 5 + i * 0.38);
  const sway = wave * free * 0.095 * state.strength;
  const curl = Math.sin(v * 11 - state.time * 1.2 + i) * Math.pow(v, 4) * 0.035 * state.strength;
  const x = root.x * (1 - v * 0.55) + sway + Math.cos(angle + v * 6) * curl;
  const y = root.y + length * v + Math.cos(v * 8 - state.time * 1.8 + i * 0.4) * free * 0.028 * state.strength;
  const z = root.z * (1 - v * 0.35) + Math.cos(lagTime * 1.2 + i) * free * 0.03 * state.strength;
  const active = Math.sin(v * 13 - state.time * 2.4 + i * 0.65) > 0.97;
  medusaPoint(state, x, y, z, active || j === steps - 1, active);
}

/** Zeichnet einen gefalteten Abschnitt der inneren Schleier. */
function drawVeilSection(state, j, baseAngle, arm, armLength) {
  const v = j / ((state.compact ? 75 : 100) - 1);
  const delayedPulse = medusaBeat(state.time - v * 0.7);
  const angle = baseAngle + v * 4 + Math.sin(state.time * 0.9 - v * 4) * 0.55 * state.strength;
  const radial = 0.026 + v * 0.04 + Math.sin(v * 9 - state.time * 1.2) * 0.015 * state.strength;
  const sway = Math.sin(state.time * 1.3 - v * 5 + arm * 0.8) * v * v * 0.065 * state.strength;
  const y = -0.16 + v * armLength + delayedPulse * v * 0.025 * state.strength;
  const width = Math.sin(Math.PI * v) * (0.012 + 0.013 * Math.sin(v * 17 - state.time * 1.7)) * state.strength;
  for (let strand = 0; strand < 7; strand++) {
    const offset = (strand / 6 - 0.5) * width;
    const edge = strand === 0 || strand === 6;
    const active = edge && Math.sin(v * 10 - state.time * 2.4 + arm) > 0.96;
    medusaPoint(state, Math.cos(angle) * (radial + offset) + sway, y + Math.sin(angle * 1.5) * offset, Math.sin(angle) * (radial + offset), active, active);
  }
}

/** Projiziert einen wandernden Lichtimpuls auf eine Schirmader. */
function drawNervePoint(state, j, angle) {
  const v = j / 49;
  const surface = medusaBell(state, v, angle);
  const blend = Math.sin((v * Math.PI) / 2);
  const signal = Math.pow((1 + Math.sin(state.time * 1.8 - v * 5 + 0.4)) * 0.5, 12);
  medusaPoint(
    state,
    surface.x * 0.96,
    state.coreY * (1 - blend) + (surface.y + 0.008) * blend,
    state.coreZ * (1 - blend) + surface.z * 0.96 * blend,
    signal > 0.65,
    signal > 0.65,
  );
}

/** Zeichnet einen Punkt des pulsierenden Medusenkerns. */
function drawCorePoint(state, i) {
  const vertical = 1 - (2 * (i + 0.5)) / state.corePoints;
  const ring = Math.sqrt(1 - vertical * vertical);
  const angle = i * 2.399963 + state.time * 0.12;
  const shell = i % 3 === 0 ? 0.62 : 1;
  const active = state.corePulse > 0.3 && i % 4 === 0;
  medusaPoint(
    state,
    Math.cos(angle) * ring * state.coreRadius * shell,
    state.coreY + vertical * state.coreRadius * 0.75 * shell,
    state.coreZ + Math.sin(angle) * ring * state.coreRadius * shell,
    true,
    active,
  );
}

/** Zeichnet einen Meridian des beweglichen Schirms. */
function drawBellMeridian(state, i) {
  const angle = (i / state.meridians) * Math.PI * 2;
  for (let j = 0; j < state.steps; j++) {
    const v = j / (state.steps - 1);
    const surface = medusaBell(state, v, angle);
    const impulse = Math.sin(v * 9 - state.time * 2.6 + angle * 2);
    const active = i % 6 === 0 && impulse > 0.96 && v > 0.3;
    medusaPoint(state, surface.x, surface.y, surface.z, active || j === state.steps - 1, active);
  }
}
