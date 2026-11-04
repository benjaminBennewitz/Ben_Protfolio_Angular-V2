import { confirmRest } from '../scripts/game/systems/rest-menu.js';
import { createHouseRoom } from '../scripts/game/data/house-rooms.js';
import { heroStats } from '../scripts/game/systems/health.js';
import { startDebugRun } from '../scripts/game/data/debug-starts.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame,useObject,dismiss,go } from './helpers.js';
import { createEastRooms } from '../scripts/game/data/east-rooms.js';
import { eastQuestEntries } from '../scripts/game/data/quest-east.js';
import { captureGame,restoreGame } from '../scripts/game/systems/save-state.js';

/** Stellt einen Spielstand am Übergang zwischen Wald und Wiesen bereit. */
function world() {
  const game=createGame();
  for (const room of createEastRooms()) game.rooms.set(room.id,room);
  game.reset(); game.mode='world'; game.travel('east-clearing');
  return game;
}

/** Prüft untersuchte und irreführende Wegmarken, Speichern und den Übergang aus dem Wald. */
function openRoute() {
  const game=world();
  useObject(game,'root-notch'); dismiss(game); assert.equal(game.flags.eastRootOpen,undefined);
  useObject(game,'root-door'); dismiss(game); assert.equal(game.flags.eastDoorStudied,true);
  useObject(game,'root-chalk'); useObject(game,'root-chalk'); dismiss(game);
  useObject(game,'root-ring'); useObject(game,'root-ring'); dismiss(game);
  assert.equal(game.flags.eastRootOpen,undefined);
  useObject(game,'root-notch'); dismiss(game); assert.equal(game.flags.eastRootOpen,undefined);
  useObject(game,'root-notch'); dismiss(game); assert.equal(game.flags.eastRootOpen,true);
  const restored=world(); assert.equal(restoreGame(restored,captureGame(game)),true);
  useObject(restored,'root-door'); assert.equal(restored.room.id,'east-waystation');
  useObject(restored,'waymaker-ledger'); useObject(restored,'meadow-exit');
  assert.equal(restored.room.id,'east-meadow');
  useObject(restored,'meadow-view'); dismiss(restored);
  assert.equal(eastQuestEntries(restored).at(-1).done,true);
  useObject(restored,'station-return'); assert.equal(restored.room.id,'east-waystation');
  useObject(restored,'forest-return'); assert.equal(restored.room.id,'east-clearing');
  assert.equal(restored.occupied(restored.player.x,restored.player.y),false);
}

/** Überquert eine komplette Wasserfläche zu Fuß, auch mit aktivem Tag-Nacht-Zyklus. */
function wade() {
  const game=world(); game.flags.eastRootOpen=true; game.travel('east-meadow');
  for (const minute of [720,1250]) {
    game.worldMinutes=minute; game.player={x:6,y:10,facing:'right'};
    let wet=0;
    for (let x=7;x<=18;x++) {
      assert.equal(game.step('right'),true,`Freier Schritt bei ${x},10`); game.update(0.2,false);
      if (game.room.ground[10][x]==='s') wet++;
      assert.equal(game.player.x,x);
    }
    assert.ok(wet>=4);
  }
}

test('Wurzelpforte: Hinweise, falsche Marken, Speicherstand und beide Rückwege',openRoute);
test('Ostwiesen: zusammenhängendes Flachwasser tagsüber und nachts durchquerbar',wade);

/** Prüft das tiefe Seeufer und das Auffliegen bei einem Schritt in Vogelnähe. */
function lakeAndBirds() {
  const game=world(); game.travel('east-meadow'); game.worldMinutes=720;
  game.player={x:24,y:9,facing:'up'};
  assert.equal(game.room.ground[8][24],'l'); assert.equal(game.step('up'),false);
  game.player={x:7,y:10,facing:'up'}; game.update(0.1,false);
  assert.equal(game.roomState.meadowFlights[0],undefined);
  assert.equal(game.step('up'),true); game.update(0.2,false);
  assert.equal(game.roomState.meadowFlights[0],0);
  game.player={x:3,y:10,facing:'right'}; game.update(8.1,false);
  assert.equal(game.roomState.meadowFlights[0],undefined);
}

