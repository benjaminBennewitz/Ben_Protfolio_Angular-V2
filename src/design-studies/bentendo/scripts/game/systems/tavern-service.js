import { wall } from './collision.js';
import { wandererOccupies } from './wanderers.js';
import { openDrinks } from './tavern.js';

/** Bedient sitzende Gäste über echte Schritte hinter dem Tresen und kehrt danach zurück. @param {object} game Spiel. @param {number} dt Zeitschritt. @param {boolean} reduced Reduzierte Bewegung. */
export function updateTavern(game,dt,reduced) {
  const service=game.roomState.service,actor=game.roomState.wanderers?.innkeeper;
  if (!service || !actor || service.phase==='ready') return;
  if (actor.moving) {
    actor.elapsed+=dt;
    if (reduced || actor.elapsed>=actor.duration) { actor.moving=false; actor.fromX=actor.x; actor.fromY=actor.y; }
    return;
  }
  if (actor.x===service.goal[0] && actor.y===service.goal[1]) {
    actor.facing='down';
    if (service.phase==='return') { actor.index=0; actor.wait=2; game.roomState.service=null; }
    else { service.phase='ready'; openDrinks(game); }
    return;
  }
  const next=serviceStep(game,actor,service.goal);
  if (next) walkTo(actor,next);
}

/** Findet einen Weg ohne Möbel, Spieler oder reservierte Bewohnerfelder zu kreuzen. @param {object} game Spiel. @param {object} actor Wirt. @param {number[]} goal Thekenplatz. */
function serviceStep(game,actor,goal) {
  const queue=[[actor.x,actor.y,null]],seen=new Set([`${actor.x},${actor.y}`]);
  for (let cursor=0;cursor<queue.length;cursor++) {
    const [x,y,first]=queue[cursor];
    if (x===goal[0] && y===goal[1]) return first;
    for (const [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]]) {
      const xx=x+dx,yy=y+dy,key=`${xx},${yy}`;
      if (seen.has(key) || !serviceFree(game,xx,yy)) continue;
      seen.add(key); queue.push([xx,yy,first || [xx,yy]]);
    }
  }
  return null;
}

/** Hält Bedienwege und den ursprünglichen Ausstieg vom Sitzplatz frei. @param {object} game Spiel. @param {number} x Spalte. @param {number} y Zeile. */
function serviceFree(game,x,y) {
  if (wall(game,x,y) || wandererOccupies(game,x,y)) return false;
  if (game.player.x===x && game.player.y===y || game.move?.x===x && game.move?.y===y) return false;
  if (game.seat?.exit[0]===x && game.seat?.exit[1]===y) return false;
  const object=game.objectAt(x,y); return !object || object.id==='innkeeper';
}

/** Beginnt einen sichtbaren Schritt mit passender Blickrichtung. @param {object} actor Wirt. @param {number[]} next Freies Nachbarfeld. */
function walkTo(actor,next) {
  actor.fromX=actor.x; actor.fromY=actor.y;
  actor.facing=next[0]!==actor.x?(next[0]<actor.x?'left':'right'):(next[1]<actor.y?'up':'down');
  actor.x=next[0]; actor.y=next[1]; actor.elapsed=0; actor.moving=true;
}
