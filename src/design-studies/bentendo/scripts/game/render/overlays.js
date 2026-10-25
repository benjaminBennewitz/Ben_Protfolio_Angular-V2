import { rect } from './primitives.js';
import { pixelText } from '../../display/font.js';
import { wrapText } from '../systems/text.js';
import { PALETTE } from '../../core/config.js';
export { drawBag } from './bag.js';

/** Wählt genau eine Anzeige; Ortswechsel und echte Dialoge ersetzen ältere Kurzmeldungen. @param {object} game Spiel. */
export function currentOverlay(game) {
  if (game.systemMenu) return 'system';
  if (game.message) return 'dialog';
  if (game.tavernMenu) return 'drinks';
  if (game.bagOpen) return 'bag';
  if (game.journalOpen) return 'journal';
  if (game.mapOpen) return 'map';
  if (game.locationNotice) return 'location';
  return 'hud';
}

/** Zeichnet ausschließlich den benannten Aktionshinweis. @param {object} render Zeicheninformationen. */
export function drawHud(render) {
  const { ctx, game } = render;
  if (!game.hint || game.message || game.bagOpen || game.journalOpen || game.mapOpen) return;
  const lines = wrapText(game.hint, 34);
  rect(ctx, 3, 0, 126, 160, 18);
  for (let i = 0; i < Math.min(2,lines.length); i++) pixelText(ctx, lines[i], 3, 127+i*8, PALETTE[0]);
}

/** Zeichnet eine Dialogseite. @param {object} render Zeicheninformationen. */
export function drawDialog(render) {
  const { ctx, game } = render;
  if (!game.message) return;
  rect(ctx, 3, 0, 99, 160, 45); rect(ctx, 0, 2, 101, 156, 41);
  drawPortrait(render);
  pixelText(ctx, game.message.speaker.slice(0,26), 36, 104, PALETTE[2]);
  for (let i = 0; i < game.message.lines.length; i++) pixelText(ctx, game.message.lines[i], 36, 115+i*8, PALETTE[3]);
}

/** Zeichnet das vorhandene Sprecherporträt. @param {object} render Zeicheninformationen. */
function drawPortrait(render) {
  const { ctx, game, assets } = render;
  ctx.save(); ctx.beginPath(); ctx.rect(4,104,29,36); ctx.clip();
  const appearance=speakerAppearance(game);
  if (appearance) ctx.drawImage(assets.npcSamples,appearance[0],appearance[1],12,16,6,106,24,32);
  else if (['Hausmeister','Torwache'].includes(game.message.speaker)) ctx.drawImage(assets.goblin,4,108,28,35);
  else ctx.drawImage(assets.portraits,game.avatar==='female'?0:64,0,64,64,3,108,30,30);
  ctx.restore();
}

/** Findet die tatsächlich verwendete Bewohnerfigur für ihr Dialogporträt. @param {object} game Spiel. */
function speakerAppearance(game) {
  for (const object of game.objects) if (object.name===game.message.speaker && object.appearance) return object.appearance;
  return null;
}

/** Zeichnet gesammelte und wiederlesbare Gildennotizen. @param {object} render Zeicheninformationen. */
export function drawJournal(render) {
  const { ctx, game } = render;
  if (!game.journalOpen) return;
  rect(ctx, 3, 2, 17, 156, 127); rect(ctx, 0, 4, 19, 152, 123);
  const note = game.notes[game.journalIndex];
  pixelText(ctx, `JOURNAL ${note ? game.journalIndex+1 : 0}/${game.notes.length}`, 8, 25, PALETTE[3]);
  pixelText(ctx, note?.title.slice(0,31) || 'NOCH KEINE NOTIZEN', 8, 38, PALETTE[2]);
  const lines = wrapText(note?.text || 'Lose Blätter findest du beim Erkunden.', 32);
  for (let i = 0; i < Math.min(10,lines.length); i++) pixelText(ctx, lines[i], 8, 51+i*8, PALETTE[3]);
  pixelText(ctx, 'PFEILE: BLÄTTERN  B: ZU', 8, 133, PALETTE[2]);
}

/** Meldet einen betretenen Ort kurz im Stil der Dialogbox, ohne die Bewegung zu sperren. @param {object} render Zeicheninformationen. */
export function drawLocation(render) {
  const {ctx,game}=render;
  if (!game.locationNotice || game.message || game.bagOpen || game.journalOpen || game.mapOpen) return;
  rect(ctx,3,0,129,160,15); rect(ctx,0,1,130,158,13);
  const title=game.locationNotice.title;
  const label=title.length<=19?`${title} betreten …`:title;
  ctx.save(); ctx.beginPath(); ctx.rect(4,131,152,11); ctx.clip();
  pixelText(ctx,label.slice(0,35),4,132,PALETTE[3]); ctx.restore();
}
