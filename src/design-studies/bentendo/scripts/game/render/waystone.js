import { rect } from './primitives.js';

const LANTERN=[
  '....33....',
  '...3113...',
  '....33....',
  '..333333..',
  '.33211233.',
  '3321111233',
  '.33333333.',
  '..302203..',
  '..301103..',
  '..300003..',
  '..302203..',
  '..333333..',
  '.33222233.',
  '..333333..',
];

/** Zeichnet eine steinerne Reisemarke mit eigenem Laternen-Sprite und abgestelltem Rad. @param {object} render Zeicheninformationen. @param {object} stone Wegmacherstein. */
export function drawWaystone(render,stone) {
  const {ctx,game}=render,x=stone.x*16,y=stone.y*16;
  rect(ctx,1,x+1,y+14,14,2);
  rect(ctx,3,x+3,y+6,6,9); rect(ctx,3,x+2,y+8,8,6);
  rect(ctx,2,x+3,y+8,6,5); rect(ctx,1,x+4,y+7,4,2);
  rect(ctx,3,x+5,y+9,2,3); rect(ctx,1,x+5,y+10,1,1);
  rect(ctx,3,x+12,y-6,2,20); rect(ctx,2,x+12,y-4,1,13);
  rect(ctx,3,x+6,y-6,7,1);
  drawLantern(ctx,x+2,y-5,Boolean(game.flags.eastRootOpen));
  rect(ctx,3,x+10,y+11,5,4); rect(ctx,3,x+11,y+10,3,1);
  rect(ctx,1,x+11,y+12,3,2); rect(ctx,2,x+12,y+11,1,4);
}

/** Stempelt den transparenten Laternen-Sprite mit heller oder dunkler Verglasung. @param {CanvasRenderingContext2D} ctx Spielfläche. @param {number} x Pixelspalte. @param {number} y Pixelzeile. @param {boolean} lit Aktive Reiseverbindung. */
function drawLantern(ctx,x,y,lit) {
  for (let row=0;row<LANTERN.length;row++) for (let col=0;col<LANTERN[row].length;col++) {
    const pixel=LANTERN[row][col];
    if (pixel!=='.') rect(ctx,!lit && row>=7 && row<=10 && pixel!=='3'?2:Number(pixel),x+col,y+row,1,1);
  }
}

/** Markiert den aktiven Reisepunkt mit einem kleinen Radsymbol. @param {CanvasRenderingContext2D} ctx Kartenfläche. @param {object} plan Kartenmaßstab. @param {object} stone Wegmacherstein. */
export function drawWaystoneMarker(ctx,plan,stone) {
  const x=plan.x+stone.x*plan.scale,y=plan.y+stone.y*plan.scale;
  rect(ctx,0,x-3,y-3,7,7);
  rect(ctx,3,x-1,y-2,3,5); rect(ctx,3,x-2,y-1,5,3);
  rect(ctx,0,x-1,y-1,3,3); rect(ctx,3,x,y,1,1);
}

/** Zeichnet eine begehbare, unregelmäßige Gras- und Kiesinsel über zwei mal zwei Kacheln. @param {object} render Zeicheninformationen. @param {object} stone Wegmacherstein. */
export function drawWaystoneGround(render,stone) {
  const {ctx}=render,x=(stone.x-1)*16,y=stone.y*16;
  for (const [dx,dy,w,h] of [[5,4,22,21],[2,8,29,14],[7,2,18,25],[11,25,12,3]]) rect(ctx,1,x+dx,y+dy,w,h);
  for (const [dx,dy,w,h] of [[9,6,18,16],[13,18,15,7],[7,9,21,11]]) rect(ctx,0,x+dx,y+dy,w,h);
  for (const [dx,dy] of [[8,9],[12,14],[22,19],[25,23],[14,21],[20,23]]) rect(ctx,1,x+dx,y+dy,1,1);
  for (const [dx,dy] of [[4,9],[8,20],[27,7],[27,21],[10,24],[3,17]]) {
    rect(ctx,2,x+dx,y+dy,1,4); rect(ctx,2,x+dx+1,y+dy+2,2,1);
  }
  for (const [dx,dy,w] of [[4,6,5],[5,16,4],[12,5,3],[25,17,5],[16,23,4]]) {
    rect(ctx,2,x+dx,y+dy+1,w,2); rect(ctx,0,x+dx+1,y+dy,w-2,2);
  }
}
