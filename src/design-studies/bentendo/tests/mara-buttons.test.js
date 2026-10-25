import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame,useObject,dismiss,push } from './helpers.js';
import { createVillage,createGuildEntrance } from '../scripts/game/data/village.js';
import { createVillageInteriors } from '../scripts/game/data/house-rooms.js';
import { createMaraArchive,createSourceCave } from '../scripts/game/data/mara-rooms.js';
import { captureGame,restoreGame } from '../scripts/game/systems/save-state.js';
import { ButtonMotion,buttonAction } from '../scripts/device/button-motion.js';

/** Lädt die neuen Kapitelräume gemeinsam mit dem unveränderten alten Rätsel. */
function maraGame() {
  const game=createGame();
  for (const room of [createVillage(),createGuildEntrance(),...createVillageInteriors(),createMaraArchive(game.rooms.get('archive')),createSourceCave()]) game.rooms.set(room.id,room);
  game.reset(); game.mode='world'; game.flags.guildOpen=true; game.flags.waterFlowing=true; return game;
}

/** Verknüpft beide bereits vorhandenen Hinweise durch echte Suche und Maras Gespräch. @param {object} game Spiel. */
function unlockArchive(game) {
  game.travel('village-guild-upper'); useObject(game,'mara'); dismiss(game);
  game.travel('village'); useObject(game,'cartographer'); dismiss(game);
  game.travel('village-guild-upper'); useObject(game,'vase-2'); dismiss(game); useObject(game,'mara'); dismiss(game);
  assert.equal(game.flags.maraArchiveOpen,true);
  game.travel('village-guild'); useObject(game,'archive-door'); assert.equal(game.room.id,'mara-archive');
}

/** Löst das tatsächliche Regalrätsel, statt die Plannotiz direkt in das Inventar zu setzen. @param {object} game Spiel. */
function findPlan(game) {
  push(game,5,10,'right',2); push(game,9,9,'up',2); push(game,11,5,'right',2); push(game,15,4,'up',2);
  useObject(game,'note'); dismiss(game); assert.ok(game.notes.some(planNote));
}

/** Erkennt das geborgene Dokument. @param {object} note Notiz. */
function planNote(note) { return note.id==='mara-old-plan'; }

/** Spielt Maras erste Geschichte über Fund, Aufträge, Freigabe und Höhlenbericht vollständig durch. */
function completeMaraChapter() {
  const game=maraGame(); unlockArchive(game); findPlan(game);
  game.travel('village-guild-upper'); useObject(game,'mara'); dismiss(game); assert.equal(game.coins,6); assert.equal(game.flags.northOpen,undefined);
  useObject(game,'mara'); dismiss(game); assert.equal(game.coins,6);
  game.travel('village-market'); useObject(game,'storekeeper');
  for (const id of ['barrel-e','barrel-f','shelf-b']) useObject(game,id);
  useObject(game,'storekeeper'); dismiss(game);
  game.travel('village-workshop'); useObject(game,'cabinet-a'); dismiss(game);
  game.travel('village-weaver'); useObject(game,'weaver-helper'); dismiss(game);
  game.travel('village-guild-upper'); useObject(game,'mara'); dismiss(game); assert.equal(game.flags.northOpen,true);
  game.travel('village'); assert.equal(game.objectAt(15,1).kind,'cave-entry'); useObject(game,'north-gate'); assert.equal(game.room.id,'mara-cave');
  assert.equal(game.occupied(10,6),true); useObject(game,'source-gate'); dismiss(game); assert.equal(game.flags.maraSpringSurveyed,true);
  useObject(game,'return'); assert.equal(game.room.id,'village');
  game.travel('village-guild-upper'); useObject(game,'mara'); dismiss(game); assert.equal(game.flags.maraSpringReported,true); assert.equal(game.coins,19);
  useObject(game,'mara'); dismiss(game); assert.equal(game.coins,19); assert.equal(game.flags.eastOpen,undefined);
}

