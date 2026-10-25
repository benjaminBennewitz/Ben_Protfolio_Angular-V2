import { activateSystemMenu } from '../scripts/game/systems/system-menu.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, use, useObject, dismiss, go } from './helpers.js';
import { createVillage, createGuildEntrance } from '../scripts/game/data/village.js';
import { createVillageInteriors, HOUSE_INFO } from '../scripts/game/data/house-rooms.js';
import { contains, wall } from '../scripts/game/systems/collision.js';
import { npcIdle } from '../scripts/game/render/village-life.js';

/** Erstellt die vollständige Stadt einschließlich ihrer eingerichteten Häuser. */
function villageGame() {
  const game=createGame();
  for (const room of [createVillage(),createGuildEntrance(),...createVillageInteriors()]) game.rooms.set(room.id,room);
  game.reset(); game.mode='world'; game.flags.guildOpen=true;
  return game;
}

/** Prüft jedes Möbelstück und jeden Bewohner auf erreichbare Interaktion ohne Überlappung. */
function furnishedRooms() {
  const game=villageGame();
  for (const id of Object.keys(HOUSE_INFO)) {
    game.travel(`village-${id}`); assert.equal(game.occupied(game.player.x,game.player.y),false);
    const objects=game.room.objects;
    for (const object of objects) {
      for (const other of objects) if (object!==other) assert.equal(overlaps(object,other),false,`${id}: ${object.id}/${other.id}`);
      if (object.action==='travel') continue;
      game.worldMinutes=540; useObject(game,object.id); if (game.systemMenu?.kind==='rest') activateSystemMenu(game); if (game.resting) game.update(1.3,true); assert.ok(game.message || game.seat,`${id}: ${object.id}`); dismiss(game);
      if (game.seat) game.back();
    }
    assert.equal(wall(game,0,5),true);
  }
}

/** Prüft überlappende rechteckige Kollisionsflächen. @param {object} first Erstes Objekt. @param {object} second Zweites Objekt. */
function overlaps(first,second) {
  for (let y=first.y;y<first.y+(first.h || 1);y++) for (let x=first.x;x<first.x+(first.w || 1);x++) if (contains(second,x,y)) return true;
  return false;
}

/** Prüft Raumkonturen und vollständige Möbelgrundflächen gegen das reale Kollisionsraster. */
function roomShapes() {
  const game=villageGame(),sizes=new Set();
  for (const id of Object.keys(HOUSE_INFO)) {
    game.travel(`village-${id}`); const room=game.room; sizes.add(`${room.width}x${room.height}`);
    assert.ok(room.layout.some(hasVoid),`${id}: keine ausgesparte Außenfläche`);
    for (let y=0;y<room.height;y++) for (let x=0;x<room.width;x++) assert.equal(wall(game,x,y),room.layout[y][x]!=='.');
    for (const object of room.objects) {
      if (object.kind==='door' || object.kind==='stairs') continue;
      for (let y=object.y;y<object.y+(object.h || 1);y++) for (let x=object.x;x<object.x+(object.w || 1);x++) assert.equal(room.layout[y]?.[x],'.',`${id}: ${object.id} steht außerhalb des Bodens`);
    }
    assertClosedCorners(room);
    const reachable=reachableCells(game);
    for (let y=0;y<room.height;y++) for (let x=0;x<room.width;x++) if (!game.occupied(x,y)) assert.ok(reachable.has(`${x},${y}`),`${id}: isoliertes Feld ${x},${y}`);
  }
  assert.ok(sizes.size>=4);
}

/** Prüft auch diagonale Wandanschlüsse an Außenecken und einspringenden Raumkanten. @param {object} room Hausgrundriss. */
function assertClosedCorners(room) {
  for (let y=1;y<room.height-1;y++) for (let x=1;x<room.width-1;x++) {
    if (room.layout[y][x]!=='.') continue;
    for (const [dx,dy] of [[-1,-1],[1,-1],[-1,1],[1,1]]) {
      assert.notEqual(room.layout[y+dy][x+dx],' ',`${room.id}: offener Wandanschluss bei ${x+dx},${y+dy}`);
    }
  }
}

