import { dayPhase,clockLabel } from '../systems/world-clock.js';
import { drawQuestMarkers } from './quest-markers.js';
import { rect } from './primitives.js';
import { pixelText } from '../../display/font.js';
import { PALETTE } from '../../core/config.js';
import { wall } from '../systems/collision.js';

/** Wählt in Dorfhäusern den Ortsplan mit dem jeweiligen Hauseingang als Standort. @param {object} game Spiel. */
function mapLocation(game) {
  if (game.room.villageEntrance) return {room:game.rooms.get('village'),x:game.room.villageEntrance[0],y:game.room.villageEntrance[1]};
  return {room:game.room,x:game.player.x,y:game.player.y};
}

/** Zeichnet einen ruhigen Papierplan mit Dachsymbolen, Baumkronen und deutlich eingefasstem Standort. @param {object} render Zeicheninformationen. */
export function drawMap(render) {
  const {ctx,game}=render;
  if (!game.mapOpen) return;
  const location=mapLocation(game),room=location.room,scale=Math.max(1,Math.floor(Math.min(132/room.width,88/room.height)));
  const plan={room,scale,x:Math.floor((160-room.width*scale)/2),y:22+Math.floor((88-room.height*scale)/2)};
  drawPaper(ctx); pixelText(ctx,room.title.slice(0,30),80,8,PALETTE[3],1,true);
  for (let y=0;y<room.height;y++) for (let x=0;x<room.width;x++) mapCell(render,plan,x,y);
  for (const tree of room.trees || []) mapTree(ctx,plan,tree);
  for (const house of room.buildings || []) mapHouse(ctx,plan,house);
  for (const object of room.objects) if (object.kind==='gate' || object.kind==='well') mapLandmark(ctx,plan,object,object.id==='east-gate'?game.flags.eastOpen:game.flags.northOpen);
  drawQuestMarkers(render,plan);
  drawMarker(ctx,plan.x+location.x*scale,plan.y+location.y*scale,scale);
  pixelText(ctx,'N',145,26,PALETTE[2]); rect(ctx,2,146,36,1,7); rect(ctx,2,145,36,3,1); rect(ctx,2,146,35,1,1);
  pixelText(ctx,`${dayPhase(game)} · ${clockLabel(game)}`,80,112,PALETTE[2],1,true);
  pixelText(ctx,`+ DU  A: ? ${game.flags.questMarkersHidden?'AUS':'AN'}  B: ZU`,80,127,PALETTE[3],1,true);
}

/** Zeichnet einen dezenten, abgestuften Papierrand statt eines massiven schwarzen Kastens. @param {CanvasRenderingContext2D} ctx Kontext. */
function drawPaper(ctx) {
  rect(ctx,2,3,5,154,134); rect(ctx,1,5,3,150,138); rect(ctx,0,6,5,148,134);
  rect(ctx,0,4,7,152,130); rect(ctx,1,13,19,134,1); rect(ctx,1,13,124,134,1);
  for (const x of [8,150]) { rect(ctx,2,x,6,2,2); rect(ctx,2,x,136,2,2); }
}

/** Verwendet helle Geländezeichen und dünne Wasserreflexe statt großflächiger harter Füllungen. @param {object} render Zeicheninformationen. @param {object} plan Kartenausschnitt. @param {number} x Spalte. @param {number} y Zeile. */
function mapCell(render,plan,x,y) {
  const {ctx,game}=render,{room,scale}=plan,kind=room.ground?.[y]?.[x] || (room.layout?.[y]?.[x]==='w'?'w':null),xx=plan.x+x*scale,yy=plan.y+y*scale;
  if (!kind) { if (wall({...game,room},x,y)) rect(ctx,2,xx,yy,scale,scale); return; }
  if (['.','p','b'].includes(kind)) { rect(ctx,1,xx,yy,scale,scale); return; }
  if (kind==='w') { rect(ctx,2,xx,yy,scale,scale); if ((x+y)%4===0) rect(ctx,0,xx,yy+1,Math.max(1,scale-1),1); return; }
  if (kind==='r' || kind==='c') { rect(ctx,2,xx,yy,scale,scale); if (x%3===0) rect(ctx,1,xx,yy,1,1); return; }
  if (['f','t','h'].includes(kind) && (x+y)%2===0) rect(ctx,1,xx+1,yy+1,1,1);
}

