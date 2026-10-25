import fs from 'node:fs';
import assert from 'node:assert/strict';
import { Game } from '../scripts/game/game.js';
import { createTown } from '../scripts/game/data/town.js';
import { createInteriors, createForest } from '../scripts/game/data/interiors.js';
import { DIRECTIONS } from '../scripts/core/config.js';

/** Erstellt ein Spiel ohne Browser und WebGL. */
export function createGame() {
  const rooms = new Map();
  for (const id of ['hall','storage','steam','archive']) {
    const room = JSON.parse(fs.readFileSync(new URL(`../scripts/game/data/${id}.json`,import.meta.url)));
    rooms.set(id,room);
  }
  for (const room of [createTown(),...createInteriors(),createForest('north'),createForest('east')]) rooms.set(room.id,room);
  const game = new Game(rooms); game.mode = 'world';
  return game;
}

/** Schließt alle Seiten eines Testdialogs. @param {Game} game Spiel. */
export function dismiss(game) {
  let guard = 0;
  while ((game.message || game.doorStudy) && guard++ < 30) {
    if (game.doorStudy) game.update(game.doorStudy.duration,false);
    else game.interact();
  }
  assert.ok(!game.message);
}

/** Sucht einen begehbaren Weg durch den aktuellen Raum. @param {Game} game Spiel. @param {number} x Ziel-X. @param {number} y Ziel-Y. */
function route(game,x,y) {
  const queue = [[game.player.x,game.player.y,[]]], seen = new Set();
  while (queue.length) {
    const [xx,yy,path] = queue.shift(), key = `${xx},${yy}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (xx === x && yy === y) return path;
    for (const [direction,[dx,dy]] of Object.entries(DIRECTIONS)) {
      if (!game.occupied(xx+dx,yy+dy)) queue.push([xx+dx,yy+dy,[...path,direction]]);
    }
  }
  return null;
}

/** Führt einen Schritt mit gegebenenfalls notwendiger Dampfpause aus. @param {Game} game Spiel. @param {string} direction Richtung. */
function step(game,direction) {
  let moved = false;
  for (let i = 0; i < 10 && !moved; i++) {
    dismiss(game); game.update(0.5,false); moved = game.step(direction);
    if (!moved) { dismiss(game); game.update(2.5,false); }
  }
  if (moved) game.update(0.5,false);
  return moved;
}

/** Geht über echte Kollisionen zum Ziel. @param {Game} game Spiel. @param {number} x Ziel-X. @param {number} y Ziel-Y. */
export function go(game,x,y) {
  dismiss(game);
  for (let guard=0;guard<500;guard++) {
    if (game.player.x===x && game.player.y===y) return;
    const path=route(game,x,y);
    if (path?.length) step(game,path[0]);
    else game.update(0.3,false);
  }
  assert.fail(`Kein Weg in ${game.room.id} nach ${x},${y}`);
}

/** Erreicht ein Objekt und löst die normale A-Aktion aus. @param {Game} game Spiel. @param {number} x Objekt-X. @param {number} y Objekt-Y. */
export function use(game,x,y) {
  dismiss(game);
  for (const [direction,[dx,dy]] of Object.entries(DIRECTIONS)) {
    if (game.occupied(x-dx,y-dy) || !route(game,x-dx,y-dy)) continue;
    go(game,x-dx,y-dy); game.player.facing = direction; game.interact(); return;
  }
  assert.fail(`Objekt ${x},${y} nicht erreichbar in ${game.room.id}`);
}

/** Erreicht ein benanntes Objekt unabhängig von seinem überarbeiteten Raumgrundriss. @param {Game} game Spiel. @param {string} id Objektkennung. */
export function useObject(game,id) {
  dismiss(game);
  for (let guard=0;guard<500;guard++) {
    const object=game.objects.find(objectId.bind(null,id));
    assert.ok(object,`Objekt ${id} fehlt in ${game.room.id}`);
    if (approachObject(game,object)) return;
  }
  assert.fail(`Objekt ${id} nicht erreichbar in ${game.room.id}`);
}

/** Vergleicht die Kennung eines aktuellen, möglicherweise laufenden Objekts. @param {string} id Kennung. @param {object} object Objekt. */
function objectId(id,object) { return object.id===id; }

/** Plant nach jedem Schritt neu und spricht bewegte Personen an ihrer aktuellen Position an. @param {Game} game Spiel. @param {object} object Aktuelles Ziel. */
function approachObject(game,object) {
  const x=object.x,y=object.y+(object.h || 1)-1;
  for (const [direction,[dx,dy]] of Object.entries(DIRECTIONS)) {
    const path=route(game,x-dx,y-dy);
    if (!path) continue;
    if (!path.length) {
      if (object.walking) { game.update(0.5,false); return false; }
      game.player.facing=direction; game.interact(); return true;
    }
    step(game,path[0]); return false;
  }
  game.update(0.5,false); return false;
}

/** Verschiebt ein Möbel mehrfach und folgt ihm. @param {Game} game Spiel. @param {number} x Start-X. @param {number} y Start-Y. @param {string} direction Richtung. @param {number} count Anzahl. */
export function push(game,x,y,direction,count) {
  go(game,x,y); game.player.facing = direction;
  for (let i = 0; i < count; i++) {
    game.interact(); assert.ok(game.slide); game.update(0.5,false);
    assert.ok(game.step(direction)); game.update(0.5,false);
  }
}
