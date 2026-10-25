import test from 'node:test';
import assert from 'node:assert/strict';
import { CartridgeDrag } from '../scripts/device/input/cartridge-drag.js';
import { CartridgeController } from '../scripts/device/cartridge/controller.js';
import { CartridgeState } from '../scripts/device/cartridge/state.js';
import { CARTRIDGE_POSES,insertionPosition } from '../scripts/device/cartridge/poses.js';

/** Ignoriert externe Grafik-, Fokus- und Audioeffekte. */
function noop() {}
/** Liefert die projizierte Richtung eines leicht schräg dargestellten Schachts. */
function insertionAxis() { return {x:20,y:80}; }
/** Liefert das aktuell getroffene Bauteil. */
function hit() { return this.hitObject; }
/** Prüft die Zugehörigkeit des getroffenen Bauteils. @param {string} object Bauteil. */
function isCartridge(object) { return object==='cartridge'; }

/** Bildet Pointer-Capture einschließlich synchronem Verlustereignis ab. */
class CaptureNode {
  /** Initialisiert den sichtbaren Zeiger und Pointer-Capture. */
  constructor() { this.style={cursor:''}; this.captured=null; }
  /** Hält einen Zeiger fest. @param {number} id Zeigerkennung. */
  setPointerCapture(id) { this.captured=id; }
  /** Prüft den festgehaltenen Zeiger. @param {number} id Zeigerkennung. */
  hasPointerCapture(id) { return this.captured===id; }
  /** Gibt den Zeiger frei und meldet den Capture-Verlust. @param {number} id Zeigerkennung. */
  releasePointerCapture(id) { this.captured=null; this.onLost?.({pointerId:id}); }
}

/** Stellt den echten Cartridge-Controller mit einem kleinen Geräte-Doppel bereit. */
class DragApp {
  /** Bereitet Gerät, bestehenden Zustand und Audio-Schnittstelle vor. */
  constructor() {
    this.device={ready:true,view:'rear',rig:{rotation:{y:Math.PI}},viewport:new CaptureNode(),drag:null,hitObject:'cartridge',hit,isCartridge};
    this.device.cartridge={state:new CartridgeState(),insertionAxis,insertionProgress:null};
    this.phase='off'; this.helpOpen=false; this.audio={unlock:noop,effects:{tone:noop}}; this.ui={sync:noop};
    this.cartridge=new CartridgeController(this); this.presses=0; this.powerChanges=0;
  }
  /** Merkt tatsächliche Einschaltänderungen. @param {boolean} on Zustand. */
  setPower(on) { this.power=on; this.powerChanges++; }
  /** Nimmt zugängliche Statusmeldungen entgegen. @param {string} text Meldung. */
  announce(text) { this.message=text; }
  /** Fordert einen Zeichenzyklus an. */
  request() {}
  /** Erhält den bisherigen Klickpfad zum Betrachten. @param {PointerEvent} event Ereignis. */
  pressModel(event) { this.presses++; }
}

/** Erstellt eine Zeigereingabe entlang der projizierten Einschubrichtung. @param {object} app Anwendung. @param {number} progress Vorschub. @param {number} id Zeigerkennung. */
function eventAt(app,progress=0,id=1) {
  return {button:0,pointerId:id,pointerType:'mouse',clientX:100+20*progress,clientY:100+80*progress,currentTarget:app.device.viewport,preventDefault:noop};
}

/** Prüft direkten Vorschub, Kamerasperre und einmaliges Einrasten über den echten Controller. */
function pushByDragging() {
  const app=new DragApp(),gesture=new CartridgeDrag(app),cart=app.device.cartridge;
  app.device.viewport.onLost=gesture.end.bind(gesture,true);
  assert.equal(gesture.start(eventAt(app)),true); assert.ok(app.device.drag); assert.equal(app.device.viewport.captured,1);
  gesture.move(eventAt(app,0.5)); assert.equal(cart.insertionProgress,0.5); assert.equal(cart.state.slot,'partial');
  assert.equal(gesture.end(false,eventAt(app,0.7)),true);
  assert.equal(cart.state.slot,'seated'); assert.equal(cart.insertionProgress,null); assert.equal(app.device.drag,null);
  assert.equal(app.power,false); assert.equal(app.powerChanges,1); assert.equal(app.presses,0);
  assert.equal(app.device.viewport.captured,null); assert.equal(app.device.viewport.style.cursor,'');
  assert.equal(gesture.end(false,eventAt(app,1)),false); assert.equal(app.powerChanges,1);
}

