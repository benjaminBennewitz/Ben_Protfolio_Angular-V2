import { QUEST_RUMORS } from '../systems/quest-rumors.js';
const SMALL_TALK={
  'forest-traveller':['Das war meine Stimme. Aber ich hatte nichts gerufen.','Die alten Forstpfähle sind mir lieber als frische Kreide.','Im Dorf brennt hoffentlich noch Licht.'],
  eda:['Der Wald ist nie still. Wenn er es wird, höre ich genauer hin.','Die Kreide zeigt zum Bach. Die Stiefel waren anderer Meinung.','Eine gute Rast beginnt mit einer vollen Flasche.'],
  mara:['Auf einer guten Karte ist auch Platz für Zweifel.','Die alten Pläne haben mehr Randnotizen als Wege.','Drei Kerben. Irgendjemand wollte, dass man sie findet.'],
  innkeeper:['Der Kessel pfeift. Diesmal gehört das zum Rezept.','Oben schläft es sich ruhiger als neben meiner Küche.','Einen Hocker frei lassen! Die Katze zählt als Gast.'],
  host:['Wenn der Wirt singt, ist die Suppe fertig. Leider singt er oft.','Ein warmes Essen macht noch keinen Helden. Aber satt.'],
  fisher:['Die Fische hören mit. Deshalb rede ich heute leise.','Der dickste Fisch ist natürlich der, den niemand gesehen hat.'],
  weaver:['Drei Knoten halten. Vier sehen nur fleißiger aus.','An den Bannern erkenne ich immer zuerst, woher der Wind kommt.'],
  carpenter:['Ein schiefer Stuhl ist noch lange kein Schaukelstuhl.','Holz arbeitet. Ich mache gerade Pause.'],
  reader:['Ich bin nur kurz raus. Das war vor drei Kapiteln.','Ein guter Reisebericht braucht weder Blasen noch nasse Stiefel.'],
  miller:['Mehlstaub findet jede Tasche. Auch geschlossene.','Die Mäuse hier halten sich für Lagerverwalter.'],
  grandmother:['Der Tee wird nicht besser, wenn man ihn nur anschaut.','Jorin hat nie zwei gleiche Socken gefunden.'],
  keeper:['Die Gilde hat mehr Schlüssel als funktionierende Schlösser.','Früher waren die Aushänge auch nicht leserlicher.'],
  'weaver-helper':['Dieser Faden hat definitiv angefangen.','Die Stoffe waren eben noch nach Farben sortiert.','Ich übe gerade gerade Nähte. Das zweite Gerade ist schwieriger.'],
  'workshop-helper':['Zweimal messen. Dann den Bleistift wiederfinden.','Die Späne fege ich nachher zusammen. Versprochen.','Der Hammer liegt genau da, wo ich zuletzt nicht gesucht habe.'],
  storekeeper:['Zwölf Säcke. Oder elf und eine sehr dicke Maus.','Die schweren Fässer stehen unten. Das habe ich gelernt.','Meine Liste ist ordentlich. Die Vorräte arbeiten noch daran.'],
};

/** Prüft echte Fundzustände auch in gerade nicht betretenen Räumen. @param {object} game Spiel. @param {string} room Raumkennung. @param {string} id Fundkennung. */
function missingFind(game,room,id) { return !game.states.get(room)?.taken.has(id); }

/** Liefert kurze Alltagszeilen und nur noch passende Hinweise auf tatsächliche Fundstellen. @param {object} game Spiel. @param {object} resident Bewohner. */
export function residentLines(game,resident) {
  const lines=[...(SMALL_TALK[resident.id] || ['Heute ist ein guter Tag für einen kleinen Spaziergang.','Ich wollte nur kurz etwas erledigen. Jetzt bin ich immer noch hier.'])];
  if (['innkeeper','host'].includes(resident.id) && missingFind(game,'village-inn','table-a')) lines.push('Frau Moos hat einen Zettel auf dem Gästetisch liegen lassen.');
  if (resident.id==='innkeeper' && missingFind(game,'village-inn','vase-1')) lines.push('Beim Putzen klapperte etwas in einer Vase hier in der Schenke.');
  if (resident.id==='reader' && missingFind(game,'village-market','shelf-a')) lines.push('Im Marktlager liegt ein alter Reisebericht im Regal.');
  if (resident.id==='weaver' && missingFind(game,'village','moos-cache')) lines.push(QUEST_RUMORS.moos.text);
  if (resident.id==='carpenter' && missingFind(game,'village-workshop','parts')) lines.push('In meiner Beschlagkiste klappert mehr als nur Werkzeug.');
  if (resident.id==='keeper' && missingFind(game,'village-guild-upper','vase-2')) lines.push('Oben im Archiv steckt sogar in einer Vase Papier.');
  if (resident.id==='keeper' && !game.flags?.waterFlowing) lines.push(QUEST_RUMORS.wheel.text);
  if (resident.id==='storekeeper' && missingFind(game,'village-market','shelf-a')) lines.push('Im Regal liegt ein Reisebericht. Zwischen all den Vorratslisten.');
  if (resident.id==='workshop-helper' && missingFind(game,'village-workshop','parts')) lines.push('Die Beschlagkiste klingt heute verdächtig nach Münzen.');
  if (game.flags?.eastOpen && ['host','innkeeper','storekeeper'].includes(resident.id)) lines.push('Der Ostpass ist wieder offen. Vielleicht kommen bald die Händler aus dem Wald.');
  if (game.flags?.eastPumpSurveyed && !game.flags.eastPipeRepaired && resident.id==='workshop-helper') lines.push('Die alten Rohrbögen habe ich in der Ersatzteilkiste bei den Beschlägen aufbewahrt.');
  return lines;
}

export const RESIDENT_REACTIONS={
  idle:['Wartest du auf jemanden?','Du stehst ja da wie ein Ortsschild.','Eine kleine Pause muss auch mal sein.','Falls du den Weg vergessen hast: Schau auf deine Karte.'],
  cupboard:['Suchst du etwas Bestimmtes?','Vorsichtig, ich habe das gerade erst eingeräumt.','Die Schublade bitte wieder zumachen.','Wenn du etwas findest, sag wenigstens Bescheid.'],
  vase:['Die Vase bitte ganz lassen.','Da wollte ich selbst noch einmal nachsehen.','Nicht schütteln. Der Staub gehört inzwischen dazu.'],
  chest:['Na, was versteckt sich da wohl?','Der Deckel klemmt manchmal. Ganz vorsichtig.','Nur schauen, nicht gleich die ganze Kiste mitnehmen.'],
  note:['Manchmal steht das Interessante zwischen den Zeilen.','Die alten Zettel erzählen mehr als die neuen Aushänge.','Falls das wichtig ist: Steck es ins Journal.'],
};
