import { rect } from './primitives.js';
import { pixelText } from '../../display/font.js';
import { PALETTE } from '../../core/config.js';

/** Zeichnet ruhende Haustiere ohne Lauf-/Idlebewegung und mit gut lesbarem Schlafzeichen. @param {object} render Zeicheninformationen. @param {object} pet Schlaftier. */
export function drawSleepingPet(render,pet) {
  const {ctx,game}=render,x=pet.x*16,y=pet.y*16;
  if (pet.kind==='dog') {
    ctx.drawImage(render.assets.dogSprite,4,14,24,18,x-4,y+5,24,11);
    rect(ctx,3,x+12,y+8,3,1);
  } else {
    rect(ctx,3,x+2,y+9,12,6); rect(ctx,1,x+3,y+10,10,4);
    rect(ctx,3,x+10,y+7,5,6); rect(ctx,3,x+10,y+5,2,3); rect(ctx,3,x+13,y+5,2,3);
    rect(ctx,1,x+11,y+9,3,1); rect(ctx,3,x,y+11,5,3);
  }
  const lift=game.reduced?0:Math.floor(game.time/2)%2;
  rect(ctx,3,x+1,y-10-lift,16,9);
  pixelText(ctx,'zzz',x+3,y-9-lift,PALETTE[0]);
}
