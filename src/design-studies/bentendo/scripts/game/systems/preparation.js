import { TEMPERED_SWORD,SHARP_SWORD,RUSTY_SWORD } from '../data/items.js';
import { DAY_MINUTES } from './world-clock.js';
import { rememberNote } from './loot.js';

export const REISWAREN=[
  {name:'Heiltrank',price:3},
  {name:'Gegengift',price:2},
  {name:'Stärkungstrank',price:4},
  {name:'Wollballen',price:3},
];

/** Öffnet den Reisebedarf nach der Rückkehr aus Wurzelgrund. @param {object} game Spiel. */
export function openTravelShop(game) {
  if (!game.flags.rootSpringFlowing) return game.say('Reisebedarf','Der Wirt füllt die Reisevorräte auf. Komm nach deinem Besuch im Wurzelgrund wieder.');
  game.systemMenu={kind:'shop',choice:0};
  game.held=null;
}

/** Bestätigt genau einen Kauf bei ausreichendem Geld und Platz. @param {object} game Spiel. */
export function buyTravelSupply(game) {
  const menu=game.systemMenu,ware=REISWAREN[menu.choice];
  if (!ware) { game.systemMenu=null; return; }
  if (game.inventory.length>=6) { menu.status='Der Rucksack ist voll.'; return; }
  if (game.coins<ware.price) { menu.status='Dafür fehlen dir Münzen.'; return; }
  game.coins-=ware.price;
  game.inventory.push(ware.name);
  menu.status=ware.name+' eingepackt.';
  game.sounds.push('pickup');
}

/** Ergänzt die Rückkehrgespräche an den bestehenden Personen. @param {object} game Spiel. @param {object} person Gesprächspartner. */
export function preparationConversation(game,person) {
  if (!game.flags.rootSpringFlowing) return false;
  if (person.id==='mara') { reportReturn(game); return true; }
  if (person.id==='workshop-helper' && game.room.id==='village-workshop') {
    if (game.flags.smithDue || game.inventory.includes(RUSTY_SWORD)) return false;
    offerTempering(game,person);
    return true;
  }
  if (person.id==='tailor') {
    offerMantle(game,person);
    return true;
  }
  return preparationRumor(game,person);
}

/** Beschreibt Reisevorräte und den Arbeitsort der alten Schleifer. @param {object} game Spiel. @param {object} person Bewohner. */
function preparationRumor(game,person) {
  if (person.id==='innkeeper') {
    if (game.worldMinutes%1440>=1200 || game.worldMinutes%1440<360) { game.say('Wirt','Iva, die Laternenhüterin, sitzt heute Nacht hier. Frag sie nach dem Licht auf dem Westpass.'); return true; }
    game.say('Wirt','Seit der Bach wieder läuft, wagen sich Händler auf die Straße. Reisebedarf liegt jetzt an meiner Theke. Heiltrank, Gegengift, Stärkung und Wolle. Im alten Quellgewölbe wurden giftige Krabbeltiere gesehen.');
    return true;
  }
  if (person.id==='carpenter') {
    game.say(person.name,'Früher holten wir feinen Schleifstein aus der Schleifkammer neben dem alten Wachposten. Seit dort ein großer Panzerkäfer schabt, geht keiner mehr hinein.');
    game.flags.quarryKnown=true;
    return true;
  }
  return false;
}

/** Hält die zweite Schwertarbeit bis nach einer tatsächlichen Nacht zurück. @param {object} game Spiel. @param {object} person Gesellin. */
function offerTempering(game,person) {
  game.flags.temperKnown=true;
  if (game.flags.temperDue) {
    if (!game.flags.temperRested) return game.say(person.name,'Die Schneide muss sich setzen. Schlaf bis zum nächsten Morgen und komm dann wieder.');
    if (game.inventory.length>=6) return game.say(person.name,'Die Klinge ist fertig. Mach ein Fach im Rucksack frei.');
    game.inventory.push(TEMPERED_SWORD);
    delete game.flags.temperDue;
    delete game.flags.temperRested;
    game.flags.temperDone=true;
    return game.say(person.name,'Die feine Schneide sitzt. Dein Schwert hat jetzt Angriff 4. Halte es von losem Geröll fern.','success-quest');
  }
  if (game.flags.temperDone) return game.say(person.name,'Die veredelte Schneide hält. Für eine weitere Verbesserung brauche ich erst neue Erfahrungen mit dem Stahl.');
  if (!game.inventory.includes(SHARP_SWORD) || !game.inventory.includes('Feiner Schleifstein')) {
    return game.say(person.name,'Mit einem feinen Schleifstein könnte ich deine geschärfte Klinge weiter verbessern. Im alten Quellgewölbe lag eine Schleifkammer neben dem Wachposten. Der Zimmermann kannte die Arbeiter dort.');
  }
  game.say(person.name,'Geschärftes Schwert und feinen Schleifstein abgeben? Die Arbeit dauert bis morgen. A: Ja · B: Zurück');
  (game.pages.at(-1) || game.message).onConfirm=leaveTempering;
}

