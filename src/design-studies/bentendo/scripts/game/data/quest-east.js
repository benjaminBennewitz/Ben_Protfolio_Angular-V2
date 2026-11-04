import { knowsNote,questRecord,questMarker } from './quest-helpers.js';

/** Hält Ostpass, Waldspuren und die kleine Flaschenaufgabe getrennt und ohne vorzeitige Lösungen fest. @param {object} game Spiel. */
export function eastQuestEntries(game) { return [pumpQuest(game),trailQuest(game),canteenQuest(game),meadowQuest(game)].filter(Boolean); }

/** Nennt nur die untersuchte Schadstelle und die bereits belegte Werkstattzuordnung. @param {object} game Spiel. */
function pumpQuest(game) {
  const f=game.flags;
  if (!f.eastPumpKnown && !f.eastPumpSurveyed && !f.eastOpen) return null;
  const clues=['Eine Druckleitung hebt die Sperre am Ostpass. Die Werkstation liegt unmittelbar beim Pass.'];
  if (f.eastPumpSurveyed) clues.push('Ein Rohrbogen ist eingerissen. Die Ersatzteilfächer tragen das Zeichen der Dorfwerkstatt.');
  if (f.eastSpareTaken) clues.push('Ein passender Ersatzbogen ist aus der Werkstatt mitgenommen.');
  if (f.eastPipeRepaired) clues.push('Der Bogen sitzt dicht. Die sichtbaren Öffnungen müssen den Wasserweg bis zum Kolben verbinden.');
  if (f.eastOpen) clues.push('Der Druckkolben hat die Sperre angehoben. Der östliche Waldsaum ist erreichbar.');
  return questRecord({id:7,title:'Ein Weg nach Osten',people:['Mara'],places:['Ostpass-Werkstation',...(f.eastPumpSurveyed?['Werkstatt']:[])],clues,done:Boolean(f.eastOpen),markers:[questMarker(f.eastPumpSurveyed && !f.eastSpareTaken?'village-workshop':'village',f.eastPumpSurveyed && !f.eastSpareTaken?'workshop-helper':'east-hatch')]});
}

/** Führt voneinander unabhängige Beobachtungen zusammen, ohne eine verborgene Fundkoordinate zu markieren. @param {object} game Spiel. */
function trailQuest(game) {
  const f=game.flags,clues=[];
  for (const [id,text] of [['east-ribbon','Grauer Stoff am Waldsaum riecht nach Lampenöl.'],['east-tracks','Die Kreide und die tiefen Schleifspuren weisen in unterschiedliche Richtungen.'],['east-threshold','An einer verwurzelten Tür liegt das Zeichen unter der Rinde; eine Kerbe ist durchgestrichen.']]) if (knowsNote(game,id)) clues.push(text);
  if (knowsNote(game,'east-traveller-cloth')) clues.push('Tamo sah einen grauen Lappen an der Laterne. Bei den Dornen hörte er Stoff reißen.');
  if (!f.eastEdaMet && !clues.length) return null;
  if (f.eastEdaMet) clues.unshift('Eda sah jemanden mit einer schweren Kiste nordwärts ziehen. Die frische Kreide zeigt dagegen zum Bach.');
  if (f.eastTrailDone) clues.push('Eda hält den Bachpfeil für eine falsche Fährte. Mara könnte das eingeritzte Zeichen kennen.');
  if (f.eastTrailReported) clues.push('Mara erkennt ein altes Warnzeichen der Wegmacher. Hinter der Wurzelpforte liegt ihr Gewölbe.');
  const all=clues.length>=3 && ['east-ribbon','east-tracks','east-threshold'].every(knowsNote.bind(null,game));
  return questRecord({id:8,title:'Die falsche Fährte',people:[...(f.eastEdaMet?['Eda','Mara']:[]),...(f.eastTravellerMet?['Tamo']:[])],places:['Östlicher Waldsaum',...(game.states.has('east-clearing')?['Die Wurzelpforte']:[])],clues,done:Boolean(f.eastTrailReported),ready:all && f.eastEdaMet,markers:f.eastTrailDone?[questMarker('village-guild-upper','mara','!')]:all && f.eastEdaMet?[questMarker('east-wood','eda','!')]:[]});
}

/** Leitet die Trinkwasseraufgabe aus tatsächlicher Begegnung oder gefundener Flasche ab. @param {object} game Spiel. */
function canteenQuest(game) {
  const f=game.flags,found=game.inventory.includes('Feldflasche') || game.inventory.includes('Volle Feldflasche');
  if (!f.eastEdaMet && !found && !f.eastCanteenDone) return null;
  const clues=f.eastEdaMet?['Eda vermisst ihre Feldflasche. Bei den Dornen hat sie zuletzt Rast gemacht; sie klagt über Durst.']:['Eine leere Feldflasche trägt ein eingeritztes E.'];
  if (found) clues.push(game.inventory.includes('Volle Feldflasche')?'Die Flasche enthält frisches Brunnenwasser.':'Die gefundene Flasche ist leer.');
  if (f.eastBottleRecognized) clues.push('Eda erkennt ihre leere Flasche. Sie sehnt sich nach frischem Wasser aus dem Dorf.');
  if (f.eastCanteenDone) clues.push('Eda hat ihre Flasche zurück. Sie gab einen Feldverband und drei Münzen.');
  return questRecord({id:9,title:'Eine trockene Kehle',people:f.eastEdaMet?['Eda']:[],places:f.eastEdaMet?['Östlicher Waldsaum']:[],clues,done:Boolean(f.eastCanteenDone),ready:f.eastEdaMet && game.inventory.includes('Volle Feldflasche'),markers:f.eastEdaMet && game.inventory.includes('Volle Feldflasche')?[questMarker('east-wood','eda','!')]:[]});
}

/** Zeigt entdeckte Wegmacher-Spuren ohne die richtige Wegmarke vorzugeben. @param {object} game Spiel. */
function meadowQuest(game) {
  if (!game.flags.eastDoorStudied) return null;
  const clues=['Am Fuß der Wurzelpforte stehen drei unterschiedlich gezeichnete Wegmarken.'];
  if (game.flags.eastTrailReported) clues.push('Laut Maras Chronik schliffen die Wegmacher bewegliche Steine am Rand glatt.');
  if (game.flags.eastRootOpen) clues.push('Hinter der geöffneten Pforte führt die alte Wegmacherstation aus dem Wald.');
  if (knowsNote(game,'east-waymaker-ledger')) clues.push('Das Frachtbuch verzeichnet eine abgedeckte Kiste auf dem Weg über die Ostwiesen.');
  const done=knowsNote(game,'east-meadow-view');
  if (done) clues.push('An einem Pfahl auf den Ostwiesen klebt heller Staub. Die Pfahlreihe zieht ins Tal.');
  return questRecord({id:10,title:'Hinter der Wurzelpforte',people:game.flags.eastTrailReported?['Mara']:[],places:['Die Wurzelpforte',...(game.flags.eastRootOpen?['Alte Wegmacherstation','Ostwiesen']:[])],clues,done});
}
