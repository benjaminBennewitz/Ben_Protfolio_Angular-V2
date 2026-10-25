import { createHouseRoom } from './house-rooms.js';
import { prop } from './town.js';
import { VILLAGE_SIZE, GARDENS, createResidents } from './village-life.js';
import { northGround } from './village-north.js';
import { createRiverWildlife, createPerchedBirds } from './village-fauna.js';
import { createVillageDiscoveries } from './discoveries.js';

export const INVITATION = { id: 'invitation', title: 'Abenteurer gesucht', text: 'Abenteurer gesucht. Unterkunft und Ausrüstung werden gestellt. Meldung bei der Gilde zu Bruchstein.' };
export const KEEPER_PATH = [[15,10],[14,10],[13,10],[12,10],[12,9],[12,8],[12,7],[13,7]];
export const BUILDINGS = [
  { id:'guild', x:9, y:2, w:6, h:5 },
  { id:'inn', x:2, y:8, w:5, h:5 },
  { id:'mill', x:19, y:5, w:4, h:4 },
  { id:'weaver', x:26, y:4, w:5, h:5 },
  { id:'home', x:26, y:18, w:5, h:5 },
  { id:'workshop', x:3, y:21, w:5, h:5 },
  { id:'market', x:19, y:22, w:5, h:4 },
];

/** Erstellt eine zusammenhängende Karte mit eindeutigem Gelände. */
function createGround() {
  const rows = [];
  for (let y = 0; y < VILLAGE_SIZE.height; y++) {
    let row = '';
    for (let x = 0; x < VILLAGE_SIZE.width; x++) row += groundAt(x,y);
    rows.push(row);
  }
  return rows;
}

/** Bestimmt Wege, Platz und Mühlgraben an zentraler Stelle. @param {number} x Spalte. @param {number} y Zeile. */
function groundAt(x,y) {
  const north=northGround(x,y); if (north) return north;
  if (x >= 17 && x <= 18 && y >= 1 && y <= 30) return [12,13,26,27].includes(y) ? 'b' : 'w';
  if (x>=9 && x<=12 && y>=10 && y<=13) return 'e';
  if (x >= 8 && x <= 15 && y >= 9 && y <= 14) return 'p';
  if (x >= 11 && x <= 13 && y >= 7 && y <= 9) return '.';
  if (x >= 10 && x <= 12 && y >= 15) return '.';
  if (x >= 15 && x <= 16 && y <= 8) return '.';
  if (x >= 5 && x <= 33 && y >= 12 && y <= 13) return '.';
  if (x === 16 && y >= 8 && y <= 14) return '.';
  if (x >= 19 && x <= 21 && y >= 9 && y <= 14) return '.';
  if (x >= 23 && x <= 24 && y >= 12 && y <= 27) return '.';
  if (x >= 27 && x <= 28 && y >= 9 && y <= 12) return '.';
  if (x >= 24 && x <= 29 && y >= 23 && y <= 24) return '.';
  if (x >= 5 && x <= 24 && y >= 26 && y <= 27) return '.';
  for (const garden of GARDENS) if (x>=garden.x && x<garden.x+garden.w && y>=garden.y && y<garden.y+garden.h) return garden.kind;
  return 'g';
}

/** Gruppiert die Bäume, ohne Wege oder Gebäude zu versperren. */
function createTrees() {
  const trees = [[2,2],[4,2],[6,2],[2,4],[4,4],[2,18],[8,19],[14,21],[20,17],[29,14],[30,16],[26,28],[28,28],[14,28]];
  for (let y=2;y<VILLAGE_SIZE.height;y+=2) { trees.push([0,y]); if (y!==12) trees.push([32,y]); }
  for (let x=2;x<32;x+=2) if (x<9 || x>13) trees.push([x,30]);
  for (const tree of trees) if (([0,32].includes(tree[0]) && tree[1]%6===4) || [[2,18],[28,28],[14,28]].some(sameTree.bind(null,tree))) tree.push('pine');
  return trees;
}

/** Vergleicht zwei Baumstandorte ohne ihre Darstellungsvariante. @param {number[]} tree Baum. @param {number[]} point Vergleichspunkt. */
function sameTree(tree,point) { return tree[0]===point[0] && tree[1]===point[1]; }

