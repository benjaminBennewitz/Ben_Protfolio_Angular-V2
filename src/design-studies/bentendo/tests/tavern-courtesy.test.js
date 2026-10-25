import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../scripts/game/game.js';
import { createVillage,createGuildEntrance } from '../scripts/game/data/village.js';
import { createVillageInteriors } from '../scripts/game/data/house-rooms.js';
import { createActor } from '../scripts/game/systems/wanderers.js';
import { navigateDrinks } from '../scripts/game/systems/tavern.js';
import { wall } from '../scripts/game/systems/collision.js';
import { useObject,dismiss } from './helpers.js';

/** Lädt das echte Dorf mit allen Häusern. */
function gameWorld() {
  const rooms=new Map();
  for (const room of [createVillage(),createGuildEntrance(),...createVillageInteriors()]) rooms.set(room.id,room);
  const game=new Game(rooms); game.mode='world'; return game;
}

/** Wartet auf den Wirt und prüft dabei jeden Schritt auf Kollisionen und Nachbarschaft. @param {object} game Spiel. */
function waitForService(game) {
  let walked=0;
  for (let frame=0;frame<300 && !game.tavernMenu;frame++) {
    game.update(0.05,false);
    const actor=game.roomState.wanderers.innkeeper;
    assert.equal(wall(game,actor.x,actor.y),false);
    const target=game.objectAt(actor.x,actor.y); assert.equal(target?.id,'innkeeper');
    if (actor.moving) { assert.equal(Math.abs(actor.x-actor.fromX)+Math.abs(actor.y-actor.fromY),1); walked++; }
  }
  assert.equal(game.tavernMenu,true); assert.ok(walked>0);
  assert.equal(game.roomState.wanderers.innkeeper.y,3);
}

/** Prüft Bedienung, Preise, fehlende Münzen und einmalige Bestätigung trotz Dialogfolgetasten. */
function drinkOrders() {
  const game=gameWorld(); game.travel('village-inn'); useObject(game,'bar-stool-a');
  const exit=[...game.seat.exit]; assert.equal(game.message,null); waitForService(game);
  navigateDrinks(game,'down'); game.interact(); assert.equal(game.coins,0); assert.equal(game.flags.drinksServed,undefined);
  dismiss(game); game.interact(); navigateDrinks(game,'up'); game.interact();
  assert.equal(game.flags.drinksServed,1); assert.equal(game.coins,0); dismiss(game);
  game.coins=3; game.interact(); navigateDrinks(game,'down'); game.interact();
  assert.equal(game.coins,2); assert.equal(game.flags.drinksServed,2); dismiss(game); assert.equal(game.coins,2);
  game.interact(); navigateDrinks(game,'down'); game.interact(); dismiss(game);
  assert.equal(game.coins,0); assert.equal(game.flags.drinksServed,3);
  game.back(); assert.equal(game.seat,null); assert.deepEqual([game.player.x,game.player.y],exit);
  assert.equal(game.occupied(...exit),false);
  for (let i=0;i<200 && game.roomState.service;i++) game.update(0.05,false);
  assert.equal(game.roomState.service,null); assert.equal(game.roomState.wanderers.innkeeper.index,0);
}

/** Prüft alle vorhandenen Sitzplätze, sicheren Abbruch und Raumwechsel während der Bedienung. */
function allSeats() {
  const game=gameWorld();
  for (const id of ['bar-stool-a','bar-stool-b','bar-stool-c','chair-a','chair-b','chair-c','chair-d']) {
    game.travel('village-inn'); useObject(game,id); assert.equal(game.seat.id,id);
    if (id.startsWith('bar-stool-')) waitForService(game);
    else {
      assert.equal(game.roomState.service,null); game.update(10,false); game.interact();
      assert.equal(game.tavernMenu,false); assert.equal(game.flags.drinksServed,undefined); assert.equal(game.hint,'B: aufstehen');
    }
    game.journal(); game.back(); assert.ok(game.seat); assert.equal(game.journalOpen,false);
    game.step('down'); assert.equal(game.seat,null); assert.equal(game.occupied(game.player.x,game.player.y),false);
  }
  game.travel('village-inn'); useObject(game,'bar-stool-a'); game.travel('village');
  assert.equal(game.seat,null); assert.equal(game.tavernMenu,false);
  game.travel('village-inn'); assert.equal(game.roomState.service,null);
}

/** Stellt den Begleiter vor den Spieler, ohne den eigentlichen Dorfgrundriss zu verändern. @param {object} game Spiel. @param {number[]} player Spielerfeld. @param {number[]} dog Hundefeld. */
function companionAt(game,player,dog) {
  game.player={x:player[0],y:player[1],facing:'up'};
  game.roomState.wanderers={dog:{...createActor({x:dog[0],y:dog[1],kind:'dog'}),wait:0}};
  game.roomState.fetch={dogId:'dog',phase:'follow',followRemaining:45,wait:0};
}

/** Prüft die echte einspaltige Höhlengasse samt Sackgasse und unveränderter Sperre. */
function dogNarrowPassage() {
  const game=gameWorld(); companionAt(game,[15,3],[15,2]);
  assert.equal(game.step('up'),true); game.update(0.3,false);
  assert.deepEqual([game.player.x,game.player.y],[15,2]);
  assert.equal(game.step('up'),false); assert.equal(game.objectAt(15,1).id,'north-gate');
  for (let i=0;i<30 && game.player.y!==4;i++) { game.step('down'); game.update(0.1,false); }
  assert.equal(game.player.y,4); assert.equal(wall(game,game.roomState.wanderers.dog.x,game.roomState.wanderers.dog.y),false);
  companionAt(game,[15,5],[15,4]); game.roomState.fetch.phase='home';
  for (let i=0;i<30 && game.player.y!==4;i++) { game.step('up'); game.update(0.1,false); }
  assert.equal(game.player.y,4);
}

/** Kennzeichnet nur tatsächlich geprüfte Möbel und erhält ihre Häkchen nach dem Abschluss. */
function stockChecks() {
  const game=gameWorld(); game.travel('village-market'); useObject(game,'storekeeper'); dismiss(game);
  for (const id of ['barrel-e','barrel-f','shelf-b']) {
    const object=game.objects.find(byId.bind(null,id)); assert.equal(object.searched,undefined); assert.equal(object.taskMarker,undefined);
    useObject(game,id); assert.match(game.message.lines.join(' '),/geprüft/u); dismiss(game);
    assert.equal(game.objects.find(byId.bind(null,id)).searched,true);
  }
  assert.equal(game.flags.stockChecked.length,3); useObject(game,'storekeeper'); dismiss(game);
  assert.equal(game.objects.find(byId.bind(null,'shelf-b')).searched,true);
}

/** Vergleicht eine Objektkennung. @param {string} id Gesuchte Kennung. @param {object} object Objekt. */
function byId(id,object) { return object.id===id; }

test('Schenke: sichtbarer Bedienweg, kostenlose und bezahlte Getränke ohne Doppelabbuchung',drinkOrders);
test('Schenke: alle Stühle, Aufstehen, Journal und Raumwechsel bleiben sicher',allSeats);
test('Begleithund: Höhlengasse bleibt in beiden Richtungen passierbar',dogNarrowPassage);
test('Marktlager: Häkchen erst nach Prüfung, keine Nummern und dauerhafte Bestätigung',stockChecks);
