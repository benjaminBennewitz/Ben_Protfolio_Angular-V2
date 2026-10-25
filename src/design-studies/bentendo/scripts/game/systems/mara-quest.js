import { talkEastMara } from './east-story.js';
import { rememberNote } from './loot.js';
import { SOURCE_REPORT } from '../data/mara-rooms.js';

/** Erkennt bereits gelesene Hinweise unabhängig von der Reihenfolge ihrer Entdeckung. @param {object} game Spiel. @param {string} id Dokumentkennung. */
export function hasMaraNote(game,id) {
  for (const note of game.notes) if (note.id===id) return true;
  return false;
}

/** Nennt nur die noch fehlenden öffentlichen Dorfaufgaben für einen sicheren Höhlenbesuch. @param {object} game Spiel. */
function villageRequirements(game) {
  const missing=[];
  if (!game.flags.waterFlowing) missing.push('das Wasserrad reparieren');
  if (!game.flags.stockDone) missing.push('die Vorratskontrolle bei der Lagerwartin abschließen');
  if (!game.flags.spoolDone) missing.push('die Garnspule zur Webstube zurückbringen');
  return missing;
}

/** Führt Maras Archivauftrag über Hinweise, Planfund und Freigabe bis zur ersten Höhlenerkundung. @param {object} game Spiel. */
export function talkMara(game) {
  if (!game.flags.guildOpen) return game.say('Mara','Die Gilde ist noch zu. Der Hausmeister wollte nach dem Rad sehen; seit es stillsteht, kommt er zu nichts anderem.');
  game.flags.maraStarted=true;
  if (game.flags.maraLowerReported) return talkEastMara(game);
  if (game.flags.maraSpringSurveyed && !game.flags.maraSpringReported) return reportSource(game);
  if (game.flags.maraLowerMessage) { game.flags.maraLowerReported=true; game.flags.eastPumpKnown=true; refreshMaraJournal(game); return game.say('Mara','Mein Zeichen? Aber diese Nachricht habe ich nicht geschrieben. Der untere Wasserweg führt zum Ostpass. Wir müssen herausfinden, wer dort meine Spuren legt. Bewahre die Nachricht auf. Die Werkstation am Ostpass könnte zeigen, warum der Wasserweg dort endet.'); }
  if (game.flags.maraSpringReported) return game.say('Mara','Auf dem Plan liegt eine Treppe unter dem Becken. Die alte Mechanik wird das Wasser erst freigeben müssen. Auf der Pegelplatte sind sicher noch Wartungsspuren. Und falls du erschöpft zurückkommst: Dein Bett wartet oben in der Schenke.');
  if (game.flags.northOpen) return game.say('Mara','Der Quellstollen ist freigegeben. Am alten Fluttor sind drei Kerben. Schau nach, ob die Markierung noch zum Plan passt. Der Ostpass bleibt vorerst gesperrt.');
  if (hasMaraNote(game,'mara-old-plan')) return reportPlan(game);
  if (!hasMaraNote(game,'cartographer-1') || !hasMaraNote(game,'archive-margin')) {
    refreshMaraJournal(game);
    return game.say('Mara','Ich bin Mara, Kartografin. Ein Gang fehlt auf unseren Karten. Am Fluss ist mir gestern eine Feldnotiz nass geworden. Und seit der Hausmeister hier aufgeräumt hat, fehlt auch eine Randnotiz. Er hält sogar Vasen für Ablagefächer.');
  }
  game.flags.maraArchiveOpen=true; refreshMaraJournal(game);
  game.say('Mara','Die Hinweise passen zusammen. Der Hausmeister hat den unteren Archivgang wieder freigegeben. Dort wurden die älteren Quellpläne aufbewahrt. Hoffentlich haben sie die Feuchtigkeit besser überstanden als meine Feldnotiz.');
}

/** Vergibt den Planlohn einmal und hält die noch offenen Voraussetzungen verständlich fest. @param {object} game Spiel. */
function reportPlan(game) {
  const first=!game.flags.maraReported,missing=villageRequirements(game);
  if (first) { game.flags.maraReported=true; game.coins+=6; }
  if (!missing.length) {
    game.flags.northOpen=true; game.flags.maraDone=true; refreshMaraJournal(game); game.sounds.push('door');
    return game.say('Mara',`${first?'Der Quellplan! Hier sind sechs Gildenmünzen. ':''}Das Wasser läuft ruhig und die Dorfaufgaben sind erledigt. Ich gebe den Höhleneingang im Norden frei. Untersuche im Quellstollen das alte Fluttor mit den drei Kerben und berichte mir danach.`,'success-quest');
  }
  refreshMaraJournal(game);
  game.say('Mara',`${first?'Der Quellplan ist gerettet! Sechs Gildenmünzen für dich. ':''}Vor der Freigabe musst du noch ${missing.join(' und ')}. Komm danach wieder zu mir.`,first?'success-quest':'talk');
}

