import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, use, dismiss } from './helpers.js';

/** Prüft sämtliche Hauszugänge und beide Treppen. */
function houses() {
  const game = createGame();
  for (const id of ['inn','guild','workshop','market']) {
    const door = game.room.objects.find(isHouse.bind(null,`${id}-0`));
    use(game,door.x+3,door.y); dismiss(game); use(game,door.x,door.y);
    assert.equal(game.room.id,`${id}-0`);
    if (['inn','guild'].includes(id)) { use(game,11,2); assert.equal(game.room.id,`${id}-1`); use(game,11,2); }
    use(game,6,10); assert.equal(game.room.id,'city');
  }
}

/** Vergleicht das Reiseziel einer Tür. @param {string} id Zielkennung. @param {object} object Kartenobjekt. */
function isHouse(id,object) { return object.to === id; }

/** Prüft beide Waldzugänge und die Rückkehr. */
function forestPaths() {
  const game = createGame();
  for (const [x,y,id] of [[15,0,'forest-north'],[31,12,'forest-east']]) {
    use(game,x,y); assert.equal(game.room.id,id);
    use(game,15,22); assert.equal(game.room.id,'city');
    assert.equal(game.occupied(game.player.x,game.player.y),false);
  }
}

test('Stadt: Häuser und Obergeschosse erreichbar',houses);
test('Stadt: beide Waldwege mit Rückweg',forestPaths);

/** Prüft die neu zugeordneten Archiv- und Pumpenhauszugänge. */
function relocatedRooms() {
  const game = createGame();
  for (const id of ['archive','hall']) {
    const door = game.room.objects.find(isHouse.bind(null,id));
    use(game,door.x,door.y); assert.equal(game.room.id,id);
    use(game,1,id==='archive'?11:8); assert.equal(game.room.id,'city');
    assert.equal(game.occupied(game.player.x,game.player.y),false);
  }
}

test('Stadt: Archiv und Pumpenhaus mit Rückweg',relocatedRooms);
