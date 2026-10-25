import { drawQuests } from './quests.js';
import { BAG_TABS,hasUnreadQuests } from '../systems/quest-log.js';
import { drawHearts,drawProfile } from './health.js';
import { rect } from './primitives.js';
import { pixelText } from '../../display/font.js';
import { PALETTE } from '../../core/config.js';
import { ITEM_LABELS } from '../data/items.js';
import { stickBorrowed } from '../systems/dog-fetch.js';

/** Zeichnet sechs auswählbare Fächer, Karte und die jeweils verfügbaren Aktionen. @param {object} render Zeicheninformationen. */
export function drawBag(render) {
  const {ctx,game}=render;
  const height=game.bagTab==='profile'?122:128;
  rect(ctx,3,10,16,140,height); rect(ctx,0,12,18,136,height-4);
  drawBagTabs(ctx,game);
  if (game.bagTab==='profile') return drawProfile(render);
  if (game.bagTab==='quests') return drawQuests(render);
  drawHearts(ctx,game.health,20,34); pixelText(ctx,`${game.coins} G`,131,33,PALETTE[2],1,true);
  for (let i=0;i<6;i++) {
    const name=game.inventory[i]==='Ast' && stickBorrowed(game)?'Ast (Hund)':game.inventory[i];
    drawSlot(ctx,name,20+(i%2)*63,43+Math.floor(i/2)*22,game.bagIndex===i);
  }
  drawBagActions(ctx,game);
}

/** Kennzeichnet das ausgewählte Fach mit einer kräftigen doppelten Kontur. @param {CanvasRenderingContext2D} ctx Kontext. @param {string} name Gegenstand. @param {number} x X. @param {number} y Y. @param {boolean} selected Gewählt. */
function drawSlot(ctx,name,x,y,selected) {
  rect(ctx,selected?3:2,x,y,56,20); rect(ctx,1,x+(selected?2:1),y+(selected?2:1),selected?52:54,selected?16:18);
  const lines=ITEM_LABELS[name] || (name || '-').match(/.{1,9}/gu);
  ctx.save(); ctx.beginPath(); ctx.rect(x+3,y+2,50,16); ctx.clip();
  for (let i=0;i<Math.min(2,lines.length);i++) pixelText(ctx,lines[i],x+4,y+3+i*8,PALETTE[3]);
  ctx.restore();
}

/** Hält alle Aktionen mit dem Steuerkreuz und A/B bedienbar. @param {CanvasRenderingContext2D} ctx Kontext. @param {object} game Spiel. */
function drawBagActions(ctx,game) {
  if (game.bagAction) {
    for (let i=0;i<2;i++) {
      const selected=game.bagChoice===i; rect(ctx,selected?3:1,20+i*63,111,56,10);
      pixelText(ctx,i?'ANSEHEN':'BENUTZEN',48+i*63,112,PALETTE[selected?0:3],1,true);
    }
  } else {
    for (let i=0;i<3;i++) {
      const selected=game.bagIndex===6+i,x=20+(i%2)*63,y=i>=2?123:111,w=i===2?119:56;
      rect(ctx,selected?3:1,x,y,w,10); pixelText(ctx,['KARTE','NOTIZEN','TON'][i],x+w/2,y+1,PALETTE[selected?0:3],1,true);
    }
  }
  pixelText(ctx,'PFEILE: WAHL  A: OK  B: ZU',80,135,PALETTE[2],1,true);
}

/** Markiert die drei Rucksackreiter und neue Erkenntnisse mit einem ruhigen Punkt. @param {CanvasRenderingContext2D} ctx Kontext. @param {object} game Spiel. */
function drawBagTabs(ctx,game) {
  for (let i=0;i<BAG_TABS.length;i++) {
    const active=game.bagTab===BAG_TABS[i],x=20+i*41;
    rect(ctx,active?3:1,x,21,38,10);
    pixelText(ctx,['BEUTEL','PROFIL','QUESTS'][i],x+19,22,PALETTE[active?0:3],1,true);
    if (game.bagTabFocus && active) rect(ctx,3,x,31,38,1);
    if (i===2 && hasUnreadQuests(game)) rect(ctx,active?0:3,x+34,22,2,2);
  }
}
