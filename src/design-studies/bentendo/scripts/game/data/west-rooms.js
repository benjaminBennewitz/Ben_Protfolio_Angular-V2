import { prop } from './town.js';

/** Verbindet den verschneiten Westweg mit Schutzstelle, Nachtfund und Dungeonvorplatz. */
export function createWestRooms() {
  return [edge(),ridge(),lodge(),gate()];
}

/** Baut einen verschneiten Grundriss mit dunklen Felsrändern und geschlossenen Baumgruppen. @param {string} id Kennung. @param {string} title Titel. @param {number[][]} paths Freie Wegflächen. @param {object[]} objects Einrichtungen. */
function winterRoom(id,title,paths,objects) {
  const width=23,height=17,grid=Array.from({length:height},/** Erstellt eine Waldzeile. */ ()=>Array(width).fill('v'));
  for (const [x,y,w,h] of paths) for (let yy=y;yy<y+h;yy++) for (let xx=x;xx<x+w;xx++) grid[yy][xx]='.';
  const trees=[];
  for (let y=0;y<height-1;y+=2) for (let x=0;x<width-1;x+=2) {
    if ([grid[y][x],grid[y][x+1],grid[y+1][x],grid[y+1][x+1]].every(/** Erkennt geschlossenen Wald. @param {string} cell Kachel. */ cell=>cell==='v')) trees.push([x,y,'pine']);
  }
  return {id,title,width,height,spawn:[2,8],winter:true,villageLandscape:true,ground:grid.map(/** Serialisiert eine Zeile. @param {string[]} row Kacheln. */ row=>row.join('')),trees,gardens:[],birds:[],buildings:[],objects,music:'forest-canopy'};
}

/** Verbindet feste Ankunftspunkte über die vorhandene Reisetaste A. @param {string} id Kennung. @param {number} x Spalte. @param {number} y Zeile. @param {string} to Ziel. @param {number[]} spawn Ankunft. */
function trail(id,x,y,to,spawn) {
  return prop(id,'Verschneiter Weg',x,y,'winter-trail','travel',{to,spawn,hint:'weitergehen'});
}

/** Führt von Bruchstein an die ersten Schneeverwehungen. */
function edge() {
  return winterRoom('west-edge','Westweg · Erste Schneefelder',[
    [1,7,7,3],[6,5,7,6],[12,7,4,3],[15,3,6,6],[19,2,3,3],
  ],[
    trail('village',1,8,'village',[3,16]),trail('ridge',21,3,'west-ridge',[2,8]),
    prop('winter-sign','Verschneiter Wegweiser',7,5,'sign','inspect',{text:'Westpass. Letzte warme Stube: Bruchstein. Wer den Pass kennt, hält sich an die dunklen Wegpfähle.'}),
    prop('shelter','Windgeschützte Feuerstelle',10,9,'winter-fire','winter-rest',{hint:'aufwärmen'}),
  ]);
}

/** Teilt den Passweg zwischen der Schutzhütte und einer nachts leuchtenden Wegmarke. */
function ridge() {
  return winterRoom('west-ridge','Westpass · Windgrat',[
    [1,7,9,3],[7,4,6,7],[9,1,3,4],[12,7,5,3],[16,5,6,4],[5,10,4,4],
  ],[
    trail('edge',1,8,'west-edge',[20,3]),trail('lodge',10,1,'west-lodge',[10,13]),
    trail('gate',21,6,'west-gate',[2,8]),
    prop('night-marker','Vereiste Wegleuchte',6,13,'winter-marker','winter-marker',{hint:'untersuchen'}),
    prop('supply-bag','Zurückgelassener Reisebeutel',12,5,'chest','winter-supplies'),
  ]);
}

/** Bietet vor dem letzten Aufstieg eine windstille Rast und einen Tageskontakt. */
function lodge() {
  const room=winterRoom('west-lodge','Westpass · Alte Schutzhütte',[[5,3,12,9],[9,11,3,4]],[
    trail('ridge',10,14,'west-ridge',[10,2]),
    prop('stove','Glühender Ofen',7,4,'winter-fire','winter-rest',{hint:'aufwärmen'}),
    prop('iva','Iva, Weglaternenhüterin',14,5,'resident','winter-iva',{appearance:[156,368],revealedBy:'rootSpringFlowing'}),
    prop('route-ledger','Wachbuch',6,8,'sign','inspect',{text:'Iva hält die alte Passleuchte in Gang. Nachts geht sie zum schiefen Kessel. Neben dem Ofen ist Platz für Durchreisende.'}),
  ]);
  room.sheltered=true; room.trees=[];
  return room;
}

/** Zeigt das nächste Ziel im Fels, bevor der eigentliche Eisdungeon ausgearbeitet wird. */
function gate() {
  return winterRoom('west-gate','Westpass · Frostpforte',[
    [1,7,8,3],[8,5,5,6],[12,3,7,5],[16,2,4,3],
  ],[
    trail('ridge',1,8,'west-ridge',[20,6]),
    prop('frost-door','Tor zum Frostgewölbe',18,2,'winter-gate','winter-gate',{hint:'untersuchen'}),
    prop('pass-tablet','Verwitterte Tafel',13,7,'sign','inspect',{text:'Wassermeister des Westpasses. Bewahrt die Leuchte, wenn der Schnee die Wege verschluckt.'}),
  ]);
}
