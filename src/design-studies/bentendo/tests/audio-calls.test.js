import { COMBAT_CALLS } from '../scripts/audio/combat-calls.js';
import { MechanicalSounds } from '../scripts/audio/mechanical-sounds.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { playAnimalCall } from '../scripts/audio/animal-calls.js';
import { playInteractionCall } from '../scripts/audio/interaction-calls.js';
import { playGameCue } from '../scripts/audio/game-cues.js';
import { AudioManager } from '../scripts/audio/audio-manager.js';
import { playSuccessCall } from '../scripts/audio/success-calls.js';

/** Zeichnet geplante Audio-Parameterwerte auf, ohne einen Browser zu benötigen. */
class Parameter {
  /** Initialisiert die geplanten Werte. */
  constructor() { this.values=[]; }
  /** Merkt einen Startwert. @param {number} value Wert. @param {number} time Zeitpunkt. */
  setValueAtTime(value,time) { this.values.push([value,time]); }
  /** Merkt eine lineare Rampe. @param {number} value Zielwert. @param {number} time Zeitpunkt. */
  linearRampToValueAtTime(value,time) { this.values.push([value,time]); }
  /** Merkt eine exponentielle Rampe. @param {number} value Zielwert. @param {number} time Zeitpunkt. */
  exponentialRampToValueAtTime(value,time) { this.values.push([value,time]); }
}

/** Bildet relevante Verbindungen, Zeitplanung und Aufräumereignisse eines Audioknotens ab. */
class AudioNode {
  /** Bereitet Quelle oder Hüllkurve vor. */
  constructor() { this.frequency=new Parameter(); this.gain=new Parameter(); this.connections=[]; }
  /** Merkt das Ausgabeziel. @param {object} target Zielknoten. */
  connect(target) { this.connections.push(target); }
  /** Merkt das Trennen eines fertigen Knotens. */
  disconnect() { this.disconnected=true; }
  /** Merkt das Endereignis. @param {string} type Ereignis. @param {Function} listener Handler. */
  addEventListener(type,listener) { if (type==='ended') this.ended=listener; }
  /** Merkt den Startzeitpunkt. @param {number} at Start. */
  start(at) { this.started=at; }
  /** Merkt das geplante Ende. @param {number} at Ende. */
  stop(at) { this.stopped=at; }
}

/** Stellt die Stichproben eines Geräuschpuffers bereit. */
class SoundBuffer {
  /** Reserviert den benötigten Puffer. @param {number} length Länge. */
  constructor(length) { this.samples=new Float32Array(length); }
  /** Liefert den Mono-Kanal. @param {number} channel Kanal. */
  getChannelData(channel) { assert.equal(channel,0); return this.samples; }
}

/** Stellt einen kleinen aufzeichnenden Kontext für Graph- und Lebenszyklusprüfungen bereit. */
class SoundContext {
  /** Initialisiert den laufenden Kontext. */
  constructor() { this.state='running'; this.currentTime=2; this.sampleRate=8000; this.sources=[]; }
  /** Erstellt eine Hüllkurve. */
  createGain() { return new AudioNode(); }
  /** Erstellt einen Oszillator. */
  createOscillator() { const node=new AudioNode(); this.sources.push(node); return node; }
  /** Erstellt eine Geräuschquelle. */
  createBufferSource() { return this.createOscillator(); }
  /** Erstellt einen Mono-Puffer. @param {number} channels Kanäle. @param {number} length Länge. @param {number} rate Abtastrate. */
  createBuffer(channels,length,rate) { assert.equal(channels,1); assert.equal(rate,this.sampleRate); return new SoundBuffer(length); }
}

/** Trennt die beiden fertigen Effektknoten. @param {object} source Quelle. @param {object} envelope Hüllkurve. */
function release(source,envelope) { source.disconnect(); envelope.disconnect(); }