/** Stellt Baumgruppen mit abgestuften Kronen und kleinen Stämmen dar. @param {CanvasRenderingContext2D} ctx Kontext. @param {object} plan Kartenausschnitt. @param {number[]} tree Baumstandort. */
function mapTree(ctx,plan,tree) {
  const x=plan.x+tree[0]*plan.scale,y=plan.y+tree[1]*plan.scale,size=plan.scale*2;
  rect(ctx,1,x+1,y,size-2,size-1); rect(ctx,1,x,y+1,size,size-3);
  rect(ctx,2,x+1,y+size-2,size-2,1); rect(ctx,2,x+Math.floor(size/2),y+size-1,1,1);
}

/** Zeichnet gekappte Dachkanten, eine helle Fassade und eine erkennbare Tür. @param {CanvasRenderingContext2D} ctx Kontext. @param {object} plan Kartenausschnitt. @param {object} house Hausumriss. */
function mapHouse(ctx,plan,house) {
  const x=plan.x+house.x*plan.scale,y=plan.y+house.y*plan.scale,w=house.w*plan.scale,h=house.h*plan.scale;
  rect(ctx,0,x-1,y-1,w+2,h+2); rect(ctx,1,x+1,y+2,w-2,h-2);
  rect(ctx,2,x+2,y,w-4,1); rect(ctx,2,x+1,y+1,w-2,2); rect(ctx,2,x,y+3,w,Math.max(1,h-7));
  rect(ctx,1,x+3,y+2,w-6,1); rect(ctx,2,x+1,y+h-1,w-2,1);
  rect(ctx,3,x+Math.floor(w/2),y+h-3,2,3);
}

/** Ergänzt Brunnenring und geschlossene Wegsperren als kleine Orientierungspunkte. @param {CanvasRenderingContext2D} ctx Kontext. @param {object} plan Kartenausschnitt. @param {object} object Landmarke. @param {boolean} northOpen Freigegebener Höhlenweg. */
function mapLandmark(ctx,plan,object,northOpen) {
  const x=plan.x+object.x*plan.scale,y=plan.y+object.y*plan.scale;
  if (['north-gate','east-gate'].includes(object.id) && northOpen) { rect(ctx,2,x,y,plan.scale,plan.scale); rect(ctx,0,x+1,y+1,Math.max(1,plan.scale-2),plan.scale-1); return; }
  if (object.kind==='well') { rect(ctx,2,x,y,5,5); rect(ctx,0,x+1,y+1,3,3); rect(ctx,2,x+2,y+2,1,1); return; }
  rect(ctx,0,x-1,y-1,plan.scale+2,plan.scale+2); rect(ctx,2,x,y,plan.scale,1);
  rect(ctx,3,x,y,1,plan.scale); rect(ctx,3,x+plan.scale-1,y,1,plan.scale);
}

/** Hält den eigenen Standort mit hellem Hof und dunklem Kreuz über jedem Terrain lesbar. @param {CanvasRenderingContext2D} ctx Kontext. @param {number} x X. @param {number} y Y. @param {number} scale Maßstab. */
function drawMarker(ctx,x,y,scale) {
  const xx=x+Math.floor(scale/2),yy=y+Math.floor(scale/2);
  rect(ctx,0,xx-2,yy-3,5,7); rect(ctx,0,xx-3,yy-2,7,5);
  rect(ctx,3,xx-2,yy,5,1); rect(ctx,3,xx,yy-2,1,5); rect(ctx,0,xx,yy,1,1);
}