/** Prüft verschlossene Zugänge, frühe Hinweise, volles Gepäck und ein Speichern mitten im Archivrätsel. */
function maraOrderAndSave() {
  const game=maraGame(); game.travel('village-guild'); useObject(game,'archive-door'); assert.equal(game.room.id,'village-guild'); dismiss(game);
  game.travel('village'); useObject(game,'north-gate'); assert.equal(game.room.id,'village'); dismiss(game);
  game.inventory=Array(6).fill('Ast'); useObject(game,'cartographer'); dismiss(game);
  game.travel('village-guild-upper'); useObject(game,'vase-2'); dismiss(game);
  assert.equal(game.flags.maraStarted,undefined); useObject(game,'mara'); dismiss(game); assert.equal(game.flags.maraArchiveOpen,true);
  game.travel('village-guild'); useObject(game,'archive-door'); findPlan(game); assert.equal(game.inventory.length,6);
  useObject(game,'exit'); assert.equal(game.room.id,'mara-archive'); dismiss(game);
  const fresh=maraGame(); assert.equal(restoreGame(fresh,captureGame(game)),true); assert.ok(fresh.notes.some(planNote));
  assert.deepEqual(fresh.roomState.blocks,game.roomState.blocks); useObject(fresh,'return'); assert.equal(fresh.room.id,'village-guild');
  fresh.travel('village-guild-upper'); useObject(fresh,'mara'); dismiss(fresh); assert.equal(fresh.coins,6);
  assert.equal(fresh.flags.northOpen,undefined); useObject(fresh,'mara'); dismiss(fresh); assert.equal(fresh.coins,6);
}

/** Bildet nur die vom Modell tatsächlich animierten Positionen und Drehungen ab. */
function buttonRoot() {
  const nodes=new Map();
  for (const name of ['BUTTON_A','BUTTON_B','BUTTON_START','BUTTON_SELECT','DPAD']) nodes.set(name,{name,position:{z:0.016},rotation:{x:0.1,y:-0.1}});
  return {nodes,getObjectByName:findButton.bind(nodes)};
}

/** Liest einen Modellknoten aus der Testkarte. @param {string} name Name. */
function findButton(name) { return this.get(name); }

/** Prüft gehaltene Knöpfe, federnde Rückkehr, Richtungsneigung und driftfreie Ausgangswerte. */
function buttonFeedback() {
  const root=buttonRoot(),motion=new ButtonMotion(root),a=root.nodes.get('BUTTON_A'),dpad=root.nodes.get('DPAD');
  motion.hold('interact'); motion.update(0.1,false); assert.ok(a.position.z<0.016); assert.ok(a.position.z>=0.0148);
  motion.release(); for (let i=0;i<30;i++) motion.update(0.05,false); assert.equal(a.position.z,0.016);
  motion.direction('up',true); motion.update(0.1,true); assert.ok(dpad.rotation.x<0.1); assert.equal(dpad.rotation.y,-0.1);
  motion.direction('right',true); motion.update(0.1,true); assert.equal(dpad.rotation.x,0.1); assert.ok(dpad.rotation.y>-0.1);
  motion.release(); motion.update(0.1,true); assert.deepEqual(dpad.rotation,{x:0.1,y:-0.1}); assert.equal(dpad.position.z,0.016);
  for (let i=0;i<30;i++) { motion.pulse('select'); motion.update(0.05,false); motion.update(0.5,false); }
  for (let i=0;i<20;i++) motion.update(0.05,false);
  assert.equal(root.nodes.get('BUTTON_SELECT').position.z,0.016);
  assert.equal(buttonAction({name:'Face',parent:root.nodes.get('BUTTON_START')}),'start');
}

test('Mara: vollständiger Archivauftrag, Dorfvoraussetzungen, Quellstollen und einmalige Berichte',completeMaraChapter);
test('Mara: Sperren, volles Gepäck und persistenter Quellplan ohne Verbrauch eines Inventarplatzes',maraOrderAndSave);
test('Gerät: Knöpfe und Steuerkreuz drücken ein, neigen passend und kehren ohne Drift zurück',buttonFeedback);
