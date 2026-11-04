import { rect } from './primitives.js';

/** Zeichnet den eingeschnittenen Wasserlauf unter den Figuren, inklusive Wehr und Ponton. @param {object} render Zeicheninformationen. */
export function drawMeadowStream(render) {
  const {game,ctx}=render,channel=game.room.meadowChannel;
  if (!channel) return;
  const {points,source,weir,bridge}=channel,open=game.flags.eastStreamOpen || !weir;
  const frame=game.reduced?0:Math.floor(game.time*9)%16;
  for (let i=0;i<points.length;i++) {
    const [x,y]=points[i],before=points[i-1] || source || [-1,y],after=points[i+1] || [x+Number(x===game.room.width-1),y+Number(x!==game.room.width-1)];
    drawChannelCell(ctx,x,y,[before,after],open,frame);
  }
  if (source) drawLakeOutlet(ctx,source);
  if (weir) drawWeir(ctx,weir,open);
  if (bridge) drawPontoon(ctx,bridge,open);
}

/** Verbindet die Mitte einer Bachkachel in beide Fließrichtungen. @param {CanvasRenderingContext2D} ctx Kontext. @param {number} x Rasterspalte. @param {number} y Rasterzeile. @param {Array} neighbours Angrenzende Bachpunkte. @param {boolean} open Wehrstellung. @param {number} frame Wasserphase. */
function drawChannelCell(ctx,x,y,neighbours,open,frame) {
  const xx=x*16,yy=y*16;
  for (const [nx,ny] of neighbours) {
    const dx=nx-x,dy=ny-y,horizontal=Boolean(dx),sx=xx+(dx<0?0:horizontal?7:2),sy=yy+(dy<0?0:horizontal?2:7);
    rect(ctx,1,sx,sy,horizontal?9:12,horizontal?12:9);
  }
  for (const [nx,ny] of neighbours) drawChannelArm(ctx,xx,yy,nx-x,ny-y,open,frame);
  if (!open) { rect(ctx,2,xx+7,yy+7,2,1); rect(ctx,2,xx+10,yy+10,1,1); }
}

/** Zeichnet die dunkle Uferkante und kurze mitlaufende Lichtreflexe. @param {CanvasRenderingContext2D} ctx Kontext. @param {number} x Pixelspalte. @param {number} y Pixelzeile. @param {number} dx Horizontale Richtung. @param {number} dy Vertikale Richtung. @param {boolean} open Wehrstellung. @param {number} frame Wasserphase. */
function drawChannelArm(ctx,x,y,dx,dy,open,frame) {
  const horizontal=Boolean(dx),sx=x+(dx<0?0:horizontal?5:4),sy=y+(dy<0?0:horizontal?4:5);
  rect(ctx,open?2:0,sx,sy,horizontal?11:8,horizontal?8:11);
  if (!open) return;
  const offset=(frame+x/16+y/16)%8;
  if (horizontal) rect(ctx,1,sx+offset,sy+2,3,1);
  else rect(ctx,1,sx+2,sy+offset,1,3);
}

/** Überbrückt den gerundeten Seerand am gemauerten Auslauf. @param {CanvasRenderingContext2D} ctx Kontext. @param {number[]} point Quellkachel. */
function drawLakeOutlet(ctx,point) {
  const x=point[0]*16,y=point[1]*16;
  rect(ctx,1,x+2,y+7,12,9); rect(ctx,2,x+4,y+7,8,9);
}

/** Zeigt das angehobene Schütz zwischen zwei steinernen Wangen. @param {CanvasRenderingContext2D} ctx Kontext. @param {number[]} point Wehrposition. @param {boolean} open Wehrstellung. */
function drawWeir(ctx,point,open) {
  const x=point[0]*16,y=point[1]*16,top=open?1:5;
  for (const side of [0,12]) { rect(ctx,3,x+side,y+3,4,11); rect(ctx,1,x+side,y+3,4,3); }
  rect(ctx,3,x+3,y+top,10,4); rect(ctx,1,x+4,y+top,8,1);
  if (!open) for (const i of [5,8,11]) rect(ctx,2,x+i,y+top+1,1,3);
}

/** Setzt die trockene Brücke tief ins Bett und die schwimmende auf Weghöhe. @param {CanvasRenderingContext2D} ctx Kontext. @param {number[]} point Brückenposition. @param {boolean} open Wasserstand. */
function drawPontoon(ctx,point,open) {
  const x=point[0]*16,y=point[1]*16,start=open?0:4,end=open?16:12;
  rect(ctx,3,x+2,y+start,12,end-start); rect(ctx,2,x+4,y+start,8,end-start);
  for (let i=start+1;i<end;i+=3) rect(ctx,1,x+4,y+i,8,1);
  if (open) for (const i of [1,13]) { rect(ctx,3,x+2,y+i,2,2); rect(ctx,3,x+12,y+i,2,2); }
}

/** Zeichnet einen Steinblock mit eingelassener Eisenfassung statt eines Schlitzes im Ufer. @param {object} render Zeicheninformationen. @param {object} object Bedienstein. */
export function drawMeadowLeverStone(render,object) {
  const {ctx}=render,x=object.x*16,y=object.y*16;
  rect(ctx,3,x+2,y+5,12,10); rect(ctx,2,x+3,y+4,10,10);
  rect(ctx,1,x+4,y+4,8,4); rect(ctx,3,x+6,y+5,4,2);
  rect(ctx,1,x+4,y+10,2,3);
}
