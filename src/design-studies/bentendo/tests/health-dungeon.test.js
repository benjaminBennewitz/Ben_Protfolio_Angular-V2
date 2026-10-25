import { activateSystemMenu } from '../scripts/game/systems/system-menu.js';
import { updateCombat } from '../scripts/game/systems/dungeon-combat.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame,useObject,dismiss } from './helpers.js';
import { createVillage,createGuildEntrance } from '../scripts/game/data/village.js';
import { createVillageInteriors } from '../scripts/game/data/house-rooms.js';
import { createSourceCave } from '../scripts/game/data/mara-rooms.js';
import { createQuellDungeon,enemy } from '../scripts/game/data/quell-dungeon.js';
import { damageHero,heroStats } from '../scripts/game/systems/health.js';
import { captureGame,restoreGame } from '../scripts/game/systems/save-state.js';
import { validSave } from '../scripts/game/systems/save-validation.js';
import { navigateBag } from '../scripts/game/systems/inventory.js';
import { wall } from '../scripts/game/systems/collision.js';
import { updateDungeon } from '../scripts/game/systems/dungeon.js';

/** Lädt die Produktionsräume mit einem ausgerüsteten Ast und bereits gesicherten Münzen. */
function setup() {
  const game=createGame();
  for (const room of [createVillage(),createGuildEntrance(),...createVillageInteriors(),createSourceCave(),...createQuellDungeon()]) game.rooms.set(room.id,room);
  game.reset(); game.mode='world'; game.inventory=['Ast']; game.coins=20;
  return game;
}

/** Verletzt kontrolliert über dieselbe Schnittstelle wie die Dungeon-Gegner. @param {object} game Spiel. @param {number} amount Schaden. */
function hit(game,amount=1) { game.hurtTime=0; assert.equal(damageHero(game,amount),true); }

/** Prüft halbe Herzen, Menüschutz und kostenlose Heilung im tatsächlich erreichbaren reservierten Bett. */
function healthAndBed() {
  const game=setup(); assert.equal(damageHero(game,1),false); game.travel('quell-entry'); hit(game);
  assert.equal(game.health.hp,5); assert.equal(damageHero(game,1),false);
  game.hurtTime=0; game.back(); assert.equal(damageHero(game,1),false); game.back();
  game.travel('village-inn-upper'); useObject(game,'bed-west'); assert.equal(game.systemMenu.kind,'rest'); activateSystemMenu(game); assert.ok(game.resting); assert.equal(game.health.hp,6);
  const point={...game.player}; game.step('right'); assert.deepEqual(game.player,point); game.update(1.3,true);
  assert.equal(game.resting,null); assert.match(game.description,/Herzen/u); assert.equal(game.coins,20);
}

/** Prüft Profilreiter, automatische Waffenwerte und halbe Herzen nach Speichern und Neuladen. */
function profileAndSave() {
  const game=setup(); game.avatar='female'; game.travel('quell-entry'); hit(game); game.back(); game.bagIndex=0;
  navigateBag(game,'up'); navigateBag(game,'right'); assert.equal(game.bagTab,'profile'); assert.match(game.description,/5 von 6/u);
  const fresh=setup(),data=captureGame(game); assert.equal(restoreGame(fresh,data),true); assert.equal(fresh.health.hp,5); assert.equal(fresh.avatar,'female');
  assert.equal(heroStats(fresh).attack,1); fresh.inventory.push('Rostiges Schwert'); assert.equal(heroStats(fresh).attack,2);
  game.back(); assert.equal(game.bagTab,'items'); assert.equal(game.bagOpen,true);
  delete data.health; assert.equal(restoreGame(fresh,data),true); assert.equal(fresh.health.hp,6);
}

/** Verliert ausschließlich Dungeonbeute und erhält den Beutel samt einmaliger Rückholchance nach einem Neustart. */
function deathAndRecovery() {
  const game=setup(); game.travel('quell-gallery'); game.inventory.push('Rostiges Schwert'); game.coins+=8; hit(game,6);
  assert.equal(game.room.id,'village-inn-upper'); assert.equal(game.health.hp,6); assert.deepEqual(game.inventory,['Ast']); assert.equal(game.coins,20);
  assert.deepEqual(game.health.lost.items,['Rostiges Schwert']); assert.equal(game.health.deaths,1);
  const saved=captureGame(game),fresh=setup(); assert.equal(restoreGame(fresh,saved),true); assert.ok(fresh.health.lost);
  fresh.travel('quell-gallery'); fresh.enemies=[]; assert.equal(fresh.occupied(fresh.health.lost.x,fresh.health.lost.y),false); useObject(fresh,'lost-dungeon-loot'); assert.equal(fresh.health.lost,null);
  assert.ok(fresh.inventory.includes('Rostiges Schwert')); assert.equal(fresh.coins,28); dismiss(fresh);
  fresh.travel('mara-cave'); fresh.travel('quell-entry'); hit(fresh,6);
  assert.ok(fresh.inventory.includes('Rostiges Schwert')); assert.equal(fresh.health.lost,null);
}

