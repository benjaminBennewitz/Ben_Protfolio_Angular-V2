import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createGame,useObject,dismiss } from './helpers.js';
import { createSourceCave,createMaraArchive } from '../scripts/game/data/mara-rooms.js';
import { navigateBag } from '../scripts/game/systems/inventory.js';
import { navigateSystemMenu,activateSystemMenu,togglePause,closeSystemMenu } from '../scripts/game/systems/system-menu.js';
import { syncAudioMenu } from '../scripts/game/systems/audio-menu.js';
import { AudioManager } from '../scripts/audio/audio-manager.js';
import { readAudioSettings,writeAudioSettings } from '../scripts/audio/preferences.js';
import { captureGame,restoreGame } from '../scripts/game/systems/save-state.js';
import { SaveManager } from '../scripts/game/systems/save-manager.js';
import { ModelButtons } from '../scripts/device/input/model-buttons.js';
import { GameInput } from '../scripts/device/input/game-input.js';
import { sceneTarget } from '../scripts/device/view-target.js';

/** Merkt ausschließlich den effektiven Tonkanalwert. @param {number} level Lautstärke. */
function recordVolume(level) { this.level=level; }
/** Stellt einen nebenwirkungsfreien Handler bereit. */
function noop() {}
/** Baut die reale Kanalberechnung mit austauschbaren Audioausgängen auf. */
function audioManager() {
  const audio=Object.create(AudioManager.prototype);
  Object.assign(audio,{volume:.5,bgm:1,sfx:1,muted:false,ducking:false,music:{},boot:{},effects:{volume:recordVolume},saveSettings:noop});
  return audio;
}

/** Prüft unabhängige Regler, Stummschaltung, Ducking und persistente Migration alter Einstellungen. */
function separateChannels() {
  const audio=audioManager(); audio.setChannel('bgm',.4);
  assert.ok(Math.abs(audio.music.volume-.18)<1e-9); assert.equal(audio.effects.level,.5);
  audio.setChannel('sfx',.6); assert.equal(audio.effects.level,.3); assert.equal(audio.boot.volume,.3);
  audio.ducking=true; audio.applyVolume(); assert.ok(Math.abs(audio.music.volume-.054)<1e-9);
  audio.muted=true; audio.applyVolume(); assert.equal(audio.music.volume,0); assert.equal(audio.effects.level,0);
  const storage={getItem:readValue,setItem:writeValue,raw:'{"volume":0.7,"muted":false}'};
  assert.deepEqual(readAudioSettings(storage),{volume:.7,muted:false,bgm:1,sfx:1,menuBeeps:true});
  writeAudioSettings(storage,{volume:.7,muted:false,bgm:.4,sfx:.6}); assert.equal(readAudioSettings(storage).sfx,.6);
}
/** Liest den Testspeicher. @param {string} key Speicherkennung. */
function readValue(key) { return this.raw; }
/** Schreibt den Testspeicher. @param {string} key Speicherkennung. @param {string} raw Inhalt. */
function writeValue(key,raw) { this.raw=raw; }

/** Erreicht Journal und Ton vollständig mit B, Richtungen und A, einschließlich korrektem Rückweg. */
function twoButtonMenus() {
  const game=createGame(),audio=audioManager();game.back(); navigateBag(game,'right'); assert.equal(game.bagIndex,7);
  game.interact(); assert.equal(game.journalOpen,true); game.back(); assert.equal(game.bagOpen,true); assert.equal(game.bagIndex,7);
  navigateBag(game,'down'); game.interact(); syncAudioMenu(game,audio); assert.equal(game.systemMenu.kind,'audio');
  const time=game.time; game.update(3,false); assert.equal(game.time,time);
  navigateSystemMenu(game,'left',audio); assert.equal(audio.bgm,.9); assert.equal(audio.sfx,1);
  navigateSystemMenu(game,'down',audio); navigateSystemMenu(game,'left',audio); assert.equal(audio.sfx,.9);
  game.back(); assert.equal(game.systemMenu,null); assert.equal(game.bagOpen,true);
  game.back(); togglePause(game); for (let i=0;i<3;i++) navigateSystemMenu(game,'down',audio);
  activateSystemMenu(game,null,audio); assert.equal(game.systemMenu.kind,'audio'); closeSystemMenu(game); assert.equal(game.systemMenu.kind,'pause');
}

/** Prüft zugängliche Tor- und Windenstandorte, Beckenbarriere und beide Rückwege am echten Grundriss. */
function chamberRoutes() {
  const game=createGame(); game.rooms.set('mara-cave',createSourceCave());game.rooms.set('mara-archive',createMaraArchive(game.rooms.get('archive')));
  game.travel('mara-cave'); assert.equal(game.occupied(10,7),true); assert.equal(game.occupied(7,9),false);
  useObject(game,'source-sign'); dismiss(game); useObject(game,'source-winch'); dismiss(game);
  useObject(game,'source-gate'); dismiss(game); assert.equal(game.flags.maraSpringSurveyed,true);
  assert.equal(game.room.layout[1][14],'#'); assert.equal(game.room.layout[2][14],'#');
  assert.equal(game.objects.some(isArchiveExit),false);
  const room=game.rooms.get('mara-cave'); assert.ok(fs.existsSync(new URL(`../assets/sounds/${room.music}.mp3`,import.meta.url)));
}

