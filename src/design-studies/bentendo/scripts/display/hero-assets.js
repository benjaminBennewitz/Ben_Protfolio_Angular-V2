import { canvas } from '../core/dom.js';
import { PALETTE } from '../core/config.js';

/** Verstärkt nur vorhandene Randpixel der sechs Heldenframes, ohne die Silhouette zu vergrößern. @param {HTMLCanvasElement} sheet Palettiertes Originalsheet. @param {number} row Erste Pixelzeile des Presets. */
export function heroSprite(sheet,row=32) {
  const surface=canvas(96,16),ctx=surface.getContext('2d'); ctx.drawImage(sheet,0,row,96,16,0,0,96,16);
  return outlineHero(surface);
}

/** Übernimmt die einheitliche dunkle Außenkontur, ohne fremde Framepixel einzubeziehen. @param {HTMLCanvasElement} surface Zusammengesetzte Figurenbilder. */
function outlineHero(surface) {
  const ctx=surface.getContext('2d');
  const pixels=ctx.getImageData(0,0,96,16),original=new Uint8ClampedArray(pixels.data);
  const dark=PALETTE[3].match(/\w\w/gu);
  for (let y=0;y<16;y++) for (let x=0;x<96;x++) {
    const i=(y*96+x)*4;
    if (!original[i+3] || !onEdge(original,x,y)) continue;
    for (let channel=0;channel<3;channel++) pixels.data[i+channel]=parseInt(dark[channel],16);
  }
  ctx.putImageData(pixels,0,0); return surface;
}

/** Prüft Transparenz ausschließlich innerhalb desselben Animationsframes. @param {Uint8ClampedArray} data Originalpixel. @param {number} x Spalte. @param {number} y Zeile. */
function onEdge(data,x,y) {
  for (const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
    const xx=x+dx,yy=y+dy;
    if (yy<0 || yy>=16 || Math.floor(xx/16)!==Math.floor(x/16) || !data[(yy*96+xx)*4+3]) return true;
  }
  return false;
}

/** Verwendet die entspannte Frauenpose statt der bisherigen Aktionspose und ergänzt lange Haare. @param {HTMLCanvasElement} sheet Palettiertes Originalsheet. */
export function femaleHeroSprite(sheet) {
  const surface=canvas(96,16),ctx=surface.getContext('2d'),sources=[64,64,80,80,96,112];
  for (let frame=0;frame<6;frame++) {
    ctx.save(); ctx.translate(frame*16,0);
    longHair(ctx,frame>=4);
    ctx.drawImage(sheet,sources[frame],224,16,16,0,0,16,16);
    if (frame===2 || frame===3) backHair(ctx);
    ctx.restore();
  }
  return outlineHero(surface);
}

/** Legt die langen seitlichen Haarsträhnen hinter Körper und entspannt gesenkten Armen an. @param {CanvasRenderingContext2D} ctx Kontext. @param {boolean} side Seitliche Blickrichtung. */
function longHair(ctx,side) {
  ctx.fillStyle=PALETTE[3]; ctx.fillRect(2,5,side?4:12,8); ctx.fillRect(3,13,side?2:10,1);
  ctx.fillStyle=PALETTE[2]; ctx.fillRect(3,7,1,5);
  if (!side) ctx.fillRect(12,7,1,5);
}

/** Zeigt bei der Rückenansicht zusammenhängendes Haar bis zum unteren Rücken. @param {CanvasRenderingContext2D} ctx Kontext. */
function backHair(ctx) {
  ctx.fillStyle=PALETTE[3]; ctx.fillRect(4,5,8,8); ctx.fillRect(5,13,6,1);
  ctx.fillStyle=PALETTE[2]; ctx.fillRect(5,6,2,6); ctx.fillRect(9,7,1,5);
}
