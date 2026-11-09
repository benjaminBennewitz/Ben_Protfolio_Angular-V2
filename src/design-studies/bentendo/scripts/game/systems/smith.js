import { RUSTY_SWORD,SHARP_SWORD } from '../data/items.js';
import { DAY_MINUTES } from './world-clock.js';

const PICKUP_MINUTE=7*60;

/** Bietet die Abgabe an oder bearbeitet einen bestehenden Auftrag. @param {object} game Spiel. @param {object} smith Gesellin. */
export function offerSharpening(game,smith) {
  if (game.room.id!=='village-workshop') return false;
  if (game.flags.smithDue) { collectSword(game,smith); return true; }
  if (!game.inventory.includes(RUSTY_SWORD)) return false;
  game.say(smith.name,'Schwert abgeben? Kostenlos. A: Ja · B: Abbrechen');
  (game.pages.at(-1) || game.message).onConfirm=leaveSword;
  return true;
}

/** Behält die Klinge bis zum nächsten Morgen in der Werkstatt. @param {object} game Spiel. */
function leaveSword(game) {
  if (game.room.id!=='village-workshop' || !game.consume(RUSTY_SWORD)) return;
  game.flags.smithDue=(Math.floor(game.worldMinutes/DAY_MINUTES)+1)*DAY_MINUTES+PICKUP_MINUTE;
  game.say('Gesellin','Das Schleifen dauert ein bisschen. Komm morgen wieder. In der Schenke kannst du bis zum Morgen schlafen.','gear');
}

/** Gibt die Klinge erst nach einer Bettruhe bis zur Abholzeit zurück. @param {object} game Spiel. @param {object} smith Gesellin. */
function collectSword(game,smith) {
  if (!game.flags.smithRested) return game.say(smith.name,'Die Klinge ist noch nicht abholbereit. Ruh dich in der Schenke aus und komm nach der Nacht wieder.');
  if (game.inventory.length>=6) return game.say(smith.name,'Dein Schwert ist fertig. Mach ein Fach im Rucksack frei, dann gebe ich es dir.');
  game.inventory.push(SHARP_SWORD);
  delete game.flags.smithDue; delete game.flags.smithRested;
  game.say(smith.name,'Der Rost ist runter. Die Schneide sollte jetzt auch dickes Hanfseil durchtrennen.','success-small');
}

/** Vermerkt die Bettruhe, wenn sie bis zur Abholzeit reicht. @param {object} game Spiel. */
export function recordSmithRest(game) {
  if (game.flags.temperDue && game.worldMinutes>=game.flags.temperDue) game.flags.temperRested=true;
  if (game.flags.smithDue && game.worldMinutes>=game.flags.smithDue) game.flags.smithRested=true;
}
