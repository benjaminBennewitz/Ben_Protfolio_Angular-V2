import { studyForestDoor } from './forest-return.js';
import { EAST_CLUES } from '../data/east-rooms.js';
import { pipeFlow,PIPE_START } from '../data/east-pipes.js';
import { rememberNote } from './loot.js';

/** Öffnet die Werkstation nach dem Bericht aus dem ersten Dungeon. @param {object} game Spiel. */
export function enterEastPump(game) {
  if (!game.flags.maraLowerReported) return game.say('Werkstation','Die Wartungstür trägt ein Gildensiegel. Dahinter schweigt die Mechanik des Ostpasses.');
  game.flags.eastPumpKnown=true; game.travel('east-pump');
}

/** Hält die nächste Geschichte auch für bereits abgeschlossene ältere Spielstände erreichbar. @param {object} game Spiel. */
export function talkEastMara(game) {
  game.flags.eastPumpKnown=true;
  if (game.flags.eastTrailReported) return game.say('Mara','Eine durchgestrichene Kerbe. Das ist kein Kartenzeichen, sondern eine Warnung der alten Wegmacher. Hinter der Wurzelpforte liegt ihr Gewölbe. Ich vergleiche die Zeichen mit den Chroniken. Geh nicht unvorbereitet an diese Tür.');
  if (game.flags.eastTrailDone) {
    game.flags.eastTrailReported=true; game.coins+=6;
    return game.say('Mara','Edas Beobachtungen passen zu deinen Funden: Der Pfeil zum Bach war eine falsche Fährte. Jemand brachte eine Kiste zur Wurzelpforte und benutzte dabei mein Zeichen. Die durchgestrichene Kerbe gehört den alten Wegmachern. Sechs Münzen für deine sorgfältigen Notizen. Ich suche ihre Chronik.','success-quest');
  }
  if (game.flags.eastOpen) return game.say('Mara','Der Ostpass ist offen. Früher hielt Eda die Waldwege frei. Vielleicht hat sie mehr gesehen als die Händler. Beim Kopieren eines Zeichens verrät die Hand manchmal mehr als das Zeichen selbst.');
  return game.say('Mara','Der Wasserweg aus dem Nest endet an der alten Werkstation beim Ostpass. Der Passriegel wird mit Wasserdruck gehoben. Seit die Leitung versagte, kam niemand mehr hinaus. Am Schrank klebt das Werkstattzeichen. Vielleicht weiß die Gesellin noch, was dort repariert wurde.');
}

/** Lässt den sichtbaren Ostweg erst nach tatsächlich aufgebautem Druck passieren. @param {object} game Spiel. */
export function enterEastGate(game) {
  if (!game.flags.eastOpen) return game.say('Ostpass','GEFAHR: Der Ostpass ist gesperrt. Die hölzerne Sperre sitzt fest im Boden. Eine Druckleitung verschwindet in der Werkstation daneben.');
  game.travel('east-wood');
}

/** Verankert Reparaturhinweise an der untersuchten Wartungsanlage statt an allwissenden NPCs. @param {object} game Spiel. */
export function inspectPump(game) {
  game.flags.eastPumpSurveyed=true;
  rememberNote(game,{id:'east-pump-manual',title:'Die Druckleitung',text:'Die Bodenkanäle führen vom linken Zulauf zum rechten Druckkolben. Rohrstücke lassen sich mit A im Uhrzeigersinn drehen; über die Kanäle kann man gehen. Wasser erreicht nur passend verbundene Öffnungen. Ein eingerissener Bogen verliert Druck. Ersatzteile tragen das Zeichen der Dorfwerkstatt. Der Hebel am Kolben hebt den Passriegel erst bei dichtem Wasserweg.'});
  game.say('Wartungsplatte','Die Leitung führt vom Zulauf links zum Druckkolben rechts. Unter der mittleren Muffe ist der Bogen eingerissen. Am Werkzeugschrank steht das Zeichen der Dorfwerkstatt. A dreht ein Rohrstück; die schmalen Bodenkanäle sind begehbar.');
}

