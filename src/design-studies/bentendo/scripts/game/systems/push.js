import { enemyAt } from './dungeon-combat.js';
import { contains, wall } from './collision.js';
import { DIRECTIONS } from '../../core/config.js';

/** Prüft die vollständige neue Möbelfläche. @param {object} game Spiel. @param {object} block Möbel. @param {number} dx X-Richtung. @param {number} dy Y-Richtung. */
function blocked(game, block, dx, dy) {
  for (let x = block.x + dx; x < block.x + dx + block.w; x++) {
    for (let y = block.y + dy; y < block.y + dy + block.h; y++) {
      if (contains(block, x, y)) continue;
      if (wall(game, x, y) || game.objectAt(x, y, block) || enemyAt(game,x,y)) return true;
    }
  }
  return false;
}

/** Schiebt Kisten und Mehrfeldregale mit denselben Regeln. @param {object} game Spiel. @param {object} block Möbel. */
export function push(game, block) {
  const [dx,dy] = DIRECTIONS[game.player.facing];
  if (blocked(game, block, dx, dy)) return game.say('Du', 'Dahinter ist kein Platz. Ich versuche es von einer anderen Seite.');
  game.slide = { block, fromX: block.x, fromY: block.y, time: 0 };
  block.x += dx; block.y += dy;
  game.held = null; game.sounds.push('push');
}

/** Stellt ausschließlich die Möbel dieses Raums zurück. @param {object} game Spiel. */
export function resetFurniture(game) {
  game.roomState.blocks = structuredClone(game.room.blocks || []);
  game.slide = null;
  game.say('Rückstellhebel', 'Die Möbel stehen wieder an ihren Markierungen. Deine Funde bleiben erhalten.');
}
