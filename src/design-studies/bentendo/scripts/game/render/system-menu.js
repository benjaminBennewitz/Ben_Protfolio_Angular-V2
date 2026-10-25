import { restChoiceLabel } from '../systems/rest-menu.js';
import { rect } from './primitives.js';
import { pixelText } from '../../display/font.js';
import { PALETTE } from '../../core/config.js';
import { wrapText } from '../systems/text.js';

/** Zeichnet genau ein Bedienmenü über der pausierten Spielwelt. @param {object} render Zeicheninformationen. */
export function drawSystemMenu(render) {
  const {ctx,game}=render,menu=game.systemMenu;
  rect(ctx,3,8,20,144,119); rect(ctx,0,10,22,140,115);
  pixelText(ctx,{pause:'PAUSE',audio:'TON EINSTELLEN',save:'SPIEL SPEICHERN',rest:'BIS WANN SCHLAFEN?'}[menu.kind],80,29,PALETTE[3],1,true);
  if (menu.status) return drawStatus(ctx,menu.status);
  if (menu.kind==='audio') return drawAudioMenu(ctx,menu);
  const labels=menu.kind==='rest'?[0,1,2,3].map(/** Beschriftet die Schlafauswahl. @param {number} index Zielzeit. */ index=>restChoiceLabel(game,index)):menu.kind==='pause'?['WEITER','NOTIZEN','KARTE','TON EINSTELLEN','SPEICHERN']:['SPEICHERN','ZURÜCK'];
  for (let i=0;i<labels.length;i++) pixelText(ctx,`${menu.choice===i?'>':' '} ${labels[i]}`,23,46+i*14,PALETTE[3]);
  pixelText(ctx,'PFEILE: WAHL  A: OK  B: ZU',80,124,PALETTE[2],1,true);
}

/** Hält Speicherergebnis und Rückweg lesbar zusammen. @param {CanvasRenderingContext2D} ctx Kontext. @param {string} status Ergebnis. */
function drawStatus(ctx,status) {
  const lines=wrapText(status,28);
  for (let i=0;i<Math.min(4,lines.length);i++) pixelText(ctx,lines[i],17,58+i*8,PALETTE[3]);
  pixelText(ctx,'A / B: ZURÜCK',80,121,PALETTE[2],1,true);
}

/** Zeichnet getrennte Regler und benennt die vier Richtungen ohne Zusatztaste. @param {CanvasRenderingContext2D} ctx Kontext. @param {object} menu Menü. */
function drawAudioMenu(ctx,menu) {
  for (let i=0;i<2;i++) {
    const value=menu.levels?.[i?'sfx':'bgm'] ?? 1,y=46+i*21;
    pixelText(ctx,`${menu.choice===i?'>':' '} ${i?'SFX':'BGM'}  ${Math.round(value*100)} %`,22,y,PALETTE[3]);
    rect(ctx,2,35,y+11,90,4); rect(ctx,3,35,y+11,Math.round(90*value),4);
  }
  pixelText(ctx,`${menu.choice===2?'>':' '} MENÜ-BEEPS ${menu.levels?.menuBeeps===false?'AUS':'AN'}`,22,89,PALETTE[3]);
  pixelText(ctx,`${menu.choice===3?'>':' '} ZURÜCK`,22,104,PALETTE[3]);
  pixelText(ctx,'OBEN/UNTEN: WAHL',80,119,PALETTE[2],1,true);
  pixelText(ctx,'LINKS/RECHTS: TON  B: ZU',80,128,PALETTE[2],1,true);
}
