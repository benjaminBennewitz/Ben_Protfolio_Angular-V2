import { animalsRest } from './daily-life.js';

/** Lässt Vögel vor nahen Schritten auffliegen und nach Ruhe zurückkehren. @param {object} game Spiel. @param {number} dt Zeitschritt. */
export function updateMeadowBirds(game,dt) {
  if (!game.room.meadowBirds || animalsRest(game)) return;
  const flights=game.roomState.meadowFlights ||= [];
  const {x,y}=game.move || game.player;
  for (const [index,bird] of game.room.meadowBirds.entries()) {
    const near=Math.hypot(x-bird.x,y-bird.y)<=2.4;
    if (flights[index]===undefined) { if (near) flights[index]=0; continue; }
    flights[index]+=dt;
    if (flights[index]>=8 && !near) delete flights[index];
  }
}
