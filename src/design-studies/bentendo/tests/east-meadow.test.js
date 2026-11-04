import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame,useObject,dismiss } from './helpers.js';
import { createEastRooms } from '../scripts/game/data/east-rooms.js';
import { eastQuestEntries } from '../scripts/game/data/quest-east.js';
import { captureGame,restoreGame } from '../scripts/game/systems/save-state.js';

/** Stellt einen Spielstand am Übergang zwischen Wald und Wiesen bereit. */
function world() {
  const game=createGame();
  for (const room of createEastRooms()) game.rooms.set(room.id,room);
  game.reset(); game.mode='world'; game.travel('east-clearing');
  return game;
}

/** Prüft untersuchte und irreführende Wegmarken, Speichern und den Übergang aus dem Wald. */
function openRoute() {
  const game=world();
  useObject(game,'root-notch'); dismiss(game); assert.equal(game.flags.eastRootOpen,undefined);
  useObject(game,'root-door'); dismiss(game); assert.equal(game.flags.eastDoorStudied,true);
  useObject(game,'root-chalk'); useObject(game,'root-chalk'); dismiss(game);
  useObject(game,'root-ring'); useObject(game,'root-ring'); dismiss(game);
  assert.equal(game.flags.eastRootOpen,undefined);
  useObject(game,'root-notch'); dismiss(game); assert.equal(game.flags.eastRootOpen,undefined);
  useObject(game,'root-notch'); dismiss(game); assert.equal(game.flags.eastRootOpen,true);
  const restored=world(); assert.equal(restoreGame(restored,captureGame(game)),true);
  useObject(restored,'root-door'); assert.equal(restored.room.id,'east-waystation');
  useObject(restored,'waymaker-ledger'); useObject(restored,'meadow-exit');
  assert.equal(restored.room.id,'east-meadow');
  useObject(restored,'meadow-view'); dismiss(restored);
  assert.equal(eastQuestEntries(restored).at(-1).done,true);
  useObject(restored,'station-return'); assert.equal(restored.room.id,'east-waystation');
  useObject(restored,'forest-return'); assert.equal(restored.room.id,'east-clearing');
  assert.equal(restored.occupied(restored.player.x,restored.player.y),false);
}

/** Überquert eine komplette Wasserfläche zu Fuß, auch mit aktivem Tag-Nacht-Zyklus. */
function wade() {
  const game=world(); game.flags.eastRootOpen=true; game.travel('east-meadow');
  for (const minute of [720,1250]) {
    game.worldMinutes=minute; game.player={x:6,y:10,facing:'right'};
    let wet=0;
    for (let x=7;x<=18;x++) {
      assert.equal(game.step('right'),true,`Freier Schritt bei ${x},10`); game.update(0.2,false);
      if (game.room.ground[10][x]==='s') wet++;
      assert.equal(game.player.x,x);
    }
    assert.ok(wet>=4);
  }
}

test('Wurzelpforte: Hinweise, falsche Marken, Speicherstand und beide Rückwege',openRoute);
test('Ostwiesen: zusammenhängendes Flachwasser tagsüber und nachts durchquerbar',wade);
