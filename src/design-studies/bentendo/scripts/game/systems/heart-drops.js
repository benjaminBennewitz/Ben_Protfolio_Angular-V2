import { refillHero } from './health.js';

const DROPS={spider:{chance:0.25,amount:0.5},beetle:{chance:0.35,amount:1},snake:{chance:0.3,amount:2}};

/** Manche besiegten Gegner lassen ein Viertel-, Halb- oder Ganzherz zurück. @param {object} game Spiel. @param {object} actor Besiegter Gegner. @param {number} roll Zufallswert zwischen null und eins. */
export function dropHeart(game,actor,roll=Math.random()) {
  const drop=DROPS[actor.species];
  if (!drop || roll>=drop.chance || game.heartDrops.length>=12 || game.heartDrops.some(sameDrop.bind(null,actor.id))) return;
  game.heartDrops.push({id:actor.id,x:actor.x,y:actor.y,amount:drop.amount});
}

/** Verhindert doppelte Drops derselben Gegnerinstanz. @param {string} id Gegnerkennung. @param {object} drop Herzdrop. */
function sameDrop(id,drop) { return id===drop.id; }

/** Sammelt Herzen beim Darüberlaufen ein und lässt überschüssige Herzen bei vollem Leben liegen. @param {object} game Spiel. */
export function collectHearts(game) {
  for (let index=game.heartDrops.length-1;index>=0;index--) {
    const drop=game.heartDrops[index];
    if (drop.x!==game.player.x || drop.y!==game.player.y || game.move || game.health.hp===game.health.maxHp) continue;
    if (refillHero(game,drop.amount)) game.heartDrops.splice(index,1);
  }
}
