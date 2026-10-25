import test from 'node:test';
import assert from 'node:assert/strict';
import { createVillage } from '../scripts/game/data/village.js';
import { Game } from '../scripts/game/game.js';
import { createQuellDungeon,enemy } from '../scripts/game/data/quell-dungeon.js';
import { combinedDirection,stepDuration,movementPosition } from '../scripts/game/systems/player-movement.js';
import { heroOccupies } from '../scripts/game/systems/dungeon-combat.js';
import { GameInput } from '../scripts/device/input/game-input.js';
import { ModelButtons } from '../scripts/device/input/model-buttons.js';

/** Erstellt eine ruhige echte Dungeonzone zum Prüfen von Schritten und Angriffen. */
function setup() {
  const village=createVillage(),rooms=new Map([[village.id,village]]);
  for (const room of createQuellDungeon()) rooms.set(room.id,room);
  const game=new Game(rooms); game.mode='world'; game.travel('quell-gallery'); game.locationNotice=null;
  game.player={x:4,y:6,facing:'right'}; game.enemies=[]; game.inventory=['Ast']; return game;
}

/** Prüft alle vier Diagonalen, gegensätzliche Tasten und die gleiche Strecke je Sekunde. */
function normalizedDiagonals() {
  const game=setup();
  for (const [direction,x,y] of [['up-right',9,5],['up-left',7,5],['down-right',9,7],['down-left',7,7]]) {
    game.player={x:8,y:6,facing:'up'}; game.move=null; assert.equal(game.step(direction),true);
    assert.deepEqual([game.move.x,game.move.y],[x,y]); assert.ok(Math.abs(stepDuration(game.move)-0.18*Math.SQRT2)<1e-10);
    game.move.time=stepDuration(game.move)/2; assert.deepEqual(movementPosition(game),{x:(8+x)/2,y:(6+y)/2});
    game.updateMove(0,false); assert.ok(game.move); game.updateMove(0.13,false); assert.equal(game.move,null);
  }
  assert.equal(combinedDirection(['up','right']),'up-right'); assert.equal(combinedDirection(['up','down','right']),'right');
  assert.equal(combinedDirection(['left','right']),null);
}

/** Blockiert diagonales Schneiden von Mauern, Möbeln und besetzten Nachbarfeldern. */
function corners() {
  const game=setup(); game.player={x:5,y:5,facing:'right'};
  const rows=[...game.room.layout]; rows[5]=rows[5].slice(0,6)+'#'+rows[5].slice(7); game.room.layout=rows;
  assert.equal(game.step('down-right'),false); assert.equal(game.move,null);
  rows[5]=rows[5].slice(0,6)+'.'+rows[5].slice(7); game.enemies=[enemy('corner','beetle',6,5)];
  assert.equal(game.step('down-right'),false); game.enemies=[]; assert.equal(game.step('down-right'),true);
  for (const [x,y] of [[5,5],[6,5],[5,6],[6,6]]) assert.equal(heroOccupies(game,x,y),true);
  assert.equal(heroOccupies(game,7,6),false);
}

/** Trifft beim Laufen von der sichtbaren Position aus und erhält Schritt sowie gehaltene Richtung. */
function runningAttack() {
  const game=setup(); game.player={x:3,y:6,facing:'right'}; game.enemies=[enemy('ahead','spider',5,6)]; game.enemies[0].wait=99;
  assert.equal(game.step('right'),true); game.held='right'; game.interact();
  assert.equal(game.attackTime,0.17); assert.equal(game.held,'right'); assert.ok(game.move);
  game.update(0.136,false); assert.equal(game.enemies[0].hp,1); assert.equal(game.held,'right'); assert.ok(game.move);
  game.update(0.05,false); assert.equal(game.player.x,4); assert.equal(game.move,null);
  assert.equal(game.step('right'),false);
}

/** Stellt eine eingabeneutrale Anwendung mit echten Spielaktionen bereit. @param {object} game Spiel. */
function inputFor(game) {
  const noop=Function.prototype,input=Object.create(GameInput.prototype); input.keys=new Set();
  input.app={game,phase:'on',helpOpen:false,cartridge:{open:false},request:noop,audio:{unlock:noop},device:{buttons:{direction:noop,release:noop,pulse:noop}}};
  return input;
}

/** Erhält die zweite Pfeiltaste und unterbricht beim Loslassen von A keine Bewegung. */
function keyboardChord() {
  const game=setup(),input=inputFor(game); input.pressKey('right'); input.pressKey('up');
  assert.equal(game.held,'up-right'); game.update(0.18,false); assert.deepEqual([game.move.x,game.move.y],[6,5]);
  input.release({type:'keyup',key:'a'}); assert.equal(game.held,'up-right');
  input.release({type:'keyup',key:'ArrowUp'}); assert.equal(game.held,'right');
  input.pressKey('left'); assert.equal(game.held,null); input.release({type:'keyup',key:'ArrowLeft'}); assert.equal(game.held,'right');
  input.release({type:'blur'}); assert.equal(game.held,null); assert.equal(input.keys.size,0);
}

/** Kombiniert mehrere Touchrichtungen und hält den Lauf bei gleichzeitigem Aktionsfinger. */
function touchChord() {
  const game=setup(),input=inputFor(game),buttons=new ModelButtons(input.app); let visual;
  input.app.device.buttons.hold=hold;
  /** Erfasst die Richtung des echten Steuerkreuzes. @param {string} action Taste. @param {string} direction Richtung. */
  function hold(action,direction) { visual=direction; }
  buttons.pointers.set(1,{action:'dpad',direction:'right'}); buttons.pointers.set(2,{action:'dpad',direction:'up'});
  buttons.pointers.set(3,{action:'interact',direction:null}); buttons.restoreWalk();
  assert.equal(game.held,'up-right'); assert.equal(visual,'up-right');
  buttons.pointers.delete(3); buttons.restoreWalk(); assert.equal(game.held,'up-right');
  game.bagOpen=true; game.held=null; buttons.restoreWalk(); assert.equal(game.held,null);
}

test('Diagonal: vier Richtungen und normierte Geschwindigkeit',normalizedDiagonals);
test('Diagonal: Mauerecken und reservierte Bewegungsfläche',corners);
test('Angriff: während des Laufens treffen und weiterlaufen',runningAttack);
test('Tastatur: diagonale Akkorde und unabhängiges Loslassen',keyboardChord);
test('Touch: Richtungen kombinieren und zugleich A halten',touchChord);
