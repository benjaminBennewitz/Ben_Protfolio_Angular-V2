import { wall } from './collision.js';
import { DIRECTIONS } from '../../core/config.js';

/** Erkennt menschliche Dorfbewohner unabhängig von ihrer Gesprächsaktion. @param {object} actor Figur. */
export function isResident(actor) { return ['resident','host','npc'].includes(actor.kind); }

/** Prüft Blickrichtung, Reichweite und freie Sicht bis zum Spieler. @param {object} game Spiel. @param {object} resident Bewohner. */
export function residentSeesPlayer(game,resident) {
  const dx=game.player.x-resident.x,dy=game.player.y-resident.y,[fx,fy]=DIRECTIONS[resident.facing || 'down'];
  const forward=dx*fx+dy*fy,side=Math.abs(dx*fy-dy*fx);
  if (Math.max(Math.abs(dx),Math.abs(dy))>5 || forward<0 || side>forward+1) return false;
  return clearSight(game,resident,game.player);
}

/** Verfolgt eine Raster-Sichtlinie; Wände und hohe Schränke verdecken den Spieler. @param {object} game Spiel. @param {object} from Ausgang. @param {object} to Ziel. */
function clearSight(game,from,to) {
  let x=from.x,y=from.y;
  const dx=Math.abs(to.x-x),dy=-Math.abs(to.y-y),sx=x<to.x?1:-1,sy=y<to.y?1:-1;
  let error=dx+dy;
  while (x!==to.x || y!==to.y) {
    const doubled=2*error,oldX=x,oldY=y;
    if (doubled>=dy) { error+=dy; x+=sx; }
    if (doubled<=dx) { error+=dx; y+=sy; }
    if (x!==oldX && y!==oldY && (obscured(game,x,oldY) || obscured(game,oldX,y))) return false;
    if ((x!==to.x || y!==to.y) && obscured(game,x,y)) return false;
  }
  return true;
}

/** Unterscheidet hohe Sichthindernisse von niedrigen Tischen und der Schanktheke. @param {object} game Spiel. @param {number} x Spalte. @param {number} y Zeile. */
function obscured(game,x,y) {
  if (wall(game,x,y)) return true;
  return ['bookcase','cupboard','dresser','bottle-shelf'].includes(game.objectAt(x,y)?.art);
}
