import { passageArea } from '../data/forest-passages.js';

/** Wechselt beim Hinauslaufen am offenen Waldwegrand zum passenden Gegenstück. @param {object} game Spiel. @param {number} x Zielspalte. @param {number} y Zielzeile. */
export function leaveForestAtEdge(game,x,y) {
  const room=game.room;
  if (!room.villageLandscape || !room.id.startsWith('east-')) return false;
  if (x!==0 && y!==0 && x!==room.width-1 && y!==room.height-1) return false;
  for (const exit of room.objects) {
    if (exit.kind!=='trail' || exit.action!=='travel') continue;
    const area=passageArea(room,exit);
    if (x<area.x || y<area.y || x>=area.x+area.w || y>=area.y+area.h) continue;
    game.travel(exit.to,exit.spawn); return true;
  }
  return false;
}
