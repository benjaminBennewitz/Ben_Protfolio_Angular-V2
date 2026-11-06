import { enemy } from './quell-dungeon.js';
import { prop } from './town.js';

/** Baut acht begehbare Waldkammern mit abgestuften Gefahren. */
export function createRootDungeon() {
  return [
    room('root-entry','Wurzelgrund · Grenzpfad',[
      [1,6,7,1],[6,4,6,4],[11,5,4,1],[14,5,1,3],[14,7,4,1],
    ],[[7,6],[8,6]],[
      passage('exit',1,6,'east-lowland',[16,9]),passage('east',17,7,'root-turn',[2,7]),
      prop('warning','Abgebrochener Pfahl',7,4,'sign','inspect',{text:'Der Boden ist unterhöhlt. Ein Sturz kostet ein Herz. Halte dich an den hellen Boden.'}),
    ]),
    room('root-turn','Wurzelgrund · Spinnenkehre',[
      [1,7,5,1],[5,4,1,4],[5,3,6,3],[10,4,5,1],[13,4,2,4],[13,7,5,1],
    ],[[9,5],[10,3],[14,6]],[
      passage('west',1,7,'root-entry',[16,7]),passage('east',17,7,'root-camp',[2,7]),
    ],[enemy('turn-spider-a','spider',8,3),enemy('turn-spider-b','spider',13,6)]),
    camp(), fork(), cache(), hollow(), gallery(), spring(),
  ];
}

/** Legt Truhen und einen Ausweichpfad im Koboldlager an. */
function camp() {
  return room('root-camp','Wurzelgrund · Koboldlager',[
      [1,7,6,1],[6,3,6,5],[11,4,4,1],[14,4,1,5],[6,7,1,2],[6,8,12,1],[13,5,1,1],
    ],[[9,6],[10,6],[11,7]],[
      passage('west',1,7,'root-turn',[16,7]),
      prop('coins','Koboldtruhe',9,3,'chest','chest',{coins:5}),
      prop('aid','Zurückgelassene Tasche',13,5,'chest','chest',{item:'Feldverband'}),
      passage('east',17,8,'root-fork',[2,7]),
    ],[enemy('camp-kobold-a','kobold',8,4),enemy('camp-kobold-b','kobold',10,5),enemy('camp-gorgon','gorgon',14,8)]);
}

/** Teilt den Weg zwischen der Grubenkante und dem alten Lager im Norden. */
function fork() {
  return room('root-fork','Wurzelgrund · Wurzelgabel',[
    [1,7,7,1],[5,4,6,4],[8,1,2,4],[10,5,5,2],[14,3,4,3],
  ],[[7,5],[8,5],[11,6]],[
    passage('west',1,7,'root-camp',[16,8]),
    passage('north',9,1,'root-cache',[9,8]),
    passage('east',17,4,'root-hollow',[2,7]),
  ],[enemy('fork-spider','spider',12,5)]);
}

/** Gibt dem nördlichen Nebenpfad einen ruhigen Fundort. */
function cache() {
  return room('root-cache','Wurzelgrund · Harzkammer',[
    [9,6,1,4],[6,4,7,3],[3,3,4,2],[10,2,4,3],
  ],[],[
    passage('south',9,9,'root-fork',[9,2]),
    prop('resin-purse','Verschnürter Lederbeutel',3,3,'chest','chest',{coins:6}),
    prop('resin-note','Kerben im Sammelbrett',12,2,'sign','inspect',{text:'Zwölf Striche für zwölf volle Harztöpfe. Unter dem letzten steht: „Seit das Wasser tiefer läuft, bleiben unsere Schalen leer.“'}),
  ],[],[9,8]);
}

