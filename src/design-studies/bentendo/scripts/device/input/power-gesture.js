/** Wertet Touch-Tippen, Schieberbewegung und Abbruch mit denselben Power-Schwellen aus. @param {object} drag Geste. @param {boolean} wasOn Bisheriger Zustand. @param {boolean} cancelled Abgebrochen. */
export function powerGestureState(drag,wasOn,cancelled) {
  if (cancelled) return wasOn;
  if (drag.pointerType==='touch' && drag.distance<8) return !wasOn;
  const value=drag.preview ?? drag.value;
  return wasOn?value>.35:value>=.65;
}
