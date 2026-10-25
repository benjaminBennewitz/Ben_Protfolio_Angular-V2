import { rect } from './primitives.js';

/** Zeichnet vollständige Originalmöbel und klar blockierende Mauerreste in ihren echten Grundflächen. @param {object} render Zeicheninformationen. @param {object} object Einrichtung. */
export function drawDungeonFurniture(render,object) {
  const {ctx,assets}=render,x=object.x*16,y=object.y*16,kind=object.kind;
  if (kind==='dungeon-urn') ctx.drawImage(assets.tiles,64,0,16,16,x,y,16,16);
  else if (kind==='dungeon-barrel') ctx.drawImage(assets.barrelTiles,0,0,16,16,x,y,16,16);
  else if (kind==='dungeon-crate') ctx.drawImage(assets.tiles,464,336,32,32,x,y,16,16);
  else if (kind==='dungeon-workbench') {
    ctx.drawImage(assets.cottageTiles,8,64,32,16,x,y,32,16); ctx.drawImage(assets.toolTiles,x+8,y-3,16,16);
  } else if (kind==='dungeon-rubble') drawMasonry(ctx,x,y);
  else if (kind==='dungeon-cocoon') drawCocoon(ctx,x,y);
  else if (kind==='dungeon-gear') drawGear(ctx,x,y);
  else return false;
  return true;
}

/** Gibt einem niedrigen eingestürzten Wandstück die sichtbare Breite seiner Kollision. @param {CanvasRenderingContext2D} ctx Kontext. @param {number} x X. @param {number} y Y. */
function drawMasonry(ctx,x,y) {
  for (const [dx,dy,w,h] of [[0,8,14,8],[14,9,17,7],[6,1,15,8],[20,5,10,5]]) {
    rect(ctx,3,x+dx,y+dy,w,h); rect(ctx,2,x+dx+1,y+dy+1,w-2,h-2); rect(ctx,0,x+dx+1,y+dy+1,w-2,1);
  }
}

/** Bindet einen großen Kokon mit hellen Querfäden an seine feste Wandposition. @param {CanvasRenderingContext2D} ctx Kontext. @param {number} x X. @param {number} y Y. */
function drawCocoon(ctx,x,y) {
  rect(ctx,3,x+3,y+2,10,13); rect(ctx,1,x+4,y+1,8,14); rect(ctx,0,x+5,y+2,6,12);
  for (let row=3;row<14;row+=3) { rect(ctx,2,x+4,y+row,8,1); rect(ctx,1,x+6,y+row-1,5,1); }
  rect(ctx,0,x+7,y-3,1,4);
}

/** Zeigt ein fest verankertes Kettenrad mit frei liegender Achse und Eisenrahmen. @param {CanvasRenderingContext2D} ctx Kontext. @param {number} x X. @param {number} y Y. */
function drawGear(ctx,x,y) {
  rect(ctx,3,x+1,y+1,14,14); rect(ctx,2,x+3,y+3,10,10); rect(ctx,0,x+7,y+3,2,10); rect(ctx,0,x+3,y+7,10,2);
  rect(ctx,3,x+6,y+6,4,4); rect(ctx,1,x+7,y+7,2,2);
}
