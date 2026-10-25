import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../scripts/game/game.js';
import { createVillage,createGuildEntrance } from '../scripts/game/data/village.js';
import { createVillageInteriors } from '../scripts/game/data/house-rooms.js';
import { navigateBag } from '../scripts/game/systems/inventory.js';
import { useObject,dismiss } from './helpers.js';

/** Erstellt alle Dorfaufgaben in einer echten Spielinstanz. */
function taskGame() {
  const map=new Map();
  for (const room of [createVillage(),createGuildEntrance(),...createVillageInteriors()]) map.set(room.id,room);
  const game=new Game(map); game.mode='world'; game.flags.guildOpen=true; return game;
}
/** Erkennt genau einen Quest-Erfolgsklang. @param {string} cue Klangkennung. */
function isSuccess(cue) { return cue==='success-quest'; }

/** Prüft erreichbare Fächer, Karte, Ansehen, Rücknavigation und pausierte Spielzeit. */
function inventoryNavigation() {
  const game=taskGame(); game.inventory=['Ast','Blaue Brosche']; game.back();
  assert.equal(game.bagIndex,6); navigateBag(game,'up'); assert.equal(game.bagIndex,4);
  navigateBag(game,'up'); navigateBag(game,'up'); assert.equal(game.bagIndex,0);
  game.interact(); assert.equal(game.bagAction,true); navigateBag(game,'right'); game.interact();
  assert.equal(game.message.speaker,'Ast'); const time=game.time; game.update(2,false); assert.equal(game.time,time);
  dismiss(game); assert.equal(game.bagOpen,true); game.back(); assert.equal(game.bagAction,false);
  navigateBag(game,'right'); assert.equal(game.bagIndex,1); navigateBag(game,'down'); navigateBag(game,'down'); navigateBag(game,'down');
  assert.equal(game.bagIndex,7); navigateBag(game,'left'); assert.equal(game.bagIndex,6); game.interact(); assert.equal(game.mapOpen,true); game.back(); assert.equal(game.bagOpen,true);
}

/** Verwendet die Brosche aus dem Rucksack direkt bei Frau Moos mit genau einem hörbaren Erfolg. */
function useBrooch() {
  const game=taskGame(); game.travel('village-home'); game.inventory=['Blaue Brosche'];
  game.player={x:7,y:8,facing:'up'}; game.back(); game.bagIndex=0; game.interact(); game.sounds=[]; game.interact();
  assert.equal(game.flags.memoryReturned,true); assert.equal(game.inventory.length,0); assert.equal(game.coins,8);
  assert.equal(game.sounds.filter(isSuccess).length,1); assert.equal(game.sounds.includes('talk'),false);
  dismiss(game); game.sounds=[]; useObject(game,'grandmother'); assert.equal(game.sounds.filter(isSuccess).length,0);
}

/** Prüft die vollständige Garnsuche über Auftrag, echten Fund und einmalige Rückgabe. */
function spoolQuest() {
  const game=taskGame(); game.travel('village-weaver'); useObject(game,'weaver-helper'); assert.equal(game.flags.spoolStarted,true);
  game.travel('village-workshop'); useObject(game,'cabinet-a'); assert.ok(game.inventory.includes('Garnspule'));
  game.travel('village-weaver'); game.sounds=[]; useObject(game,'weaver-helper');
  assert.equal(game.flags.spoolDone,true); assert.equal(game.coins,4); assert.equal(game.inventory.includes('Garnspule'),false);
  assert.equal(game.sounds.filter(isSuccess).length,1); useObject(game,'weaver-helper'); assert.equal(game.coins,4);
  assert.ok(game.notes.some(completedSpool));
}
/** Erkennt die erledigte Garnsuche. @param {object} note Notiz. */
function completedSpool(note) { return note.id==='task-spool' && note.text.startsWith('Erledigt'); }

/** Verhindert Verlust der Spule bei vollem Rucksack und erlaubt Finden vor dem Auftrag. */
function earlySpool() {
  const game=taskGame(); game.travel('village-workshop'); game.inventory=Array(6).fill('Gepäck');
  useObject(game,'cabinet-a'); assert.equal(game.roomState.taken.has('cabinet-a'),false);
  game.inventory.pop(); useObject(game,'cabinet-a'); assert.equal(game.inventory.length,6);
  game.travel('village-weaver'); useObject(game,'weaver-helper'); assert.equal(game.flags.spoolDone,true); assert.equal(game.coins,4);
}

/** Prüft drei eindeutige Vorräte, Zwischenbericht, Raumwechsel und einmalige Bezahlung. */
function stockQuest() {
  const game=taskGame(); game.travel('village-market'); useObject(game,'storekeeper');
  assert.equal(game.flags.stockStarted,true); useObject(game,'barrel-e'); useObject(game,'barrel-e');
  assert.equal(game.flags.stockChecked.length,1); useObject(game,'storekeeper'); assert.equal(game.coins,0);
  useObject(game,'barrel-f'); game.travel('village'); game.travel('village-market');
  useObject(game,'shelf-b'); assert.equal(game.flags.stockChecked.length,3); assert.equal(game.flags.stockDone,undefined);
  useObject(game,'storekeeper'); assert.equal(game.flags.stockDone,true); assert.equal(game.coins,5);
  useObject(game,'storekeeper'); assert.equal(game.coins,5); game.reset(); assert.equal(game.flags.stockStarted,undefined);
}

test('Rucksack: Fächerwahl, Gegenstandsaktionen, Beschreibung und Kartenrückweg',inventoryNavigation);
test('Rucksack: Brosche benutzen übergibt sie mit genau einer Questfanfare',useBrooch);
test('Dorfaufgabe: Garnspule finden und einmalig beim Lehrling abgeben',spoolQuest);
test('Dorfaufgabe: früher Garnfund und voller Rucksack verlieren nichts',earlySpool);
test('Dorfaufgabe: Vorratskontrolle mit drei echten Prüfungen und Abschlussbericht',stockQuest);
