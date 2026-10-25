import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../scripts/game/game.js';
import { createVillage,createGuildEntrance } from '../scripts/game/data/village.js';
import { createVillageInteriors } from '../scripts/game/data/house-rooms.js';
import { SaveManager } from '../scripts/game/systems/save-manager.js';
import { captureGame,restoreGame,SAVE_KEY } from '../scripts/game/systems/save-state.js';
import { navigateTitle } from '../scripts/game/data/title.js';
import { navigateBag } from '../scripts/game/systems/inventory.js';
import { KeyboardCursor } from '../scripts/device/input/keyboard-cursor.js';
import { useObject,dismiss,createGame,push } from './helpers.js';

/** Bildet einen Browser-Speicher mit beobachtbaren Schreibzugriffen und Fehlerfällen ab. */
class Storage {
  /** Erstellt einen leeren Speicher. */
  constructor() { this.value=null; this.writes=0; this.blocked=false; }
  /** Liest ausschließlich den Spielstand. @param {string} key Schlüssel. */
  getItem(key) { assert.equal(key,SAVE_KEY); return this.value; }
  /** Simuliert atomare Speicherung einschließlich Quotenfehler. @param {string} key Schlüssel. @param {string} value Wert. */
  setItem(key,value) { assert.equal(key,SAVE_KEY); if (this.blocked) throw new Error('quota'); this.value=value; this.writes++; }
}

/** Lädt die echten Dorf- und Hausdaten. */
function savedGame() {
  const rooms=new Map();
  for (const room of [createVillage(),createGuildEntrance(),...createVillageInteriors()]) rooms.set(room.id,room);
  const game=new Game(rooms); game.mode='world'; return game;
}

/** Läuft einen echten Fund samt Abgabe durch und verhindert doppelte Beute nach einem neuen Spielobjekt. */
function progressRoundTrip() {
  const game=savedGame(),storage=new Storage(),saves=new SaveManager(game,storage);
  game.avatar='female'; useObject(game,'moos-cache'); dismiss(game); game.travel('village-home');
  useObject(game,'grandmother'); dismiss(game); assert.equal(game.coins,8); assert.equal(saves.flush(),true);
  const fresh=savedGame(),loaded=new SaveManager(fresh,storage); fresh.mode='title'; fresh.interact();
  assert.equal(fresh.mode,'world'); assert.equal(fresh.avatar,'female'); assert.equal(fresh.room.id,'village-home');
  assert.equal(fresh.flags.memoryReturned,true); assert.equal(fresh.coins,8); assert.ok(fresh.notes.length>=3);
  useObject(fresh,'grandmother'); dismiss(fresh); assert.equal(fresh.coins,8);
  fresh.travel('village'); useObject(fresh,'moos-cache'); dismiss(fresh);
  assert.equal(fresh.inventory.includes('Blaue Brosche'),false); assert.equal(fresh.coins,8); assert.equal(loaded.flush(),true);
}

/** Erhält die laufende Mühlenaufgabe, statt den Hausmeister nach einem Neuladen zu verlieren. */
function keeperResume() {
  const game=savedGame(); useObject(game,'branch'); dismiss(game); useObject(game,'branch'); dismiss(game);
  useObject(game,'sluice'); assert.equal(game.flags.waterFlowing,true);
  const fresh=savedGame(); assert.equal(restoreGame(fresh,captureGame(game)),true);
  assert.ok(fresh.inventory.includes('Ast')); assert.ok(fresh.roomState.keeper);
  for (let i=0;i<500 && !fresh.flags.guildOpen;i++) { dismiss(fresh); fresh.update(0.05,false); }
  assert.equal(fresh.flags.guildOpen,true);
}

