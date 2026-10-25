import { powerGestureState } from '../scripts/device/input/power-gesture.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { NativeButtons } from '../scripts/device/input/native-buttons.js';
import { ModelButtons } from '../scripts/device/input/model-buttons.js';
import { GameInput } from '../scripts/device/input/game-input.js';
import { updateTouchPoints } from '../scripts/device/touch-points.js';
import { mechanicalSamples } from '../scripts/audio/mechanical-sounds.js';
import { createGame,useObject,dismiss } from './helpers.js';
import { createSourceCave,createMaraArchive } from '../scripts/game/data/mara-rooms.js';

/** Stellt einen nebenwirkungsfreien DOM-Handler bereit. */
function noop() {}
/** Speichert Klangereignisse ohne einen Audiokontext zu benötigen. @param {string} action Taste. @param {boolean} released Loslassen. */
function recordMechanical(action,released=false) { this.calls.push([action,released]); }
/** Meldet bewusst keinen Modelltreffer. @param {object} event Ereignis. */
function missedRaycast(event) { return null; }
/** Liefert eine feste Testrichtung. @param {object} event Ereignis. */
function direction(event) { return 'right'; }

/** Prüft die native Route bei leerem Raycast, ausgeschaltetem Gerät und gehaltenem zweiten Finger. */
function nativeInputWithoutRaycast() {
  const game=createGame(),app={game,phase:'off',request:noop,helpOpen:false,cartridge:{open:false},audio:{calls:[],unlock:noop,playMechanical:recordMechanical},dpadDirection:direction};
  app.device={ready:true,view:'front',hit:missedRaycast,buttons:{pulse:noop,hold:noop,direction:noop,release:noop}};
  app.input=Object.create(GameInput.prototype);app.input.app=app;
  const controller=new ModelButtons(app),native=Object.create(NativeButtons.prototype);native.app=app;native.controls=controller;
  const a=event(1,{modelAction:'interact'}),right=event(2,{modelDirection:'right'}),before=JSON.stringify(game.player);
  native.start(a);assert.equal(controller.pointers.get(1).action,'interact');assert.equal(JSON.stringify(game.player),before);
  assert.deepEqual(app.audio.calls[0],['interact',false]);controller.end(a);assert.deepEqual(app.audio.calls[1],['interact',true]);
  native.start(right);assert.equal(game.held,null);controller.end(right);
  app.phase='on';native.start(right);assert.equal(game.held,'right');native.start(a);controller.end(a);assert.equal(game.held,'right');
  controller.cancel({});assert.equal(game.held,null);assert.equal(controller.pointers.size,0);
}
/** Bildet eine Berührung auf einer explizit bezeichneten HTML-Fläche ab. @param {number} id Zeigerkennung. @param {object} dataset Tastenkennung. */
function event(id,dataset) { return {pointerId:id,button:0,currentTarget:{dataset,setPointerCapture:noop},preventDefault:noop}; }

/** Liefert einen eindeutigen Projektionspunkt ohne 3D-Laufzeit. @param {object} part Modellteil. @param {object} local Optionaler lokaler Punkt. */
function project(part,local) { return {x:part.x || 100,y:part.y || 200}; }
/** Findet das bekannte Modellteil in der Testkarte. @param {string} name Name. */
function findPart(name) { return {name,x:100,y:200}; }
/** Liefert einen veränderbaren lokalen Punkt. */
function clonePoint() { return {set:setPoint}; }
/** Merkt einen lokalen Vektor. @param {number} x X. @param {number} y Y. @param {number} z Z. */
function setPoint(x,y,z) { return {x,y,z}; }
/** Erstellt eine minimale native Fläche mit messbarem Zustand. @param {object} dataset Kennung. */
function node(dataset={}) { return {dataset,style:{},hidden:true}; }