/** Löscht den alten Beutel bei der zweiten Niederlage, ohne mitgebrachte Münzen oder Ausrüstung zu verlieren. */
function oneRecoveryChance() {
  const game=setup(); game.travel('quell-entry'); game.inventory.push('Feldverband'); game.coins+=3; hit(game,6);
  game.update(1.3,true); dismiss(game); game.travel('quell-gallery'); hit(game,6);
  assert.equal(game.health.lost,null); assert.equal(game.coins,20); assert.deepEqual(game.inventory,['Ast']); assert.equal(game.health.deaths,2);
}

/** Lässt einen vollen Beutel unangetastet liegen und prüft persistierte Verlustdaten auf Manipulation. */
function fullRecoveryAndValidation() {
  const game=setup(); game.travel('quell-entry'); game.inventory.push('Feldverband'); hit(game,6);
  game.update(1.3,true); dismiss(game); game.inventory=['Ast','A','B','C','D','E']; game.travel('quell-entry');
  useObject(game,'lost-dungeon-loot'); assert.ok(game.health.lost); assert.equal(game.inventory.length,6);
  const data=captureGame(game); assert.equal(validSave(game,data),true); data.health.lost.x=-1; assert.equal(validSave(game,data),false);
  data.health.lost.x=2; data.health.hp=NaN; assert.equal(validSave(game,data),false);
}

/** Öffnet den Dungeon ausschließlich nach Bericht und richtiger Wartungsreihenfolge. */
function sourceSequence() {
  const game=setup(); game.travel('mara-cave'); useObject(game,'source-winch'); assert.equal(game.flags.sourceDrained,undefined);
  dismiss(game); game.flags.maraSpringReported=true; useObject(game,'source-winch'); assert.equal(game.flags.sourceDrained,undefined);
  for (const id of ['source-inlet','source-outlet','source-winch']) useObject(game,id);
  assert.equal(game.flags.sourceDrained,true); assert.equal(wall(game,12,9),false); dismiss(game);
  useObject(game,'lower-stairs'); assert.equal(game.room.id,'quell-entry'); assert.ok(game.health.run);
}

/** Prüft angekündigte Bisse, Ausweichchance, Menüpause und echten Angriff über A. */
function combat() {
  const game=setup(); game.travel('quell-gallery'); game.player={x:4,y:6,facing:'right'}; game.enemies=[enemy('test','spider',5,6)];
  game.update(0.9,true); assert.ok(game.enemies[0].windup>0); const hp=game.health.hp; game.back(); game.update(5,true); assert.equal(game.health.hp,hp); game.back();
  game.step('left'); game.update(0.2,true); game.update(0.4,true); assert.equal(game.health.hp,hp);
  game.player={x:4,y:6,facing:'right'}; game.interact(); assert.equal(game.enemies[0].hp,2); updateCombat(game,0.24); assert.equal(game.enemies[0].hp,1); game.interact(); assert.equal(game.enemies[0].hp,1);
  game.update(0.4,true); game.interact(); updateCombat(game,0.24); assert.equal(game.enemies.length,0);
}

/** Verschiebt das reale Gegengewicht auf die begehbare Platte und öffnet den Durchlass dauerhaft. */
function weightPuzzle() {
  const game=setup(); game.travel('quell-sluice'); game.player={x:3,y:5,facing:'right'};
  game.interact(); game.update(0.3,true); game.step('right'); game.update(0.2,true); game.interact(); game.update(0.3,true);
  assert.equal(game.flags.quellGateOpen,true); assert.equal(game.objectAt(8,6),null);
  const fresh=setup(); assert.equal(restoreGame(fresh,captureGame(game)),true); assert.equal(fresh.flags.quellGateOpen,true);
}

/** Besiegt Gegner mit tatsächlichen Angriffen, ohne ihre Lebenswerte direkt zu überschreiben. @param {object} game Spiel. */
function clearWave(game) {
  while (game.enemies.length) {
    const actor=game.enemies[0]; game.player={x:actor.x,y:actor.y+1,facing:'up'}; game.attackCooldown=0;
    game.interact(); updateCombat(game,0.24);
  }
}

