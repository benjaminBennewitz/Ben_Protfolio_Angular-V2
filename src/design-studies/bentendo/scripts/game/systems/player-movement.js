import { DIRECTIONS } from '../../core/config.js';

export const MOVE_DIRECTIONS={...DIRECTIONS,'up-right':[1,-1],'up-left':[-1,-1],'down-right':[1,1],'down-left':[-1,1]};

/** Kombiniert gehaltene Richtungen, wobei sich Gegensätze aufheben. @param {Iterable} directions Gehaltene Richtungen. */
export function combinedDirection(directions) {
  const keys=new Set();
  for (const direction of directions) for (const part of direction.split('-')) keys.add(part);
  const x=Number(keys.has('right'))-Number(keys.has('left')),y=Number(keys.has('down'))-Number(keys.has('up'));
  return [y<0?'up':y>0?'down':'',x<0?'left':x>0?'right':''].filter(Boolean).join('-') || null;
}

/** Behält vier Spriteblickrichtungen bei und verhindert das Schneiden blockierter Diagonalecken. @param {object} game Spiel. @param {string} direction Laufrichtung. */
export function diagonalBlocked(game,direction) {
  const [dx,dy]=MOVE_DIRECTIONS[direction];
  game.player.facing=dx?(dx>0?'right':'left'):(dy>0?'down':'up');
  return Boolean(dx && dy && (game.occupied(game.player.x+dx,game.player.y) || game.occupied(game.player.x,game.player.y+dy)));
}

/** Normalisiert die Laufgeschwindigkeit anhand der tatsächlichen Rasterstrecke. @param {object} move Bewegungsschritt. */
export function stepDuration(move) { return 0.18*Math.hypot(move.x-move.fromX,move.y-move.fromY); }

/** Erkennt ausschließlich freie Weltsteuerung für kombinierte Eingaben. @param {object} game Spiel. */
export function worldMovement(game) {
  return game.mode==='world' && !game.message && !game.systemMenu && !game.resting && !game.bagOpen && !game.journalOpen && !game.mapOpen && !game.tavernMenu;
}

/** Liefert die aktuelle sichtbare Position gemeinsam für Darstellung und bewegte Angriffe. @param {object} game Spiel. */
export function movementPosition(game) {
  const move=game.move;
  if (!move) return {x:game.player.x,y:game.player.y};
  const progress=Math.min(1,move.time/stepDuration(move));
  return {x:move.fromX+(move.x-move.fromX)*progress,y:move.fromY+(move.y-move.fromY)*progress};
}