/** Bestätigt die neuen Spuren einmalig und schließt das erste Mara-Kapitel ab. @param {object} game Spiel. */
function reportSource(game) {
  game.flags.maraSpringReported=true; game.coins+=4; refreshMaraJournal(game);
  game.say('Mara','Frische Kreide am Fluttor? Dann benutzt noch jemand den alten Gang. Der Pfeil nach Osten stand nicht auf meinem Plan. Gut, dass du nicht weitergegangen bist. Vier Münzen für deinen Bericht. Unter dem Becken ist eine Treppe eingezeichnet. Vielleicht lässt die alte Wartungsanlage das restliche Wasser noch ab. Auf den Bauteilen sollten Markierungen sein.','success-quest');
}

/** Hält ausschließlich belegte Erkenntnisse fest, ohne Rätselabläufe oder genaue Fundmöbel zu verraten. @param {object} game Spiel. */
export function refreshMaraJournal(game) {
  if (!game.flags.maraStarted) return;
  let text='Mara untersucht einen fehlenden Gang. Eine ihrer Feldnotizen wurde am Fluss feucht; eine Randnotiz ist seit dem Aufräumen im Archiv verschwunden. Der Hausmeister hält sogar Vasen für Ablagefächer.';
  if (game.flags.eastTrailReported) text='Mara erkennt die durchgestrichene Kerbe als Warnzeichen der alten Wegmacher. Jemand führte eine Kiste zur Wurzelpforte und legte eine falsche Fährte zum Bach. Mara sucht ihre Chronik.';
  else if (game.flags.eastOpen) text='Der Ostpass ist offen. Eda hält die Waldwege frei und könnte die fremden Kreidespuren einordnen.';
  else if (game.flags.maraLowerReported) text='Mara hat die Nachricht aus dem Nest nicht geschrieben. Jemand benutzt ihr Zeichen. Die alte Druckleitung am Ostpass ist der nächste bekannte Ansatzpunkt.';
  else if (game.flags.maraLowerMessage) text='Im Spinnennest lag eine Nachricht mit Maras Zeichen. Ihre Herkunft ist ungeklärt.';
  else if (game.flags.maraSpringReported) text='Mara hält die Kreide am Fluttor für neuer als ihren Plan. Unter dem Becken ist eine Treppe eingezeichnet. Die alte Wartungsanlage könnte den Zugang freilegen.';
  else if (game.flags.maraSpringSurveyed) text='Frische Kreide am Fluttor: drei Kerben und ein Pfeil nach Osten. Die Spuren passen nicht zum Alter des Plans.';
  else if (game.flags.northOpen) text='Der Quellstollen ist freigegeben. Auf Maras Plan trägt das Fluttor drei Kerben.';
  else if (hasMaraNote(game,'mara-old-plan')) text='Der alte Quellplan ist gefunden. Er beschreibt einen früheren Weg zwischen dem Archiv und der Quelle nördlich von Bruchstein.';
  else if (game.flags.maraArchiveOpen) text='Mara konnte die beiden Hinweise zusammenführen. Der untere Archivgang ist wieder zugänglich; dort wurden ältere Pläne aufbewahrt.';
  const entry={id:'mara-quest',title:'Mara: Der fehlende Gang',text}; rememberNote(game,entry);
  for (const note of game.notes) if (note.id===entry.id) note.text=text;
}

/** Hält den unteren Archivzugang bis zur Zusammenführung beider Hinweise geschlossen. @param {object} game Spiel. */
export function enterMaraArchive(game) {
  if (!game.flags.maraArchiveOpen) return game.say('Archivgang','Der Zugang ist verschlossen. Mara arbeitet oben im Gildenarchiv an den fehlenden Plänen. Sprich mit ihr.');
  game.travel('mara-archive');
}

/** Öffnet den Nordweg und den alten Verbindungsgang erst nach Maras Freigabe. @param {object} game Spiel. */
export function enterSourceCave(game) {
  if (!game.flags.northOpen) return game.say('Wegsperre','GEFAHR: Der Höhlenweg ist noch gesperrt. Mara in der Gilde prüft den alten Quellplan und die offenen Dorfaufgaben.');
  game.travel('mara-cave');
}

/** Lässt die alten Markierungen ohne belegten Inventarplatz untersuchen und verhindert doppelte Fundfanfaren. @param {object} game Spiel. */
export function inspectSourceGate(game) {
  const first=!game.flags.maraSpringSurveyed;
  game.flags.maraSpringSurveyed=true; rememberNote(game,SOURCE_REPORT); refreshMaraJournal(game);
  game.say('Altes Fluttor',SOURCE_REPORT.text,first?'success-small':'talk');
}
