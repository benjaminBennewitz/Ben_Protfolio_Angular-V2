import { rect } from './primitives.js';
import { pixelText } from '../../display/font.js';
import { PALETTE } from '../../core/config.js';
import { questMapMarkers } from '../systems/quest-map.js';

/** Zeichnet ruhige Hinweiszeichen mit hellem Hof und bewahrt den Spielerstandort als oberste Ebene. @param {object} render Zeicheninformationen. @param {object} plan Kartenmaßstab. */
export function drawQuestMarkers(render,plan) {
  const {ctx,game}=render;
  for (const marker of questMapMarkers(game,plan.room.id)) {
    const x=Math.max(14,Math.min(137,Math.round(plan.x+marker.x*plan.scale))),y=Math.max(21,Math.min(100,Math.round(plan.y+marker.y*plan.scale)-4));
    rect(ctx,0,x-3,y,8,11); rect(ctx,1,x-3,y+10,8,1);
    pixelText(ctx,marker.symbol,x-1,y,PALETTE[3]);
  }
}