/** Führt drei Wellen, einmalige Schwertbelohnung, Tod und echte Rückholung derselben Belohnung durch. */
function wavesAndSword() {
  const game=setup(); game.travel('quell-nest'); clearWave(game); useObject(game,'nest'); dismiss(game);
  for (let wave=1;wave<=3;wave++) {
    assert.equal(game.nestWave,wave); assert.equal(game.enemies.length,wave+1);
    assert.equal(new Set(game.enemies.map(positionKey)).size,game.enemies.length); clearWave(game); updateDungeon(game,1.6);
  }
  assert.equal(game.flags.quellNestCleared,true); dismiss(game); useObject(game,'reward'); assert.ok(game.inventory.includes('Rostiges Schwert'));
  assert.ok(game.notes.some(isMessage)); dismiss(game); useObject(game,'reward'); assert.equal(game.coins,28); dismiss(game); hit(game,6);
  game.update(1.3,true); dismiss(game); game.travel('quell-nest'); assert.equal(game.enemies.length,0);
  useObject(game,'lost-dungeon-loot'); assert.ok(game.inventory.includes('Rostiges Schwert')); assert.equal(game.health.lost,null);
}
/** Vergleicht Spawnpositionen. @param {object} actor Gegner. */
function positionKey(actor) { return `${actor.x},${actor.y}`; }
/** Erkennt den Abschlussfund. @param {object} note Notiz. */
function isMessage(note) { return note.id==='mara-lower-message'; }

/** Prüft alle Ankunfts- und Gegnerfelder und verbindet die fünf Räume über reale Durchgänge. */
function dungeonGeometry() {
  const game=setup();
  for (const room of createQuellDungeon()) {
    game.travel(room.id); assert.equal(wall(game,game.player.x,game.player.y),false);
    for (const actor of game.enemies) { assert.equal(wall(game,actor.x,actor.y),false,actor.id); assert.equal(game.objectAt(actor.x,actor.y),null,actor.id); }
    for (const object of room.objects) if (object.to) {
      const target=game.rooms.get(object.to); assert.ok(target,object.to);
      assert.equal(wall({room:target,flags:{sourceDrained:true}},object.spawn[0],object.spawn[1]),false,`${room.id}/${object.id}`);
    }
  }
  game.travel('quell-entry'); useObject(game,'east'); assert.equal(game.room.id,'quell-gallery'); clearWave(game);
  dismiss(game); useObject(game,'east'); assert.equal(game.room.id,'quell-sluice');
}

/** Erhält Welle, verletzte Gegner, Schaden und Beute beim Fortsetzen mitten im Kampf. */
function resumeCombat() {
  const game=setup(); game.travel('quell-nest'); clearWave(game); useObject(game,'nest'); dismiss(game);
  clearWave(game); updateDungeon(game,1.6); game.enemies[0].hp=1; game.health.hp=4;
  const data=captureGame(game),fresh=setup(); assert.equal(validSave(game,data),true); assert.equal(restoreGame(fresh,data),true);
  assert.equal(fresh.nestWave,2); assert.equal(fresh.enemies.length,3); assert.equal(fresh.enemies[0].hp,1); assert.equal(fresh.health.hp,4);
  const invalid=structuredClone(data); invalid.combat.enemies[0].x=-1; assert.equal(validSave(game,invalid),false);
  invalid.combat.enemies[0].x=data.combat.enemies[0].x; invalid.combat.enemies[0].species='dog'; assert.equal(validSave(game,invalid),false);
}

/** Verbraucht Verbände über echte Rucksackaktionen nur bei Bedarf und begrenzt die Heilung. */
function bandageInBag() {
  const game=setup(); game.travel('quell-entry'); game.inventory.push('Feldverband'); game.back(); game.bagIndex=1;
  game.interact(); game.interact(); assert.ok(game.inventory.includes('Feldverband')); dismiss(game); game.back(); game.back();
  hit(game,3); game.back(); game.bagIndex=1; game.interact(); game.interact();
  assert.equal(game.health.hp,6); assert.equal(game.inventory.includes('Feldverband'),false);
}

test('Leben: halbe Herzen, Menüschutz und eigenes Bett',healthAndBed);
test('Profil: Reiter, Werte und alte wie neue Speicherstände',profileAndSave);
test('Niederlage: nur neue Beute, persistente Rückholung und sicheres Banken',deathAndRecovery);
test('Niederlage: genau eine Chance auf den alten Beutel',oneRecoveryChance);
test('Beutel: volle Fächer und ungültige Speicherwerte',fullRecoveryAndValidation);
test('Quellgewölbe: Bericht, Wartungsreihenfolge und begehbare Treppe',sourceSequence);
test('Kampf: Warnung, Ausweichen, Menüpause, A und Abklingzeit',combat);
test('Gewölbe: echte Kiste, Druckplatte und persistentes Gitter',weightPuzzle);
test('Spinnenbrut: drei Wellen, Schwert und Rückholung nach Niederlage',wavesAndSword);
test('Gewölbe: Ankünfte, Gegner und tatsächliche Raumverbindungen sind begehbar',dungeonGeometry);
test('Kampf speichern: laufende Welle und verletzte Gegner bleiben erhalten',resumeCombat);
test('Feldverband: Rucksackaktion, bedarfsgerechter Verbrauch und Heilgrenze',bandageInBag);
