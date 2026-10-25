import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../scripts/game/game.js';
import { createVillage,createGuildEntrance } from '../scripts/game/data/village.js';
import { createVillageInteriors } from '../scripts/game/data/house-rooms.js';
import { villageBranch,villageSluice } from '../scripts/game/systems/village.js';
import { stickBorrowed } from '../scripts/game/systems/dog-fetch.js';
import { wall } from '../scripts/game/systems/collision.js';
import { fetchPath } from '../scripts/game/systems/fetch-path.js';
import { dismiss } from './helpers.js';

/** Erstellt das echte Dorf und einen freien Wurfplatz direkt neben dem Hund. */
function fetchGame() {
  const map=new Map();
  for (const room of [createVillage(),createGuildEntrance(),...createVillageInteriors()]) map.set(room.id,room);
  const game=new Game(map); game.mode='world'; game.locationNotice=null;
  game.inventory=['Ast']; game.player={x:24,y:24,facing:'right'}; return game;
}
/** Erkennt genau den Ast. @param {string} item Gegenstand. */
function isStick(item) { return item==='Ast'; }

/** Simuliert aktive Frames bis zum Ende und prüft jeden Hundeschritt gegen das Kollisionsraster. @param {object} game Spiel. @param {boolean} reduced Reduzierte Bewegung. */
function finishFetch(game,reduced=false) {
  for (let i=0;i<1200 && game.roomState.fetch;i++) {
    dismiss(game); game.update(0.05,reduced);
    const dog=game.roomState.wanderers.dog; assert.equal(wall(game,dog.x,dog.y),false);
    assert.notEqual(`${dog.x},${dog.y}`,`${game.player.x},${game.player.y}`);
  }
  assert.equal(game.roomState.fetch,null);
}

/** Prüft Astmitnahme erst bei freiem Platz und einmalige Wasserrad-Fanfare. */
function questStickAndMilestone() {
  const game=fetchGame(); game.inventory=Array(6).fill('Gepäck'); game.flags.branchSeen=true;
  villageBranch(game); assert.equal(game.flags.branchCleared,undefined);
  game.inventory.pop(); villageBranch(game); assert.equal(game.flags.branchCleared,true); assert.equal(game.inventory.filter(isStick).length,1);
  villageBranch(game); assert.equal(game.inventory.filter(isStick).length,1);
  game.sounds=[]; villageSluice(game); assert.ok(game.sounds.includes('success-waterwheel'));
  game.sounds=[]; villageSluice(game); assert.equal(game.sounds.includes('success-waterwheel'),false);
}

/** Spielt sichtbaren Wurf, Aufnehmen, Rückbringen und Rückkehr auf die normale Route durch. */
function roundTrip() {
  const game=fetchGame(); assert.match(game.hint,/Ast werfen/u); game.interact();
  assert.equal(game.roomState.fetch.phase,'throw'); assert.equal(game.message,null); assert.equal(stickBorrowed(game),true);
  assert.equal(game.consume('Ast'),false); assert.ok(game.sounds.includes('throw'));
  finishFetch(game); assert.equal(game.flags.fetchCount,1); assert.equal(stickBorrowed(game),false);
  assert.equal(game.inventory.filter(isStick).length,1); assert.ok(game.sounds.includes('success-small'));
  assert.deepEqual([game.roomState.wanderers.dog.x,game.roomState.wanderers.dog.y],[25,24]);
  dismiss(game); game.interact(); finishFetch(game); assert.equal(game.flags.fetchCount,2); assert.equal(game.inventory.filter(isStick).length,1);
}

/** Prüft Pausen, vollen Rucksack und verlustfreien Hauswechsel während des Apportierens. */
function pausedAndTravel() {
  const game=fetchGame(); game.inventory.push(...Array(5).fill('Gepäck')); game.interact(); game.update(0.1,false);
  const before=structuredClone(game.roomState.fetch); game.bagOpen=true; game.update(5,false); assert.deepEqual(game.roomState.fetch,before);
  game.bagOpen=false; game.travel('village-inn'); assert.equal(stickBorrowed(game),false);
  assert.equal(game.inventory.length,6); assert.equal(game.inventory.filter(isStick).length,1);
  game.travel('village'); assert.equal(game.roomState.fetch,null); assert.equal(game.flags.fetchCount,undefined);
  assert.deepEqual([game.roomState.wanderers.dog.x,game.roomState.wanderers.dog.y],[25,24]);
}

