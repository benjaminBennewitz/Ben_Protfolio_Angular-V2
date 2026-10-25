import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame,useObject,dismiss } from './helpers.js';
import { createVillage } from '../scripts/game/data/village.js';
import { createVillageInteriors } from '../scripts/game/data/house-rooms.js';
import { createEastRooms } from '../scripts/game/data/east-rooms.js';
import { minuteOfDay,dayPhase,nightShade } from '../scripts/game/systems/world-clock.js';
import { captureGame,restoreGame } from '../scripts/game/systems/save-state.js';
import { sleepInBed } from '../scripts/game/systems/health.js';

/** Lädt den Wald und das eigene Bett mit echter Lauf- und Speicherlogik. */
function world() {
  const game=createGame();
  for (const room of [createVillage(),...createVillageInteriors(),...createEastRooms()]) game.rooms.set(room.id,room);
  game.reset(); game.mode='world'; game.travel('east-clearing'); return game;
}

/** Erreicht die Tür ohne Zeitvorlauf und beginnt ihre erste Untersuchung. @param {object} game Spiel. */
function startStudy(game) {
  game.player={x:11,y:5,facing:'up'}; game.interact();
  assert.ok(game.message); assert.equal(game.doorStudy,null);
  while (game.message) game.interact();
  assert.equal(game.flags.eastDoorStudied,true); assert.ok(game.doorStudy);
}

/** Prüft einmaligen Zeitsprung, gesperrte Eingaben, flüssige Frames und vollständige Türbeobachtung. */
function investigation() {
  const game=world(); startStudy(game); assert.equal(minuteOfDay(game),1140); assert.equal(dayPhase(game),'Abend');
  assert.equal(game.animating,true); assert.equal(game.step('down'),false);
  game.interact(); game.back(); game.journal(); assert.ok(game.doorStudy); assert.equal(game.bagOpen,false);
  const time=game.worldMinutes; game.update(2,false); assert.equal(game.worldMinutes,time); assert.equal(game.message,null);
  game.update(7.1,false); assert.equal(game.doorStudy,null); assert.ok(game.message);
  assert.ok(game.notes.some(isThreshold)); assert.equal(game.sounds.filter(isMetal).length,1);
  dismiss(game); useObject(game,'root-door'); assert.equal(game.doorStudy,null);
  assert.ok(game.worldMinutes-time<1); assert.equal(game.sounds.filter(isMetal).length,1);
}

/** Erkennt die Türbeobachtung. @param {object} note Notiz. */
function isThreshold(note) { return note.id==='east-threshold'; }

/** Erkennt den einmaligen Klang hinter der Tür. @param {string} cue Klang. */
function isMetal(cue) { return cue==='forest-metal'; }

/** Hält die Spieluhr in Dialog, Rucksack, Karte, Journal, Pause und Titel an. */
function pausedClock() {
  const game=world(),start=game.worldMinutes; game.update(10,false); assert.equal(game.worldMinutes,start+10);
  for (const key of ['bagOpen','mapOpen','journalOpen','tavernMenu','message','systemMenu']) {
    const time=game.worldMinutes; game[key]=key==='systemMenu'?{kind:'pause'}:true;
    game.update(30,false); assert.equal(game.worldMinutes,time,key); game[key]=null;
  }
  game.mode='title'; const time=game.worldMinutes; game.update(30,false); assert.equal(game.worldMinutes,time);
}

/** Erhält Abend und Untersuchung beim Laden; alte Stände erhalten einen sicheren Morgen. */
function clockPersistence() {
  const game=world(); startStudy(game); const data=captureGame(game),loaded=world();
  assert.equal(restoreGame(loaded,data),true); assert.equal(loaded.worldMinutes,1140); assert.equal(loaded.doorStudy,null);
  assert.equal(loaded.flags.eastDoorStudied,true); useObject(loaded,'root-door'); assert.equal(loaded.doorStudy,null);
  const old=captureGame(world()); delete old.worldMinutes;
  assert.equal(restoreGame(loaded,old),true); assert.equal(loaded.worldMinutes,540);
  for (const invalid of [null,-1,NaN,Infinity,'1140',1e9]) {
    const before=loaded.worldMinutes; assert.equal(restoreGame(loaded,{...old,worldMinutes:invalid}),false);
    assert.equal(loaded.worldMinutes,before);
  }
}

/** Überspringt nach echtem Schlaf die Nacht und erhält den geöffneten Rückweg. */
function morningAfterSleep() {
  const game=world(); game.worldMinutes=1140; game.flags.eastDoorStudied=true;
  game.travel('village-inn-upper'); sleepInBed(game); game.update(2,false);
  assert.equal(minuteOfDay(game),420); assert.equal(dayPhase(game),'Morgen'); assert.equal(game.flags.eastDoorStudied,true);
  assert.equal(nightShade(540),0); assert.ok(nightShade(1140)>0.2); assert.equal(nightShade(0),nightShade(1440));
}

