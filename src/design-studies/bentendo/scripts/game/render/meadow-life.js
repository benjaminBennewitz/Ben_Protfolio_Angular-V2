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

const ROCKS=[
  ['.....333.......','...3311133.....','..3110011233...','.311111122223..','31112212222223.','31122222222333.','32222222223333.','.333333333333..','...222222222...'],
  ['......33.......','.....3113......','....310123.....','...31101233....','..311122223....','..3122222233...','.312212222233..','.322222223333..','..3333333333...','....222222222..'],
  ['...............','......3333.....','..3333111233...','.3111100112233.','311122222222223','322222222223333','.3333333333333.','...2222222222..'],
  ['...333.........','..310133.......','.31011223..33..','.3111222333123.','311222223311223','322222233222233','.3333333333333.','...2222222222..'],
];
const PEBBLES=[
  ['..333...','.31023..','3112233.','.33333..'],
  ['...33...','..3113..','.310223.','.332333.','..3333..'],
  ['........','.33333..','3101123.','.333333.'],
  ['.33.....','3103.33.','32233123','.333333.'],
];

/** Zeichnet Felsvarianten mit Licht von links oben und einem Bodenschatten. @param {object} render Zeicheninformationen. @param {object} object Fels. */
export function drawMeadowRock(render,object) {
  const {ctx}=render,small=object.small,art=(small?PEBBLES:ROCKS)[object.shape];
  const x=object.x*16+(small?4:0),y=object.y*16+15-art.length;
  rect(ctx,1,x+(small?2:3),y+art.length,small?5:12,1);
  for (const [row,line] of art.entries()) for (let col=0;col<line.length;col++) {
    if (line[col]!=='.') rect(ctx,Number(line[col]),x+col,y+row,1,1);
  }
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
