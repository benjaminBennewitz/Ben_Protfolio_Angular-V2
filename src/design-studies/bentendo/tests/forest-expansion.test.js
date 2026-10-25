import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createGame,useObject,dismiss } from './helpers.js';
import { createVillage,createGuildEntrance } from '../scripts/game/data/village.js';
import { createVillageInteriors } from '../scripts/game/data/house-rooms.js';
import { createEastRooms } from '../scripts/game/data/east-rooms.js';
import { captureGame,restoreGame } from '../scripts/game/systems/save-state.js';
import { useEastCanteen } from '../scripts/game/systems/east-story.js';
import { passageArea } from '../scripts/game/data/forest-passages.js';
import { questEntries } from '../scripts/game/systems/quest-log.js';

/** Lädt den aktuellen Ostabschnitt samt echter Dorf- und Inventarlogik. */
function forestWorld() {
  const game=createGame();
  for (const room of [createVillage(),createGuildEntrance(),...createVillageInteriors(),...createEastRooms()]) game.rooms.set(room.id,room);
  game.reset(); game.mode='world'; game.flags.eastOpen=true; game.travel('east-wood'); return game;
}

/** Prüft beide Rundwege samt Rückkehr zu Eda und ins Dorf über normale Eingaben. */
function forestLoop() {
  const game=forestWorld(),visited=new Set(['east-wood']);
  const route=[['to-clearing','east-crossroads'],['north','east-ferns'],['east','east-thicket'],['south','east-oak'],['return','east-crossroads'],['east','east-oak'],['north','east-thicket'],['east','east-clearing'],['return','east-thicket'],['return','east-ferns'],['return','east-crossroads'],['return','east-wood']];
  for (const [exit,target] of route) {
    useObject(game,exit); assert.equal(game.room.id,target); visited.add(target);
    assert.equal(game.occupied(game.player.x,game.player.y),false,`${target}: belegte Ankunft`);
  }
  assert.equal(visited.size,6); useObject(game,'return'); assert.equal(game.room.id,'village');
}

/** Erkennt die leere Flasche, belohnt erst Wasser und benötigt kein zusätzliches Fach. */
function emptyCanteen() {
  const game=forestWorld(); useObject(game,'canteen'); dismiss(game); game.inventory.push(...Array(5).fill('Ast'));
  useObject(game,'eda'); assert.equal(game.flags.eastBottleRecognized,true); assert.equal(game.coins,0);
  assert.equal(game.flags.eastCanteenDone,undefined); assert.ok(game.inventory.includes('Feldflasche'));
  assert.notEqual(questEntries(game).find(canteenQuest).status,'ready'); dismiss(game);
  game.travel('village'); game.player={x:7,y:9,facing:'up'};
  const well=game.objects.find(/** Erkennt den Brunnen. @param {object} object Objekt. */ object=>object.kind==='well'); game.player={x:well.x,y:well.y+1,facing:'up'};
  useEastCanteen(game,'Feldflasche'); dismiss(game); assert.ok(game.inventory.includes('Volle Feldflasche'));
  game.travel('east-wood'); useObject(game,'eda'); dismiss(game);
  assert.equal(game.flags.eastCanteenDone,true); assert.equal(game.coins,3); assert.equal(game.inventory.length,6);
  assert.ok(game.inventory.includes('Feldverband')); useObject(game,'eda'); dismiss(game); assert.equal(game.coins,3);
}

/** Erkennt den Flaschenauftrag unabhängig von der Anzahl weiterer Aufgaben. @param {object} entry Quest. */
function canteenQuest(entry) { return entry.id===9; }

/** Gibt bei leerer Benutzung vor Eda einen Wasserhinweis statt einer Belohnung. */
function inventoryReturn() {
  const game=forestWorld(); game.inventory=['Feldflasche']; game.player={x:9,y:12,facing:'up'};
  game.bagOpen=true; game.bagIndex=0; game.bagAction=true; game.bagChoice=0; game.interact();
  assert.equal(game.flags.eastCanteenDone,undefined); assert.equal(game.coins,0);
  assert.deepEqual(game.inventory,['Feldflasche']); assert.equal(game.flags.eastBottleRecognized,true);
}