/** Erhält alte Stände auch dann, wenn das neue Gelände ihr letztes Feld blockiert. */
function oldTerrainSave() {
  for (const [id,x,y] of [['east-meadow',22,5],['east-clearing',11,1]]) {
    const game=world(); game.travel(id);
    const old=captureGame(game); old.roomRevision=1; old.player={x,y,facing:'up'};
    assert.equal(game.occupied(x,y),true);
    assert.equal(restoreGame(game,old),true);
    assert.equal(game.room.id,id);
    assert.equal(game.occupied(game.player.x,game.player.y),false);
  }
}

test('Ostwiesen: tiefer See sperrt Schritte, Vögel fliegen auf und kehren zurück',lakeAndBirds);
test('Ostwiesen und Wurzelpforte: alte Speicherpositionen im neuen Gelände bleiben ladbar',oldTerrainSave);

/** Hält den Wasserfall aus der nativen LCD-Kamera vom begehbaren Ufer sichtbar. */
function waterfallView() {
  const game=world(); game.travel('east-meadow');
  game.player={x:19,y:8,facing:'up'};
  for (let i=0;i<2;i++) {
    assert.equal(game.step('up'),true);
    game.update(0.2,false);
  }
  assert.equal(game.step('right'),true); game.update(0.2,false);
  const fall=game.room.lakeFall,x=game.player.x*16-72,y=game.player.y*16-64;
  assert.ok(fall.x*16>=x && (fall.x+fall.w)*16<=x+160);
  assert.ok(fall.y*16>=y && (fall.y+fall.h)*16<=y+144);
}

test('Ostwiesen: Wasserfall ist vollständig vom westlichen Ufer sichtbar',waterfallView);

/** Prüft den verschlossenen Übergang, das Schwert als Werkzeug und die Raumwechsel nach dem Speichern. */
function streamQuest() {
  const game=world(); game.travel('east-meadow');
  assert.equal(eastQuestEntries(game).some(isStreamQuest),false);
  useObject(game,'stream-bridge'); dismiss(game);
  const quest=eastQuestEntries(game).find(isStreamQuest);
  assert.deepEqual(quest.markers.map(markerTarget),['stream-bridge']);
  game.player={x:32,y:9,facing:'right'}; assert.equal(game.step('right'),false);
  game.player={x:30,y:13,facing:'up'}; assert.equal(game.step('up'),false);
  useObject(game,'stream-stone'); useObject(game,'stream-stone'); dismiss(game);
  assert.equal(game.flags.eastStreamOpen,undefined);
  assert.equal(game.occupied(30,12),true);
  confirmStream(game);
  assert.deepEqual(game.inventory,['Rostiges Schwert']); assert.ok(game.sounds.includes('success-quest'));
  assert.equal(eastQuestEntries(game).find(isStreamQuest).done,true);
  const loaded=world(); assert.equal(restoreGame(loaded,captureGame(game)),true);
  assert.equal(loaded.occupied(30,12),false); assert.equal(loaded.occupied(31,12),true);
  go(loaded,32,9); assert.equal(loaded.step('right'),true); assert.equal(loaded.room.id,'east-lowland');
  go(loaded,1,9); assert.equal(loaded.step('left'),true); assert.equal(loaded.room.id,'east-meadow');
}

/** Prüft Abbruch und ausdrückliche Bestätigung über beide Bedienwege. @param {object} game Spiel. */
function confirmStream(game) {
  game.inventory.push('Rostiges Schwert'); game.bagOpen=true; game.bagAction=true; game.bagIndex=0;
  game.interact(); assert.equal(game.flags.eastStreamOpen,undefined);
  assert.equal(game.occupied(30,12),true);
  game.back(); assert.equal(game.flags.eastStreamOpen,undefined);
  useObject(game,'stream-stone'); assert.equal(game.flags.eastStreamOpen,undefined);
  game.interact(); dismiss(game);
}

/** Erkennt die Aufgabe zum Bachlauf. @param {object} quest Aufgabe. */
function isStreamQuest(quest) { return quest.id===11; }

/** Liest die Kennung des bereits entdeckten Orts. @param {object} marker Kartensymbol. */
function markerTarget(marker) { return marker.target; }

/** Erreicht den Südpfad ohne Schwert und findet den optionalen Hinweis genau einmal. */
function southTrail() {
  const game=world(); game.travel('east-meadow');
  go(game,20,22); assert.equal(game.step('down'),true); assert.equal(game.room.id,'east-south-meadow');
  const coins=game.coins;
  useObject(game,'south-cache'); useObject(game,'south-cache'); dismiss(game);
  assert.equal(game.coins,coins+4);
  assert.equal(game.notes.filter(isFallNote).length,1);
  go(game,9,1); assert.equal(game.step('up'),true); assert.equal(game.room.id,'east-meadow');
}

