import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame,useObject,dismiss,go } from './helpers.js';
import { createVillage,createGuildEntrance } from '../scripts/game/data/village.js';
import { createVillageInteriors } from '../scripts/game/data/house-rooms.js';
import { createEastRooms } from '../scripts/game/data/east-rooms.js';
import { DAILY_RESIDENTS } from '../scripts/game/data/daily-residents.js';
import { captureGame,restoreGame } from '../scripts/game/systems/save-state.js';
import { clockLabel } from '../scripts/game/systems/world-clock.js';
import { questMapMarkers } from '../scripts/game/systems/quest-map.js';
import { worldMusic } from '../scripts/game/systems/world-music.js';
import { tryFetch,stickBorrowed } from '../scripts/game/systems/dog-fetch.js';
import { contains,wall } from '../scripts/game/systems/collision.js';

/** Lädt das vollständige Dorf samt Gilde und Wald. */
function world() {
  const game=createGame();
  for (const room of [createVillage(),createGuildEntrance(),...createVillageInteriors(),...createEastRooms()]) game.rooms.set(room.id,room);
  game.reset(); game.mode='world'; game.flags.guildOpen=true; game.flags.eastDoorStudied=true; game.flags.eastTravellerMet=true;
  return game;
}

/** Findet eine bekannte sichtbare Person. @param {object} object Objekt. */
function isPerson(object) { return ['resident','npc','host'].includes(object.kind); }

/** Prüft eindeutige Abendgäste ohne Möbelüberlappung und erhält sämtliche Verkehrswege. */
function eveningGuests() {
  const game=world(); game.worldMinutes=19*60; game.travel('village');
  assert.equal(game.objects.some(isPerson),false);
  for (const room of ['village-home','village-workshop','village-market','village-guild-upper','east-wood']) {
    game.travel(room); assert.equal(game.objects.some(isPerson),false,room);
  }
  game.travel('village-inn'); const guests=game.objects.filter(isPerson);
  assert.equal(guests.length,DAILY_RESIDENTS.length+1); assert.equal(new Set(guests.map(personId)).size,guests.length);
  for (const guest of guests) {
    assert.equal(wall(game,guest.x,guest.y),false);
    for (const object of game.room.objects) if (!isPerson(object) && guest.seatId!==object.id) assert.equal(contains(object,guest.x,guest.y),false,guest.id);
    game.worldMinutes=1080; useObject(game,guest.id); dismiss(game);
  }
  useObject(game,'stairs'); assert.equal(game.room.id,'village-inn-upper');
}

/** Liefert die Personenkennung. @param {object} object Person. */
function personId(object) { return object.id; }

/** Verbirgt fast alle Bewohner nachts und stellt morgens die Originalbesetzung wieder her. */
function nightAndMorning() {
  const game=world(); game.worldMinutes=1200; game.travel('village-inn');
  assert.deepEqual(game.objects.filter(isPerson).map(personId).sort(),['innkeeper','keeper','reader']);
  game.travel('village'); assert.equal(game.objects.some(isPerson),false);
  game.worldMinutes=420; assert.ok(game.objects.some(isPerson));
  game.travel('village-weaver'); assert.ok(game.objects.some(weaver));
}

/** Erkennt den Lehrling. @param {object} object Person. */
function weaver(object) { return object.id==='weaver-helper'; }

/** Entfernt alle Tagwildtiere und zeigt nur unbewegte Haustiere an geschützten Schlaforten. */
function sleepingAnimals() {
  const game=world(); game.worldMinutes=1140; game.travel('village'); game.update(.1,false);
  const pets=game.objects.filter(animal); assert.equal(pets.length,3);
  for (const pet of pets) { assert.equal(pet.sleeping,true); assert.equal(pet.walking,false); assert.equal(pet.route,null); }
  const dog=pets.find(dogId); assert.equal(dog.x,27); assert.equal(dog.y,23); assert.equal(wall(game,dog.x,dog.y),false);
  for (const room of createEastRooms().filter(forest)) { game.travel(room.id); assert.equal(game.objects.some(animal),false); }
  game.travel('village'); game.worldMinutes=420; assert.ok(game.objects.filter(animal).length>3);
}

/** Erkennt Tiere. @param {object} object Lebewesen. */
function animal(object) { return ['cat','dog','wildlife'].includes(object.kind); }

/** Erkennt den Hund. @param {object} object Tier. */
function dogId(object) { return object.id==='dog'; }

/** Erkennt Waldaußenräume. @param {object} room Raum. */
function forest(room) { return room.villageLandscape; }

/** Beendet Apportieren bei Dunkelheit ohne Astverlust und erlaubt keinen nächtlichen Neustart. */
function dogRest() {
  const game=world(); game.inventory=['Ast']; game.worldMinutes=1139; game.travel('village');
  game.player={x:24,y:24,facing:'right'}; assert.equal(tryFetch(game,game.objects.find(dogId)),true);
  assert.equal(stickBorrowed(game),true); game.worldMinutes=1140; game.update(.1,false);
  assert.equal(game.roomState.fetch,null); assert.equal(stickBorrowed(game),false); assert.ok(game.inventory.includes('Ast'));
  useObject(game,'dog'); dismiss(game); assert.equal(game.roomState.fetch,null);
  assert.equal(tryFetch(game,game.objects.find(dogId)),true); assert.equal(game.roomState.fetch,null);
}

