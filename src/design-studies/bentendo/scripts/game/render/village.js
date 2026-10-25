import { drawSleepingPet } from './sleeping-pets.js';
import { minuteOfDay,nightShade } from '../systems/world-clock.js';
import { drawEastProp,drawEastRock } from './east.js';
import { drawWaterfall, drawGate } from './village-scenery.js';
import { drawResident, drawKeeper, drawAwakeningAnimal } from './village-life.js';
import { rect } from './primitives.js';
import { drawObject } from './objects.js';
import { drawNorthCell } from './village-north.js';
import { drawBareGround, drawFoliageMask } from './village-ground.js';
import { drawDiscoveryChest, drawDiscoveryStatus } from './discoveries.js';
import { drawFetchStick } from './fetch-stick.js';

const floors = new WeakMap();

/** Zeichnet den Dorfabschnitt mit nach Fußpunkten sortierten Ebenen. @param {object} render Zeicheninformationen. @param {object} player Interpolierte Spielfigur. */
export function drawVillage(render,player) {
  drawGround(render); drawMeadow(render); drawWaterfall(render);
  const entries = [];
  for (const tree of render.game.room.trees) entries.push({type:'tree',x:tree[0],y:tree[1],pine:tree[2]==='pine',depth:tree[1]+2});
  for (const bird of render.game.room.birds) if (nightShade(minuteOfDay(render.game))<0.15) entries.push({...bird,type:'perch',animal:'bird',depth:bird.treeY+2.01});
  for (const house of render.game.room.buildings) entries.push({...house,type:'house',depth:house.y+house.h});
  for (const object of render.game.objects) entries.push({...object,type:'object',depth:object.renderDepth ?? (object.drawY ?? object.y)+(object.h || 1)});
  if (render.game.roomState.fetch) entries.push({type:'fetch-stick',depth:render.game.roomState.fetch.goal[1]+0.8});
  entries.push({...player,type:'player',depth:player.y+1}); entries.sort(compareDepth);
  for (const entry of entries) drawEntry(render,entry);
}

/** Bewegt einzelne Grashalme und Blumen am Wegrand mit niedriger Frequenz. @param {object} render Zeicheninformationen. */
function drawMeadow(render) {
  const {ctx,game,assets}=render,frame=game.reduced?0:Math.floor(game.time*2)%4;
  for (const garden of game.room.gardens) {
    if (garden.kind!=='f') continue;
    for (let y=garden.y;y<garden.y+garden.h;y++) for (let x=garden.x;x<garden.x+garden.w;x++) {
      if (game.room.ground[y][x]==='f') ctx.drawImage(assets.flowerSprites,frame*16,0,16,16,x*16,y*16,16,16);
    }
  }
}

/** Vergleicht Fußpunkte für natürliche Verdeckung. @param {object} first Erstes Element. @param {object} second Zweites Element. */
export function compareDepth(first,second) { return first.depth-second.depth; }

/** Zeichnet einen unveränderten Ausschnitt pixelgenau aus dem LCD-Tileset. @param {object} render Zeicheninformationen. @param {number} sx Quell-X. @param {number} sy Quell-Y. @param {number} x Ziel-X. @param {number} y Ziel-Y. @param {number} w Breite. @param {number} h Höhe. */
function stamp(render,sx,sy,x,y,w=16,h=16) { render.ctx.drawImage(render.assets.overworld,sx,sy,w,h,x,y,w,h); }

/** Hält den statischen Kartenboden in einer kleinen Zeichenfläche. @param {object} render Zeicheninformationen. */
function drawGround(render) {
  const room = render.game.room;
  if (!floors.has(room)) {
    const surface = document.createElement('canvas'); surface.width = room.width*16; surface.height = room.height*16;
    const context = surface.getContext('2d'); context.imageSmoothingEnabled = false;
    const groundRender = {...render,ctx:context};
    for (let y = 0; y < room.height; y++) for (let x = 0; x < room.width; x++) drawCell(groundRender,x,y);
    floors.set(room,surface);
  }
  render.ctx.drawImage(floors.get(room),0,0);
}