/** Gibt genau ein passendes Ersatzteil aus; volle Taschen lassen es in der Kiste. @param {object} game Spiel. */
export function takeSparePipe(game) {
  if (!game.flags.eastPumpSurveyed) return game.say('Ersatzteilkiste','Rohrbögen und Dichtungen für die alten Wasserleitungen. Ohne passende Schadstelle nimmst du nichts mit.');
  if (game.flags.eastSpareTaken) return game.say('Ersatzteilkiste','Den passenden Rohrbogen hast du bereits mitgenommen.');
  if (game.inventory.length>=6) return game.say('Rucksack','Der Rohrbogen bleibt in der Kiste, bis ein Fach frei ist.','ui-denied');
  game.inventory.push('Rohrbogen'); game.flags.eastSpareTaken=true;
  game.say('Ersatzteilkiste','Ein Rohrbogen mit frischer Dichtung. Die Schablone entspricht der beschädigten Muffe.','pickup');
}

/** Dreht ein ausgewähltes Rohr oder ersetzt den gebrochenen Bogen ohne zweite Bedienebene. @param {object} game Spiel. @param {object} object Rohrstück. */
export function turnEastPipe(game,object) {
  if (game.flags.eastOpen) return game.say('Druckleitung','Die Leitung hält den Druck. Der Ostpass bleibt offen.');
  if (object.index===4 && !game.flags.eastPipeRepaired) {
    game.flags.eastPumpSurveyed=true;
    if (!game.consume('Rohrbogen')) return game.say('Gebrochener Bogen','Wasser sickert durch einen Riss. Das Werkstattzeichen ist noch auf dem alten Teil zu erkennen.','ui-denied');
    game.flags.eastPipeRepaired=true; game.sounds.push('success-small');
    return game.say('Druckleitung','Der neue Bogen sitzt dicht. Seine Ausrichtung lässt sich mit A weiterdrehen.');
  }
  const key=`eastPipe${object.index}`;
  game.flags[key]=((game.flags[key] ?? PIPE_START[object.index])+1)%4; game.sounds.push('gear');
}

/** Setzt ausschließlich Drehstellungen zurück und erhält eingesetzte Teile und Questfortschritt. @param {object} game Spiel. */
export function resetEastPipes(game) {
  if (game.flags.eastOpen) return game.say('Rückstellrad','Der Kolben ist eingerastet. Die Leitung bleibt in Betrieb.');
  for (let i=0;i<9;i++) game.flags[`eastPipe${i}`]=PIPE_START[i];
  game.say('Rückstellrad','Die Rohrstücke stehen wieder wie zuvor. Ein bereits eingesetzter Ersatzbogen bleibt erhalten.','gear');
}

/** Öffnet den Pass einmalig nur bei tatsächlich dicht verbundenem Verlauf. @param {object} game Spiel. */
export function startEastPump(game) {
  if (game.flags.eastOpen) return game.say('Druckkolben','Der Passriegel ist angehoben. Die Leitung arbeitet ruhig.');
  if (!pipeFlow(game.flags).ready) return game.say('Druckkolben','Der Kolben zuckt nur. Der Druck reicht nicht: Wasser muss den Auslass erreichen, ohne an einer offenen Verbindung zu entweichen.','ui-denied');
  game.flags.eastOpen=true;
  rememberNote(game,{id:'east-pass-open',title:'Der Osten ist offen',text:'Der neue Rohrbogen hält dicht. Wasserdruck hat den Riegel des Ostpasses angehoben. Der Weg führt in den östlichen Waldsaum.'});
  game.say('Der Riegel hebt sich','Die Leitung füllt sich. Hinter der Mauer klackt der Passriegel nach oben. Luft, Blätter und der Geruch von feuchter Rinde ziehen durch den offenen Weg.','success-waterwheel');
}

/** Erhält Beobachtungen unabhängig von ihrer Fundreihenfolge und ohne Inventarplatz. @param {object} game Spiel. @param {object} object Hinweis. */
export function inspectEastClue(game,object) {
  const clue=EAST_CLUES[object.clue],first=rememberNote(game,clue);
  if (object.clue==='threshold' && studyForestDoor(game,clue)) return;
  game.say(clue.title,clue.text,first?'success-small':'talk');
}

