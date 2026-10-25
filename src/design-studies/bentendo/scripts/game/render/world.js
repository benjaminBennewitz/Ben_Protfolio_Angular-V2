import { drawDaylight,drawDoorStudy } from './daylight.js';
import { drawSaveIndicator } from './save-indicator.js';
import { drawDungeonHealth,drawHeartDrops } from './health.js';
import { drawWeaponSwing } from './weapon-swing.js';
import { drawEnemies } from './dungeon.js';
import { drawSystemMenu } from './system-menu.js';
import { drawDrinks } from './tavern.js';
import { drawInterior } from './interior.js';
import { drawMap } from './map.js';
import { drawVillage, drawVillageHero } from './village.js';
import { terrain } from './terrain.js';
import { drawObjects } from './objects.js';
import { playerPosition, rect } from './primitives.js';
import { drawHud, drawDialog, drawBag, drawJournal, drawLocation, currentOverlay } from './overlays.js';
import { drawSpeechBubble } from './speech-bubble.js';
import { clamp } from '../../core/dom.js';
const OVERLAYS={system:drawSystemMenu,drinks:drawDrinks,hud:drawHud,dialog:drawDialog,bag:drawBag,journal:drawJournal,map:drawMap,location:drawLocation};

/** Zeichnet eine Kameraansicht des unveränderten Rätselprototyps. @param {object} render Zeicheninformationen. */
export function drawWorld(render) {
  const { ctx, game } = render;
  const player = playerPosition(game);
  const x = clamp(player.x*16-72, 0, game.room.width*16-160);
  const y = clamp(player.y*16-64, 0, game.room.height*16-144);
  rect(ctx, 1, 0, 0, 160, 144);
  ctx.save(); ctx.beginPath(); ctx.rect(0,0,160,144); ctx.clip();
  ctx.translate(-Math.round(x),-Math.round(y));
  if (game.room.id === 'village' || game.room.villageLandscape) drawVillage(render,player);
  else if (game.room.furnished) drawInterior(render,player);
  else { terrain(render); drawObjects(render); drawHeartDrops(render); drawWeaponSwing(render); drawPlayer(render, player); drawEnemies(render); }
  ctx.restore();
  drawDaylight(render);
  const overlay=currentOverlay(game);
  if (overlay==='hud') drawSpeechBubble(render,{x:Math.round(x),y:Math.round(y)});
  drawDungeonHealth(render); OVERLAYS[overlay](render); drawDoorStudy(render); drawSaveIndicator(render);
}

/** Zeichnet das gewählte Charakterpreset auch in den bisherigen Rätselräumen. @param {object} render Zeicheninformationen. @param {object} player Interpolierte Position. */
function drawPlayer(render, player) {
  drawVillageHero(render,player);
}
