import { rect } from './primitives.js';

/** Zeichnet die Reisetruhe mit den vorhandenen geschlossenen und geöffneten Awakening-Frames. @param {object} render Zeicheninformationen. @param {object} object Truhe. */
export function drawDiscoveryChest(render,object) {
  render.ctx.drawImage(render.assets.tiles,object.searched?16:0,0,16,16,object.x*16,object.y*16,16,16);
}

/** Kennzeichnet durchsuchte Möbel mit einem kleinen statischen Pixelhäkchen. @param {object} render Zeicheninformationen. @param {object} object Fundstelle. */
export function drawDiscoveryStatus(render,object) {
  if (!object.searched) return;
  const x=object.x*16+(object.w || 1)*16-6,y=object.y*16+(object.h || 1)*16-5;
  rect(render.ctx,3,x-1,y-1,6,5);
  rect(render.ctx,0,x,y+1,1,1); rect(render.ctx,0,x+1,y+2,1,1);
  rect(render.ctx,0,x+2,y+1,1,1); rect(render.ctx,0,x+3,y,1,1);
}
