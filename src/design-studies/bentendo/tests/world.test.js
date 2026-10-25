import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, dismiss, use, go, push } from './helpers.js';

/** Prüft Halle und Relaislager mit regulär erreichbaren Gegenständen. */
function maintenanceRooms() {
  const game = createGame(); game.travel('hall');
  push(game,6,5,'up',2); use(game,10,2); dismiss(game);
  assert.ok(game.inventory.includes('Ersatzrune')); use(game,11,2); dismiss(game);
  assert.ok(game.flags.hallPowered); use(game,12,1); assert.equal(game.room.id,'storage');
  use(game,6,6); assert.equal(game.flags.storageOpen,undefined); dismiss(game);
  use(game,3,1); dismiss(game); use(game,2,3); dismiss(game); use(game,6,3); dismiss(game);
  use(game,6,6); assert.ok(game.flags.storageOpen); dismiss(game);
  use(game,10,2); dismiss(game); assert.ok(game.inventory.includes('Runenkupplung'));
  use(game,12,8); assert.equal(game.room.id,'steam');
}

/** Prüft Kupplung, Ventile und Rückkehr aus dem Dampfkanal. */
function steamMechanism() {
  const game = createGame(); game.travel('steam'); game.inventory.push('Runenkupplung');
  use(game,5,13); dismiss(game); assert.ok(game.flags.coupled);
  for (const [x,y] of [[7,11],[17,13],[19,5]]) { use(game,x,y); dismiss(game); }
  assert.ok(game.flags.steamSafe); use(game,21,2); assert.equal(game.room.id,'city');
}

/** Prüft Mehrfeldregale, Kisten, Archivfund und zustandserhaltende Rückstellung. */
function archiveMechanism() {
  const game = createGame(); game.travel('archive');
  push(game,5,10,'right',2); push(game,9,9,'up',2);
  push(game,11,5,'right',2); push(game,15,4,'up',2);
  use(game,16,11); dismiss(game); assert.equal(game.notes.length,1);
  assert.equal(game.objectAt(16,11),null);
  go(game,2,11); game.player.facing = 'down'; game.interact(); dismiss(game);
  assert.equal(game.roomState.blocks[0].x,6); assert.equal(game.notes.length,1);
}

/** Prüft Notizen und Truhen gegen doppelte Beute. */
function persistentLoot() {
  const game = createGame(); game.travel('steam'); game.flags.steamSafe = true;
  use(game,8,2); dismiss(game); assert.equal(game.notes.length,1);
  assert.equal(game.objectAt(8,2),null);
  use(game,5,8); dismiss(game); const coins = game.coins;
  use(game,5,8); dismiss(game); assert.equal(game.coins,coins);
  game.travel('city'); game.travel('steam'); assert.equal(game.objectAt(8,2),null);
}

test('Räume: Wartungshalle und Materiallager bleiben lösbar',maintenanceRooms);
test('Räume: Dampfkanal und Stadtrückweg',steamMechanism);
test('Räume: Regal-Labyrinth und Rückstellung',archiveMechanism);
test('Funde: Notizen verschwinden, Truhen zählen nur einmal',persistentLoot);