/** Tauscht beide Materialien erst nach ausdrücklicher Bestätigung ein. @param {object} game Spiel. */
function leaveTempering(game) {
  if (game.flags.temperDue || !game.inventory.includes(SHARP_SWORD) || !game.inventory.includes('Feiner Schleifstein')) return;
  game.consume(SHARP_SWORD);
  game.consume('Feiner Schleifstein');
  game.flags.temperDue=(Math.floor(game.worldMinutes/DAY_MINUTES)+1)*DAY_MINUTES+420;
  game.say('Gesellin','Ich setze die Schneide neu an. Dein Bett in der Schenke wartet auf dich.','gear');
}

/** Fertigt einen dauerhaft getragenen Mantel aus echten Fundstücken. @param {object} game Spiel. @param {object} person Näherin. */
function offerMantle(game,person) {
  game.flags.mantleKnown=true;
  if (game.flags.mantleMade) return game.say(person.name,'Dein Wollmantel sitzt gut. Die verstärkten Säume federn leichte Treffer ab, und das Futter ist für den Westweg gedacht.');
  if (!game.inventory.includes('Wollballen') || !game.inventory.includes('Bronzeverschluss')) {
    return game.say(person.name,'Für den Schnee nähe ich dir einen gefütterten Mantel. Wolle führt der Wirt. Einen festen Verschluss hatten die Arbeiter im Quellgewölbe an ihren alten Reiseumhängen.');
  }
  game.say(person.name,'Wolle und Bronzeverschluss für den gefütterten Mantel verwenden? A: Ja · B: Zurück');
  (game.pages.at(-1) || game.message).onConfirm=makeMantle;
}

/** Legt das fertige Kleidungsstück direkt als Schutzausrüstung an. @param {object} game Spiel. */
function makeMantle(game) {
  if (game.flags.mantleMade || !game.inventory.includes('Wollballen') || !game.inventory.includes('Bronzeverschluss')) return;
  game.consume('Wollballen');
  game.consume('Bronzeverschluss');
  game.flags.mantleMade=true;
  game.say('Näherin','Der Verschluss sitzt. Du legst den gefütterten Mantel an. Ein gewöhnlicher Kontakttreffer kostet jetzt nur noch ein Viertelherz.','success-quest');
}

/** Gibt die bewachte Materialkiste nur bei genügend Platz frei. @param {object} game Spiel. @param {object} object Materialkiste. */
export function quarryReward(game,object) {
  if (game.roomState.taken.has(object.id)) return game.say('Materialkiste','Die Kiste ist leer.');
  if (game.enemies.length) return game.say('Materialkiste','Der Panzerkäfer und seine Brut versperren die Kiste.');
  if (game.inventory.length>4) return game.say('Materialkiste','Für Schleifstein und Verschluss brauchst du zwei freie Fächer.');
  game.inventory.push('Feiner Schleifstein','Bronzeverschluss');
  game.roomState.taken.add(object.id);
  game.say('Werkzeuge der Wassermeister','Ein feiner Schleifstein und ein alter Bronzeverschluss. Beide sind noch brauchbar. Bring sie sicher nach Bruchstein.','success-quest');
}

/** Ordnet die Quellscherbe ein und eröffnet die Vorbereitung auf den Westweg. @param {object} game Spiel. */
function reportReturn(game) {
  game.flags.returnReported=true;
  rememberNote(game,{id:'west-preparation',title:'Vor dem Westweg',text:'Mara erkennt die Quellscherbe als Teil einer alten Wasserfassung. Im Westen liegt Schnee. In Bruchstein können Schmiede, Näherin und Wirt bei der Vorbereitung helfen. Das große Tor im Norden bleibt ein eigener offener Faden.'});
  game.say('Mara','Die Quellscherbe! Die Wassermeister banden damit die Kraft einer Quelle. Du trägst jetzt etwas von ihr in dir. Aus dem Westen kommen Nachrichten von vereisten Wegen. Sprich mit der Gesellin und der Näherin, bevor du dort aufbrichst.');
}
