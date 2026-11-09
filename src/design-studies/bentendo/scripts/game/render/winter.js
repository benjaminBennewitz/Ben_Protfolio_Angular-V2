import { rect } from './primitives.js';
import { pixelText } from '../../display/font.js';
import { PALETTE } from '../../core/config.js';
import { winterNight } from '../systems/winter.js';

/** Zeichnet helle Schneewege und gefrorene Waldkanten. @param {object} render Zeicheninformationen. @param {number} x Spalte. @param {number} y Zeile. */
export function drawWinterCell(render,x,y) {
  const {ctx,game}=render,blocked=game.room.ground[y][x]==='v',xx=x*16,yy=y*16;
  if (game.room.sheltered) {
    rect(ctx,blocked?3:1,xx,yy,16,16);
    rect(ctx,blocked?2:2,xx,yy+12,16,1);
    rect(ctx,blocked?1:0,xx+2,yy+2,11,1);
    return;
  }
  rect(ctx,blocked?2:0,xx,yy,16,16);
  rect(ctx,blocked?1:1,xx+(x*3+y*5)%12,yy+11,4,1);
  if (!blocked) rect(ctx,1,xx+10,yy+5,2,1);
  if (blocked && game.room.ground[y]?.[x-1]==='.') rect(ctx,1,xx,yy,3,16);
  if (blocked && game.room.ground[y-1]?.[x]==='.') rect(ctx,0,xx,yy,16,3);
}

/** Legt Schneehauben auf dunkle Tannenäste. @param {object} render Zeicheninformationen. @param {object} tree Tanne. */
export function drawWinterTree(render,tree) {
  const {ctx}=render,x=tree.x*16,y=tree.y*16;
  rect(ctx,3,x+14,y+22,4,10);
  for (let tier=0;tier<3;tier++) {
    const width=10+tier*8,left=x+16-width/2,top=y+2+tier*7;
    rect(ctx,3,left-1,top+3,width+2,9);
    rect(ctx,2,left,top+2,width,7);
    rect(ctx,0,left+2,top,width-4,5);
    rect(ctx,1,left,top+5,width,2);
  }
}

/** Zeichnet erkennbare Schneepfähle, Feuer und Quellleuchten. @param {object} render Zeicheninformationen. @param {object} object Gegenstand. */
export function drawWinterProp(render,object) {
  const {ctx,game}=render,x=object.x*16,y=object.y*16;
  if (object.kind==='winter-fire') { drawWinterFire(render,x,y); return true; }
  if (object.kind==='winter-gate') { drawFrostGate(ctx,x,y); return true; }
  if (object.kind==='winter-trail') {
    rect(ctx,3,x+2,y+5,3,11); rect(ctx,1,x+1,y+2,11,5); rect(ctx,0,x,y+1,12,2);
    rect(ctx,3,x+4,y+4,4,1); return true;
  }
  if (object.kind!=='winter-marker') return false;
  rect(ctx,3,x+6,y+7,4,9); rect(ctx,2,x+4,y+2,8,9); rect(ctx,0,x+3,y+1,10,2);
  const lit=winterNight(game) && (!game.flags.westLensRecovered || game.flags.westLightFixed);
  rect(ctx,lit?0:1,x+6,y+5,4,4);
  if (lit) { rect(ctx,0,x+1,y+6,2,1); rect(ctx,0,x+13,y+6,2,1); }
  return true;
}

/** Zeichnet einen klaren warmen Rastpunkt innerhalb der LCD-Palette. @param {object} render Zeicheninformationen. @param {number} x X. @param {number} y Y. */
function drawWinterFire(render,x,y) {
  const {ctx,game}=render,frame=game.reduced?0:Math.floor(game.time*5)%2;
  rect(ctx,3,x+1,y+11,14,4); rect(ctx,2,x+3,y+10,10,2);
  rect(ctx,1,x+4,y+5,8,8); rect(ctx,0,x+6,y+3-frame,4,9);
  rect(ctx,3,x+2,y+14,12,1); rect(ctx,0,x+8,y+1+frame,2,4);
}

/** Zeichnet die versiegelte Pforte unter einem gezackten Eissturz. @param {object} ctx Zeichenfläche. @param {number} x X. @param {number} y Y. */
function drawFrostGate(ctx,x,y) {
  rect(ctx,3,x-9,y-17,34,33); rect(ctx,2,x-6,y-15,28,29);
  rect(ctx,3,x-2,y-11,20,27); rect(ctx,1,x,y-11,3,23); rect(ctx,1,x+13,y-11,3,23);
  for (let i=0;i<6;i++) {
    rect(ctx,0,x-9+i*6,y-18,5,7+(i%3)*3);
    rect(ctx,1,x-7+i*6,y-11,1,6);
  }
  rect(ctx,0,x-7,y+12,30,3); rect(ctx,1,x-10,y+15,36,2);
}

/** Zeigt nur wenige Schneeflocken und die verbleibende Wärme vor den Bedienflächen. @param {object} render Zeicheninformationen. */
export function drawWinterHud(render) {
  const {ctx,game}=render;
  if (!game.room.winter) return;
  const time=game.reduced?0:game.time;
  if (!game.room.sheltered) for (let i=0;i<14;i++) {
    rect(ctx,0,(i*47+Math.floor(time*9))%160,(i*31+Math.floor(time*15))%144,1,2);
  }
  const cold=game.flags.winterCold || 0;
  rect(ctx,3,2,2,100,14); rect(ctx,0,3,3,98,12);
  pixelText(ctx,game.room.sheltered?'WINDSTILL':cold>=60000?'DURCHGEFROREN':'WAERME',5,5,PALETTE[3]);
  if (!game.room.sheltered && cold<60000) {
    rect(ctx,2,49,6,47,5); rect(ctx,1,50,7,Math.round(45*(1-cold/60000)),3);
  }
}
