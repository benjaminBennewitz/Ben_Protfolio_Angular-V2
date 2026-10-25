import { loadImage, canvas } from '../core/dom.js';
import { furnitureSprites } from './furniture-assets.js';

/** Lädt nur die im Dorf verwendeten Bewohner- und Tiergrafiken. @param {Function} quantize Vorhandene LCD-Palettenumsetzung. */
export async function loadLifeAssets(quantize) {
  const [npcs,squirrel,hedgehog,mouse,interior,cottage,dog]=await Promise.all([
    loadImage('./assets/sprites/npcs/5yvalia-samples.png'),
    loadImage('./assets/sprites/animals/squirrel.png'),
    loadImage('./assets/sprites/animals/hedgehog.png'),
    loadImage('./assets/sprites/animals/mouse.png'), loadImage('./assets/tiles/fantasy-interior.png'), loadImage('./assets/tiles/cottage-interior.png'),
    loadImage('./assets/sprites/animals/minifolks-wolf.png'),
  ]);
  return {dogSprite:dogSprite(dog,quantize),cottageTiles:quantize(cottage),interiorTiles:quantize(interior),npcSamples:quantize(npcs),wildlife:{squirrel:animalSprite(squirrel,quantize),hedgehog:animalSprite(hedgehog,quantize),mouse:animalSprite(mouse,quantize)},...furnitureSprites(interior,quantize)};
}

/** Erhält die kühlen Fellschatten beim Wechsel in die LCD-Palette, ohne die Quelldatei zu ändern. @param {HTMLImageElement} image Wolf-Sheet. @param {Function} quantize Gemeinsame Palettenumsetzung. */
function dogSprite(image,quantize) {
  const surface=canvas(image.width,image.height),ctx=surface.getContext('2d'); ctx.drawImage(image,0,0);
  const pixels=ctx.getImageData(0,0,image.width,image.height),data=pixels.data;
  for (let i=0;i<data.length;i+=4) {
    const luminance=data[i]*0.2126+data[i+1]*0.7152+data[i+2]*0.0722;
    const tone=luminance<55?30:luminance<150?85:luminance<180?145:220;
    data[i]=tone; data[i+1]=tone; data[i+2]=tone;
  }
  ctx.putImageData(pixels,0,0); return quantize(surface);
}

/** Entfernt das dokumentierte GB-Studio-Schlüsselgrün vor der LCD-Umsetzung. @param {HTMLImageElement} image Originalgrafik. @param {Function} quantize LCD-Palettenumsetzung. */
function animalSprite(image,quantize) {
  const surface=canvas(image.width,image.height),ctx=surface.getContext('2d');
  ctx.drawImage(image,0,0); const pixels=ctx.getImageData(0,0,image.width,image.height);
  for (let i=0;i<pixels.data.length;i+=4) {
    if (pixels.data[i]===101 && pixels.data[i+1]===255 && pixels.data[i+2]===0) pixels.data[i+3]=0;
  }
  ctx.putImageData(pixels,0,0); return quantize(surface);
}