/** Prüft Neuplanung zum inzwischen weitergelaufenen Spieler und reservierte Startfelder. */
function followPlayer() {
  const game=fetchGame(); game.interact();
  assert.ok(fetchPath(game,{x:25,y:24},[6,15])?.length>16,'Auch ein weitergelaufener Spieler bleibt über die Dorfbrücken erreichbar.');
  for (let i=0;i<200 && game.roomState.fetch.phase!=='return';i++) game.update(0.05,false);
  assert.equal(game.roomState.fetch.phase,'return'); game.player={x:28,y:27,facing:'up'};
  for (let i=0;i<500 && game.roomState.fetch.phase!=='home';i++) {
    game.update(0.05,false); const dog=game.roomState.wanderers.dog;
    if (dog.moving) { assert.equal(game.occupied(dog.fromX,dog.fromY),true); assert.equal(game.occupied(dog.x,dog.y),true); }
  }
  const dog=game.roomState.wanderers.dog;
  assert.equal(game.flags.fetchCount,1); assert.ok(Math.abs(dog.x-game.player.x)+Math.abs(dog.y-game.player.y)<=1);
  finishFetch(game); assert.equal(game.inventory.filter(isStick).length,1);
}

/** Prüft eine freie Alternative für reduzierte Bewegung und normales Ansprechen ohne Ast. */
function reducedAndNoStick() {
  const game=fetchGame(); game.interact(); finishFetch(game,true); assert.equal(game.flags.fetchCount,1);
  const empty=fetchGame(); empty.inventory=[]; empty.sounds=[]; empty.interact();
  assert.equal(empty.roomState.fetch,undefined); assert.ok(empty.message); assert.ok(empty.sounds.includes('animal-dog'));
}

/** Verhindert Würfe durch blockierte Nachbarfelder und lässt den Ast vollständig im Besitz. */
function noThrowSpace() {
  const game=fetchGame();
  for (const [x,y] of [[24,23],[24,25],[23,24],[26,24]]) game.room.ground[y]=game.room.ground[y].slice(0,x)+'r'+game.room.ground[y].slice(x+1);
  game.interact(); assert.equal(game.roomState.fetch,undefined); assert.equal(game.inventory.filter(isStick).length,1);
  assert.match(game.message.lines.join(' '),/wenig Platz/u);
}

test('Ast: bleibt im Rucksack; Wasserrad-Fanfare nur beim ersten Erfolg',questStickAndMilestone);
test('Apportieren: echter Wurf und wiederholbares Zurückbringen ohne doppelte Gegenstände',roundTrip);
test('Apportieren: Menüpause, voller Rucksack und Hauswechsel verlieren keinen Ast',pausedAndTravel);
test('Apportieren: Hund folgt dem Spieler und reserviert seinen vollständigen Schritt',followPlayer);
test('Apportieren: reduzierte Bewegung und normaler Hundedialog ohne Ast',reducedAndNoStick);
test('Apportieren: blockierter Wurfplatz lässt den Ast im Besitz',noThrowSpace);

/** Simuliert genau bis zur Rückgabe und dem Beginn der Begleitung. @param {object} game Spiel. */
function untilFollowing(game) {
  for (let i=0;i<400 && game.roomState.fetch?.phase!=='follow';i++) game.update(0.05,false);
  assert.equal(game.roomState.fetch?.phase,'follow');
}

/** Prüft zeitweilige Begleitung, Pausen und den Ausschluss von Innenräumen. */
function companionDog() {
  const game=fetchGame(); game.interact(); untilFollowing(game);
  assert.equal(stickBorrowed(game),false); assert.ok(game.roomState.fetch.followRemaining>44);
  const remaining=game.roomState.fetch.followRemaining; game.bagOpen=true; game.update(5,false);
  assert.equal(game.roomState.fetch.followRemaining,remaining); game.bagOpen=false;
  game.player={x:28,y:27,facing:'up'};
  for (let i=0;i<150;i++) game.update(0.05,false);
  const dog=game.roomState.wanderers.dog; assert.ok(Math.abs(dog.x-game.player.x)+Math.abs(dog.y-game.player.y)<=2);
  game.travel('village-inn'); assert.equal(game.objects.some(isDog),false); assert.equal(game.states.get('village').fetch.phase,'follow');
  const outsideTime=game.states.get('village').fetch.followRemaining; game.update(5,false);
  assert.equal(game.states.get('village').fetch.followRemaining,outsideTime);
  game.travel('village'); assert.equal(game.roomState.fetch.phase,'follow');
  assert.equal(game.inventory.filter(isStick).length,1);
}
/** Erkennt den Hund. @param {object} object Weltobjekt. */
function isDog(object) { return object.id==='dog'; }

/** Erlaubt erneutes Werfen während der Begleitung und führt nach deren Ablauf nach Hause. */
function replayDuringFollow() {
  const game=fetchGame(); game.interact(); untilFollowing(game);
  assert.match(game.hint,/Ast werfen/u); game.interact(); assert.equal(game.roomState.fetch.phase,'throw');
  untilFollowing(game); assert.equal(game.flags.fetchCount,2);
  game.roomState.fetch.followRemaining=0.1; game.update(0.2,false); finishFetch(game);
  assert.equal(game.roomState.fetch,null); assert.equal(game.inventory.filter(isStick).length,1);
}
test('Hundebegleitung: folgt draußen zeitweise und pausiert im Rucksack',companionDog);
test('Hundebegleitung: erneutes Spielen und Rückkehr nach Ablauf',replayDuringFollow);
