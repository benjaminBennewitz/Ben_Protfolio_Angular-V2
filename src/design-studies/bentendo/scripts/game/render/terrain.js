import { drawDungeonCell } from './dungeon.js';
import { drawCaveCell } from './cave.js';
import { rect, tile } from './primitives.js';
import { wall, water, steamHot } from '../systems/collision.js';

/** Zeichnet den erhaltenen Raumgrundriss. @param {object} render Zeicheninformationen. */
export function terrain(render) {
  const { game, ctx } = render, room = game.room;
  for (let y = 0; y < room.height; y++) {
    for (let x = 0; x < room.width; x++) drawCell(render, x, y);
  }
  if (room.houses) for (const house of room.houses) drawHouse(ctx, house);
  if (room.trees) for (const tree of room.trees) drawTree(ctx, tree[0], tree[1]);
}

/** Zeichnet Boden, Wasser oder Wand. @param {object} render Zeicheninformationen. @param {number} x Spalte. @param {number} y Zeile. */
function drawCell(render, x, y) {
  const { game, ctx } = render, room = game.room;
  if (room.id === 'city' || room.trees) return drawOutdoor(render, x, y);
  if (room.dungeon) return drawDungeonCell(render,x,y);
  if (room.cavern && drawCaveCell(render,x,y)) return;
  tile(render, 128, 96, x * 16, y * 16);
  if ((room.id === 'archive' || room.puzzle==='archive') && wall(game,x,y) && x>0 && y>0 && x<17 && y<13) return drawArchiveWall(ctx,x,y);
  if (wall(game, x, y)) {
    rect(ctx, 3, x*16, y*16, 16, 16); rect(ctx, 2, x*16+1, y*16+2, 14, 12);
    rect(ctx, 1, x*16+1, y*16+2, 14, 2); rect(ctx, 3, x*16+1, y*16+8, 14, 1);
  }
  if (steamHot(game, x, y)) {
    for (let i = 0; i < 3; i++) rect(ctx, 0, x*16+3+i*4, y*16+3+(i%2)*3, 2, 8);
  }
}

/** Zeichnet den Außenboden ohne künstliche Steinbegrenzung. @param {object} render Zeicheninformationen. @param {number} x Spalte. @param {number} y Zeile. */
function drawOutdoor(render, x, y) {
  const { ctx, game } = render, room = game.room, xx = x*16, yy = y*16;
  rect(ctx, 1, xx, yy, 16, 16);
  const path = room.id === 'city' ? (x >= 13 && x <= 16) || (y >= 11 && y <= 13) || ([9,21,27].includes(y) && x >= 5 && x <= 25) || ([6,22].includes(x) && y >= 9 && y <= 27) : x >= 14 && x <= 16;
  if (path) rect(ctx, 0, xx, yy, 16, 16);
  else { rect(ctx, 2, xx+4, yy+8, 1, 3); rect(ctx, 0, xx+3, yy+7, 1, 2); }
  if (!path && (x+y)%7 === 0) { rect(ctx, 0, xx+9, yy+3, 3, 3); rect(ctx, 3, xx+10, yy+4, 1, 1); }
  if (water(room, x, y)) { rect(ctx, 2, xx, yy, 16, 16); rect(ctx, 0, xx+3, yy+5, 8, 1); rect(ctx, 1, xx+8, yy+11, 5, 1); }
  if (room.id === 'city' && x >= 26 && x <= 30 && [12,13].includes(y)) {
    rect(ctx, 2, xx, yy, 16, 16); for (let i = 2; i < 16; i += 4) rect(ctx, 1, xx+i, yy, 2, 16);
  }
}

/** Zeichnet ein Gebäude als zusammenhängenden Körper. @param {CanvasRenderingContext2D} ctx Kontext. @param {object} house Gebäude. */
function drawHouse(ctx, house) {
  const x = house.x*16, y = house.y*16;
  rect(ctx, 3, x-1, y+14, 82, 66); rect(ctx, 0, x+1, y+16, 78, 62);
  for (let yy = 22; yy < 76; yy += 12) rect(ctx, 1, x+1, y+yy, 78, 1);
  rect(ctx, 2, x, y, 80, 29);
  for (let yy = 2; yy < 28; yy += 6) for (let xx = 2; xx < 78; xx += 8) rect(ctx, 1, x+xx, y+yy, 5, 1);
  rect(ctx, 3, x+8, y-10, 10, 20);
  for (const xx of [8,57]) { rect(ctx, 3, x+xx, y+43, 14, 15); rect(ctx, 1, x+xx+2, y+45, 10, 11); }
  if (house.floors > 1) { rect(ctx, 3, x+31, y+31, 16, 11); rect(ctx, 1, x+33, y+33, 12, 7); }
}

/** Zeichnet einen Baum mit klarer Stammposition. @param {CanvasRenderingContext2D} ctx Kontext. @param {number} x Spalte. @param {number} y Zeile. */
function drawTree(ctx, x, y) {
  x *= 16; y *= 16;
  rect(ctx, 3, x+6, y+3, 4, 13); rect(ctx, 3, x-3, y-17, 23, 24);
  rect(ctx, 2, x-5, y-19, 23, 20); rect(ctx, 0, x-1, y-16, 8, 3); rect(ctx, 1, x+2, y-10, 13, 7);
}

/** Kennzeichnet feste Archivtrennwände als Bücherregale. @param {CanvasRenderingContext2D} ctx Kontext. @param {number} x Spalte. @param {number} y Zeile. */
function drawArchiveWall(ctx,x,y) {
  x *= 16; y *= 16;
  rect(ctx,3,x,y,16,16); rect(ctx,2,x+1,y+1,14,14);
  for (const row of [2,9]) {
    rect(ctx,3,x+1,y+row+5,14,2);
    for (let i = 0; i < 5; i++) rect(ctx,i%2?0:1,x+2+i*3,y+row,2,5);
  }
}
