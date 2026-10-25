import { rect } from './primitives.js';

/** Zeichnet eine native 16-Pixel-Kachel ohne Skalierung oder fremde Atlasnachbarn. @param {object} render Zeicheninformationen. @param {number} index Kachelnummer. @param {number} x Pixelspalte. @param {number} y Pixelzeile. */
export function dungeonTile(render,index,x,y) {
  render.ctx.drawImage(render.assets.dungeonTiles,index%10*16,Math.floor(index/10)*16,16,16,x,y,16,16);
}

/** Erkennt tatsächliche Bodenflächen auch an versetzten Raumecken. @param {object} room Dungeonraum. @param {number} x Spalte. @param {number} y Zeile. */
function floor(room,x,y) { return room.layout[y]?.[x]==='.'; }

/** Wählt vollständige Wandseiten, Köpfe und Eckabschlüsse anhand des echten Grundrisses. @param {object} room Raum. @param {number} x Spalte. @param {number} y Zeile. */
export function dungeonWallTile(room,x,y) {
  const north=floor(room,x,y-1),south=floor(room,x,y+1),west=floor(room,x-1,y),east=floor(room,x+1,y);
  if (south) return east || west?4:11+(x%2);
  if (north) return east?20:west?23:31+(x%2);
  if (east) return 20;
  if (west) return 23;
  if (floor(room,x,y+2)) return 1+(x%2);
  if (floor(room,x+1,y+1)) return 0;
  if (floor(room,x-1,y+1)) return 3;
  if (floor(room,x+1,y-1)) return 30;
  if (floor(room,x-1,y-1)) return 33;
  return -1;
}

/** Setzt eine geschlossene oder geöffnete Originaltruhe auf denselben Bodensockel. @param {object} render Zeicheninformationen. @param {object} object Truhe. */
export function drawDungeonChest(render,object) {
  dungeonTile(render,render.game.roomState.taken.has(object.id)?49:48,object.x*16,object.y*16);
}

/** Verankert einen gemauerten Pfeiler samt Sockel auf seinem blockierenden Fußfeld. @param {object} render Zeicheninformationen. @param {object} object Säule. */
export function drawDungeonPillar(render,object) {
  const {ctx}=render,x=object.x*16,y=object.y*16;
  rect(ctx,3,x+1,y+11,14,5); dungeonTile(render,4,x,y-16);
  dungeonTile(render,24,x,y); rect(ctx,3,x,y+14,16,2); rect(ctx,1,x,y+13,16,1);
}
