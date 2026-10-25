import { canvas } from '../core/dom.js';
const cache = new Map();
let raster;

/** Lädt die lokale Pixelschrift vor der ersten Zeichnung. */
export async function loadFont() {
  const faces = await document.fonts.load('8px "Tiny5"');
  if (!faces.length) throw new Error('Die lokale Tiny5-Schrift konnte nicht geladen werden.');
}

/** Rastert ein Zeichen in vierfacher Größe. @param {string} character Schriftzeichen. */
function rasterize(character) {
  raster ||= canvas(96, 64);
  const ctx = raster.getContext('2d', { willReadFrequently: true });
  ctx.clearRect(0, 0, 96, 64);
  ctx.font = '32px Tiny5'; ctx.fontKerning = 'none'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#fff'; ctx.fillText(character, 0, 32);
  return { data: ctx.getImageData(0, 0, 96, 64).data, width: Math.round(ctx.measureText(character).width / 4) };
}

/** Hält ausschließlich deckende Pixelmitten im begrenzten Cache. @param {string} character Schriftzeichen. */
function glyph(character) {
  if (cache.has(character)) return cache.get(character);
  const raster = rasterize(character), pixels = [];
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 24; x++) if (raster.data[((y * 4 + 2) * 96 + x * 4 + 2) * 4 + 3] >= 128) pixels.push([x, y - 2]);
  }
  const result = { width: raster.width, pixels };
  if (cache.size >= 512) cache.delete(cache.keys().next().value);
  cache.set(character, result); return result;
}

/** Misst Text mit denselben gerasterten Zeichen wie die LCD-Ausgabe. @param {string} text Text. */
export function pixelTextWidth(text) {
  let width=0;
  for (const character of [...String(text).normalize('NFC').toUpperCase()]) width+=glyph(character).width;
  return width;
}

/** Zeichnet ganze LCD-Pixel einschließlich Umlauten. @param {CanvasRenderingContext2D} ctx Zeichenkontext. @param {string} text Inhalt. @param {number} x X-Position. @param {number} y Y-Position. @param {string} color Farbe. @param {number} scale Maßstab. @param {boolean} centered Zentrierung. */
export function pixelText(ctx, text, x, y, color = '#203323', scale = 1, centered = false) {
  const letters = [...String(text).normalize('NFC').toUpperCase()].map(glyph);
  let width = 0;
  for (const letter of letters) width += letter.width * scale;
  if (centered) x -= width / 2;
  ctx.fillStyle = color;
  for (const letter of letters) {
    for (const [xx,yy] of letter.pixels) ctx.fillRect(Math.round(x + xx * scale), Math.round(y + yy * scale), scale, scale);
    x += letter.width * scale;
  }
}
