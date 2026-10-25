import { rect } from './primitives.js';
import { drawBareGround } from './village-ground.js';

/** Zeichnet Fels, abgelassenen Kammerboden und das verbliebene Wasserbecken. @param {object} render Zeicheninformationen. @param {number} x Spalte. @param {number} y Zeile. */
export function drawCaveCell(render,x,y) {
  const cell=render.game.room.layout[y][x],kind=render.game.flags.sourceDrained && cell==='w'?'.':cell;
  if (kind==='#') { drawRock(render,x,y); return true; }
  if (kind==='w') { drawWater(render,x,y); return true; }
  drawBasinFloor(render,x,y); return true;
}

/** Lässt die massive Mauer in den dunklen Fels auslaufen statt das gesamte Außenfeld zu kacheln. @param {object} render Zeicheninformationen. @param {number} x Spalte. @param {number} y Zeile. */
function drawRock(render,x,y) {
  const {ctx,game,assets}=render,grid=game.room.layout,below=grid[y+1]?.[x];
  rect(ctx,3,x*16,y*16,16,16);
  if (below && below!=='#') {
    ctx.drawImage(assets.villageTiles,400,80,16,16,x*16,y*16,16,16);
    rect(ctx,2,x*16,y*16+12,16,2); rect(ctx,3,x*16,y*16+14,16,2);
  } else if (grid[y]?.[x-1]==='.' || grid[y]?.[x+1]==='.') {
    const side=grid[y]?.[x-1]==='.'?0:12; rect(ctx,2,x*16+side,y*16,4,16);
  }
}

/** Verwendet die vorhandenen Awakening-Wasserframes mit zusammenhängender steinerner Uferfassung. @param {object} render Zeicheninformationen. @param {number} x Spalte. @param {number} y Zeile. */
function drawWater(render,x,y) {
  const {ctx,game,assets}=render,frame=game.reduced?0:Math.floor(game.time*5)%4,grid=game.room.layout,xx=x*16,yy=y*16;
  ctx.drawImage(assets.caveWater,frame*16,0,16,16,xx,yy,16,16);
  for (const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
    if (grid[y+dy]?.[x+dx]==='w') continue;
    const ex=xx+(dx>0?14:0),ey=yy+(dy>0?14:0);
    rect(ctx,3,ex,ey,dx?2:16,dy?2:16); rect(ctx,1,ex+(dx<0?2:0),ey+(dy<0?2:0),dx?1:16,dy?1:16);
  }
}

/** Trennt Wartungsplatten, Schlamm und trockene Uferdetails klar voneinander. @param {object} render Zeicheninformationen. @param {number} x Spalte. @param {number} y Zeile. */
function drawBasinFloor(render,x,y) {
  const {ctx}=render,xx=x*16,yy=y*16,wet=x>=7 && x<=17 && y>=5 && y<=12;
  rect(ctx,wet?1:0,xx,yy,16,16); drawBareGround(render,x,y,'e');
  if (y===4 || y>=13 || x<=4 || x>=18) {
    rect(ctx,2,xx,yy+15,16,1); if ((x+y)%2===0) rect(ctx,1,xx+15,yy,1,15);
  }
  if (wet && (x+y)%3===0) { rect(ctx,2,xx+3,yy+10,8,1); rect(ctx,0,xx+4,yy+9,6,1); }
  if ([[7,7],[7,10],[9,11],[13,11],[17,9],[17,6]].some(atCell.bind(null,x,y))) drawAlgae(ctx,xx+3,yy+8);
  if ([[6,8],[8,12],[11,11],[15,12],[17,11]].some(atCell.bind(null,x,y))) drawShells(ctx,xx+4,yy+8);
  if (y===4 && x>=14 && x<=16) { rect(ctx,3,xx,yy+5,16,7); for (let i=1;i<16;i+=4) rect(ctx,1,xx+i,yy+5,2,7); }
}

/** Vergleicht einen festen Dekorstandort ohne Zufall und ohne zusätzliche Kollision. @param {number} x Spalte. @param {number} y Zeile. @param {number[]} point Dekorstandort. */
function atCell(x,y,point) { return point[0]===x && point[1]===y; }

