import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, useObject, dismiss } from './helpers.js';
import { createVillageInteriors } from '../scripts/game/data/house-rooms.js';
import { createVillage, createGuildEntrance } from '../scripts/game/data/village.js';
import { wall, contains } from '../scripts/game/systems/collision.js';

/** Erstellt die belebte Stadt ohne Geräte- oder Browserabhängigkeiten. */
function villageGame() {
  const game=createGame();
  for (const room of [createVillage(),createGuildEntrance(),...createVillageInteriors()]) game.rooms.set(room.id,room);
  game.reset(); game.mode='world'; game.locationNotice=null; game.update(0,false);
  return game;
}

/** Prüft unterschiedliche Bewohner und kurze, vollständig begehbare Tierrouten. */
function castAndRoutes() {
  const game=villageGame(),appearances=new Set(); let animals=0;
  for (const object of game.room.objects) {
    if (object.appearance) appearances.add(object.appearance.join(','));
    assert.notEqual(object.kind,'hen');
    if (!object.route) continue;
    animals++;
    for (let i=0;i<object.route.length;i++) {
      const [x,y]=object.route[i],[nx,ny]=object.route[(i+1)%object.route.length];
      assert.ok(!wall(game,x,y) || (object.habitat==='water-edge' && game.room.ground[y][x]==='w'),object.id); assert.equal(Math.abs(nx-x)+Math.abs(ny-y),1);
      for (const other of game.room.objects) if (other.id!==object.id) assert.equal(contains(other,x,y),false,`${object.id}: ${other.id}`);
    }
  }
  assert.equal(appearances.size,5); assert.equal(animals,13);
}

/** Prüft Warten vor dem Spieler sowie reservierte Start- und Zielfelder während eines Laufschritts. */
function catCollision() {
  const game=villageGame(),cat=game.roomState.wanderers.cat;
  game.player.x=4; game.player.y=14; cat.wait=0; game.update(0.1,false);
  assert.equal(cat.moving,false); assert.equal(cat.x,3);
  game.player.x=11; game.player.y=29; cat.wait=0; game.update(0.1,false);
  assert.equal(cat.moving,true); assert.equal(game.occupied(3,14),true); assert.equal(game.occupied(4,14),true);
  game.update(0.12,false);
  const visible=game.objectAt(4,14); assert.equal(visible.name,'Katze'); assert.equal(visible.drawX,3.5);
  game.update(0.12,false); assert.equal(cat.moving,false); assert.equal(game.occupied(3,14),false);
}

/** Prüft unveränderte Tierpositionen bei Dialogen, Rucksack, Karte und Journal. */
function animalPauses() {
  const game=villageGame(),cat=game.roomState.wanderers.cat; cat.wait=0; game.update(0.1,false);
  const before=JSON.stringify(game.roomState.wanderers);
  game.say('Du','Einen Moment.'); game.update(2,false); assert.equal(JSON.stringify(game.roomState.wanderers),before); game.back();
  game.back(); game.update(2,false); assert.equal(JSON.stringify(game.roomState.wanderers),before);
  game.interact(); game.update(2,false); assert.equal(JSON.stringify(game.roomState.wanderers),before);
  game.back(); game.back(); game.journal(); game.update(2,false); assert.equal(JSON.stringify(game.roomState.wanderers),before);
  game.journal(); game.update(0.12,false); assert.notEqual(JSON.stringify(game.roomState.wanderers),before);
}

/** Prüft statische Tiere bei reduzierter Bewegung und erhaltene Positionen nach Raumwechseln. */
function animalPersistence() {
  const game=villageGame(),cat=game.roomState.wanderers.cat;
  cat.wait=0; game.update(0.1,false); game.update(1,true);
  assert.equal(cat.moving,false); const position=[cat.x,cat.y];
  for (let i=0;i<20;i++) game.update(1,true);
  assert.deepEqual([cat.x,cat.y],position);
  game.travel('village-guild'); game.travel('village');
  assert.deepEqual([game.roomState.wanderers.cat.x,game.roomState.wanderers.cat.y],position);
  game.reset(); assert.equal(game.objectAt(3,14).id,'cat'); assert.equal(game.roomState.wanderers,undefined);
}

/** Prüft Blickrichtung für sämtliche seitlichen Schritte aller Tierrouten. */
function animalFacing() {
  const game=villageGame(),directions=new Map();
  for (let i=0;i<1200;i++) {
    game.update(0.12,false);
    for (const [id,actor] of Object.entries(game.roomState.wanderers)) {
      if (!actor.moving || actor.x===actor.fromX) continue;
      const facing=actor.x<actor.fromX?'left':'right';
      assert.equal(actor.facing,facing,`${id} läuft rückwärts`);
      directions.set(`${id}:${facing}`,true);
    }
  }
  assert.equal(directions.size,26,'Jedes der 13 Tiere muss in beide Richtungen laufen.');
}

