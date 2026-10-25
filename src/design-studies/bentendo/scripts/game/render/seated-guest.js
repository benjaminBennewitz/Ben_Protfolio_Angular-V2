import { drawResident,drawKeeper } from './village-life.js';
import { rect } from './primitives.js';

/** Senkt sitzende Gäste in das vorhandene Möbel und verdeckt ihre Füße an der Sitzkante. @param {object} render Zeicheninformationen. @param {object} guest Sitzender Gast. */
export function drawSeatedGuest(render,guest) {
  const {ctx}=render,x=guest.x*16,y=guest.y*16;
  ctx.save(); ctx.beginPath(); ctx.rect(x-2,y-8,20,21); ctx.clip();
  if (guest.appearance) drawResident(render,guest,x,y+3);
  else drawKeeper(render,guest,x,y+3);
  ctx.restore(); rect(ctx,3,x+4,y+13,8,1);
}