/** Erkennt den dunklen Außenraum neben nicht rechteckigen Grundrissen. @param {string} row Grundrisszeile. */
function hasVoid(row) {
  return row.includes(' ');
}

/** Prüft sämtliche Haustüren und den Rückweg über echte Eingaben. */
function houseDoors() {
  const game=villageGame();
  for (const [id,info] of Object.entries(HOUSE_INFO)) {
    if (id.endsWith('-upper')) continue;
    use(game,info.entrance[0],info.entrance[1]); assert.equal(game.room.id,`village-${id}`);
    assert.deepEqual(game.room.villageEntrance,info.entrance);
    useObject(game,'exit'); assert.equal(game.room.id,'village'); assert.equal(game.occupied(game.player.x,game.player.y),false);
  }
  use(game,4,12); useObject(game,'stairs'); assert.equal(game.room.id,'village-inn-upper');
  useObject(game,'exit'); assert.equal(game.room.id,'village-inn'); assert.equal(game.occupied(game.player.x,game.player.y),false);
  useObject(game,'exit'); assert.equal(game.room.id,'village');
  use(game,12,6); useObject(game,'stairs'); assert.equal(game.room.id,'village-guild-upper');
  useObject(game,'exit'); assert.equal(game.room.id,'village-guild'); assert.equal(game.occupied(game.player.x,game.player.y),false);
  useObject(game,'exit'); assert.equal(game.room.id,'village');
}

/** Prüft beide Wegsperren einschließlich ihrer Umgehbarkeit von den Seiten. */
function blockedExits() {
  const game=villageGame();
  go(game,15,2); assert.equal(game.step('up'),false); use(game,15,1); assert.match(game.message.lines.join(' '),/GEFAHR/u); dismiss(game);
  go(game,31,12); assert.equal(game.step('right'),false); use(game,32,12); assert.match(game.message.lines.join(' '),/GEFAHR/u); dismiss(game);
  const visited=reachableCells(game);
  for (const point of ['15,0','16,0','33,12','33,13']) assert.equal(visited.has(point),false,point);
  assert.equal(game.room.ground[0][15],'r'); assert.equal(game.room.ground[1][15],'c'); assert.equal(game.room.ground[12][33],'.');
}

/** Sammelt die tatsächlich erreichbaren Kartenfelder ohne Dialog- oder Darstellungseffekte. @param {object} game Spiel. */
function reachableCells(game) {
  const queue=[[game.player.x,game.player.y]],visited=new Set();
  while (queue.length) {
    const [x,y]=queue.shift(),key=`${x},${y}`;
    if (visited.has(key)) continue;
    visited.add(key);
    for (const [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]]) if (!game.occupied(x+dx,y+dy)) queue.push([x+dx,y+dy]);
  }
  return visited;
}

/** Prüft Idle-Variation, feste Kollisionsposition und die statische Alternative. */
function residentIdle() {
  const game=villageGame(),object=game.objectAt(5,14),poses=new Set();
  for (let i=0;i<40;i++) { game.time=i*0.5; poses.add(JSON.stringify(npcIdle(game,object))); }
  assert.ok(poses.size>2); assert.equal(game.objectAt(5,14).id,'host');
  game.reduced=true;
  for (let i=0;i<20;i++) { game.time=i; assert.deepEqual(npcIdle(game,object),{offsetX:0,lift:0}); }
}

test('Dorfhäuser: Möbel und Personen erreichbar, keine Überlappungen',furnishedRooms);
test('Dorfhäuser: echte Raumformen, passende Möbelgrundflächen und zusammenhängende Laufwege',roomShapes);
test('Dorfhäuser: sieben Eingänge, Gästezimmer und sichere Rückwege',houseDoors);
test('Dorfausgänge: Warnsperren lassen sich nicht umgehen',blockedExits);
test('Bewohner: Idle variiert ohne Positionswechsel, reduzierte Bewegung bleibt statisch',residentIdle);
