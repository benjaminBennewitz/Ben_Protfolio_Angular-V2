/** Versorgt die Wartungshalle mit Strom. @param {object} game Spiel. */
export function hallConsole(game) {
  if (game.flags.hallPowered) return game.say('Verteiler', 'Die Anlage läuft. Die Lagertür ist offen.');
  if (!game.consume('Ersatzrune')) return game.say('Verteiler', 'Eine Rune fehlt. Suche im nördlichen Lager.');
  game.flags.hallPowered = true;
  game.sounds.push('rune','success-small'); game.say('Du', 'Die Rune sitzt. Hörst du? Die Anlage läuft wieder.');
}

/** Öffnet den Weg ins Materiallager. @param {object} game Spiel. */
export function hallExit(game) {
  if (!game.flags.hallPowered) return game.say('Lagertür', 'Ohne Strom bleibt die Tür zu.');
  game.travel('storage');
}

/** Schaltet einen Relaiszweig. @param {object} game Spiel. @param {object} object Relais. */
export function toggleSwitch(game, object) {
  const key = `switch${object.index}`;
  game.flags[key] = !game.flags[key]; game.sounds.push('gear');
  game.say(object.name, game.flags[key] ? 'Der Schalter ist eingeschaltet.' : 'Der Schalter ist ausgeschaltet.');
}

/** Prüft die sichtbare Schaltplanbelegung. @param {object} game Spiel. */
export function storageConsole(game) {
  const flags = game.flags;
  if (flags.storageOpen) return game.say('Prüfpult', 'Stromkreis stabil. Das Lagergitter ist offen.');
  if (flags.switch0 && !flags.switch1 && flags.switch2) {
    flags.storageOpen = true; game.sounds.push('door','success-quest');
    return game.say('Du', 'Antrieb und Steuerung haben Strom. Das Gitter fährt hoch.');
  }
  const reason = flags.switch1 ? 'Die Nebenleitung meldet einen Kurzschluss.' : !flags.switch0 ? 'Der Antrieb bekommt keinen Strom.' : 'Die Steuerung bekommt keinen Strom.';
  game.say('Prüfpult', `Test abgebrochen. ${reason} Der Schaltplan steht am linken Regal.`);
}

/** Lässt den Spieler mit der Kupplung in den Kanal. @param {object} game Spiel. */
export function storageExit(game) {
  if (!game.inventory.includes('Runenkupplung') && !game.flags.coupled) return game.say('Kanaltür', 'Erst die Runenkupplung aus der Truhe holen.');
  game.travel('steam');
}

/** Installiert die Kupplung. @param {object} game Spiel. */
export function steamConsole(game) {
  if (game.flags.coupled) return game.say('Druckregler', 'Die Kupplung sitzt. Die drei Ventile entlasten die Anlage.');
  if (!game.consume('Runenkupplung')) return game.say('Druckregler', 'Die isolierte Kupplung liegt im Materiallager.');
  game.flags.coupled = true; game.sounds.push('rune','success-small');
  game.say('Du', 'Die Kupplung sitzt. Jetzt lassen sich die Ventile öffnen.');
}

/** Entlastet eine Druckkammer. @param {object} game Spiel. @param {object} object Ventil. */
export function valve(game, object) {
  if (!game.flags.coupled) return game.say('Ventil', 'Der Druck hält es fest. Zuerst die Kupplung am Regler einsetzen.');
  const completed=game.flags.steamSafe;
  game.flags[`valve${object.valve}`] = true;
  game.flags.steamSafe = Boolean(game.flags.valve0 && game.flags.valve1 && game.flags.valve2);
  game.sounds.push('steam');
  if (game.flags.steamSafe && !completed) game.sounds.push('success-quest');
  game.say('Du', game.flags.steamSafe ? 'Alle Kammern sind entlastet. Der Ausgang ist frei.' : 'Ventil offen. Die Drucknadel sinkt.');
}

/** Führt nach erfolgreicher Wartung in die Stadt zurück. @param {object} game Spiel. */
export function steamExit(game) {
  if (!game.flags.steamSafe) return game.say('Ausgang', 'Die Verriegelung steht noch unter Druck.');
  game.travel('city', [5,27]);
}

/** Gibt den optionalen Pausenbecher zurück. @param {object} game Spiel. */
export function returnCup(game) {
  if (game.consume('Pausenbecher')) return game.say('Hausmeister', 'Mein Becher! Haste den auch gefunden. Jetzt fehlt nur Kaffee.');
  game.say('Hausmeister', 'Der Plan steht am linken Regal. I und III versorgen Antrieb und Steuerung.');
}
