export const NORTH_CAVE={x:15,y:1,w:1,h:1};

/** Legt Fels, Höhlenschwelle und Wasser auf dieselbe nördliche Geländestufe. @param {number} x Spalte. @param {number} y Zeile. */
export function northGround(x,y) {
  if (y<2) {
    if (x===NORTH_CAVE.x && y===NORTH_CAVE.y) return 'c';
    if ((x===17 || x===18) && y===1) return 'w';
    return 'r';
  }
  if ((x===16 || x===19) && y<=4) return 'r';
  return null;
}
