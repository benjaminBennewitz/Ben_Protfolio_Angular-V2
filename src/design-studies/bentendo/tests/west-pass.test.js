import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame,useObject,dismiss } from './helpers.js';
import { createVillage } from '../scripts/game/data/village.js';
import { createVillageInteriors } from '../scripts/game/data/house-rooms.js';
import { createWestRooms } from '../scripts/game/data/west-rooms.js';
import { captureGame,restoreGame } from '../scripts/game/systems/save-state.js';
import { stepDuration } from '../scripts/game/systems/player-movement.js';
import { updateWinter } from '../scripts/game/systems/winter.js';
import { questEntries } from '../scripts/game/systems/quest-log.js';
import { startDebugRun } from '../scripts/game/data/debug-starts.js';

/** Lädt dieselben Hub- und Passräume wie die Produktion. */
function setup() {
  const game=createGame();
  for (const room of [createVillage(),...createVillageInteriors(),...createWestRooms()]) game.rooms.set(room.id,room);
  game.flags.rootSpringFlowing=true;
  game.worldMinutes=540;
  return game;
}

/** Prüft den regulären Aufbruch, alle Raumverbindungen, Rast und Rückweg. */
function westRoute() {
  const game=setup(); game.flags.mantleMade=true; game.travel('village');
  useObject(game,'west-road'); assert.equal(game.room.id,'west-edge');
  useObject(game,'ridge'); assert.equal(game.room.id,'west-ridge');
  useObject(game,'lodge'); assert.equal(game.room.id,'west-lodge');
  useObject(game,'stove'); dismiss(game);
  assert.ok(restoreGame(game,captureGame(game)));
  useObject(game,'ridge'); useObject(game,'gate'); useObject(game,'frost-door'); dismiss(game);
  assert.ok(game.flags.frostGateSeen);
  useObject(game,'ridge'); useObject(game,'night-marker'); dismiss(game);
  assert.ok(!game.flags.westLensRecovered);
  useObject(game,'supply-bag'); dismiss(game); assert.ok(game.inventory.includes('Heiltrank'));
  useObject(game,'edge'); useObject(game,'village'); assert.equal(game.room.id,'village');
}

/** Prüft die zeitabhängige Begegnung und die tatsächliche nächtliche Rückkehr. */
function nightQuest() {
  const game=setup(); game.travel('village-inn');
  assert.ok(!game.objects.some(isIva));
  game.worldMinutes=1260;
  assert.ok(game.objects.some(isIva));
  useObject(game,'iva'); dismiss(game); assert.ok(game.flags.westNightQuest);
  game.travel('west-ridge'); game.worldMinutes=600;
  useObject(game,'night-marker'); dismiss(game); assert.ok(!game.flags.westLensRecovered);
  game.worldMinutes=1260; useObject(game,'night-marker'); dismiss(game);
  assert.ok(game.flags.westLensRecovered);
  assert.ok(restoreGame(game,captureGame(game)));
  game.travel('village-inn'); useObject(game,'iva'); dismiss(game);
  assert.ok(game.flags.westLightFixed); assert.equal(game.coins,5);
  useObject(game,'iva'); dismiss(game); assert.equal(game.coins,5);
  assert.ok(questEntries(game).some(completedNightQuest));
}

/** Erkennt die Laternenhüterin in der tatsächlichen Objektprojektion. @param {object} object Person. */
function isIva(object) { return object.id==='iva'; }

/** Erkennt den abgeschlossenen Nachtauftrag. @param {object} quest Quest. */
function completedNightQuest(quest) { return quest.id===16 && quest.status==='done'; }

/** Vergleicht Mantelschutz, Menüpause, Kälteschritt und Rast. */
function coldAndRest() {
  const game=setup(); game.travel('west-edge');
  updateWinter(game,60); assert.equal(game.flags.winterCold,60000);
  game.player={x:2,y:8,facing:'right'}; assert.ok(game.step('right'));
  assert.ok(stepDuration(game.move)>.18); game.move=null;
  game.flags.winterCold=0; game.flags.mantleMade=true; updateWinter(game,60);
  assert.ok(game.flags.winterCold>=19999 && game.flags.winterCold<=20001);
  const cold=game.flags.winterCold; game.systemMenu={kind:'pause',choice:0}; game.update(30,false);
  assert.equal(game.flags.winterCold,cold); game.systemMenu=null;
  useObject(game,'shelter'); while (game.message && !game.message.onConfirm) game.interact();
  game.back(); assert.ok(game.flags.winterCold);
  useObject(game,'shelter'); dismiss(game); assert.ok(!game.flags.winterCold);
  startDebugRun(game,'west-edge'); assert.ok(game.flags.mantleMade);
}

test('Westpass: alle Wege, Schutzhütte, Vorratsfund und Rückkehr nach Bruchstein',westRoute);
test('Nachtauftrag: Iva im Wirtshaus, Tagesbeobachtung, Nachtfund und einmaliger Lohn',nightQuest);
test('Winter: Mantel hält dreimal länger warm, Rast ist bestätigt und Menüs pausieren',coldAndRest);