/** Prüft Zurückgleiten, falsche Richtung, verlorenen Fokus und fremde Zeiger. */
function cancelOrReturn() {
  const app=new DragApp(),gesture=new CartridgeDrag(app),cart=app.device.cartridge;
  gesture.start(eventAt(app)); gesture.move(eventAt(app,-1)); assert.equal(cart.insertionProgress,0);
  assert.equal(gesture.move(eventAt(app,1,2)),false); assert.equal(gesture.end(false,eventAt(app,1,2)),false);
  gesture.end(false,eventAt(app,0.4)); assert.equal(cart.state.slot,'partial'); assert.equal(app.presses,0);
  gesture.start(eventAt(app)); gesture.move(eventAt(app,2)); assert.equal(cart.insertionProgress,1);
  gesture.end(true); assert.equal(cart.state.slot,'partial'); assert.equal(cart.insertionProgress,null);
  assert.equal(app.powerChanges,0); assert.equal(app.device.drag,null);
  gesture.start(eventAt(app)); gesture.end(false,eventAt(app)); assert.equal(app.presses,1);
}

/** Prüft erlaubte Ansichten und Bauteile sowie bestehende Zustands- und Buttonaktionen. */
function guardedStart() {
  const app=new DragApp(),gesture=new CartridgeDrag(app),cart=app.device.cartridge;
  for (const slot of ['removed','seated']) { cart.state.slot=slot; assert.equal(gesture.start(eventAt(app)),false); }
  cart.state.slot='partial'; app.device.hitObject='shell'; assert.equal(gesture.start(eventAt(app)),false);
  app.device.hitObject='cartridge'; app.device.view='front'; assert.equal(gesture.start(eventAt(app)),false);
  app.device.view='rear'; app.phase='boot'; assert.equal(gesture.start(eventAt(app)),false);
  app.phase='off'; app.helpOpen=true; assert.equal(gesture.start(eventAt(app)),false);
  app.helpOpen=false; const rightClick=eventAt(app); rightClick.button=2; assert.equal(gesture.start(rightClick),false);
  assert.equal(app.device.drag,null); app.cartridge.act('push'); assert.equal(cart.state.slot,'seated');
}

/** Prüft die Vorschau anhand der tatsächlich angepassten Positionen statt fester Bildschirmdistanzen. */
function insertionPreview() {
  assert.deepEqual(insertionPosition(CARTRIDGE_POSES,0),CARTRIDGE_POSES.partial);
  assert.deepEqual(insertionPosition(CARTRIDGE_POSES,1),CARTRIDGE_POSES.seated);
  const middle=insertionPosition(CARTRIDGE_POSES,0.5);
  assert.equal(middle[1],(CARTRIDGE_POSES.partial[1]+CARTRIDGE_POSES.seated[1])/2);
  assert.deepEqual(insertionPosition({partial:[1,4,3],seated:[2,2,5]},0.5),[1.5,3,4]);
}

test('Cartridge-Ziehen: Vorschau und einmaliges Einrasten über den bestehenden Controller',pushByDragging);
test('Cartridge-Ziehen: Abbruch, kurzer Zug, Klick und fremde Zeiger',cancelOrReturn);
test('Cartridge-Ziehen: nur sichtbares Modul hinten; Button bleibt verfügbar',guardedStart);
test('Cartridge-Ziehen: Vorschau folgt den angepassten Modellpositionen',insertionPreview);
