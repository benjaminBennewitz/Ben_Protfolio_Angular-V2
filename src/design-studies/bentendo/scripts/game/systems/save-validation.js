import { validWorldTime } from './world-clock.js';
import { validCombatSave } from './combat-save.js';
import { validHealthSave } from './health-save.js';
import { wall } from './collision.js';
import { KEEPER_PATH } from '../data/village.js';

/** Prüft Format, Raumbezug und alle dauerhaft übernommenen Werte vor einer Änderung am Spiel. @param {object} game Spiel. @param {object} data Eingelesene Daten. */
export function validSave(game,data) {
  if (!validWorldTime(data?.worldMinutes)) return false;
  if (!data || data.version!==1 || !['female','male'].includes(data.avatar) || !game.rooms.has(data.room)) return false;
  if (!validHealthSave(game,data) || !validCombatSave(game,data)) return false;
  if (!data.player || !['up','down','left','right'].includes(data.player.facing)) return false;
  if (!Number.isSafeInteger(data.coins) || data.coins<0 || !Number.isFinite(data.time) || data.time<0) return false;
  if (!validFlags(data.flags) || !strings(data.inventory,6,100) || !validNotes(data.notes)) return false;
  if (!Array.isArray(data.states) || data.states.length>game.rooms.size) return false;
  const ids=new Set();
  for (const state of data.states) {
    if (!validRoom(game,state,data.flags) || ids.has(state.id)) return false;
    ids.add(state.id);
  }
  const room=game.rooms.get(data.room),point=data.player;
  return ids.has(data.room) && Number.isInteger(point.x) && Number.isInteger(point.y) && !wall({room,flags:data.flags},point.x,point.y);
}

/** Begrenzt einfache Textlisten und verhindert fremde Objekte in Inventar und Fundlisten. @param {unknown} value Liste. @param {number} count Höchstzahl. @param {number} length Textlänge. */
function strings(value,count,length) {
  if (!Array.isArray(value) || value.length>count) return false;
  for (const item of value) if (typeof item!=='string' || !item.length || item.length>length) return false;
  return true;
}

/** Akzeptiert nur flache Questwerte und die bekannte Vorrats-Prüfliste. @param {unknown} flags Questwerte. */
function validFlags(flags) {
  if (!flags || typeof flags!=='object' || Array.isArray(flags) || Object.keys(flags).length>100) return false;
  for (const [key,value] of Object.entries(flags)) {
    if (!/^[a-z][a-zA-Z0-9-]*$/u.test(key) || ['constructor','prototype','__proto__'].includes(key)) return false;
    if (key==='stockChecked') { if (!strings(value,3,30) || new Set(value).size!==value.length) return false; continue; }
    if (typeof value!=='boolean' && !(Number.isSafeInteger(value) && value>=0)) return false;
  }
  return true;
}

/** Verhindert beschädigte oder übergroße Journalinhalte. @param {unknown} notes Notizen. */
function validNotes(notes) {
  if (!Array.isArray(notes) || notes.length>100) return false;
  for (const note of notes) if (!note || !strings([note.id,note.title,note.text],3,6000)) return false;
  return true;
}

/** Prüft sämtliche gespeicherten Raumobjekte gegen ihre unveränderten Originaldefinitionen. @param {object} game Spiel. @param {object} state Raumstand. @param {object} flags Questwerte. */
function validRoom(game,state,flags) {
  const room=game.rooms.get(state?.id);
  if (!room || !strings(state.taken,room.objects.length,100) || !Array.isArray(state.blocks) || state.blocks.length!==(room.blocks || []).length) return false;
  const names=new Set();
  for (const id of state.taken) { if (!room.objects.some(knownId.bind(null,id))) return false; }
  for (const point of state.blocks) {
    const original=room.blocks.find(knownId.bind(null,point?.id));
    if (!original || names.has(point.id) || !validBlock(room,flags,original,point)) return false;
    names.add(point.id);
  }
  return !state.keeper || (state.id==='village' && Number.isInteger(state.keeper.index) && state.keeper.index>=0 && state.keeper.index<KEEPER_PATH.length && Number.isFinite(state.keeper.elapsed));
}

/** Vergleicht eine bekannte Objektkennung. @param {string} id Gesuchte Kennung. @param {object} object Originalobjekt. */
function knownId(id,object) { return object.id===id; }

/** Schließt Möbelpositionen in Wänden und außerhalb des Kartenrasters aus. @param {object} room Raum. @param {object} flags Questwerte. @param {object} original Originalmöbel. @param {object} point Neue Position. */
function validBlock(room,flags,original,point) {
  if (!Number.isInteger(point.x) || !Number.isInteger(point.y)) return false;
  for (let y=point.y;y<point.y+(original.h || 1);y++) for (let x=point.x;x<point.x+(original.w || 1);x++) if (wall({room,flags},x,y)) return false;
  return true;
}
