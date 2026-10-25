import { dungeonTile,drawDungeonPillar } from './dungeon-atlas.js';
import { drawDungeonFurniture } from './dungeon-furniture.js';
import { drawDungeonGround,drawDungeonWall,drawWeb } from './dungeon-scenery.js';
import { drawDungeonPassage } from './dungeon-passages.js';
import { rect } from './primitives.js';

const ENEMY_ART={spider:624,beetle:640,snake:528};

/** Zeichnet native Steinplatten, echte Wandabschlüsse und sparsame Spinnennetze. @param {object} render Zeicheninformationen. @param {number} x Spalte. @param {number} y Zeile. */
export function drawDungeonCell(render,x,y) {
  if (render.game.room.layout[y][x]==='#') drawDungeonWall(render,x,y);
  else drawDungeonGround(render,x,y);
}

/** Zeigt ausschließlich Dungeon-Gegner mit nativen Sprites und verletzungsabhängigen Lebensbalken. @param {object} render Zeicheninformationen. */
export function drawEnemies(render) {
  const {ctx,game,assets}=render;
  for (const actor of game.enemies || []) {
    const p=game.reduced?1:1-Math.max(0,actor.walk || 0)/0.2;
    const x=Math.round(((actor.fromX ?? actor.x)+(actor.x-(actor.fromX ?? actor.x))*p)*16),y=Math.round(((actor.fromY ?? actor.y)+(actor.y-(actor.fromY ?? actor.y))*p)*16);
    const frame=game.reduced?0:Math.floor(game.time*6)%2;
    ctx.save(); ctx.translate(x,y);
    if (actor.facing==='left') { ctx.translate(16,0); ctx.scale(-1,1); }
    ctx.drawImage(assets.villagers,ENEMY_ART[actor.species],frame*16,16,16,0,0,16,16); ctx.restore();
    if (actor.hp<actor.maxHp || actor.windup>0) {
      rect(ctx,3,x+1,y-4,14,3); rect(ctx,0,x+2,y-3,Math.ceil(12*actor.hp/actor.maxHp),1);
    }
    if (actor.windup>0) { rect(ctx,3,x+7,y-10,2,4); rect(ctx,3,x+7,y-5,2,1); }
  }
}

/** Zeichnet Beutel, Gitter, Nest und Druckplatte mit klar unterschiedlichen Silhouetten. @param {object} render Zeicheninformationen. @param {object} object Einrichtung. */
export function drawDungeonProp(render,object) {
  if (object.kind==='dungeon-pillar') return drawDungeonPillar(render,object);
  if (drawDungeonPassage(render,object) || drawDungeonFurniture(render,object)) return;
  const {ctx}=render,x=object.x*16,y=object.y*16;
  if (object.kind==='dungeon-plate') { rect(ctx,3,x+1,y+8,14,7); rect(ctx,0,x+2,y+9,12,4); return; }
  if (object.kind==='dungeon-grate') { dungeonTile(render,68,x,y); return; }
  if (object.kind==='dungeon-nest') { drawWeb(ctx,x+1,y+1); rect(ctx,3,x+5,y+6,6,6); rect(ctx,1,x+6,y+7,4,3); return; }
  rect(ctx,3,x+3,y+5,10,10); rect(ctx,1,x+4,y+6,8,7); rect(ctx,3,x+5,y+3,6,3); rect(ctx,0,x+7,y+7,2,5);
}