/** Prüft hörbar angehobene Tierpegel im unveränderten gemeinsamen Ausgang samt Aufräumen. */
function animalLevels() {
  const ctx=new SoundContext(),master=ctx.createGain(),effects={context:ctx,gain:master,disconnect:release};
  for (const animal of ['cat','dog','frog','snake','squirrel','mouse','hedgehog']) playAnimalCall(effects,animal);
  const cat=ctx.sources[0],peaks=cat.connections[0].gain.values;
  assert.ok(peaks[1][0]>=2.3,'Die Katze bleibt auch gegenüber dem bisherigen Patch kräftiger.');
  for (const source of ctx.sources) {
    const envelope=source.connections[0]; assert.equal(envelope.connections[0],master);
    assert.ok(source.stopped>source.started); assert.ok(source.stopped-source.started<0.5);
    source.ended(); assert.equal(source.disconnected,true); assert.equal(envelope.disconnected,true);
  }
  assert.equal(master.disconnected,undefined);
  const count=ctx.sources.length; ctx.state='suspended'; playAnimalCall(effects,'cat'); assert.equal(ctx.sources.length,count);
}

/** Prüft unterscheidbare Tür-/Truhenprofile ohne neue Ausgänge oder blockierten-Kontext-Ausnahmen. */
function interactionProfiles() {
  const ctx=new SoundContext(),master=ctx.createGain(),effects={context:ctx,gain:master,disconnect:release};
  playInteractionCall(effects,'door'); playInteractionCall(effects,'chest');
  assert.equal(ctx.sources.length,3);
  assert.notDeepEqual(ctx.sources[0].frequency.values,ctx.sources[2].frequency.values);
  assert.ok(ctx.sources[2].connections[0].gain.values[1][0]>=3);
  for (const source of ctx.sources) assert.equal(source.connections[0].connections[0],master);
  ctx.state='suspended'; playInteractionCall(effects,'door'); assert.equal(ctx.sources.length,3);
  ctx.state='running'; playInteractionCall(effects,'unknown'); playAnimalCall(effects,'unknown'); assert.equal(ctx.sources.length,3);
}

/** Prüft die wirkliche Spielklangverteilung und den Erfolg erst nach dem Öffnen. */
function routedReward() {
  const ctx=new SoundContext(),effects={context:ctx,gain:ctx.createGain(),disconnect:release};
  playGameCue(effects,'chest'); playGameCue(effects,'treasure');
  const [opening,reward]=ctx.sources;
  assert.equal(opening.started,ctx.currentTime); assert.ok(reward.started>opening.stopped);
  assert.ok(reward.frequency.values.at(-1)[0]>reward.frequency.values[0][0]);
  playGameCue(effects,'door'); assert.equal(ctx.sources.length,4);
  playGameCue(effects,'animal-cat'); assert.equal(ctx.sources.length,5);
}

/** Aktiviert den Testkontext asynchron wie ein Browser nach einer Eingabe. */
async function resumeContext() { this.context.state='running'; }
/** Übernimmt den Masterwert im Audio-Doppel. @param {number} value Reglerwert. */
function recordVolume(value) { this.level=value; }

/** Prüft Wiederaufnahme vor Klangstart und Musikabsenkung unter Lautstärke und Mute. */
async function resumedPlayback() {
  const ctx=new SoundContext(); ctx.state='suspended';
  const manager=Object.create(AudioManager.prototype);
  manager.effects={context:ctx,gain:ctx.createGain(),disconnect:release,unlock:resumeContext,volume:recordVolume};
  manager.music={}; manager.boot={}; manager.volume=0.6; manager.muted=false;
  await manager.playCue('door'); assert.equal(ctx.sources.length,2);
  assert.equal(manager.music.volume,0.54); assert.equal(manager.effects.level,0.6); assert.equal(manager.boot.volume,0.6);
  manager.muted=true; manager.applyVolume(); assert.equal(manager.music.volume,0); assert.equal(manager.effects.level,0);
  manager.muted=false; manager.volume=1; manager.applyVolume(); assert.equal(manager.music.volume,0.9);
}

