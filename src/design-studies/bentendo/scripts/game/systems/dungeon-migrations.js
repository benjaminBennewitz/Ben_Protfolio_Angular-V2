import { wall,contains } from './collision.js';

/** Versetzt ausschließlich alte Gewölbepositionen aus neuen Mauern; Gegenstände und Questwerte bleiben erhalten. @param {object} game Spiel. @param {object} data Unveränderter Speicherstand. */
export function migrateDungeonSave(game,data) {
  if (!data || typeof data!=='object' || data.dungeonRevision>=3) return data;
  const saved=structuredClone(data),room=game.rooms.get(saved.room);
  if (room?.dungeon) {
    relocate(room,saved.player,saved.flags);
    const occupied=new Set();
    for (const actor of Array.isArray(saved.combat?.enemies)?saved.combat.enemies:[]) {
      if (!actor || typeof actor!=='object') continue;
      if (relocate(room,actor,saved.flags,occupied)) { actor.fromX=actor.x; actor.fromY=actor.y; actor.walk=0; }
      occupied.add(`${actor.x},${actor.y}`);
      const from={x:actor.fromX,y:actor.fromY};
      if (relocate(room,from,saved.flags)) { actor.fromX=actor.x; actor.fromY=actor.y; actor.walk=0; }
    }
    for (const heart of Array.isArray(saved.combat?.hearts)?saved.combat.hearts:[]) relocate(room,heart,saved.flags);
  }
  const lost=saved.health?.lost,lostRoom=game.rooms.get(lost?.room);
  if (lostRoom?.dungeon) relocate(lostRoom,lost,saved.flags);
  saved.dungeonRevision=3; return saved;
}

/** Akzeptiert nur früher tatsächlich begehbare Rasterfelder als Migrationsquelle. @param {object} room Raum. @param {object} point Speicherposition. */
function legacyFloor(room,point) {
  const x=point?.x,y=point?.y;
  if (!Number.isInteger(x) || !Number.isInteger(y) || x<1 || x>=room.width-1 || y<2 || y>=room.height-2) return false;
  if (room.id==='quell-sluice' && x===8 && y!==6) return false;
  return room.id!=='quell-gallery' || ![[6,3],[6,4],[10,7],[10,8]].some(samePoint.bind(null,x,y));
}

/** Vergleicht eine frühere Mauerzelle. @param {number} x Spalte. @param {number} y Zeile. @param {number[]} point Mauerposition. */
function samePoint(x,y,point) { return point[0]===x && point[1]===y; }

/** Findet das nächste freie Feld innerhalb der echten Karte ohne neue Beute oder Fortschrittsänderung. @param {object} room Raum. @param {object} point Position. @param {object} flags Questwerte. @param {Set} occupied Reservierte Gegnerfelder. */
function relocate(room,point,flags,occupied=new Set()) {
  if (!legacyFloor(room,point) || freeFloor(room,point.x,point.y,flags) && !occupied.has(`${point.x},${point.y}`)) return false;
  const queue=[[point.x,point.y]],seen=new Set();
  for (let index=0;index<queue.length;index++) {
    const [x,y]=queue[index],key=`${x},${y}`;
    if (seen.has(key) || x<1 || y<2 || x>=room.width-1 || y>=room.height-2) continue;
    seen.add(key);
    if (freeFloor(room,x,y,flags) && !occupied.has(key)) { point.x=x; point.y=y; return true; }
    for (const [dx,dy] of [[0,1],[1,0],[-1,0],[0,-1]]) queue.push([x+dx,y+dy]);
  }
  return false;
}

/** Schließt Mauern, Säulen und sichtbare Einrichtungsfüße aus. @param {object} room Raum. @param {number} x Spalte. @param {number} y Zeile. @param {object} flags Questwerte. */
function freeFloor(room,x,y,flags) {
  if (wall({room,flags},x,y)) return false;
  for (const object of room.objects) {
    if (object.passable || object.walkThrough || object.revealedBy && !flags?.[object.revealedBy] || object.hiddenBy && flags?.[object.hiddenBy]) continue;
    if (contains(object,x,y)) return false;
  }
  return true;
}
