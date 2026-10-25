import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { GbfxSounds,GBFX_CUES } from '../scripts/audio/gbfx-sounds.js';
import { AudioManager } from '../scripts/audio/audio-manager.js';
import { readAudioSettings,writeAudioSettings } from '../scripts/audio/preferences.js';
import { openAudioMenu,syncAudioMenu,navigateAudioMenu } from '../scripts/game/systems/audio-menu.js';
import { activateSystemMenu } from '../scripts/game/systems/system-menu.js';
import { createGame } from './helpers.js';
import { serveDrink } from '../scripts/game/systems/tavern.js';

/** Prüft alle ausgewählten Originaldateien und die unverwechselbaren Klangfamilien. */
function bankFiles() {
  assert.equal(new Set(Object.values(GBFX_CUES)).size,11);
  for (const file of new Set(Object.values(GBFX_CUES))) {
    const bytes=fs.readFileSync(new URL(`../assets/sounds/gbfx/${file}.wav`,import.meta.url));
    assert.equal(bytes.toString('ascii',0,4),'RIFF'); assert.equal(bytes.toString('ascii',8,12),'WAVE');
    assert.ok(bytes.length>1000);
  }
  assert.equal(GBFX_CUES['combat-hit-spider'],'33_weird_pitch_up');
  assert.equal(GBFX_CUES['combat-refill'],'10_bling_up');
  assert.notEqual(GBFX_CUES['combat-death-large'],GBFX_CUES['combat-death-enemy']);
}
/** Liest den isolierten Testspeicher. @param {string} key Speicherkennung. */
function read(key) { return this.raw; }
/** Schreibt den isolierten Testspeicher. @param {string} key Speicherkennung. @param {string} value Inhalt. */
function write(key,value) { this.raw=value; }
/** Merkt eine persistierte Änderung ohne Timer. */
function saved() { this.saved=true; }
/** Prüft Migration, A-Umschaltung, Richtungen und die neue Zurückzeile ohne Änderungen an SFX. */
function beepSettings() {
  const storage={getItem:read,setItem:write,raw:'{}'},game=createGame(),audio=Object.create(AudioManager.prototype);
  Object.assign(audio,readAudioSettings(storage),{saveSettings:saved});
  openAudioMenu(game); syncAudioMenu(game,audio); game.systemMenu.choice=2;
  activateSystemMenu(game,null,audio); assert.equal(audio.menuBeeps,false); assert.equal(audio.sfx,1);
  writeAudioSettings(storage,audio); assert.equal(readAudioSettings(storage).menuBeeps,false);
  activateSystemMenu(game,null,audio); assert.equal(audio.menuBeeps,true);
  navigateAudioMenu(game,'left',audio); assert.equal(audio.menuBeeps,false);
  navigateAudioMenu(game,'right',audio); assert.equal(audio.menuBeeps,true);
  navigateAudioMenu(game,'down',audio); assert.equal(game.systemMenu.choice,3);
  activateSystemMenu(game,null,audio); assert.equal(game.systemMenu,null); assert.equal(game.bagOpen,true);
}
/** Merkt weitergeleitete Sample-Ereignisse. @param {string} cue Klangkennung. */
function recordCue(cue) { this.played.push(cue); return true; }
/** Ersetzt Vorladen ohne Netzwerk. */
function prepared() {}
/** Prüft, dass abgeschaltete Menü-Beeps weder Kampf noch Ablehnungen oder Fanfaren unterdrücken. */
function independentToggle() {
  const audio=Object.create(AudioManager.prototype);audio.menuBeeps=false;
  audio.gbfx={prepare:prepared,play:recordCue,played:[]};
  for (const cue of ['ui-move','ui-confirm','ui-back','ui-denied','combat-refill','combat-hit-spider','success-quest']) audio.routeCue(cue);
  assert.deepEqual(audio.gbfx.played,['ui-denied','combat-refill','combat-hit-spider','success-quest']);
  audio.menuBeeps=true; audio.routeCue('ui-back'); assert.equal(audio.gbfx.played.at(-1),'ui-back');
}
/** Baut einen aufzeichnenden Audioknoten. */
function node() { return {gain:{value:0},connect:connect,addEventListener:listen,start:start,disconnect:disconnect}; }
/** Merkt die nächste Verbindung. @param {object} target Ausgang. */
function connect(target) { this.target=target; }
/** Merkt die Freigabe nach dem Abspielen. @param {string} name Ereignis. @param {Function} handler Freigabe. @param {object} options Optionen. */
function listen(name,handler,options) { this.ended=handler; }
/** Merkt die Startzeit. @param {number} at Kontextzeit. */
function start(at) { this.at=at; }
/** Merkt die Knotentrennung. */
function disconnect() { this.disconnected=true; }
/** Trennt ausschließlich die temporären Knoten. @param {object} source Quelle. @param {object} level Pegel. */
function release(source,level) { source.disconnect(); level.disconnect(); }
/** Prüft direkten SFX-Ausgang, fehlende verspätete Wiedergabe und vollständige Quellenfreigabe. */
function samplePlayback() {
  const context={state:'running',currentTime:12,createBufferSource:node,createGain:node},gain=node();
  const bank=new GbfxSounds({context,gain,disconnect:release});
  assert.equal(bank.play('ui-move'),false); bank.buffers.set('00_beep',{pcm:true});
  context.createBufferSource=captureSource.bind(context); assert.equal(bank.play('ui-move'),true);
  const source=context.source; assert.equal(source.at,12); assert.equal(source.target.target,gain);
  source.ended(); assert.equal(source.disconnected,true); assert.equal(source.target.disconnected,true);
  assert.equal(gain.disconnected,undefined); context.state='suspended'; assert.equal(bank.play('ui-move'),false);
}
/** Merkt die erzeugte Quelle am Testkontext. */
function captureSource() { this.source=node(); return this.source; }
/** Prüft die echte Geldablehnung im Wirtshaus ohne versehentlichen Kauf. */
function refusedPurchase() {
  const game=createGame();game.seat={};game.roomState.service={phase:'ready'};game.tavernChoice=2;game.coins=0;
  serveDrink(game); assert.ok(game.sounds.includes('ui-denied')); assert.equal(game.coins,0);
}
test('GBFX: elf ausgewählte PCM-Dateien und eindeutige Klangfamilien',bankFiles);
test('GBFX: persistente Menü-Beeps mit A, Richtungen und unverändertem SFX-Regler',beepSettings);
test('GBFX: Menüschalter lässt Spielrückmeldungen und Fanfaren hörbar',independentToggle);
test('GBFX: Sample-Knoten verwenden SFX-Ausgang und werden freigegeben',samplePlayback);
test('GBFX: fehlende Münzen lösen Ablehnung statt Kauf aus',refusedPurchase);
