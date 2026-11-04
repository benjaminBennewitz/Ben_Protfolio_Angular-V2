const HALF_FADE=0.24;
const DESTINATIONS={
  village:{room:'east-clearing',spawn:[14,9],name:'zur Wurzelpforte'},
  'east-clearing':{room:'village',spawn:[31,15],name:'nach Bruchstein'},
};

/** Fragt vor der Fahrt nach Zustimmung und sperrt die Verbindung bis zur geöffneten Pforte. @param {object} game Spiel. @param {object} stone Wegmacherstein. */
export function useWaystone(game,stone) {
  const destination=DESTINATIONS[game.room.id];
  if (!destination || !game.rooms.has(destination.room) || !game.flags.eastRootOpen) return game.say(stone.name,'Die Laterne ist aus. Die alte Strecke führt zur Wurzelpforte.');
  game.say(stone.name,`Reise ${destination.name}? A: Ja · B: Abbrechen`);
  (game.pages.at(-1) || game.message).onConfirm=startWaystoneRide;
}

/** Beginnt die Fahrt erst nach Bestätigung. @param {object} game Spiel. */
function startWaystoneRide(game) {
  const destination=DESTINATIONS[game.room.id];
  if (!destination || !game.flags.eastRootOpen) return;
  game.sounds.push('waystone-ride'); game.held=null;
  if (game.reduced) return game.travel(destination.room,destination.spawn,null);
  game.waystoneRide={destination,elapsed:0,arrived:false};
}

/** Wechselt das Gebiet bei vollständig dunklem Bild und hält die Spieluhr an. @param {object} game Spiel. @param {number} dt Sekunden. */
export function updateWaystoneRide(game,dt) {
  const ride=game.waystoneRide;
  ride.elapsed+=dt;
  if (!ride.arrived && (ride.elapsed>=HALF_FADE || game.reduced)) {
    game.travel(ride.destination.room,ride.destination.spawn,null);
    if (game.reduced) return;
    ride.elapsed=HALF_FADE; ride.arrived=true; game.waystoneRide=ride;
  }
  if (game.reduced || ride.elapsed>=2*HALF_FADE) game.waystoneRide=null;
}

/** Liefert die Deckkraft der Reiseblende. @param {object} ride Laufende Fahrt. */
export function waystoneFade(ride) { return Math.max(0,1-Math.abs(ride.elapsed/HALF_FADE-1)); }
