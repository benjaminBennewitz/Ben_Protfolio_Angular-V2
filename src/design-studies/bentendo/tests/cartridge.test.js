import test from 'node:test';
import assert from 'node:assert/strict';
import { CartridgeState } from '../scripts/device/cartridge/state.js';

/** Prüft Einrasten und den stets erfolgreichen ersten Start. */
function initialBoot() {
  const state = new CartridgeState();
  assert.equal(state.ready,false);
  assert.equal(state.checkBoot(0),false);
  state.push(); assert.equal(state.checkBoot(0),true);
  assert.equal(state.contactsFault,false);
}

/** Prüft den begrenzten Kontaktfehler und die physische Wiederherstellung. */
function contactRecovery() {
  const state = new CartridgeState(); state.push(); state.successfulBoots = 1;
  assert.equal(state.checkBoot(0),false); assert.equal(state.faultUsed,true);
  assert.equal(state.blow(),false);
  state.remove(); assert.equal(state.push(),false); assert.equal(state.blow(),true);
  state.insert(); state.push(); assert.equal(state.checkBoot(0),true);
  assert.equal(state.ready,true);
}

/** Prüft das vollständige Abschalten optionaler Fehler. */
function disabledGimmicks() {
  const state = new CartridgeState(); state.push(); state.successfulBoots = 4; state.gimmicks = false;
  assert.equal(state.checkBoot(0),true);
}

test('Cartridge: erster gültiger Start gelingt',initialBoot);
test('Cartridge: herausnehmen, pusten und erneut einsetzen',contactRecovery);
test('Cartridge: Kontaktfehler abschaltbar',disabledGimmicks);
