import { caveWaterSprites } from './cave-assets.js';
import { loadLifeAssets } from './life-assets.js';
import { heroSprite,femaleHeroSprite } from './hero-assets.js';
import { floraSprites } from './flora-assets.js';
import { roundTreeSprite } from './tree-assets.js';
import { loadImage, canvas } from '../core/dom.js';
import { ASSETS, PALETTE } from '../core/config.js';

/** Wandelt eine Grafik deterministisch in die vier LCD-Farben um. @param {HTMLImageElement} image Grafik. @param {number} width Breite. @param {number} height Höhe. */
export function quantize(image, width = image.width, height = image.height) {
  const surface = canvas(width, height), ctx = surface.getContext('2d');
  ctx.drawImage(image, 0, 0, width, height);
  const pixels = ctx.getImageData(0, 0, width, height);
  const colors = [];
  for (const color of PALETTE) colors.push(color.match(/\w\w/gu).map(hexByte));
  for (let i = 0; i < pixels.data.length; i += 4) {
    const luminance = pixels.data[i] * 0.2126 + pixels.data[i+1] * 0.7152 + pixels.data[i+2] * 0.0722;
    pixels.data.set(colors[luminance < 55 ? 3 : luminance < 115 ? 2 : luminance < 180 ? 1 : 0], i);
  }
  ctx.putImageData(pixels, 0, 0); return surface;
}

/** Liest einen Farbkanal. @param {string} value Hexadezimalwert. */
function hexByte(value) { return parseInt(value, 16); }

/** Lädt die vorhandenen Spielgrafiken ohne Netzwerkdienste. */
export async function loadDisplayAssets() {
  const [title, logo, tiles, portraits, goblin, overworld, villagers, villageTiles, life, dungeon] = await Promise.all([
    loadImage(ASSETS.title), loadImage(ASSETS.logo), loadImage(ASSETS.tiles),
    loadImage('./assets/characters/adventurer-portraits.png'), loadImage('./assets/sprites/goblin.png'),
    loadImage(ASSETS.overworld), loadImage(ASSETS.villagers), loadImage(ASSETS.villageTiles), loadLifeAssets(quantize), loadImage('./assets/tilesets/gb-dungeon/GBDungeon.png'),
  ]);
  const villageSprites=quantize(villagers),villageAtlas=quantize(villageTiles);
  return { dungeonTiles:quantize(dungeon), title: quantize(title,160,144), logo: quantize(logo,156,61), tiles: quantize(tiles), portraits:quantize(portraits,128,64), goblin, overworld: quantize(overworld), roundTreeSprite:roundTreeSprite(overworld,quantize), villagers:villageSprites, heroes:{female:femaleHeroSprite(villageSprites),male:heroSprite(villageSprites,32)}, villageTiles:villageAtlas, caveWater:caveWaterSprites(villageAtlas), ...life, ...floraSprites(villageTiles,quantize) };
}
