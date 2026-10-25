import { rect } from './primitives.js';
import { pixelText } from '../../display/font.js';
import { PALETTE } from '../../core/config.js';
import { DRINKS } from '../systems/tavern.js';

/** Zeichnet eine kurze, vollständig lesbare Bestellkarte mit Preisen und Münzstand. @param {object} render Zeicheninformationen. */
export function drawDrinks(render) {
  const {ctx,game}=render;
  rect(ctx,3,2,54,156,90); rect(ctx,0,4,56,152,86);
  pixelText(ctx,'WAS DARF ES SEIN?',9,60,PALETTE[3]);
  pixelText(ctx,`MÜNZEN: ${game.coins}`,9,72,PALETTE[2]);
  for (let index=0;index<DRINKS.length;index++) {
    const drink=DRINKS[index],y=86+index*12,selected=game.tavernChoice===index;
    if (selected) rect(ctx,3,7,y-1,146,11);
    pixelText(ctx,`${selected?'>':' '} ${drink.name} ${drink.price?drink.price+' M.':'gratis'}`,9,y,PALETTE[selected?0:3]);
  }
  pixelText(ctx,'A: BESTELLEN  B: AUFSTEHEN',8,132,PALETTE[2]);
}
