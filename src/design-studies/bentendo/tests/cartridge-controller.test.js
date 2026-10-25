import test from 'node:test';
import assert from 'node:assert/strict';
import { CartridgeController } from '../scripts/device/cartridge/controller.js';
import { CartridgeState } from '../scripts/device/cartridge/state.js';
import { CARTRIDGE_POSES } from '../scripts/device/cartridge/poses.js';

/** Ignoriert externe Grafik-, Fokus- und Audioeffekte im Zustandstest. */
function noop() {}

/** Stellt die vom Controller benötigten Geräteschnittstellen bereit. */
class TestApp {
  /** Erstellt ein einfaches Gerät mit unabhängigem Cartridge-Zustand. */
  constructor() {
    this.device = { ready:true, cartridge:{ state:new CartridgeState(), turned:false } };
    this.ui = { sync:noop, focusHelp:noop, focusCartridge:noop };
    this.audio = { unlock:noop, effects:{ tone:noop } };
    this.phase = 'off'; this.view = 'rear';
  }
  /** Übernimmt den Einschaltzustand. @param {boolean} on Einschalten. */
  setPower(on) { this.power = on; }
  /** Übernimmt die angeforderte Ansicht. @param {string} view Ansicht. */
  setView(view) { this.view = view; }
  /** Nimmt eine Zustandsmeldung entgegen. @param {string} message Meldung. */
  announce(message) { this.message = message; }
}

/** Prüft jederzeitige Rückkehr und Wiederherstellung des vorherigen Sitzes. */
function leaveInspection() {
  for (const slot of ['partial','seated']) {
    const app = new TestApp(), controller = new CartridgeController(app);
    app.device.cartridge.state.slot = slot; controller.open = true;
    controller.examine(); assert.equal(app.device.cartridge.state.slot,'removed');
    controller.leave('right'); assert.equal(controller.open,false);
    assert.equal(app.view,'right'); assert.equal(app.device.cartridge.state.slot,slot);
    assert.equal(app.power,false);
  }
}

/** Prüft das bündige Einsetzen anhand der maximalen Modellhöhe inklusive Kanten. */
function flushInsertion() {
  assert.ok(CARTRIDGE_POSES.seated[1]+0.0542 < 0.074);
  assert.ok(CARTRIDGE_POSES.partial[1]+0.054 > 0.074);
}

test('Cartridge: Betrachtung lässt sich jederzeit verlassen',leaveInspection);
test('Cartridge: eingerastetes Modul ragt nicht oben heraus',flushInsertion);
