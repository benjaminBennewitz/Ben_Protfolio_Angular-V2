import { prop } from './town.js';

const FURNISHINGS={
  vestibule:[['urn',3,2],['urn',10,2],['crate',2,4],['rubble',9,8]],
  gallery:[['barrel',3,2],['barrel',4,2],['urn',13,8],['rubble',8,8]],
  mechanism:[['gear',10,2],['barrel',10,8],['urn',2,8]],
  guardpost:[['workbench',5,2],['crate',2,2],['crate',3,2],['barrel',11,8]],
  nest:[['cocoon',2,2],['cocoon',13,2],['cocoon',12,11]],
};
const INFO={
  urn:['Alte Tonurne','Eine gesprungene Vorratsurne aus der Zeit der Wassermeister. Sie ist leer.'],
  barrel:['Vorratsfass','Ein altes Fass, von Feuchtigkeit verzogen. Zwischen den Brettern wächst Moos.'],
  crate:['Morsche Transportkiste','Leere Kisten für Werkzeug und Lampenöl. Die Markierungen gehören zur alten Gilde.'],
  rubble:['Eingestürztes Mauerstück','Ein niedriger Mauerrest. Der freie Gang führt seitlich daran vorbei.'],
  gear:['Altes Kettenlager','Das Kettenlager gehört zur Mechanik des Fallgitters. Die Druckplatte hält das Gegengewicht unten.'],
  workbench:['Verlassene Werkbank','Rostige Werkzeuge, ein leerer Ölkrug und die Kerben einer alten Wachmannschaft.'],
  cocoon:['Alter Kokon','Ein staubiger Kokon, fest an die Wand gesponnen. Die Spinnen haben hier lange ungestört genistet.'],
};

/** Richtet jede Dungeonzone entlang ihrer Wände ein, ohne die Laufplatten oder bestehenden Rätsel zu überdecken. @param {object} room Raum. */
export function furnishDungeon(room) {
  for (const [kind,x,y] of FURNISHINGS[room.style]) {
    const [name,text]=INFO[kind],w=['workbench','rubble'].includes(kind)?2:1;
    room.objects.push(prop(`decor-${kind}-${x}-${y}`,name,x,y,`dungeon-${kind}`,'inspect',{w,text}));
  }
}
