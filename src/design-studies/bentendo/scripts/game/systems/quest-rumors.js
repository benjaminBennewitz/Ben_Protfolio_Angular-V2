import { rememberNote } from './loot.js';

export const QUEST_RUMORS={
  wheel:{id:'rumor-wheel',title:'Klappern am Kanal',text:'Am Wasserrad klappert etwas. Das Geräusch trägt bis zum Dorfplatz.'},
  moos:{id:'rumor-moos',title:'Erinnerungen im Gras',text:'Frau Moos und Jorin saßen früher oft im hohen Gras hinter ihrem Haus.'},
};

/** Hält ausschließlich tatsächlich ausgesprochene Questgerüchte mit ihrer Quelle im Journal fest. @param {object} game Spiel. @param {object} resident Sprecher. @param {string} text Gehörte Zeile. */
export function recordQuestRumor(game,resident,text) {
  for (const entry of Object.values(QUEST_RUMORS)) if (entry.text===text) rememberNote(game,{...entry,text:`${resident.name}: ${entry.text}`});
}
