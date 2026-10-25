import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../scripts/game/game.js';
import { createVillage } from '../scripts/game/data/village.js';
import { createVillageInteriors } from '../scripts/game/data/house-rooms.js';
import { createQuellDungeon } from '../scripts/game/data/quell-dungeon.js';
import { updateCombat } from '../scripts/game/systems/dungeon-combat.js';
import { dropHeart } from '../scripts/game/systems/heart-drops.js';
import { damageHero,refillHero } from '../scripts/game/systems/health.js';
import { captureGame,restoreGame } from '../scripts/game/systems/save-state.js';
import { validSave } from '../scripts/game/systems/save-validation.js';
import { drawHeartIcon } from '../scripts/game/render/health.js';

/** Lädt echte Räume ohne Browser und beginnt mit dem Ast in der Galerie. */
function setup() {
  const rooms=[createVillage(),...createVillageInteriors(),...createQuellDungeon()];
  const game=new Game(new Map(rooms.map(roomPair))); game.mode='world'; game.inventory=['Ast']; game.travel('quell-gallery');
  return game;
}
/** Bildet den echten Raumindex ab. @param {object} room Raum. */
function roomPair(room) { return [room.id,room]; }

/** Prüft die drei Größen und verhindert doppelte sowie garantierte Zufallsdrops. */
function sizesAndChance() {
  const game=setup();
  for (const [species,amount] of [['spider',0.5],['beetle',1],['snake',2]]) {
    const actor={id:species,species,x:3,y:6};
    dropHeart(game,actor,0.99); assert.equal(game.heartDrops.length,0);
    dropHeart(game,actor,0); dropHeart(game,actor,0); assert.equal(game.heartDrops.length,1); assert.equal(game.heartDrops[0].amount,amount);
    game.heartDrops=[];
  }
}

/** Heilt durch einen realen Schritt, pausiert im Menü und erhält den Viertelwert nach Neuladen. */
function pickupAndSave() {
  const game=setup(); game.health.hp=3; game.heartDrops=[{id:'beetle-a',x:3,y:6,amount:0.5}]; game.bagOpen=true;
  game.update(1,true); assert.equal(game.health.hp,3); game.bagOpen=false;
  game.step('right'); game.update(0.2,true); assert.equal(game.health.hp,3.5); assert.equal(game.heartDrops.length,0);
  assert.ok(game.sounds.includes('combat-refill')); const data=captureGame(game),fresh=setup();
  assert.equal(validSave(game,data),true); assert.equal(restoreGame(fresh,data),true); assert.equal(fresh.health.hp,3.5);
  data.health.hp=3.25; assert.equal(validSave(game,data),false);
}

/** Lässt volle Herzen liegen und verwirft sie erst bei tatsächlicher, begrenzter Heilung. */
function fullAndLimited() {
  const game=setup(); game.enemies=[]; game.heartDrops=[{id:'beetle-a',x:2,y:6,amount:2}]; game.sounds=[];
  game.update(0.1,true); assert.equal(game.heartDrops.length,1); assert.equal(game.sounds.includes('combat-refill'),false);
  game.health.hp=5.5; game.update(0.1,true); assert.equal(game.health.hp,6); assert.equal(game.heartDrops.length,0);
  assert.equal(refillHero(game,2),false); assert.equal(refillHero(game,NaN),false);
}

/** Speichert ungesammelte Drops und akzeptiert weder fremde Heilwerte noch Positionen in Wänden. */
function savedDrops() {
  const game=setup(); game.heartDrops=[{id:'beetle-a',x:3,y:6,amount:1}];
  const data=captureGame(game),fresh=setup(); assert.equal(restoreGame(fresh,data),true); assert.deepEqual(fresh.heartDrops,game.heartDrops);
  data.combat.hearts[0].amount=999; assert.equal(validSave(game,data),false);
  data.combat.hearts[0].amount=1; data.combat.hearts[0].x=0; assert.equal(validSave(game,data),false);
  delete data.combat.hearts; assert.equal(restoreGame(fresh,data),true); assert.deepEqual(fresh.heartDrops,[]);
}

/** Bindet die gewünschten Klänge an wirkliche Schwünge, Treffer, Heilung und Niederlagen. */
function combatEvents() {
  const game=setup(); game.player={x:4,y:6,facing:'right'}; game.enemies=[{...game.enemies[0],x:5,y:6}]; game.sounds=[];
  game.interact(); assert.equal(game.sounds.includes('combat-hit'),false); updateCombat(game,0.24); assert.ok(game.sounds.includes('combat-swing-stick')); assert.ok(game.sounds.includes('combat-hit'));
  game.inventory.push('Rostiges Schwert'); game.attackCooldown=0; game.interact(); updateCombat(game,0.24);
  assert.ok(game.sounds.includes('combat-swing-sword')); assert.ok(game.sounds.includes('combat-death-enemy'));
  game.sounds=[]; game.hurtTime=0; damageHero(game,0.5); assert.ok(game.sounds.includes('combat-hurt')); assert.equal(game.health.hp,5.5);
  game.hurtTime=0; damageHero(game,6); assert.ok(game.sounds.includes('combat-death-hero')); assert.equal(game.sounds.includes('door'),false);
  assert.equal(game.room.id,'village-inn-upper');
}

/** Sammelt die echten Herzpixel, um alle vier Teilfüllungen sichtbar unterscheiden zu können. */
class Pixels {
  /** Initialisiert den Rasterpuffer. */
  constructor() { this.map=new Map(); }
  /** Erfasst den tatsächlichen Zeichenaufruf. @param {number} x X. @param {number} y Y. @param {number} w Breite. @param {number} h Höhe. */
  fillRect(x,y,w,h) { this.map.set(`${x},${y}`,this.fillStyle); }
}
/** Prüft Viertel-, Halb-, Dreiviertel- und Ganzherzen ohne Font- oder Browserattrappe. */
function quarterGraphics() {
  const signatures=new Set();
  for (let quarter=0;quarter<=4;quarter++) {
    const ctx=new Pixels(); drawHeartIcon(ctx,0,0,quarter); signatures.add(JSON.stringify([...ctx.map]));
  }
  assert.equal(signatures.size,5);
}

test('Herzdrops: Viertel, Halb, Ganz, Wahrscheinlichkeit und keine Duplikate',sizesAndChance);
test('Herzdrops: echter Schritt, Menüpause und Viertelherz-Speicherstand',pickupAndSave);
test('Herzdrops: volle Herzen bleiben liegen, Heilung endet am Maximum',fullAndLimited);
test('Herzdrops: liegengebliebene Herzen und alte Kampfstände laden sicher',savedDrops);
test('Kampfklänge: Ast, Schwert, Hit, Hurt, Gegnertod und Heldentod',combatEvents);
test('Herzgrafik: alle Viertelfüllungen sind voneinander unterscheidbar',quarterGraphics);
