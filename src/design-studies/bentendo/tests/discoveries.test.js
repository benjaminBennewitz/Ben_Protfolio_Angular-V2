import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, use, useObject, dismiss } from './helpers.js';
import { createVillage, createGuildEntrance } from '../scripts/game/data/village.js';
import { createVillageInteriors } from '../scripts/game/data/house-rooms.js';
import { chest } from '../scripts/game/systems/loot.js';

/** Erstellt die vollständige Stadt für reguläre Interaktionen mit Fundstellen und Bewohnern. */
function discoveryGame() {
  const game=createGame();
  for (const room of [createVillage(),createGuildEntrance(),...createVillageInteriors()]) game.rooms.set(room.id,room);
  game.reset(); game.mode='world'; game.flags.guildOpen=true; return game;
}

/** Spielt die komplette Hinweisfolge und einmalige Rückgabe ohne Positionssprünge durch. */
function memoryStory() {
  const game=discoveryGame();
  use(game,4,12); useObject(game,'table-a'); assert.ok(hasNote(game,'moos-request')); useObject(game,'exit');
  use(game,21,25); useObject(game,'shelf-a'); assert.ok(hasNote(game,'moos-trail')); useObject(game,'exit');
  useObject(game,'moos-cache'); assert.ok(game.inventory.includes('Blaue Brosche')); assert.ok(hasNote(game,'moos-letter'));
  use(game,28,22); useObject(game,'grandmother'); assert.equal(game.flags.memoryReturned,true);
  assert.equal(game.inventory.includes('Blaue Brosche'),false); assert.equal(game.coins,8);
  assert.match(game.notes.find(isRequest).text,/Erledigt/u);
  useObject(game,'grandmother'); assert.equal(game.coins,8); useObject(game,'exit');
  useObject(game,'moos-cache'); assert.equal(game.inventory.includes('Blaue Brosche'),false); assert.equal(game.coins,8);
  game.reset(); assert.equal(game.coins,0); assert.equal(game.flags.memoryReturned,undefined); assert.equal(game.notes.length,1);
  assert.equal(game.objects.find(isCache).searched,undefined);
}

/** Prüft sinnvolle Krimskrams-Tausche sowie einmalige Münzfunde nach Raumwechseln. */
function trinketsAndCoins() {
  const game=discoveryGame();
  use(game,4,12); useObject(game,'vase-1'); assert.ok(game.inventory.includes('Messingknopf')); useObject(game,'exit');
  useObject(game,'carpenter'); assert.equal(game.coins,2); assert.equal(game.inventory.length,0);
  useObject(game,'carpenter'); assert.equal(game.coins,2);
  use(game,28,22); useObject(game,'vase-2'); assert.ok(game.inventory.includes('Glasperle')); useObject(game,'exit');
  useObject(game,'fisher'); assert.equal(game.coins,3); assert.equal(game.inventory.length,0);
  useObject(game,'fisher'); assert.equal(game.coins,3);
  use(game,5,25); useObject(game,'parts'); assert.equal(game.coins,7); useObject(game,'exit');
  use(game,5,25); useObject(game,'parts'); assert.equal(game.coins,7); useObject(game,'exit');
  use(game,20,8); useObject(game,'grain-a'); assert.equal(game.coins,9);
  useObject(game,'grain-a'); assert.equal(game.coins,9);
}

/** Prüft atomare Funde bei vollem Rucksack und weiterhin frei sammelbare Notizen. */
function fullInventory() {
  const game=discoveryGame(); game.inventory=Array(6).fill('Testgepäck');
  use(game,4,12); useObject(game,'vase-1'); assert.equal(game.roomState.taken.has('vase-1'),false);
  useObject(game,'table-a'); assert.ok(hasNote(game,'moos-request')); useObject(game,'exit');
  useObject(game,'moos-cache'); assert.equal(game.roomState.taken.has('moos-cache'),false); assert.equal(hasNote(game,'moos-letter'),false);
  assert.equal(game.coins,0); game.inventory.pop();
  useObject(game,'moos-cache'); assert.equal(game.inventory.length,6); assert.ok(hasNote(game,'moos-letter'));
  use(game,28,22); useObject(game,'grandmother'); assert.equal(game.inventory.length,5); assert.equal(game.coins,8);
}

/** Prüft dauerhaft sichtbare durchsuchte Vasen und wiederlesbare Tischzettel ohne doppelte Notizen. */
function searchedState() {
  const game=discoveryGame(); use(game,4,12); game.sounds=[];
  useObject(game,'vase-2'); assert.equal(game.sounds.includes('pickup'),false);
  const vase=game.objects.find(isSecondVase); assert.equal(vase.searched,true); assert.equal(vase.hint,'erneut ansehen');
  useObject(game,'table-a'); const count=game.notes.length;
  useObject(game,'table-a'); assert.equal(game.notes.length,count); assert.match(game.message.speaker,/Gästetisch/u);
  useObject(game,'exit'); use(game,4,12); assert.equal(game.objects.find(isSecondVase).searched,true);
  useObject(game,'vase-2'); assert.match(game.message.lines.join(' '),/Schon durchsucht/u); dismiss(game);
}