/** Zeichnet kleine zusammenhängende Algenreste am früheren Wasserstand. @param {CanvasRenderingContext2D} ctx Kontext. @param {number} x X. @param {number} y Y. */
function drawAlgae(ctx,x,y) {
  for (const [dx,dy] of [[0,0],[2,-2],[4,0],[6,-3],[8,-1]]) { rect(ctx,2,x+dx,y+dy,2,5-dy); rect(ctx,0,x+dx,y+dy,1,2); }
  rect(ctx,2,x,y+5,10,1);
}

/** Zeichnet sparsame Süßwassermuscheln statt Meeresfauna in einer Flusskammer. @param {CanvasRenderingContext2D} ctx Kontext. @param {number} x X. @param {number} y Y. */
function drawShells(ctx,x,y) {
  rect(ctx,2,x,y+1,6,3); rect(ctx,0,x+1,y,4,3); rect(ctx,1,x+2,y,1,3);
  rect(ctx,2,x+7,y+5,4,2); rect(ctx,0,x+8,y+4,2,2);
}

/** Verankert das breite Fluttor sichtbar in der nördlichen Staumauer. @param {object} render Zeicheninformationen. @param {object} object Tor. */
export function drawSourceGate(render,object) {
  const {ctx,assets,game}=render,x=object.x*16,y=object.y*16,frame=game.reduced?0:Math.floor(game.time*5)%4;
  rect(ctx,3,x-4,y-4,56,38); rect(ctx,1,x-2,y-2,52,34); rect(ctx,3,x+4,y+3,40,29);
  for (let i=0;i<3;i++) ctx.drawImage(assets.caveWater,frame*16,0,16,16,x+i*16,y+15,16,16);
  for (const xx of [7,14,21,28,35,42]) { rect(ctx,3,x+xx,y+5,3,25); rect(ctx,0,x+xx,y+6,1,18); }
  rect(ctx,2,x+4,y+12,40,3); rect(ctx,3,x+2,y+30,44,3);
  for (const side of [-3,47]) for (let yy=0;yy<32;yy+=8) { rect(ctx,2,x+side,y+yy,4,7); rect(ctx,0,x+side,y+yy,3,1); }
  for (const yy of [8,14,20]) rect(ctx,3,x-2,y+yy,4,2);
  rect(ctx,2,x+46,y+4,19,2); for (let yy=6;yy<38;yy+=4) rect(ctx,1,x+64,y+yy,2,3);
}

/** Zeichnet mechanische Armaturen und Wandzugänge passend zur Kammer statt generischer Konsolenkästen. @param {object} render Zeicheninformationen. @param {object} object Requisite. */
export function drawCaveProp(render,object) {
  const {ctx}=render,x=object.x*16,y=object.y*16;
  if (object.kind==='cave-winch') return drawWinch(ctx,x,y);
  if (object.kind==='cave-plaque') {
    rect(ctx,3,x,y,32,24); rect(ctx,1,x+2,y+2,28,20);
    for (let i=0;i<3;i++) { rect(ctx,3,x+5,y+5+i*5,22-i*3,1); rect(ctx,0,x+3,y+4+i*5,1,1); } return;
  }
  if (object.kind==='cave-exit') {
    for (let i=0;i<4;i++) { rect(ctx,3,x-2,y+i*4,20,4); rect(ctx,1,x-1,y+i*4,18,2); } return;
  }
  rect(ctx,3,x-10,y-8,24,27); rect(ctx,2,x-8,y-7,20,3); rect(ctx,1,x-8,y-4,3,23);
  for (let i=0;i<3;i++) rect(ctx,1,x-5,y+9+i*3,15,1);
}

/** Befestigt eine Handwinde mit Achse, Rad und Wandankern am trockenen Wartungsweg. @param {CanvasRenderingContext2D} ctx Kontext. @param {number} x X. @param {number} y Y. */
function drawWinch(ctx,x,y) {
  rect(ctx,2,x+18,y+6,16,4); rect(ctx,3,x+31,y-4,3,20);
  rect(ctx,2,x+2,y-4,24,4); rect(ctx,3,x+18,y-4,5,20); rect(ctx,1,x+19,y-3,2,18);
  rect(ctx,3,x+3,y+2,13,12); rect(ctx,1,x+4,y+3,11,10); rect(ctx,3,x+8,y,3,16); rect(ctx,3,x+1,y+7,17,3);
  rect(ctx,0,x+8,y+7,3,3); rect(ctx,3,x+15,y+1,3,6); rect(ctx,0,x+16,y+1,1,4);
}
