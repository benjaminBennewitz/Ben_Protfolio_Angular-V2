import { questRecord,questMarker } from './quest-helpers.js';

/** Beschreibt den Passweg und die ausschließlich nachts lösbare Leuchtkernsuche. @param {object} game Spiel. */
export function westQuests(game) {
  const f=game.flags,entries=[];
  if (f.westVisited) entries.push(questRecord({id:15,title:'Über den Westpass',people:['Iva'],places:['Westpass','Alte Schutzhütte'],clues:[f.frostGateSeen?'Die Frostpforte wurde erreicht. Dahinter liegt das nächste Gewölbe der Wassermeister.':'Die Pfähle führen über den Windgrat. In der Schutzhütte lässt sich die Kälte abschütteln.'],done:Boolean(f.frostGateSeen),markers:[questMarker('west-ridge','gate')]}));
  if (f.westNightQuest) entries.push(lanternQuest(game));
  return entries;
}

/** Hält Nachtzeiten und den passenden Rückgabeort ausdrücklich im Questbuch fest. @param {object} game Spiel. */
function lanternQuest(game) {
  const f=game.flags,found=f.westLensRecovered;
  return questRecord({id:16,title:'Ein Licht für Heimkehrer',people:['Iva'],places:['Schenke','Windgrat'],clues:[f.westLightFixed?'Mit Iva ist die Passlaterne repariert. Sie gab fünf Münzen.':found?'Der Leuchtkern ist geborgen. Iva wartet nachts zwischen 20 und 6 Uhr im schiefen Kessel.':'Iva vermisst den Kern der Wegleuchte am Windgrat. Sein Leuchten ist nur nachts zwischen 20 und 6 Uhr erkennbar. Das Bett in der Schenke erlaubt Schlaf bis zur Nacht.'],ready:Boolean(found),done:Boolean(f.westLightFixed),markers:[questMarker(found?'village-inn':'west-ridge',found?'iva':'night-marker',found?'!':'?')]});
}
