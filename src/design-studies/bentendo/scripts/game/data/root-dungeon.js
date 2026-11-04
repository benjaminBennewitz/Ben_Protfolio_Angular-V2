import { enemy } from './quell-dungeon.js';
import { prop } from './town.js';

/** Baut drei begehbare Waldkammern mit abgestuften Gefahren. */
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
    camp(),
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
      prop('end','Verwachsener Durchlass',17,8,'sign','inspect',{text:'Hinter den Wurzeln geht der Wald weiter. Hier endet der derzeit spielbare Abschnitt.'}),
    ],[enemy('camp-kobold-a','kobold',8,4),enemy('camp-kobold-b','kobold',10,5),enemy('camp-gorgon','gorgon',14,8)]);
}

/** Leitet sichtbare Waldkonturen und Kollision aus demselben Grundriss ab. @param {string} id Raumkennung. @param {string} title Raumname. @param {Array} paths Wegflächen. @param {Array} pits Grubenfelder. @param {Array} objects Raumobjekte. @param {Array} enemies Gegner. */
function room(id,title,paths,pits,objects,enemies=[]) {
  const width=19,height=11,ground=Array.from({length:height},forestRow);
  for (const [x,y,w,h] of paths) for (let yy=y;yy<y+h;yy++) for (let xx=x;xx<x+w;xx++) ground[yy][xx]='.';
  for (const [x,y] of pits) ground[y][x]='q';
  const trees=[];
  for (let y=0;y<height-1;y+=2) for (let x=0;x<width-1;x+=2) {
    if (ground[y][x]+ground[y][x+1]+ground[y+1][x]+ground[y+1][x+1]==='vvvv') trees.push([x,y,(x+y)%6===0?'pine':null]);
  }
  return {id,title,width,height,spawn:[2,id==='root-entry'?6:7],dungeon:'wurzelgrund',villageLandscape:true,ground:ground.map(joinRow),trees,gardens:[],birds:[],buildings:[],objects,enemies,music:'quellgewoelbe'};
}

/** Erzeugt eine vollständig geschlossene Waldzeile. */
function forestRow() { return Array(19).fill('v'); }

/** Serialisiert die Terrainzeile. @param {string[]} row Kacheln. */
function joinRow(row) { return row.join(''); }

/** Verbindet zwei Waldgänge über A. @param {string} id Kennung. @param {number} x Spalte. @param {number} y Zeile. @param {string} to Zielraum. @param {number[]} spawn Ankunft. */
function passage(id,x,y,to,spawn) {
  return prop(id,'Waldgang',x,y,'root-passage','dungeon-door',{to,spawn,hint:'weitergehen'});
}
