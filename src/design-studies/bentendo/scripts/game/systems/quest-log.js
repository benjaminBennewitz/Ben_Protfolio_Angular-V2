import { eastQuestEntries } from '../data/quest-east.js';
import { villageQuestEntries } from '../data/quest-village.js';
import { maraQuestEntries } from '../data/quest-mara.js';
import { wrapText } from './text.js';

export const BAG_TABS=['items','profile','quests'];

/** Leitet das Questbuch aus tatsächlichen Gesprächen, Funden und Aufgabenständen ab. @param {object} game Spiel. */
export function questEntries(game) { return [...villageQuestEntries(game),...maraQuestEntries(game),...eastQuestEntries(game)]; }

/** Liefert die stabile Auswahl auch nach einem neu hinzugekommenen Eintrag. @param {object} game Spiel. */
export function selectedQuest(game) {
  const entries=questEntries(game);
  game.questIndex=Math.max(0,Math.min(game.questIndex || 0,entries.length-1));
  return entries[game.questIndex] || null;
}

/** Vergleicht nur bekannte Fakten mit dem zuletzt ausdrücklich geöffneten Eintrag. @param {object} game Spiel. @param {object} entry Quest. */
export function questUnread(game,entry) { return game.flags[`questRead-${entry.id}`]!==entry.revision; }

/** Meldet neue Erkenntnisse am Reiter ohne Fundstellen aus unbekannten Aufgaben zu verraten. @param {object} game Spiel. */
export function hasUnreadQuests(game) {
  for (const entry of questEntries(game)) if (questUnread(game,entry)) return true;
  return false;
}

/** Formatiert ausschließlich bereits bekannte Personen, Orte und Beobachtungen. @param {object} entry Quest. */
export function questLines(entry) {
  const paragraphs=[entry.title,`Stand: ${entry.status==='done'?'Abgeschlossen':entry.ready?'Neue Entwicklung':'Offen'}`,`Personen: ${entry.people.join(', ') || 'Noch unbekannt'}`,`Orte: ${entry.places.join(', ') || 'Noch unbekannt'}`,...entry.clues];
  const lines=[];
  for (const paragraph of paragraphs) lines.push(...wrapText(paragraph,24),'');
  return lines;
}

/** Blättert in der Liste oder seitenweise in einem geöffneten Hinweis. @param {object} game Spiel. @param {string} direction Richtung. */
export function navigateQuests(game,direction) {
  const entry=selectedQuest(game);
  if (!entry) { if (direction==='up') game.bagTabFocus=true; return; }
  const change=['up','left'].includes(direction)?-1:1;
  if (game.questDetail) game.questPage=Math.max(0,Math.min(Math.ceil(questLines(entry).length/8)-1,game.questPage+change));
  else if (direction==='up' && game.questIndex===0) game.bagTabFocus=true;
  else if (['up','down'].includes(direction)) game.questIndex=Math.max(0,Math.min(questEntries(game).length-1,game.questIndex+change));
}

/** Öffnet eine Aufgabe oder heftet sie für die Kartenanzeige an. @param {object} game Spiel. */
export function activateQuest(game) {
  const entry=selectedQuest(game);
  if (!entry) return;
  if (game.questDetail) game.flags.questPinned=game.flags.questPinned===entry.id?0:entry.id;
  else { game.questDetail=true; game.questPage=0; game.flags[`questRead-${entry.id}`]=entry.revision; }
  game.sounds.push('ui-confirm');
}

/** Schließt zunächst die Detailansicht und anschließend den Quest-Reiter. @param {object} game Spiel. */
export function closeQuests(game) {
  if (game.questDetail) game.questDetail=false;
  else { game.bagTab='items'; game.bagTabFocus=false; }
  game.sounds.push('ui-back');
}

/** Beschreibt Auswahl, komplette Erkenntnisse und Seitenstand für die Textalternative. @param {object} game Spiel. */
export function questDescription(game) {
  const entry=selectedQuest(game);
  if (!entry) return 'Quests: Noch keine Hinweise gesammelt. Gespräche und Funde ergänzen das Questbuch. Oben zu den Reitern, B zum Beutel.';
  if (!game.questDetail) return `Quests: ${entry.title}. ${questUnread(game,entry)?'Neue Erkenntnis. ':''}Oben/unten wählt, A liest, B zum Beutel.`;
  const lines=questLines(entry),pages=Math.ceil(lines.length/8);
  return `Quest ${entry.title}. Seite ${game.questPage+1} von ${pages}. ${lines.slice(game.questPage*8,game.questPage*8+8).join(' ')} Pfeile blättern. A: ${game.flags.questPinned===entry.id?'lösen':'anheften'}. B zur Liste.`;
}

/** Merkt nur tatsächlich angesprochene Questpersonen und untersuchte Einstiegsobjekte. @param {object} game Spiel. @param {object} object Kontakt. */
export function recordQuestContact(game,object) {
  if (['keeper','miller','grandmother','mara','weaver-helper','storekeeper'].includes(object.id)) game.flags[`met-${object.id}`]=true;
  if (['village-keeper','village-branch','village-sluice'].includes(object.action)) game.flags.questMillKnown=true;
}
