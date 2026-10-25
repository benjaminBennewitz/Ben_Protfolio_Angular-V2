import { createResidentSpeech } from './resident-chatter.js';
import { rememberNote } from './loot.js';
import { advanceToForestEvening,minuteOfDay,nightShade } from './world-clock.js';

/** Zeigt zuerst die untersuchte Tür in einem vollständig bestätigbaren Dialog. @param {object} game Spiel. @param {object} clue Türbeobachtung. */
export function studyForestDoor(game,clue) {
  if (game.flags.eastDoorStudied) return false;
  game.pendingDoorStudy=clue;
  game.say(clue.title,clue.text+' Du legst die Kerben vorsichtig frei und zeichnest sie ab.');
  return true;
}

/** Beginnt den Abendübergang erst nach dem Schließen der letzten Untersuchungsseite. @param {object} game Spiel. */
export function finishDoorReading(game) {
  if (!game.pendingDoorStudy || game.message) return;
  const from=nightShade(minuteOfDay(game)),clue=game.pendingDoorStudy;
  game.pendingDoorStudy=null; game.flags.eastDoorStudied=true; advanceToForestEvening(game);
  game.doorStudy={elapsed:0,duration:9,from,clue};
  game.held=null; game.move=null; game.locationNotice=null; game.ambientSpeech=null;
  rememberNote(game,{id:'east-long-study',title:'Abend an der Wurzelpforte',text:'Das Freilegen und Abzeichnen der verwitterten Kerben dauerte Stunden. Beim Aufbruch lag der Wald im Abendlicht. Hinter dem Stein klang noch einmal Metall. Die Tür blieb verschlossen.'});
}

/** Beendet den langsamen Abendübergang mit einer manuell lesbaren Abschlussmeldung. @param {object} game Spiel. @param {number} dt Aktive Sekunden. */
export function updateDoorStudy(game,dt) {
  const study=game.doorStudy;
  if (!study) return false;
  study.elapsed+=dt;
  if (study.elapsed>=study.duration) {
    game.doorStudy=null; game.sounds.push('forest-metal');
    game.say('Abend an der Pforte','Die Untersuchung hat Stunden gedauert. Als du aufblickst, ist die Sonne hinter den Kronen verschwunden. Noch einmal klingt Metall hinter dem Stein. Der Rückweg liegt im Dunkeln.','talk');
  }
  return true;
}

/** Zeigt die neue Begegnung und beide Seiten des freischaltbaren Waldsteigs zustandsabhängig. @param {object} game Spiel. @param {object[]} objects Raumobjekte. */
export function forestReturnObjects(game,objects) {
  const result=[];
  for (const object of objects) {
    if (object.id==='forest-traveller' && !game.flags.eastDoorStudied) continue;
    if (object.id==='forest-shortcut' && !game.flags.eastDoorStudied) continue;
    if (object.id==='dead-end' && game.room.id==='east-crossroads' && game.flags.eastShortcutOpen) result.push(shortcut(object,'east-thicket',[17,18]));
    else if (object.id==='forest-shortcut' && game.flags.eastShortcutOpen) result.push(shortcut(object,'east-crossroads',[17,17]));
    else result.push(object);
  }
  return result;
}

/** Öffnet die verhakten Zweige ausschließlich von der Pfortenseite und erhält den Durchgang dauerhaft. @param {object} game Spiel. */
export function openForestShortcut(game) {
  if (game.flags.eastShortcutOpen) return;
  game.flags.eastShortcutOpen=true;
  rememberNote(game,{id:'east-shortcut',title:'Der alte Waldsteig',text:'Vom Dornenbogen ließen sich die verkeilten Zweige zur Seite ziehen. Der kurze Steig führt nun in beide Richtungen direkt zur Raststelle am Forstkreuzweg.'});
  game.say('Alter Waldsteig','Von dieser Seite kannst du die verkeilten Zweige lösen. Dahinter erkennst du die verlassene Raststelle am Forstkreuzweg. Der kurze Steig ist jetzt in beide Richtungen frei.','success-small');
}

/** Projiziert die begehbare Öffnung ohne neue Raumkennungen oder Veränderungen an Baumkollisionen. @param {object} object Ausgangspunkt. @param {string} to Zielraum. @param {number[]} spawn Sichere Ankunft. */
function shortcut(object,to,spawn) { return {...object,kind:'trail',action:'travel',name:'Alter Waldsteig',to,spawn,walkThrough:true,hint:'Abkürzung nehmen'}; }

/** Lässt den müden Reisenden Beobachtungen statt einer direkten Questlösung teilen. @param {object} game Spiel. */
export function talkForestTraveller(game) {
  const first=rememberNote(game,{id:'east-traveller',title:'Ein Ruf im Abendwald',text:'Der Reisende Tamo hörte seinen Namen aus Richtung der Wurzelpforte. Dort war niemand zu sehen. Eine Gestalt hatte zuvor eine abgedeckte Kiste am Waldrand vorbeigetragen; eine Laterne hing daran, obwohl es noch hell war.'});
  game.flags.eastTravellerMet=true;
  game.say('Reisender Tamo',first?'Ich wollte längst im Dorf sein. Dann rief jemand meinen Namen, drüben bei den alten Steinen. Ich kenne hier niemanden. Vorher kam einer mit einer abgedeckten Kiste vorbei. Eine Laterne hing daran. Mitten am hellen Tag ... Jetzt bleibe ich lieber am offenen Weg.':'Seit es dunkel wird, halte ich mich an die alten Forstpfähle. Unter den Dornen liegt noch ein alter Steig zur Raststelle. Von hier aus sitzen seine Zweige fest.');
}

/** Plant seltene Waldlaute ausschließlich während aktiver dunkler Außenzeit. @param {object} game Spiel. @param {number} dt Aktive Sekunden. */
export function updateForestAmbience(game,dt) {
  hailForestTraveller(game);
  if (!game.flags.eastDoorStudied || !game.room.villageLandscape || !game.room.id.startsWith('east-') || nightShade(minuteOfDay(game))<0.15) return;
  game.forestAmbienceWait=(game.forestAmbienceWait ?? 5)-dt;
  if (game.forestAmbienceWait>0) return;
  game.forestAmbienceCount=(game.forestAmbienceCount || 0)+1;
  game.sounds.push(game.forestAmbienceCount%3===0?'forest-rustle':'forest-crickets');
  game.forestAmbienceWait=11+game.forestAmbienceCount%5;
}

/** Lässt Tamo beim ersten Näherkommen grüßen, ohne ein Gespräch zu erzwingen. @param {object} game Spiel. */
function hailForestTraveller(game) {
  if (game.room.id!=='east-crossroads' || !game.flags.eastDoorStudied || game.flags.eastTravellerMet || game.roomState.travellerHailed || game.ambientSpeech) return;
  const traveller=game.objects.find(isTraveller);
  if (!traveller || Math.abs(game.player.x-traveller.x)>4 || Math.abs(game.player.y-traveller.y)>3) return;
  game.roomState.travellerHailed=true; game.locationNotice=null;
  game.ambientSpeech=createResidentSpeech(traveller,'He! Du kommst von den alten Steinen? War dort noch jemand?');
  game.ambientSpeech.remaining=game.ambientSpeech.duration=Math.max(10,game.ambientSpeech.duration);
}

/** Findet den sichtbaren Reisenden am gemeinsamen Rückweg. @param {object} object Raumobjekt. */
function isTraveller(object) { return object.id==='forest-traveller'; }
