import { createActor } from './wanderers.js';

export const DRINKS=[
  {name:'Wasser',price:0,text:'Kühles Quellwasser. Genau das Richtige nach einem Spaziergang.'},
  {name:'Apfelsaft',price:1,text:'Frischer Apfelsaft von den Obstwiesen. Süß und ein bisschen säuerlich.'},
  {name:'Kräutertee',price:2,text:'Ein warmer Kräutertee. Es duftet nach Minze und den Wiesen am Fluss.'},
];

/** Besetzt jeden erreichbaren Stuhl und ruft nur an der Theke den Wirt. @param {object} game Spiel. @param {object} chair Sitzmöbel. */
export function sitDown(game,chair) {
  if (game.room.id!=='village-inn' || chair.art!=='chair' || chair.occupiedBy) return false;
  if (game.objects.some(/** Erkennt eine bestehende Sitzbelegung. @param {object} object Gast. */ object=>object.seated && object.seatId===chair.id)) return false;
  game.seat={id:chair.id,x:chair.x,y:chair.y,exit:[game.player.x,game.player.y]};
  game.player.x=chair.x; game.player.y=chair.y; game.player.facing='up';
  game.held=null; game.locationNotice=null; game.ambientSpeech=null; game.pendingReaction=null; game.tavernReply=null;
  game.tavernChoice=0;
  if (!chair.barService) return true;
  game.roomState.wanderers ||= {};
  const person=game.room.objects.find(isInnkeeper);
  game.roomState.wanderers.innkeeper ||= createActor(person);
  game.roomState.service={phase:'approach',goal:[Math.max(4,Math.min(8,chair.x)),3]};
  return true;
}

/** Erkennt den Wirt ohne einen anonymen Callback. @param {object} object Raumelement. */
function isInnkeeper(object) { return object.id==='innkeeper'; }

/** Öffnet die Auswahl erst, sobald der Wirt seinen Platz hinter der Bar erreicht hat. @param {object} game Spiel. */
export function openDrinks(game) {
  if (game.roomState.service?.phase!=='ready') return;
  game.ambientSpeech=null; game.pendingReaction=null; game.tavernReply=null; game.tavernMenu=true;
}

/** Wählt ein Getränk mit denselben Richtungstasten wie der Rucksack. @param {object} game Spiel. @param {string} direction Richtung. */
export function navigateDrinks(game,direction) {
  if (!game.tavernMenu || game.message) return;
  const step=['up','left'].includes(direction)?-1:1;
  game.tavernChoice=(game.tavernChoice+step+DRINKS.length)%DRINKS.length;
}

/** Rechnet genau eine bestätigte Bestellung ab und serviert das Getränk sofort am Platz. @param {object} game Spiel. */
export function serveDrink(game) {
  if (!game.seat || game.roomState.service?.phase!=='ready') return;
  const drink=DRINKS[game.tavernChoice];
  game.tavernMenu=false;
  if (game.coins<drink.price) return game.say('Wirt','Dafür reichen deine Münzen noch nicht. Ein Glas Wasser bekommst du bei mir immer kostenlos.','ui-denied');
  game.coins-=drink.price;
  game.flags.drinksServed=(game.flags.drinksServed || 0)+1;
  game.say('Wirt',`${drink.name}, bitte sehr! ${drink.text} Du trinkst in Ruhe aus. Lass es dir gut gehen.`,'pickup');
}

/** Gibt den Stuhl frei und lässt den Wirt zu seinem normalen Arbeitsplatz zurückgehen. @param {object} game Spiel. */
export function standUp(game) {
  if (!game.seat) return;
  const [x,y]=game.seat.exit;
  game.player.x=x; game.player.y=y; game.seat=null; game.tavernMenu=false; game.held=null;
  if (game.roomState.service) game.roomState.service={phase:'return',goal:[9,3]};
}

/** Räumt beim Ortswechsel die Bedienung außerhalb der sichtbaren Szene auf. @param {object} game Spiel. */
export function clearTavern(game) {
  if (game.room?.id==='village-inn' && game.roomState.service) {
    const actor=game.roomState.wanderers?.innkeeper;
    if (actor) Object.assign(actor,{x:9,y:3,fromX:9,fromY:3,index:0,moving:false,wait:2});
    game.roomState.service=null;
  }
  game.seat=null; game.tavernMenu=false;
}
