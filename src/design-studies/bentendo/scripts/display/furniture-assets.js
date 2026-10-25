import { canvas } from '../core/dom.js';

/** Bereitet kleine Möbelgrafiken ohne ihren Atlas-Hintergrund auf. @param {HTMLImageElement} image Originalatlas. @param {Function} quantize LCD-Palettenumsetzung. */
export function furnitureSprites(image,quantize) {
  const barrel=crop(image,152,72,16,16),tool=crop(image,16,48,16,16);
  clearBackground(barrel,true); clearBackground(tool,false);
  return {barrelTiles:quantize(barrel),toolTiles:quantize(tool)};
}

/** Kopiert ausschließlich den benötigten nativen Bildausschnitt. @param {HTMLImageElement} image Atlas. @param {number} x X. @param {number} y Y. @param {number} w Breite. @param {number} h Höhe. */
function crop(image,x,y,w,h) {
  const surface=canvas(w,h); surface.getContext('2d').drawImage(image,x,y,w,h,0,0,w,h); return surface;
}

/** Entfernt beim Fass nur verbundenen Außenraum und erhält helle Glanzpixel innerhalb seiner Kontur. @param {HTMLCanvasElement} surface Grafik. @param {boolean} exteriorOnly Nur Außenraum. */
function clearBackground(surface,exteriorOnly) {
  const ctx=surface.getContext('2d'),pixels=ctx.getImageData(0,0,16,16),data=pixels.data;
  const color=[data[0],data[1],data[2]],queue=[],seen=new Set();
  for (let y=0;y<16;y++) for (let x=0;x<16;x++) if (!exteriorOnly || x===0 || y===0 || x===15 || y===15) queue.push([x,y]);
  while (queue.length) {
    const [x,y]=queue.pop(),key=y*16+x,i=key*4;
    if (x<0 || x>=16 || y<0 || y>=16 || seen.has(key)) continue;
    seen.add(key);
    if (data[i]!==color[0] || data[i+1]!==color[1] || data[i+2]!==color[2]) continue;
    data[i+3]=0;
    if (exteriorOnly) for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) queue.push([x+dx,y+dy]);
  }
  ctx.putImageData(pixels,0,0);
}
