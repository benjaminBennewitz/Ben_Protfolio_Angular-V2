import test from 'node:test';
import assert from 'node:assert/strict';
import { createQuellDungeon } from '../scripts/game/data/quell-dungeon.js';
import { createVillage } from '../scripts/game/data/village.js';
import { createSourceCave } from '../scripts/game/data/mara-rooms.js';
import { Game } from '../scripts/game/game.js';
import { wall,contains } from '../scripts/game/systems/collision.js';
import { captureGame,restoreGame } from '../scripts/game/systems/save-state.js';
import { SaveManager } from '../scripts/game/systems/save-manager.js';
import { migrateSave } from '../scripts/game/systems/save-migrations.js';
import { startNest } from '../scripts/game/systems/dungeon.js';
import { dungeonWallTile } from '../scripts/game/render/dungeon-atlas.js';

/** Erstellt alle produktiven Dungeonräume samt den beiden Rückkehrzielen. */
function setup() {
  const rooms=new Map();
  for (const room of [createVillage(),createSourceCave(),...createQuellDungeon()]) rooms.set(room.id,room);
  const game=new Game(rooms);game.mode='world';game.travel('quell-entry'); return game;
}
/** Erreicht freie Bodenflächen unter den echten Möbelkollisionen. @param {object} game Spiel. @param {number[]} start Startfeld. */
function reachable(game,start) {
  const queue=[start],seen=new Set();
  for (let i=0;i<queue.length;i++) {
    const [x,y]=queue[i],key=`${x},${y}`;
    if (seen.has(key) || game.occupied(x,y)) continue;
    seen.add(key);
    for (const [dx,dy] of [[0,1],[1,0],[-1,0],[0,-1]]) queue.push([x+dx,y+dy]);
  }
  return seen;
}
/** Prüft unterschiedliche Kammerformen, durchgehende Laufwege und erreichbare Interaktionsseiten. */
function connectedRooms() {
  const game=setup();game.flags.quellGateOpen=true;game.flags.quellNestCleared=true;
  for (const room of createQuellDungeon()) {
    game.travel(room.id);game.enemies=[];const seen=reachable(game,room.spawn),widths=new Set();
    for (const row of room.layout) if (row.includes('.')) widths.add(row.split('.').length-1);
    assert.ok(widths.size>=2,room.id); assert.ok(seen.size>20,room.id);
    for (const object of game.objects) {
      let reached=false;
      for (const [dx,dy] of [[0,1],[1,0],[-1,0],[0,-1]]) if (seen.has(`${object.x+dx},${object.y+dy}`)) reached=true;
      assert.ok(reached,`${room.id}: ${object.id} ist erreichbar`);
    }
    for (let y=0;y<room.height;y++) for (let x=0;x<room.width;x++) if (!game.occupied(x,y)) assert.ok(seen.has(`${x},${y}`),`${room.id}: isolierter Boden ${x},${y}`);
  }
}
/** Prüft Möbelgrundflächen, Gegnerstarts und jede Verbindung samt Ankunftsfeld. */
function placements() {
  const game=setup();
  for (const room of createQuellDungeon()) {
    for (const object of [...room.objects,...room.blocks || []]) for (let y=object.y;y<object.y+(object.h||1);y++) for (let x=object.x;x<object.x+(object.w||1);x++) assert.equal(wall({room,flags:{}},x,y),false,`${room.id}: ${object.id}`);
    for (const actor of room.enemies) {
      assert.equal(wall({room,flags:{}},actor.x,actor.y),false);
      for (const object of room.objects) assert.equal(contains(object,actor.x,actor.y),false,actor.id);
    }
    for (const object of room.objects) if (object.to) {
      const target=game.rooms.get(object.to);assert.ok(target);
      assert.equal(wall({room:target,flags:{sourceDrained:true}},...object.spawn),false,`${object.id}: Ankunft`);
    }
  }
}
/** Sichert das Gegengewichtsrätsel gegen einen unerlaubten Weg um die Trennmauer. */
function sealedMechanism() {
  const game=setup();game.travel('quell-sluice');game.enemies=[];
  assert.equal(reachable(game,[2,6]).has('11,6'),false);
  game.flags.quellGateOpen=true;assert.equal(reachable(game,[2,6]).has('11,6'),true);
}
/** Liefert einen alten Spielstand aus inzwischen zugemauerten Randfeldern mit Beute und verletztem Gegner. */
function legacySave() {
  const game=setup();game.travel('quell-gallery');const data=captureGame(game);
  delete data.dungeonRevision;data.roomRevision=2;data.player={x:2,y:3,facing:'down'};
  data.combat.enemies=[{...data.combat.enemies[0],x:2,y:4,fromX:2,fromY:3,walk:.1,hp:1}];
  data.combat.hearts=[{id:'beetle-b',x:2,y:8,amount:1}];
  data.health.lost={dungeon:game.room.dungeon,room:game.room.id,x:2,y:9,items:['Feldverband'],coins:7};
  data.flags.maraLowerMessage=true;data.coins=19;return data;
}
/** Liest den unveränderten alten Stand für die echte Fortsetzen-Prüfung. @param {string} key Speicherkennung. */
function read(key) { return JSON.stringify(this.data); }
/** Erhält Spieler, verletzte Gegner, Herzdrop und verlorenen Beutel bei der Grundrissmigration. */
function migration() {
  const data=legacySave(),original=structuredClone(data),game=setup();
  new SaveManager(game,{getItem:read,data});assert.ok(game.resumeData);assert.equal(restoreGame(game,data),true);
  assert.equal(game.coins,19);assert.equal(game.flags.maraLowerMessage,true);assert.equal(game.enemies[0].hp,1);
  assert.equal(game.occupied(game.player.x,game.player.y),false);assert.equal(game.heartDrops.length,1);
  assert.equal(wall(game,game.heartDrops[0].x,game.heartDrops[0].y),false);
  assert.deepEqual(game.health.lost.items,['Feldverband']);assert.equal(game.health.lost.coins,7);
  assert.deepEqual(data,original);assert.equal(restoreGame(setup(),captureGame(game)),true);
  const invalid=legacySave();invalid.player.x=-1;assert.equal(restoreGame(setup(),invalid),false);
  const current=captureGame(game);current.player={x:2,y:3,facing:'down'};assert.equal(restoreGame(setup(),current),false);
}
/** Behält Ablehnung beschädigter Kampfdaten auch während einer alten Grundrissmigration bei. */
function invalidMigration() {
  const data=legacySave();data.combat.enemies={bad:true};
  assert.equal(restoreGame(setup(),data),false);assert.doesNotThrow(migrateSave.bind(null,setup(),data));
}
/** Verhindert Spinnenstarts in Pfeilern, Wänden oder unmittelbar neben der Spielfigur. */
function waveSpawns() {
  const game=setup();game.travel('quell-nest');game.enemies=[];
  for (const point of [[8,6],[3,3],[12,10],[8,2]]) {
    game.player={x:point[0],y:point[1],facing:'up'};game.nestWave=0;game.enemies=[];startNest(game);
    assert.equal(game.enemies.length,2);
    for (const actor of game.enemies) { assert.equal(wall(game,actor.x,actor.y),false);assert.equal(game.objectAt(actor.x,actor.y),null);assert.ok(Math.abs(actor.x-game.player.x)+Math.abs(actor.y-game.player.y)>=3); }
  }
}
/** Prüft geschlossene Mauerabschlüsse auch ohne rechteckige Außenwand. */
function wallEdges() {
  for (const room of createQuellDungeon()) for (let y=0;y<room.height;y++) for (let x=0;x<room.width;x++) {
    if (room.layout[y][x]!== '#') continue;
    const index=dungeonWallTile(room,x,y);assert.ok(index===-1 || index>=0 && index<70);
    for (const [dx,dy] of [[0,1],[1,0],[-1,0],[0,-1]]) if (room.layout[y+dy]?.[x+dx]==='.') assert.notEqual(index,-1);
  }
}
test('Neue Gewölbe: unterschiedliche Konturen, zusammenhängende Böden und erreichbare Einrichtungen',connectedRooms);
test('Neue Gewölbe: Einrichtungen, Gegner und Übergänge stehen auf gültigen Feldern',placements);
test('Gegengewichtskammer: kein Umgehen des geschlossenen Fallgitters',sealedMechanism);
test('Grundrissmigration: Fortsetzen erhält Beute, Questwerte, Verletzungen und Herzfunde',migration);
test('Grundrissmigration: beschädigte Kampfdaten werden weiterhin abgelehnt',invalidMigration);
test('Spinnenbrut: Wellen erscheinen ausschließlich auf freien gültigen Feldern',waveSpawns);
test('Dungeonatlas: alle bodenseitigen Wandkanten erhalten einen Abschluss',wallEdges);
