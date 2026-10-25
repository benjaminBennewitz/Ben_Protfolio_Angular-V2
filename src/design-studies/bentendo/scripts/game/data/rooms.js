import { createEastRooms } from './east-rooms.js';
import { createQuellDungeon } from './quell-dungeon.js';
import { createMaraArchive,createSourceCave } from './mara-rooms.js';
import { createVillageInteriors } from './house-rooms.js';
import { createVillage, createGuildEntrance } from './village.js';
import { createTown } from './town.js';
import { createInteriors, createForest } from './interiors.js';
const rooms = new Map();

/** Lädt ein erhaltenes Prototyp-Level. @param {string} id Raumkennung. */
async function loadRoom(id) {
  const response = await fetch(new URL(`./${id}.json`, import.meta.url));
  if (!response.ok) throw new Error(`Raum fehlt: ${id}`);
  const room = await response.json();
  rooms.set(id, room);
}

/** Lädt die Raumdaten unabhängig von Darstellung und Gerätebedienung. */
export async function loadRooms() {
  await Promise.all(['hall','storage','steam','archive'].map(loadRoom));
  const generated = [createVillage(), createGuildEntrance(), ...createVillageInteriors(), createTown(), ...createInteriors(), createForest('north'), createForest('east')];
  for (const room of generated) rooms.set(room.id, room);
  for (const room of [createMaraArchive(rooms.get('archive')),createSourceCave(),...createQuellDungeon(),...createEastRooms()]) rooms.set(room.id,room);
  return rooms;
}
