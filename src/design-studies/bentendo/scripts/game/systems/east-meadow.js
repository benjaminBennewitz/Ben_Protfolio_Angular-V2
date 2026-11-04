import { isSword,RUSTY_SWORD,SHARP_SWORD } from '../data/items.js';
import { ROOT_MARKS,WAYMAKER_LEDGER } from '../data/east-meadow.js';
import { rememberNote } from './loot.js';

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

/** Beschließt den Waldabschnitt mit einer Beobachtung in der neuen Landschaft. @param {object} game Spiel. */
export function viewEastMeadow(game) {
  const known=game.notes.some(/** Erkennt den Frachtbucheintrag. @param {object} note Notiz. */ note=>note.id===WAYMAKER_LEDGER.id);
  const entry=known?VIEW:{...VIEW,text:'Im flachen Wasser spiegeln sich Wolken. Weit hinter den Blumen läuft eine Reihe alter Pfähle ins Tal. Am nächsten Pfahl klebt heller Staub.'};
  rememberNote(game,entry);
  game.say('Die Ostwiesen',entry.text);
}

/** Hält die Beobachtungen an Wehr und Brücke getrennt. @param {object} game Spiel. @param {object} object Bauwerk. */
export function inspectMeadowStream(game,object) {
  const bridge=object.id==='stream-bridge',open=game.flags.eastStreamOpen;
  game.flags[bridge?'eastBridgeSeen':'eastWeirSeen']=true;
  if (bridge) return game.say(object.name,open?'Die Holzbohlen liegen jetzt auf Höhe des Wegs. Unter dir fließt der Bach.':'Die Schwimmkörper liegen zwischen den Steinufern tief im trockenen Bett. Die Bohlen reichen nicht bis zur Uferkante.');
  return game.say(object.name,open?'Das Wehr steht offen. Wasser aus dem See strömt in den Bach.':'Am Auslauf hält eine Sperre das Wasser zurück. Dahinter ist das Bachbett trocken.');
}

/** Beschreibt den Bedienstein; Mit Schwert bietet er nach dem ersten Blick eine Bestätigung an. @param {object} game Spiel. @param {object} object Bedienstein. */
export function inspectMeadowStone(game,object) {
  if (game.flags.eastStreamOpen) return game.say(object.name,'Die Rast hält das Wehr offen. Dein Schwert hast du wieder eingesteckt.');
  if (game.flags.eastStreamStoneSeen && game.inventory.some(isSword)) return promptMeadowStream(game);
  game.flags.eastStreamStoneSeen=true;
  game.say(object.name,'Der Eisenhebel ist abgebrochen. Etwas Flaches und Stabiles könnte in die Aufnahme passen.');
}

/** Bietet den Versuch an; erst A auf der Frage öffnet das Wehr. @param {object} game Spiel. */
export function promptMeadowStream(game) {
  game.flags.eastStreamStoneSeen=true;
  game.say('Du','Das Schwert hineinstecken? A: Ja · B: Abbrechen');
  const lastPage=game.pages.at(-1) || game.message;
  lastPage.onConfirm=openMeadowStream;
}

/** Hebt das Wehr mit dem rostigen Schwert an, ohne den Gegenstand zu verbrauchen. @param {object} game Spiel. */
function openMeadowStream(game) {
  if (game.flags.eastStreamOpen || !game.inventory.some(isSword)) return;
  game.flags.eastStreamStoneSeen=true; game.flags.eastStreamOpen=true;
  game.say('Das alte Wehr','Die Klinge passt in die Aufnahme. Beim Drehen rastet das Wehr ein. Wasser rauscht durch das Bachbett. Du ziehst das Schwert wieder heraus.','success-quest');
}

/** Gibt eine beiläufige Erinnerung und reagiert später auf den wieder fließenden Bach. @param {object} game Spiel. @param {object} object Bewohnerin. */
export function talkMeadowResident(game,object) {
  game.flags.eastLeneMet=true;
  game.say(object.name,game.flags.eastStreamOpen?'Hörst du das? Jetzt hört man den Bach wieder bis ins hohe Gras.':'Früher hab ich am Bach gesessen, wenn es am See zu laut war. Die alte Brücke schaukelte bei jedem Schritt.');
}


/** Prüft die Schneide am gespannten Hanfseil. @param {object} game Spiel. */
export function tryLowlandGate(game) {
  if (game.flags.eastLowlandGateOpen) return;
  if (game.inventory.includes(SHARP_SWORD)) {
    game.flags.eastLowlandGateOpen=true;
    return game.say('Weggitter','Die scharfe Klinge trennt das Seil. Das Gitter schwingt zur Seite.','success-small');
  }
  if (game.inventory.includes(RUSTY_SWORD)) return game.say('Weggitter','Du setzt das Schwert an. Die stumpfe Klinge bleibt in den Fasern hängen. Vielleicht kann die Gesellin in der Werkstatt von Bruchstein die Schneide schleifen.','ui-denied');
  game.say('Weggitter','Ein straff gespanntes Hanfseil hält das Gitter zu. Der Knoten sitzt auf der anderen Seite.');
}