/** Führt auf zwei schmalen Stegen um einen zusammenhängenden Einbruch. */
function hollow() {
  return room('root-hollow','Wurzelgrund · Bruchsteg',[
    [1,7,5,1],[5,3,2,5],[7,3,6,5],[13,3,2,6],[14,8,4,1],
  ],[[7,4],[8,4],[9,4],[10,4],[11,4],[12,4],
     [7,5],[8,5],[9,5],[10,5],[11,5],[12,5],
     [7,6],[8,6],[9,6],[10,6],[11,6],[12,6]],[
    passage('west',1,7,'root-fork',[16,4]),
    passage('east',17,8,'root-gallery',[2,7]),
  ],[enemy('bridge-spider','spider',10,3)]);
}

/** Öffnet einen breiten Kampfplatz mit Deckung durch eine Wurzelinsel. */
function gallery() {
  return room('root-gallery','Wurzelgrund · Schildwacht',[
    [1,7,5,1],[5,2,3,7],[8,2,5,2],[8,6,5,3],[12,3,3,5],[15,4,3,1],
  ],[[9,8],[10,8]],[
    passage('west',1,7,'root-hollow',[16,8]),
    passage('east',17,4,'root-spring',[2,7]),
  ],[enemy('watch-kobold','kobold',8,6),enemy('watch-gorgon','gorgon',12,3)]);
}

/** Lässt den tiefsten Pfad an einer versiegten Quelle auslaufen. */
function spring() {
  return room('root-spring','Wurzelgrund · Trockene Quelle',[
    [1,7,6,1],[6,5,3,3],[8,3,7,5],[12,2,3,2],[14,5,3,2],
  ],[[10,5],[11,5]],[
    passage('west',1,7,'root-gallery',[16,4]),
    prop('spring-lip','Ausgewaschener Stein',13,2,'sign','inspect',{text:'Die Rinne ist trocken. Als du die Hand an den Stein legst, spürst du ein leises Klopfen. Tief unter deinen Füßen läuft noch Wasser.'}),
    prop('spring-bag','Tasche im Wurzelwerk',16,6,'chest','chest',{item:'Feldverband'}),
  ]);
}

/** Leitet sichtbare Waldkonturen und Kollision aus demselben Grundriss ab. @param {string} id Raumkennung. @param {string} title Raumname. @param {Array} paths Wegflächen. @param {Array} pits Grubenfelder. @param {Array} objects Raumobjekte. @param {Array} enemies Gegner. @param {number[]} spawn Sicherer Einstieg. */
function room(id,title,paths,pits,objects,enemies=[],spawn=[2,id==='root-entry'?6:7]) {
  const width=19,height=11,ground=Array.from({length:height},forestRow);
  for (const [x,y,w,h] of paths) for (let yy=y;yy<y+h;yy++) for (let xx=x;xx<x+w;xx++) ground[yy][xx]='.';
  for (const [x,y] of pits) ground[y][x]='q';
  const trees=[];
  for (let y=0;y<height-1;y+=2) for (let x=0;x<width-1;x+=2) {
    if (ground[y][x]+ground[y][x+1]+ground[y+1][x]+ground[y+1][x+1]==='vvvv') trees.push([x,y,(x+y)%6===0?'pine':null]);
  }
  return {id,title,width,height,spawn,dungeon:'wurzelgrund',villageLandscape:true,ground:ground.map(joinRow),trees,gardens:[],birds:[],buildings:[],objects,enemies,music:'quellgewoelbe'};
}

/** Erzeugt eine vollständig geschlossene Waldzeile. */
function forestRow() { return Array(19).fill('v'); }

/** Serialisiert die Terrainzeile. @param {string[]} row Kacheln. */
function joinRow(row) { return row.join(''); }

/** Verbindet zwei Waldgänge über A. @param {string} id Kennung. @param {number} x Spalte. @param {number} y Zeile. @param {string} to Zielraum. @param {number[]} spawn Ankunft. */
function passage(id,x,y,to,spawn) {
  return prop(id,'Waldgang',x,y,'root-passage','dungeon-door',{to,spawn,hint:'weitergehen'});
}
