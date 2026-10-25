import { GUEST_SEATS } from '../data/tavern-company.js';

/** Belegt geeignete Stühle pro Besuch und Tagesphase, ohne einen Spielerplatz zu übernehmen. @param {object} game Spiel. @param {object[]} objects Sichtbare Einrichtung und Gäste. */
export function tavernSeatObjects(game,objects) {
  const present=objects.filter(/** Erkennt tatsächlich anwesende Gäste. @param {object} object Person. */ object=>object.scheduled).map(/** Liefert die Personenkennung. @param {object} object Person. */ object=>object.id).join(',');
  const phase=`${game.roomState.dailyGuestPhase}:${present}`;
  if (game.roomState.guestSeatsPhase!==phase) {
    game.roomState.guestSeatsPhase=phase; game.roomState.guestSeats=allocateSeats(game,objects);
  }
  const seats=game.roomState.guestSeats,result=[];
  for (const object of objects) {
    const seat=seats[object.id];
    if (seat) result.push({...object,x:seat.x,y:seat.y,drawX:seat.x,drawY:seat.y,facing:seat.facing,seated:true,seatId:seat.chair,hint:'ansprechen'});
    else {
      const owner=Object.keys(seats).find(/** Erkennt den belegten Stuhl. @param {string} id Person. */ id=>seats[id].chair===object.id);
      result.push(owner?{...object,passable:true,occupiedBy:owner,hint:'besetzt'}:object);
    }
  }
  return result;
}

/** Reserviert nur anwesenden Gästen freie Sitzplätze; Körper und Ausstieg des Spielers bleiben frei. @param {object} game Spiel. @param {object[]} objects Raumobjekte. */
function allocateSeats(game,objects) {
  const seats={};
  for (const [id,plan] of Object.entries(GUEST_SEATS)) {
    if (!objects.some(/** Erkennt den anwesenden Gast. @param {object} object Person. */ object=>object.id===id)) continue;
    const chair=objects.find(/** Erkennt das Sitzmöbel. @param {object} object Stuhl. */ object=>object.id===plan.chair);
    if (!chair || game.seat?.id===chair.id) continue;
    if (game.player.x===chair.x && game.player.y===chair.y || game.move?.x===chair.x && game.move?.y===chair.y) continue;
    if (game.seat?.exit[0]===chair.x && game.seat?.exit[1]===chair.y) continue;
    seats[id]={...plan,x:chair.x,y:chair.y};
  }
  return seats;
}