/** Zeichnet Gelände und passende Wegkanten aus denselben Kartendaten wie die Kollision. @param {object} render Zeicheninformationen. @param {number} x Spalte. @param {number} y Zeile. */
function drawCell(render,x,y) {
  const ground = render.game.room.ground, kind = ground[y][x], xx=x*16, yy=y*16;
  rect(render.ctx,0,xx,yy,16,16);
  if (kind==='r' && render.game.room.villageLandscape) return drawEastRock(render,x,y);
  if (kind==='g' || kind==='e') return drawBareGround(render,x,y,kind);
  if (kind==='r' || kind==='c') return drawNorthCell(render,x,y);
  if (kind === 'w' || kind === 'b') return drawCanal(render,x,y,kind);
  if (kind === 'p') return render.ctx.drawImage(render.assets.villageTiles,0,240,16,16,xx,yy,16,16);
  if (kind === '.') {
    const left = ['.','p','b'].includes(ground[y]?.[x-1]), right = ['.','p','b'].includes(ground[y]?.[x+1]);
    const up = ['.','p','b'].includes(ground[y-1]?.[x]), down = ['.','p','b'].includes(ground[y+1]?.[x]);
    return drawPatch(render,x,y,{left:!left,right:!right,top:!up,bottom:!down},256);
  }
  if (['f','t','h'].includes(kind)) drawPlantCell(render,x,y,kind);
}

/** Verbindet Beete und hohe Wiesen mit passenden oberen und seitlichen Abschlüssen. @param {object} render Zeicheninformationen. @param {number} x Spalte. @param {number} y Zeile. @param {string} kind Pflanzentyp. */
function drawPlantCell(render,x,y,kind) {
  const room=render.game.room;
  const edges={left:!plantNeighbor(room,x-1,y,kind),right:!plantNeighbor(room,x+1,y,kind),top:!plantNeighbor(room,x,y-1,kind),bottom:!plantNeighbor(room,x,y+1,kind)};
  drawGardenPatch(render,x,y,edges);
  if (kind==='t') drawGrass(render,x,y,edges);
  if (kind==='h') drawHedge(render,x*16,y*16,edges);
}

/** Schließt sichtbare Pflanzenränder auch vor den verdeckenden Baumfüßen. @param {object} room Raum. @param {number} x Nachbarspalte. @param {number} y Nachbarzeile. @param {string} kind Pflanzentyp. */
function plantNeighbor(room,x,y,kind) {
  if (room.ground[y]?.[x]!==kind) return false;
  for (const [tx,ty] of room.trees) if (y===ty+1 && x>=tx && x<=tx+1) return false;
  return true;
}

/** Verwendet für alle Pflanzflächen denselben vollständigen Neun-Kachel-Rahmen aus Awakening v2. @param {object} render Zeicheninformationen. @param {number} x Spalte. @param {number} y Zeile. @param {object} edges Außenkanten. */
function drawGardenPatch(render,x,y,edges) {
  for (const yy of [0,8]) for (const xx of [0,8]) {
    const col=edges.left && edges.right?(xx===0?0:2):edges.left?0:edges.right?2:1;
    const row=edges.top && edges.bottom?(yy===0?0:2):edges.top?0:edges.bottom?2:1;
    render.ctx.drawImage(render.assets.villageTiles,112+col*16+xx,80+row*16+yy,8,8,x*16+xx,y*16+yy,8,8);
  }
}

/** Ergänzt echte Awakening-Grashalme innerhalb der geschlossenen Wiesenränder. @param {object} render Zeicheninformationen. @param {number} x Spalte. @param {number} y Zeile. @param {object} edges Außenkanten. */
function drawGrass(render,x,y,edges) {
  const {ctx,assets}=render,left=edges.left?4:0,top=edges.top?4:0;
  ctx.save(); ctx.beginPath(); ctx.rect(x*16+left,y*16+top,16-left-(edges.right?4:0),16-top-(edges.bottom?4:0)); ctx.clip();
  ctx.drawImage(assets.grassSprites,(x%2)*16,(y%2)*16,16,16,x*16,y*16,16,16); ctx.restore();
}

/** Wählt auch für ein Feld breite Streifen und einzelne Felder vollständige Randabschlüsse. @param {object} render Zeicheninformationen. @param {number} x Spalte. @param {number} y Zeile. @param {object} edges Außenkanten. @param {number} baseY Erste Tileset-Zeile. */
function drawPatch(render,x,y,edges,baseY) {
  for (const yy of [0,8]) for (const xx of [0,8]) {
    const col=edges.left && edges.right?(xx===0?0:2):edges.left?0:edges.right?2:1;
    const row=edges.top && edges.bottom?(yy===0?0:2):edges.top?0:edges.bottom?2:1;
    stamp(render,96+col*16+xx,baseY+row*16+yy,x*16+xx,y*16+yy,8,8);
  }
}

