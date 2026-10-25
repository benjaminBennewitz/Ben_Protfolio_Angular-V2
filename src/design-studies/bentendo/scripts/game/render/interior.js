import { drawSeatedGuest } from './seated-guest.js';
import { drawPipeBoard,drawEastProp } from './east.js';
import { drawSleepingHero } from './health.js';
import { FURNITURE_ART } from '../data/house-furniture.js';
import { rect } from './primitives.js';
import { drawObject } from './objects.js';
import { drawResident, drawKeeper } from './village-life.js';
import { drawVillageHero, compareDepth } from './village.js';
import { drawDiscoveryStatus } from './discoveries.js';
import { drawPartition, drawCounter } from './interior-fixtures.js';

const floors=new WeakMap();

/** Zeichnet tatsächliche Raumformen und nach Fußpunkten sortierte Einrichtung. @param {object} render Zeicheninformationen. @param {object} player Interpolierte Spielfigur. */
export function drawInterior(render,player) {
  drawFloor(render); drawPipeBoard(render);
  const entries=[];
  for (const object of render.game.objects) entries.push({...object,depth:(object.drawY ?? object.y)+(object.h || 1)});
  if (!render.game.resting) entries.push({...player,hero:true,depth:player.y+1});
  entries.sort(compareDepth);
  for (const object of entries) { drawInteriorObject(render,object); drawDiscoveryStatus(render,object); }
}

/** Cacht Grundriss, Boden, Wandkonturen und Teppiche gemeinsam. @param {object} render Zeicheninformationen. */
function drawFloor(render) {
  const room=render.game.room;
  if (!floors.has(room)) {
    const surface=document.createElement('canvas'); surface.width=room.width*16; surface.height=room.height*16;
    const ctx=surface.getContext('2d'); ctx.imageSmoothingEnabled=false;
    const target={...render,ctx}; rect(ctx,3,0,0,surface.width,surface.height);
    for (let y=0;y<room.height;y++) for (let x=0;x<room.width;x++) drawFloorCell(target,x,y);
    for (const rug of room.rugs) drawRug(target,rug);
    floors.set(room,surface);
  }
  render.ctx.drawImage(floors.get(room),0,0);
}

/** Trennt Nutzfläche, Wände und dunklen Außenraum anhand desselben Kollisionsrasters. @param {object} render Zeicheninformationen. @param {number} x Spalte. @param {number} y Zeile. */
function drawFloorCell(render,x,y) {
  const room=render.game.room,kind=room.layout[y][x];
  if (kind===' ') return;
  if (kind==='#') return drawWall(render,x,y);
  if (room.style==='stone') return render.ctx.drawImage(render.assets.villageTiles,16,240,16,16,x*16,y*16,16,16);
  render.ctx.drawImage(render.assets.cottageTiles,40,104,16,16,x*16,y*16,16,16);
}

/** Zeichnet eine rückwärtige Wand oder eine schlanke seitliche Raumkante. @param {object} render Zeicheninformationen. @param {number} x Spalte. @param {number} y Zeile. */
function drawWall(render,x,y) {
  const {ctx,game}=render,layout=game.room.layout;
  if (layout[y]?.[x-1]==='.' && layout[y]?.[x+1]==='.') return drawPartition(render,x,y);
  ctx.drawImage(render.assets.interiorTiles,0,0,16,16,x*16,y*16,16,16);
  rect(ctx,3,x*16,y*16,16,1); rect(ctx,3,x*16,y*16+15,16,1);
  const below=layout[y+1]?.[x]==='.',above=layout[y-1]?.[x]==='.';
  if (below) {
    ctx.drawImage(render.assets.interiorTiles,0,0,16,8,x*16,y*16,16,8);
    ctx.drawImage(render.assets.interiorTiles,0,8,16,8,x*16,y*16+8,16,8);
    rect(ctx,3,x*16,y*16+15,16,1);
    if (x%5===2) { rect(ctx,3,x*16+3,y*16+2,10,9); rect(ctx,0,x*16+5,y*16+3,6,6); rect(ctx,2,x*16+7,y*16+3,1,6); }
  } else if (above) { rect(ctx,1,x*16,y*16,16,4); rect(ctx,3,x*16,y*16+4,16,2); }
  else if (layout[y][x+1]==='.') { rect(ctx,1,x*16+12,y*16,4,16); rect(ctx,3,x*16+10,y*16,2,16); }
  else if (layout[y][x-1]==='.') { rect(ctx,1,x*16,y*16,4,16); rect(ctx,3,x*16+4,y*16,2,16); }
}

