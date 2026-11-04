import { rect } from './primitives.js';

/** Zeichnet einen offenen Abgrund mit erdiger Kante und Schatten. @param {object} render Zeicheninformationen. @param {number} x Rasterspalte. @param {number} y Rasterzeile. */
export function drawRootPit(render,x,y) {
  const {ctx}=render,xx=x*16,yy=y*16,ground=render.game.room.ground;
  const left=ground[y][x-1]==='q'?0:2,right=ground[y][x+1]==='q'?0:2;
  rect(ctx,1,xx,yy+1,16,14); rect(ctx,3,xx+left,yy+3,16-left-right,11);
  rect(ctx,2,xx+left,yy+3,16-left-right,2);
  for (const dx of [4,10]) rect(ctx,2,xx+dx,yy+11,2,2);
}

/** Markiert einen schmalen Pfad zwischen dunklen Wurzeln. @param {object} render Zeicheninformationen. @param {object} object Durchlass. */
export function drawRootPassage(render,object) {
  const {ctx}=render,x=object.x*16,y=object.y*16;
  rect(ctx,3,x+2,y+3,12,13); rect(ctx,3,x+4,y+1,8,2);
  rect(ctx,2,x+2,y+4,2,10); rect(ctx,2,x+12,y+4,2,10);
  rect(ctx,1,x+5,y+12,6,4); rect(ctx,0,x+7,y+14,2,2);
}

/** Zeigt die Öffnung als Aussparung unter Wurzeln zwischen den Baumkronen. @param {object} render Zeicheninformationen. @param {object} object Tunnel. */
export function drawRootTunnel(render,object) {
  const {ctx}=render,x=object.x*16,y=object.y*16;
  rect(ctx,2,x,y+1,16,14); rect(ctx,3,x+2,y+4,13,9);
  rect(ctx,3,x+4,y+2,8,12); rect(ctx,3,x+12,y+6,4,5);
  rect(ctx,1,x+1,y+2,5,2); rect(ctx,1,x+6,y,5,2);
  rect(ctx,1,x+1,y+12,5,3); rect(ctx,1,x+6,y+14,6,1);
  rect(ctx,2,x+3,y+8,2,3); rect(ctx,2,x+8,y+11,5,1);
}

const KOBOLD=[
  '.....333333.....',
  '..33.322223.33..',
  '.33233211233233.',
  '3322112112112233',
  '.33213011031233.',
  '..333311113333..',
  '....32111123.33.',
  '...3320002333223',
  '..33233333323323',
  '.33232212232333.',
  '.32321211232333.',
  '.3333222223333..',
  '...333003333....',
  '...332333233....',
  '...3333.3333....',
];

/** Zeichnet einen gepanzerten Kobold mit Spitzohren, Zähnen und Keule. @param {CanvasRenderingContext2D} ctx Zeichenfläche. @param {number} frame Schrittphase. */
export function drawKobold(ctx,frame) {
  for (let y=0;y<KOBOLD.length;y++) for (let x=0;x<KOBOLD[y].length;x++) {
    const pixel=KOBOLD[y][x],lift=frame && y>=13 && x>=8?1:0;
    if (pixel!=='.') rect(ctx,Number(pixel),x,y-lift,1,1);
  }
}
