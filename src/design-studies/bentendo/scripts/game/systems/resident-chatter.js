import { nextTavernExchange } from './tavern-conversations.js';
import { recordQuestRumor } from './quest-rumors.js';
import { residentLines } from '../data/resident-lines.js';
import { wrapText } from './text.js';

/** Bereitet den zweizeiligen Lesebereich mit zusätzlicher Zeit für längere Sprüche vor. @param {object} resident Sprecher. @param {string} text Spruch. */
export function createResidentSpeech(resident,text) {
  const lines=wrapText(text,22),duration=Math.max(5,4+Math.max(0,lines.length-2)*2.4);
  return {speakerId:resident.id,speaker:resident.name,text,lines,duration,remaining:duration};
}

/** Wählt ohne unmittelbare Wiederholung und merkt sich die letzte Zeile pro Bewohner. @param {object} game Spiel. @param {object} resident Bewohner. @param {Function} random Zufallsquelle. */
export function chooseResidentLine(game,resident,random=Math.random) {
  const key=`${game.room.id}:${resident.id}`,previous=game.residentHistory.get(key);
  const pool=residentLines(game,resident),alternatives=pool.filter(differentLine.bind(null,previous));
  const lines=alternatives.length?alternatives:pool;
  const text=lines[Math.floor(random()*lines.length)]; game.residentHistory.set(key,text); recordQuestRumor(game,resident,text); return text;
}

/** Vergleicht die letzte Gesprächszeile. @param {string} previous Vorherige Zeile. @param {string} line Kandidat. */
function differentLine(previous,line) { return previous!==line; }

/** Erhält bei der ersten Ansprache den Einführungstext und variiert weitere Gespräche. @param {object} game Spiel. @param {object} resident Bewohner. @param {string} fallback Einführung. */
export function residentReply(game,resident,fallback) {
  const key=`${game.room.id}:${resident.id}:greeted`;
  if (!game.residentHistory.has(key)) { game.residentHistory.set(key,true); return fallback; }
  return chooseResidentLine(game,resident);
}

/** Plant gelegentliche Äußerungen naher Bewohner ohne Dialogpause oder zusätzliche Timer. @param {object} game Spiel. @param {number} dt Aktive Spielzeit. @param {Function} random Zufallsquelle. */
export function updateResidentChatter(game,dt,random=Math.random) {
  if (game.message || game.bagOpen || game.mapOpen || game.journalOpen || game.locationNotice) return;
  if (game.ambientSpeech) return advanceAmbientSpeech(game,dt);
  game.chatterWait-=dt;
  if (game.chatterWait>0) return;
  game.chatterWait=12+random()*10;
  const residents=game.objects.filter(nearbyResident.bind(null,game));
  if (!residents.length) return;
  const exchange=nextTavernExchange(game,residents,random);
  const resident=exchange?.resident || residents[Math.floor(random()*residents.length)];
  game.ambientSpeech=createResidentSpeech(resident,exchange?.text || chooseResidentLine(game,resident,random));
  if (exchange?.reply) game.ambientSpeech.reply=exchange.reply;
}

/** Begrenzt Selbstgespräche auf Bewohner in Sichtweite und ruhende Hausmeister. @param {object} game Spiel. @param {object} resident Kandidat. */
function nearbyResident(game,resident) {
  if (resident.id==='keeper' && game.room.id==='village' && game.flags.waterFlowing && !game.flags.guildOpen) return false;
  return ['resident','host','npc'].includes(resident.kind) && Math.abs(resident.x-game.player.x)<=4 && Math.abs(resident.y-game.player.y)<=3;
}

/** Gibt auf einen gelesenen Spruch nach kurzer Pause die passende Antwort frei. @param {object} game Spiel. @param {number} dt Aktive Sekunden. */
function advanceAmbientSpeech(game,dt) {
  game.ambientSpeech.remaining-=dt;
  if (game.ambientSpeech.remaining>0) return;
  if (game.ambientSpeech.reply) { game.tavernReply=game.ambientSpeech.reply; game.chatterWait=1.2; }
  game.ambientSpeech=null;
}
