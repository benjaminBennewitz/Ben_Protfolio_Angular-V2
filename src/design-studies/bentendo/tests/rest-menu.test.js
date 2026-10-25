import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame,useObject,dismiss } from './helpers.js';
import { createVillage } from '../scripts/game/data/village.js';
import { createVillageInteriors } from '../scripts/game/data/house-rooms.js';
import { navigateSystemMenu,activateSystemMenu } from '../scripts/game/systems/system-menu.js';
import { minuteOfDay,dayPhase } from '../scripts/game/systems/world-clock.js';
import { restChoiceLabel } from '../scripts/game/systems/rest-menu.js';
import { captureGame,restoreGame } from '../scripts/game/systems/save-state.js';

/** Lädt das eigene Bett mit verwundetem Helden. */
function world() {
  const game=createGame();
  for (const room of [createVillage(),...createVillageInteriors()]) game.rooms.set(room.id,room);
  game.reset(); game.mode='world'; game.travel('village-inn-upper'); game.health.hp=2; return game;
}

/** Öffnet die Auswahl ohne Heilung oder Zeitsprung und lässt mit B abbrechen. */
function cancelledRest() {
  const game=world(); useObject(game,'bed-west'); const time=game.worldMinutes;
  assert.equal(game.systemMenu.kind,'rest'); assert.equal(game.health.hp,2); assert.equal(game.resting,null);
  game.update(60,false); assert.equal(game.worldMinutes,time); game.back();
  assert.equal(game.systemMenu,null); assert.equal(game.worldMinutes,time); assert.equal(game.health.hp,2);
}

/** Bestätigt alle drei Tageszeiten über dieselben Richtungstasten und erhält den verlorenen Beutel. */
function restTargets() {
  for (const [choice,target,phase] of [[0,420,'Morgen'],[1,1140,'Abend'],[2,1260,'Nacht']]) {
    const game=world(); game.health.lost={room:'test',items:['Ast']}; useObject(game,'bed-west');
    for (let i=0;i<choice;i++) navigateSystemMenu(game,'down');
    activateSystemMenu(game); assert.equal(game.health.hp,6); assert.ok(game.resting);
    assert.equal(minuteOfDay(game),target); assert.equal(dayPhase(game),phase); assert.ok(game.health.lost);
    game.update(1.3,false); assert.equal(game.resting,null); assert.ok(game.message); dismiss(game);
  }
}

/** Nennt einen Tageswechsel, verhindert Rücksprünge und erhält die bestätigte Zeit beim Laden. */
function nextDayAndSave() {
  const game=world(); game.worldMinutes=1261; useObject(game,'bed-west');
  assert.match(restChoiceLabel(game,2),/\+1 Tag/u);
  navigateSystemMenu(game,'down'); navigateSystemMenu(game,'down'); activateSystemMenu(game);
  assert.equal(game.worldMinutes,1440+1260);
  const loaded=world(); assert.equal(restoreGame(loaded,captureGame(game)),true);
  assert.equal(loaded.worldMinutes,2700); assert.equal(loaded.health.hp,6);
}

/** Beendet den Menüpunkt Zurück ohne Bettruhe und umschließt die Auswahl in beide Richtungen. */
function backChoice() {
  const game=world(); useObject(game,'bed-west'); const time=game.worldMinutes;
  navigateSystemMenu(game,'up'); assert.equal(game.systemMenu.choice,3); activateSystemMenu(game);
  assert.equal(game.systemMenu,null); assert.equal(game.resting,null); assert.equal(game.health.hp,2); assert.equal(game.worldMinutes,time);
}

test('Bettruhe: Auswahl und Abbruch verbrauchen keine Zeit und heilen nicht',cancelledRest);
test('Bettruhe: Morgen, Abend und Nacht erst nach Bestätigung',restTargets);
test('Bettruhe: nächster Tag und konsistenter gespeicherter Aufwachzeitpunkt',nextDayAndSave);
test('Bettruhe: Zurück und umlaufende Tastaturnavigation',backChoice);
