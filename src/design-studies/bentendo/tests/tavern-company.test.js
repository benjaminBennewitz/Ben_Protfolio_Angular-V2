import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame,useObject,dismiss } from './helpers.js';
import { createVillage,createGuildEntrance } from '../scripts/game/data/village.js';
import { createVillageInteriors } from '../scripts/game/data/house-rooms.js';
import { createEastRooms } from '../scripts/game/data/east-rooms.js';
import { updateResidentChatter } from '../scripts/game/systems/resident-chatter.js';
import { sitDown } from '../scripts/game/systems/tavern.js';
import { npcIdle } from '../scripts/game/render/village-life.js';

/** Lädt die abendliche Schenke mit allen bekannten Gästen. */
function world() {
  const game=createGame();
  for (const room of [createVillage(),createGuildEntrance(),...createVillageInteriors(),...createEastRooms()]) game.rooms.set(room.id,room);
  game.reset(); game.mode='world'; game.worldMinutes=1080; game.flags.guildOpen=true;
  game.flags.eastDoorStudied=true; game.flags.eastTravellerMet=true; game.travel('village-inn'); return game;
}

/** Liefert eine feste Auswahl für reproduzierbare Frage-Antwort-Wechsel. */
function zero() { return 0; }

/** Prüft echte Sitzplätze, freie Spielerhocker und ansprechbare Belegung statt doppelter Sitznutzung. */
function seating() {
  const game=world(),guests=game.objects.filter(seated); assert.equal(guests.length,5);
  for (const guest of guests) {
    const chair=game.objects.find(/** Erkennt das zugehörige Möbel. @param {object} object Stuhl. */ object=>object.id===guest.seatId);
    assert.equal(chair.occupiedBy,guest.id); assert.equal(chair.passable,true);
    assert.equal(game.objectAt(guest.x,guest.y).id,guest.id); assert.equal(game.occupied(guest.x,guest.y),true);
    assert.equal(sitDown(game,game.room.objects.find(/** Findet den Originalstuhl. @param {object} object Möbel. */ object=>object.id===guest.seatId)),false);
    assert.equal(npcIdle(game,guest).lift,0); game.worldMinutes=1080; useObject(game,guest.id); dismiss(game);
  }
  useObject(game,'bar-stool-b'); assert.equal(game.seat.id,'bar-stool-b'); game.back();
  useObject(game,'chair-d'); assert.equal(game.seat.id,'chair-d');
}

/** Erkennt sitzende Gäste. @param {object} object Person. */
function seated(object) { return object.seated; }

/** Reserviert bereits besetzte Spielerplätze auch beim abendlichen Eintreffen der Gäste. */
function playerPriority() {
  const game=world(); game.worldMinutes=960; game.travel('village-inn'); useObject(game,'bar-stool-a');
  game.worldMinutes=1080;
  assert.equal(game.objects.some(/** Prüft eine verbotene Übernahme. @param {object} object Gast. */ object=>object.seated && object.seatId==='bar-stool-a'),false);
  assert.equal(game.seat.id,'bar-stool-a'); assert.equal(game.objects.filter(seated).length,4);
}

/** Zeigt nacheinander zwei verschiedene Sprecher und unterbricht für ein direktes Gespräch. */
function dialogueExchange() {
  const game=world(); game.player={x:5,y:9,facing:'left'}; game.locationNotice=null; game.chatterWait=0;
  updateResidentChatter(game,.1,zero); assert.equal(game.ambientSpeech.speakerId,'keeper');
  assert.equal(game.ambientSpeech.reply.id,'reader'); const first=game.ambientSpeech.text;
  updateResidentChatter(game,game.ambientSpeech.remaining+.1,zero); assert.equal(game.ambientSpeech,null);
  assert.equal(game.tavernReply.id,'reader'); updateResidentChatter(game,1.3,zero);
  assert.equal(game.ambientSpeech.speakerId,'reader'); assert.notEqual(game.ambientSpeech.text,first);
  game.worldMinutes=1080; useObject(game,'keeper'); assert.ok(game.message);
  assert.equal(game.ambientSpeech,null); assert.equal(game.tavernReply,null);
}

/** Erhält das sitzende späte Gesprächspaar und entfernt dessen Stuhlbelegung morgens. */
function lateAndMorning() {
  const game=world(); game.worldMinutes=1260;
  assert.deepEqual(game.objects.filter(seated).map(personId).sort(),['keeper','reader']);
  game.worldMinutes=420; assert.equal(game.objects.some(seated),false);
  assert.equal(game.objects.some(occupiedChair),false);
}

/** Liefert die Personenkennung. @param {object} object Person. */
function personId(object) { return object.id; }

/** Erkennt eine reservierte Sitzfläche. @param {object} object Möbel. */
function occupiedChair(object) { return Boolean(object.occupiedBy); }

test('Schenkgäste: fünf Sitzplätze, freie Spielerplätze und echte Belegung',seating);
test('Schenkgäste: ein sitzender Spieler behält seinen Platz',playerPriority);
test('Schenkgespräch: Frage, Antwort und Vorrang des Spielerdialogs',dialogueExchange);
test('Schenkgäste: spätes Paar sitzt, morgens werden die Stühle frei',lateAndMorning);
