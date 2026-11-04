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
  drawLakeMotion(render);
  const frame=game.reduced?0:Math.floor(game.time*5)%4;
  for (let row=0;row<fall.h;row++) {
    const sy=row===fall.h-1?96:64+row%2*16;
    for (let col=0;col<fall.w;col++) {
      ctx.drawImage(assets.villageTiles,496+frame*16,sy,16,16,(fall.x+col)*16,(fall.y+row)*16,16,16);
    }
  }
}


/** Bewegt die Seetextur zyklisch und lässt die gezeichneten Uferkanten stehen. @param {object} render Zeicheninformationen. */
function drawLakeMotion(render) {
  const {ctx,game,assets}=render,ground=game.room.ground;
  const shift=game.reduced?0:Math.floor(game.time*5)%16;
  if (!shift) return;
  for (let y=3;y<ground.length-1;y++) for (let x=1;x<game.room.width-1;x++) {
    if (ground[y][x]!=='l' || !openLakeCell(ground,x,y)) continue;
    const xx=x*16,yy=y*16,w=16-shift;
    ctx.drawImage(assets.meadow.water,shift,0,w,16,xx,yy,w,16);
    ctx.drawImage(assets.meadow.water,0,0,shift,16,xx+w,yy,shift,16);
  }
}

/** Erkennt Wasserfelder, die keine gerundeten Uferquadranten tragen. @param {string[]} ground Gelände. @param {number} x Spalte. @param {number} y Zeile. */
function openLakeCell(ground,x,y) {
  for (let dy=-1;dy<=1;dy++) for (let dx=-1;dx<=1;dx++) {
    if (ground[y+dy]?.[x+dx]!=='l') return false;
  }
  return true;
}

/** Verbindet vier Uferquadranten einschließlich konvexer und konkaver Rundungen. @param {object} render Zeicheninformationen. @param {number} x Spalte. @param {number} y Zeile. */
export function drawLakeCell(render,x,y) {
  const ground=render.game.room.ground;
  for (const dy of [-1,1]) for (const dx of [-1,1]) {
    const edgeX=ground[y]?.[x+dx]!=='l',edgeY=ground[y+dy]?.[x]!=='l';
    const inner=!edgeX && !edgeY && ground[y+dy]?.[x+dx]!=='l';
    drawLakeQuarter(render,x,y,{dx,dy,edgeX,edgeY,inner});
  }
}

/** Wählt ein Viertel aus dem passenden Uferabschluss des Originalatlas. @param {object} render Zeicheninformationen. @param {number} x Spalte. @param {number} y Zeile. @param {object} q Nachbarschaft. */
function drawLakeQuarter(render,x,y,q) {
  const {ctx,assets}=render,{dx,dy,edgeX,edgeY,inner}=q;
  const ox=dx<0?0:8,oy=dy<0?0:8;
  const source=inner?assets.meadow.inner:edgeX || edgeY?assets.meadow.outer:assets.meadow.water;
  const sx=inner?16*(1-dx):edgeX?16*(1+dx):edgeY?16:0;
  const sy=inner?16*(1-dy):edgeY?16*(1+dy):edgeX?16:0;
  ctx.drawImage(source,sx+ox,sy+oy,8,8,x*16+ox,y*16+oy,8,8);
}

/** Baut die Nordkante aus den Felskacheln der Bruchsteiner Höhle. @param {object} render Zeicheninformationen. @param {number} x Spalte. @param {number} y Zeile. */
export function drawLakeCliff(render,x,y) {
  const {ctx,assets,game}=render,fall=game.room.lakeFall;
  const sx=y===2 && x===fall.x-1?384:y===2 && x===fall.x+fall.w?416:400;
  const sy=sx===400?64+y%2*16:32;
  ctx.drawImage(assets.villageTiles,sx,sy,16,16,x*16,y*16,16,16);
}
