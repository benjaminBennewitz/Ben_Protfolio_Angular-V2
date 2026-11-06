import { rect } from './primitives.js';

/** Zeichnet einen offenen Abgrund mit erdiger Kante und Schatten. @param {object} render Zeicheninformationen. @param {number} x Rasterspalte. @param {number} y Rasterzeile. */
export function drawRootPit(render,x,y) {
  const {ctx}=render,xx=x*16,yy=y*16,ground=render.game.room.ground;
  const left=ground[y][x-1]==='q'?0:2,right=ground[y][x+1]==='q'?0:2;
  rect(ctx,1,xx,yy+1,16,14); rect(ctx,3,xx+left,yy+3,16-left-right,11);
  rect(ctx,2,xx+left,yy+3,16-left-right,2);
  for (const dx of [4,10]) rect(ctx,2,xx+dx,yy+11,2,2);
}

/** Markiert einen schmalen Pfad zwischen dunklen Wurzeln. @param {object} render Zeicheninformationen. @param {object} object Durchlass. */
export function drawRootPassage(render,object) {
  const {ctx}=render,x=object.x*16,y=object.y*16;
  rect(ctx,3,x+2,y+3,12,13); rect(ctx,3,x+4,y+1,8,2);
  rect(ctx,2,x+2,y+4,2,10); rect(ctx,2,x+12,y+4,2,10);
  rect(ctx,1,x+5,y+12,6,4); rect(ctx,0,x+7,y+14,2,2);
}

/** Zeigt die Öffnung als Aussparung unter Wurzeln zwischen den Baumkronen. @param {object} render Zeicheninformationen. @param {object} object Tunnel. */
export function drawRootTunnel(render,object) {
  const {ctx}=render,x=object.x*16,y=object.y*16;
  rect(ctx,2,x,y+1,16,14); rect(ctx,3,x+2,y+4,13,9);
  rect(ctx,3,x+4,y+2,8,12); rect(ctx,3,x+12,y+6,4,5);
  rect(ctx,1,x+1,y+2,5,2); rect(ctx,1,x+6,y,5,2);
  rect(ctx,1,x+1,y+12,5,3); rect(ctx,1,x+6,y+14,6,1);
  rect(ctx,2,x+3,y+8,2,3); rect(ctx,2,x+8,y+11,5,1);
}

const SPIDER=[
    '................',
    '.....33.333.....',
    '....31033113....',
    '....31132103....',
    '...3122331233...',
    '.33322132222333.',
    '3323333333332333',
    '3.33230003233..3',
    '...3333033333...',
    '..33.33333.33...',
    '.33..3...3..33..',
    '.3...........3..',
];

const SPIDER_STEP={9:'..33.33333..33..',10:'..3..3...3...3..',11:'...3........3...'};

const KOBOLD_SIDE=[
  '......0',
  '......101.....1',
  '.......10122211',
  '.......10000011',
  '.......10000012',
  '.......12033001',
  '........10010000',
  '...0011.100112',
  '..000112331132',
  '.000112230012.....001',
  '.001132231012200000001',
  '.01123223112333333112',
  '..11223330032',
  '...2333101112',
  '......11122122',
  '......12333222',
];
const KOBOLD_FRONT=[
  '...0..........1',
  '...101......101',
  '....1003323101',
  '.....100000012',
  '.....100000012',
  '.....230003032....0',
  '......1001012....001',
  '...011.100212....012',
  '..000123331122....1',
  '.000112301122211001',
  '.001132301123333..2',
  '.011232310123.....2',
  '..11223330032.....2',
  '...2333101112.....2',
  '......11122122',
  '......12333222',
];
const KOBOLD_BACK=[
  '...0..........1',
  '...101......101',
  '....1012222101',
  '.....211111122',
  '.....211111222',
  '.....221112222....0',
  '......2221222....001',
  '...011.333332....012',
  '..010023011122....1',
  '.010012301122211001',
  '.111132331123333..2',
  '.112232313323.....2',
  '..12223330032.....2',
  '...2333101112.....2',
  '......11122122',
  '......12333222',
];

const KOBOLD_FEET=[
  ['......222..222','.....2222..2222','.....3333..3333'],
  ['......222..222','.....2222..3322','.....3333...222','............333'],
  ['......222..222','.....2233..2222','......222..3333','......333'],
];

