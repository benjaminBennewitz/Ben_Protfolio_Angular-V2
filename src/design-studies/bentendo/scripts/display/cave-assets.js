import { canvas } from '../core/dom.js';
import { PALETTE } from '../core/config.js';

/** Gibt ausschließlich dem tieferen Kammerwasser mehr Kontrast und erhält die originalen Awakening-Wellenframes. @param {HTMLCanvasElement} tiles Palettengebundener Atlas. */
export function caveWaterSprites(tiles) {
  const surface=canvas(64,16),ctx=surface.getContext('2d');
  ctx.drawImage(tiles,560,64,64,16,0,0,64,16);
  const pixels=ctx.getImageData(0,0,64,16),colors=[];
  for (const color of PALETTE) colors.push([parseInt(color.slice(1,3),16),parseInt(color.slice(3,5),16),parseInt(color.slice(5,7),16)]);
  for (let i=0;i<pixels.data.length;i+=4) {
    const red=pixels.data[i],tone=red>160?1:red>100?2:3;
    pixels.data.set(colors[tone],i);
  }
  ctx.putImageData(pixels,0,0); return surface;
}