/** Sichert aus einem Sitzplatz auf ein Bodenfeld und korrigiert inzwischen zurückgekehrte Bewohner. */
function safeResume() {
  const game=savedGame(); game.travel('village-inn'); useObject(game,'bar-stool-a');
  const data=captureGame(game),fresh=savedGame(); assert.equal(restoreGame(fresh,data),true);
  assert.equal(fresh.seat,null); assert.equal(fresh.occupied(fresh.player.x,fresh.player.y),false);
  fresh.travel('village'); fresh.player={x:25,y:24,facing:'up'};
  assert.equal(restoreGame(game,captureGame(fresh)),true); assert.equal(game.occupied(game.player.x,game.player.y),false);
}

/** Erhält den bisherigen Stand bei fehlerhaften Daten, Speicherausfall, Debug und abgebrochener Neuwahl. */
function storageGuards() {
  const game=savedGame(),storage=new Storage(),saves=new SaveManager(game,storage); game.coins=7; saves.flush();
  const previous=storage.value; game.debugging=true; game.coins=99; assert.equal(saves.flush(),false); assert.equal(storage.value,previous);
  game.reset(); saves.load(); navigateTitle(game,'down'); game.interact(); assert.equal(game.mode,'character'); game.back();
  assert.equal(storage.value,previous); navigateTitle(game,'up'); game.interact(); assert.equal(game.coins,7);
  storage.blocked=true; game.coins=8; assert.equal(saves.flush(),false); assert.equal(storage.value,previous);
  assert.match(game.saveStatus,/fehlgeschlagen/u);
  storage.value='invalid'; saves.load(); assert.equal(game.resumeData,null); assert.equal(storage.value,'invalid');
  storage.blocked=false; restoreGame(game,JSON.parse(previous)); assert.equal(saves.flush(),true);
  assert.equal(storage.value,previous); assert.doesNotThrow(noStorage.bind(null,game));
}

/** Prüft die Abwesenheit des Speichers ohne Browser-Ausnahme. @param {object} game Spiel. */
function noStorage(game) { const saves=new SaveManager(game,null); assert.equal(saves.flush(),false); }

/** Verwirft unbekannte Versionen und manipulierte Daten ohne Teiländerung am aktuellen Spiel. */
function rejectedSnapshots() {
  const game=savedGame(),data=captureGame(game),before=JSON.stringify(data);
  for (const field of ['version','room','player','flags','inventory','states']) {
    const broken=structuredClone(data); broken[field]=null;
    assert.equal(restoreGame(game,broken),false); assert.equal(JSON.stringify(captureGame(game)),before);
  }
  const polluted=JSON.parse(JSON.stringify(data)); polluted.flags=JSON.parse('{"__proto__":{"polluted":true}}');
  assert.equal(restoreGame(game,polluted),false); assert.equal({}.polluted,undefined);
}

/** Schreibt nur beim Raumwechsel oder ausdrücklich manuell, auch bei erneutem Besuch desselben Raums. */
function saveCadence() {
  const game=savedGame(),storage=new Storage(),saves=new SaveManager(game,storage);
  for (let i=0;i<100;i++) saves.update(1); assert.equal(storage.writes,0);
  game.coins=2; saves.update(10); assert.equal(storage.writes,0);
  game.travel('village-home'); saves.update(0); assert.equal(storage.writes,1); assert.equal(game.saveNotice.success,true);
  assert.equal(JSON.parse(storage.value).coins,2); saves.update(2); assert.equal(game.saveNotice.remaining,0);
  game.coins=3; saves.update(10); assert.equal(storage.writes,1);
  game.travel('village-home'); saves.update(0); assert.equal(storage.writes,2);
  game.coins=4; assert.equal(saves.flush(),true); assert.equal(storage.writes,3);
  saves.update(10); assert.equal(storage.writes,3);
  storage.blocked=true; game.travel('village'); saves.update(0); assert.equal(game.saveNotice.success,false);
  for (let i=0;i<10;i++) saves.update(1); assert.equal(storage.writes,3);
  game.debugging=true; game.travel('village-home'); saves.update(0); assert.equal(storage.writes,3);
}

