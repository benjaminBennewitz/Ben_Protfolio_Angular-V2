import { minuteOfDay } from './world-clock.js';
import { rememberNote } from './loot.js';

/** Verwendet die bestehende Nachtphase von 20 bis 6 Uhr. @param {object} game Spiel. */
export function winterNight(game) {
  const minute=minuteOfDay(game);
  return minute>=1200 || minute<360;
}

/** Beschreibt den Westweg und bestätigt einen unvorbereiteten Aufbruch. @param {object} game Spiel. */
export function enterWest(game) {
  if (!game.flags.rootSpringFlowing) return game.say('Westweg','Aus dem Pass kommt eisiger Wind. Solange die Quelle im Osten stillsteht, bleiben die Reisenden in Bruchstein.');
  if (game.flags.mantleMade) return departWest(game);
  game.say('Westweg','Der Pass ist verschneit. Ohne gefütterten Mantel kühlst du dreimal so schnell aus. Trotzdem aufbrechen? A: Ja · B: Zurück');
  (game.pages.at(-1) || game.message).onConfirm=departWest;
}

/** Beginnt den ersten Passbesuch und hinterlegt die bekannten Raststellen. @param {object} game Spiel. */
function departWest(game) {
  game.flags.westVisited=true;
  rememberNote(game,{id:'west-pass',title:'Der verschneite Westpass',text:'Der Westweg beginnt bei Bruchstein. Wenn du vollständig auskühlst, werden deine Schritte langsamer. Ein gefütterter Mantel hält dreimal so lange warm. Feuerstellen und die Schutzhütte geben Wärme zurück.'});
  game.travel('west-edge',[2,8]);
}

/** Aktualisiert nur aktive Sekunden und beendet Auskühlung beim sicheren Heimweg. @param {object} game Spiel. @param {number} dt Zeitschritt. */
export function updateWinter(game,dt) {
  if (!game.room.winter) { delete game.flags.winterCold; game.winterRemainder=0; return; }
  const cold=game.flags.winterCold || 0;
  const change=(game.room.sheltered?-dt*3000:dt*(game.flags.mantleMade?1000/3:1000))+(game.winterRemainder || 0);
  const whole=Math.trunc(change);
  game.winterRemainder=change-whole;
  game.flags.winterCold=Math.max(0,Math.min(60000,cold+whole));
}

/** Lässt die Figur erst nach Bestätigung am Feuer aufwärmen. @param {object} game Spiel. */
export function winterRest(game) {
  game.say('Rast am Feuer','Eine Weile aufwärmen? A: Ja · B: Zurück');
  (game.pages.at(-1) || game.message).onConfirm=warmAtFire;
}

/** Wärmt auf und lässt eine Viertelstunde der bestehenden Weltzeit verstreichen. @param {object} game Spiel. */
function warmAtFire(game) {
  delete game.flags.winterCold; game.winterRemainder=0;
  game.worldMinutes=Math.min(1e9-1,game.worldMinutes+15);
  game.say('Rast am Feuer','Wärme kehrt in deine Finger zurück. Eine Viertelstunde ist vergangen.','success-small');
}

/** Führt den Nachtauftrag mit derselben Person in Schutzhütte und Schenke. @param {object} game Spiel. */
export function talkIva(game) {
  if (!game.flags.rootSpringFlowing) return game.say('Iva','Die Passleuchte wartet auf ruhigere Zeiten.');
  if (game.flags.westLightFixed) return game.say('Iva','Seit der Leuchtkern wieder sitzt, finden die Reisenden meine Wegmarken. Danke für deinen nächtlichen Gang.');
  if (game.flags.westLensRecovered) return offerLensReturn(game);
  if (game.room.id==='village-inn' && winterNight(game)) {
    game.flags.westNightQuest=true;
    return game.say('Iva','Am Windgrat ist mein Leuchtkern verschwunden. Im Dunkeln hört man noch sein Summen an der alten Wegleuchte. Wenn du ihn findest, bring ihn nachts zu mir in die Schenke. Ich habe die Fassung dabei.');
  }
  game.say('Iva','Tagsüber prüfe ich die Pfähle. Nach Einbruch der Dunkelheit sitze ich im schiefen Kessel. Dort habe ich eine Bitte an jemanden, der sich nachts hinauswagt.');
}