/** Verbindet die echten Teppichränder mit wiederholbaren Mittelstücken. @param {object} render Zeicheninformationen. @param {object} rug Teppichfläche. */
function drawRug(render,rug) {
  const width=rug.w*2,height=rug.h*2;
  for (let y=0;y<height;y++) for (let x=0;x<width;x++) {
    if (render.game.room.layout[rug.y+Math.floor(y/2)]?.[rug.x+Math.floor(x/2)]!=='.') continue;
    const sx=64+(x===0?0:x===width-1?16:8),sy=48+(y===0?0:y===height-1?16:8);
    render.ctx.drawImage(render.assets.interiorTiles,sx,sy,8,8,rug.x*16+x*8,rug.y*16+y*8,8,8);
  }
}

/** Zeichnet vollständige Möbelbilder in nativer Größe statt angeschnittener Ersatzgrafiken. @param {object} render Zeicheninformationen. @param {object} object Raumelement. */
function drawInteriorObject(render,object) {
  if (drawEastProp(render,object)) return;
  if (object.seated) return drawSeatedGuest(render,object);
  if (object.hero) return drawInteriorHero(render,object);
  if (['resident','host'].includes(object.kind)) return drawResident(render,object,(object.drawX ?? object.x)*16,(object.drawY ?? object.y)*16);
  if (object.kind==='npc') return drawKeeper(render,object,(object.drawX ?? object.x)*16,(object.drawY ?? object.y)*16);
  if (object.kind==='stairs') return render.ctx.drawImage(render.assets.cottageTiles,336,0,16,24,object.x*16,object.y*16-8,16,24);
  if (object.kind!=='interior-prop') return drawObject(render,object);
  const art=FURNITURE_ART[object.art],x=object.x*16,y=object.y*16;
  if (object.art==='bookcase') return drawBookcase(render,x,y);
  if (object.art==='counter') return drawCounter(render,object);
  const sheets={cottage:render.assets.cottageTiles,dungeon:render.assets.tiles,barrel:render.assets.barrelTiles,tool:render.assets.toolTiles};
  const [sx,sy,w,h]=art.source,sheet=sheets[art.sheet] || render.assets.interiorTiles;
  render.ctx.drawImage(sheet,sx,sy,w,h,x+Math.floor((art.w*16-w)/2),y+art.h*16-h,w,h);
  if (object.detail==='book' || object.detail==='note') { rect(render.ctx,0,x+10,y+4,10,6); rect(render.ctx,3,x+14,y+4,1,6); }
  if (object.id==='bed-west' && render.game.resting) drawSleepingHero(render,object);
  if (object.art==='workbench') render.ctx.drawImage(render.assets.toolTiles,x+8,y-4,16,16);
}

/** Baut ein Bücherregal aus nativen Buchreihen und seinem Holzrahmen auf. @param {object} render Zeicheninformationen. @param {number} x X. @param {number} y Y. */
function drawBookcase(render,x,y) {
  rect(render.ctx,3,x,y+6,16,26); rect(render.ctx,1,x+1,y+7,14,24);
  for (const yy of [9,21]) {
    render.ctx.drawImage(render.assets.interiorTiles,0,8,16,8,x,y+yy,16,8);
    rect(render.ctx,3,x,y+yy+8,16,2);
  }
  for (const side of [0,14]) { rect(render.ctx,3,x+side,y+6,2,26); rect(render.ctx,1,x+side,y+7,1,24); }
  rect(render.ctx,3,x,y+6,16,1); rect(render.ctx,3,x,y+31,16,1);
}

/** Lässt die sitzende Figur in die Sitzfläche einsinken und verbirgt ihre Füße hinter dem Stuhl. @param {object} render Zeicheninformationen. @param {object} player Position. */
function drawInteriorHero(render,player) {
  if (!render.game.seat) return drawVillageHero(render,player);
  const {ctx}=render;
  ctx.save(); ctx.beginPath(); ctx.rect(player.x*16,player.y*16-16,16,27); ctx.clip();
  drawVillageHero(render,{...player,y:player.y+0.15}); ctx.restore();
}