/** Prüft projizierte Flächen vor Power, verborgene Außenpunkte im Spiel und weiterhin aktive A/B-Flächen. */
function discoveryLifecycle() {
  const ids=new Map();for (const id of ['experience','model-controls','power','contrast','volume','cartridge-hotspot']) ids.set(id,node());
  const keys=[node({modelAction:'interact'}),node({modelDirection:'up'})],guides=[node({deviceView:'top'}),node({deviceView:'rear'})];
  globalThis.document={getElementById:ids.get.bind(ids),querySelectorAll:selectNodes.bind(null,keys,guides)};
  const part={position:{clone:clonePoint}},device={compact:{matches:true},view:'front',root:{getObjectByName:findPart},refs:{power:part,contrast:part,volume:part},cartridge:{model:part},project,viewport:{offsetLeft:12,offsetTop:8,clientHeight:600},camera:{top:.09,bottom:-.09}};
  const app={device,phase:'off',game:{mode:'title'},cartridge:{open:false},helpOpen:false};updateTouchPoints(app);
  assert.equal(ids.get('experience').dataset.touchGuides,'true');assert.equal(ids.get('model-controls').hidden,false);assert.equal(guides[0].hidden,false);assert.equal(keys[0].style.left,'112px');
  app.phase='on';app.game.mode='world';updateTouchPoints(app);assert.equal(guides[0].hidden,true);assert.equal(ids.get('model-controls').hidden,false);
  app.helpOpen=true;updateTouchPoints(app);assert.equal(ids.get('model-controls').hidden,true);delete globalThis.document;
}
/** Liefert nur bekannte Touchflächen des Tests. @param {object[]} keys Gerätetasten. @param {object[]} guides Außenpunkte. @param {string} selector DOM-Abfrage. */
function selectNodes(keys,guides,selector) { return selector.includes('data-model')?keys:guides; }

/** Prüft kurze, begrenzte Materialgeräusche, leisere Freigabe und klar unterschiedliche PCM-Profile. */
function mechanicalProfiles() {
  const profiles=[];
  for (const action of ['interact','back','start','select','dpad']) {
    const samples=mechanicalSamples(action,false,22050),release=mechanicalSamples(action,true,22050);
    assert.ok(samples.length>1000 && samples.length<3000);assert.ok(release.length<samples.length);
    let peak=0,energy=0;for (const sample of samples) { assert.ok(Number.isFinite(sample));peak=Math.max(peak,Math.abs(sample));energy+=sample*sample; }
    assert.ok(peak>.1 && peak<=.95);profiles.push(energy/samples.length);
  }
  assert.equal(new Set(profiles).size,5);assert.equal(mechanicalSamples('journal'),null);
}

/** Prüft einen einzigen Kammerausgang und einen verständlich gesperrten historischen Archivgang. */
function singleChamberEntrance() {
  const game=createGame();game.rooms.set('mara-cave',createSourceCave());game.rooms.set('mara-archive',createMaraArchive(game.rooms.get('archive')));
  game.travel('mara-cave');assert.equal(game.objects.filter(travelObject).length,1);
  game.flags.northOpen=true;game.travel('mara-archive',[16,2]);useObject(game,'exit');assert.equal(game.room.id,'mara-archive');assert.match(game.message.lines.join(' '),/eingestürzt/u);dismiss(game);
}
/** Erkennt benutzbare Raumwechsel. @param {object} object Requisite. */
function travelObject(object) { return object.action==='travel'; }

test('Touch: native Tasten funktionieren ausgeschaltet auch ohne Raycasttreffer',nativeInputWithoutRaycast);
test('Touchpunkte: Außenhinweise bis Spielbeginn, Tastenflächen bleiben danach aktiv',discoveryLifecycle);
test('Materialklänge: fünf kurze PCM-Profile statt Chiptune-Noten',mechanicalProfiles);
test('Staukammer: ein Ausgang, historischer Archivgang nachvollziehbar gesperrt',singleChamberEntrance);

/** Prüft Power-Tippen auf Touch und erhält Schieber- und Abbruchverhalten. */
function touchPower() {
  const tap={pointerType:'touch',distance:2,value:0};
  assert.equal(powerGestureState(tap,false,false),true);assert.equal(powerGestureState(tap,true,false),false);
  assert.equal(powerGestureState(tap,false,true),false);assert.equal(powerGestureState(tap,true,true),true);
  assert.equal(powerGestureState({...tap,distance:20,preview:.7},false,false),true);
  assert.equal(powerGestureState({...tap,pointerType:'mouse'},false,false),false);
}
test('Touch: Power tippt ein und aus, Ziehen und Abbruch bleiben konsistent',touchPower);