/** Prüft Rucksacktöne einschließlich unbeweglicher Ränder und Dialogpriorität. */
function bagSounds() {
  const game=savedGame(); game.back(); game.bagIndex=8; game.sounds=[]; navigateBag(game,'down'); assert.deepEqual(game.sounds,[]);
  navigateBag(game,'up'); assert.deepEqual(game.sounds,['ui-move']);
  game.bagIndex=0; game.inventory=['Ast']; game.interact(); assert.equal(game.sounds.at(-1),'ui-confirm');
  navigateBag(game,'right'); assert.equal(game.sounds.at(-1),'ui-move');
  game.interact(); const count=game.sounds.length; navigateBag(game,'left'); assert.equal(game.sounds.length,count);
}

/** Bildet ein Ereignisziel außerhalb nativer Formulare ab. @param {string} selector Selektor. */
function noField(selector) { return null; }

/** Prüft Zeigerwechsel ohne Fokusverlust und ignoriert Touch, Modifikatoren und Tab. */
function keyboardCursor() {
  const original=globalThis.document,classes=new Set(); classes.remove=classes.delete.bind(classes);
  globalThis.document={documentElement:{classList:classes}};
  const cursor=Object.create(KeyboardCursor.prototype); cursor.app={phase:'on',helpOpen:false,cartridge:{open:false},views:{pointer:{x:2},rearPointer:{x:2}}};
  try {
    cursor.hide({key:'ArrowUp',target:{closest:noField}}); assert.ok(classes.has('keyboard-play')); assert.equal(cursor.app.views.pointer,null);
    cursor.show({type:'pointermove',pointerType:'touch'}); assert.ok(classes.has('keyboard-play'));
    cursor.show({type:'pointermove',pointerType:'mouse'}); assert.equal(classes.has('keyboard-play'),false);
    cursor.hide({key:'Tab',target:{closest:noField}}); assert.equal(classes.has('keyboard-play'),false);
  } finally { globalThis.document=original; }
}

test('Speichern: echte Funde, weibliches Preset, Journal und einmalige Belohnung bleiben erhalten',progressRoundTrip);
test('Speichern: laufender Hausmeister beendet nach Fortsetzen die Gildenöffnung',keeperResume);
test('Speichern: Sitzplätze und zurückgekehrte Bewohner verhindern keinen sicheren Einstieg',safeResume);
test('Speichern: Fehler, Debug und abgebrochenes neues Spiel überschreiben den Stand nicht',storageGuards);
test('Speichern: ungültige Daten verändern keinen laufenden Stand',rejectedSnapshots);
test('Speichern: Raumwechsel statt Zeitraster, manuelles Speichern und korrekte Ergebnisanzeige',saveCadence);
test('Rucksack: Auswahl- und Bestätigungstöne respektieren Grenzen und Dialoge',bagSounds);
test('Tastatur: Mauszeiger wird verborgen und bei Mausbewegung wieder sichtbar',keyboardCursor);

/** Erhält tatsächliche verschobene Regale und verwirft Wandpositionen ohne Veränderung am Spiel. */
function movedFurniture() {
  const game=createGame(); game.travel('archive'); push(game,5,10,'right',2); push(game,9,9,'up',2);
  const data=captureGame(game),fresh=createGame(); assert.equal(restoreGame(fresh,data),true);
  assert.deepEqual(fresh.roomState.blocks,game.roomState.blocks); assert.equal(fresh.room.id,'archive');
  const malformed=structuredClone(data);
  for (const room of malformed.states) if (room.id==='archive') room.blocks[0].x=0;
  assert.equal(restoreGame(fresh,malformed),false); assert.deepEqual(fresh.roomState.blocks,game.roomState.blocks);
}
test('Speichern: verschobene Archivregale bleiben erhalten und Wandpositionen werden abgelehnt',movedFurniture);
