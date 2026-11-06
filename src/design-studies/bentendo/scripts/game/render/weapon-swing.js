import { isSword } from '../data/items.js';
import { WEAPON_TIMING } from '../systems/weapon-timing.js';
import { heroStats } from '../systems/health.js';
import { playerPosition,rect } from './primitives.js';

const FACING={right:0,down:Math.PI/2,left:Math.PI,up:-Math.PI/2};

/** Winkel relativ zur Trefferachse: zurückziehen, beschleunigen, kurz durchziehen. @param {number} elapsed Verstrichene Angriffszeit. */
function swordOffset(elapsed) {
  const radians=Math.PI/180;
  const {windup,impact,duration}=WEAPON_TIMING;
  if (elapsed<windup) return -(40+15*Math.max(0,elapsed/windup))*radians;
  if (elapsed<impact) {
    const t=Math.max(0,(elapsed-windup)/(impact-windup)*2-1);
    return -55*radians*(1-t*t);
  }
  return 10*radians*Math.min(1,(elapsed-impact)/(duration-impact));
}

/** Bestimmt die Pose relativ zur beim Angriff fixierten Blickrichtung. @param {object} game Spiel. */
export function weaponPose(game) {
  const elapsed=WEAPON_TIMING.duration-game.attackTime,facing=game.attackFacing || game.player.facing;
  const sign=facing==='left'?-1:1;
  if (isSword(heroStats(game).weapon)) {
    const offset=game.reduced?0:swordOffset(elapsed);
    return {angle:FACING[facing]+sign*offset,length:17};
  }
  const progress=game.reduced?1:Math.max(0,Math.min(1,(elapsed-WEAPON_TIMING.windup)/(WEAPON_TIMING.impact-WEAPON_TIMING.windup)));
  return {angle:FACING[facing]-sign*Math.PI/2*(1-progress),length:14};
}

/** Zeichnet die zurückgelegte Klingenspur. Die helle Schneide läuft am älteren Ende spitz aus. @param {object} ctx Zeichenfläche. @param {number} x Griff-X. @param {number} y Griff-Y. @param {string} facing Schlagrichtung. @param {number} elapsed Angriffszeit. */
function drawSlash(ctx,x,y,facing,elapsed) {
  if (elapsed<=WEAPON_TIMING.windup) return;
  const sign=facing==='left'?-1:1;
  const start=swordOffset(Math.max(WEAPON_TIMING.windup,elapsed-0.095));
  const end=swordOffset(elapsed);
  const fade=Math.min(1,(WEAPON_TIMING.duration-elapsed)/0.025);
  const samples=Math.ceil((end-start)*30);
  for (let i=1;i<=samples;i++) {
    const fraction=i/samples,angle=FACING[facing]+sign*(start+(end-start)*fraction);
    const thickness=Math.ceil((2+5*fraction)*fade);
    for (let j=0;j<thickness;j++) {
      const radius=20-j;
      rect(ctx,j===0?3:j<=2 || fraction>0.65?0:1,x+Math.cos(angle)*radius,y+Math.sin(angle)*radius,1,1);
    }
  }
}

/** Zeichnet Spur, Klingenschatten und Schneide am Griffpunkt. @param {object} render Zeicheninformationen. */
export function drawWeaponSwing(render) {
  const {ctx,game}=render;
  if (!game.attackTime) return;
  const player=playerPosition(game),pose=weaponPose(game),sword=isSword(heroStats(game).weapon);
  const facing=game.attackFacing || game.player.facing,base=FACING[facing];
  const x=player.x*16+8+Math.cos(base)*5,y=player.y*16+9+Math.sin(base)*4;
  if (sword && !game.reduced) drawSlash(ctx,x,y,facing,WEAPON_TIMING.duration-game.attackTime);
  for (let distance=2;distance<=pose.length;distance++) {
    const xx=x+Math.cos(pose.angle)*distance,yy=y+Math.sin(pose.angle)*distance;
    rect(ctx,3,xx-1,yy-1,3,3);
    if (!sword) rect(ctx,2,xx,yy,1,1);
  }
  if (sword) {
    for (let distance=5;distance<=pose.length;distance++) {
      rect(ctx,0,x+Math.cos(pose.angle)*distance,y+Math.sin(pose.angle)*distance,1,1);
    }
    const xx=x+Math.cos(pose.angle)*4,yy=y+Math.sin(pose.angle)*4;
    for (let cross=-3;cross<=3;cross++) rect(ctx,2,xx-Math.sin(pose.angle)*cross,yy+Math.cos(pose.angle)*cross,1,1);
  }
}
