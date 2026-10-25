import { prop } from './town.js';

const FLOORS={
  vestibule:[[1,2,10,7],[1,7,5,3],[9,5,4,3]],
  gallery:[[3,2,11,3],[1,6,4,1],[4,4,8,4],[10,6,5,2],[7,7,7,3]],
  mechanism:[[1,4,7,4],[2,2,5,2],[1,8,4,2],[8,6,5,1],[9,2,4,8]],
  guardpost:[[1,5,12,3],[2,2,9,3],[7,8,5,2]],
  nest:[[4,2,8,10],[2,3,12,7],[1,8,5,4],[11,7,3,5],[2,2,3,2],[11,2,3,2]],
};
const PILLARS={vestibule:[[7,4]],gallery:[[6,4],[10,8]],mechanism:[],guardpost:[[7,4]],nest:[[4,6],[11,5]]};

/** Verbindet Kammern, Nischen und schmale Korridore statt einer gemeinsamen Rechteckschablone. @param {object} room Dungeonraum. */
export function shapeDungeon(room) {
  const grid=[];
  for (let y=0;y<room.height;y++) grid.push(Array(room.width).fill('#'));
  for (const [x,y,w,h] of FLOORS[room.style]) for (let yy=y;yy<y+h;yy++) for (let xx=x;xx<x+w;xx++) grid[yy][xx]='.';
  room.layout=[];
  for (const row of grid) room.layout.push(row.join(''));
  for (const [x,y] of PILLARS[room.style]) room.objects.push(prop(`pillar-${x}-${y}`,'Gemauerte Säule',x,y,'dungeon-pillar','inspect',{text:'Ein tragender Pfeiler des alten Quellgewölbes. Der Weg führt seitlich daran vorbei.'}));
}