test('Audio: lautere Tierprofile behalten Masterkanal und räumen Quellen auf',animalLevels);
test('Audio: unterschiedliche Tür-/Truhenklänge und pausierter Kontext',interactionProfiles);
test('Audio: Spielereignisse spielen Öffnung und zeitversetzten Fundjubel',routedReward);
test('Audio: Wiederaufnahme verliert keinen Türklang; BGM minus zehn Prozent und Mute',resumedPlayback);

/** Prüft echte rhythmische Einzelnoten, Bassstimmen und unterschiedliche Erfolgsmelodien am vorhandenen Master. */
function successMelodies() {
  const ctx=new SoundContext(),master=ctx.createGain(),effects={context:ctx,gain:master,disconnect:release};
  playGameCue(effects,'success-waterwheel'); assert.equal(ctx.sources.length,10);
  const notes=ctx.sources.slice(0,7); assert.ok(notes.at(-1).started>notes[0].started+0.8);
  for (const note of notes) assert.equal(note.frequency.values[0][0],note.frequency.values[1][0]);
  for (const source of ctx.sources) assert.equal(source.connections[0].connections[0],master);
  playSuccessCall(effects,'success-quest'); assert.equal(ctx.sources.length,17);
  playSuccessCall(effects,'success-small'); assert.equal(ctx.sources.length,20);
  ctx.state='suspended'; playSuccessCall(effects,'success-waterwheel'); assert.equal(ctx.sources.length,20);
}
test('Audio: mehrstimmige und unterscheidbare Ziel-Fanfaren mit Einzelnoten',successMelodies);

/** Prüft Musikabsenkung bei echter Erfolgsweiterleitung und korrekte Wiederherstellung nach Mute/Regleränderung. */
function successDucking() {
  const ctx=new SoundContext(),manager=Object.create(AudioManager.prototype);
  manager.effects={context:ctx,gain:ctx.createGain(),disconnect:release,volume:recordVolume};
  manager.music={}; manager.boot={}; manager.volume=1; manager.muted=false;
  manager.playCue('success-quest'); assert.equal(ctx.sources.length,7); assert.equal(manager.ducking,true);
  assert.ok(Math.abs(manager.music.volume-0.27)<0.001);
  manager.volume=0.5; manager.muted=true; manager.applyVolume(); assert.equal(manager.music.volume,0);
  manager.restoreMusic(); assert.equal(manager.music.volume,0); assert.equal(manager.ducking,false);
  manager.muted=false; manager.applyVolume(); assert.equal(manager.music.volume,0.45);
}
test('Audio: Questfanfare senkt die Musik kurz ab und respektiert aktuellen Regler/Mute',successDucking);

/** Prüft unterscheidbare Menüklänge, diskrete Bestätigungsnoten und denselben stummschaltbaren Ausgang. */
function selectionSounds() {
  const ctx=new SoundContext(),master=ctx.createGain(),effects={context:ctx,gain:master,disconnect:release};
  playGameCue(effects,'ui-move'); playGameCue(effects,'ui-confirm'); playGameCue(effects,'ui-back');
  assert.equal(ctx.sources.length,4);
  const [move,first,second,back]=ctx.sources;
  assert.ok(move.stopped-move.started<0.06); assert.ok(second.started>first.stopped);
  assert.ok(second.frequency.values[0][0]>first.frequency.values[0][0]);
  assert.ok(back.frequency.values[0][0]<move.frequency.values[0][0]);
  assert.ok(second.stopped-ctx.currentTime<0.25);
  for (const source of ctx.sources) {
    assert.equal(source.connections[0].connections[0],master);
    source.ended(); assert.equal(source.disconnected,true);
  }
  ctx.state='suspended'; playGameCue(effects,'ui-confirm'); assert.equal(ctx.sources.length,4);
}
test('Audio: Auswahlbleep und zweistufiger Bling bleiben kurz, unterscheidbar und am Masterkanal',selectionSounds);

