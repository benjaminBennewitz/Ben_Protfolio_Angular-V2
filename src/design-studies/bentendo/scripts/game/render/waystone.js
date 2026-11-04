import { rect } from './primitives.js';

/** Zeichnet Wegmacherstein, Laterne und halbes Wagenrad als gemeinsame Silhouette. @param {object} render Zeicheninformationen. @param {object} stone Wegmacherstein. */
export function drawWaystone(render,stone) {
  const {ctx,game}=render,x=stone.x*16,y=stone.y*16,lit=game.flags.eastRootOpen;
  rect(ctx,1,x+1,y+14,15,2);
  rect(ctx,3,x+1,y+5,9,10); rect(ctx,2,x+2,y+6,7,8); rect(ctx,1,x+2,y+5,7,2);
  rect(ctx,3,x+4,y+8,3,4); rect(ctx,1,x+5,y+9,1,2);
  rect(ctx,3,x+11,y-3,2,17); rect(ctx,3,x+7,y-3,5,1);
  if (lit) { rect(ctx,1,x+4,y-1,7,5); rect(ctx,1,x+5,y-2,5,7); }
  rect(ctx,3,x+6,y-1,4,5); rect(ctx,lit?0:2,x+7,y,2,3);
  rect(ctx,3,x+11,y+9,4,1); rect(ctx,3,x+10,y+10,6,5);
  rect(ctx,1,x+11,y+11,4,3); rect(ctx,2,x+12,y+10,1,5);
  rect(ctx,3,x+9,y+14,7,1);
}

/** Markiert den aktiven Reisepunkt mit einem kleinen Radsymbol. @param {CanvasRenderingContext2D} ctx Kartenfläche. @param {object} plan Kartenmaßstab. @param {object} stone Wegmacherstein. */
export function drawWaystoneMarker(ctx,plan,stone) {
  const x=plan.x+stone.x*plan.scale,y=plan.y+stone.y*plan.scale;
  rect(ctx,0,x-3,y-3,7,7);
  rect(ctx,3,x-1,y-2,3,5); rect(ctx,3,x-2,y-1,5,3);
  rect(ctx,0,x-1,y-1,3,3); rect(ctx,3,x,y,1,1);
}