/** Macht die Begegnung und Abkürzung erst auf dem Rückweg verfügbar und erhält beide Reiserichtungen. */
function returnEncounters() {
  const game=world(); game.travel('east-crossroads'); assert.equal(game.objects.some(isTraveller),false);
  game.travel('east-thicket'); assert.equal(game.objects.some(isShortcut),false);
  game.travel('east-clearing'); startStudy(game); dismiss(game); game.travel('east-thicket');
  useObject(game,'forest-shortcut'); dismiss(game); assert.equal(game.flags.eastShortcutOpen,true);
  useObject(game,'forest-shortcut'); assert.equal(game.room.id,'east-crossroads'); assert.equal(game.occupied(game.player.x,game.player.y),false);
  useObject(game,'forest-traveller'); dismiss(game); assert.equal(game.flags.eastTravellerMet,true);
  const count=game.notes.length; game.travel('village-inn'); useObject(game,'forest-traveller'); dismiss(game); assert.equal(game.notes.length,count);
  game.travel('east-crossroads');
  useObject(game,'dead-end'); assert.equal(game.room.id,'east-thicket'); assert.equal(game.occupied(game.player.x,game.player.y),false);
  const loaded=world(); assert.equal(restoreGame(loaded,captureGame(game)),true);
  useObject(loaded,'forest-shortcut'); assert.equal(loaded.room.id,'east-crossroads');
}

/** Erkennt den Reisenden. @param {object} object Objekt. */
function isTraveller(object) { return object.id==='forest-traveller'; }

/** Erkennt den noch verdeckten Waldsteig. @param {object} object Objekt. */
function isShortcut(object) { return object.id==='forest-shortcut'; }

/** Lässt nächtliche Waldlaute tagsüber, in Innenräumen und bei Pause verstummen. */
function forestSounds() {
  const game=world(); game.flags.eastDoorStudied=true; game.worldMinutes=1140; game.sounds=[];
  game.update(6,false); assert.ok(game.sounds.includes('forest-crickets')); game.sounds=[];
  game.bagOpen=true; game.update(50,false); assert.equal(game.sounds.length,0); game.bagOpen=false;
  game.worldMinutes=540; game.update(50,false); assert.equal(game.sounds.some(isForestCall),false);
  game.worldMinutes=1140; game.travel('village-inn-upper'); game.sounds=[];
  game.update(50,false); assert.equal(game.sounds.some(isForestCall),false);
}

/** Erkennt die neuen Waldgeräusche. @param {string} cue Geräusch. */
function isForestCall(cue) { return cue.startsWith('forest-'); }

test('Abendwald: einmalige Untersuchung, Eingabesperre und Zeitsprung',investigation);
test('Spieluhr: nur aktive Spielzeit zählt',pausedClock);
test('Spieluhr: Abendstand, alte Saves und ungültige Uhrwerte',clockPersistence);
test('Spieluhr: Schlaf führt zum nächsten Morgen',morningAfterSleep);
test('Abendwald: Begegnung und dauerhafte Abkürzung in beide Richtungen',returnEncounters);
test('Abendwald: Geräusche nur in aktiver dunkler Außenwelt',forestSounds);

/** Hält die vollständige Untersuchung beliebig lange vor dem automatischen Zeitwechsel lesbar. */
function readBeforeEvening() {
  const game=world(),time=game.worldMinutes;
  game.player={x:11,y:5,facing:'up'}; game.interact();
  assert.ok(game.message); assert.ok(game.pendingDoorStudy); assert.equal(game.doorStudy,null);
  game.update(60,false); assert.equal(game.worldMinutes,time); assert.equal(game.flags.eastDoorStudied,undefined);
  while (game.pages.length) game.interact();
  assert.equal(game.worldMinutes,time); assert.equal(game.doorStudy,null);
  game.interact(); assert.equal(game.worldMinutes,1140); assert.equal(game.doorStudy.duration,9);
  game.update(8.9,false); assert.ok(game.doorStudy); game.update(0.2,false); assert.equal(game.doorStudy,null);
  assert.ok(game.message); game.update(60,false); assert.ok(game.message);
}

/** Macht Tamo auf dem gemeinsamen Weg sichtbar und räumt die Sprechblase beim Gespräch ab. */
function travellerGreeting() {
  const game=world(); game.flags.eastDoorStudied=true; game.travel('east-crossroads');
  game.player={x:10,y:9,facing:'left'}; game.update(0.1,false);
  assert.equal(game.ambientSpeech?.speakerId,'forest-traveller'); assert.ok(game.ambientSpeech.remaining>9);
  assert.equal(game.message,null); assert.equal(game.occupied(7,9),false);
  useObject(game,'forest-traveller'); assert.ok(game.message); assert.equal(game.ambientSpeech,null);
  assert.equal(game.flags.eastTravellerMet,true);
}

test('Tür: Untersuchung bleibt vor dem neunsekündigen Abendübergang frei lesbar',readBeforeEvening);
test('Tamo: gemeinsamer Rückweg, sichtbarer Gruß und Vorrang des Gesprächs',travellerGreeting);
