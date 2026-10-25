import { TAVERN_CONVERSATIONS } from '../data/tavern-company.js';

/** Plant kurze Frage-Antwort-Wechsel ausschließlich zwischen nahen, tatsächlich anwesenden Gästen. @param {object} game Spiel. @param {object[]} residents Sichtbare Gesprächspartner. @param {Function} random Zufallsquelle. */
export function nextTavernExchange(game,residents,random) {
  if (game.room.id!=='village-inn') return null;
  if (game.tavernReply) return takeReply(game,residents);
  if (random()>.7) return null;
  const options=TAVERN_CONVERSATIONS.filter(/** Erkennt anwesende Gesprächspaare. @param {object} pair Gespräch. */ pair=>pair.people.every(/** Prüft die Sichtnähe des Partners. @param {string} id Person. */ id=>residents.some(/** Vergleicht die Figur. @param {object} resident Gast. */ resident=>resident.id===id)));
  if (!options.length) return null;
  const pair=options[Math.floor(random()*options.length)],key=`tavern-pair:${pair.people.join(':')}`;
  const previous=game.residentHistory.get(key),lines=pair.lines.filter(/** Vermeidet die vorige Variante. @param {string[]} line Wechsel. */ line=>line[0]!==previous);
  const exchange=lines[Math.floor(random()*lines.length)]; game.residentHistory.set(key,exchange[0]);
  const resident=residents.find(/** Findet den ersten Sprecher. @param {object} person Gast. */ person=>person.id===pair.people[0]);
  return {resident,text:exchange[0],reply:{id:pair.people[1],text:exchange[1]}};
}

/** Verwirft Antworten verschwundener Gäste, statt eine unsichtbare Figur sprechen zu lassen. @param {object} game Spiel. @param {object[]} residents Nahe Bewohner. */
function takeReply(game,residents) {
  const reply=game.tavernReply; game.tavernReply=null;
  const resident=residents.find(/** Erkennt den Antwortenden. @param {object} person Gast. */ person=>person.id===reply.id);
  return resident?{resident,text:reply.text}:null;
}
