import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Game } from '../scripts/game/game.js';
import { createVillage } from '../scripts/game/data/village.js';
import { createQuellDungeon,enemy } from '../scripts/game/data/quell-dungeon.js';
import { WEAPON_TIMING } from '../scripts/game/systems/weapon-timing.js';
import { weaponPose } from '../scripts/game/render/weapon-swing.js';
import { heroOccupies,enemyAt,attack,updateCombat } from '../scripts/game/systems/dungeon-combat.js';
import { captureGame,restoreGame } from '../scripts/game/systems/save-state.js';
import { startNest } from '../scripts/game/systems/dungeon.js';

/** Erstellt die Produktionsräume mit einem ausgerüsteten Ast und ruhenden Eingangsdialogen. */
function setup() {
  const rooms=[createVillage(),...createQuellDungeon()],pairs=[];
  for (const room of rooms) pairs.push([room.id,room]);
  const game=new Game(new Map(pairs)); game.mode='world'; game.inventory=['Ast']; game.travel('quell-gallery'); return game;
}

/** Verhindert den direkten Schritt in einen Gegner und begrenzt Kontaktschaden durch die Trefferpause. */
function contactDamage() {
  const game=setup(); game.player={x:4,y:6,facing:'right'}; game.enemies=[enemy('beetle-a','beetle',5,6)];
  assert.equal(game.step('right'),false); assert.equal(game.health.hp,5); assert.deepEqual([game.player.x,game.player.y],[4,6]);
  assert.equal(game.move,null); assert.equal(game.step('right'),false); assert.equal(game.health.hp,5);
  game.hurtTime=0; game.bagOpen=true; assert.equal(game.step('right'),false); assert.equal(game.health.hp,5);
}

/** Reserviert das Spielerziel gegen einen kreuzenden Gegner über den gesamten interpolierten Schritt. */
function crossingReservation() {
  const game=setup(); game.player={x:4,y:6,facing:'right'}; game.enemies=[enemy('beetle-a','beetle',5,5)]; game.enemies[0].wait=0;
  assert.equal(game.step('right'),true); assert.equal(heroOccupies(game,5,6),true); assert.equal(heroOccupies(game,4,6),true);
  game.update(0.05,false); assert.equal(enemyAt(game,5,6),null); assert.ok(game.move);
  game.update(0.14,false); assert.equal(game.move,null); assert.deepEqual([game.player.x,game.player.y],[5,6]);
  assert.equal(enemyAt(game,5,6),null); assert.equal(game.health.hp,6);
}

/** Prüft Ausholen, Viertelkreis, horizontale Endpose und gespiegelten Linksschwung. */
function diagonalSwing() {
  const game=setup(); game.player.facing='right'; game.attackFacing='right'; game.attackTime=WEAPON_TIMING.duration;
  assert.equal(weaponPose(game).angle,-Math.PI/2); assert.equal(weaponPose(game).length,14);
  game.attackTime=WEAPON_TIMING.duration-WEAPON_TIMING.windup*.7; assert.equal(weaponPose(game).angle,-Math.PI/2);
  game.attackTime=WEAPON_TIMING.duration-(WEAPON_TIMING.windup+WEAPON_TIMING.impact)/2; assert.ok(Math.abs(weaponPose(game).angle+Math.PI/4)<1e-10);
  game.attackTime=WEAPON_TIMING.duration-WEAPON_TIMING.impact-.005; const last=weaponPose(game); assert.equal(last.angle,0);
  game.player.facing='left'; assert.deepEqual(weaponPose(game),last);
  game.attackFacing='left'; assert.equal(weaponPose(game).angle,Math.PI);
  game.attackTime=WEAPON_TIMING.duration; assert.equal(weaponPose(game).angle,3*Math.PI/2);
  game.inventory.push('Rostiges Schwert'); assert.equal(weaponPose(game).length,17);
  game.reduced=true; game.attackTime=0.15; const reduced=weaponPose(game); game.attackTime=0.01; assert.deepEqual(weaponPose(game),reduced);
}

/** Alle Räume besitzen Gegner und ein eigenes Thema; Treppen sind von horizontalen Gängen unterscheidbar. */
function themesAndStairs() {
  const rooms=createQuellDungeon(),themes=new Set();
  for (const room of rooms) { assert.ok(room.enemies.length>0,room.id); themes.add(room.style); assert.equal(room.music,'quellgewoelbe'); }
  assert.equal(themes.size,5); assert.ok(fs.existsSync(new URL('../assets/sounds/quellgewoelbe.mp3',import.meta.url)));
  const entry=rooms[0]; assert.equal(entry.objects[0].kind,'dungeon-stairs-up'); assert.equal(entry.objects[1].kind,'dungeon-passage');
}

