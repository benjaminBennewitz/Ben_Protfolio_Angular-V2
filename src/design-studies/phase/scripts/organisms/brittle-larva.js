/** @file Künstlerische Schlangenstern-Larve mit sechs langen Wimpernarmen. */
import { withPose, emit, ellipsoid } from './geometry.js';

/** Verteilt drei spiegelbildliche Armpaare um den kleinen Larvenkörper. */
export function drawBrittleLarva(frame) {
  const state = withPose(frame, Math.sin(frame.time * 0.4) * 0.12, Math.sin(frame.time * 0.28) * 0.22);
  ellipsoid(state, [0, 0.025, 0], [0.065, 0.091, 0.037], state.compact ? 800 : 1300);
  ellipsoid(state, [0, 0.01, -0.035], [0.023, 0.027, 0.012], 230, true);
  const angles = [-0.45, 0.45, -1.15, 1.15, -2.35, 2.35];
  for (let arm = 0; arm < angles.length; arm++) drawLarvalArm(state, angles[arm], arm);
}

/** Liefert eine zusammenhängende, sanft schwingende Armachse. */
function armPosition(state, angle, index, v) {
  const length = index < 2 ? 0.39 : index < 4 ? 0.31 : 0.28;
  const wave = Math.sin(state.time * 1.7 * state.settings.frequency - v * 5 + index) * v * v * 0.035 * state.settings.amplitude;
  return {
    x: Math.sin(angle) * v * length + Math.cos(angle) * wave,
    y: -Math.cos(angle) * v * length + 0.025 + Math.sin(angle) * wave,
    z: Math.sin(v * 3 + index) * v * 0.018,
  };
}

/** Zeichnet den doppelt geführten Arm und seine regelmäßigen Wimpernbänder. */
function drawLarvalArm(state, angle, index) {
  const count = state.compact ? 70 : 100;
  for (let i = 0; i < count; i++) {
    const v = i / (count - 1);
    const point = armPosition(state, angle, index, v);
    const pulse = Math.sin(v * 12 - state.time * 2.8 + index) > 0.96;
    for (const side of [-1, 1])
      emit(state, point.x + Math.cos(angle) * side * 0.004, point.y + Math.sin(angle) * side * 0.004, point.z, pulse || i === count - 1, pulse);
    if (i % 2 === 0) drawArmCilia(state, point, angle, index, v);
  }
}

/** Fächert zwei kurze, zeitlich versetzte Wimpern aus der Armachse auf. */
function drawArmCilia(state, point, angle, index, v) {
  const phase = state.time * 4 - v * 24 + index;
  for (const side of [-1, 1]) {
    for (let i = 0; i < 10; i++) {
      const free = i / 9;
      const length = free * 0.017 * Math.sin(v * Math.PI);
      const bend = Math.sin(phase + free) * free * free * 0.009 * state.settings.amplitude;
      emit(
        state,
        point.x + Math.cos(angle) * side * length + Math.sin(angle) * bend,
        point.y + Math.sin(angle) * side * length - Math.cos(angle) * bend,
        point.z,
      );
    }
  }
}
