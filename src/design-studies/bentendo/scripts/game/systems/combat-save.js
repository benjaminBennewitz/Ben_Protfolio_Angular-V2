import { enemyAt,heroOccupies } from './dungeon-combat.js';
import { wall } from './collision.js';

/** Sichert auch eine laufende Welle, damit Neuladen den Kampf nicht zurücksetzt. @param {object} game Spiel. */
export function captureCombat(game) {
  if (!game.room.dungeon) return null;
  return {hearts:structuredClone(game.heartDrops),enemies:structuredClone(game.enemies),wave:game.nestWave,wait:game.waveWait,hurt:game.hurtTime,cooldown:game.attackCooldown};
}

/** Akzeptiert alte Stände ohne Kampfteil und prüft neue Zustände gegen echte Raumdefinitionen. @param {object} game Spiel. @param {object} data Speicherstand. */
export function validCombatSave(game,data) {
  const combat=data.combat,room=game.rooms.get(data.room);
  if (combat===undefined) return true;
  if (combat===null) return !room.dungeon;
  if (!room.dungeon || !combat || !Array.isArray(combat.enemies) || combat.enemies.length>4) return false;
  if (!Number.isInteger(combat.wave) || combat.wave<0 || combat.wave>3 || (!room.boss && combat.wave!==0)) return false;
  if (!bounded(combat.wait,1.6) || !bounded(combat.hurt,1.1) || !bounded(combat.cooldown,0.38)) return false;
  if (!validHeartDrops(room,data.flags,combat.hearts)) return false;
  const ids=new Set(),points=new Set();
  for (const actor of combat.enemies) {
    const key=`${actor?.x},${actor?.y}`;
    if (!validActor(room,data.flags,actor,combat.wave) || ids.has(actor.id) || points.has(key)) return false;
    ids.add(actor.id); points.add(key);
  }
  return !room.boss || !data.flags.quellNestCleared || !combat.enemies.length;
}

/** Prüft Art, Lebenspunkte und Bewegungsfelder, bevor Gegnerobjekte ins Spiel gelangen. @param {object} room Raum. @param {object} flags Questwerte. @param {object} actor Gegner. @param {number} wave Welle. */
function validActor(room,flags,actor,wave) {
  if (!actor || typeof actor.id!=='string' || !knownActor(room,actor,wave) || !['up','down','left','right'].includes(actor.facing)) return false;
  const max=actor.species==='beetle'?3:2;
  if (actor.maxHp!==max || !Number.isInteger(actor.hp) || actor.hp<1 || actor.hp>max || !floorPoint(room,flags,actor.x,actor.y)) return false;
  if (!bounded(actor.windup,0.5) || !bounded(actor.hurt,0.2) || !bounded(actor.walk || 0,0.2) || !Number.isFinite(actor.wait) || actor.wait < -60 || actor.wait>2) return false;
  if (actor.fromX!==undefined && (!floorPoint(room,flags,actor.fromX,actor.fromY) || Math.abs(actor.x-actor.fromX)+Math.abs(actor.y-actor.fromY)>1)) return false;
  return true;
}

/** Beschränkt frei erzeugte Gegner auf die aktuelle Nestwelle und bekannte Arten. @param {object} room Raum. @param {object} actor Gegner. @param {number} wave Welle. */
function knownActor(room,actor,wave) {
  if (room.boss && wave>0) return wave>0 && actor.species==='spider' && new RegExp(`^wave-${wave}-[0-3]$`,'u').test(actor.id);
  for (const original of room.enemies) if (original.id===actor.id && original.species===actor.species) return true;
  return false;
}

/** Begrenzt kurze nichtnegative Animationstimer. @param {number} value Wert. @param {number} max Obergrenze. */
function bounded(value,max) { return Number.isFinite(value) && value>=0 && value<=max+0.000001; }

/** Verhindert Gegnerpositionen außerhalb der Kollisionskarte. @param {object} room Raum. @param {object} flags Questwerte. @param {number} x Spalte. @param {number} y Zeile. */
function floorPoint(room,flags,x,y) { return Number.isInteger(x) && Number.isInteger(y) && !wall({room,flags},x,y); }

/** Stellt ausschließlich geprüfte flüchtige Kampfwerte nach dem Raumwechsel wieder her. @param {object} game Spiel. @param {object} data Speicherstand. */
export function restoreCombat(game,data) {
  if (!data.combat) return;
  const combat=data.combat;
  const added=(data.roomRevision ?? 1)<2 && ['quell-entry','quell-sluice','quell-refuge','quell-nest'].includes(game.room.id) && combat.wave===0 && (!game.room.boss || !game.flags.quellNestCleared);
  game.heartDrops=structuredClone(combat.hearts || []); game.enemies=structuredClone(added?game.room.enemies:combat.enemies); game.nestWave=combat.wave; game.waveWait=combat.wait;
  game.hurtTime=combat.hurt; game.attackCooldown=combat.cooldown;
  settleRestoredEnemies(game);
}

/** Erhält ungesammelte Herzen beim Neuladen und begrenzt Anzahl, Heilwert und Position. @param {object} room Raum. @param {object} flags Questwerte. @param {object[]} hearts Lebensdrops. */
function validHeartDrops(room,flags,hearts) {
  if (hearts===undefined) return true;
  if (!Array.isArray(hearts) || hearts.length>12) return false;
  const ids=new Set();
  for (const drop of hearts) {
    if (!drop || typeof drop.id!=='string' || ![0.5,1,2].includes(drop.amount) || ids.has(drop.id) || !floorPoint(room,flags,drop.x,drop.y)) return false;
    if (!room.enemies.some(knownDropId.bind(null,drop.id)) && !(room.boss && /^wave-[123]-[0-3]$/u.test(drop.id))) return false;
    ids.add(drop.id);
  }
  return true;
}

/** Prüft Herzdrop-Kennungen gegen die Originalgegner des Raums. @param {string} id Gegnerkennung. @param {object} actor Originalgegner. */
function knownDropId(id,actor) { return actor.id===id; }

/** Versetzt alte Gegnerstände aus neu aufgestellten Möbeln ohne Verlust ihrer Lebenswerte. @param {object} game Spiel. */
function settleRestoredEnemies(game) {
  for (const actor of game.enemies) {
    if (enemyFloorFree(game,actor,actor.x,actor.y)) {
      if (actor.walk && !enemyFloorFree(game,actor,actor.fromX,actor.fromY)) actor.walk=0;
      continue;
    }
    const queue=[[actor.x,actor.y]],seen=new Set();
    for (let index=0;index<queue.length;index++) {
      const [x,y]=queue[index],key=`${x},${y}`;
      if (seen.has(key) || x<0 || y<0 || x>=game.room.width || y>=game.room.height) continue;
      seen.add(key);
      if (enemyFloorFree(game,actor,x,y)) { actor.x=x; actor.y=y; actor.fromX=x; actor.fromY=y; actor.walk=0; break; }
      for (const [dx,dy] of [[0,1],[1,0],[-1,0],[0,-1]]) queue.push([x+dx,y+dy]);
    }
  }
}

/** Hält wiederhergestellte Gegner von Wänden, Möbeln, anderen Gegnern und der Spielfigur fern. @param {object} game Spiel. @param {object} actor Gegner. @param {number} x Spalte. @param {number} y Zeile. */
function enemyFloorFree(game,actor,x,y) {
  const object=game.objectAt(x,y);
  return !wall(game,x,y) && (!object || object.walkThrough) && !enemyAt(game,x,y,actor) && !heroOccupies(game,x,y);
}
