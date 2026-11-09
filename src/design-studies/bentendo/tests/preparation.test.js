import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame,useObject,dismiss } from './helpers.js';
import { createQuellDungeon } from '../scripts/game/data/quell-dungeon.js';
import { createVillageInteriors } from '../scripts/game/data/house-rooms.js';
import { captureGame,restoreGame } from '../scripts/game/systems/save-state.js';
import { navigateSystemMenu,activateSystemMenu } from '../scripts/game/systems/system-menu.js';
import { sleepInBed,heroStats,damageHero } from '../scripts/game/systems/health.js';
import { poisonFromEnemy,updateCombatEffects } from '../scripts/game/systems/combat-effects.js';
import { activateBag } from '../scripts/game/systems/inventory.js';
import { questEntries } from '../scripts/game/systems/quest-log.js';

/** Beginnt mit dem echten Freischaltzustand nach Wurzelgrund. */
function setup() {
  const game=createGame();
  for (const room of [...createVillageInteriors(),...createQuellDungeon()]) game.rooms.set(room.id,room);
  game.flags.rootSpringFlowing=true;
  game.inventory=['Geschärftes Schwert'];
  game.coins=30;
  return game;
}

/** Benutzt einen Gegenstand über den normalen Rucksack. @param {object} game Spiel. @param {string} item Gegenstand. */
function drink(game,item) {
  game.bagOpen=true; game.bagAction=true; game.bagTab='items'; game.bagChoice=0; game.bagIndex=game.inventory.indexOf(item);
  activateBag(game); dismiss(game); game.bagOpen=false;
}

/** Prüft die Nebenroute und ihre sichere Materialrückkehr. */
function oreReturn() {
  const game=setup();
  game.travel('village-workshop'); useObject(game,'workshop-helper'); dismiss(game);
  assert.ok(questEntries(game).some(/** Erkennt den Schmiedeauftrag. @param {object} quest Aufgabe. */ quest=>quest.id===13));
  game.travel('quell-refuge'); game.enemies=[]; useObject(game,'quarry');
  assert.equal(game.room.id,'quell-quarry');
  assert.equal(game.enemies[0].maxHp,9);
  assert.ok(restoreGame(game,captureGame(game)));
  game.enemies=[];
  useObject(game,'stone-cache'); dismiss(game);
  assert.ok(game.inventory.includes('Feiner Schleifstein'));
  assert.ok(game.inventory.includes('Bronzeverschluss'));
  useObject(game,'west'); game.enemies=[];
  temperSword(game);
}

/** Prüft Abgabe, Nacht, Speicherung und einmalige Rückgabe. @param {object} game Spiel. */
function temperSword(game) {
  game.travel('village-workshop'); useObject(game,'workshop-helper');
  while (game.message && !game.message.onConfirm) game.interact();
  game.back(); assert.ok(game.inventory.includes('Geschärftes Schwert'));
  useObject(game,'workshop-helper'); dismiss(game);
  assert.ok(game.flags.temperDue);
  assert.ok(!game.inventory.includes('Geschärftes Schwert'));
  assert.ok(restoreGame(game,captureGame(game)));
  useObject(game,'workshop-helper'); dismiss(game); assert.ok(!game.flags.temperDone);
  game.travel('village-inn-upper'); sleepInBed(game); game.update(1.3,false);
  game.travel('village-workshop'); useObject(game,'workshop-helper'); dismiss(game);
  assert.equal(heroStats(game).attack,4);
  assert.ok(game.inventory.includes('Veredeltes Schwert'));
  useObject(game,'workshop-helper'); dismiss(game);
  assert.equal(game.inventory.filter(/** Zählt ausschließlich die veredelte Klinge. @param {string} item Gegenstand. */ item=>item==='Veredeltes Schwert').length,1);
}

/** Prüft den Kauf und die Verarbeitung echter Mantelmaterialien. */
function suppliesAndMantle() {
  const game=setup(); game.travel('village-inn'); useObject(game,'bar-d');
  assert.equal(game.systemMenu.kind,'shop');
  game.coins=0; activateSystemMenu(game); assert.equal(game.inventory.length,1);
  activateSystemMenu(game); game.coins=30;
  navigateSystemMenu(game,'up'); // Zurück.
  navigateSystemMenu(game,'up'); // Wolle.
  activateSystemMenu(game);
  assert.ok(game.inventory.includes('Wollballen'));
  assert.equal(game.coins,27); game.back();
  game.inventory.push('Bronzeverschluss');
  game.travel('village-weaver'); useObject(game,'tailor'); dismiss(game);
  assert.ok(game.flags.mantleMade);
  assert.ok(!game.inventory.includes('Wollballen'));
  assert.equal(heroStats(game).armor,'Gefütterter Mantel');
  game.travel('quell-entry'); game.enemies=[]; const hp=game.health.hp;
  damageHero(game,1); assert.equal(game.health.hp,hp-.5);
  assert.ok(restoreGame(game,captureGame(game)));
}

/** Prüft Gift, Heilung und persistente aktive Effekte über den Rucksack. */
function potionEffects() {
  const game=setup(); game.travel('quell-quarry'); game.enemies=[]; game.inventory.push('Heiltrank','Gegengift','Stärkungstrank');
  game.health.hp=2; drink(game,'Heiltrank'); assert.equal(game.health.hp,6);
  poisonFromEnemy(game,{venom:true}); dismiss(game);
  assert.equal(game.flags.poisonTicks,4);
  game.time+=3.1; updateCombatEffects(game); assert.equal(game.health.hp,5.5);
  drink(game,'Gegengift'); assert.ok(!game.flags.poisonTicks);
  poisonFromEnemy(game,{venom:true}); assert.ok(!game.flags.poisonTicks);
  drink(game,'Stärkungstrank'); assert.equal(heroStats(game).attack,5);
  assert.ok(restoreGame(game,captureGame(game)));
  game.systemMenu={kind:'pause',choice:0}; const time=game.time; game.update(20,false); assert.equal(game.time,time);
  game.systemMenu=null; game.time+=61; updateCombatEffects(game); assert.equal(heroStats(game).attack,3);
}


test('Vorbereitung: Aufträge, begehbarer Nebenraum, Materialbeute und Schwert nach echter Nacht',oreReturn);
test('Vorbereitung: Reisebedarf mit Kaufprüfung und Näherin mit angelegtem Schutz',suppliesAndMantle);
test('Reisetränke: tatsächliche Rucksackwirkung, Gift, Schutz, Menüpause und gespeicherte Restzeit',potionEffects);
