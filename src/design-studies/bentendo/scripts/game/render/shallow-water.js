import { drawMeadowLake } from './meadow-lake.js';
import { rect } from './primitives.js';

/** Zeichnet flache Becken mit zusammenhängenden Ufern und abgerundeten Ecken. @param {object} render Zeicheninformationen. @param {number} x Spalte. @param {number} y Zeile. @param {string} kind Wassertiefe. */
export function drawShallows(render,x,y,kind) {
  const {ctx,game}=render,ground=game.room.ground;
  const top=ground[y-1]?.[x]!==kind,bottom=ground[y+1]?.[x]!==kind;
  const left=ground[y][x-1]!==kind,right=ground[y][x+1]!==kind;
  for (let row=0;row<16;row++) {
    const inset=top?Math.max(0,4-row):0,lower=bottom?Math.max(0,row-11):0;
    const corner=Math.max(inset,lower),a=left?2+corner:0,b=right?2+corner:0;
    if (row<(top?2:0) || row>=(bottom?14:16)) continue;
    const xx=x*16+a,yy=y*16+row,width=16-a-b;
    rect(ctx,1,xx,yy,width,1);
    if (row>(top?3:-1) && row<(bottom?12:16)) rect(ctx,2,xx+(left?1:0),yy,width-Number(left)-Number(right),1);
  }
  if (left && top && (x+y)%2===0) drawReeds(ctx,x*16,y*16);
}

/** Setzt ein kleines Schilfbüschel auf den Ufersaum. @param {CanvasRenderingContext2D} ctx Kontext. @param {number} x X. @param {number} y Y. */
function drawReeds(ctx,x,y) {
  rect(ctx,2,x+3,y+2,1,5); rect(ctx,3,x+5,y,1,7); rect(ctx,2,x+7,y+3,1,4);
}

/** Bewegt sparsame Lichtreflexe und markiert Wasser um die Füße der Spielfigur. @param {object} render Zeicheninformationen. @param {object} player Interpolierte Figur. */
export function drawShallowRipples(render,player) {
  const {ctx,game}=render;
  if (!game.room.shallows) return;
  const frame=game.reduced?0:Math.floor(game.time*3)%4;
  for (let y=1;y<game.room.height-1;y++) for (let x=1;x<game.room.width-1;x++) {
    if (game.room.ground[y][x]!=='s' || (x+2*y)%4!==0) continue;
    rect(ctx,1,x*16+5+frame,y*16+7,5,1); rect(ctx,0,x*16+7+frame,y*16+8,2,1);
  }
  if (game.room.ground[Math.round(player.y)]?.[Math.round(player.x)]!=='s') return;
  const x=Math.round(player.x*16),y=Math.round(player.y*16)+14,spread=game.move?frame:0;
  rect(ctx,0,x+1-spread,y,4,1); rect(ctx,0,x+11+spread,y,4,1);
  rect(ctx,1,x+5,y+2,6,1);
}


/** Verbindet den Awakening-Wasserfall mit der dunkleren Seefläche. @param {object} render Zeicheninformationen. */
export function drawLakeFall(render) {
  const {ctx,game,assets}=render,fall=game.room.lakeFall;
  if (!fall) return;
  drawMeadowLake(render);
  const frame=game.reduced?0:Math.floor(game.time*5)%4;
  for (let row=0;row<fall.h;row++) {
    const sy=row===fall.h-1?96:64+row%2*16;
    for (let col=0;col<fall.w;col++) {
      ctx.drawImage(assets.villageTiles,496+frame*16,sy,16,16,(fall.x+col)*16,(fall.y+row)*16,16,16);
    }
  }
}


/** Baut die Nordkante aus den Felskacheln der Bruchsteiner Höhle. @param {object} render Zeicheninformationen. @param {number} x Spalte. @param {number} y Zeile. */
export function drawLakeCliff(render,x,y) {
  const {ctx,assets,game}=render,fall=game.room.lakeFall;
  const sx=y===2 && x===fall.x-1?384:y===2 && x===fall.x+fall.w?416:400;
  const sy=sx===400?64+y%2*16:32;
  ctx.drawImage(assets.villageTiles,sx,sy,16,16,x*16,y*16,16,16);
}
