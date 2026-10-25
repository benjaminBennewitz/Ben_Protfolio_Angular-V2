import { rect } from './primitives.js';

/** Zeichnet eine ruhige Speicherdiskette mit Haken oder Fehlerkreuz rechts unten oberhalb aktiver Textleisten. @param {object} render Zeicheninformationen. */
export function drawSaveIndicator(render) {
  const {ctx,game}=render,notice=game.saveNotice;
  if (!notice || notice.remaining<=0) return;
  const x=143,y=game.message?82:game.hint || game.locationNotice || game.bagOpen || game.mapOpen || game.journalOpen || game.systemMenu?110:127;
  rect(ctx,3,x-1,y-1,16,16); rect(ctx,0,x,y,14,14);
  rect(ctx,3,x+2,y+1,9,5); rect(ctx,0,x+8,y+2,2,3);
  rect(ctx,3,x+2,y+8,9,5); rect(ctx,0,x+3,y+9,7,3);
  if (notice.success) {
    for (const [dx,dy] of [[5,10],[6,11],[7,10],[8,9]]) rect(ctx,3,x+dx,y+dy,1,1);
  } else {
    for (let i=0;i<5;i++) { rect(ctx,3,x+5+i,y+8+i,1,1); rect(ctx,3,x+9-i,y+8+i,1,1); }
  }
}
