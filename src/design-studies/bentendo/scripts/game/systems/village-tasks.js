import { rememberNote } from './loot.js';

const STOCK_CHECKS={'barrel-e':'Lieferfass links','barrel-f':'Lieferfass rechts','shelf-b':'Vorratsschrank links'};

/** Hält die beiden zusätzlichen Dorfaufgaben im vorhandenen Journal aktuell. @param {object} game Spiel. @param {string} id Kennung. @param {string} title Titel. @param {string} text Status. */
function taskNote(game,id,title,text) {
  rememberNote(game,{id,title,text});
  for (const entry of game.notes) if (entry.id===id) entry.text=text;
}

/** Startet oder beendet die Garnsuche und die Vorratskontrolle über normale Gespräche. @param {object} game Spiel. @param {object} person Bewohner. */
export function villageTaskConversation(game,person) {
  if (person.id==='weaver-helper' && !game.flags.spoolDone) { spoolTask(game,person); return true; }
  if (person.id==='storekeeper' && !game.flags.stockDone) { stockTask(game,person); return true; }
  return false;
}

/** Erlaubt die Rückgabe der Garnspule auch vor dem ersten Auftrag. @param {object} game Spiel. @param {object} person Weberlehrling. */
function spoolTask(game,person) {
  game.flags.spoolStarted=true;
  if (game.consume('Garnspule')) {
    game.flags.spoolDone=true; game.coins+=4;
    taskNote(game,'task-spool','Die vermisste Garnspule','Erledigt: Die Garnspule ist wieder in der Webstube. Der Lehrling kann weiterarbeiten. Belohnung: vier Gildenmünzen.');
    game.say(person.name,'Meine Garnspule! Ohne die wird aus dem Saum nichts. Danke, hier sind vier Gildenmünzen.','success-quest'); return;
  }
  taskNote(game,'task-spool','Die vermisste Garnspule','Dem Weberlehrling fehlt seine Garnspule. Beim letzten Abmessen war er in der Werkstatt.');
  game.say(person.name,'Ohne meine feine Garnspule wird aus diesem Saum nichts. Vorhin war ich noch zum Abmessen in der Werkstatt. Danach hatte ich die Hände voller Stoff.');
}

/** Lässt drei konkrete Vorräte prüfen und belohnt erst den anschließenden Bericht. @param {object} game Spiel. @param {object} person Lagerwartin. */
function stockTask(game,person) {
  game.flags.stockStarted=true; game.flags.stockChecked ||= [];
  if (game.flags.stockChecked.length===3) {
    game.flags.stockDone=true; game.coins+=5;
    taskNote(game,'task-stock','Vorratskontrolle','Erledigt: Beide Lieferfässer und der Vorratsschrank links wurden geprüft. Bericht bei der Lagerwartin abgegeben. Belohnung: fünf Gildenmünzen.');
    game.say(person.name,'Alles trocken und vollständig? Dann kann die Lieferung morgen raus. Danke für die Kontrolle. Fünf Gildenmünzen für dich.','success-quest'); return;
  }
  updateStockNote(game);
  game.say(person.name,`Hilfst du mir bei der Vorratskontrolle? Prüfe die beiden Lieferfässer rechts und den Vorratsschrank links. Jede Prüfung erhält ein Häkchen. Was du schon vor unserem Gespräch geprüft hast, zählt ebenfalls. Danach kommst du zu mir. Bisher geprüft: ${game.flags.stockChecked.length} von 3.`);
}

/** Verbucht jede tatsächliche Prüfung einmalig, ohne bereits erfolgte Suchfunde zu verändern. @param {object} game Spiel. @param {object} object Untersuchte Einrichtung. */
export function recordVillageTask(game,object) {
  if (game.room.id!=='village-market' || game.flags.stockDone || !STOCK_CHECKS[object.id]) return;
  const checked=game.flags.stockChecked ||= [];
  if (checked.includes(object.id)) return;
  checked.push(object.id);
  if (game.flags.stockStarted) updateStockNote(game);
  if (game.flags.stockStarted && checked.length===3) game.sounds.push('success-small');
}

/** Zeigt Fortschritt und noch offene Prüfpunkte im Journal. @param {object} game Spiel. */
function updateStockNote(game) {
  const checked=game.flags.stockChecked || [],missing=[];
  for (const [id,name] of Object.entries(STOCK_CHECKS)) if (!checked.includes(id)) missing.push(name);
  taskNote(game,'task-stock','Vorratskontrolle',`Geprüft: ${checked.length}/3. ${missing.length?`Noch prüfen: ${missing.join(', ')}.`:'Alles geprüft. Gib deinen Bericht bei der Lagerwartin ab.'}`);
}

/** Kennzeichnet ausschließlich tatsächlich geprüfte Vorratsmöbel mit dem vorhandenen Suchhäkchen. @param {object} game Spiel. @param {object[]} objects Aktuelle Weltobjekte. */
export function taskObjects(game,objects) {
  if (game.room.id!=='village-market') return objects;
  const result=[],checked=game.flags.stockChecked || [];
  for (const object of objects) {
    if (!STOCK_CHECKS[object.id]) { result.push(object); continue; }
    const done=checked.includes(object.id);
    result.push({...object,searched:done || object.searched,hint:done?'geprüft':object.hint});
  }
  return result;
}

/** Bestätigt echte Prüfungen unmittelbar, auch bei wiederholtem Untersuchen. @param {object} game Spiel. @param {object} object Vorratsmöbel. @param {string} text Ursprünglicher Möbeltext. */
export function stockInspectionText(game,object,text) {
  if (game.room.id!=='village-market' || !STOCK_CHECKS[object.id]) return text;
  const checked=game.flags.stockChecked || [];
  if (!checked.includes(object.id)) return text;
  const status=game.flags.stockStarted?`Vorratskontrolle: ${checked.length} von 3 geprüft.`:'Für die Vorratskontrolle vorgemerkt.';
  return `${status} ${STOCK_CHECKS[object.id]}: geprüft und in Ordnung. ${text || ''}`;
}

/** Erneuert ältere Aufgabentexte, ohne Fundfortschritt oder Belohnungen erneut auszulösen. @param {object} game Spiel. */
export function refreshVillageQuestNotes(game) {
  if (game.flags.spoolStarted || game.flags.spoolDone) taskNote(game,'task-spool','Die vermisste Garnspule',game.flags.spoolDone?'Erledigt: Die Garnspule ist wieder in der Webstube.':'Dem Weberlehrling fehlt seine Garnspule. Beim letzten Abmessen war er in der Werkstatt.');
  if (game.flags.stockStarted && !game.flags.stockDone) updateStockNote(game);
}
