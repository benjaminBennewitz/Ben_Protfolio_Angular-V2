import { rect } from './primitives.js';
import { animalsRest } from '../systems/daily-life.js';

/** Zeichnet sitzende Vögel in Bodennähe und einen kurzen Abflug über dem Ufer. @param {object} render Zeicheninformationen. */
export function drawMeadowBirds(render) {
  const {game,ctx}=render;
  if (!game.room.meadowBirds || animalsRest(game)) return;
  for (const [i,bird] of game.room.meadowBirds.entries()) {
    const flight=game.roomState.meadowFlights?.[i];
    if (flight!==undefined && (flight>=1.2 || game.reduced)) continue;
    const x=bird.x*16+7+(flight ?? 0)*bird.side*31,y=bird.y*16+11-(flight ?? 0)*28;
    rect(ctx,3,x-2,y,5,2); rect(ctx,2,x+2*bird.side,y-1,2,1);
    if (flight!==undefined) rect(ctx,3,x,y+(Math.floor(flight*10)%2?-2:2),2,1);
    else rect(ctx,1,x-1,y+2,3,1);
  }
}

/** Zeichnet wenige einzelne Mückenpixel über dem feuchten Ufer. @param {object} render Zeicheninformationen. */
export function drawMeadowMidges(render) {
  const {game,ctx}=render;
  if (!game.room.lakeFall || game.reduced) return;
  for (const [x,y] of [[11,7],[16,11],[10,16],[24,8],[27,8]]) for (let i=0;i<4;i++) {
    const phase=game.time*(1+i*0.22)+x+i*1.7;
    rect(ctx,i%2?2:1,x*16+7+Math.sin(phase)*6,y*16+3+Math.cos(phase*1.4)*4,1,1);
  }
}

const ROCKS=[
  ['.....333.......','...3311133.....','..3110011233...','.311111122223..','31112212222223.','31122222222333.','32222222223333.','.333333333333..','...222222222...'],
  ['......33.......','.....3113......','....310123.....','...31101233....','..311122223....','..3122222233...','.312212222233..','.322222223333..','..3333333333...','....222222222..'],
  ['...............','......3333.....','..3333111233...','.3111100112233.','311122222222223','322222222223333','.3333333333333.','...2222222222..'],
  ['...333.........','..310133.......','.31011223..33..','.3111222333123.','311222223311223','322222233222233','.3333333333333.','...2222222222..'],
];
const PEBBLES=[
  ['..333...','.31023..','3112233.','.33333..'],
  ['...33...','..3113..','.310223.','.332333.','..3333..'],
  ['........','.33333..','3101123.','.333333.'],
  ['.33.....','3103.33.','32233123','.333333.'],
];

/** Zeichnet Felsvarianten mit Licht von links oben und einem Bodenschatten. @param {object} render Zeicheninformationen. @param {object} object Fels. */
export function drawMeadowRock(render,object) {
  if (object.waterArt) {
    const image=render.assets.meadow[object.waterArt];
    render.ctx.drawImage(image,object.x*16,object.y*16); return;
  }
  const {ctx}=render,small=object.small,art=(small?PEBBLES:ROCKS)[object.shape];
  const x=object.x*16+(small?4:0),y=object.y*16+15-art.length;
  rect(ctx,1,x+(small?2:3),y+art.length,small?5:12,1);
  for (const [row,line] of art.entries()) for (let col=0;col<line.length;col++) {
    if (line[col]!=='.') rect(ctx,Number(line[col]),x+col,y+row,1,1);
  }
}

/** Mischt Originalgräser und Schilf punktuell in die vorhandene Wiesenvegetation. @param {object} render Zeicheninformationen. */
export function drawMeadowPlants(render) {
  const {ctx,game,assets}=render,ground=game.room.ground;
  if (!game.room.lakeFall) return;
  for (let y=1;y<game.room.height-1;y++) for (let x=1;x<game.room.width-1;x++) {
    const kind=ground[y][x],seed=x*13+y*7+x*y;
    if (kind==='g' && seed%7===0) {
      ctx.drawImage(assets.meadow.grass,seed%3*16,y%3*16,16,16,x*16,y*16,16,16);
    } else if (kind==='t' && seed%4===0) {
      const bank=ground[y-1][x]==='l' || ground[y][x-1]==='l' || ground[y][x+1]==='l';
      const tile=bank?assets.meadow.reeds:assets.meadow.tall;
      ctx.drawImage(tile,bank?0:seed%3%2*16,0,16,16,x*16,y*16,16,16);
    }
  }
}

/** Zeichnet die Originalsprites in Blickrichtung und mit demselben Fußpunkt wie die anderen Tiere. @param {object} render Zeicheninformationen. @param {object} object Tier. @param {number} x Pixelspalte. @param {number} y Pixelzeile. */
export function drawMeadowDeer(render,object,x,y) {
  const {ctx,game,assets}=render;
  const walking=object.walking && !game.reduced,phase=game.time+object.x*0.43+object.y*0.31;
  const grazing=!walking && !game.reduced && phase%8>=5.2;
  const row=walking?1:grazing?(object.stag?5:4):0;
  const frame=game.reduced || grazing?0:Math.floor(phase*(walking?10:3))%4;
  ctx.save(); ctx.translate(Math.round(x)+8,Math.round(y));
  if (object.facing==='left') ctx.scale(-1,1);
  ctx.drawImage(assets.deerSprites[object.stag?'stag':'roe'],frame*32,row*32,32,32,-16,-16,32,32);
  ctx.restore();
}
