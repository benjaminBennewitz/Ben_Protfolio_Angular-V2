import { rect } from './primitives.js';

/** Fasst den Wasserfall mit originalen Felsgrafiken ein und setzt die Höhlenöffnung daneben. @param {object} render Zeicheninformationen. @param {number} x Spalte. @param {number} y Zeile. */
export function drawNorthCell(render,x,y) {
  const {ctx,assets,game}=render,kind=game.room.ground[y][x];
  if (kind==='c') return ctx.drawImage(assets.villageTiles,352,16,16,16,x*16,y*16,16,16);
  if (y>=2) return ctx.drawImage(assets.villageTiles,x===16?384:416,32,16,16,x*16,y*16,16,16);
  ctx.drawImage(assets.villageTiles,400,64+y*16,16,16,x*16,y*16,16,16);
  if (y===0 && (x===17 || x===18)) drawSpringCap(render,x);
}

/** Öffnet einen gemeinsamen Quellbogen in der durchgehenden Felswand. @param {object} render Zeicheninformationen. @param {number} x Spalte des Wasserfalls. */
function drawSpringCap(render,x) {
  const left=x===17,xx=x*16;
  render.ctx.drawImage(render.assets.villageTiles,left?352:360,16,8,16,xx+(left?0:8),0,8,16);
  rect(render.ctx,3,xx+(left?8:0),4,8,12);
}
