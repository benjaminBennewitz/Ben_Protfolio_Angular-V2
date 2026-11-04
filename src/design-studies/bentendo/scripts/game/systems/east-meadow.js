import { ROOT_MARKS } from '../data/east-meadow.js';
import { rememberNote } from './loot.js';

const LEDGER={id:'east-waymaker-ledger',title:'Letzter Eintrag im Frachtbuch',text:'Eine abgedeckte Kiste ging bei trockenem Boden über die Wiesen. Am nächsten Morgen kam der Träger allein zurück. Neben dem Eintrag ist ein runder Abdruck aus hellem Staub.'};
const VIEW={id:'east-meadow-view',title:'Hinter dem Wald',text:'Im flachen Wasser spiegeln sich Wolken. Weit hinter den Blumen läuft eine Reihe alter Pfähle ins Tal. Am nächsten Pfahl klebt heller Staub, wie auf der Seite im Frachtbuch.'};

/** Zeigt jede Wegmarke zuerst; ein erneuter Druck versucht ihre Mechanik. @param {object} game Spiel. @param {object} object Wegmarke. */
export function tryRootMark(game,object) {
  if (!game.flags.eastDoorStudied) return game.say(object.name,'Der Stein sitzt am Fuß der verwurzelten Pforte. Von hier aus erkennst du nicht, womit er verbunden ist.');
  if (game.flags.eastRootOpen) return game.say(object.name,'Das Gegengewicht hält die Pforte offen.');
  const mark=ROOT_MARKS[object.index],key='eastMark'+object.index;
  if (!game.flags[key]) {
    game.flags[key]=true;
    return game.say(mark.name,mark.text+' Erneut mit A drücken.');
  }
  if (mark.id!=='root-notch') return game.say(mark.name,'Der Stein gibt nicht nach. Hinter der Pforte bleibt es still.','ui-denied');
  game.flags.eastRootOpen=true;
  game.say('Die Wurzelpforte','Der Stein gibt nach. Über dir rasselt eine Kette. Die Flügel gleiten auseinander und ein heller Luftzug kommt dir entgegen.','success-quest');
}

/** Hält die Frachtspur im Journal fest. @param {object} game Spiel. */
export function readWaymakerLedger(game) {
  game.say(LEDGER.title,LEDGER.text,rememberNote(game,LEDGER)?'pickup':'talk');
}

/** Beschließt den Waldabschnitt mit einer Beobachtung in der neuen Landschaft. @param {object} game Spiel. */
export function viewEastMeadow(game) {
  const known=game.notes.some(/** Erkennt den Frachtbucheintrag. @param {object} note Notiz. */ note=>note.id===LEDGER.id);
  const entry=known?VIEW:{...VIEW,text:'Im flachen Wasser spiegeln sich Wolken. Weit hinter den Blumen läuft eine Reihe alter Pfähle ins Tal. Am nächsten Pfahl klebt heller Staub.'};
  rememberNote(game,entry);
  game.say('Die Ostwiesen',entry.text);
}