/** Ergänzt untersuchbare Alltagsgegenstände, ohne neue Spielsysteme einzuführen. */
function villageDetails() {
  return [
    prop('bench','Sitzbank',5,16,'village-bench','inspect',{w:2,text:'Von hier sieht man den ganzen Platz. In der Lehne steht: Mara war hier.'}),
    prop('logs','Holzstapel',2,13,'village-logs','inspect',{w:2,text:'Trockenes Feuerholz für die Schenke. Es riecht nach Harz.'}),
    prop('barrel','Regenfass',7,10,'village-barrel','inspect',{text:'Auf dem Wasser schwimmt ein einzelnes Blatt.'}),
    prop('hitching-post','Anbindepfosten',7,12,'village-post','inspect',{text:'Hier binden Reisende ihre Pferde an. Das Holz ist an den Kanten blank gescheuert.'}),
    prop('north-gate','Höhlen-Sperre',15,1,'gate','mara-north',{text:'GEFAHR: Der Höhlenweg zum Nordwald ist gesperrt. Die Gilde muss den Durchgang erst freigeben. Hilf zunächst den Leuten im Dorf.'}),
    prop('east-hatch','Wartungsluke',30,11,'east-hatch','east-pump-entry',{hint:'öffnen'}),
    prop('east-gate','Ostpass-Sperre',32,12,'gate','east-gate',{h:2,text:'GEFAHR: Der Ostpass ist unsicher. Auf Anordnung der Gilde gesperrt, bis die offenen Aufgaben im Dorf erledigt sind.'}),
  ];
}

/** Erstellt den neuen, eigenständigen Dorfauftakt. */
export function createVillage() {
  const objects = [
    prop('guild-door','Gildentür',12,6,'door','village-door'),
    prop('door-note','Türzettel',14,7,'sign','inspect',{text:'Klemmt. Nicht dagegen treten. — Hausmeister'}),
    prop('keeper','Hausmeister',15,10,'npc','village-keeper'),
    prop('branch','Ast im Wasserrad',17,8,'branch','village-branch',{w:2}),
    prop('sluice','Wehrhebel',16,9,'lever','village-sluice'),
    prop('well','Dorfbrunnen',10,11,'well','inspect',{w:2,h:2,text:'Kühles Wasser. Am Brunnenrand liegen zwei blank geriebene Gildenmünzen.'}),
    prop('board','Anschlagbrett',8,8,'sign','inspect',{text:'Abenteurer gesucht. Derselbe Aushang wie in deinem Gepäck. Die Tinte hier ist schon verblichen.'}),
    prop('inn-door','Schenkentür',4,12,'door','travel',{to:'village-inn',text:'Zum schiefen Kessel. Die Wirtin steht gleich draußen.'}),
    prop('host','Wirtin',5,14,'host','talk',{appearance:[156,368],text:'Zur Gilde? Der Hausmeister ist drüben am Wehr. Und falls sie dich behalten: Ein Zimmer hätten wir noch.'}),
    prop('cat','Katze',3,14,'cat','inspect',{route:[[3,14],[4,14],[4,15],[3,15]],text:'Sie öffnet ein Auge. Deine Ankunft rechtfertigt offenbar kein zweites.'}),
    ...villageDetails(), ...createResidents(), ...createRiverWildlife(), ...createVillageDiscoveries(),
    prop('mill-door','Mühlenhaus',20,8,'door','travel',{to:'village-mill',text:'Das Rad steht still. Vom Wehr kommt nur ein dünnes Rinnsal.'}),
    prop('cartographer','Feuchte Notiz',19,15,'note','note',{note:{id:'cartographer-1',title:'Ein fehlender Gang',text:'Unter dem Archiv verläuft ein älterer Gang. Auf den neuen Plänen fehlt er. Morgen frage ich in der Gilde nach. — Mara, Kartografin'}}),
    prop('south-sign','Wegschild',13,28,'sign','inspect',{text:'Bruchstein. Gilde und Schenke am Dorfplatz. Du bist am richtigen Ort.'}),
  ];
  return {id:'village',title:'Bruchstein',...VILLAGE_SIZE,spawn:[11,29],music:'town-square',ground:createGround(),gardens:GARDENS,trees:createTrees(),birds:createPerchedBirds(),buildings:BUILDINGS,objects};
}

/** Erstellt einen kleinen Abschlussraum mit Rückweg zum Dorf. */
export function createGuildEntrance() { return createHouseRoom('guild'); }
