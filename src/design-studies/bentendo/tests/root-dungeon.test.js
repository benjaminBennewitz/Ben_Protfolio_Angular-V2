import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame,useObject,dismiss } from './helpers.js';
import { createEastRooms } from '../scripts/game/data/east-rooms.js';
import { createRootDungeon } from '../scripts/game/data/root-dungeon.js';
import { captureGame,restoreGame } from '../scripts/game/systems/save-state.js';

/** Prüft die neue Route einschließlich Rückweg und gültigem Speicherstand mit Kobolden. */
function rootRoute() {
  const game=createGame();
  for (const room of [...createEastRooms(),...createRootDungeon()]) game.rooms.set(room.id,room);
  game.flags.eastLowlandGateOpen=true; game.travel('east-lowland');
  useObject(game,'root-entrance'); assert.equal(game.room.id,'root-entry');
  game.player={x:6,y:6,facing:'right'}; game.hurtTime=0.5;
  assert.equal(game.step('right'),true);
  assert.equal(captureGame(game).player.x,6);
  game.update(0.2,false); assert.equal(game.health.hp,4);
  assert.equal(game.player.x,6); assert.ok(game.hurtTime>0);
  assert.ok(game.rootFall); assert.equal(game.step('left'),false);
  game.update(0.3,false); assert.ok(game.rootFall);
  game.update(0.3,false); assert.equal(game.rootFall,null);
  useObject(game,'east'); assert.equal(game.room.id,'root-turn');
  assert.equal(game.enemies.length,2); game.enemies=[];
  useObject(game,'east'); assert.equal(game.room.id,'root-camp');
  assert.equal(restoreGame(game,captureGame(game)),true);
  assert.equal(game.enemies[0].species,'kobold'); assert.equal(game.enemies[0].hp,4);
  exploreCamp(game);
}

/** Prüft Beute und den begehbaren Rückweg. @param {object} game Spiel. */
function exploreCamp(game) {
  game.enemies=[];
  useObject(game,'coins'); dismiss(game); assert.equal(game.coins,5);
  useObject(game,'aid'); dismiss(game); assert.ok(game.inventory.includes('Feldverband'));
  useObject(game,'end'); dismiss(game);
  useObject(game,'west'); game.enemies=[];
  useObject(game,'west'); useObject(game,'exit');
  assert.equal(game.room.id,'east-lowland'); assert.equal(game.occupied(game.player.x,game.player.y),false);
}

test('Wurzelgrund: Gruben kosten ein Herz und drei Waldkammern sind durchgängig spielbar',rootRoute);
