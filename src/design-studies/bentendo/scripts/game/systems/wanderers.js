import { wall } from './collision.js';

/** Überträgt die gespeicherten Tierpositionen in Darstellung und Objektkollision. @param {object} game Spiel. @param {object[]} objects Vorhandene Objekte. */
export function projectWanderers(game,objects) {
  const result=[];
  for (const object of objects) {
    const actor=game.roomState.wanderers?.[object.id];
    if (!actor) { result.push(object); continue; }
    const progress=actor.moving?Math.min(1,actor.elapsed/(actor.duration || 0.24)):1;
    result.push({...object,x:actor.x,y:actor.y,drawX:actor.fromX+(actor.x-actor.fromX)*progress,drawY:actor.fromY+(actor.y-actor.fromY)*progress,walking:actor.moving,facing:actor.facing});
  }
  return result;
}

/** Bewegt Tiere in kurzen Abschnitten mit längeren, versetzten Pausen. @param {object} game Spiel. @param {number} dt Zeitschritt. @param {boolean} reduced Reduzierte Bewegung. */
export function updateWanderers(game,dt,reduced) {
  game.roomState.wanderers ||= {};
  const objects=game.objects;
  for (const [id,actor] of Object.entries(game.roomState.wanderers)) if (!objects.some(/** Erkennt weiter aktive Routen. @param {object} object Lebewesen. */ object=>object.id===id && object.route && !object.sleeping)) actor.moving=false;
  for (const object of objects) {
    if (!object.route) continue;
    if (game.roomState.fetch?.dogId===object.id || (object.id==='innkeeper' && game.roomState.service)) continue;
    const actor=game.roomState.wanderers[object.id] ||= createActor(object);
    if (reduced) { actor.moving=false; actor.fromX=actor.x; actor.fromY=actor.y; continue; }
    if (!actor.moving && pauseResident(game,object,actor)) continue;
    if (actor.moving) advanceActor(actor,object,dt);
    else { actor.wait-=dt; if (actor.wait<=0) startStep(game,object,actor); }
  }
}

/** Erstellt den Ausgangszustand eines einzelnen Tiers. @param {object} object Tierobjekt. */
export function createActor(object) {
  const person=Boolean(object.appearance || object.kind==='npc');
  return {x:object.x,y:object.y,fromX:object.x,fromY:object.y,index:0,elapsed:0,moving:false,facing:person?'down':object.kind==='wildlife'?'left':'right',duration:person?0.4:0.24,wait:2+(object.x+object.y)%4};
}

/** Lässt ansprechbare Bewohner neben dem Spieler und während eigener Äußerungen stehen bleiben. @param {object} game Spiel. @param {object} object Bewohnerdaten. @param {object} actor Bewegungszustand. */
function pauseResident(game,object,actor) {
  if (!object.appearance && object.kind!=='npc') return false;
  const near=Math.abs(actor.x-game.player.x)+Math.abs(actor.y-game.player.y)<=2;
  if (!near && game.ambientSpeech?.speakerId!==object.id && game.pendingReaction?.speakerId!==object.id) return false;
  actor.wait=Math.max(actor.wait,1); return true;
}

/** Schließt einen Schritt ab und legt nach zwei Feldern eine längere Pause ein. @param {object} actor Tierzustand. @param {object} object Tierdaten. @param {number} dt Zeitschritt. */
function advanceActor(actor,object,dt) {
  actor.elapsed+=dt;
  if (actor.elapsed<(actor.duration || 0.24)) return;
  actor.moving=false; actor.wait=actor.index%2===0?3+object.x%3:0.15;
}

/** Reserviert das nächste freie Feld, ohne Figuren oder feste Hindernisse zu übergehen. @param {object} game Spiel. @param {object} object Tierdaten. @param {object} actor Tierzustand. */
function startStep(game,object,actor) {
  const next=(actor.index+1)%object.route.length,[x,y]=object.route[next];
  if (blocked(game,object,x,y)) { actor.wait=0.5; return; }
  actor.fromX=actor.x; actor.fromY=actor.y;
  if (x!==actor.x) actor.facing=x<actor.x?'left':'right';
  else if (object.appearance || object.kind==='npc') actor.facing=y<actor.y?'up':'down';
  actor.x=x; actor.y=y; actor.index=next; actor.elapsed=0; actor.moving=true;
}

/** Prüft Tiere einschließlich ihrer noch sichtbaren Ausgangsfelder. @param {object} game Spiel. @param {object} object Bewegtes Tier. @param {number} x Ziel-X. @param {number} y Ziel-Y. */
function blocked(game,object,x,y) {
  const swimming=object.habitat==='water-edge' && game.room.ground?.[y]?.[x]==='w';
  if ((wall(game,x,y) && !swimming) || wandererOccupies(game,x,y)) return true;
  if ((game.player.x===x && game.player.y===y) || (game.move?.x===x && game.move?.y===y)) return true;
  if (game.seat?.exit[0]===x && game.seat?.exit[1]===y) return true;
  const target=game.objectAt(x,y);
  return Boolean(target && target.id!==object.id);
}

/** Reserviert während eines Schritts auch den Ausgangspunkt des Tiers. @param {object} game Spiel. @param {number} x Spalte. @param {number} y Zeile. */
export function wandererOccupies(game,x,y) {
  for (const actor of Object.values(game.roomState.wanderers || {})) if (actor.moving && actor.fromX===x && actor.fromY===y) return true;
  return false;
}

/** Fordert flüssige Frames nur während tatsächlich laufender Tierschritte an. @param {object} game Spiel. */
export function wanderersMoving(game) {
  for (const actor of Object.values(game.roomState.wanderers || {})) if (actor.moving) return true;
  return false;
}
