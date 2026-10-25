import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame,useObject,dismiss,use } from './helpers.js';
import { createVillage,createGuildEntrance } from '../scripts/game/data/village.js';
import { createVillageInteriors } from '../scripts/game/data/house-rooms.js';
import { createEastRooms } from '../scripts/game/data/east-rooms.js';
import { pipeFlow } from '../scripts/game/data/east-pipes.js';
import { talkMara } from '../scripts/game/systems/mara-quest.js';
import { captureGame,restoreGame } from '../scripts/game/systems/save-state.js';
import { questEntries } from '../scripts/game/systems/quest-log.js';
import { questMapMarkers } from '../scripts/game/systems/quest-map.js';
import { useEastCanteen } from '../scripts/game/systems/east-story.js';

/** Lädt den echten Dorfstand und die neuen Räume ohne Browser. */
function world() {
  const game=createGame();
  for (const room of [createVillage(),createGuildEntrance(),...createVillageInteriors(),...createEastRooms()]) game.rooms.set(room.id,room);
  game.reset(); game.mode='world'; return game;
}

/** Öffnet nur den bisherigen abgeschlossenen Mara-Spielstand. @param {object} game Spiel. */
function oldChapter(game) {
  Object.assign(game.flags,{guildOpen:true,waterFlowing:true,northOpen:true,maraLowerMessage:true,maraLowerReported:true});
  game.travel('village-guild-upper'); talkMara(game); dismiss(game);
}

/** Dreht ausschließlich über reale Interaktionen bis zur gewünschten Stellung. @param {object} game Spiel. @param {number} index Rohr. @param {number} turn Zielstellung. */
function rotateTo(game,index,turn) {
  for (let i=0;i<4 && game.flags[`eastPipe${index}`]!==turn;i++) { useObject(game,`pipe-${index}`); dismiss(game); }
  assert.equal(game.flags[`eastPipe${index}`],turn);
}

/** Setzt die überprüfte dichte Verbindung über die tatsächlichen Rohraktionen. @param {object} game Spiel. */
function connectPipes(game) {
  for (const [i,turn] of [[0,0],[1,2],[4,0],[5,2],[8,0]]) rotateTo(game,i,turn);
}

/** Verhindert einen vorzeitigen Ostzugang und unterstützt den letzten alten Speicherstand. */
function chapterAccess() {
  const game=world(); assert.equal(questEntries(game).some(eastQuest),false);
  useObject(game,'east-hatch'); assert.equal(game.room.id,'village'); dismiss(game);
  useObject(game,'east-gate'); assert.equal(game.room.id,'village'); dismiss(game);
  oldChapter(game); assert.equal(game.flags.eastPumpKnown,true);
  assert.ok(questMapMarkers(game,'village').some(eastMarker));
  game.travel('village'); useObject(game,'east-hatch'); assert.equal(game.room.id,'east-pump');
  useObject(game,'return'); assert.equal(game.room.id,'village'); assert.equal(game.occupied(game.player.x,game.player.y),false);
}

/** Erkennt die neuen Questkennungen. @param {object} entry Quest. */
function eastQuest(entry) { return entry.id>=7; }

/** Erkennt den bekannten Zugang ohne Lösungsmarker auf dem Rohrfeld. @param {object} marker Marker. */
function eastMarker(marker) { return marker.target==='east-hatch'; }

/** Prüft Ersatzteil, Rückstellung und Druckverlust bis zur einmaligen Passöffnung. */
function pumpSolution() {
  const game=world(); oldChapter(game); game.travel('east-pump');
  useObject(game,'pump-start'); assert.equal(game.flags.eastOpen,undefined); dismiss(game);
  useObject(game,'pipe-4'); assert.equal(game.flags.eastPipeRepaired,undefined); dismiss(game);
  game.travel('village-workshop'); useObject(game,'pipe-case'); dismiss(game); assert.ok(game.inventory.includes('Rohrbogen'));
  game.travel('east-pump'); useObject(game,'pipe-4'); dismiss(game); assert.equal(game.inventory.includes('Rohrbogen'),false);
  useObject(game,'pipe-reset'); dismiss(game); assert.equal(game.flags.eastPipeRepaired,true);
  connectPipes(game); assert.equal(pipeFlow(game.flags).ready,true);
  useObject(game,'pipe-8'); assert.equal(pipeFlow(game.flags).ready,false);
  rotateTo(game,8,0); useObject(game,'pump-start'); assert.equal(game.flags.eastOpen,true); dismiss(game);
  const money=game.coins; useObject(game,'pump-start'); dismiss(game); assert.equal(game.coins,money);
  game.travel('village'); assert.equal(game.objects.find(eastGate).kind,'trail'); useObject(game,'east-gate'); assert.equal(game.room.id,'east-wood');
  useObject(game,'return'); assert.equal(game.room.id,'village');
}

/** Erkennt den bestehenden Ostpass unabhängig von seiner Darstellung. @param {object} object Durchgang. */
function eastGate(object) { return object.id==='east-gate'; }

/** Lässt ein Ersatzteil bei vollem Beutel liegen und repariert ohne zusätzlichen Inventarplatz. */
function fullBag() {
  const game=world(); oldChapter(game); game.flags.eastPumpSurveyed=true; game.travel('village-workshop');
  game.inventory=Array(6).fill('Ast'); useObject(game,'pipe-case'); dismiss(game);
  assert.equal(game.flags.eastSpareTaken,undefined); game.inventory.pop(); useObject(game,'pipe-case'); dismiss(game);
  assert.equal(game.inventory.length,6); assert.equal(game.flags.eastSpareTaken,true);
  const data=captureGame(game),loaded=world(); assert.equal(restoreGame(loaded,data),true);
  loaded.travel('east-pump'); useObject(loaded,'pipe-4'); dismiss(loaded); assert.equal(loaded.inventory.length,5);
}

