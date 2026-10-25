import { movementPosition } from './player-movement.js';
import { WEAPON_TIMING } from './weapon-timing.js';
import { dropHeart } from './heart-drops.js';
import { DIRECTIONS } from '../../core/config.js';
import { wall } from './collision.js';
import { damageHero,heroStats } from './health.js';

/** Findet Gegner samt reserviertem Ausgangsfeld eines laufenden Schritts. @param {object} game Spiel. @param {number} x Spalte. @param {number} y Zeile. @param {object} ignore Ausgenommener Gegner. */
export function enemyAt(game,x,y,ignore=null) {
  for (const actor of game.enemies || []) if (actor!==ignore && actor.hp>0 && ((actor.x===x && actor.y===y) || (actor.walk>0 && actor.fromX===x && actor.fromY===y))) return actor;
  return null;
}

/** Schlägt mit A vor die Figur; eine feste Abklingzeit verhindert Eingabespam. @param {object} game Spiel. */
export function attack(game) {
  if (!game.room.dungeon || game.attackCooldown>0) return;
  game.attackFacing=game.player.facing; game.attackTime=WEAPON_TIMING.duration; game.attackCooldown=WEAPON_TIMING.cooldown;
}

/** Löst den Treffer erst beim waagerechten Ende des Hackschwungs aus. @param {object} game Spiel. */
function strike(game) {
  const point=movementPosition(game),[dx,dy]=DIRECTIONS[game.attackFacing],x=Math.round(point.x)+dx,y=Math.round(point.y)+dy;
  if (wall(game,x,y)) return;
  for (const actor of game.enemies) {
    if (Math.abs(actor.x-x)+Math.abs(actor.y-y)>1 || (dx && actor.x!==x) || (dy && actor.y!==y)) continue;
    actor.hp=Math.max(0,actor.hp-heroStats(game).attack); actor.hurt=0.2;
    game.sounds.push(actor.hp?(actor.species==='spider'?'combat-hit-spider':'combat-hit'):'combat-death-enemy');
    if (!actor.hp) dropHeart(game,actor);
  }
  game.enemies=game.enemies.filter(alive);
}

/** Begrenzt Angriffe auf noch lebende Gegner. @param {object} actor Gegner. */
function alive(actor) { return actor.hp>0; }

/** Aktualisiert Trefferpausen, klar angekündigte Bisse und die langsamen Gegnerbewegungen. @param {object} game Spiel. @param {number} dt Zeitschritt. */
export function updateCombat(game,dt) {
  const before=game.attackTime;
  game.hurtTime=Math.max(0,game.hurtTime-dt); game.attackTime=Math.max(0,game.attackTime-dt);
  game.attackCooldown=Math.max(0,game.attackCooldown-dt);
  if (!game.room.dungeon) return;
  advanceSwing(game,before);
  const room=game.room;
  for (const actor of game.enemies) {
    actor.hurt=Math.max(0,actor.hurt-dt); actor.walk=Math.max(0,(actor.walk || 0)-dt);
    if (actor.windup>0) finishBite(game,actor,dt); else updateEnemy(game,actor,dt);
    if (game.room!==room) return;
  }
}

/** Warnt vor einem Biss und trifft nur, wenn die Figur am Ende noch direkt daneben steht. @param {object} game Spiel. @param {object} actor Gegner. @param {number} dt Zeitschritt. */
function finishBite(game,actor,dt) {
  actor.windup=Math.max(0,actor.windup-dt);
  if (actor.windup>0) return;
  const distance=Math.abs(actor.x-game.player.x)+Math.abs(actor.y-game.player.y);
  if (distance===1) damageHero(game,1);
  actor.wait=actor.species==='snake'?0.8:1.1;
}

/** Lässt entfernte Tiere ruhen und beginnt einen angekündigten Nahangriff. @param {object} game Spiel. @param {object} actor Gegner. @param {number} dt Zeitschritt. */
function updateEnemy(game,actor,dt) {
  actor.wait-=dt;
  if (actor.wait>0 || actor.walk>0 || actor.hurt>0) return;
  const distance=Math.abs(actor.x-game.player.x)+Math.abs(actor.y-game.player.y);
  if (distance===1) { actor.windup=0.5; return; }
  actor.wait=actor.species==='beetle'?0.75:0.55;
  if (distance>7) return;
  const next=nextStep(game,actor);
  if (!next) return;
  actor.fromX=actor.x; actor.fromY=actor.y; actor.walk=0.2;
  actor.facing=next[0]!==actor.x?(next[0]<actor.x?'left':'right'):(next[1]<actor.y?'up':'down');
  actor.x=next[0]; actor.y=next[1];
}

/** Findet kurze echte Wege um Säulen und hält Ein- sowie Ausgänge frei. @param {object} game Spiel. @param {object} actor Gegner. */
function nextStep(game,actor) {
  const queue=[[actor.x,actor.y,null]],seen=new Set([`${actor.x},${actor.y}`]);
  for (let index=0;index<queue.length;index++) {
    const [x,y,first]=queue[index];
    if (Math.abs(x-game.player.x)+Math.abs(y-game.player.y)===1) return first;
    for (const [dx,dy] of Object.values(DIRECTIONS)) {
      const xx=x+dx,yy=y+dy,key=`${xx},${yy}`;
      if (seen.has(key) || wall(game,xx,yy) || game.objectAt(xx,yy) || enemyAt(game,xx,yy,actor) || heroOccupies(game,xx,yy)) continue;
      seen.add(key); queue.push([xx,yy,first || [xx,yy]]);
    }
  }
  return null;
}

/** Reserviert beide Spielerfelder bis zum Ende eines Schritts, auch gegen kreuzende Gegner. @param {object} game Spiel. @param {number} x Spalte. @param {number} y Zeile. */
export function heroOccupies(game,x,y) {
  if (game.player.x===x && game.player.y===y) return true;
  const move=game.move;
  if (!move) return false;
  return [move.fromX,move.x].includes(x) && [move.fromY,move.y].includes(y);
}

/** Synchronisiert Schwungklang und einmaligen Treffer auch bei großen Zeitschritten. @param {object} game Spiel. @param {number} before Vorherige Restdauer. */
function advanceSwing(game,before) {
  const swing=WEAPON_TIMING.duration-WEAPON_TIMING.windup,impact=WEAPON_TIMING.duration-WEAPON_TIMING.impact;
  if (before>swing && game.attackTime<=swing) game.sounds.push(heroStats(game).weapon==='Rostiges Schwert'?'combat-swing-sword':'combat-swing-stick');
  if (before>impact && game.attackTime<=impact) strike(game);
}
