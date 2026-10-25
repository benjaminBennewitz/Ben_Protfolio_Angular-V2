import { rect } from './primitives.js';

/** Zeichnet Fluss, Wasserfallkörper und Gischt ausschließlich mit Awakening-Tiles. @param {object} render Zeicheninformationen. */
export function drawWaterfall(render) {
  const {ctx,game,assets}=render,frame=game.reduced?0:Math.floor(game.time*5)%4;
  for (let y=0;y<game.room.height-1;y++) for (const x of [17,18]) {
    if (game.room.ground[y][x]!=='w') continue;
    const sx=(y<=4?496:560)+frame*16,sy=y===4?96:y<=3?64+((y-1)%2)*16:64;
    ctx.drawImage(assets.villageTiles,sx,sy,16,16,x*16,y*16,16,16);
    if (y>=5) ctx.drawImage(assets.villageTiles,x===17?392:416,32,8,16,x*16+(x===17?-8:16),y*16,8,16);
  }
}

/** Zeichnet eine massive Holzsperre quer zum jeweiligen Dorfweg. @param {object} render Zeicheninformationen. @param {object} object Sperrobjekt. @param {number} x X. @param {number} y Y. */
export function drawGate(render,object,x,y) {
  const {ctx}=render,w=(object.w || 1)*16,h=(object.h || 1)*16;
  if (w>h || object.id==='north-gate') {
    for (let xx=2;xx<w;xx+=6) { rect(ctx,3,x+xx,y,4,h); rect(ctx,1,x+xx+1,y+2,1,h-3); }
    rect(ctx,3,x,y+4,w,3); rect(ctx,1,x,y+4,w,1); rect(ctx,3,x,y+11,w,3);
  } else {
    for (let yy=2;yy<h;yy+=6) { rect(ctx,3,x,y+yy,w,4); rect(ctx,1,x+2,y+yy+1,w-3,1); }
    rect(ctx,3,x+3,y,3,h); rect(ctx,3,x+11,y,3,h);
  }
  rect(ctx,3,x+Math.floor(w/2)-4,y+Math.floor(h/2)-4,9,9);
  rect(ctx,0,x+Math.floor(w/2),y+Math.floor(h/2)-2,1,4);
}