/** Verweigert jedes nächtliche Haus bis auf die Schenke, ohne Ausgänge zu sperren. */
function closedHouses() {
  const game=world(); game.worldMinutes=1200; game.travel('village');
  for (const id of ['home-door','workshop-door','market-door','weaver-door','mill-door','guild-door']) {
    useObject(game,id); assert.equal(game.room.id,'village',id); assert.ok(game.message); dismiss(game);
  }
  useObject(game,'inn-door'); assert.equal(game.room.id,'village-inn');
  useObject(game,'stairs'); assert.equal(game.room.id,'village-inn-upper');
  game.travel('village-home'); useObject(game,'exit'); assert.equal(game.room.id,'village');
  game.worldMinutes=420; useObject(game,'home-door'); assert.equal(game.room.id,'village-home');
}

/** Führt bekannte Questmarker abends zur Schenke und lässt sie nachts bei schlafenden Personen verschwinden. */
function eveningMarkers() {
  const game=world(); game.flags.spoolStarted=true; game.inventory=['Garnspule']; game.worldMinutes=1140; game.travel('village');
  const markers=questMapMarkers(game,'village'); assert.ok(markers.some(innMarker));
  game.travel('village-inn'); assert.ok(questMapMarkers(game,'village-inn').some(innMarker));
  game.worldMinutes=1200; assert.equal(questMapMarkers(game,'village-inn').some(spoolMarker),false);
}

/** Erkennt den versetzten bekannten Questkontakt. @param {object} marker Marker. */
function innMarker(marker) { return marker.target==='weaver-helper' && marker.room==='village-inn'; }

/** Erkennt die Garnaufgabe. @param {object} marker Marker. */
function spoolMarker(marker) { return marker.target==='weaver-helper'; }

/** Erhält Uhr und Zeitpläne beim Laden und verwendet nachts in allen Dorfhäusern die Nachtmusik. */
function savedRoutine() {
  const game=world(); game.worldMinutes=1253; game.travel('village-inn');
  const loaded=world(); assert.equal(restoreGame(loaded,captureGame(game)),true);
  assert.equal(clockLabel(loaded),'20:53'); assert.equal(loaded.objects.filter(isPerson).length,3);
  for (const room of [createGuildEntrance(),...createVillageInteriors()]) {
    assert.equal(worldMusic({room,worldMinutes:1253}),'bruchstein-night');
    assert.equal(worldMusic({room,worldMinutes:540}),room.music);
  }
}

test('Tagesplan: alle Abendgäste eindeutig, erreichbar und ohne Möbelüberlagerung',eveningGuests);
test('Tagesplan: zwei späte Gäste und Rückkehr am Morgen',nightAndMorning);
test('Tagesplan: Tagtiere verborgen und Haustiere schlafen geschützt',sleepingAnimals);
test('Tagesplan: Hund legt sich ohne Verlust des Astes schlafen',dogRest);
test('Nachtruhe: Häuser zu, Schenke offen, Verlassen immer möglich',closedHouses);
test('Tagesplan: bekannte Questmarker folgen dem Aufenthaltsort',eveningMarkers);
test('Tagesplan: Uhr, Laden und Nachtmusik in sämtlichen Dorfhäusern',savedRoutine);

/** Hält Ausschank und Spielerhocker auch bei voller abendlicher Schenke bedienbar. */
function eveningService() {
  const game=world(); game.worldMinutes=1080; game.travel('village-inn');
  useObject(game,'bar-stool-b'); assert.ok(game.seat);
  for (let i=0;i<200 && !game.tavernMenu;i++) game.update(.1,false);
  assert.equal(game.roomState.service.phase,'ready'); assert.equal(game.tavernMenu,true);
  game.interact(); dismiss(game); assert.equal(game.flags.drinksServed,1);
  game.back(); useObject(game,'exit'); assert.equal(game.room.id,'village');
}

/** Schließt Häuser exakt ab 20 Uhr und öffnet sie um sechs Uhr wieder. */
function restBoundaries() {
  const game=world(); game.worldMinutes=1199; game.travel('village');
  game.player={x:28,y:23,facing:'up'}; game.interact();
  assert.equal(game.room.id,'village-home'); useObject(game,'exit'); game.worldMinutes=1200;
  useObject(game,'home-door'); assert.equal(game.room.id,'village'); dismiss(game);
  game.worldMinutes=360; useObject(game,'home-door'); assert.equal(game.room.id,'village-home');
}

test('Abendgäste: Thekenbedienung und Rückweg bleiben frei',eveningService);
test('Nachtruhe: Türgrenzen um 20 und sechs Uhr',restBoundaries);
