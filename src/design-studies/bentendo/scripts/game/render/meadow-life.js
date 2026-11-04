import { rect } from './primitives.js';
import { animalsRest } from '../systems/daily-life.js';

/** Zeichnet sitzende Vögel in Bodennähe und einen kurzen Abflug über dem Ufer. @param {object} render Zeicheninformationen. */
export function drawMeadowBirds(render) {
  const {game,ctx}=render;
  if (!game.room.meadowBirds || animalsRest(game)) return;
  for (const [i,bird] of game.room.meadowBirds.entries()) {
    const flight=game.roomState.meadowFlights?.[i];
    if (flight!==undefined && (flight>=1.2 || game.reduced)) continue;
    const x=bird.x*16+7+(flight ?? 0)*bird.side*31,y=bird.y*16+11-(flight ?? 0)*28;
    rect(ctx,3,x-2,y,5,2); rect(ctx,2,x+2*bird.side,y-1,2,1);
    if (flight!==undefined) rect(ctx,3,x,y+(Math.floor(flight*10)%2?-2:2),2,1);
    else rect(ctx,1,x-1,y+2,3,1);
  }
}

/** Zeichnet wenige einzelne Mückenpixel über dem feuchten Ufer. @param {object} render Zeicheninformationen. */
export function drawMeadowMidges(render) {
  const {game,ctx}=render;
  if (!game.room.lakeFall || game.reduced) return;
  for (const [x,y] of [[11,7],[16,11],[10,16],[24,8],[27,8]]) for (let i=0;i<4;i++) {
    const phase=game.time*(1+i*0.22)+x+i*1.7;
    rect(ctx,i%2?2:1,x*16+7+Math.sin(phase)*6,y*16+3+Math.cos(phase*1.4)*4,1,1);
  }
}

/** Zeichnet einen Fels mit Schatten, gebrochenen Kanten und heller Oberseite. @param {object} render Zeicheninformationen. @param {object} object Fels. */
export function drawMeadowRock(render,object) {
  const {ctx}=render,x=object.x*16,y=object.y*16,small=object.small;
  const left=x+(small?5:1),top=y+(small?9:4),w=small?7:14;
  rect(ctx,2,left+1,y+14,w-1,2); rect(ctx,3,left,top+2,w,y+14-top-2);
  rect(ctx,3,left+2,top,w-4,2); rect(ctx,2,left+1,top+2,w-2,y+12-top-2);
  rect(ctx,1,left+2,top+1,w-4,3); rect(ctx,0,left+3,top+1,w-6,1);
}

/** Zeichnet grasende Rehe und den Hirsch mit eigener Silhouette in nativer Auflösung. @param {object} render Zeicheninformationen. @param {object} object Tier. @param {number} x Pixelspalte. @param {number} y Pixelzeile. */
export function drawMeadowDeer(render,object,x,y) {
  const {ctx,game}=render,headUp=object.walking || !game.reduced && (game.time+object.x)%7<1.6;
  const stride=object.walking && !game.reduced?Math.floor(game.time*9)%2:0,head=headUp?3:11;
  ctx.save(); ctx.translate(Math.round(x)+8,Math.round(y));
  if (object.facing==='right') ctx.scale(-1,1);
  rect(ctx,3,-5,6,13,7); rect(ctx,2,-4,7,11,4); rect(ctx,1,-3,7,8,2);
  rect(ctx,3,7,7,3,3); rect(ctx,1,7,7,2,1);
  for (const leg of [-4,-1,4,7]) rect(ctx,3,leg+(leg%2?stride:0),12,1,5-(leg%2?0:stride));
  rect(ctx,3,-7,headUp?4:8,4,7); rect(ctx,2,-6,headUp?5:9,2,5);
  rect(ctx,3,-10,head,5,4); rect(ctx,1,-9,head+1,3,1);
  rect(ctx,3,-7,head-2,1,3);
  if (object.stag && headUp) { rect(ctx,3,-7,-1,1,5); rect(ctx,3,-10,0,1,2); rect(ctx,3,-10,2,5,1); rect(ctx,3,-6,0,1,2); }
  ctx.restore();
}
