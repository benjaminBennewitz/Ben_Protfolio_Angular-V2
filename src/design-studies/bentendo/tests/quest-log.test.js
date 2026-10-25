import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame,useObject,dismiss } from './helpers.js';
import { createVillage,createGuildEntrance } from '../scripts/game/data/village.js';
import { createVillageInteriors } from '../scripts/game/data/house-rooms.js';
import { createMaraArchive,createSourceCave } from '../scripts/game/data/mara-rooms.js';
import { createQuellDungeon } from '../scripts/game/data/quell-dungeon.js';
import { questEntries,questLines,hasUnreadQuests,selectedQuest } from '../scripts/game/systems/quest-log.js';
import { questMapMarkers } from '../scripts/game/systems/quest-map.js';
import { navigateBag } from '../scripts/game/systems/inventory.js';
import { captureGame,restoreGame } from '../scripts/game/systems/save-state.js';
import { chooseResidentLine } from '../scripts/game/systems/resident-chatter.js';
import { QUEST_RUMORS } from '../scripts/game/systems/quest-rumors.js';
import { DISCOVERY_NOTES } from '../scripts/game/data/discoveries.js';
import { talkMara } from '../scripts/game/systems/mara-quest.js';

/** Lädt den aktuellen Dorfstand samt allen tatsächlich vorhandenen Aufgabenräumen. */
function setup() {
  const game=createGame();
  for (const room of [createVillage(),createGuildEntrance(),...createVillageInteriors(),createMaraArchive(game.rooms.get('archive')),createSourceCave(),...createQuellDungeon()]) game.rooms.set(room.id,room);
  game.reset(); game.mode='world'; game.locationNotice=null; return game;
}

/** Stellt keinen Auftrag, Fundort oder Ansprechpartner vor dem ersten echten Hinweis vor. */
function hiddenKnowledge() {
  const game=setup(); assert.deepEqual(questEntries(game),[]); assert.deepEqual(questMapMarkers(game,'village'),[]);
  game.flags.maraStarted=true; const entries=questEntries(game); assert.equal(entries.length,1); assert.equal(entries[0].id,5);
  const text=questLines(entries[0]).join(' '); assert.doesNotMatch(text,/rechts oben|links oben|Werkzeugschrank|Spinnennest|Brosche/u);
  assert.deepEqual(questMapMarkers(game,'village'),[]); game.inventory.push('Garnspule');
  const found=questEntries(game).find(spool); assert.deepEqual(found.people,[]); assert.deepEqual(found.places,[]); assert.equal(found.ready,false);
}
/** Erkennt ausschließlich die Garnaufgabe. @param {object} entry Aufgabe. */
function spool(entry) { return entry.id===3; }

/** Verknüpft die echten Gespräche und Funde und verrät keine Möbelkoordinaten. */
function realSpool() {
  const game=setup(); game.travel('village-weaver'); useObject(game,'weaver-helper'); dismiss(game);
  let entry=questEntries(game).find(spool); assert.ok(entry); assert.equal(entry.ready,false); assert.match(entry.clues.join(' '),/Werkstatt/u);
  assert.doesNotMatch(game.notes.find(taskSpool).text,/Schrank|links/u);
  let marker=questMapMarkers(game,'village').find(workshop); assert.deepEqual([marker.x,marker.y,marker.symbol],[5,25,'?']);
  game.travel('village-workshop'); useObject(game,'cabinet-a'); dismiss(game); entry=questEntries(game).find(spool); assert.equal(entry.ready,true);
  marker=questMapMarkers(game,'village').find(weaver); assert.equal(marker.symbol,'!'); assert.deepEqual([marker.x,marker.y],[28,8]);
  game.travel('village-weaver'); useObject(game,'weaver-helper'); dismiss(game); entry=questEntries(game).find(spool);
  assert.equal(entry.status,'done'); assert.equal(game.coins,4); assert.equal(questMapMarkers(game,'village').some(weaver),false);
}
/** Erkennt die vorhandene Garnnotiz. @param {object} note Notiz. */
function taskSpool(note) { return note.id==='task-spool'; }
/** Erkennt den Werkstatthinweis. @param {object} marker Hinweis. */
function workshop(marker) { return marker.room==='village-workshop'; }
/** Erkennt den bekannten Weberkontakt. @param {object} marker Hinweis. */
function weaver(marker) { return marker.room==='village-weaver'; }

