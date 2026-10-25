import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame } from './helpers.js';
import { createEastRooms } from '../scripts/game/data/east-rooms.js';
import { createVillage } from '../scripts/game/data/village.js';
import { passageArea } from '../scripts/game/data/forest-passages.js';

/** Lädt die echten Waldräume für Randwechsel ohne A-Taste. */
function world() {
  const game=createGame();
  for (const room of [createVillage(),...createEastRooms()]) game.rooms.set(room.id,room);
  game.reset(); game.mode='world'; return game;
}

/** Liefert alle Randfelder des geöffneten Übergangs mit passender Laufrichtung. @param {object} room Raum. @param {object} exit Übergang. */
function edgePoints(room,exit) {
  const area=passageArea(room,exit),points=[];
  for (let y=area.y;y<area.y+area.h;y++) for (let x=area.x;x<area.x+area.w;x++) {
    if (x===0) points.push([x,y,'left',1,0]);
    else if (x===room.width-1) points.push([x,y,'right',-1,0]);
    else if (y===0) points.push([x,y,'up',0,1]);
    else if (y===room.height-1) points.push([x,y,'down',0,-1]);
  }
  return points;
}

/** Prüft jede Spur jedes Waldübergangs und verhindert sofortiges Zurückwechseln. */
function allEdges() {
  const game=world();
  for (const room of createEastRooms()) for (const exit of room.objects.filter(isTrail)) {
    for (const [x,y,direction,dx,dy] of edgePoints(room,exit)) {
      game.travel(room.id); game.player={x:x+dx,y:y+dy,facing:direction};
      assert.equal(game.step(direction),true,`${room.id}: ${x},${y}`);
      assert.equal(game.room.id,exit.to); assert.deepEqual([game.player.x,game.player.y],exit.spawn);
      assert.equal(game.move,null); assert.equal(game.held,null);
      game.update(0.5,false); assert.equal(game.room.id,exit.to);
    }
  }
}

/** Erkennt aktivierbare Waldpfade. @param {object} object Objekt. */
function isTrail(object) { return object.kind==='trail' && object.action==='travel'; }

/** Bewahrt geschlossene Waldränder, Dialogpausen und die Untersuchungstür. */
function blockedEdges() {
  const game=world(); game.travel('east-wood'); game.player={x:1,y:3,facing:'left'};
  assert.equal(game.step('left'),false); assert.equal(game.room.id,'east-wood');
  game.player={x:1,y:10,facing:'left'}; game.say('Test','Pause');
  assert.equal(game.step('left'),false); assert.equal(game.room.id,'east-wood');
  game.message=null; game.pages=[]; game.bagOpen=true; assert.equal(game.step('left'),false);
  game.bagOpen=false; game.travel('east-clearing'); game.player={x:11,y:1,facing:'up'};
  assert.equal(game.step('up'),false); assert.equal(game.room.id,'east-clearing');
}

/** Lässt das überlaufbare Pfeilfeld ohne automatischen Wechsel betreten. */
function walkAcrossArrow() {
  const game=world(); game.travel('east-wood'); game.player={x:3,y:10,facing:'left'};
  assert.equal(game.step('left'),true); game.update(0.3,false);
  assert.equal(game.player.x,2); assert.equal(game.room.id,'east-wood');
  assert.equal(game.step('left'),true); game.update(0.3,false);
  assert.equal(game.player.x,1); assert.equal(game.step('left'),true); assert.equal(game.room.id,'village');
}

test('Waldrand: alle geöffneten Wegbreiten wechseln ohne A und ohne Rücksprung',allEdges);
test('Waldrand: geschlossene Ränder und pausierte Eingaben bleiben gesperrt',blockedEdges);
test('Waldrand: Pfeile bleiben überlaufbar bis zum tatsächlichen Rand',walkAcrossArrow);
