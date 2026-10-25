import test from 'node:test';
import assert from 'node:assert/strict';
import { RearIntent } from '../scripts/device/input/rear-intent.js';
import { insidePolygon } from '../scripts/core/geometry.js';
import { flushHeight } from '../scripts/device/cartridge/poses.js';
import { readAudioSettings, writeAudioSettings } from '../scripts/audio/preferences.js';
const BODY={left:450,right:930,top:130,bottom:920};
const PANEL={left:1090,right:1420,top:570,bottom:920};

/** Prüft kleine Bewegungen am ursprünglichen Aktivierungspunkt. */
function rearActivation() {
  const intent=new RearIntent(); intent.reset({x:700,y:50});
  assert.equal(intent.mayLeave({x:701,y:51},BODY,PANEL),false);
  assert.equal(intent.mayLeave({x:700,y:52},BODY,PANEL),false);
  assert.equal(intent.mayLeave({x:700,y:300},BODY,PANEL),false);
  assert.equal(intent.mayLeave({x:200,y:300},BODY,PANEL),true);
}

/** Prüft bewusstes Verlassen und den Weg zu den rechts liegenden Aktionen. */
function rearActions() {
  const intent=new RearIntent(); intent.reset({x:700,y:50});
  assert.equal(intent.mayLeave({x:200,y:50},BODY,PANEL),true);
  assert.equal(intent.mayLeave({x:700,y:300},BODY,PANEL),false);
  assert.equal(intent.mayLeave({x:1000,y:600},BODY,PANEL),false);
  assert.equal(intent.mayLeave({x:1200,y:350},BODY,PANEL),true);
}

/** Prüft schräg projizierte Rückkehrflächen und verschiedene Modulhöhen. */
function projectionAndFit() {
  const polygon=[{x:20,y:20},{x:120,y:35},{x:110,y:100},{x:10,y:80}];
  assert.equal(insidePolygon(polygon,{x:30,y:30}),true);
  assert.equal(insidePolygon(polygon,{x:115,y:90}),false);
  for (const height of [0.0542,0.062,0.070]) assert.ok(Math.abs(flushHeight(0.074,height)+height-0.0739)<1e-9);
}

/** Prüft ungültige und gesperrte Browserspeicher. */
function audioFallbacks() {
  assert.deepEqual(readAudioSettings(null),{volume:0.35,muted:false,bgm:1,sfx:1,menuBeeps:true});
  assert.deepEqual(readAudioSettings({getItem:invalidJSON}),{volume:0.35,muted:false,bgm:1,sfx:1,menuBeeps:true});
  assert.deepEqual(readAudioSettings({getItem:deniedStorage}),{volume:0.35,muted:false,bgm:1,sfx:1,menuBeeps:true});
  assert.doesNotThrow(writeDenied);
}
/** Liefert beschädigte gespeicherte Daten. */
function invalidJSON() { return '{broken'; }
/** Simuliert gesperrten Browserspeicher. */
function deniedStorage() { throw new Error('Speicher gesperrt'); }
/** Prüft den Schreibpfad ohne verfügbaren Speicher. */
function writeDenied() { writeAudioSettings({setItem:deniedStorage},{volume:0.5,muted:true}); }

/** Prüft Speicherung und erneutes Lesen beider Audioeinstellungen. */
function audioRoundtrip() {
  const storage=new MemoryStorage();
  writeAudioSettings(storage,{volume:0.77,muted:true});
  assert.deepEqual(readAudioSettings(storage),{volume:0.77,muted:true,bgm:1,sfx:1,menuBeeps:true});
  writeAudioSettings(storage,{volume:4,muted:false});
  assert.deepEqual(readAudioSettings(storage),{volume:1,muted:false,bgm:1,sfx:1,menuBeeps:true});
}
/** Stellt einen minimalen lokalen Speicher bereit. */
class MemoryStorage {
  /** Initialisiert den gespeicherten Inhalt. */
  constructor() { this.value=null; }
  /** Liest einen Schlüssel. @param {string} key Schlüssel. */
  getItem(key) { return this.value; }
  /** Schreibt einen Schlüssel. @param {string} key Schlüssel. @param {string} value Inhalt. */
  setItem(key,value) { this.value=value; }
}

test('UX: Rückansicht springt am Aktivierungspunkt nicht zurück',rearActivation);
test('UX: Aktionen rechts bleiben erreichbar',rearActions);
test('UX: Rahmenprojektion und modellabhängiger bündiger Sitz',projectionAndFit);
test('Audio: sichere Standards bei gesperrtem Speicher',audioFallbacks);
test('Audio: Lautstärke und Stummschaltung bleiben erhalten',audioRoundtrip);