/** Prüft artspezifische Laute genau beim Ansprechen statt des normalen Dialogpiepsens. */
function animalVoices() {
  const game=villageGame(),voices=new Set();
  for (const object of game.room.objects) delete object.route;
  game.roomState.wanderers={};
  for (const object of game.room.objects) {
    if (!['cat','dog','wildlife'].includes(object.kind)) continue;
    game.sounds=[]; useObject(game,object.id);
    const expected=`animal-${object.animal || object.kind}`;
    assert.equal(game.sounds.at(-1),expected); assert.equal(game.sounds.includes('talk'),false);
    voices.add(expected); game.sounds=[]; game.interact();
    assert.equal(game.sounds.length,0,'Weiterblättern darf den Tierlaut nicht wiederholen.'); dismiss(game);
  }
  assert.equal(voices.size,7);
}

/** Prüft amphibische Uferwechsel, weiterhin gesperrtes Spielerwasser und sichere Baumkronenvögel. */
function riverHabitats() {
  const game=villageGame(),swimmers=new Set();
  for (let i=0;i<700;i++) {
    game.update(0.12,false);
    for (const object of game.objects) if (object.route && game.room.ground[object.y][object.x]==='w') {
      assert.equal(object.animal,'frog'); assert.equal(wall(game,object.x,object.y),true); swimmers.add(object.id);
    }
  }
  assert.equal(swimmers.size,3);
  for (const bird of game.room.birds) assert.ok(game.room.trees.some(matchesPerch.bind(null,bird)));
  assert.equal(game.room.birds.length,2);
}

/** Ordnet einen Vogel einer realen Baumkrone zu. @param {object} bird Vogel. @param {number[]} tree Baumstandort. */
function matchesPerch(bird,tree) { return bird.x===tree[0] && bird.treeY===tree[1]; }

/** Prüft begehbare Büsche und den geschlossenen Felsrahmen beiderseits des Wasserfalls. */
function northernTerrain() {
  const game=villageGame();
  for (const [x,y] of [[14,16],[23,5],[24,7]]) { assert.equal(game.room.ground[y][x],'h'); assert.equal(wall(game,x,y),false); }
  for (const x of [16,19]) for (let y=1;y<=4;y++) { assert.equal(game.room.ground[y][x],'r'); assert.equal(wall(game,x,y),true); }
  for (let x=0;x<game.room.width;x++) { assert.equal(game.room.ground[0][x],'r'); assert.equal(wall(game,x,0),true); }
  for (const tree of game.room.trees) assert.ok(tree[1]>=2,'Die beiden nördlichen Reihen gehören zur Felswand.');
  assert.equal(game.room.objects.some(isPlanter),false);
  assert.ok(game.room.trees.some(isPine));
}

/** Erkennt den entfernten selbst gezeichneten Blumenkübel. @param {object} object Dorfobjekt. */
function isPlanter(object) { return object.kind==='village-flowers'; }

/** Erkennt die nativen spitzen Awakening-Bäume. @param {number[]} tree Baumdaten. */
function isPine(tree) { return tree[2]==='pine'; }

/** Prüft sämtliche verbundenen Wiesen auf geschlossene rechteckige Flächen ohne Aussparungen. */
function closedMeadows() {
  const game=villageGame(),ground=game.room.ground,visited=new Set();
  for (let y=0;y<game.room.height;y++) for (let x=0;x<game.room.width;x++) {
    if (ground[y][x]!=='t' || visited.has(`${x},${y}`)) continue;
    const queue=[[x,y]]; let left=x,right=x,top=y,bottom=y,count=0;
    while (queue.length) {
      const [xx,yy]=queue.shift(),key=`${xx},${yy}`;
      if (ground[yy]?.[xx]!=='t' || visited.has(key)) continue;
      visited.add(key); count++; left=Math.min(left,xx); right=Math.max(right,xx); top=Math.min(top,yy); bottom=Math.max(bottom,yy);
      for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) queue.push([xx+dx,yy+dy]);
    }
    assert.equal(count,(right-left+1)*(bottom-top+1),`Offene Wiesenecke bei ${x},${y}`);
  }
}

/** Prüft die ungepflasterte Brunnenfläche und eine volle frei begehbare Reihe ringsherum. */
function wellClearing() {
  const game=villageGame(),well=game.objectAt(10,11);
  for (let y=well.y-1;y<=well.y+well.h;y++) for (let x=well.x-1;x<=well.x+well.w;x++) {
    assert.equal(game.room.ground[y][x],'e');
    assert.equal(game.occupied(x,y),contains(well,x,y));
  }
  assert.equal(game.room.ground[well.y-2][well.x],'p');
}

test('Dorfleben: unterschiedliche Bewohner und sichere Tierrouten',castAndRoutes);
test('Dorfleben: Katzenbewegung und Kollisionsreservierung',catCollision);
test('Dorfleben: Dialoge und Menüs pausieren die Tiere',animalPauses);
test('Dorfleben: reduzierte Bewegung, Raumwechsel und Neustart',animalPersistence);
test('Dorfleben: Blickrichtung folgt dem Laufschritt aller Tiere',animalFacing);
test('Dorfleben: sieben verschiedene Tierlaute beim Ansprechen',animalVoices);
test('Dorfleben: Frösche im Wasser und sparsame Vögel in echten Baumkronen',riverHabitats);
test('Dorf: begehbare Büsche, Felsrahmen und spitze Bäume',northernTerrain);
test('Dorf: Wiesen ohne offene Ecken oder ausgesparte Felder',closedMeadows);
test('Dorf: ungepflasterter und frei begehbarer Brunnenrand',wellClearing);
