import { START_MINUTES } from './world-clock.js';
import { refreshQuestJournal } from './quest-journal.js';
import { captureCombat,restoreCombat } from './combat-save.js';
import { restoreHealth } from './health-save.js';
import { migrateSave } from './save-migrations.js';
import { validSave } from './save-validation.js';

export const SAVE_KEY='bentendo-dungeon-wanted-save-v1';

/** Erstellt ausschließlich dauerhafte Spielwerte, ohne Dialoge, Bedienmenüs oder laufende Tierbewegungen. @param {object} game Spiel. */
export function captureGame(game) {
  const states=[];
  for (const [id,state] of game.states) {
    const blocks=[];
    for (const block of state.blocks) blocks.push({id:block.id,x:block.x,y:block.y});
    const room={id,blocks,taken:[...state.taken]};
    if (state.keeper) room.keeper={index:state.keeper.index,elapsed:state.keeper.elapsed};
    states.push(room);
  }
  const point=game.seat?.exit || [game.move?.x ?? game.player.x,game.move?.y ?? game.player.y];
  return {version:1,dungeonRevision:3,combat:captureCombat(game),health:structuredClone(game.health),roomRevision:game.room.revision || 1,avatar:game.avatar,room:game.room.id,player:{x:point[0],y:point[1],facing:game.player.facing},flags:structuredClone(game.flags),inventory:[...game.inventory],notes:structuredClone(game.notes),coins:game.coins,time:game.time,worldMinutes:game.worldMinutes,states};
}

/** Lädt einen vollständig geprüften Stand und löst vorübergehende Bedien- und Bewegungszustände auf. @param {object} game Spiel. @param {object} data Gespeicherter Stand. */
export function restoreGame(game,data) {
  data=migrateSave(game,data);
  if (!validSave(game,data)) return false;
  game.reset(); game.flags=structuredClone(data.flags); game.inventory=[...data.inventory];
  game.notes=structuredClone(data.notes); game.coins=data.coins; game.avatar=data.avatar; game.time=data.time;
  game.worldMinutes=data.worldMinutes ?? START_MINUTES;
  game.characterIndex=data.avatar==='female'?0:1;
  for (const saved of data.states) restoreRoom(game,saved);
  game.travel(data.room,[data.player.x,data.player.y]); game.player.facing=data.player.facing;
  restoreHealth(game,data); restoreCombat(game,data); safeLanding(game); refreshQuestJournal(game); game.mode='world'; game.debugging=false; game.sounds=['ui-confirm']; return true;
}

/** Übernimmt nur Möbelkoordinaten an bekannten Originalobjekten und erhält gefundene Gegenstände als Set. @param {object} game Spiel. @param {object} saved Raumstand. */
function restoreRoom(game,saved) {
  const blocks=structuredClone(game.rooms.get(saved.id).blocks || []);
  for (const block of blocks) for (const point of saved.blocks) if (point.id===block.id) { block.x=point.x; block.y=point.y; }
  const state={blocks,taken:new Set(saved.taken)};
  if (saved.keeper) state.keeper={...saved.keeper,waiting:false};
  game.states.set(saved.id,state);
}

/** Setzt bei einem inzwischen am Speicherort stehenden Bewohner auf das nächste freie Bodenfeld um. @param {object} game Spiel. */
function safeLanding(game) {
  const queue=[[game.player.x,game.player.y]],seen=new Set();
  for (let cursor=0;cursor<queue.length;cursor++) {
    const [x,y]=queue[cursor],key=`${x},${y}`;
    if (seen.has(key) || x<0 || y<0 || x>=game.room.width || y>=game.room.height) continue;
    seen.add(key);
    if (!game.occupied(x,y)) { game.player.x=x; game.player.y=y; return; }
    for (const [dx,dy] of [[0,1],[1,0],[-1,0],[0,-1]]) queue.push([x+dx,y+dy]);
  }
}
