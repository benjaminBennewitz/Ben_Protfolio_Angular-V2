import { rect } from './primitives.js';

/** Zeichnet den geworfenen oder am Boden liegenden Ast mit kleiner pixeliger Flugkurve. @param {object} render Zeicheninformationen. */
export function drawFetchStick(render) {
  const {game,ctx}=render,fetch=game.roomState.fetch;
  if (!fetch || !['throw','outbound','pickup'].includes(fetch.phase)) return;
  const flying=fetch.phase==='throw',progress=flying?Math.min(1,fetch.elapsed/0.45):1;
  const x=(fetch.origin[0]+(fetch.goal[0]-fetch.origin[0])*progress)*16+2;
  const base=(fetch.origin[1]+(fetch.goal[1]-fetch.origin[1])*progress)*16+10;
  const lift=flying && !game.reduced?Math.sin(progress*Math.PI)*18:0;
  rect(ctx,2,x+1,base+3,10,2);
  rect(ctx,3,x,base-lift,12,3); rect(ctx,1,x+1,base-lift,10,1);
  rect(ctx,3,x+7,base-lift-2,3,2);
}