/** Erkennt den entfernten doppelten Rückweg. @param {object} object Raumobjekt. */
function isArchiveExit(object) { return object.id==='archive-return'; }

/** Bewahrt alte Kammerstände auf nun überfluteten Feldern ohne Verlust von Funden und Questfortschritt. */
function chamberSaveMigration() {
  const game=createGame(); game.rooms.set('mara-cave',createSourceCave()); game.travel('mara-cave');game.flags.maraSpringReported=true;game.coins=12;
  const old=captureGame(game); delete old.roomRevision; old.player={x:15,y:8,facing:'up'};
  const storage={getItem:readValue,raw:JSON.stringify(old)},manager=new SaveManager(game,storage);assert.ok(game.resumeData);
  assert.equal(restoreGame(game,old),true); assert.equal(game.player.x,3); assert.equal(game.player.y,13); assert.equal(game.flags.maraSpringReported,true); assert.equal(game.coins,12);
  const invalid=structuredClone(old);invalid.player.x=-2;assert.equal(restoreGame(game,invalid),false);
}

/** Bildet Berührungen inklusive eigener Pointerkennung und Capture nach. @param {number} id Finger. @param {string} name Modellteil. @param {string} direction Richtung. */
function pointer(id,name,direction='right') { return {pointerId:id,node:{name},direction,preventDefault:noop,currentTarget:{setPointerCapture:noop}}; }
/** Liefert den tatsächlich berührten Modellknoten. @param {object} event Ereignis. */
function hit(event) { return event.node; }
/** Liefert die Richtung der Testberührung. @param {object} event Ereignis. */
function dpadDirection(event) { return event.direction; }

/** Prüft gehaltenes Laufen, zweiten Finger, Freigabe, Abbruch und mechanische Bedienung im ausgeschalteten Zustand. */
function directModelButtons() {
  const game=createGame(),app={game,phase:'on',helpOpen:false,cartridge:{open:false},audio:{unlock:noop},request:noop,dpadDirection};
  app.device={ready:true,view:'front',hit,buttons:{hold:noop,release:noop,direction:noop,pulse:noop}};
  app.input=Object.create(GameInput.prototype);app.input.app=app;const controls=new ModelButtons(app);
  controls.start(pointer(1,'DPAD'));assert.equal(game.held,'right');game.update(.3,true);
  controls.start(pointer(2,'BUTTON_A'));assert.equal(game.held,'right');
  controls.end(pointer(2,'BUTTON_A'));assert.equal(game.held,'right');
  controls.move(pointer(1,'DPAD','up'));assert.equal(game.held,'up');
  controls.cancel(pointer(1,'DPAD'));assert.equal(game.held,null);assert.equal(controls.pointers.size,0);
  app.phase='off';const before=JSON.stringify(game.player);controls.start(pointer(3,'DPAD'));assert.equal(game.held,null);assert.equal(JSON.stringify(game.player),before);
  controls.cancel({});assert.equal(controls.pointers.size,0);
}

/** Prüft die vollständige Gehäuseprojektion in schmalen und quer gehaltenen mobilen Viewports. */
function fullMobileDevice() {
  const bounds={min:{x:-.04,y:-.075},max:{x:.05,y:.075}},device={view:'front',compact:{matches:true},refs:{bounds}},target=sceneTarget(device);
  for (const [w,h] of [[320,496],[390,772],[844,318]]) {
    const aspect=w/h,span=Math.max(target.span,target.width/aspect),top=target.center+span/2,bottom=target.center-span/2;
    assert.ok(top>bounds.max.y && bottom<bounds.min.y);assert.ok(span*aspect>bounds.max.x-bounds.min.x);
  }
  device.compact.matches=false;assert.equal(sceneTarget(device).span,.06);
}

test('Ton: BGM und SFX bleiben getrennt, gespeichert und mit Master/Mute kombinierbar',separateChannels);
test('Menüs: Notizen und Ton ohne J, Rückwege und pausierte Spielzeit',twoButtonMenus);
test('Staukammer: trockene Wege, Wandtor, Handwinde und Archivgang erreichbar',chamberRoutes);
test('Staukammer: alter Spielstand landet sicher und erhält Fortschritt',chamberSaveMigration);
test('Modell: gehaltenes Steuerkreuz, zweiter Finger und saubere Freigabe auch ausgeschaltet',directModelButtons);
test('Mobil: das komplette Gehäuse passt in Hoch- und Querformat',fullMobileDevice);
