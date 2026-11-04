import { canvas,loadImage } from '../core/dom.js';
import { clearTreeBackground } from './tree-assets.js';

const FILES={
  water:'Water_1',outer:'Water_1_Grass_Outer_16x16',inner:'Water_1_Grass_Inner_16x16',
  grass:'Grass_16x16',tall:'Grass_Tall_16x16',reeds:'Reeds_Short_16x16',
  rock:'Rock_Water_Big_32x32',stones:'Stepping_stones_water_16x16',
};

/** Lädt die ausgewählten Uferkacheln und Sprites in die LCD-Palette. @param {Function} quantize Palettenumsetzung. */
export async function loadMeadowAssets(quantize) {
  const entries=await Promise.all(Object.entries(FILES).map(loadMeadowImage));
  const result={};
  for (const [key,image] of entries) {
    const transparent=['grass','tall','reeds','rock','stones'].includes(key);
    result[key]=quantize(transparent?withoutBackdrop(image):image);
  }
  return result;
}

/** Öffnet eine Grafik aus dem lokalen Wiesenpaket. @param {Array} entry Kennung und Dateiname. */
async function loadMeadowImage(entry) {
  const [key,name]=entry;
  return [key,await loadImage(`./assets/tiles/meadow-free/${name}.png`)];
}

/** Entfernt den mit dem Rand verbundenen Hintergrund, ohne Felsfacetten auszuschneiden. @param {HTMLImageElement} image Originalgrafik. */
function withoutBackdrop(image) {
  const surface=canvas(image.width,image.height),ctx=surface.getContext('2d');
  ctx.drawImage(image,0,0);
  const pixels=ctx.getImageData(0,0,image.width,image.height);
  clearTreeBackground(pixels); ctx.putImageData(pixels,0,0);
  return surface;
}
