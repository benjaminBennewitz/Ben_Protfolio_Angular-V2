import { rect } from './primitives.js';

/** Wählt nur die belegten Stand-/Laufbilder des gelieferten Minifolks-Wolfs. @param {object} game Spiel. @param {object} dog Hund. */
export function dogPose(game,dog) {
  const walking=Boolean(dog.walking),count=walking?6:4;
  const frame=game.reduced?0:Math.floor(game.time*(walking?9:3))%count;
  const mouth=(walking?[8,7,8,9,11,10]:[9,10,11,10])[frame];
  return {frame,row:walking?1:0,mouth};
}

/** Zeichnet native Pixel mit dunkler Kontur und erhaltener Ausrichtung am Fußpunkt. @param {object} render Zeicheninformationen. @param {object} dog Hund. @param {number} x X. @param {number} y Y. */
export function drawDogSprite(render,dog,x,y) {
  const {ctx,game,assets}=render,pose=dogPose(game,dog);
  ctx.save(); ctx.translate(Math.round(x+8),Math.round(y));
  if (dog.facing==='left') ctx.scale(-1,1);
  ctx.drawImage(assets.dogSprite,pose.frame*32+4,pose.row*32+14,24,18,-12,-2,24,18);
  if (dog.carryingStick) {
    rect(ctx,3,3,pose.mouth,12,2); rect(ctx,1,4,pose.mouth,10,1);
    rect(ctx,3,10,pose.mouth-2,2,2);
  }
  ctx.restore();
}
