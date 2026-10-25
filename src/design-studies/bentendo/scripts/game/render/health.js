import { rect } from './primitives.js';
import { pixelText } from '../../display/font.js';
import { PALETTE } from '../../core/config.js';
import { heroStats } from '../systems/health.js';

const HEART=['0110110','1111111','1111111','1111111','0111110','0011100','0001000'];

/** Zeichnet Viertel-, Halb- und Ganzherzen mit derselben Pixelkontur im HUD und Rucksack. @param {CanvasRenderingContext2D} ctx Kontext. @param {object} health Lebenswerte. @param {number} x X. @param {number} y Y. */
export function drawHearts(ctx,health,x,y) {
  for (let heart=0;heart<health.maxHp/2;heart++) drawHeartIcon(ctx,x+heart*10,y,Math.min(4,Math.max(0,(health.hp-heart*2)*2)));
}

/** Zeigt das Leben ausschließlich im Dungeon und außerhalb bildfüllender Menüs. @param {object} render Zeicheninformationen. */
export function drawDungeonHealth(render) {
  const {ctx,game}=render;
  if (!game.room.dungeon || game.bagOpen || game.journalOpen || game.mapOpen || game.systemMenu) return;
  rect(ctx,3,2,2,68,14); rect(ctx,0,3,3,66,12); drawHearts(ctx,game.health,7,5);
  pixelText(ctx,`${game.health.hp}/${game.health.maxHp}`,43,5,PALETTE[3]);
  if (game.room.boss && game.nestWave && !game.flags.quellNestCleared) {
    rect(ctx,0,89,3,69,12); pixelText(ctx,`WELLE ${game.nestWave}/3`,94,5,PALETTE[3]);
  }
}

/** Verbindet Porträt und tatsächliche Kampfwerte ohne erfundene Erfahrungspunkte oder Level. @param {object} render Zeicheninformationen. */
export function drawProfile(render) {
  const {ctx,game,assets}=render,stats=heroStats(game);
  ctx.drawImage(assets.portraits,game.avatar==='female'?0:64,0,64,64,20,39,48,48);
  pixelText(ctx,game.avatar==='female'?'HELDIN':'HELD',82,40,PALETTE[3]);
  drawHearts(ctx,game.health,82,52); pixelText(ctx,`LP ${game.health.hp}/${game.health.maxHp}`,82,64,PALETTE[3]);
  pixelText(ctx,`ANGRIFF ${stats.attack}`,82,76,PALETTE[3]); pixelText(ctx,`SCHUTZ ${stats.defense}`,82,87,PALETTE[3]);
  pixelText(ctx,stats.weapon,80,100,PALETTE[3],1,true);
  pixelText(ctx,`${game.coins} G   GEFALLEN: ${game.health.deaths}`,80,111,PALETTE[2],1,true);
  pixelText(ctx,game.health.lost?'BEUTEL IM DUNGEON':'REISEKLEIDUNG',80,119,PALETTE[2],1,true);
  pixelText(ctx,'L: BEUTEL  R: QUESTS',80,129,PALETTE[2],1,true);
}

/** Zeigt den Kopf auf dem Kissen unter der unveränderten Bettdecke. @param {object} render Zeicheninformationen. @param {object} bed Eigenes Bett. */
export function drawSleepingHero(render,bed) {
  const {ctx,game,assets}=render,x=bed.x*16,y=bed.y*16;
  ctx.drawImage(assets.heroes[game.avatar],2,0,12,8,x+10,y+5,12,8);
  pixelText(ctx,'Z',x+27,y+3,PALETTE[3]);
}

/** Füllt eine Herzkontur in vier sichtbaren Teilflächen, auch für kleine Lebensdrops. @param {CanvasRenderingContext2D} ctx Kontext. @param {number} x X. @param {number} y Y. @param {number} quarters Viertel zwischen null und vier. */
export function drawHeartIcon(ctx,x,y,quarters) {
  for (let yy=0;yy<7;yy++) for (let xx=0;xx<7;xx++) {
    if (HEART[yy][xx]!=='1') continue;
    const edge=HEART[yy-1]?.[xx]!=='1' || HEART[yy+1]?.[xx]!=='1' || HEART[yy][xx-1]!=='1' || HEART[yy][xx+1]!=='1';
    const part=xx<=3?(yy<=3?1:2):(yy>3?3:4);
    rect(ctx,edge || part<=quarters?3:1,x+xx,y+yy,1,1);
  }
}

/** Zeichnet liegengebliebene Herzen deutlich vom Inventarbeutel unterscheidbar. @param {object} render Zeicheninformationen. */
export function drawHeartDrops(render) {
  const {ctx,game}=render,bob=game.reduced?0:Math.round(Math.sin(game.time*3));
  for (const drop of game.heartDrops) drawHeartIcon(ctx,drop.x*16+4,drop.y*16+5+bob,drop.amount*2);
}
