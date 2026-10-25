import { minuteOfDay,nightShade } from '../systems/world-clock.js';
import { rect } from './primitives.js';
import { pixelText } from '../../display/font.js';
import { PALETTE } from '../../core/config.js';

/** Tönt nur die Außenwelt und hält alle danach gezeichneten Bedienflächen unverändert lesbar. @param {object} render Zeicheninformationen. */
export function drawDaylight(render) {
  const {ctx,game}=render;
  if (game.room.id!=='village' && !game.room.villageLandscape) return;
  let shade=nightShade(minuteOfDay(game));
  if (game.doorStudy && !game.reduced) {
    const progress=Math.min(1,game.doorStudy.elapsed/game.doorStudy.duration);
    shade=game.doorStudy.from+(shade-game.doorStudy.from)*progress;
  }
  if (!shade) return;
  ctx.save(); ctx.globalAlpha=shade; ctx.fillStyle='#102c27'; ctx.fillRect(0,0,160,144); ctx.restore();
}

/** Zeigt die Untersuchung in drei kurzen Schritten mit maximal zwei Zeilen. @param {object} render Zeicheninformationen. */
export function drawDoorStudy(render) {
  const {ctx,game}=render;
  if (!game.doorStudy || game.systemMenu) return;
  const phase=Math.min(2,Math.floor(game.doorStudy.elapsed/3));
  const lines=[['Du prüfst deine','Zeichnung am Stein.'],['Während du arbeitest,','verstreichen Stunden.'],['Über den Baumkronen','bricht der Abend an.']][phase];
  rect(ctx,3,0,122,160,22); rect(ctx,0,1,123,158,20);
  for (let i=0;i<lines.length;i++) pixelText(ctx,lines[i],4,125+i*8,PALETTE[3]);
}

