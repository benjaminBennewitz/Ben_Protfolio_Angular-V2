/** @file Gemeinsame Punktgeometrie der zusätzlichen Mikrokosmos-Proben. */

/** Bereitet eine gemeinsame räumliche Pose für alle Körperteile vor. */
export function withPose(frame, tilt = 0, yaw = 0) {
  return { ...frame, ct: Math.cos(tilt), st: Math.sin(tilt), cy: Math.cos(yaw), sy: Math.sin(yaw) };
}

/** Dreht einen Punkt in die Pose der Probe und übergibt ihn dem gemeinsamen Renderer. */
export function emit(state, x, y, z, tip = false, pulse = false) {
  const rx = x * state.cy + z * state.sy;
  const rz = -x * state.sy + z * state.cy;
  state.addPoint(rx * state.ct - y * state.st, rx * state.st + y * state.ct, rz, tip, pulse);
}

/** Verteilt stabile Fibonacci-Punkte auf einer elliptischen Körperoberfläche. */
export function ellipsoid(state, center, radii, count, bright = false) {
  for (let i = 0; i < count; i++) {
    const vertical = 1 - (2 * (i + 0.5)) / count;
    const ring = Math.sqrt(Math.max(0, 1 - vertical * vertical));
    const angle = i * 2.399963;
    const accent = bright && i % 7 === 0;
    emit(state, center[0] + Math.cos(angle) * ring * radii[0], center[1] + vertical * radii[1], center[2] + Math.sin(angle) * ring * radii[2], bright, accent);
  }
}

/** Zeichnet einen dünnen elliptischen Ring in einer zur Kamera geneigten Ebene. */
export function ellipse(state, center, radii, count, active = false) {
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    emit(state, center[0] + Math.cos(angle) * radii[0], center[1] + Math.sin(angle) * radii[1], center[2] + Math.sin(angle) * radii[2], active, active);
  }
}
