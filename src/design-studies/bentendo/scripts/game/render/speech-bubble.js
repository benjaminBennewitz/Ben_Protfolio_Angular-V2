import { rect } from './primitives.js';
import { pixelText,pixelTextWidth } from '../../display/font.js';
import { clamp } from '../../core/dom.js';
import { PALETTE } from '../../core/config.js';

/** Berechnet eine am Sprecher verankerte Blase innerhalb des LCD und oberhalb der Bedienhinweise. @param {object} speaker Sprecherfigur. @param {object} camera Kamera-Versatz. @param {number} width Blasenbreite. */
export function bubblePosition(speaker,camera,width) {
  const headX=(speaker.drawX ?? speaker.x)*16+8-camera.x,headY=(speaker.drawY ?? speaker.y)*16-4-camera.y;
  if (headX<0 || headX>160 || headY<-12 || headY>124) return null;
  const below=headY-30<2,x=Math.round(clamp(headX-width/2,2,158-width));
  const y=Math.round(clamp(below?headY+24:headY-30,6,100));
  return {x,y,width,height:24,below,tailX:Math.round(clamp(headX,x+6,x+width-7))};
}

/** Lässt nach einer Lesepause die nächsten Zeilen langsam in das Zweizeilenfenster laufen. @param {object} speech Aktueller Spruch. @param {boolean} reduced Reduzierte Bewegung. */
export function speechScroll(speech,reduced) {
  const elapsed=speech.duration-speech.remaining,max=Math.max(0,speech.lines.length-2);
  const progress=clamp((elapsed-2)/2.4,0,max);
  return reduced?Math.floor(progress):progress;
}

/** Zeichnet die Sprechblase nach der Welt, aber außerhalb modaler Dialoge und Ortsmeldungen. @param {object} render Zeicheninformationen. @param {object} camera Kamera-Versatz. */
export function drawSpeechBubble(render,camera) {
  const {ctx,game}=render,speech=game.ambientSpeech;
  if (!speech) return;
  const speaker=game.objects.find(sameSpeaker.bind(null,speech.speakerId));
  if (!speaker) return;
  let width=64;
  for (const line of speech.lines) width=Math.max(width,pixelTextWidth(line)+8);
  const box=bubblePosition(speaker,camera,Math.min(152,width));
  if (!box) return;
  drawBubbleFrame(ctx,box);
  ctx.save(); ctx.beginPath(); ctx.rect(box.x+4,box.y+4,box.width-8,16); ctx.clip();
  const scroll=speechScroll(speech,game.reduced),first=Math.floor(scroll);
  for (let i=first;i<Math.min(speech.lines.length,first+2);i++) pixelText(ctx,speech.lines[i],box.x+4,box.y+4+Math.round((i-scroll)*8),PALETTE[3]);
  ctx.restore();
}

/** Vergleicht den tatsächlichen Sprecher unabhängig von seinem Anzeigenamen. @param {string} id Sprecherkennung. @param {object} actor Figur. */
function sameSpeaker(id,actor) { return actor.id===id; }

/** Zeichnet einen kleinen pixeligen Rahmen mit einem zur Figur gerichteten Zipfel. @param {CanvasRenderingContext2D} ctx Kontext. @param {object} box Blasenposition. */
function drawBubbleFrame(ctx,box) {
  const {x,y,width:w,height:h,tailX,below}=box;
  rect(ctx,3,x+1,y,w-2,h); rect(ctx,3,x,y+1,w,h-2); rect(ctx,0,x+1,y+1,w-2,h-2);
  const edge=below?y:y+h-1,dir=below?-1:1;
  rect(ctx,3,tailX-2,edge+dir,5,1); rect(ctx,3,tailX-1,edge+dir*2,3,1); rect(ctx,3,tailX,edge+dir*3,1,1);
  rect(ctx,0,tailX-1,edge,3,1); rect(ctx,0,tailX,edge+dir,1,1);
}
