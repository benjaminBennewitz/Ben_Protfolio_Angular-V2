import { wall } from './collision.js';
import { wandererOccupies } from './wanderers.js';
import { DIRECTIONS } from '../../core/config.js';

/** Sucht einen kurzen kollisionsfreien Hundeweg zum Ziel oder neben den Spieler. @param {object} game Spiel. @param {object} from Ausgangsfeld. @param {number[]} goal Ziel. @param {boolean} adjacent Neben dem Ziel anhalten. */
export function fetchPath(game,from,goal,adjacent=false) {
  const queue=[[from.x,from.y,[]]],seen=new Set([`${from.x},${from.y}`]);
  for (let cursor=0;cursor<queue.length && cursor<game.room.width*game.room.height;cursor++) {
    const [x,y,path]=queue[cursor];
    if (Math.abs(x-goal[0])+Math.abs(y-goal[1])<=(adjacent?1:0)) return path;
    for (const [dx,dy] of Object.values(DIRECTIONS)) {
      const key=`${x+dx},${y+dy}`;
      if (seen.has(key) || !fetchCellFree(game,x+dx,y+dy)) continue;
      seen.add(key); queue.push([x+dx,y+dy,[...path,[x+dx,y+dy]]]);
    }
  }
  return null;
}

/** Respektiert Wasser, Gebäude, andere Figuren und deren reservierte Start-/Zielfelder. @param {object} game Spiel. @param {number} x Spalte. @param {number} y Zeile. */
export function fetchCellFree(game,x,y) {
  if (wall(game,x,y) || wandererOccupies(game,x,y)) return false;
  if ((game.player.x===x && game.player.y===y) || (game.move?.x===x && game.move?.y===y)) return false;
  const object=game.objectAt(x,y); return !object || object.id==='dog';
}

/** Wählt eine freie kurze Wurfstrecke auf Land, die der Hund tatsächlich erreichen kann. @param {object} game Spiel. @param {object} dog Hund. */
export function throwTarget(game,dog) {
  const facing=DIRECTIONS[game.player.facing],directions=[facing,...Object.values(DIRECTIONS)];
  for (const [dx,dy] of directions) for (const distance of [4,3,2]) {
    let clear=true;
    for (let step=1;step<=distance;step++) if (!fetchCellFree(game,game.player.x+dx*step,game.player.y+dy*step)) clear=false;
    const goal=[game.player.x+dx*distance,game.player.y+dy*distance];
    if (!clear || goal[0]===dog.x && goal[1]===dog.y) continue;
    const path=fetchPath(game,dog,goal);
    if (path?.length>=2 && path.length<=8) return goal;
  }
  return null;
}