/** Bietet den nächtlichen Abschluss an, ohne die Belohnung vorab zu vergeben. @param {object} game Spiel. */
function offerLensReturn(game) {
  if (game.room.id!=='village-inn' || !winterNight(game)) return game.say('Iva','Du hast ihn gefunden! Die Fassung liegt in der Schenke. Komm nach 20 Uhr dorthin, dann setzen wir ihn ein.');
  game.say('Iva','Den Leuchtkern wieder in die Passlaterne setzen? A: Ja · B: Zurück');
  (game.pages.at(-1) || game.message).onConfirm=fixPassLight;
}

/** Vergibt den Abschlusslohn genau einmal und bewahrt den Fund im Journal. @param {object} game Spiel. */
function fixPassLight(game) {
  if (game.flags.westLightFixed || !game.flags.westLensRecovered || !winterNight(game) || game.room.id!=='village-inn') return;
  game.flags.westLightFixed=true;
  game.coins+=5;
  rememberNote(game,{id:'west-lantern',title:'Licht im Schneefall',text:'Du hast den Leuchtkern nachts am Windgrat geborgen und mit Iva in der Schenke wieder eingesetzt. Die reparierte Passleuchte zeigt nachts bis zur Frostpforte. Iva gab fünf Münzen.'});
  game.say('Iva','Da ist es wieder, das ruhige Licht. Stell dir die Reisenden vor, die daran den Heimweg erkennen. Hier, fünf Münzen für deine Mühe.','success-quest');
}

/** Zeigt am Tag eine Beobachtung und nachts den tatsächlichen Fund. @param {object} game Spiel. */
export function inspectWinterMarker(game) {
  if (game.flags.westLensRecovered) return game.say('Wegleuchte',game.flags.westLightFixed?'Ein warmer Lichtschein fällt über die eisige Wegkante.':'Die leere Fassung wartet auf ihren Kern.');
  game.flags.westMarkerSeen=true;
  if (!winterNight(game)) return game.say('Wegleuchte','Unter dem Eis steckt etwas Glattes. Im Tageslicht lässt sich keine Form erkennen.');
  if (!game.flags.westNightQuest) return game.say('Wegleuchte','Tief im Eis glimmt etwas. Die alte Leuchte trägt das Zeichen einer Hüterin.');
  game.say('Wegleuchte','Ein pulsierender Kern zeichnet sich im Eis ab. Vorsichtig herauslösen? A: Ja · B: Zurück');
  (game.pages.at(-1) || game.message).onConfirm=recoverLens;
}

/** Sichert einen Questfund ohne Verbrauch eines der sechs Reisegepäckfächer. @param {object} game Spiel. */
function recoverLens(game) {
  if (!winterNight(game) || game.flags.westLensRecovered) return;
  game.flags.westLensRecovered=true;
  game.say('Leuchtkern geborgen','Der kleine Kern wärmt deine Hand. Iva wartet nachts im schiefen Kessel. Der Fund steht im Questbuch.','success-small');
}

/** Vergibt den kleinen Vorratsfund nur bei freiem Fach. @param {object} game Spiel. @param {object} object Reisebeutel. */
export function winterSupplies(game,object) {
  if (game.roomState.taken.has(object.id)) return game.say('Reisebeutel','Der Beutel ist leer.');
  if (game.inventory.length>=6) return game.say('Reisebeutel','Für den Heiltrank brauchst du ein freies Fach.');
  game.inventory.push('Heiltrank');
  game.roomState.taken.add(object.id);
  game.say('Reisebeutel','Ein versiegelter Heiltrank hat den Frost überstanden.','treasure');
}

/** Hält das kommende Dungeon als sichtbaren nächsten Abschnitt fest. @param {object} game Spiel. */
export function inspectFrostGate(game) {
  game.flags.frostGateSeen=true;
  rememberNote(game,{id:'frost-gate',title:'Das Frostgewölbe',text:'Hinter der Frostpforte liegt das nächste Gewölbe der Wassermeister. Der Zugang ist noch vereist. Für den nächsten Aufbruch lohnt es sich, nach Bruchstein zurückzukehren und Vorräte aufzufüllen.'});
  game.say('Frostpforte','Unter einer dicken Eisschicht erkennst du Stufen. Zwischen zwei Säulen führt der Weg in den Berg. Auf den Stufen liegt eine geschlossene Eisdecke. Dahinter ist tiefes Rauschen zu hören. Du zeichnest den Ort für Mara ein.');
}