/** Nestwachen verhindern den sofortigen Wellenstart und bleiben vor Beginn korrekt speicherbar. */
function nestScouts() {
  const game=setup(); game.travel('quell-nest'); assert.equal(game.enemies.length,2); startNest(game); assert.equal(game.nestWave,0);
  assert.match(game.message.lines.join(' '),/Nestwachen/u); const fresh=setup(); assert.equal(restoreGame(fresh,captureGame(game)),true); assert.equal(fresh.enemies.length,2);
  game.flags.quellNestCleared=true; game.travel('quell-nest'); assert.equal(game.enemies.length,0);
}

/** Fügt neue Wachen beim Laden alter friedlicher Raumstände hinzu, ohne Leben oder Inventar zu verlieren. */
function upgradeOldDungeon() {
  const game=setup(); game.travel('quell-entry'); game.health.hp=4.5;
  const data=captureGame(game); data.roomRevision=1; data.combat.enemies=[];
  const fresh=setup(); assert.equal(restoreGame(fresh,data),true); assert.equal(fresh.health.hp,4.5); assert.equal(fresh.enemies.length,1);
  assert.deepEqual(fresh.inventory,['Ast']);
}

/** Erhält alte Beute und Gegnerleben, wenn neue Möbel ihre bisherigen Standorte belegen. */
function furnitureMigration() {
  const game=setup(),data=captureGame(game); data.roomRevision=1;
  data.health.lost={dungeon:game.room.dungeon,room:game.room.id,x:3,y:2,items:['Feldverband'],coins:1};
  data.combat.enemies[0].x=4; data.combat.enemies[0].y=2; data.combat.enemies[0].hp=1;
  const fresh=setup(); assert.equal(restoreGame(fresh,data),true);
  assert.notDeepEqual([fresh.health.lost.x,fresh.health.lost.y],[3,2]); assert.deepEqual(fresh.health.lost.items,['Feldverband']);
  assert.notDeepEqual([fresh.enemies[0].x,fresh.enemies[0].y],[4,2]); assert.equal(fresh.enemies[0].hp,1);
  assert.equal(fresh.objectAt(fresh.enemies[0].x,fresh.enemies[0].y),null);
}

test('Kontakt: Gegner blockieren Schritte und verursachen sofort Schaden mit Trefferpause',contactDamage);
test('Kollision: Gegner betreten weder Spielerquelle noch reserviertes Schrittziel',crossingReservation);
test('Waffenschwung: angehobene Klinge vor 90-Grad-Hackschwung und Reduced Motion',diagonalSwing);
test('Dungeon: fünf Themen, Gegner in jedem Raum und erkennbare Treppen',themesAndStairs);
test('Spinnenbrut: Nestwachen, Speicherstand und abgeschlossener Wellenraum',nestScouts);
test('Migration: neue Raumwachen erhalten alte Lebens- und Inventarwerte',upgradeOldDungeon);
test('Einrichtungsmigration: Beutel und verletzte Gegner bleiben außerhalb neuer Möbel erreichbar',furnitureMigration);

/** Verhindert vorzeitige und doppelte Treffer und hält Richtung sowie Klang am Schwung fest. */
function timedChop() {
  const game=setup(); game.player={x:4,y:6,facing:'right'}; game.enemies=[enemy('target','spider',5,6)]; game.enemies[0].wait=99; game.sounds=[];
  attack(game); game.player.facing='left'; updateCombat(game,WEAPON_TIMING.windup-.001); assert.equal(game.enemies[0].hp,2); assert.deepEqual(game.sounds,[]);
  updateCombat(game,0.002); assert.deepEqual(game.sounds,['combat-swing-stick']);
  updateCombat(game,WEAPON_TIMING.impact-WEAPON_TIMING.windup-.002); assert.equal(game.enemies[0].hp,2);
  updateCombat(game,0.002); assert.equal(game.enemies[0].hp,1); assert.ok(game.sounds.includes('combat-hit-spider'));
  updateCombat(game,0.1); assert.equal(game.enemies[0].hp,1);
  const slow=setup(); slow.player={x:4,y:6,facing:'right'}; slow.enemies=[enemy('target','spider',5,6)];
  attack(slow); updateCombat(slow,1); assert.equal(slow.enemies[0].hp,1);
  updateCombat(slow,1); assert.equal(slow.enemies[0].hp,1);
}

test('Hackschwung: Treffer und Klang folgen der Ausholphase, Richtung bleibt fest, kein Doppeltreffer',timedChop);
