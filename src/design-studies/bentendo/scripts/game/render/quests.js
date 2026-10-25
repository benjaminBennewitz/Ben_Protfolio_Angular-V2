import { rect } from './primitives.js';
import { pixelText,pixelTextWidth } from '../../display/font.js';
import { PALETTE } from '../../core/config.js';
import { questEntries,selectedQuest,questUnread,questLines } from '../systems/quest-log.js';

/** Hält die Questliste und jede Hinweisseite im unveränderten LCD-Raster vollständig lesbar. @param {object} render Zeicheninformationen. */
export function drawQuests(render) {
  const {ctx,game}=render,entries=questEntries(game),entry=selectedQuest(game);
  if (game.questDetail && entry) return drawQuestPage(ctx,game,entry);
  pixelText(ctx,`AUFGABEN ${entries.length}`,20,34,PALETTE[2]);
  if (!entries.length) { pixelText(ctx,'NOCH KEINE HINWEISE.',20,56,PALETTE[3]); pixelText(ctx,'GESPRÄCHE UND FUNDE',20,74,PALETTE[2]); pixelText(ctx,'ERGÄNZEN DAS BUCH.',20,83,PALETTE[2]); }
  const start=Math.max(0,game.questIndex-3);
  for (let i=start;i<Math.min(entries.length,start+4);i++) drawQuestRow(ctx,game,entries[i],i,44+(i-start)*19);
  if (entries.length>4) pixelText(ctx,`${game.questIndex+1}/${entries.length}`,137,34,PALETTE[2],1,true);
  pixelText(ctx,'OBEN/UNTEN  A: LESEN',80,123,PALETTE[2],1,true);
  pixelText(ctx,'B: BEUTEL',80,133,PALETTE[2],1,true);
}

/** Kennzeichnet neue Erkenntnisse, Abschluss und angeheftete Aufgaben ohne zusätzliche Farbe. @param {CanvasRenderingContext2D} ctx Kontext. @param {object} game Spiel. @param {object} entry Aufgabe. @param {number} index Auswahl. @param {number} y Zeile. */
function drawQuestRow(ctx,game,entry,index,y) {
  const selected=game.questIndex===index && !game.bagTabFocus,color=selected?0:3;
  rect(ctx,selected?3:1,20,y,120,18);
  ctx.save(); ctx.beginPath(); ctx.rect(23,y,114,18); ctx.clip();
  pixelText(ctx,questTitle(`${game.flags.questPinned===entry.id?'* ':''}${entry.title}`),24,y+1,PALETTE[color]);
  const status=entry.status==='done'?'ERLEDIGT':entry.ready?'NEUE ENTWICKLUNG':'OFFEN';
  pixelText(ctx,`${questUnread(game,entry)?'NEU · ':''}${status}`,24,y+9,PALETTE[selected?1:2]); ctx.restore();
}

/** Blättert lange Inhalte in acht Zeilen und benennt die Anheftaktion ausdrücklich. @param {CanvasRenderingContext2D} ctx Kontext. @param {object} game Spiel. @param {object} entry Aufgabe. */
function drawQuestPage(ctx,game,entry) {
  const lines=questLines(entry),pages=Math.ceil(lines.length/8),page=Math.min(game.questPage,pages-1);
  pixelText(ctx,`HINWEISE ${page+1}/${pages}`,20,34,PALETTE[2]);
  for (let i=0;i<8 && lines[page*8+i]!==undefined;i++) pixelText(ctx,lines[page*8+i],20,45+i*8,PALETTE[3]);
  pixelText(ctx,game.flags.questPinned===entry.id?'* AUF KARTE ANGEHEFTET':'PFEILE: BLÄTTERN',80,113,PALETTE[2],1,true);
  pixelText(ctx,game.flags.questPinned===entry.id?'A: LÖSEN  B: LISTE':'A: ANHEFTEN  B: LISTE',80,126,PALETTE[3],1,true);
}

/** Kürzt lange Listentitel sichtbar, während die Detailseite den vollständigen Titel behält. @param {string} title Titel. */
function questTitle(title) {
  if (pixelTextWidth(title)<=112) return title;
  while (title.length && pixelTextWidth(`${title}…`)>112) title=title.slice(0,-1);
  return `${title.trimEnd()}…`;
}
