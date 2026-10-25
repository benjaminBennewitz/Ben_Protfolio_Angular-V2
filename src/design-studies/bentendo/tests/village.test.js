import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, use, useObject, dismiss, go } from './helpers.js';
import { createVillageInteriors } from '../scripts/game/data/house-rooms.js';
import { createVillage, createGuildEntrance } from '../scripts/game/data/village.js';

/** Erstellt den Auftakt mit denselben Spielsystemen wie die vorhandenen Räume. */
function villageGame() {
  const game = createGame();
  for (const room of [createVillage(),createGuildEntrance(),...createVillageInteriors()]) game.rooms.set(room.id,room);
  game.reset(); game.interact(); game.interact(); dismiss(game);
  return game;
}

/** Prüft Einstieg, Kartenhindernisse und sämtliche wichtigen Ziele über echte Laufwege. */
function reachableVillage() {
  const game = villageGame();
  assert.equal(game.room.id,'village'); assert.equal(game.notes[0].id,'invitation');
  assert.equal(game.occupied(11,19),false); assert.equal(game.occupied(17,11),true);
  assert.equal(game.occupied(17,12),false); assert.equal(game.occupied(10,4),true);
  for (const [x,y] of [[12,6],[14,7],[15,10],[17,8],[16,9],[4,12],[5,14],[3,14],[19,15]]) {
    use(game,x,y); dismiss(game); if (game.room.id!=='village') useObject(game,'exit');
  }
  assert.equal(game.flags.waterFlowing,undefined);
}

/** Löst das Wehr, ohne optionale Notizen oder einen vorangehenden Dialog vorauszusetzen. @param {object} game Spiel. */
function releaseWater(game) {
  use(game,17,8); dismiss(game); use(game,17,8); dismiss(game);
  assert.equal(game.objectAt(17,8),null);
  use(game,16,9); dismiss(game); assert.equal(game.flags.waterFlowing,true);
}

/** Prüft die vollständige Aufgabe einschließlich Abschlussraum und Rückkehr. */
function completeOpening() {
  const game = villageGame();
  use(game,12,6); dismiss(game); assert.equal(game.room.id,'village');
  use(game,16,9); dismiss(game); assert.equal(game.flags.waterFlowing,undefined);
  releaseWater(game); go(game,11,14);
  for (let i=0;i<30;i++) game.update(0.1,false);
  assert.equal(game.flags.guildOpen,true); dismiss(game);
  use(game,12,6); assert.equal(game.room.id,'village-guild');
  useObject(game,'ledger'); dismiss(game); useObject(game,'keeper'); dismiss(game);
  useObject(game,'exit'); assert.equal(game.room.id,'village');
  assert.equal(game.flags.waterFlowing,true); assert.equal(game.objectAt(17,8),null);
  game.reset(); assert.equal(game.flags.guildOpen,undefined); assert.equal(game.notes.length,1);
}

/** Prüft das Journal auf einmalige Funde und Zustandserhalt bei Ortswechseln. */
function optionalNote() {
  const game = villageGame();
  use(game,19,15); dismiss(game); assert.equal(game.notes.filter(fieldNote).length,1);
  assert.equal(game.objectAt(19,15),null);
  game.travel('village-guild'); game.travel('village');
  assert.equal(game.notes.filter(fieldNote).length,1); assert.equal(game.objectAt(19,15),null);
}

/** Erkennt die untersuchte Feldnotiz unabhängig von nebenbei gehörten Gerüchten. @param {object} note Journalnotiz. */
function fieldNote(note) { return note.id==='cartographer-1'; }

/** Prüft Dialogpausen und einen versperrten Hausmeisterweg bei reduzierter Bewegung. */
function keeperPauses() {
  const game = villageGame(); releaseWater(game);
  game.player.x=14; game.player.y=10; const actor=game.roomState.keeper;
  game.update(1,true); assert.equal(actor.index,0); assert.equal(actor.waiting,true);
  game.say('Du','Einen Moment.'); game.update(1,true); assert.equal(actor.index,0); dismiss(game);
  game.journal(); game.update(1,true); assert.equal(actor.index,0); game.journal();
  assert.ok(game.step('down')); game.update(0.1,true); assert.equal(game.animating,true);
  go(game,11,14);
  for (let i=0;i<30;i++) game.update(0.1,true);
  assert.equal(game.flags.guildOpen,true);
}

test('Dorf: Einstieg und wichtige Objekte erreichbar',reachableVillage);
test('Dorf: Wehr, Hausmeister, Gilde und Rückweg',completeOpening);
test('Dorf: optionale Notiz bleibt im Journal',optionalNote);
test('Dorf: Hausmeister wartet bei Hindernissen und Dialogen',keeperPauses);

/** Prüft die vergrößerte Stadt, feste Pfosten und alle neuen Begegnungen über echte Wege. */
function expandedDistricts() {
  const game=villageGame();
  assert.ok(game.room.width*game.room.height>=24*22*2);
  go(game,7,13); assert.equal(game.step('up'),false);
  assert.equal(game.occupied(14,16),false); assert.equal(game.occupied(3,17),false);
  for (const object of game.room.objects) {
    if (!['resident','village-post'].includes(object.kind) && !['weaver-door','home-door','workshop-door','market-door'].includes(object.id)) continue;
    use(game,object.x,object.y); dismiss(game);
    if (game.room.id!=='village') useObject(game,'exit');
  }
  go(game,16,26); assert.ok(game.step('right')); game.update(0.2,false);
  assert.equal(game.player.x,17);
}

/** Prüft die Kartenbedienung und das Pausieren der Welt über den Rucksack. */
function backpackMap() {
  const game=villageGame(); game.back(); assert.equal(game.bagOpen,true);
  game.interact(); assert.equal(game.mapOpen,true); assert.equal(game.bagOpen,false);
  const time=game.time; game.update(2,false); assert.equal(game.time,time);
  assert.equal(game.step('up'),false); assert.equal(game.animating,false);
  game.back(); assert.equal(game.mapOpen,false); assert.equal(game.bagOpen,true);
  game.back(); assert.equal(game.bagOpen,false);
  game.travel('village-guild'); game.back(); game.interact();
  assert.equal(game.mapOpen,true); assert.match(game.description,/Gilde/u);
  game.journal(); assert.equal(game.mapOpen,false); assert.equal(game.journalOpen,true);
}

/** Prüft die kurze Ortsmeldung ohne erzwungene Dialogpause oder Wiederholung. */
function locationNotice() {
  const game=villageGame(); assert.equal(game.locationNotice,null); game.travel('village'); assert.equal(game.locationNotice.title,'Bruchstein');
  assert.equal(game.message,null); game.update(1,false); assert.ok(game.locationNotice);
  game.back(); game.update(2,false); assert.ok(game.locationNotice); game.back();
  game.update(1,false); assert.equal(game.locationNotice,null);
  game.travel('village-guild'); assert.equal(game.locationNotice.title,'Die verlassene Gilde');
  game.update(2,true); assert.equal(game.locationNotice,null);
}

test('Dorf: Erweiterung, Pfosten und Begegnungen erreichbar',expandedDistricts);
test('Karte: Rucksack, Standort und pausierte Spielwelt',backpackMap);
test('Ortsmeldung: kurz sichtbar und beim Erkunden nicht blockierend',locationNotice);
