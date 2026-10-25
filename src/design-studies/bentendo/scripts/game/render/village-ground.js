import { rect } from './primitives.js';

/** Gibt freiem Boden eine sparsame, ortsfeste Körnung ohne zusätzliche Animation oder Zufallszustände. @param {object} render Zeicheninformationen. @param {number} x Spalte. @param {number} y Zeile. @param {string} kind Bodentyp. */
export function drawBareGround(render,x,y,kind) {
  const seed=(x*73+y*151+x*y*19)>>>0,xx=x*16,yy=y*16;
  if (seed%3===0 || kind==='e') {
    rect(render.ctx,1,xx+3+seed%9,yy+3+(seed>>>4)%9,1,1);
    if (seed%2===0) rect(render.ctx,1,xx+2+(seed>>>8)%11,yy+2+(seed>>>12)%11,1,1);
  }
  if (kind==='g' && seed%29===4) { rect(render.ctx,1,xx+5,yy+10,3,2); rect(render.ctx,2,xx+6,yy+11,2,1); }
}

/** Versteckt nur die unteren Bildpixel innerhalb tatsächlich berührter Pflanzenfelder. @param {object} render Zeicheninformationen. @param {object} actor Spielfigur oder Tier mit interpolierter Position. */
export function drawFoliageMask(render,actor) {
  const {ctx}=render,xx=Math.round((actor.drawX ?? actor.x)*16),yy=Math.round((actor.drawY ?? actor.y)*16);
  ctx.save(); ctx.beginPath(); ctx.rect(xx+2,yy+10,12,6); ctx.clip();
  for (let y=Math.floor((yy+10)/16);y<=Math.floor((yy+15)/16);y++) {
    for (let x=Math.floor((xx+2)/16);x<=Math.floor((xx+13)/16);x++) drawFoliageCell(render,x,y);
  }
  ctx.restore();
}

/** Verankert die vordere Pflanzenebene am Gelände statt an der laufenden Figur. @param {object} render Zeicheninformationen. @param {number} x Spalte. @param {number} y Zeile. */
function drawFoliageCell(render,x,y) {
  const {ctx,game,assets}=render,ground=game.room.ground,kind=ground[y]?.[x];
  if (kind!=='h' && kind!=='t') return;
  const left=ground[y]?.[x-1]!==kind?4:0,right=ground[y]?.[x+1]!==kind?4:0;
  const top=ground[y-1]?.[x]!==kind?4:0,bottom=ground[y+1]?.[x]!==kind?4:0;
  ctx.save(); ctx.beginPath(); ctx.rect(x*16+left,y*16+top,16-left-right,16-top-bottom); ctx.clip();
  const source=kind==='h'?assets.bushSprites:assets.grassSprites;
  ctx.drawImage(source,kind==='h'?0:x%2*16,kind==='h'?0:y%2*16,16,16,x*16,y*16,16,16); ctx.restore();
}
