import { drawDungeonChest } from './dungeon-atlas.js';
import { drawDungeonProp } from './dungeon.js';
import { drawSourceGate,drawCaveProp } from './cave.js';
import { rect } from './primitives.js';

/** Zeichnet vorhandene Objekte und animierte Möbel. @param {object} render Zeicheninformationen. */
export function drawObjects(render) {
  const objects=render.game.objects;
  for (const object of objects) if (object.passable) drawObject(render,object);
  for (const object of objects) if (!object.passable) drawObject(render,object);
}

/** Zeichnet einen benannten Gegenstand. @param {object} render Zeicheninformationen. @param {object} object Gegenstand. */
export function drawObject(render, object) {
  if (render.game.room.dungeon && object.kind==='chest') return drawDungeonChest(render,object);
  if (object.kind.startsWith('dungeon-') || object.kind==='loot-bag') return drawDungeonProp(render,object);
  if (object.kind.startsWith('cave-')) return drawCaveProp(render,object);
  if (object.kind==='source-gate') return drawSourceGate(render,object);
  const { ctx, game } = render;
  let x = object.x*16, y = object.y*16;
  if (game.slide?.block === object) {
    const p = Math.min(1, game.slide.time / 0.28);
    x = (game.slide.fromX + (object.x-game.slide.fromX)*p)*16;
    y = (game.slide.fromY + (object.y-game.slide.fromY)*p)*16;
  }
  if (object.kind === 'chest' && game.roomState.taken.has(object.id)) return drawOpenedChest(ctx,x,y);
  if (object.kind === 'npc') return drawNpc(render, x, y);
  if (object.kind === 'note' || object.kind === 'rune') return drawNote(ctx, x, y);
  if (['door','trail','stairs'].includes(object.kind)) return drawDoor(ctx, object.kind, x, y);
  if (['shelf','bookshelf'].includes(object.kind)) return drawShelf(ctx, object, x, y);
  drawProp(ctx, object, x, y);
}

/** Zeichnet den erhaltenen Hausmeister-Sprite. @param {object} render Zeicheninformationen. @param {number} x X. @param {number} y Y. */
function drawNpc(render, x, y) { render.ctx.drawImage(render.assets.goblin, x-1, y-6, 18, 23); }

/** Zeichnet ein kleines, unaufdringliches Blatt. @param {CanvasRenderingContext2D} ctx Kontext. @param {number} x X. @param {number} y Y. */
function drawNote(ctx, x, y) {
  rect(ctx, 2, x+4, y+6, 8, 6); rect(ctx, 0, x+5, y+7, 5, 1); rect(ctx, 3, x+6, y+9, 4, 1);
}

/** Zeichnet Türen und Treppen einheitlich. @param {CanvasRenderingContext2D} ctx Kontext. @param {string} kind Typ. @param {number} x X. @param {number} y Y. */
function drawDoor(ctx, kind, x, y) {
  rect(ctx, 3, x+1, y, 14, 16); rect(ctx, 2, x+3, y+2, 10, 14);
  if (kind === 'stairs') for (let i = 0; i < 4; i++) rect(ctx, 0, x+i*3, y+12-i*3, 16-i*3, 2);
  else rect(ctx, 0, x+10, y+8, 2, 2);
}

/** Zeichnet feste und rollbare Bücherregale. @param {CanvasRenderingContext2D} ctx Kontext. @param {object} object Regal. @param {number} x X. @param {number} y Y. */
function drawShelf(ctx, object, x, y) {
  const height = (object.h || 1)*16;
  rect(ctx, 3, x+1, y+1, 14, height-1); rect(ctx, 2, x+2, y+2, 12, height-4);
  for (let yy = 3; yy < height-4; yy += 8) {
    for (let i = 0; i < 4; i++) rect(ctx, i%2 ? 0 : 1, x+3+i*3, y+yy, 2, 5);
    rect(ctx, 3, x+2, y+yy+5, 12, 2);
  }
}

/** Zeichnet einfache Prototyp-Requisiten. @param {CanvasRenderingContext2D} ctx Kontext. @param {object} object Gegenstand. @param {number} x X. @param {number} y Y. */
function drawProp(ctx, object, x, y) {
  rect(ctx, 3, x+2, y+3, 12, 12); rect(ctx, 2, x+3, y+4, 10, 9);
  if (object.kind === 'sign') { rect(ctx, 0, x+2, y+2, 13, 7); rect(ctx, 3, x+4, y+4, 9, 1); }
  else if (object.kind === 'animal') { rect(ctx, 1, x+1, y+1, 14, 15); rect(ctx, 3, x+3, y+8, 10, 5); rect(ctx, 3, x+10, y+4, 4, 6); }
  else if (object.kind === 'valve' || object.kind === 'lever') { rect(ctx, 0, x+7, y+1, 2, 11); rect(ctx, 1, x+4, y+3, 8, 2); }
  else { rect(ctx, 1, x+3, y+5, 10, 2); rect(ctx, 3, x+6, y+9, 3, 3); }
}

/** Zeigt eine bereits geplünderte Truhe sichtbar offen. @param {CanvasRenderingContext2D} ctx Kontext. @param {number} x X. @param {number} y Y. */
function drawOpenedChest(ctx,x,y) {
  rect(ctx,3,x+1,y+1,14,5); rect(ctx,1,x+3,y+2,10,2);
  rect(ctx,3,x+1,y+8,14,7); rect(ctx,2,x+3,y+10,10,3);
}
