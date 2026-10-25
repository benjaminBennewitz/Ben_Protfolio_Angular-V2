import { knowsNote,questRecord,questMarker } from './quest-helpers.js';

/** Trennt Maras Kartenforschung vom erst später entdeckten Quellgewölbe. @param {object} game Spiel. */
export function maraQuestEntries(game) { return [archiveQuest(game),sourceQuest(game)].filter(Boolean); }

/** Rekonstruiert den bekannten Archivauftrag aus vorhandenen Notizen und Gesprächen. @param {object} game Spiel. */
function archiveQuest(game) {
  const f=game.flags,field=knowsNote(game,'cartographer-1'),margin=knowsNote(game,'archive-margin'),plan=knowsNote(game,'mara-old-plan');
  if (!f.maraStarted && !field && !margin && !plan) return null;
  const clues=[];
  if (f.maraStarted) clues.push('Mara untersucht einen Gang, der auf neueren Karten fehlt. Ihre Feldunterlagen wurden am Fluss feucht.');
  if (f.maraStarted) clues.push('Seit dem Aufräumen fehlt eine Randnotiz. Der Hausmeister hält auch Vasen für Ablagefächer.');
  if (field) clues.push('Eine feuchte Feldnotiz erwähnt einen älteren Gang unter dem Archiv.');
  if (margin) clues.push('Eine Randnotiz nennt einen zweiten Ausgang, den der Schreiber nie gesehen hat.');
  if (f.maraArchiveOpen) clues.push('Mara konnte die Hinweise zuordnen. Der untere Archivgang ist wieder zugänglich.');
  if (plan) clues.push('Der alte Quellplan beschreibt einen früheren Weg zur Quelle nördlich von Bruchstein.');
  if (f.maraReported) clues.push('Mara hat den gefundenen Plan geprüft. Vor der Freigabe zählt auch der Zustand des Dorfes.');
  if (f.northOpen) clues.push('Der Höhlenweg im Norden ist freigegeben.');
  const ready=Boolean(f.maraStarted && ((!f.maraArchiveOpen && field && margin) || (plan && !f.maraReported) || (f.maraReported && !f.northOpen && f.waterFlowing && f.stockDone && f.spoolDone)));
  return questRecord({id:5,title:'Mara: Der fehlende Gang',people:f.maraStarted?['Mara']:[],places:field || margin || f.maraStarted?['Gildenarchiv']:[],clues,ready,done:Boolean(f.northOpen),markers:ready?[questMarker('village-guild-upper','mara','!')]:f.maraArchiveOpen && !plan?[questMarker('village-guild','archive-area')]:[]});
}

/** Zeigt nur tatsächlich erreichte Tiefen und hält den späteren Ostweg als offene Frage fest. @param {object} game Spiel. */
function sourceQuest(game) {
  const f=game.flags;
  if (!f.northOpen && !f.maraSpringSurveyed && !f.sourceDrained) return null;
  const clues=['Der Quellplan zeigt drei Kerben am alten Fluttor.'];
  if (f.maraSpringSurveyed) clues.push('Am Fluttor sind frische Kreidespuren und ein Pfeil nach Osten.');
  if (f.maraSpringReported) clues.push('Mara hält die Kreide für neuer als ihren Plan. Unter dem Becken ist ein alter Abstieg eingezeichnet.');
  if (f.sourceDrained) clues.push('Das Becken ist abgelassen; eine Treppe führt unter die Wasseranlage.');
  if (game.states.has('quell-entry')) clues.push('Im Quellgewölbe leben Käfer, Schlangen und Spinnen.');
  if (f.quellNestCleared) clues.push('Das große Spinnennest ist still.');
  if (f.maraLowerMessage) clues.push('Im Nest lag eine Nachricht mit Maras Zeichen.');
  if (f.maraLowerReported) clues.push('Mara hat diese Nachricht nicht geschrieben. Wer benutzt ihr Zeichen? Die Werkstation am Ostpass könnte weitere Spuren enthalten.');
  const ready=Boolean((f.maraSpringSurveyed && !f.maraSpringReported) || (f.maraLowerMessage && !f.maraLowerReported));
  return questRecord({id:6,title:'Spuren unter dem Wasser',people:['Mara'],places:['Quellstollen',...(f.sourceDrained?['Quellgewölbe']:[])],clues,ready,done:Boolean(f.maraLowerReported),markers:ready?[questMarker('village-guild-upper','mara','!')]:!f.maraSpringSurveyed?[questMarker('village','north-area')]:[]});
}
