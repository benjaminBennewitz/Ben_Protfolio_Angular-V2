import { dungeonTile } from './dungeon-atlas.js';
import { rect } from './primitives.js';

/** Trennt seitliche Durchgänge, helle Aufgänge und dunkle abwärts führende Treppenschächte. @param {object} render Zeicheninformationen. @param {object} object Durchgang. */
export function drawDungeonPassage(render,object) {
  const {ctx}=render,x=object.x*16,y=object.y*16;
  if (object.kind==='dungeon-passage') { dungeonTile(render,69,x,y); return true; }
  if (!['dungeon-stairs-up','dungeon-stairs-down'].includes(object.kind)) return false;
  const down=object.kind==='dungeon-stairs-down';
  rect(ctx,3,x-1,y-1,18,18); rect(ctx,down?3:1,x+1,y+1,14,14);
  for (let step=0;step<5;step++) {
    const inset=down?step:4-step,yy=y+2+step*3;
    rect(ctx,down?1:3,x+1+inset,yy,14-inset*2,2);
    rect(ctx,down?2:0,x+1+inset,yy,14-inset*2,1);
  }
  drawArrow(ctx,x+7,y+3,down); return true;
}

/** Markiert die Treppenrichtung zusätzlich mit einer kleinen eindeutigen Pfeilspitze. @param {CanvasRenderingContext2D} ctx Kontext. @param {number} x X. @param {number} y Y. @param {boolean} down Abwärts. */
function drawArrow(ctx,x,y,down) {
  rect(ctx,3,x-3,y-1,7,7); rect(ctx,0,x,y,1,4);
  for (let i=0;i<3;i++) { const yy=y+(down?4-i:i); rect(ctx,0,x-i,yy,1,1); rect(ctx,0,x+i,yy,1,1); }
}
