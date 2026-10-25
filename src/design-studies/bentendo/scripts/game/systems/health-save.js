import { wall,contains } from './collision.js';
import { createHealth } from './health.js';

/** Prüft den optionalen Lebensstand; alte Speicherstände beginnen unverändert mit vollen Herzen. @param {object} game Spiel. @param {object} data Speicherstand. */
export function validHealthSave(game,data) {
  const health=data.health;
  if (health===undefined) return true;
  if (!health || typeof health.hp!=='number' || !Number.isSafeInteger(health.hp*2) || !Number.isSafeInteger(health.maxHp) || health.maxHp!==6 || health.hp<0.5 || health.hp>health.maxHp) return false;
  if (!Number.isSafeInteger(health.deaths) || health.deaths<0) return false;
  return validRun(game,health.run,data.room) && validLost(game,health.lost,data.flags);
}

/** Prüft den Beute-Ausgangsstand gegen die aktuelle Dungeonzugehörigkeit. @param {object} game Spiel. @param {object} run Lauf oder null. @param {string} roomId Raumkennung. */
function validRun(game,run,roomId) {
  const dungeon=game.rooms.get(roomId)?.dungeon;
  if (run===null) return !dungeon;
  return Boolean(run && dungeon && run.dungeon===dungeon && itemList(run.inventory) && Number.isSafeInteger(run.coins) && run.coins>=0);
}

/** Verhindert verlorene Beutel in Wänden, unbekannten Räumen oder fremden Dungeons. @param {object} game Spiel. @param {object} lost Beutel oder null. @param {object} flags Questwerte. */
function validLost(game,lost,flags) {
  if (lost===null) return true;
  const room=game.rooms.get(lost?.room);
  if (!room?.dungeon || lost.dungeon!==room.dungeon || !itemList(lost.items)) return false;
  if (!Number.isSafeInteger(lost.coins) || lost.coins<0 || (!lost.items.length && !lost.coins)) return false;
  return Number.isInteger(lost.x) && Number.isInteger(lost.y) && !wall({room,flags},lost.x,lost.y);
}

/** Begrenzt persistierte Beute auf die vorhandene Rucksackkapazität. @param {unknown} items Gegenstandsliste. */
function itemList(items) {
  if (!Array.isArray(items) || items.length>6) return false;
  for (const item of items) if (typeof item!=='string' || !item.length || item.length>100) return false;
  return true;
}

/** Migriert alte Stände ohne zusätzliche Speicherfelder außerhalb des bestehenden Save-Formats. @param {object} game Spiel. @param {object} data Speicherstand. */
export function restoreHealth(game,data) {
  game.health=structuredClone(data.health || createHealth());
  relocateLostLoot(game);
  if (!data.health && game.room.dungeon) game.health.run={dungeon:game.room.dungeon,inventory:[...game.inventory],coins:game.coins};
}

/** Verschiebt alte Beutel aus neu eingerichteten Möbeln auf das nächste freie Bodenfeld. @param {object} game Spiel. */
function relocateLostLoot(game) {
  const lost=game.health.lost;
  if (!lost) return;
  const room=game.rooms.get(lost.room),queue=[[lost.x,lost.y]],seen=new Set();
  for (let index=0;index<queue.length;index++) {
    const [x,y]=queue[index],key=`${x},${y}`;
    if (seen.has(key) || x<0 || y<0 || x>=room.width || y>=room.height) continue;
    seen.add(key);
    if (lootFloorFree(game,room,x,y)) { lost.x=x; lost.y=y; return; }
    for (const [dx,dy] of [[0,1],[1,0],[-1,0],[0,-1]]) queue.push([x+dx,y+dy]);
  }
}

/** Prüft Fußabdrücke echter Möbel und bestehender Rollkisten vor dem Versetzen alter Beute. @param {object} game Spiel. @param {object} room Raum. @param {number} x Spalte. @param {number} y Zeile. */
function lootFloorFree(game,room,x,y) {
  if (wall({room,flags:game.flags},x,y)) return false;
  for (const object of [...room.objects,...(game.states.get(room.id)?.blocks || room.blocks || [])]) {
    if (object.passable || object.walkThrough || object.revealedBy && !game.flags[object.revealedBy] || object.hiddenBy && game.flags[object.hiddenBy]) continue;
    if (contains(object,x,y)) return false;
  }
  return true;
}