const GORGON_CROWN=[
  '..........0001',
  '.........001301',
  '..001.....1122',
  '.00301.....12....0011',
  '..11201....12...001301',
  '.....011..12...1122',
  '......0122122112',
];
const GORGON_HEAD={
  down:[
    '......100000001',
    '.....10000000012',
    '.....10330033012',
    '.....10000100012',
    '......100010012',
    '.......2100012',
    '......112332211',
    '.....10120021122',
    '......123011232',
    '........100122',
  ],
  up:[
    '......111222211',
    '.....11001122122',
    '.....11011221122',
    '.....21112211222',
    '......212211222',
    '.......2221222',
    '......111332211',
    '.....10121121122',
    '......123112232',
    '........110122',
  ],
  right:[
    '......111000011',
    '.....21100000012',
    '.....221100330012',
    '......211000010012',
    '......2211000012',
    '.......23100012',
    '......11133221',
    '.....1012200112',
    '......122301122',
    '........100122',
  ],
};
const GORGON_COIL=[
  ['.......1000122','......1000122','.....1000122','.....1000122...222','.....21000122222122','......2100012221122','.......22321000122'],
  ['.......1000122','......1000122','.....1000122','....1000122','....210001222222','.....210001221122','......22321000122'],
  ['.......1000122','.......1000122','.......1000122','......1000122...222','......21000122222122','.......2100012221122','........22321000122'],
];
const ROOT_SPRITES={
  kobold:{down:KOBOLD_FRONT,up:KOBOLD_BACK,right:KOBOLD_SIDE},
  gorgon:GORGON_HEAD,
};

/** Ergänzt vorab eine dunkle Pixelkontur und legt die Unterkante auf die Kachel. @param {string[]} rows Pixelzeilen. @param {number} width Breite der Zeichenfläche. */
function outlinedSprite(rows,width) {
  const offsetX=Math.floor((16-width)/2),offsetY=15-rows.length;
  const pixels=[];
  for (let y=-1;y<=rows.length;y++) for (let x=-1;x<=width;x++) {
    const color=rows[y]?.[x];
    if (color && color!=='.') pixels.push([Number(color),x+offsetX,y+offsetY]);
    else if (occupied(rows,x-1,y) || occupied(rows,x+1,y) || occupied(rows,x,y-1) || occupied(rows,x,y+1)) {
      pixels.push([3,x+offsetX,y+offsetY]);
    }
  }
  return pixels;
}

/** Prüft, ob eine Pixelkoordinate innerhalb der Silhouette liegt. @param {string[]} rows Pixelzeilen. @param {number} x Spalte. @param {number} y Zeile. */
function occupied(rows,x,y) {
  const pixel=rows[y]?.[x];
  return pixel!==undefined && pixel!=='.';
}

const ROOT_FRAMES={kobold:{},gorgon:{}};
for (const [species,views] of Object.entries(ROOT_SPRITES)) {
  for (const [direction,body] of Object.entries(views)) {
    ROOT_FRAMES[species][direction]=species==='kobold'
      ? KOBOLD_FEET.map(feet=>outlinedSprite([...body,...feet],22))
      : GORGON_COIL.map(coil=>outlinedSprite([...GORGON_CROWN,...body,...coil],21));
  }
}

/** Gibt die Höhe des Sprites oberhalb der Kachel zurück. @param {string} species Gegnerart. */
export function rootEnemyRise(species) {
  if (species==='kobold') return KOBOLD_FRONT.length+KOBOLD_FEET[1].length-14;
  if (species==='gorgon') return GORGON_CROWN.length+GORGON_HEAD.down.length+GORGON_COIL[0].length-14;
  return 0;
}

/** Zeichnet die Blickrichtung und Schrittphase des Waldgegners. @param {CanvasRenderingContext2D} ctx Zeichenfläche. @param {string} species Gegnerart. @param {string} facing Blickrichtung. @param {number} frame Bewegungsphase. */
export function drawRootEnemy(ctx,species,facing,frame) {
  if (species==='spider') {
    for (let y=0;y<SPIDER.length;y++) {
      const row=(frame===1?SPIDER_STEP[y]:null) ?? SPIDER[y];
      for (let x=0;x<row.length;x++) if (row[x]!=='.') rect(ctx,Number(row[x]),x,y+3,1,1);
    }
    return;
  }
  const direction=facing==='left'?'right':facing;
  for (const [color,x,y] of ROOT_FRAMES[species][direction][frame]) rect(ctx,color,x,y,1,1);
}
