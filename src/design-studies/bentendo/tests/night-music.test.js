import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { worldMusic } from '../scripts/game/systems/world-music.js';
import { createEastRooms } from '../scripts/game/data/east-rooms.js';
import { createVillage } from '../scripts/game/data/village.js';
import { createVillageInteriors } from '../scripts/game/data/house-rooms.js';

/** Wählt bei beginnender Dunkelheit beide Nachtstücke und morgens wieder den Tagestrack. */
function selection() {
  for (const room of [createVillage(),...createEastRooms().filter(isForest)]) {
    for (const worldMinutes of [0,300,1140,1200,1439,1440+1140]) {
      assert.equal(worldMusic({room,worldMinutes}),room.id==='village'?'bruchstein-night':'forest-night');
    }
    for (const worldMinutes of [360,540,1139,1440+540]) assert.equal(worldMusic({room,worldMinutes}),room.music);
  }
}

/** Erkennt die sechs Waldaußenräume. @param {object} room Raum. */
function isForest(room) { return room.villageLandscape; }

/** Bewahrt Innenraum-, Werkstations- und Dungeonmusik auch während der Nacht. */
function preserveRooms() {
  for (const room of [...createVillageInteriors(),...createEastRooms().filter(isInterior),{id:'dungeon',music:'quellgewoelbe',dungeon:true}]) {
    assert.equal(worldMusic({room,worldMinutes:1260}),room.id.startsWith('village-') && room.furnished?'bruchstein-night':room.music);
  }
  const forest=createEastRooms().find(isForest);
  assert.equal(worldMusic({room:forest}),forest.music);
}

/** Erkennt die Werkstation. @param {object} room Raum. */
function isInterior(room) { return !room.villageLandscape; }

/** Prüft die beiden tatsächlich ausgelieferten Klangdateien. */
function assets() {
  for (const track of ['forest-night','bruchstein-night']) {
    const file=new URL(`../assets/sounds/${track}.mp3`,import.meta.url);
    assert.ok(fs.statSync(file).size>100000);
  }
}

test('Nachtmusik: sechs Waldgebiete und Bruchstein wechseln bei Dunkelheit',selection);
test('Nachtmusik: Dorfhäuser nutzen Nachtmusik, Dungeons behalten ihren Track',preserveRooms);
test('Nachtmusik: beide eigenen Tracks sind vorhanden',assets);