/** Hält dichtes Strauchwerk innerhalb seiner abgerundeten Außenkante. @param {object} render Zeicheninformationen. @param {number} x X. @param {number} y Y. @param {object} edges Außenkanten. */
function drawHedge(render,x,y,edges) {
  const left=edges.left?4:0,right=edges.right?4:0,top=edges.top?4:0,bottom=edges.bottom?4:0;
  render.ctx.save(); render.ctx.beginPath(); render.ctx.rect(x+left,y+top,16-left-right,16-top-bottom); render.ctx.clip();
  render.ctx.drawImage(render.assets.villageTiles,128,16,16,16,x,y,16,16); render.ctx.restore();
}

/** Zeichnet den Mühlgraben mit steinernen Ufern und Holzsteg. @param {object} render Zeicheninformationen. @param {number} x Spalte. @param {number} y Zeile. @param {string} kind Bodentyp. */
function drawCanal(render,x,y,kind) {
  stamp(render,480,0,x*16,y*16);
  if (kind === 'b') {
    rect(render.ctx,2,x*16,y*16,16,16);
    for (let line=0;line<16;line+=4) rect(render.ctx,1,x*16,y*16+line,16,2);
    if (render.game.room.ground[y-1]?.[x] !== 'b') rect(render.ctx,3,x*16,y*16,16,2);
    if (render.game.room.ground[y+1]?.[x] !== 'b') rect(render.ctx,3,x*16,y*16+14,16,2);
  } else {
    rect(render.ctx,2,x*16+(x===17?0:14),y*16,2,16);
    rect(render.ctx,0,x*16+(x===17?2:13),y*16,1,16);
  }
}

/** Zeichnet eine sortierte Landschaftsebene. @param {object} render Zeicheninformationen. @param {object} entry Element. */
function drawEntry(render,entry) {
  if (entry.sleeping) return drawSleepingPet(render,entry);
  if (entry.type==='fetch-stick') return drawFetchStick(render);
  if (entry.type==='perch') return drawAwakeningAnimal(render,entry,entry.x*16,entry.y*16);
  if (entry.type==='tree' && entry.pine) return render.ctx.drawImage(render.assets.pineSprite,entry.x*16,entry.y*16);
  if (entry.type === 'tree') return render.ctx.drawImage(render.assets.roundTreeSprite,entry.x*16,entry.y*16);
  if (entry.type === 'house') return drawHouse(render,entry);
  if (entry.type === 'player') { drawVillageHero(render,entry); drawFoliageMask(render,entry); return; }
  if (!drawVillageObject(render,entry)) drawObject(render,entry);
  if (['cat','dog','wildlife','discovery-chest'].includes(entry.kind)) drawFoliageMask(render,entry);
  drawDiscoveryStatus(render,entry);
}

/** Setzt Gebäude aus originalen Dach- und Fassadenteilen zusammen. @param {object} render Zeicheninformationen. @param {object} house Gebäude. */
function drawHouse(render,house) {
  const xx=house.x*16, yy=house.y*16, roofRows=house.h-2;
  for (let y=0;y<house.h;y++) {
    for (let x=0;x<house.w;x++) {
      const edge=x===0?0:x===house.w-1?48:16+(x%2)*16;
      const sx=y<roofRows?752+edge:896;
      const sy=y<roofRows?(y===0?16:32):80;
      render.ctx.drawImage(render.assets.villageTiles,sx,sy,16,16,xx+x*16,yy+y*16,16,16);
    }
  }
  for (const x of [1,house.w-2]) drawWindow(render,xx+x*16,yy+(house.h-2)*16);
  rect(render.ctx,3,xx,yy+roofRows*16-2,house.w*16,2);
  if (house.id === 'guild') drawBanners(render,xx,yy);
  if (house.id === 'mill') drawWheel(render,xx-16,yy+32);
}

