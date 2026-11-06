import { SaveManager,DEBUG_SAVE_KEY } from '../scripts/game/systems/save-manager.js';
import { startDebugRun } from '../scripts/game/data/debug-starts.js';
import { navigateTitle } from '../scripts/game/data/title.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame,useObject,dismiss } from './helpers.js';
import { createEastRooms } from '../scripts/game/data/east-rooms.js';
import { createRootDungeon } from '../scripts/game/data/root-dungeon.js';
import { createQuellDungeon } from '../scripts/game/data/quell-dungeon.js';
import { captureGame,restoreGame,SAVE_KEY } from '../scripts/game/systems/save-state.js';

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
  assert.ok(game.enemies.some(actor=>actor.species==='gorgon'));
  exploreCamp(game);
}

/** Prüft Beute und den begehbaren Rückweg. @param {object} game Spiel. */
function exploreCamp(game) {
  game.enemies=[];
  useObject(game,'coins'); dismiss(game); assert.equal(game.coins,5);
  useObject(game,'aid'); dismiss(game); assert.ok(game.inventory.includes('Feldverband'));
  exploreDepths(game);
  useObject(game,'west'); game.enemies=[];
  useObject(game,'west'); useObject(game,'exit');
  assert.equal(game.room.id,'east-lowland'); assert.equal(game.occupied(game.player.x,game.player.y),false);
}

/** Begeht beide Äste, lädt den Kampfzustand und prüft die einmalige Beute. */
function exploreDepths(game) {
  const route=[
    ['east','root-fork'],['north','root-cache'],['south','root-fork'],
    ['east','root-hollow'],['east','root-gallery'],['east','root-spring'],
    ['west','root-gallery'],['west','root-hollow'],['west','root-fork'],
    ['north','root-cache'],['south','root-fork'],['west','root-camp'],
  ];
  for (const [door,destination] of route) {
    game.enemies=[];
    useObject(game,door);
    assert.equal(game.room.id,destination);
    assert.equal(restoreGame(game,captureGame(game)),true);
    if (destination==='root-cache') {
      useObject(game,'resin-purse'); dismiss(game); assert.equal(game.coins,11);
      useObject(game,'resin-note'); dismiss(game);
    }
    if (destination==='root-spring') {
      useObject(game,'spring-lip'); dismiss(game);
      useObject(game,'spring-bag'); dismiss(game);
    }
  }
  game.enemies=[];
}

test('Wurzelgrund: Gruben kosten ein Herz und acht Waldkammern sind durchgängig spielbar',rootRoute);


/** Sichert einen Debuglauf manuell, lädt ihn vom Titel und hält den normalen Stand getrennt. */
function debugRoundTrip() {
  const game=createGame(),storage=new Map();
  for (const room of [...createQuellDungeon(),...createEastRooms(),...createRootDungeon()]) game.rooms.set(room.id,room);
  const saves=new SaveManager(game,{getItem:storage.get.bind(storage),setItem:storage.set.bind(storage)});
  game.coins=7; assert.equal(saves.flush(),true);
  startDebugRun(game,'root-entry'); assert.ok(game.inventory.includes('Geschärftes Schwert'));
  assert.equal(saves.flush(),false); game.coins=12;
  assert.equal(saves.flush(true),true);
  assert.equal(JSON.parse(storage.get(SAVE_KEY)).coins,7);
  assert.equal(JSON.parse(storage.get(DEBUG_SAVE_KEY)).coins,12);
  game.reset(); saves.load(); navigateTitle(game,'down'); game.interact();
  assert.equal(game.room.id,'root-entry'); assert.equal(game.coins,12); assert.equal(game.debugging,true);
  storage.delete(SAVE_KEY); game.reset(); saves.load(); game.interact();
  assert.equal(game.room.id,'root-entry'); assert.equal(game.debugging,true);
}

test('Debug: Wurzelgrund lässt sich separat manuell speichern und vom Titel laden',debugRoundTrip);

/** Prüft Freigabe, Abbruch, dauerhafte Rückkehr und Journal im echten Raumwechsel. */
test('Quellherz: Quelle erst nach Kampf und Bestätigung befreien',()=>{
  const game=createGame();
  for (const room of [...createEastRooms(),...createRootDungeon()]) game.rooms.set(room.id,room);
  game.flags.eastLowlandGateOpen=true;
  game.travel('root-spring'); useObject(game,'east');
  assert.equal(game.room.id,'root-headwater');
  assert.equal(game.enemies.length,2);
  game.player={x:14,y:3,facing:'up'};
  game.interact(); dismiss(game);
  assert.ok(!game.flags.rootSpringFlowing);
  game.enemies=[];
  for (let wave=1;wave<=3;wave++) {
    assert.equal(game.nestWave,wave);
    game.update(1.21,false);
    if (wave<3) {
      dismiss(game);
      assert.equal(game.enemies.length,3);
      assert.equal(restoreGame(game,captureGame(game)),true);
      game.enemies=[];
    }
  }
  dismiss(game);
  assert.ok(game.flags.rootGuardsCleared);
  useObject(game,'spring-valve');
  while (game.message && !game.message.onConfirm) game.interact();
  game.back(); assert.ok(!game.flags.rootSpringFlowing);
  useObject(game,'spring-valve'); dismiss(game);
  assert.ok(game.flags.rootSpringFlowing);
  assert.equal(game.health.maxHp,8);
  assert.equal(game.health.hp,8);
  assert.equal(restoreGame(game,captureGame(game)),true);
  useObject(game,'west');
  assert.ok(game.objects.some(object=>object.id==='spring-flow'));
  useObject(game,'east'); assert.equal(game.enemies.length,0);
  useObject(game,'spring-valve'); dismiss(game);
  assert.equal(game.notes.filter(note=>note.id==='root-headwater').length,1);
  useObject(game,'spillway'); assert.equal(game.room.id,'east-lowland');
});