/** Bedient alle drei Reiter, paginiert lange Hinweise und kehrt schrittweise über B zurück. */
function questNavigation() {
  const game=setup(); game.flags.maraStarted=true; game.back(); game.bagIndex=0;
  navigateBag(game,'up'); navigateBag(game,'right'); assert.equal(game.bagTab,'profile'); navigateBag(game,'right'); assert.equal(game.bagTab,'quests');
  navigateBag(game,'down'); game.interact(); assert.equal(game.questDetail,true); assert.equal(hasUnreadQuests(game),false);
  const pages=Math.ceil(questLines(selectedQuest(game)).length/8); assert.ok(pages>1);
  for (let i=0;i<20;i++) navigateBag(game,'down'); assert.equal(game.questPage,pages-1); assert.match(game.description,/Seite/u);
  game.interact(); assert.equal(game.flags.questPinned,5); game.back(); assert.equal(game.questDetail,false); assert.equal(game.bagTab,'quests');
  game.back(); assert.equal(game.bagTab,'items'); assert.equal(game.bagOpen,true); game.back(); assert.equal(game.bagOpen,false);
}

/** Bewahrt Lesen, Anheften und Markerwahl über echte alte wie neue Speicherstände. */
function savedKnowledge() {
  const game=setup(); game.flags.spoolStarted=true; game.bagOpen=true; game.bagTab='quests'; game.interact(); game.interact();
  assert.equal(game.flags.questPinned,3); assert.equal(hasUnreadQuests(game),false);
  game.back(); game.back(); game.bagOpen=false; game.mapOpen=true; game.interact(); assert.equal(game.flags.questMarkersHidden,true);
  assert.deepEqual(questMapMarkers(game,'village'),[]); const data=captureGame(game),fresh=setup(); assert.equal(restoreGame(fresh,data),true);
  assert.equal(fresh.flags.questPinned,3); assert.equal(fresh.flags.questMarkersHidden,true); assert.equal(hasUnreadQuests(fresh),false);
  fresh.inventory.push('Garnspule'); assert.equal(hasUnreadQuests(fresh),true);
  const old=captureGame(setup()); old.flags={spoolStarted:true}; old.notes=[{id:'task-spool',title:'Spule',text:'Werkzeugschrank links'}];
  assert.equal(restoreGame(fresh,old),true); assert.ok(questEntries(fresh).find(spool)); assert.doesNotMatch(fresh.notes.find(taskSpool).text,/Werkzeugschrank/u);
}

/** Neue Marker entstehen erst aus ausgesprochenen Gerüchten und bleiben ungefähre Bereiche. */
function heardRumors() {
  const game=setup(),weaverPerson={id:'weaver',name:'Weber'};
  assert.deepEqual(questMapMarkers(game,'village'),[]);
  const line=chooseResidentLine(game,weaverPerson,lastLine); assert.equal(line,QUEST_RUMORS.moos.text);
  assert.ok(game.notes.some(rumorMoos)); assert.doesNotMatch(questEntries(game)[0].title,/blau|Brosche/u); const marker=questMapMarkers(game,'village')[0]; assert.equal(marker.symbol,'?');
  assert.deepEqual([marker.x,marker.y],[29,25]); assert.notDeepEqual([marker.x,marker.y],[30,28]);
  chooseResidentLine(game,weaverPerson,lastLine); assert.equal(game.notes.filter(rumorMoos).length,1);
  game.notes.push({...DISCOVERY_NOTES.trail}); assert.equal(questEntries(game)[0].people.includes('Frau Moos'),true);
}
/** Wählt die letzte tatsächlich mögliche Äußerung. */
function lastLine() { return 0.999; }
/** Erkennt das gehörte Moos-Gerücht. @param {object} note Notiz. */
function rumorMoos(note) { return note.id==='rumor-moos'; }

