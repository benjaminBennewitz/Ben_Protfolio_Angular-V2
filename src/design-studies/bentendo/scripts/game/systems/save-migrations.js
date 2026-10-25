import { migrateDungeonSave } from './dungeon-migrations.js';
import { wall } from './collision.js';

/** Versetzt ausschließlich alte Kammerstände von inzwischen überfluteten Feldern zum sicheren Eingang. @param {object} game Spiel. @param {object} data Unveränderter gelesener Stand. */
export function migrateSave(game,data) {
  data=migrateDungeonSave(game,data);
  if (data?.room!=='mara-cave' || (data.roomRevision ?? 1)>=2) return data;
  const room=game.rooms.get(data.room),x=data.player?.x,y=data.player?.y;
  if (!room || !Number.isInteger(x) || !Number.isInteger(y)) return data;
  const oldFloor=(x>=1 && x<=20 && y>=9 && y<=14)||(x>=6 && x<=19 && y>=3 && y<=11)||(x>=12 && x<=19 && y>=1 && y<=5);
  const oldWater=x>=10 && x<=13 && y>=5 && y<=7;
  if (!oldFloor || oldWater || !wall({room,flags:data.flags},x,y)) return data;
  return {...data,roomRevision:2,player:{...data.player,x:room.spawn[0],y:room.spawn[1]}};
}