/** Zeichnet ein kleines Fenster mit Holzrahmen und heller Spiegelung. @param {object} render Zeicheninformationen. @param {number} x X. @param {number} y Y. */
function drawWindow(render,x,y) {
  rect(render.ctx,3,x+3,y+3,10,12); rect(render.ctx,0,x+4,y+4,8,9);
  rect(render.ctx,2,x+7,y+4,2,9); rect(render.ctx,2,x+4,y+8,8,2);
  rect(render.ctx,1,x+1,y+14,14,2);
}

/** Zeichnet die zwei Gildenbanner mit zurückhaltender Bewegung. @param {object} render Zeicheninformationen. @param {number} x Gebäude-X. @param {number} y Gebäude-Y. */
function drawBanners(render,x,y) {
  const offset = render.game.reduced ? 0 : Math.floor(render.game.time*2)%2;
  for (const side of [8,72]) {
    rect(render.ctx,3,x+side,y+34,14,2); rect(render.ctx,2,x+side+2,y+36,10,20);
    rect(render.ctx,0,x+side+6,y+39,2,12); rect(render.ctx,0,x+side+4,y+43,6,2);
    rect(render.ctx,0,x+side+2+offset,y+55,2,2);
  }
}

/** Zeichnet das erst nach dem Öffnen des Wehrs bewegte Mühlrad. @param {object} render Zeicheninformationen. @param {number} x Rad-X. @param {number} y Rad-Y. */
function drawWheel(render,x,y) {
  const {ctx,game}=render;
  rect(ctx,3,x+3,y,10,32); rect(ctx,1,x+5,y+2,6,28);
  const phase=game.flags.waterFlowing && !game.reduced ? Math.floor(game.time*8)%6 : 0;
  for (let i=0;i<5;i++) { const yy=y+(i*6+phase)%30; rect(ctx,3,x,yy,16,3); rect(ctx,0,x+1,yy,14,1); }
  rect(ctx,3,x+6,y+13,4,6);
}

/** Zeichnet eine native 16-Pixel-Figur mit vier Laufrichtungen. @param {object} render Zeicheninformationen. @param {object} player Interpolierte Figur. */
export function drawVillageHero(render,player) {
  const {ctx,game,assets}=render, facing=game.player.facing;
  const frame=game.move?Math.floor(game.move.time/0.09)%2:0;
  const sx=facing==='up'?32:facing==='left'||facing==='right'?64:0;
  const bob=game.avatar==='female' && game.move && !game.reduced && ['up','down'].includes(facing)?frame:0;
  ctx.save(); ctx.translate(Math.round(player.x*16),Math.round(player.y*16)-bob);
  if (facing==='left') { ctx.translate(16,0); ctx.scale(-1,1); }
  ctx.drawImage(assets.heroes[game.avatar],sx+frame*16,0,16,16,0,0,16,16); ctx.restore();
}

/** Zeichnet dorfbezogene Requisiten; meldet unbekannte Objekte an den bestehenden Renderer zurück. @param {object} render Zeicheninformationen. @param {object} object Requisite. */
function drawVillageObject(render,object) {
  const x=Math.round((object.drawX ?? object.x)*16),y=Math.round((object.drawY ?? object.y)*16),{ctx,game}=render;
  if (drawEastProp(render,object)) return true;
  if (object.kind==='trail') {
    const direction=object.to==='village' || object.to==='east-wood'?-1:1;
    rect(ctx,2,x+5,y+7,6,1); rect(ctx,2,x+(direction<0?4:11),y+6,1,3); return true;
  }
  if (object.kind==='cave-entry') return true;
  if (object.kind==='discovery-chest') { drawDiscoveryChest(render,object); return true; }
  if (object.id==='keeper') { drawKeeper(render,object,object.drawX*16,object.drawY*16); return true; }
  if (object.kind==='well') { drawWell(ctx,x,y); return true; }
  if (['host','resident','dog','wildlife'].includes(object.kind)) { drawResident(render,object,x,y); return true; }
  if (object.kind==='cat') { drawCat(render,object,x,y); return true; }
  if (object.kind==='gate') { drawGate(render,object,x,y); return true; }
  if (object.kind==='branch') { drawBranch(ctx,x,y); return true; }
  if (object.kind.startsWith('village-')) { drawVillageProp(render,object,x,y); return true; }
  if (object.kind==='sign') { drawSign(ctx,x,y); return true; }
  if (object.id==='guild-door' && game.flags.guildOpen) { rect(ctx,3,x,y,16,16); rect(ctx,1,x+2,y+14,12,2); return true; }
  return false;
}

