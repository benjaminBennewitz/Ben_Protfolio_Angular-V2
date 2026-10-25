import { canvas } from '../core/dom.js';
import { pineSprite } from './tree-assets.js';

/** Bereitet die losen Blumen und Grashalme des neuen Awakening-Sheets einmalig auf. @param {HTMLImageElement} sheet Originalatlas. @param {Function} quantize LCD-Palettenumsetzung. */
export function floraSprites(sheet,quantize) {
  return {pineSprite:pineSprite(sheet,quantize),flowerSprites:plantStrip(sheet,[112,32,64,16],quantize),grassSprites:plantStrip(sheet,[128,48,32,32],quantize),bushSprites:plantStrip(sheet,[128,16,16,16],quantize)};
}

/** Entfernt ausschließlich den einfarbigen Grasuntergrund vor der Palettenumsetzung. @param {HTMLImageElement} sheet Originalatlas. @param {number[]} source Quellausschnitt. @param {Function} quantize LCD-Palettenumsetzung. */
function plantStrip(sheet,source,quantize) {
  const [sx,sy,w,h]=source,surface=canvas(w,h),ctx=surface.getContext('2d');
  ctx.drawImage(sheet,sx,sy,w,h,0,0,w,h);
  const pixels=ctx.getImageData(0,0,w,h);
  for (let i=0;i<pixels.data.length;i+=4) if (pixels.data[i]===144 && pixels.data[i+1]===152 && pixels.data[i+2]===104) pixels.data[i+3]=0;
  ctx.putImageData(pixels,0,0); return quantize(surface);
}