/** Erkennt die optionale Wasserfallnotiz. @param {object} note Notiz. */
function isFallNote(note) { return note.id==='east-fall-note'; }

test('Ostwiesen: entdeckt das Wehr, öffnet es mit dem Schwert und erreicht die Bachniederung',streamQuest);
test('Ostwiesen: Südpfad bleibt offen, Wasserfallnotiz und Münzen sind einmalige Funde',southTrail);


/** Spielt das Wehr von beiden Debug-Einstiegen aus und hält den Dungeonloot am ursprünglichen Einstieg offen. */
function debugLoadout() {
  const game=world();
  for (const id of ['east-waystation','east-meadow']) {
    startDebugRun(game,id);
    assert.equal(game.debugging,true);
    assert.ok(game.inventory.includes('Rostiges Schwert'));
    assert.ok(game.states.get('quell-nest').taken.has('reward'));
    if (id==='east-waystation') useObject(game,'meadow-exit');
    assert.equal(game.room.id,'east-meadow');
    assert.equal(game.flags.eastStreamOpen,undefined);
    useObject(game,'stream-stone'); useObject(game,'stream-stone');
    assert.equal(game.flags.eastStreamOpen,undefined);
    game.interact(); assert.equal(game.flags.eastStreamOpen,true);
  }
  startDebugRun(game,'steam');
  assert.deepEqual(game.inventory,['Runenkupplung']);
  startDebugRun(game,'hall');
  assert.deepEqual(game.inventory,[]);
  assert.equal(game.flags.eastRootOpen,undefined);
}

test('Debug: beide Ostwiesen-Einstiege bringen ein Schwert mit und lassen das Wehr ungelöst',debugLoadout);

/** Prüft die stumpfe Klinge und den späteren Zugang mit geschärftem Schwert. */
function lowlandGate() {
  const game=world(); game.travel('east-lowland'); game.inventory.push('Rostiges Schwert');
  useObject(game,'lowland-gate'); dismiss(game);
  assert.equal(game.flags.eastLowlandGateOpen,undefined);
  assert.equal(game.occupied(16,9),true);
  assert.ok(game.sounds.includes('ui-denied'));
  sharpenAtWorkshop(game);
  game.travel('east-lowland');
  useObject(game,'lowland-gate'); dismiss(game);
  assert.equal(game.flags.eastLowlandGateOpen,true);
  assert.equal(game.occupied(16,9),false);
  assert.deepEqual(game.inventory,['Geschärftes Schwert']);
}

/** Prüft Abbruch, kostenlosen Schliff im selben Fach und den neuen Kampfwert. @param {object} game Spiel. */
function sharpenAtWorkshop(game) {
  const workshop=createHouseRoom('workshop'); game.rooms.set(workshop.id,workshop);
  game.travel(workshop.id); game.worldMinutes=720;
  const coins=game.coins;
  useObject(game,'workshop-helper'); game.back();
  assert.deepEqual(game.inventory,['Rostiges Schwert']);
  useObject(game,'workshop-helper'); dismiss(game);
  assert.deepEqual(game.inventory,[]);
  useObject(game,'workshop-helper'); dismiss(game); assert.deepEqual(game.inventory,[]);
  sleepForSmith(game);
  useObject(game,'workshop-helper'); dismiss(game);
  assert.deepEqual(game.inventory,['Geschärftes Schwert']);
  assert.equal(game.coins,coins);
  assert.equal(heroStats(game).attack,3);
}

/** Übernachtet im echten Schenkenbett und prüft den gespeicherten Auftrag. @param {object} game Spiel. */
function sleepForSmith(game) {
  const inn=createHouseRoom('inn-upper'); game.rooms.set(inn.id,inn);
  assert.equal(restoreGame(game,captureGame(game)),true);
  game.travel(inn.id); useObject(game,'bed-west');
  assert.equal(game.systemMenu.kind,'rest');
  game.systemMenu.choice=1; confirmRest(game); game.update(2,false); dismiss(game);
  assert.equal(game.flags.smithRested,undefined);
  useObject(game,'bed-west'); confirmRest(game); game.update(2,false); dismiss(game);
  assert.equal(game.flags.smithRested,true);
  game.travel('village-workshop');
}

test('Bachniederung: nur eine geschärfte Klinge öffnet das verschnürte Weggitter',lowlandGate);