/** Prüft Materialpuffer nach Audiofreigabe, Wiederverwendung, SFX/Mute und vollständiges Aufräumen. */
async function mechanicalPlayback() {
  const ctx=new SoundContext();ctx.state='suspended';const manager=Object.create(AudioManager.prototype);
  manager.effects={context:ctx,gain:ctx.createGain(),disconnect:release,unlock:resumeContext,volume:recordVolume};
  manager.mechanical=new MechanicalSounds(manager.effects);manager.music={};manager.boot={};manager.volume=.5;manager.sfx=.4;manager.bgm=1;manager.muted=false;
  await manager.playMechanical('interact');assert.equal(ctx.sources.length,1);assert.equal(manager.effects.level,.2);
  const source=ctx.sources[0];assert.ok(source.buffer.samples.length>0);assert.equal(source.connections[0].connections[0],manager.effects.gain);
  await manager.playMechanical('interact');assert.equal(ctx.sources.length,1);assert.equal(manager.mechanical.buffers.size,1);
  manager.muted=true;await manager.playMechanical('interact',true);assert.equal(manager.effects.level,0);assert.equal(ctx.sources.length,2);
  source.ended();assert.equal(source.disconnected,true);assert.equal(source.connections[0].disconnected,true);
}
test('Materialklänge: Audiofreigabe, Cache, SFX/Mute und Quellenfreigabe',mechanicalPlayback);

/** Prüft alle Kampfprofile am gemeinsamen Ausgang einschließlich Kontextschutz und Quellenfreigabe. */
function combatProfiles() {
  const ctx=new SoundContext(),master=ctx.createGain(),effects={context:ctx,gain:master,disconnect:release},signatures=new Set();
  for (const cue of Object.keys(COMBAT_CALLS)) { playGameCue(effects,cue); signatures.add(JSON.stringify(COMBAT_CALLS[cue])); }
  assert.equal(signatures.size,7);
  for (const source of ctx.sources) {
    const envelope=source.connections[0]; assert.equal(envelope.connections[0],master);
    assert.ok(source.stopped>source.started); assert.ok(source.stopped-source.started<0.5);
    source.ended(); assert.equal(source.disconnected,true); assert.equal(envelope.disconnected,true);
  }
  const count=ctx.sources.length; ctx.state='suspended'; playGameCue(effects,'combat-hurt'); assert.equal(ctx.sources.length,count);
}

test('Kampfklänge: sieben unterschiedliche Profile am vorhandenen SFX-Ausgang',combatProfiles);

/** Prüft den kräftigen Luftzug mit kurzem Metallnachklang am gemeinsamen SFX-Ausgang. */
function swordAir() {
  const ctx=new SoundContext(),master=ctx.createGain(),effects={context:ctx,gain:master,disconnect:release};
  playGameCue(effects,'combat-swing-sword'); assert.equal(ctx.sources.length,2);
  const [air,metal]=ctx.sources;
  assert.ok(air.buffer.samples.length>0); assert.ok(air.buffer.samples.some(nonSilent));
  assert.equal(air.started,ctx.currentTime); assert.ok(air.stopped-air.started<=.111);
  assert.equal(air.connections[0].gain.values[1][0],4); assert.equal(metal.type,'triangle');
  assert.equal(air.connections[0].connections[0],master);
  air.ended(); assert.equal(air.disconnected,true); assert.equal(air.connections[0].disconnected,true);
}
/** Erkennt ein tatsächlich hörbares PCM-Sample. @param {number} value Amplitude. */
function nonSilent(value) { return Math.abs(value)>.01; }
test('Schwerthieb: kurzer kräftiger Swoosh mit Metallanteil am vorhandenen SFX-Ausgang',swordAir);
