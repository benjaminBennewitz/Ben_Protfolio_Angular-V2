import { houseGeometry } from './house-shapes.js';
import { furniture } from './house-furniture.js';
import { openForestPassages } from './forest-passages.js';
import { prop } from './town.js';

const BEDS=[
  {x:3,y:4,w:7,h:4,kind:'f'},{x:14,y:3,w:8,h:3,kind:'t'},
  {x:19,y:6,w:7,h:5,kind:'f'},{x:3,y:13,w:7,h:4,kind:'t'},
  {x:14,y:14,w:7,h:4,kind:'f'},{x:22,y:12,w:5,h:5,kind:'t'},
];
const POOLS=[[11.5,8.5,5,3.2],[11,14.5,3.5,2.4],[22,3,2.7,1.5]];

export const ROOT_MARKS=[
  {id:'root-chalk',name:'Heller Stein',text:'Ein Pfeil zum Bach. Weiße Kreide sitzt lose auf dem Stein; der Rand darunter ist unberührt.'},
  {id:'root-notch',name:'Tief gekerbter Stein',text:'Drei tiefe Kerben, eine ist durchgestrichen. Am unteren Rand ist der Stein blank und glatt.'},
  {id:'root-ring',name:'Runder Stein',text:'Ein Kreis aus verwitterten Punkten. Moos wächst ungebrochen bis in die Fuge darunter.'},
];

/** Setzt die drei Wegmarken an den zugänglichen Fuß der alten Mauer. @param {object} room Lichtung. */
export function addRootMarks(room) {
  for (const [index,mark] of ROOT_MARKS.entries()) {
    room.objects.push(prop(mark.id,mark.name,9+index*2,6,'east-root-mark','east-root-mark',{index,hint:'prüfen'}));
  }
}

/** Liefert die kleine Durchgangsstation und das erste offene Stück der Ostwiesen. */
export function createMeadowRooms() { return [station(),meadow()]; }

/** Nutzt vorhandene Innenraumgrafiken für eine alte Wegmacherstation. */
function station() {
  const objects=[
    prop('forest-return','Zurück zur Wurzelpforte',6,10,'door','travel',{to:'east-clearing',spawn:[11,5]}),
    prop('meadow-exit','Ausgang ins Licht',6,0,'door','travel',{to:'east-meadow',spawn:[3,10]}),
    furniture('tools','Wegmacherregal',2,1,'cupboard','Keile, Ersatzfedern und Steinschablonen. Nur im mittleren Fach fehlt etwas.'),
    furniture('bench','Werkbank',8,1,'workbench','Ein Ritzstift liegt neben einer Schablone mit drei Kerben. Der Zughebel der Pforte ist über Gegengewichte mit dem Stein draußen verbunden.'),
    prop('waymaker-ledger','Aufgeschlagenes Frachtbuch',8,5,'note','east-waymaker-ledger'),
    furniture('supply','Leeres Kistenlager',10,7,'barrel','Im Staub zeichnet sich der Umriss einer frisch fortgeschobenen Kiste ab.'),
  ];
  return {id:'east-waystation',title:'Alte Wegmacherstation',...houseGeometry('workshop'),style:'stone',furnished:true,rugs:[],music:'maras-quellplan',objects};
}

/** Modelliert Wasser und Pflanzen als unregelmäßige Inseln mit offenen Sichtachsen. */
function meadow() {
  const width=28,height=20,ground=[];
  for (let y=0;y<height;y++) {
    let row='';
    for (let x=0;x<width;x++) row+=meadowCell(x,y);
    ground.push(row);
  }
  const objects=[
    prop('station-return','Zurück zur Wegmacherstation',2,10,'trail','travel',{to:'east-waystation',spawn:[6,1]}),
    prop('meadow-view','Blick über die Ostwiesen',24,10,'east-meadow-view','east-meadow-view',{hint:'umschauen'}),
    prop('meadow-frog','Wiesenfrosch',12,9,'wildlife','inspect',{animal:'frog',spriteSet:'awakening',passable:true,walkThrough:true,route:[[12,9],[13,9],[13,8],[12,8]],text:'Der Frosch zieht winzige Kreise auf dem Wasser.'}),
    prop('meadow-hedgehog','Igel',6,15,'wildlife','inspect',{animal:'hedgehog',route:[[6,15],[7,15],[7,14],[6,14]],text:'Zwischen den Halmen raschelt ein kleiner Igel.'}),
  ];
  return openForestPassages({id:'east-meadow',title:'Die Ostwiesen',width,height,ground,spawn:[3,10],villageLandscape:true,shallows:true,trees:[[1,2,'pine'],[4,1],[24,1],[2,16],[23,17,'pine'],[26,15]],gardens:BEDS,buildings:[],birds:[{x:24,y:1,treeY:1,facing:'left'}],music:'forest-canopy',objects});
}

/** Legt sandige Wege, flache Tümpel und weiche Pflanzkonturen übereinander. @param {number} x Spalte. @param {number} y Zeile. */
function meadowCell(x,y) {
  for (const [cx,cy,rx,ry] of POOLS) if (((x-cx)/rx)**2+((y-cy)/ry)**2<1) return 's';
  if (x<=8 && Math.abs(y-10)<=1 || x>=17 && x<=24 && Math.abs(y-10)<=1) return '.';
  for (const g of BEDS) if (((x-g.x+0.5)/g.w-0.5)**2+((y-g.y+0.5)/g.h-0.5)**2<0.23) return g.kind;
  return 'g';
}