/** Zeichnet Holzbank, Vorräte und Kübel mit zusammengehörigen Konturen. @param {object} render Zeicheninformationen. @param {object} object Requisite. @param {number} x X. @param {number} y Y. */
function drawVillageProp(render,object,x,y) {
  const {ctx}=render;
  if (object.kind==='village-post') return stamp(render,16,0,x,y);
  if (object.kind==='village-barrel') return stamp(render,64,0,x,y);
  const width=object.w*16;
  rect(ctx,3,x+2,y+5,width-4,7); rect(ctx,1,x+3,y+6,width-6,2);
  rect(ctx,0,x+3,y+10,width-6,1);
  if (object.kind==='village-bench') { rect(ctx,3,x+4,y+12,3,4); rect(ctx,3,x+width-7,y+12,3,4); }
  else for (let xx=4;xx<width-3;xx+=7) { rect(ctx,3,x+xx,y+3,5,10); rect(ctx,0,x+xx+1,y+4,3,2); }
}

/** Zeichnet einen steinernen Brunnen mit dunkler Öffnung und einzelnen Fugen. @param {CanvasRenderingContext2D} ctx Kontext. @param {number} x X. @param {number} y Y. */
function drawWell(ctx,x,y) {
  rect(ctx,3,x+4,y+8,24,19); rect(ctx,2,x+2,y+10,28,13);
  rect(ctx,0,x+4,y+6,24,15); rect(ctx,1,x+4,y+18,24,6);
  rect(ctx,3,x+8,y+7,16,9); rect(ctx,2,x+10,y+9,12,5); rect(ctx,0,x+12,y+10,7,1);
  for (const xx of [8,17,25]) rect(ctx,2,x+xx,y+17,1,7);
  rect(ctx,3,x+4,y+25,24,2); rect(ctx,2,x+3,y+15,4,1); rect(ctx,2,x+26,y+13,3,1);
}

/** Zeichnet ein hölzernes Schild einschließlich lesbarem Schriftmuster. @param {CanvasRenderingContext2D} ctx Kontext. @param {number} x X. @param {number} y Y. */
function drawSign(ctx,x,y) {
  rect(ctx,3,x+7,y+8,3,8); rect(ctx,3,x+1,y+1,14,10); rect(ctx,0,x+2,y+2,12,7);
  rect(ctx,2,x+4,y+4,8,1); rect(ctx,2,x+4,y+6,6,1);
}

/** Zeichnet einen gut erkennbaren querliegenden Ast. @param {CanvasRenderingContext2D} ctx Kontext. @param {number} x X. @param {number} y Y. */
function drawBranch(ctx,x,y) {
  rect(ctx,3,x-2,y+8,23,4); rect(ctx,3,x+18,y+6,22,4);
  rect(ctx,1,x-1,y+8,20,1); rect(ctx,1,x+20,y+6,18,1);
  for (let i=0;i<3;i++) { rect(ctx,3,x+9+i*2,y+3+i*2,3,3); rect(ctx,3,x+28+i*2,y+9+i*2,3,3); }
  rect(ctx,2,x+3,y+10,3,1); rect(ctx,2,x+25,y+8,2,1);
}

/** Zeichnet eine Katze mit Schwanzwechsel und kurzen Laufschritten. @param {object} render Zeicheninformationen. @param {object} object Tierzustand. @param {number} x X. @param {number} y Y. */
function drawCat(render,object,x,y) {
  const {ctx,game}=render,pose=game.reduced?0:Math.floor(game.time/2)%2;
  ctx.save(); ctx.translate(x,y);
  if (object.facing==='left') { ctx.translate(16,0); ctx.scale(-1,1); }
  x=0; y=0;
  rect(ctx,3,x+3,y+9,10,5); rect(ctx,2,x+4,y+9,8,3);
  rect(ctx,3,x+9,y+5,6,6); rect(ctx,3,x+9,y+3,2,3); rect(ctx,3,x+13,y+3,2,3);
  rect(ctx,0,x+10,y+7,1,1); rect(ctx,0,x+13,y+7,1,1); rect(ctx,3,x+1,y+7-pose*2,2,6);
  const stride=object.walking?Math.floor(game.time*12)%2:0;
  rect(ctx,3,x+4+stride,y+13,2,2); rect(ctx,3,x+10-stride,y+13,2,2); ctx.restore();
}
