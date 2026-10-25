import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../scripts/game/game.js';
import { createVillage,createGuildEntrance } from '../scripts/game/data/village.js';
import { createVillageInteriors } from '../scripts/game/data/house-rooms.js';
import { navigateCharacter } from '../scripts/game/data/characters.js';
import { GameInput } from '../scripts/device/input/game-input.js';
import { useObject,dismiss } from './helpers.js';

/** Erstellt das unveränderte Dorf mit allen Innenräumen für den realen Startablauf. */
function newGame() {
  const rooms=new Map();
  for (const room of [createVillage(),createGuildEntrance(),...createVillageInteriors()]) rooms.set(room.id,room);
  return new Game(rooms);
}

/** Prüft Titel, Auswahl, blockierte Weltaktionen und den bestehenden Aushang ohne vorzeitigen Spielstart. */
function selectionFlow() {
  const game=newGame(); game.interact(); assert.equal(game.mode,'character');
  const before=JSON.stringify({player:game.player,flags:game.flags,time:game.time});
  assert.equal(game.step('up'),false); game.journal(); game.update(20,false);
  assert.equal(game.journalOpen,false); assert.equal(JSON.stringify({player:game.player,flags:game.flags,time:game.time}),before);
  assert.match(game.description,/Weiblich/u); game.back(); assert.equal(game.mode,'title');
  game.interact(); game.interact(); assert.equal(game.mode,'world'); assert.equal(game.avatar,'female');
  assert.equal(game.message.speaker,'Aushang'); dismiss(game); assert.equal(game.notes[0].id,'invitation');
}

/** Sichert Presetauswahl über die gemeinsame native und Touch-Eingabe sowie Erhaltung bei Raumwechseln. */
function bothPresets() {
  for (const [direction,id] of [['left','female'],['right','male']]) {
    const game=newGame(),app={game,phase:'on',helpOpen:false,cartridge:{open:false},audio:{unlock:requestFrame},request:requestFrame};
    game.interact(); GameInput.prototype.direction.call({app},direction,true);
    game.interact(); dismiss(game); assert.equal(game.avatar,id); assert.equal(game.held,null);
    game.travel('village-inn'); assert.equal(game.avatar,id); game.travel('village'); assert.equal(game.avatar,id);
    assert.deepEqual(game.inventory,[]); assert.deepEqual(game.flags,{}); assert.equal(game.coins,0);
    game.reset(); assert.equal(game.mode,'title'); assert.equal(game.avatar,'male');
  }
}

/** Stellt die für den Eingabetest erforderliche Frame-Anforderung ohne Browser bereit. */
function requestFrame() { return true; }

/** Verhindert, dass eine Richtungsaktion außerhalb der Auswahl das Aussehen ändert. */
function selectionScope() {
  const game=newGame(); navigateCharacter(game,'right'); assert.equal(game.characterIndex,0);
  game.interact(); navigateCharacter(game,'right'); game.back(); game.interact(); assert.equal(game.characterIndex,1);
  game.interact(); dismiss(game); navigateCharacter(game,'left'); assert.equal(game.avatar,'male');
}

/** Reproduziert den Rundgang vor Auftragsannahme und verhindert verlorene Prüfungen beim ersten Gespräch. */
function earlyInspection() {
  const game=newGame(); game.mode='world'; game.travel('village-market');
  for (const id of ['barrel-a','barrel-b','barrel-c','barrel-d','barrel-e','barrel-f','shelf-a','shelf-b','shelf-c']) {
    useObject(game,id); dismiss(game);
  }
  assert.equal(game.flags.stockChecked.length,3); assert.equal(game.flags.stockStarted,undefined);
  assert.equal(game.coins,0); game.travel('village'); game.travel('village-market'); useObject(game,'storekeeper');
  assert.equal(game.flags.stockDone,true); assert.equal(game.coins,5); dismiss(game);
  useObject(game,'storekeeper'); assert.equal(game.coins,5);
}

/** Sichert sichtbaren Fortschritt und Häkchen bei mehrfachem Prüfen während des laufenden Auftrags. */
function repeatedInspection() {
  const game=newGame(); game.mode='world'; game.travel('village-market'); useObject(game,'storekeeper'); dismiss(game);
  for (let round=0;round<2;round++) {
    for (const id of ['barrel-e','barrel-f','shelf-b']) { useObject(game,id); dismiss(game); }
    game.travel('village'); game.travel('village-market');
  }
  assert.equal(game.flags.stockChecked.length,3); assert.equal(game.coins,0);
  const note=game.notes.find(stockNote); assert.match(note.text,/Geprüft: 3\/3/u);
  useObject(game,'barrel-e'); let text=game.message.lines.join(' ');
  for (const page of game.pages) text+=' '+page.lines.join(' ');
  assert.match(text,/3 von 3 geprüft/u); dismiss(game); useObject(game,'storekeeper'); assert.equal(game.coins,5);
}

/** Erkennt den aktuellen Journalauftrag. @param {object} note Notiz. */
function stockNote(note) { return note.id==='task-stock'; }

test('Charakterwahl: Titel, Weltpause, Rückkehr und Aushang bilden einen konsistenten Start',selectionFlow);
test('Charakterwahl: beide Presets über gemeinsame Eingabe und unveränderte Spielfortschritte',bothPresets);
test('Charakterwahl: Richtungen ändern nur in der Auswahl das Preset',selectionScope);
test('Vorratskontrolle: kompletter früher Lagerrundgang zählt beim ersten Bericht',earlyInspection);
test('Vorratskontrolle: wiederholte Rundgänge behalten Fortschritt und melden ihn im Dialog',repeatedInspection);

/** Verhindert Stottern an Auswahlgrenzen und doppelte Klänge bei der Bestätigung oder Dialogfolge. */
function characterSounds() {
  const game=newGame(); game.interact(); game.sounds=[];
  navigateCharacter(game,'left'); assert.deepEqual(game.sounds,[]);
  navigateCharacter(game,'right'); navigateCharacter(game,'right'); assert.deepEqual(game.sounds,['ui-move']);
  game.interact(); assert.deepEqual(game.sounds,['ui-move','ui-confirm']);
  dismiss(game); assert.deepEqual(game.sounds,['ui-move','ui-confirm']);
  game.reset(); game.interact(); game.sounds=[]; game.back(); assert.deepEqual(game.sounds,['ui-back']);
}
test('Charakterwahl: Bleep nur bei Wechsel, ein Bling beim Start, Rückklang beim Verlassen',characterSounds);
