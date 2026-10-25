import { WEAPON_TIMING } from '../systems/weapon-timing.js';
import { heroStats } from '../systems/health.js';
import { playerPosition,rect } from './primitives.js';

const FACING={right:0,down:Math.PI/2,left:Math.PI,up:-Math.PI/2};

/** Hält die Klinge erst angehoben und führt einen Viertelkreis bis exakt in Blickrichtung aus. @param {object} game Spiel. */
export function weaponPose(game) {
  const elapsed=WEAPON_TIMING.duration-game.attackTime,facing=game.attackFacing || game.player.facing;
  const progress=game.reduced?1:Math.max(0,Math.min(1,(elapsed-WEAPON_TIMING.windup)/(WEAPON_TIMING.impact-WEAPON_TIMING.windup)));
  const lift=(facing==='left'?1:-1)*Math.PI/2;
  return {angle:FACING[facing]+lift*(1-progress),length:heroStats(game).weapon==='Rostiges Schwert'?17:14};
}

/** Zeichnet Ast und Klinge am Griffpunkt mit einer angehobenen Klinge und einem Viertelkreis zum Ziel. @param {object} render Zeicheninformationen. */
export function drawWeaponSwing(render) {
  const {ctx,game}=render;
  if (!game.attackTime) return;
  const player=playerPosition(game),pose=weaponPose(game),sword=heroStats(game).weapon==='Rostiges Schwert';
  const base=FACING[game.attackFacing || game.player.facing],x=player.x*16+8+Math.cos(base)*5,y=player.y*16+9+Math.sin(base)*4;
  for (let distance=2;distance<=pose.length;distance++) {
    const xx=x+Math.cos(pose.angle)*distance,yy=y+Math.sin(pose.angle)*distance;
    rect(ctx,3,xx-1,yy-1,3,3); rect(ctx,sword?0:2,xx,yy,1,1);
  }
  if (sword) {
    const xx=x+Math.cos(pose.angle)*4,yy=y+Math.sin(pose.angle)*4;
    for (let cross=-3;cross<=3;cross++) rect(ctx,2,xx-Math.sin(pose.angle)*cross,yy+Math.cos(pose.angle)*cross,1,1);
  }
}
