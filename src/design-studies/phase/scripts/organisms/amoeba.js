/** @file amoeba.js — Geometrie und Bewegung der PHASE-Probe. */

/** Weiche Membran mit wandernden Scheinfüßchen und strömenden inneren Partikeln. */
export function drawAmoeba(frame) {
  const state = createAmoebaState(frame);
  drawAmoebaCytoplasm(state);
  drawAmoebaMembrane(state);
  drawAmoebaNucleus(state);
  drawAmoebaGranules(state);
}

/** Berechnet die gemeinsamen Geometriewerte eines Frames. */
function createAmoebaState(frame) {
  const state = { ...frame };
  state.strength = state.settings.amplitude;
  state.morph = state.time * 0.48 * state.settings.frequency;
  state.tilt = Math.sin(state.time * 0.25) * 0.15;
  state.particles = state.compact ? 3600 : 6200;
  state.coreX = Math.sin(state.morph * 0.7) * 0.025;
  state.coreY = Math.cos(state.morph * 0.5) * 0.025;
  state.coreBreath = 1 + Math.sin(state.time * 1.6) * 0.08 * state.strength;
  return state;
}

/** Zeichnet die langsam strömenden inneren Partikel. */
function drawAmoebaCytoplasm(state) {
  for (let i = 0; i < state.particles; i++) {
    drawCytoplasmPoint(i, state.time, state.strength, state.morph, state.addPoint, state.tilt);
  }
}

/** Zeichnet drei feine Konturlagen der Membran. */
function drawAmoebaMembrane(state) {
  for (let layer = 0; layer < 3; layer++) {
    for (let i = 0; i < 240; i++) {
      const angle = (i / 240) * Math.PI * 2;
      const radius = amoebaBoundary({ morph: state.morph, strength: state.strength }, angle) - layer * 0.0025;
      const active = Math.sin(angle * 5 - state.morph * 2) > 0.94;
      amoebaPoint({ addPoint: state.addPoint, tilt: state.tilt }, Math.cos(angle) * radius, Math.sin(angle) * radius * 1.06, -0.004, active, active);
    }
  }
}

/** Zeichnet den weich pulsierenden Zellkern. */
function drawAmoebaNucleus(state) {
  for (let i = 0; i < 530; i++) {
    drawAmoebaCorePoint(i, state.morph, state.addPoint, state.tilt, state.coreX, state.coreBreath, state.coreY, state.time);
  }
}

/** Verteilt bewegte Körnchen innerhalb der Zellhülle. */
function drawAmoebaGranules(state) {
  for (let i = 0; i < 230; i++) {
    const angle = i * 2.399963 + state.morph * 0.15;
    const v = 0.3 + 0.5 * Math.sqrt((i + 0.5) / 230);
    const radius = amoebaBoundary({ morph: state.morph, strength: state.strength }, angle) * v;
    const drift = Math.sin(state.morph * 1.5 + i * 0.9) * 0.012 * state.strength;
    amoebaPoint({ addPoint: state.addPoint, tilt: state.tilt }, Math.cos(angle) * radius + drift, Math.sin(angle) * radius, -0.045, i % 17 === 0, i % 17 === 0);
  }
}

/** Berechnet eine zusammenhängende radiale Hülle ohne zufällige Framesprünge. */
function amoebaBoundary({ morph, strength }, angle) {
  let radius = 0.19 + Math.sin(angle * 3 + morph) * 0.018 * strength;
  for (let lobe = 0; lobe < 5; lobe++) {
    const direction = (lobe * Math.PI * 2) / 5 + Math.sin(morph * 0.4 + lobe) * 0.3;
    const extension = (0.035 + 0.075 * (0.5 + 0.5 * Math.sin(morph - lobe * 1.6))) * strength;
    radius += Math.exp((Math.cos(angle - direction) - 1) * 13) * extension;
  }
  return radius;
}

/** Eine geringe Neigung lässt die flache Hülle als durchscheinendes Volumen erscheinen. */
function amoebaPoint({ addPoint, tilt }, x, y, z, tip = false, pulse = false) {
  addPoint(x * Math.cos(tilt) - y * Math.sin(tilt), x * Math.sin(tilt) + y * Math.cos(tilt), z, tip, pulse);
}

/** Zeichnet einen unregelmäßig gesetzten Punkt des Zellkerns. */
function drawAmoebaCorePoint(i, morph, addPoint, tilt, coreX, coreBreath, coreY, time) {
  const verticalSeed = Math.sin(i * 127.1 + 47.3) * 43758.5453;
  const angleSeed = Math.sin(i * 269.5 + 92.1) * 43758.5453;
  const accentSeed = Math.sin(i * 419.2 + 21.7) * 43758.5453;
  const vertical = 1 - 2 * (verticalSeed - Math.floor(verticalSeed));
  const ring = Math.sqrt(Math.max(0, 1 - vertical * vertical));
  const angle = (angleSeed - Math.floor(angleSeed)) * Math.PI * 2 + morph * 0.2;
  const accent = accentSeed - Math.floor(accentSeed) > 0.92;
  amoebaPoint(
    { addPoint, tilt },
    coreX + Math.cos(angle) * ring * 0.042 * coreBreath,
    coreY + vertical * 0.048 * coreBreath,
    -0.065 + Math.sin(angle) * ring * 0.025 * coreBreath,
    accent,
    Math.sin(time * 1.7) > 0.5,
  );
}

/** Bewegt einen flackerfreien Partikel im Zellinneren. */
function drawCytoplasmPoint(i, time, strength, morph, addPoint, tilt) {
  const angleSeed = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  const radiusSeed = Math.sin(i * 269.5 + 183.3) * 43758.5453;
  const baseAngle = (angleSeed - Math.floor(angleSeed)) * Math.PI * 2;
  const baseRadius = Math.sqrt(radiusSeed - Math.floor(radiusSeed));
  const flow = Math.sin(time * 0.8 + baseAngle * 2 + baseRadius * 5) * 0.1 * strength;
  const angle = baseAngle + morph * 0.1 + flow;
  const v = Math.max(0.01, baseRadius * 0.98 + Math.sin(time * 0.65 + baseAngle * 3) * 0.015 * (1 - baseRadius) * strength);
  const radius = amoebaBoundary({ morph, strength }, angle) * v;
  const depth = Math.sqrt(Math.max(0, 1 - v * v)) * 0.052;
  amoebaPoint(
    { addPoint, tilt },
    Math.cos(angle) * radius,
    Math.sin(angle) * radius * 1.06,
    (i % 2 === 0 ? -1 : 1) * depth + Math.sin(time * 0.7 + baseAngle) * 0.004 * strength,
  );
}
