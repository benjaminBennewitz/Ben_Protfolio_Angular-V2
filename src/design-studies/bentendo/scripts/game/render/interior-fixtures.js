import { rect } from './primitives.js';

/** Verkleidet echte innere Trennwände vollständig mit gedrehten nativen Holzplanken. @param {object} render Zeicheninformationen. @param {number} x Spalte. @param {number} y Zeile. */
export function drawPartition(render,x,y) {
  const {ctx}=render; ctx.save(); ctx.translate(x*16,y*16+16); ctx.rotate(-Math.PI/2);
  ctx.drawImage(render.assets.interiorTiles,0,0,16,16,0,0,16,16); ctx.restore();
  rect(ctx,3,x*16,y*16,1,16); rect(ctx,3,x*16+15,y*16,1,16);
  if (render.game.room.layout[y+1]?.[x]!== '#') rect(ctx,3,x*16,y*16+15,16,1);
}

/** Verbindet die Thekenmodule zu einer geschlossenen L-förmigen Holzfläche. @param {object} render Zeicheninformationen. @param {object} object Thekenmodul. */
export function drawCounter(render,object) {
  const {ctx,game}=render,x=object.x*16,y=object.y*16,joined={};
  for (const [side,dx,dy] of [['left',-1,0],['right',1,0],['top',0,-1],['bottom',0,1]]) {
    joined[side]=game.room.objects.some(counterAt.bind(null,object.x+dx,object.y+dy));
  }
  const left=joined.left?0:1,top=joined.top?0:1;
  rect(ctx,3,x,y,16,16); rect(ctx,1,x+left,y+top,16-left-(joined.right?0:1),16-top-(joined.bottom?0:1));
  if (!joined.top) rect(ctx,0,x+left,y+2,16-left-(joined.right?0:1),1);
  if (object.x%3===1) { rect(ctx,3,x+6,y+5,4,5); rect(ctx,0,x+7,y+6,2,2); rect(ctx,3,x+10,y+6,1,3); }
}

/** Erkennt unmittelbar benachbarte Module der Schanktheke. @param {number} x Spalte. @param {number} y Zeile. @param {object} object Möbel. */
function counterAt(x,y,object) { return object.art==='counter' && object.x===x && object.y===y; }
