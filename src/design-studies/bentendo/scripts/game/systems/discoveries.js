import { rememberNote } from './loot.js';
import { DISCOVERY_NOTES } from '../data/discoveries.js';

/** Durchsucht einen Behälter atomar, ohne doppelte Beute oder verlorene volle-Rucksack-Funde. @param {object} game Spiel. @param {object} object Fundstelle. */
export function search(game,object) {
  const found=object.discovery;
  if (game.roomState.taken.has(object.id)) return revisit(game,object);
  if (found.item && game.inventory.length>=6) return game.say('Rucksack','Der Rucksack ist voll. Der Fund bleibt vollständig hier.');
  if (found.item) game.inventory.push(found.item);
  game.coins+=found.coins || 0;
  if (found.note) rememberNote(game,found.note);
  game.roomState.taken.add(object.id);
  if (object.kind==='discovery-chest' || object.art==='chest') game.sounds.push('chest');
  const lines=[found.text || 'Zwischen den Sachen liegt ein beschriebenes Blatt.'];
  if (found.item) lines.push(`${found.item} eingepackt.`);
  if (found.coins) lines.push(`${found.coins} Gildenmünzen eingepackt.`);
  if (found.note) lines.push(`${found.note.title}: ${found.note.text} Die Notiz liegt jetzt im Journal.`);
  game.say(object.name,lines.join(' '));
  if (found.item || found.coins || found.note) game.sounds.push(object.kind==='discovery-chest' || object.art==='chest'?'treasure':'pickup');
}

/** Hält bereits gelesene Fundtexte zugänglich und kennzeichnet leere Behälter eindeutig. @param {object} game Spiel. @param {object} object Fundstelle. */
function revisit(game,object) {
  const found=object.discovery;
  game.say(object.name,found.note?`Schon durchsucht. ${found.note.title}: ${found.note.text}`:found.empty || 'Schon durchsucht. Hier liegt nichts mehr zum Mitnehmen.');
}

/** Reagiert auf die kleine Suchgeschichte und zwei passende Krimskrams-Tauschmöglichkeiten. @param {object} game Spiel. @param {object} object Bewohner. */
export function discoveryConversation(game,object) {
  if (object.id==='grandmother') { visitMoos(game); return true; }
  const trades={carpenter:['Messingknopf',2,'Der passt genau zu meiner Arbeitstasche. Hier, zwei Münzen für die Mühe.'],fisher:['Glasperle',1,'Meine Glasperle! Damit sehe ich den Schwimmer wieder besser. Eine Münze für dich.']};
  const trade=trades[object.id];
  if (!trade || game.flags[`traded-${object.id}`] || !game.inventory.includes(trade[0])) return false;
  game.consume(trade[0]); game.coins+=trade[1]; game.flags[`traded-${object.id}`]=true;
  game.say(object.name,trade[2]); game.sounds.push('pickup'); return true;
}

/** Ermöglicht die Rückgabe auch dann, wenn die Truhe vor den Hinweisen gefunden wurde. @param {object} game Spiel. */
function visitMoos(game) {
  if (game.flags.memoryReturned) return game.say('Frau Moos','Die Brosche liegt wieder bei meinen Reiseandenken. Danke, dass du Jorins Brief mitgebracht hast.');
  if (!game.inventory.includes('Blaue Brosche')) return game.say('Frau Moos','Meine blaue Brosche fehlt mir. Jorin hat sie mir auf einer unserer Reisen geschenkt. Ich habe in der Schenke einen Zettel hinterlassen. Seine alten Reiseberichte hat er damals mit den Kisten ins Marktlager gebracht.');
  game.consume('Blaue Brosche'); game.flags.memoryReturned=true; game.coins+=8;
  rememberNote(game,DISCOVERY_NOTES.request);
  for (const entry of game.notes) if (entry.id===DISCOVERY_NOTES.request.id) entry.text='Erledigt: Frau Moos hat ihre blaue Brosche und Jorins Brief wieder. Die Erinnerung an ihre gemeinsamen Reisen ist zurück. Belohnung: acht Gildenmünzen.';
  game.say('Frau Moos','Jorins Brosche! Ich hatte vergessen, dass wir sie in die alte Reisekiste gelegt haben. Und sein Brief ... Danke. Nimm diese acht Gildenmünzen als Dankeschön.','success-quest');
}
