import { HOUSES, prop } from './town.js';
const FURNITURE = {
  inn: [[2,2,'counter','Theke'],[3,2,'counter','Theke'],[9,4,'table','Esstisch'],[3,7,'table','Würfeltisch']],
  guild: [[2,2,'counter','Anmeldung'],[3,2,'counter','Anmeldung'],[9,3,'shelf','Auftragsregal'],[9,7,'table','Besprechungstisch']],
  workshop: [[2,2,'bench','Werkbank'],[3,2,'bench','Werkbank'],[10,3,'shelf','Werkzeugregal'],[3,7,'box','Materialkiste']],
  market: [[2,2,'shelf','Vorratsregal'],[3,2,'shelf','Vorratsregal'],[9,3,'box','Reisekiste'],[9,6,'box','Warentruhe']],
};
const UPPER = [[2,2,'shelf','Bücherregal'],[3,3,'bed','Gästebett'],[9,3,'desk','Schreibtisch'],[3,7,'table','Lesetisch']];

/** Baut eine eingerichtete Hausetage. @param {object} house Gebäude. @param {number} floor Etage. */
function createInterior(house, floor) {
  const objects = [];
  const furniture = floor ? UPPER : FURNITURE[house.id];
  for (const [x,y,kind,name] of furniture) objects.push(prop(`${x}-${y}`, name, x, y, kind, 'inspect', { text: `${name}: sorgfältig gepflegt und täglich in Gebrauch. Hier hat alles seinen Platz.` }));
  objects.push(prop('exit', 'Haustür', 6, 10, 'door', 'travel', { to: 'city', spawn: [house.x + 2, house.y + 5] }));
  if (house.floors > 1) objects.push(prop('stairs', floor ? 'Treppe hinunter' : 'Treppe hinauf', 11, 2, 'stairs', 'travel', { to: `${house.id}-${1-floor}`, spawn: [11,3] }));
  return { id: `${house.id}-${floor}`, title: `${house.name} ${floor ? 'OG' : 'EG'}`, width: 14, height: 12, spawn: [6,9], music: 'town-square', interior: true, objects };
}

/** Erstellt alle bereits vereinbarten Innenräume und Etagen. */
export function createInteriors() {
  const rooms = [];
  for (const house of HOUSES) {
    for (let floor = 0; floor < (house.floors || 0); floor++) rooms.push(createInterior(house, floor));
  }
  return rooms;
}

/** Erstellt einen angrenzenden Waldabschnitt. @param {string} direction Himmelsrichtung. */
export function createForest(direction) {
  const trees = [];
  for (let i = 0; i < 30; i++) {
    const x = 2 + (i * 7) % 28, y = 2 + (i * 5) % 18;
    if (x < 13 || x > 18) trees.push([x,y]);
  }
  const spawn = direction === 'north' ? [15,1] : [30,12];
  const objects = [prop('return','Weg nach Bruchstein',15,22,'trail','travel',{to:'city',spawn})];
  objects.push(prop('sign','Wegschild',18,9,'sign','inspect',{text:'Hinter den Bäumen beginnt der nächste Reiseabschnitt. Hier wird unser neues Abenteuer weitergehen.'}));
  return { id: `forest-${direction}`, title: 'Waldrand', width:32, height:24, spawn:[15,21], music:'town-square', trees, objects };
}
