import { canvas } from '../core/dom.js';

/** Stellt den spitzen Baum einmalig frei und erhält seine eingeschlossenen Glanzpixel. @param {HTMLImageElement} sheet Originalatlas. @param {Function} quantize LCD-Umsetzung. */
export function pineSprite(sheet,quantize) {
  return treeSprite(sheet,quantize,272,256);
}

/** Stellt den runden Baum frei, damit seine Ecken den Wiesenboden nicht übermalen. @param {HTMLImageElement} sheet Originalatlas. @param {Function} quantize LCD-Umsetzung. */
export function roundTreeSprite(sheet,quantize) {
  return treeSprite(sheet,quantize,192,0);
}

/** Extrahiert einen Baum und entfernt nur den verbundenen Außenhintergrund. @param {HTMLImageElement} sheet Originalatlas. @param {Function} quantize LCD-Umsetzung. @param {number} x Quellspalte. @param {number} y Quellzeile. */
function treeSprite(sheet,quantize,x,y) {
  const surface=canvas(32,32),ctx=surface.getContext('2d');
  ctx.drawImage(sheet,x,y,32,32,0,0,32,32);
  const pixels=ctx.getImageData(0,0,32,32);
  clearTreeBackground(pixels); ctx.putImageData(pixels,0,0); return quantize(surface);
}

/** Entfernt nur die mit dem Bildrand verbundene Hintergrundfarbe. @param {ImageData} pixels Baum-Ausschnitt. */
export function clearTreeBackground(pixels) {
  const {data,width:w,height:h}=pixels,color=[data[0],data[1],data[2]],queue=[],seen=new Set();
  for (let y=0;y<h;y++) for (let x=0;x<w;x++) if (!x || !y || x===w-1 || y===h-1) queue.push([x,y]);
  while (queue.length) {
    const [x,y]=queue.pop(),key=y*w+x,i=key*4;
    if (x<0 || x>=w || y<0 || y>=h || seen.has(key)) continue;
    seen.add(key);
    if (data[i]!==color[0] || data[i+1]!==color[1] || data[i+2]!==color[2]) continue;
    data[i+3]=0;
    for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) queue.push([x+dx,y+dy]);
  }
}
