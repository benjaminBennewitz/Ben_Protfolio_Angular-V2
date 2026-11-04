import { MEADOW_CHANNEL,MEADOW_WEIR,MEADOW_BRIDGE,meadowPaths,meadowStreamObjects,meadowNeighbourRooms } from './meadow-stream.js';
import { meadowWildlife,meadowRocks,MEADOW_BIRDS } from './meadow-wildlife.js';
import { houseGeometry } from './house-shapes.js';
import { furniture } from './house-furniture.js';
import { openForestPassages } from './forest-passages.js';
import { prop } from './town.js';

const BEDS=[
  {x:3,y:4,w:7,h:4,kind:'f'},{x:14,y:3,w:8,h:3,kind:'t'},
  {x:19,y:6,w:7,h:5,kind:'f'},{x:3,y:13,w:7,h:4,kind:'t'},
  {x:14,y:14,w:7,h:4,kind:'f'},{x:22,y:12,w:5,h:5,kind:'t'},
  {x:26,y:13,w:7,h:8,kind:'t'},{x:16,y:19,w:9,h:4,kind:'f'},
];
const LAKE_SPANS={4:[22,27],5:[21,29],6:[21,30],7:[21,30],8:[23,28]};
const POOLS=[[11.5,8.5,5,3.2],[11,14.5,3.5,2.4],[27,11,2.9,1.8]];

export const WAYMAKER_LEDGER={id:'east-waymaker-ledger',title:'Letzter Eintrag im Frachtbuch',text:'Eine abgedeckte Kiste ging bei trockenem Boden über die Wiesen. Am nächsten Morgen kam der Träger allein zurück. Neben dem Eintrag ist ein runder Abdruck aus hellem Staub.'};

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
export function createMeadowRooms() { return [station(),meadow(),...meadowNeighbourRooms()]; }

/** Nutzt vorhandene Innenraumgrafiken für eine alte Wegmacherstation. */
function station() {
  const objects=[
    prop('forest-return','Zurück zur Wurzelpforte',6,10,'door','travel',{to:'east-clearing',spawn:[11,5]}),
    prop('meadow-exit','Ausgang ins Licht',6,0,'door','travel',{to:'east-meadow',spawn:[3,10]}),
    furniture('tools','Wegmacherregal',2,1,'cupboard','Keile, Ersatzfedern und Steinschablonen. Nur im mittleren Fach fehlt etwas.'),
    furniture('bench','Werkbank',8,1,'workbench','Ein Ritzstift liegt neben einer Schablone mit drei Kerben. Der Zughebel der Pforte ist über Gegengewichte mit dem Stein draußen verbunden.'),
    prop('waymaker-ledger','Loser Frachtbucheintrag',8,5,'note','note',{note:WAYMAKER_LEDGER,hideWhenRead:true}),
    furniture('supply','Leeres Kistenlager',10,7,'barrel','Im Staub zeichnet sich der Umriss einer frisch fortgeschobenen Kiste ab.'),
  ];
  return {id:'east-waystation',title:'Alte Wegmacherstation',...houseGeometry('workshop'),style:'stone',furnished:true,rugs:[],music:'maras-quellplan',objects};
}

/** Modelliert Wasser und Pflanzen als unregelmäßige Inseln mit offenen Sichtachsen. */
function meadow() {
  const width=34,height=24,ground=[];
  for (let y=0;y<height;y++) {
    let row='';
    for (let x=0;x<width;x++) row+=meadowCell(x,y);
    ground.push(row);
  }
  const objects=[
    prop('station-return','Wurzelpforte · Wegmacherstation',1,10,'trail','travel',{to:'east-waystation',spawn:[6,1],facade:true,hint:'hineingehen'}),
    prop('meadow-view','Blick über die Ostwiesen',24,10,'east-meadow-view','east-meadow-view',{hint:'umschauen'}),
    ...meadowPaths(),...meadowStreamObjects(),...meadowWildlife(),...meadowRocks(),
  ];
  return openForestPassages({id:'east-meadow',revision:6,title:'Die Ostwiesen',width,height,ground,spawn:[3,10],villageLandscape:true,shallows:true,meadowChannel:{points:MEADOW_CHANNEL,source:[28,8],weir:MEADOW_WEIR,bridge:MEADOW_BRIDGE},lakeFall:{x:23,y:2,w:2,h:4},meadowBirds:MEADOW_BIRDS,trees:[[1,3,'pine'],[4,3],[12,3],[2,16],[23,19,'pine'],[31,20],[30,15,'pine'],[15,20]],gardens:BEDS,buildings:[],birds:[],music:'east-meadow-day',objects});
}

/** Legt sandige Wege, flache Tümpel und weiche Pflanzkonturen übereinander. @param {number} x Spalte. @param {number} y Zeile. */
function meadowCell(x,y) {
  for (const [cx,cy] of MEADOW_CHANNEL) if (x===cx && y===cy) return 'k';
  const water=meadowWater(x,y);
  if (water) return water;
  if (y<=2 || (x>=30 && y>=3 && y<=7) || (x===0 && y>=7 && y<=12 && y!==10)) return 'r';
  if (x>=17 && x<=20 && y>=4 && y<=8 && Math.abs(x-18)+Math.abs(y-6)<=3) return 't';
  if ((x<=8 && Math.abs(y-10)<=1) || (x>=18 && x<=24 && y===10)) return '.';
  if ((x===20 && y>=15) || (y===15 && x>=20 && x<=30) || (x===30 && y>=9 && y<=15)) return '.';
  if (nearMeadowWater(x,y)) return 't';
  for (const g of BEDS) if (((x-g.x+0.5)/g.w-0.5)**2+((y-g.y+0.5)/g.h-0.5)**2<0.23) return g.kind;
  return 'g';
}


/** Trennt watbare Senken vom tiefen See und seinem Zulauf. @param {number} x Spalte. @param {number} y Zeile. */
function meadowWater(x,y) {
  if (x>=23 && x<=24 && y>=2 && y<=5) return 'l';
  const span=LAKE_SPANS[y];
  if (span && x>=span[0] && x<=span[1]) return 'l';
  for (const [cx,cy,rx,ry] of POOLS) if (((x-cx)/rx)**2+((y-cy)/ry)**2<1) return 's';
  return '';
}


/** Verbreitert die Uferwiese auch diagonal, ohne das tiefe Wasser begehbar zu machen. @param {number} x Spalte. @param {number} y Zeile. */
function nearMeadowWater(x,y) {
  for (let dy=-1;dy<=1;dy++) for (let dx=-1;dx<=1;dx++) {
    const water=meadowWater(x+dx,y+dy);
    if (water==='l' || water==='s' && (!dx || !dy)) return true;
  }
  return false;
}
