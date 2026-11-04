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
  '......32......3',
  '.......32....32',
  '.......31322232',
  '.......31011233',
  '.......31230222',
  '.......32331212',
  '...112.321121223',
  '..10122232101333',
  '.10111233221133',
  '.1102123323322...01',
  '.21101233211123222101',
  '.22110232223333323212',
  '..221223321233...12',
  '...33332222333',
  '......1222322',
  '......3323332',
];
const KOBOLD_FRONT=[
  '....32.......23',
  '....322.....223',
  '.....311122223',
  '.....310111223',
  '.....303131023',
  '.....312011233',
  '.....321013233.....1',
  '...112333333212...012',
  '..1012231213223..2112',
  '.1011123112322312222',
  '.110212321122333..2',
  '.21101232233123...2',
  '.2211023211133....2',
  '..221223322223....2',
  '.....321223323',
  '.....322332223',
];
const KOBOLD_BACK=[
  '....32.......23',
  '....322.....223',
  '.....311222223',
  '.....312211223',
  '.....321121223',
  '.....312122323',
  '.....322233323.....1',
  '...112333333222...012',
  '..1212232113223..2112',
  '.2101223112322312222',
  '.222012321122333..2',
  '.21212232233223...2',
  '.2212223211133....2',
  '..221223322223....2',
  '.....321223323',
  '.....322332223',
];

const KOBOLD_FEET=[
  ['......222..222','.....2222..2222','.....3333..3333'],
  ['......222..222','.....2222..3322','.....3333...222','............333'],
  ['......222..222','.....2233..2222','......222..3333','......333'],
];

const GORGON_CROWN=[
  '.........1122',
  '........210122',
  '..112...230122....112',
  '.21012...2322....21012',
  '.230122...12....230122',
  '..223122..12..213222',
  '.....221223222122',
];
const GORGON_HEAD={
  down:[
    '......221112222',
    '.....21011112222',
    '.....21303201322',
    '.....21101211232',
    '.....22111011232',
    '......222333322',
    '.....12121122122',
    '....2231211221322',
    '.....22312122222',
    '.......2212322',
  ],
  up:[
    '......221112222',
    '.....22111122222',
    '.....21122213222',
    '.....22121223222',
    '.....22221221322',
    '......221221222',
    '.....12122322122',
    '....2231213221322',
    '.....22312132222',
    '.......2212322',
  ],
  right:[
    '......221112222',
    '.....22121011222',
    '.....22221303222',
    '.....22221101232',
    '.....222211101232',
    '......2222233222',
    '.....12122112222',
    '....223222112232',
    '.....2232221222',
    '.......2212322',
  ],
};
const GORGON_COIL=[
  ['.......2111232','......2111232','.....2111232','.....2111232...222','.....22111232222122','......2211123221122','.......22322111232'],
  ['.......2111232','......2111232','.....2111232','....2111232','....221112322222','.....221112321122','......22322111232'],
  ['.......2111232','.......2111232','.......2111232','......2111232...222','......22111232222122','.......2211123221122','........22322111232'],
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
