import { dungeonTile,dungeonWallTile } from './dungeon-atlas.js';
import { rect } from './primitives.js';

/** Zeichnet gealterte Pflasterwege, Schuttzonen und raumspezifische Bodendetails aus Awakening. @param {object} render Zeicheninformationen. @param {number} x Spalte. @param {number} y Zeile. */
export function drawDungeonGround(render,x,y) {
  const {ctx,game}=render,style=game.room.style,xx=x*16,yy=y*16;
  const edge=[[0,1],[1,0],[0,-1],[-1,0]].some(touchesWall.bind(null,game.room,x,y));
  const paved=pavedCell(game.room,x,y);
  dungeonTile(render,(x*13+y*7)%13===0?46:45,xx,yy);
  if (paved) drawPaving(render,x,y);
  if ((x*13+y*7)%11===0) { rect(ctx,2,xx+3,yy+9,7,1); rect(ctx,2,xx+9,yy+10,2,3); }
  if (edge && (x+y)%2===0) drawRubble(ctx,xx,yy);
  if (style==='gallery') drawDampCell(render,x,y);
  if (style==='guardpost' && y===3 && x>=8 && x<=10) drawBedroll(ctx,xx,yy,x===8);
  if (style==='nest' && (edge || y===5 && x>=6 && x<=10)) drawWeb(ctx,xx,yy);
  if (style==='mechanism' && x===6 && y>=3 && y<=5) for (let i=1;i<16;i+=4) { rect(ctx,3,xx+7,yy+i,2,3); rect(ctx,0,xx+7,yy+i,1,1); }
}

/** Verankert dunkle Mauerflächen, Säulenköpfe, Wandfackeln und Nischen an echten Wänden. @param {object} render Zeicheninformationen. @param {number} x Spalte. @param {number} y Zeile. */
export function drawDungeonWall(render,x,y) {
  const {ctx,game}=render,xx=x*16,yy=y*16,index=dungeonWallTile(game.room,x,y);
  rect(ctx,3,xx,yy,16,16);
  if (index<0) return;
  dungeonTile(render,index,xx,yy);
  if (game.room.layout[y+1]?.[x]!=='.') return;
  if (x%5===2) drawTorch(render,xx+7,yy+4);
  if (game.room.style==='nest') drawWeb(ctx,xx,yy);
  if (game.room.style==='guardpost' && [5,8].includes(x)) drawRack(ctx,xx,yy);
}

/** Zeichnet eine durchgehende, begehbare Gitterabdeckung über der alten Abflussrinne. @param {object} render Zeicheninformationen. @param {number} x Spalte. @param {number} y Zeile. */
function drawDampCell(render,x,y) {
  const {ctx,assets,game}=render,xx=x*16,yy=y*16;
  if (y===5 && x>=3 && x<=13) {
    const frame=game.reduced?0:Math.floor(game.time*4)%4;
    ctx.drawImage(assets.caveWater,frame*16,4,16,8,xx,yy+4,16,8);
    rect(ctx,3,xx,yy+3,16,1); rect(ctx,3,xx,yy+12,16,1);
    if (x===3 || x===13) rect(ctx,3,xx+(x===3?0:15),yy+3,1,10);
    for (let i=1;i<16;i+=4) rect(ctx,2,xx+i,yy+4,2,8);
  }
  if ((y===2 || y===9) && x%4===0) dungeonTile(render,37,xx,yy);
}

/** Zeichnet niedrigen passierbaren Schutt als zusammenhängende Randgruppen. @param {CanvasRenderingContext2D} ctx Kontext. @param {number} x X. @param {number} y Y. */
function drawRubble(ctx,x,y) {
  for (const [dx,dy,w] of [[1,8,5],[7,11,6],[4,5,3]]) { rect(ctx,3,x+dx,y+dy,w,3); rect(ctx,1,x+dx,y+dy,w-1,1); }
}

/** Zeichnet flach auf dem Boden liegende, zerrissene Lagerdecken. @param {CanvasRenderingContext2D} ctx Kontext. @param {number} x X. @param {number} y Y. @param {boolean} head Kopfende. */
function drawBedroll(ctx,x,y,head) {
  rect(ctx,3,x,y+4,16,9); rect(ctx,2,x+1,y+5,14,7); rect(ctx,0,x+1,y+5,14,1);
  if (head) { rect(ctx,1,x+1,y+5,4,6); rect(ctx,0,x+2,y+6,2,4); }
  else for (let i=3;i<16;i+=5) rect(ctx,1,x+i,y+6,1,5);
}

/** Verbindet feine Netzfäden mit Wänden und tief liegenden Bodengespinsten. @param {CanvasRenderingContext2D} ctx Kontext. @param {number} x X. @param {number} y Y. */
export function drawWeb(ctx,x,y) {
  for (let i=0;i<14;i++) { rect(ctx,0,x+i,y+i,1,1); rect(ctx,0,x+14-i,y+i,1,1); }
  for (const row of [3,7,11]) rect(ctx,1,x+2,y+row,11,1);
  rect(ctx,0,x+7,y,1,14);
}

/** Beleuchtet mit kleinen ruhigen Flammen nur die Wandhalterung. @param {object} render Zeicheninformationen. @param {number} x X. @param {number} y Y. */
function drawTorch(render,x,y) {
  const {ctx,game}=render,lift=game.reduced?0:Math.floor(game.time*3)%2;
  rect(ctx,3,x-2,y+4,5,7); rect(ctx,1,x,y+5,1,5); rect(ctx,2,x-2,y,5,6);
  rect(ctx,0,x-1,y-lift,3,6+lift); rect(ctx,1,x,y+3,1,3);
}

/** Hängt alte Waffenreste an einer Wandlatte, außerhalb aller Laufwege. @param {CanvasRenderingContext2D} ctx Kontext. @param {number} x X. @param {number} y Y. */
function drawRack(ctx,x,y) {
  rect(ctx,3,x+1,y+5,14,3); rect(ctx,1,x+2,y+5,12,1);
  for (const dx of [4,10]) { rect(ctx,0,x+dx,y+1,1,11); rect(ctx,2,x+dx-2,y+9,5,1); }
}

/** Erkennt verbundene Laufplatten ausschließlich auf begehbaren Bodenfeldern. @param {object} room Raum. @param {number} x Spalte. @param {number} y Zeile. */
export function pavedCell(room,x,y) {
  if (room.layout[y]?.[x]!=='.') return false;
  return room.style==='mechanism' || y===6 || room.style==='vestibule' && x>=4 && x<=8 || room.style==='guardpost' && x>=5 && x<=9;
}

/** Schließt den Plattenrand zum Erdboden und zu Mauern in jeder Richtung sauber ab. @param {object} render Zeicheninformationen. @param {number} x Spalte. @param {number} y Zeile. */
function drawPaving(render,x,y) {
  const {game}=render;
  dungeonTile(render,40+(x%2)+(y%2)*2,x*16,y*16);
  if (!pavedCell(game.room,x,y-1)) rect(render.ctx,2,x*16,y*16,16,1);
}

/** Erkennt Randdeko nur an realen Mauern. @param {object} room Raum. @param {number} x Spalte. @param {number} y Zeile. @param {number[]} delta Nachbarversatz. */
function touchesWall(room,x,y,delta) { return room.layout[y+delta[1]]?.[x+delta[0]]!=='.'; }
