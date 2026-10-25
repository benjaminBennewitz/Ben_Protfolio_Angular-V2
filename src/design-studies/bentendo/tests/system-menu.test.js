import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame,dismiss } from './helpers.js';
import { togglePause,openSaveMenu,navigateSystemMenu,activateSystemMenu,closeSystemMenu } from '../scripts/game/systems/system-menu.js';
import { SaveManager } from '../scripts/game/systems/save-manager.js';
import { currentOverlay } from '../scripts/game/render/overlays.js';
import { GameInput } from '../scripts/device/input/game-input.js';

/** Merkt die tatsächlich aufgerufenen Speicheroperationen. */
class Storage {
  /** Initialisiert den lokalen Testspeicher. */
  constructor() { this.raw=null; this.writes=0; }
  /** Liest den vorherigen Stand. @param {string} key Schlüssel. */
  getItem(key) { return this.raw; }
  /** Speichert genau eine atomare Version. @param {string} key Schlüssel. @param {string} value Daten. */
  setItem(key,value) { this.raw=value; this.writes++; }
}

/** Prüft, dass laufende Bewegung, Dialogseite und Weltzeit bei Pause erhalten bleiben. */
function freezeAndResume() {
  const game=createGame(); game.player={x:5,y:27,facing:'up'};
  game.move={fromX:5,fromY:27,x:5,y:26,time:0.04}; game.say('Du','Ein Gespräch bleibt bei der Pause erhalten.');
  const message=game.message,time=game.time;
  togglePause(game); assert.equal(currentOverlay(game),'system'); game.update(4,false); game.interact(); game.journal();
  assert.equal(game.time,time); assert.equal(game.move.time,0.04); assert.equal(game.message,message); assert.equal(game.animating,false);
  togglePause(game); assert.equal(game.message,message); assert.equal(currentOverlay(game),'dialog');
  game.update(0.2,false); dismiss(game); assert.equal(game.move,null); assert.equal(game.player.y,26);
}

/** Prüft explizite Speicherbestätigung, Abbrechen und keine erneute Speicherung beim Schließen der Meldung. */
function saveDialog() {
  const game=createGame(),storage=new Storage(),saves=new SaveManager(game,storage); game.coins=5; game.bagOpen=true;
  openSaveMenu(game); assert.equal(storage.writes,0); navigateSystemMenu(game,'down'); activateSystemMenu(game,saves);
  assert.equal(game.systemMenu,null); assert.equal(storage.writes,0); assert.equal(game.bagOpen,true);
  openSaveMenu(game); activateSystemMenu(game,saves); assert.equal(storage.writes,1); assert.match(game.systemMenu.status,/Gespeichert/u);
  activateSystemMenu(game,saves); assert.equal(storage.writes,1); assert.equal(game.systemMenu,null); assert.equal(game.bagOpen,true);
  assert.equal(JSON.parse(storage.raw).coins,5); assert.equal('systemMenu' in JSON.parse(storage.raw),false);
}

/** Behält eine verständliche Fehlermeldung bei fehlendem Speicher ohne gespielten Erfolg. */
function failedSave() {
  const game=createGame(),saves=new SaveManager(game,null); openSaveMenu(game); activateSystemMenu(game,saves);
  assert.match(game.systemMenu.status,/nicht verfügbar/u); assert.equal(game.sounds.at(-1),'ui-back');
  closeSystemMenu(game); assert.equal(game.systemMenu,null);
}

/** Führt native und Tastaturaktionen über dieselbe öffentliche Eingaberoute aus. */
function buttonActions() {
  const game=createGame(),app={game,phase:'on',helpOpen:false,cartridge:{open:false},audio:{unlock:noop},request:noop,saves:new SaveManager(game,new Storage())};
  const input={app}; GameInput.prototype.action.call(input,'start'); assert.equal(game.systemMenu.kind,'pause');
  GameInput.prototype.direction.call(input,'up',true); assert.equal(game.held,null);
  GameInput.prototype.action.call(input,'back'); assert.equal(game.systemMenu,null);
  GameInput.prototype.action.call(input,'select'); assert.equal(game.systemMenu.kind,'save');
  GameInput.prototype.action.call(input,'interact'); assert.equal(game.systemMenu.status,'Gespeichert.');
  GameInput.prototype.action.call(input,'back'); GameInput.prototype.action.call(input,'journal'); assert.equal(game.journalOpen,true);
  game.reset(); GameInput.prototype.action.call(input,'start'); assert.equal(game.mode,'world');
  game.reset(); game.resumeData=null; GameInput.prototype.action.call(input,'start'); assert.equal(game.mode,'character');
}

/** Stellt einen ereignisneutralen Handler bereit. */
function noop() { return true; }

test('START: Welt und Schritt pausieren, Dialogseite bleibt für die Fortsetzung erhalten',freezeAndResume);
test('SELECT: erst bestätigen, abbrechen ohne Änderung und genau eine Speicherung',saveDialog);
test('SELECT: Speicherfehler bleiben sichtbar und spielen keinen Erfolgsklang',failedSave);
test('Gerätetasten: START und SELECT haben eigene Aktionen, J behält das Journal',buttonActions);

/** Bewahrt Pause nach dem Speichern und erklärt, dass Debugdurchläufe nicht gesichert werden. */
function pausedSaveAndDebug() {
  const game=createGame(),saves=new SaveManager(game,new Storage());
  togglePause(game); openSaveMenu(game); activateSystemMenu(game,saves); activateSystemMenu(game,saves);
  assert.equal(game.systemMenu.kind,'pause'); closeSystemMenu(game); assert.equal(game.systemMenu,null);
  game.debugging=true; openSaveMenu(game); activateSystemMenu(game,saves);
  assert.match(game.systemMenu.status,/Debuglauf/u); assert.equal(saves.storage.writes,1);
}
test('SELECT: Speichern aus der Pause kehrt zur Pause zurück und schützt Debugdurchläufe',pausedSaveAndDebug);

/** Trennt mechanische Tastenrückmeldung von Spielaktionen und Audio vor dem Einschalten. */
function unpoweredButtons() {
  const game=createGame(),events=[],app={game,helpOpen:false,cartridge:{open:false},request:noop};
  app.device={buttons:{pulse:events.push.bind(events),direction:events.push.bind(events)}};
  app.audio={unlock:assert.fail};
  const before=JSON.stringify({player:game.player,mode:game.mode,flags:game.flags,sounds:game.sounds});
  for (const phase of ['off','boot','fault']) {
    app.phase=phase;
    for (const action of ['interact','back','start','select']) GameInput.prototype.action.call({app},action);
    GameInput.prototype.direction.call({app},'right',true);
    assert.equal(game.systemMenu,null); assert.equal(game.held,null);
    assert.equal(JSON.stringify({player:game.player,mode:game.mode,flags:game.flags,sounds:game.sounds}),before);
  }
  assert.deepEqual(events,Array(3).fill(['interact','back','start','select','right',true]).flat());
}
test('Gerätetasten: auch ohne laufendes Spiel animiert, ohne Spielzustand oder Ton zu verändern',unpoweredButtons);
