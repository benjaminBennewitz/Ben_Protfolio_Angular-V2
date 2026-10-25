import { drawDogSprite } from './dog.js';
import { AWAKENING_ANIMALS } from '../data/village-fauna.js';

/** Zeichnet Bewohner und kleine Tiere mit ruhigen, positionsfesten Bewegungen. @param {object} render Zeicheninformationen. @param {object} object Lebewesen. @param {number} x X. @param {number} y Y. */
export function drawResident(render,object,x,y) {
  if (object.appearance) return drawHuman(render,object,x,y);
  if (object.kind==='wildlife') return drawWildlife(render,object,x,y);
  return drawDogSprite(render,object,x,y);
}

/** Verwendet die nativen Richtungs- und Schrittframes der Bewohner. @param {object} render Zeicheninformationen. @param {object} object Bewohner. @param {number} x X. @param {number} y Y. */
function drawHuman(render,object,x,y) {
  const [sx,sy]=object.appearance,pose=npcIdle(render.game,object),ctx=render.ctx;
  ctx.save(); ctx.translate(Math.round(x+2),Math.round(y+pose.lift));
  if (pose.flip) { ctx.translate(12,0); ctx.scale(-1,1); }
  ctx.drawImage(render.assets.npcSamples,sx+pose.offsetX,sy,12,16,0,0,12,16); ctx.restore();
}

/** Gibt jedem Bewohner versetztes Atmen und einen gelegentlichen seitlichen Blick. @param {object} game Spiel. @param {object} object Bewohner. */
export function npcIdle(game,object) {
  if (object.seated) return {offsetX:object.facing==='up'?48:0,lift:0};
  if (game.reduced && !object.route) return {offsetX:0,lift:0};
  if (object.route && object.facing) {
    const side=['left','right'].includes(object.facing),frame=object.walking && !game.reduced?Math.floor(game.time*7)%(side?4:3):0;
    return {offsetX:(side?96:object.facing==='up'?48:0)+frame*12,lift:0,flip:object.facing==='right'};
  }
  const phase=Math.floor(game.time*2+object.x*3+object.y*5)%20;
  return {offsetX:phase>=16 && phase<19?96+(phase===17?12:0):0,lift:phase===8 || phase===9?-1:0};
}

/** Zeichnet den vorhandenen Hausmeister mit einer ruhigen Atembewegung. @param {object} render Zeicheninformationen. @param {object} object Hausmeister. @param {number} x X. @param {number} y Y. */
export function drawKeeper(render,object,x,y) {
  const pose=npcIdle(render.game,object);
  render.ctx.drawImage(render.assets.goblin,Math.round(x),Math.round(y-3+pose.lift),16,20);
}

/** Zeichnet die zwei Originalframes der Kleintiere ohne Hintergrund oder Skalierung. @param {object} render Zeicheninformationen. @param {object} object Tierobjekt. @param {number} x X. @param {number} y Y. */
function drawWildlife(render,object,x,y) {
  if (object.spriteSet==='awakening') return drawAwakeningAnimal(render,object,x,y);
  const {ctx,game,assets}=render;
  const frame=game.reduced?0:Math.floor(game.time*(object.walking?8:2))%2;
  ctx.save(); ctx.translate(x,y);
  if (object.facing==='right') { ctx.translate(16,0); ctx.scale(-1,1); }
  ctx.drawImage(assets.wildlife[object.animal],frame*16,0,16,16,0,0,16,16); ctx.restore();
}

/** Verwendet die echten Frosch-, Schlangen- und Vogelframes des vorhandenen Awakening-Sheets. @param {object} render Zeicheninformationen. @param {object} object Tier. @param {number} x X. @param {number} y Y. */
export function drawAwakeningAnimal(render,object,x,y) {
  const {ctx,game,assets}=render,art=AWAKENING_ANIMALS[object.animal],frames=object.walking && art.walking?art.walking:art.frames;
  const phase=game.reduced?0:Math.floor(game.time*(object.walking?8:2)+object.x)%30;
  const index=object.animal==='bird'?(phase>=27?1+phase%2:0):object.walking?phase%2:0;
  const [sx,sy]=frames[index],lift=object.animal==='frog' && object.walking && index===1?-2:0;
  ctx.save(); ctx.translate(x,y+lift);
  if (object.facing==='left') { ctx.translate(16,0); ctx.scale(-1,1); }
  const size=object.animal==='snake'?10:object.animal==='frog'?12:16;
  ctx.drawImage(assets.villagers,sx,sy,16,16,Math.floor((16-size)/2),16-size,size,size); ctx.restore();
}