/** Erhält sowohl offene Flaschenaufträge als auch zuvor abgeschlossene Rückgaben. */
function savedBottle() {
  const game=forestWorld(); game.inventory=['Feldflasche']; game.flags.eastEdaMet=true;
  const restored=forestWorld(); assert.equal(restoreGame(restored,captureGame(game)),true);
  useObject(restored,'eda'); dismiss(restored); assert.equal(restored.flags.eastCanteenDone,undefined);
  game.flags.eastCanteenDone=true; game.inventory=['Feldverband']; game.coins=3;
  const second=forestWorld(); assert.equal(restoreGame(second,captureGame(game)),true);
  useObject(second,'eda'); dismiss(second); assert.equal(second.flags.eastCanteenDone,true); assert.equal(second.coins,3);
}

/** Lässt die optionale leere Flasche den Abschluss der Waldbeobachtungen nicht sperren. */
function optionalBottle() {
  const game=forestWorld(); game.inventory=['Feldflasche']; useObject(game,'eda'); dismiss(game);
  useObject(game,'ribbon'); dismiss(game); game.travel('east-clearing');
  useObject(game,'tracks'); dismiss(game); useObject(game,'root-door'); dismiss(game);
  game.travel('village-inn'); useObject(game,'eda'); dismiss(game);
  assert.equal(game.flags.eastTrailDone,true); assert.equal(game.flags.eastCanteenDone,undefined);
}

/** Prüft alle Wegöffnungen auf durchgehenden Boden und vollständig entfernte Kronen. */
function visiblePassages() {
  for (const room of createEastRooms().filter(landscape)) for (const exit of room.objects.filter(/** Erkennt den Weg. @param {object} object Objekt. */ object=>object.kind==='trail')) {
    const area=passageArea(room,exit);
    for (let y=area.y;y<area.y+area.h;y++) for (let x=area.x;x<area.x+area.w;x++) {
      assert.equal(room.ground[y][x],'.',`${room.id}: Wegboden ${x},${y}`);
      assert.equal(room.trees.some(/** Prüft die Krone. @param {Array} tree Baum. */ tree=>x>=tree[0] && x<tree[0]+2 && y>=tree[1] && y<tree[1]+2),false,`${room.id}: Krone ${x},${y}`);
    }
  }
}

/** Hält die gesamte Waldregion auf einem vorhandenen eigenen Track und bewahrt die Werkstationsmusik. */
function forestMusic() {
  const rooms=createEastRooms(),woods=rooms.filter(landscape);
  assert.equal(woods.length,6);
  for (const room of woods) assert.equal(room.music,'forest-canopy');
  assert.equal(rooms.find(pump).music,'maras-quellplan');
  const music=new URL('../assets/sounds/forest-canopy.mp3',import.meta.url);
  assert.ok(fs.statSync(music).size>100000);
}

/** Erkennt die tatsächlich dargestellten Waldgebiete. @param {object} room Raum. */
function landscape(room) { return room.villageLandscape; }

/** Erkennt die unveränderte Werkstation. @param {object} room Raum. */
function pump(room) { return room.id==='east-pump'; }

test('Wald: sechs Gebiete, zwei Wege, Rundweg und sichere Rückkehr',forestLoop);
test('Eda: Wasser erforderlich, voller Beutel und einmalige Belohnung',emptyCanteen);
test('Eda: leere Flasche über den Rucksack erkennen',inventoryReturn);
test('Eda: offene und abgeschlossene alte Flaschenstände bleiben erhalten',savedBottle);
test('Waldmusik: eigener durchgehender Track in allen sechs Waldgebieten',forestMusic);

test('Wald: optionale leere Flasche blockiert keine Hauptgeschichte',optionalBottle);
test('Wald: jeder Übergang hat einen sichtbaren Pfad ohne Baumkronen',visiblePassages);
