/** Nimmt ein Fundstück genau einmal auf. @param {object} game Spiel. @param {object} object Fundobjekt. */
export function take(game, object) {
  if (game.roomState.taken.has(object.id)) return game.say(object.name, 'Das Fundstück ist schon eingepackt.');
  if (game.inventory.length >= 6) return game.say('Rucksack', 'Der Rucksack ist voll. Das Fundstück bleibt hier.','ui-denied');
  game.inventory.push(object.item); game.roomState.taken.add(object.id);
  game.say('Fundstück', `${object.item} gefunden.`); game.sounds.push('pickup');
}

/** Öffnet eine Truhe mit Gegenständen oder Münzen. @param {object} game Spiel. @param {object} object Truhe. */
export function chest(game, object) {
  if (game.roomState.taken.has(object.id)) return game.say('Truhe', 'Leer. Die Beute ist schon eingepackt.');
  if (object.item && game.inventory.length>=6) return game.say('Rucksack','Der Rucksack ist voll. Das Fundstück bleibt hier.','ui-denied');
  if (object.item) game.inventory.push(object.item);
  game.roomState.taken.add(object.id);
  game.sounds.push('chest');
  game.coins += object.coins || 0;
  game.say('Truhe', object.item ? `${object.item} eingepackt.` : `${object.coins || 0} Gildenmünzen gefunden.`);
  if (object.item || object.coins>0) game.sounds.push('treasure');
}

/** Sammelt eine später erneut lesbare Notiz. @param {object} game Spiel. @param {object} object Notizobjekt. */
export function note(game, object) {
  if (rememberNote(game,object.note)) game.sounds.push('pickup');
  if (!object.persistent) game.roomState.taken.add(object.id);
  game.say(object.note.title, object.note.text);
}

/** Legt eine Notiz genau einmal im vorhandenen Journal ab. @param {object} game Spiel. @param {object} entry Notizdaten. */
export function rememberNote(game,entry) {
  if (game.notes.find(findNote.bind(null,entry.id))) return false;
  game.notes.push({...entry}); return true;
}

/** Vergleicht eine Notizkennung. @param {string} id Gesuchte Kennung. @param {object} entry Notiz. */
function findNote(id, entry) { return entry.id === id; }