/** Bestätigt nur tatsächlich gesammelte Waldspuren und reagiert auf eine zurückgebrachte Flasche. @param {object} game Spiel. */
export function talkEda(game) {
  game.flags.eastEdaMet=true;
  if (!game.flags.eastCanteenDone && game.inventory.includes('Volle Feldflasche')) return returnCanteen(game);
  if (!game.flags.eastCanteenDone && !game.flags.eastBottleRecognized && game.inventory.includes('Feldflasche')) return recognizeCanteen(game);
  const complete=Object.values(EAST_CLUES).every(knownEastClue.bind(null,game));
  if (complete && !game.flags.eastTrailDone) {
    game.flags.eastTrailDone=true;
    return game.say('Eda','Ölgeruch, Schleifspuren und eine Kerbe unter der Rinde ... Der Pfeil zum Bach sollte uns ablenken. Ich kenne jeden alten Forstpfahl, aber diese Tür habe ich noch nie offen gesehen. Mara sollte deine Zeichnung sehen. Sie erkennt die alten Wegmacherzeichen besser als ich.','success-small');
  }
  if (game.flags.eastTrailDone) return game.say('Eda',game.flags.eastCanteenDone?'Mit meiner Flasche wandert es sich leichter. Die Wurzeln vor der Steintür wachsen von innen nach außen. Das gefällt mir trotzdem nicht.':'Die Wurzeln vor der Steintür wachsen von innen nach außen. Das gefällt mir nicht. Ein Schluck frisches Wasser täte jetzt gut.');
  game.say('Eda','Ich halte die Waldwege frei, normalerweise jedenfalls. Gestern zog jemand eine Kiste nordwärts. Heute zeigt frische Kreide zum Bach. Die Vögel sind seitdem still. '+(game.flags.eastCanteenDone?'Meine Flasche ist wieder da. Darüber freue ich mich.':game.flags.eastBottleRecognized?'Du hast meine Flasche gefunden. Jetzt fehlt nur noch ein Schluck frisches Wasser.':'Meine Flasche ist weg. Bei den Dornen habe ich zuletzt Rast gemacht; seitdem klebt mir die Zunge am Gaumen.'));
}

/** Erkennt eine bereits aufgenommene Beobachtung. @param {object} game Spiel. @param {object} clue Notiz. */
function knownEastClue(game,clue) { return game.notes.some(matchesNote.bind(null,clue.id)); }

/** Vergleicht eine Notizkennung. @param {string} id Kennung. @param {object} note Notiz. */
function matchesNote(id,note) { return note.id===id; }

/** Füllt die eigene Flasche am Dorfbrunnen oder übergibt sie direkt bei Eda. @param {object} game Spiel. @param {string} item Gegenstand. */
export function useEastCanteen(game,item) {
  const target=game.target;
  if (target?.id==='eda' && item==='Feldflasche' && !game.flags.eastCanteenDone) return recognizeCanteen(game);
  if (target?.id==='eda') return talkEda(game);
  if (item==='Feldflasche' && target?.kind==='well') {
    game.inventory[game.inventory.indexOf(item)]='Volle Feldflasche';
    return game.say('Feldflasche','Du spülst die Flasche aus und füllst sie mit kühlem Brunnenwasser.','pickup');
  }
  game.say(item,item==='Feldflasche'?'Auf dem Boden steht ein E. Die Flasche ist leer.':'Kühles Brunnenwasser. Auf der Flasche steht ein E.');
}

/** Tauscht die Flasche gegen einen Verband im dabei frei werdenden Fach und zahlt einmalig Münzen. @param {object} game Spiel. */
function returnCanteen(game) {
  if (game.flags.eastCanteenDone) return game.say('Eda','Meine Flasche vergesse ich so schnell nicht wieder. Danke noch einmal.');
  if (!game.consume('Volle Feldflasche')) return recognizeCanteen(game);
  game.inventory.push('Feldverband'); game.coins+=3; game.flags.eastCanteenDone=true;
  const thanks='Und frisches Wasser ist auch darin. Endlich!';
  game.say('Eda',`Das E ist meins! ${thanks} Nimm diesen Feldverband und drei Münzen. Hinter meinem Rastplatz zeigen die tiefen Spuren nordwärts, obwohl die Kreide etwas anderes behauptet.`,'success-quest');
}

/** Bestätigt die leere Flasche, ohne Belohnung oder weitere Waldbeobachtungen vorwegzunehmen. @param {object} game Spiel. */
function recognizeCanteen(game) {
  game.flags.eastEdaMet=true; game.flags.eastBottleRecognized=true;
  game.say('Eda','Das E ist meins! Du hast meine Flasche gefunden. Aber sie ist ja ganz leer ... Nach dem abgestandenen Tümpelwasser hier sehne ich mich nach einem Schluck aus dem Dorfbrunnen. Behalte sie noch einen Moment.');
}