/** Prüft alle neun belegten Fundstellen, vier eindeutige Notizen und erreichbare Möbelaktionen. */
function discoveryInventory() {
  const game=discoveryGame(),notes=new Set(); let finds=0;
  for (const room of game.rooms.values()) {
    if (room.id!=='village' && !room.furnished) continue;
    game.travel(room.id);
    for (const object of room.objects) {
      const found=object.discovery;
      if (!found || (!found.note && !found.item && !found.coins)) continue;
      finds++; if (found.note) notes.add(found.note.id);
      useObject(game,object.id); assert.ok(game.message); assert.equal(game.objects.find(sameId.bind(null,object.id)).searched,true); dismiss(game);
    }
  }
  assert.equal(finds,9); assert.equal(notes.size,4);
}

/** Prüft freie Fundreihenfolge und voneinander unabhängige Durchläufe. */
function foundBeforeHints() {
  const game=discoveryGame();
  useObject(game,'moos-cache'); assert.equal(hasNote(game,'moos-request'),false);
  use(game,28,22); useObject(game,'grandmother'); assert.equal(game.flags.memoryReturned,true);
  assert.equal(game.coins,8); assert.match(game.notes.find(isRequest).text,/Erledigt/u);
  const fresh=discoveryGame(); use(fresh,4,12); useObject(fresh,'table-a');
  assert.match(fresh.notes.find(isRequest).text,/Meine blaue Brosche/u);
  assert.equal(fresh.flags.memoryReturned,undefined);
}

/** Prüft Türklang beim Betreten und einmaligen Öffnungsklang tatsächlich geöffneter Truhen. */
function openingSounds() {
  const game=discoveryGame(); game.sounds=[];
  use(game,4,12); assert.ok(game.sounds.includes('door')); useObject(game,'exit');
  game.sounds=[]; useObject(game,'moos-cache'); assert.ok(game.sounds.includes('chest')); assert.ok(game.sounds.includes('treasure'));
  game.sounds=[]; useObject(game,'moos-cache'); assert.equal(game.sounds.includes('chest'),false); assert.equal(game.sounds.includes('treasure'),false);
  use(game,5,25); game.sounds=[]; useObject(game,'parts'); assert.ok(game.sounds.includes('chest'));
  game.sounds=[]; useObject(game,'parts'); assert.equal(game.sounds.includes('chest'),false);
  game.sounds=[]; useObject(game,'vase-1'); assert.equal(game.sounds.includes('chest'),false);
}

/** Prüft Truhenjubel nur bei erfolgreicher Beute, auch für die ursprünglichen Truhen. */
function rewardConditions() {
  const game=discoveryGame(),box={id:'audio-box',item:'Schlüssel',coins:2};
  game.inventory=Array(6).fill('Gepäck'); game.sounds=[]; chest(game,box);
  assert.equal(game.sounds.includes('chest'),false); assert.equal(game.sounds.includes('treasure'),false);
  assert.equal(game.coins,0); game.inventory.pop(); game.sounds=[]; chest(game,box);
  assert.equal(game.coins,2); assert.ok(game.inventory.includes('Schlüssel'));
  assert.equal(game.sounds.filter(isTreasure).length,1); assert.ok(game.sounds.includes('chest'));
  game.sounds=[]; chest(game,box); assert.equal(game.sounds.includes('treasure'),false);
  game.sounds=[]; chest(game,{id:'empty-audio-box'}); assert.ok(game.sounds.includes('chest')); assert.equal(game.sounds.includes('treasure'),false);
}
/** Erkennt den Erfolgsklang. @param {string} cue Klangkennung. */
function isTreasure(cue) { return cue==='treasure'; }

/** Sucht eine bereits gesammelte Notiz. @param {object} game Spiel. @param {string} id Notizkennung. */
function hasNote(game,id) { return game.notes.some(sameId.bind(null,id)); }
/** Vergleicht eine Kennung. @param {string} id Gesuchte Kennung. @param {object} object Eintrag. */
function sameId(id,object) { return object.id===id; }
/** Erkennt den aktualisierten Suchauftrag. @param {object} entry Notiz. */
function isRequest(entry) { return entry.id==='moos-request'; }
/** Erkennt die Reisetruhe. @param {object} object Fundstelle. */
function isCache(object) { return object.id==='moos-cache'; }
/** Erkennt die zweite Vase im jeweiligen Raum. @param {object} object Vase. */
function isSecondVase(object) { return object.id==='vase-2'; }

test('Entdeckungen: Hinweisfolge, Broschenrückgabe und Neustart',memoryStory);
test('Entdeckungen: Krimskrams tauschen und Münzen nur einmal sammeln',trinketsAndCoins);
test('Entdeckungen: voller Rucksack verliert weder Brosche noch Brief',fullInventory);
test('Entdeckungen: durchsuchte Behälter bleiben sichtbar und Texte wiederlesbar',searchedState);
test('Entdeckungen: neun erreichbare Fundstellen und vier Notizen',discoveryInventory);
test('Entdeckungen: Brosche vor den Hinweisen und unabhängige Durchläufe',foundBeforeHints);
test('Audio: Türen und Truhen melden tatsächliches Öffnen',openingSounds);
test('Audio: Truhenjubel nur bei erfolgreicher einmaliger Beute',rewardConditions);
