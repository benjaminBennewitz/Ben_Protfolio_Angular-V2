import { knowsNote,questRecord,questMarker } from './quest-helpers.js';

/** Sammelt ausschließlich bereits begonnene Dorfgeschichten und echte Fundstücke. @param {object} game Spiel. */
export function villageQuestEntries(game) {
  return [millQuest(game),broochQuest(game),spoolQuest(game),stockQuest(game)].filter(Boolean);
}

/** Verknüpft das beobachtete Rad mit bereits bekannten Aussagen, ohne den Hebelablauf vorzugeben. @param {object} game Spiel. */
function millQuest(game) {
  const f=game.flags,heard=knowsNote(game,'rumor-wheel');
  if (!f.questMillKnown && !f.branchSeen && !f.branchCleared && !f.waterFlowing && !f['met-miller'] && !heard) return null;
  const clues=['Das Wasserrad stand still; auch die Gildentür klemmte.'];
  if (f.questMillKnown || f['met-miller'] || heard) clues.push('Am Rad klappert etwas zwischen den Speichen.');
  if (f.branchSeen) clues.push('Ein langer Ast steckt zwischen Ufer und Rad.');
  if (f.branchCleared) clues.push(f.waterFlowing?'Der Ast wurde aus dem Rad gezogen.':'Der Ast ist entfernt. Das Rad wird noch von einer Bremse gehalten.');
  if (f.waterFlowing) clues.push('Das Rad läuft wieder. Der Hausmeister ist auf dem Weg zur Gilde.');
  if (f.guildOpen) clues.push('Der Hausmeister hat die Gilde geöffnet.');
  return questRecord({id:1,title:'Das stille Wasserrad',people:f['met-keeper']?['Hausmeister']:[],places:['Mühlkanal'],clues,done:Boolean(f.guildOpen),markers:f.branchSeen?[]:[questMarker('village','mill-area')]});
}

/** Hält Familiengeschichte und vermutetes Versteck getrennt vom tatsächlichen Truhenstandort. @param {object} game Spiel. */
function broochQuest(game) {
  const f=game.flags,request=knowsNote(game,'moos-request'),trail=knowsNote(game,'moos-trail'),found=knowsNote(game,'moos-letter') || game.inventory.includes('Blaue Brosche'),rumor=knowsNote(game,'rumor-moos');
  if (!request && !trail && !found && !rumor && !f['met-grandmother'] && !f.memoryReturned) return null;
  const known=request || rumor || f['met-grandmother'] || f.memoryReturned,clues=[];
  if (request || f['met-grandmother']) clues.push('Frau Moos vermisst ein blaues Erinnerungsstück von Jorin.');
  if (trail) clues.push('Jorin schrieb über eine Reisekiste und ihr gemeinsames Versteck hinter dem Haus.');
  if (rumor) clues.push('Am Haus der Familie Moos haben früher beide oft im hohen Gras gesessen.');
  if (found) clues.push('Eine blaue Brosche und Jorins Brief sind gefunden.');
  if (f.memoryReturned) clues.push('Frau Moos hat ihr Erinnerungsstück wieder.');
  const ready=known && game.inventory.includes('Blaue Brosche') && !f.memoryReturned;
  return questRecord({id:2,title:request || found || f['met-grandmother'] || f.memoryReturned?'Die blaue Erinnerung':'Jorins Reiseerinnerung',people:known?['Frau Moos','Jorin']:trail || found?['Jorin']:[],places:known?['Haus der Familie Moos']:[],clues,ready,done:Boolean(f.memoryReturned),markers:ready?[questMarker('village-home','grandmother','!')]:trail && known || rumor?[questMarker('village','moos-area')]:[]});
}

/** Nennt nur den überlieferten letzten Arbeitsort und niemals den richtigen Schrank. @param {object} game Spiel. */
function spoolQuest(game) {
  const f=game.flags,found=game.inventory.includes('Garnspule'),known=f.spoolStarted || f.spoolDone;
  if (!known && !found) return null;
  const clues=[];
  if (known) clues.push('Dem Weberlehrling fehlt eine Garnspule. Zuletzt hat er in der Werkstatt Maß genommen.');
  if (found) clues.push('Eine feine Garnspule liegt im Rucksack.');
  if (f.spoolDone) clues.push('Die Spule ist wieder in der Webstube.');
  return questRecord({id:3,title:'Der fehlende Faden',people:known?['Weberlehrling']:[],places:known?['Webstube','Werkstatt']:[],clues,ready:known && found,done:Boolean(f.spoolDone),markers:known?[questMarker(found?'village-weaver':'village-workshop',found?'weaver-helper':'workshop-area',found?'!':'?')]:[]});
}

/** Dokumentiert beauftragte Kontrollen und zählt ausschließlich tatsächlich geprüfte Vorräte. @param {object} game Spiel. */
function stockQuest(game) {
  const f=game.flags;
  if (!f.stockStarted && !f.stockDone) return null;
  const count=f.stockChecked?.length || 0,clues=['Die Lagerwartin sorgt sich um Feuchtigkeit in der nächsten Lieferung.',`Geprüfte Vorräte: ${count} von 3.`];
  if (count===3) clues.push('Alle vorgesehenen Vorräte sind trocken und vollständig.');
  if (f.stockDone) clues.push('Der Bericht ist abgegeben; die Lieferung kann vorbereitet werden.');
  return questRecord({id:4,title:'Die nächste Lieferung',people:['Lagerwartin'],places:['Marktlager'],clues,ready:count===3 && !f.stockDone,done:Boolean(f.stockDone),markers:count===3?[questMarker('village-market','storekeeper','!')]:[]});
}
