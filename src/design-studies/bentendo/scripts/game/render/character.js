import { rect } from './primitives.js';
import { pixelText } from '../../display/font.js';
import { PALETTE } from '../../core/config.js';
import { CHARACTER_PRESETS } from '../data/characters.js';

/** Zeichnet beide gleichwertigen Presets mit großen Porträts und einer echten Spielfigur als Vorschau. @param {object} render Zeicheninformationen. */
export function drawCharacterSelection(render) {
  const {ctx,game}=render;
  rect(ctx,0,0,0,160,144);
  pixelText(ctx,'WER ZIEHT LOS?',80,6,PALETTE[3],1,true);
  for (let index=0;index<CHARACTER_PRESETS.length;index++) drawCharacterCard(render,index);
  pixelText(ctx,'GLEICHE FÄHIGKEITEN',80,122,PALETTE[2],1,true);
  pixelText(ctx,'PFEILE: WAHL  A: START',80,134,PALETTE[3],1,true);
}

/** Markiert die aktuelle Auswahl durch Rahmen und Pfeil statt ausschließlich durch Farbe. @param {object} render Zeicheninformationen. @param {number} index Presetindex. */
function drawCharacterCard(render,index) {
  const {ctx,game,assets}=render,preset=CHARACTER_PRESETS[index],x=5+index*78,selected=game.characterIndex===index;
  rect(ctx,selected?3:1,x,21,72,99); rect(ctx,0,x+2,23,68,95);
  ctx.drawImage(assets.portraits,preset.portraitX,0,64,64,x+4,25,64,64);
  pixelText(ctx,`${selected?'> ':''}${preset.label}`,x+36,94,PALETTE[3],1,true);
  ctx.drawImage(assets.heroes[preset.id],0,0,16,16,x+28,102,16,16);
}
