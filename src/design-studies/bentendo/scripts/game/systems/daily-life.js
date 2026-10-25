import { tavernSeatObjects } from './tavern-guests.js';
import { DAILY_RESIDENTS } from '../data/daily-residents.js';
import { minuteOfDay } from './world-clock.js';
import { contains,wall } from './collision.js';

/** Erkennt die Nachtruhe für private Häuser und Arbeitsstätten. @param {object} game Spiel. */
export function isNightRest(game) { const minute=minuteOfDay(game); return minute>=1200 || minute<360; }

/** Beendet die Außenaktivität der bisherigen Tagtiere schon mit der Dunkelheit. @param {object} game Spiel. */
export function animalsRest(game) { const minute=minuteOfDay(game); return minute>=1140 || minute<420; }

/** Bestimmt den aktuellen Aufenthaltsort bekannter Personen ohne gespeicherte Duplikate. @param {object} game Spiel. @param {string} id Person. */
export function residentLocation(game,id) {
  const plan=DAILY_RESIDENTS.find(/** Vergleicht die Personenkennung. @param {object} entry Tagesplan. */ entry=>entry.id===id);
  if (!plan) return undefined;
  if (id==='keeper' && game.flags.waterFlowing && !game.flags.guildOpen) return 'village';
  if (id==='forest-traveller' && !game.flags.eastTravellerMet) return 'east-crossroads';
  if (isNightRest(game)) return plan.late?'village-inn':null;
  if (minuteOfDay(game)>=1020) return 'village-inn';
  return id==='keeper' && game.flags.guildOpen?'village-guild':plan.home;
}

/** Projiziert Tagesgäste und schlafende Tiere nach der vorhandenen Bewegungsprojektion. @param {object} game Spiel. @param {object[]} objects Raumobjekte. */
export function dailyLifeObjects(game,objects) {
  const result=[];
  for (const object of objects) {
    const location=residentLocation(game,object.id);
    if (location!==undefined && location!==game.room.id && game.message?.speaker!==object.name) continue;
    if ((game.room.id==='village' || game.room.villageLandscape) && animalsRest(game) && isPet(object)) {
      if (object.kind==='cat' || object.kind==='dog') result.push(sleepingPet(game,object));
      continue;
    }
    result.push(object);
  }
  if (game.room.id==='village-inn') { addTavernGuests(game,result); return tavernSeatObjects(game,result); }
  return result;
}

/** Erkennt alle bisher außen eingesetzten Tagtiere. @param {object} object Lebewesen. */
function isPet(object) { return ['cat','dog','wildlife'].includes(object.kind); }

/** Wählt geschützte Schlafplätze neben dem Wohnhaus beziehungsweise auf den Dächern. @param {object} game Spiel. @param {object} object Haustier. */
function sleepingPet(game,object) {
  const points={cat:[4,9,13.1],'cat-east':[29,19,23.1],dog:[27,23,24]};
  const [x,y,renderDepth]=points[object.id] || [object.x,object.y,object.y+1];
  return {...object,x,y,drawX:x,drawY:y,renderDepth,route:null,walking:false,sleeping:true,walkThrough:true,passable:object.kind==='cat',hint:'schläft',text:'Es schläft tief und ruhig. Du lässt es weiterschlafen.'};
}

/** Holt dieselben Personen aus ihren Originaldaten statt neue namenlose Gäste anzulegen. @param {object} game Spiel. @param {object[]} result Sichtbare Raumobjekte. */
function addTavernGuests(game,result) {
  const phase=`${game.roomVisit}:${isNightRest(game)}`;
  if (game.roomState.dailyGuestPhase!==phase) { game.roomState.dailyGuestPhase=phase; game.roomState.dailyGuestPoints={}; }
  for (const plan of DAILY_RESIDENTS) {
    if (residentLocation(game,plan.id)!=='village-inn') continue;
    const source=game.rooms.get(plan.home)?.objects.find(/** Vergleicht die Originalperson. @param {object} object Raumobjekt. */ object=>object.id===plan.id);
    if (!source || source.id==='forest-traveller' && !game.flags.eastDoorStudied) continue;
    const [x,y]=game.roomState.dailyGuestPoints[plan.id] ||= guestPoint(game,result,plan.point);
    result.push({...source,x,y,drawX:x,drawY:y,route:null,walking:false,scheduled:true,kind:source.appearance?'resident':'npc'});
  }
}

/** Hält Möbel, Türen, Bedienwege und den Spieler beim Erscheinen der Gäste frei. @param {object} game Spiel. @param {object[]} objects Belegte Plätze. @param {number[]} point Wunschplatz. */
function guestPoint(game,objects,point) {
  const queue=[point],seen=new Set();
  for (let cursor=0;cursor<queue.length;cursor++) {
    const [x,y]=queue[cursor],key=`${x},${y}`;
    if (seen.has(key) || x<1 || y<1 || x>=game.room.width-1 || y>=game.room.height-1) continue;
    seen.add(key);
    if (guestCellFree(game,objects,x,y)) return [x,y];
    for (const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]) queue.push([x+dx,y+dy]);
  }
  return point;
}

/** Reserviert Durchgang zur Treppe, Thekenbedienung und die mittlere Eingangsspur. @param {object} game Spiel. @param {object[]} objects Einrichtung. @param {number} x Spalte. @param {number} y Zeile. */
function guestCellFree(game,objects,x,y) {
  if (wall(game,x,y) || x===6 && y>=9 || x>=14 && y>=6 || x===9 && y<=5) return false;
  if (game.player.x===x && game.player.y===y || game.move?.x===x && game.move?.y===y) return false;
  return !objects.some(/** Prüft den tatsächlichen Fußabdruck. @param {object} object Einrichtung. */ object=>contains(object,x,y));
}

/** Gibt den ausgeliehenen Ast bei Nachtruhe verlustfrei frei und entfernt alte Tierreservierungen. @param {object} game Spiel. */
export function settleSleepingDog(game) {
  if (!animalsRest(game)) return;
  const state=game.states.get('village');
  if (!state?.fetch) return;
  state.fetch=null;
  if (state.wanderers?.dog) Object.assign(state.wanderers.dog,{x:25,y:24,fromX:25,fromY:24,moving:false,index:0,wait:3});
}

/** Verweigert nur das nächtliche Betreten vom Dorf aus, niemals das Verlassen oder die Schenke. @param {object} game Spiel. @param {object} door Hauseingang. */
export function respectNightRest(game,door) {
  const destination=door.to || (door.action==='village-door'?'village-guild':'');
  if (game.room.id!=='village' || !isNightRest(game) || !destination.startsWith('village-') || destination.startsWith('village-inn')) return false;
  game.say(door.name,'Die Tür ist geschlossen. Im Haus ist es still. Du respektierst die Nachtruhe und kommst am Morgen wieder.','ui-denied');
  return true;
}
