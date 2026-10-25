import { rect } from './primitives.js';
import { pipePorts,pipeFlow,PIPE_STEPS } from '../data/east-pipes.js';
import { dungeonTile } from './dungeon-atlas.js';

/** Bindet die Wurzelpforte in eine vollständige alte Mauer mit seitlichen Abschlüssen ein. @param {object} render Zeicheninformationen. @param {number} x Spalte. @param {number} y Zeile. */
export function drawEastRock(render,x,y) {
  const grid=render.game.room.ground,left=grid[y]?.[x-1]!=='r',right=grid[y]?.[x+1]!=='r',top=grid[y-1]?.[x]!=='r';
  const index=top?(left?0:right?3:1+x%2):left?20:right?23:11+x%2;
  dungeonTile(render,index,x*16,y*16);
}

/** Zeichnet Zulauf und Druckkolben fest an den Enden der Bodenleitung. @param {object} render Zeicheninformationen. */
export function drawPipeBoard(render) {
  if (!render.game.room.pipeBoard) return;
  const {ctx,game}=render,ready=pipeFlow(game.flags).ready;
  rect(ctx,3,48,48,16,16); rect(ctx,2,49,49,14,14); rect(ctx,0,53,51,6,9);
  rect(ctx,3,112,80,40,16); rect(ctx,2,113,81,38,14);
  rect(ctx,ready?0:1,116,85,ready?28:8,6); rect(ctx,3,144,77,4,22);
  rect(ctx,3,148,82,12,3); rect(ctx,game.flags.eastOpen?0:1,151,86,6,7);
}

/** Zeichnet neue Requisiten über kleine, getrennte Darstellungsfunktionen. @param {object} render Zeicheninformationen. @param {object} object Raumelement. */
export function drawEastProp(render,object) {
  const draw={'east-canteen':drawCanteen,'east-pipe':drawPipe,'east-hatch':drawHatch,'east-root-door':drawRootDoor}[object.kind];
  if (draw) { draw(render,object); return true; }
  return object.kind==='east-cylinder';
}

/** Zeichnet die verlorene Flasche als kleines Fundstück im Gras. @param {object} render Zeicheninformationen. @param {object} object Flasche. */
function drawCanteen(render,object) {
  const x=object.x*16,y=object.y*16;
  rect(render.ctx,3,x+6,y+2,4,3); rect(render.ctx,3,x+4,y+5,8,9);
  rect(render.ctx,1,x+5,y+6,6,7); rect(render.ctx,0,x+6,y+7,1,4);
}

/** Zeichnet eine geschlossene Wartungsluke bündig im Dorfgrund. @param {object} render Zeicheninformationen. @param {object} object Luke. */
function drawHatch(render,object) {
  const x=object.x*16,y=object.y*16;
  rect(render.ctx,3,x,y,16,16); rect(render.ctx,2,x+1,y+1,14,14);
  for (const yy of [3,7,11]) rect(render.ctx,1,x+2,y+yy,12,2);
  rect(render.ctx,3,x+5,y+5,6,5); rect(render.ctx,0,x+6,y+6,4,2);
}

/** Verbindet geschlossene Steinflügel, Wurzeln und das alte Warnzeichen. @param {object} render Zeicheninformationen. @param {object} object Pforte. */
function drawRootDoor(render,object) {
  const {ctx,assets}=render,x=object.x*16,y=object.y*16;
  for (const dx of [0,16]) for (const dy of [0,16]) ctx.drawImage(assets.dungeonTiles,64,0,16,16,x+dx,y+dy,16,16);
  rect(ctx,3,x+7,y+8,18,24); rect(ctx,1,x+9,y+10,14,22); rect(ctx,3,x+15,y+10,1,22);
  for (const dx of [2,16,27]) { rect(ctx,3,x+dx,y,2,24-dx%7); rect(ctx,1,x+dx+1,y,1,20-dx%7); }
  for (const yy of [17,20,23]) rect(ctx,3,x+10,y+yy,3,1);
}

/** Stellt jeden Rohranschluss und die tatsächlich erreichte Wassermenge im Bodenkanal dar. @param {object} render Zeicheninformationen. @param {object} object Rohrstück. */
function drawPipe(render,object) {
  const {ctx,game}=render,x=object.x*16,y=object.y*16,wet=pipeFlow(game.flags).wet.has(object.index);
  const broken=object.index===4 && !game.flags.eastPipeRepaired;
  rect(ctx,3,x,y,16,16); rect(ctx,1,x+1,y+1,14,14);
  for (const port of pipePorts(game.flags,object.index)) drawPipeArm(ctx,x,y,port,wet);
  rect(ctx,3,x+4,y+4,8,8); rect(ctx,wet?0:2,x+6,y+6,4,4);
  if (broken) { rect(ctx,3,x+5,y+6,6,3); rect(ctx,0,x+7,y+10,2,3); }
  else if (wet && !game.reduced) rect(ctx,2,x+7,y+5+Math.floor(game.time*4)%5,2,1);
}

/** Verbindet einen Rohrarm exakt bis zum Nachbarfeld. @param {CanvasRenderingContext2D} ctx Kontext. @param {number} x X. @param {number} y Y. @param {number} port Richtung. @param {boolean} wet Wasser erreicht diesen Arm. */
function drawPipeArm(ctx,x,y,port,wet) {
  const [dx,dy]=PIPE_STEPS[port],xx=x+(dx<0?0:dx>0?8:4),yy=y+(dy<0?0:dy>0?8:4);
  rect(ctx,3,xx,yy,8,8); rect(ctx,2,xx+(dx?0:1),yy+(dy?0:1),dx?8:6,dy?8:6);
  rect(ctx,wet?0:1,xx+(dx?0:3),yy+(dy?0:3),dx?8:2,dy?8:2);
}
