import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const threeUrl=new URL('../vendor/three/three.module.js',import.meta.url).href;
const configUrl=new URL('../scripts/core/config.js',import.meta.url).href;
const source=(await fs.readFile(new URL('../scripts/device/cartridge/cover.js',import.meta.url),'utf8')).replace("'three'",JSON.stringify(threeUrl)).replace("'../../core/config.js'",JSON.stringify(configUrl));
const {selectCartridgeCover}=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

/** Liefert ein älteres Modul ohne cover-Eigenschaft, aber mit vollständig geladenem Etikett. */
function legacyCartridge() { return {model:{getObjectByName:findLabel},label:{material:{map:{name:'Original'}}}}; }
/** Liefert das Testetikett aus der gebundenen Modellwurzel. @param {string} name Modellname. */
function findLabel(name) { return this.label; }
/** Bildet das echte Initialisieren nach dem Laden eines älteren Controllers nach. */
async function oldControllerStartup() {
  const cartridge=legacyCartridge(); cartridge.model.label=cartridge.label;
  assert.equal(cartridge.cover,undefined); assert.equal(await selectCartridgeCover(cartridge),true);
  assert.equal(cartridge.cover.label,cartridge.label); assert.equal(cartridge.label.material.map.name,'Original');
  const cover=cartridge.cover; assert.equal(await selectCartridgeCover(cartridge,'male'),true); assert.equal(cartridge.cover,cover);
}
/** Erhält Bedienbarkeit auch bei einem alternativen Modell ohne Etikett. */
async function unlabeledModel() {
  const cartridge={model:{getObjectByName:noLabel}};
  assert.equal(await selectCartridgeCover(cartridge,'female'),false);
}
/** Simuliert ein Modell ohne Etikettfläche. @param {string} name Modellname. */
function noLabel(name) { return null; }

test('Startregression: altes Modul ohne Covercontroller initialisiert sicher',oldControllerStartup);
test('Modulcover: alternative Modelle ohne Etikett brechen den Start nicht ab',unlabeledModel);