/** Beendet nur das belegte aktuelle Mara-Kapitel, ohne den zukünftigen Ostpass vorwegzunehmen. */
function maraReport() {
  const game=setup(); Object.assign(game.flags,{guildOpen:true,maraStarted:true,northOpen:true,maraLowerMessage:true});
  assert.equal(questMapMarkers(game,'village')[0].symbol,'!'); talkMara(game); assert.equal(game.flags.maraLowerReported,true);
  assert.equal(questEntries(game).find(sourceChapter).status,'done'); assert.equal(game.flags.eastOpen,undefined);
  assert.equal(game.flags.eastPumpKnown,true);
  assert.equal(questMapMarkers(game,'village').some(sourceContact),false);
}
/** Erkennt den abgeschlossenen Quellauftrag unabhängig von neu hinzugekommenen Kapiteln. @param {object} entry Quest. */
function sourceChapter(entry) { return entry.id===6; }
/** Erkennt den Kontakt zu Maras Quellauftrag. @param {object} marker Hinweis. */
function sourceContact(marker) { return marker.target==='mara'; }

/** Begrenzt die Karte auf die angeheftete offene Aufgabe und hält A als alleinige Umschalttaste. */
function markerPinning() {
  const game=setup(); Object.assign(game.flags,{spoolStarted:true,stockStarted:true,stockChecked:['barrel-e','barrel-f','shelf-b']});
  assert.equal(questMapMarkers(game,'village').length,2); game.flags.questPinned=3;
  assert.equal(questMapMarkers(game,'village').length,1); assert.ok(questMapMarkers(game,'village').every(workshop));
  assert.deepEqual(questMapMarkers(game,'quell-entry'),[]); game.mapOpen=true; game.interact(); assert.deepEqual(questMapMarkers(game,'village'),[]);
  game.interact(); assert.equal(questMapMarkers(game,'village').length,1); game.back(); assert.equal(game.bagOpen,true);
}

test('Questwissen: keine unbekannten Aufgaben, Personen oder Lösungen',hiddenKnowledge);
test('Questablauf: Garnsuche aus Gespräch, Fund, Kartenhinweis und Rückgabe',realSpool);
test('Questbuch: drei Reiter, Seiten, Anheften und B-Navigation',questNavigation);
test('Queststand: Lesen, Anheften, Kartenwahl und Migration ohne neue Belohnung',savedKnowledge);
test('Questgerüchte: nur gehörte Hinweise, keine exakten Geheimkoordinaten',heardRumors);
test('Mara: Nachricht berichten beendet das aktuelle Kapitel ohne Ostfreigabe',maraReport);
test('Questkarte: angeheftete Aufgabe, Gebietstrennung und A-Umschaltung',markerPinning);

/** Ein mehrdeutiger Brief identifiziert keine unbekannte Familie und kein exaktes Versteck. */
function ambiguousClue() {
  const game=setup(); game.notes.push({...DISCOVERY_NOTES.trail});
  assert.deepEqual(questEntries(game)[0].people,['Jorin']); assert.deepEqual(questEntries(game)[0].places,[]);
  assert.deepEqual(questMapMarkers(game,'village'),[]);
  game.notes.push({...DISCOVERY_NOTES.request}); assert.equal(questMapMarkers(game,'village').length,1);
}

/** Erreicht Quests ausschließlich über den Reiter und verhindert einen unsichtbaren vierten Werkzeugknopf. */
function quickAccess() {
  const game=setup(); game.back(); game.bagIndex=8; navigateBag(game,'right'); assert.equal(game.bagIndex,8);
  for (let i=0;i<5;i++) navigateBag(game,'up');
  navigateBag(game,'right'); navigateBag(game,'right'); game.interact(); assert.equal(game.bagTab,'quests');
  assert.equal(game.questDetail,false); game.back(); assert.equal(game.bagTab,'items'); assert.equal(game.bagOpen,true);
}

test('Hinweisdeutung: ein mehrdeutiger Reisebericht verrät keine unbekannte Familie',ambiguousClue);
test('Questzugang: nur über den Reiter, drei Werkzeugknöpfe und Rückkehr mit B',quickAccess);