/** Erhält Drehstellungen, Hinweise und die geöffnete Route bei Speichern und Laden. */
function persistence() {
  const game=world(); oldChapter(game); game.flags.eastPipeRepaired=true; game.travel('east-pump');
  connectPipes(game); const before=captureGame(game),loaded=world(); assert.equal(restoreGame(loaded,before),true);
  assert.equal(pipeFlow(loaded.flags).ready,true); useObject(loaded,'pump-start'); dismiss(loaded);
  loaded.travel('east-clearing'); useObject(loaded,'tracks'); dismiss(loaded);
  const again=world(); assert.equal(restoreGame(again,captureGame(loaded)),true);
  assert.equal(again.flags.eastOpen,true); assert.ok(again.notes.some(trackNote));
}

/** Erkennt die tatsächlich aufgenommene Spur. @param {object} note Notiz. */
function trackNote(note) { return note.id==='east-tracks'; }

/** Erlaubt umgekehrte Fundreihenfolge und vergibt den abschließenden Bericht nur einmal. */
function forestStory() {
  const game=world(); oldChapter(game); game.flags.eastOpen=true;
  game.travel('east-clearing'); useObject(game,'root-door'); dismiss(game); useObject(game,'tracks'); dismiss(game);
  game.travel('east-wood'); useObject(game,'ribbon'); dismiss(game); assert.equal(game.flags.eastEdaMet,undefined);
  game.travel('village-inn'); useObject(game,'eda'); dismiss(game); assert.equal(game.flags.eastTrailDone,true);
  assert.ok(questMapMarkers(game,'village').some(maraMarker));
  useObject(game,'mara'); dismiss(game); assert.equal(game.coins,6);
  useObject(game,'mara'); dismiss(game); assert.equal(game.coins,6);
  assert.equal(questEntries(game).find(trailQuest).status,'done');
}

/** Erkennt die Rückmeldung bei der bekannten Mentorin. @param {object} marker Marker. */
function maraMarker(marker) { return marker.target==='mara' && marker.symbol==='!'; }

/** Erkennt den Waldauftrag. @param {object} entry Quest. */
function trailQuest(entry) { return entry.id===8; }

/** Füllt die Flasche am echten Brunnen und tauscht sie ohne Überlauf oder doppelte Belohnung. */
function canteen() {
  const game=world(); game.travel('east-wood'); useObject(game,'canteen'); dismiss(game);
  assert.ok(game.inventory.includes('Feldflasche')); game.travel('village'); use(game,10,11); dismiss(game);
  useEastCanteen(game,'Feldflasche'); dismiss(game); assert.ok(game.inventory.includes('Volle Feldflasche'));
  game.inventory.push(...Array(5).fill('Ast')); game.travel('east-wood'); useObject(game,'eda'); dismiss(game);
  assert.equal(game.flags.eastCanteenDone,true); assert.equal(game.inventory.length,6); assert.equal(game.coins,3);
  assert.ok(game.inventory.includes('Feldverband')); useObject(game,'eda'); dismiss(game); assert.equal(game.coins,3);
}

/** Prüft jeden neuen Gegenstand gegen Grundriss und tatsächlich erreichbare Interaktion. */
function newRoomAccess() {
  const game=world(); oldChapter(game); game.flags.eastDoorStudied=true;
  for (const room of createEastRooms()) {
    game.travel(room.id); assert.equal(game.occupied(game.player.x,game.player.y),false);
    for (const object of room.objects) {
      if (object.action==='travel') continue;
      useObject(game,object.id); dismiss(game);
    }
  }
}

/** Trennt dichten Verlauf, defekten Bogen und umgedrehten Ausgang auch ohne UI. */
function pipePressure() {
  const flags={eastPipe0:0,eastPipe1:2,eastPipe4:0,eastPipe5:2,eastPipe8:0};
  assert.equal(pipeFlow(flags).ready,false); assert.equal(pipeFlow(flags).leak,true);
  flags.eastPipeRepaired=true; assert.equal(pipeFlow(flags).ready,true);
  flags.eastPipe8=1; assert.equal(pipeFlow(flags).ready,false);
  flags.eastPipe8=0; flags.eastPipe2=3; assert.equal(pipeFlow(flags).ready,true);
}

test('Ostkapitel: alte Mara-Spielstände, gesperrte Wege und sichere Rückkehr',chapterAccess);
test('Ostkapitel: echtes Rohrnetz, Reparatur, Druckverlust und Passöffnung',pumpSolution);
test('Ostkapitel: voller Rucksack und gespeichert mitgenommenes Ersatzteil',fullBag);
test('Ostkapitel: Rohrstellungen und Waldspuren bleiben gespeichert',persistence);
test('Ostkapitel: freie Hinweisreihenfolge, Eda und einmaliger Mara-Bericht',forestStory);
test('Ostkapitel: leere Flasche, Brunnen, Rückgabe und einmalige Belohnung',canteen);
test('Ostkapitel: alle neuen Räume und Interaktionen sind erreichbar',newRoomAccess);
test('Ostkapitel: Druck nur bei dichtem Verlauf, trockene Nebenrohre bleiben frei',pipePressure);
