/**
 * @file Ronnies Ego-Abschluss mit Blickwechsel, Nabelkontakt und aufwärts gerichtetem Sog.
 * @description Gemeinsame Storyzeit für Blinzeln, Kopfbewegung und texturierte Schnur.
 * @author Benjamin Bennewitz
 */

/* Lokale Vordergrundebenen werden einmalig beim Beginn des Portalfinales dekodiert. */
import { BODY_PITCH, getHeadCamera, projectHeadPoint, drawHeadLayer } from './head-camera.js';

const body = new Image();
const cord = new Image();
for (const image of [body, cord]) image.decoding = 'async';
let ready = null;
const clamp = value => Math.max(0, Math.min(1, value));
const ease = value => { const t = clamp(value); return t*t*(3-2*t); };

/** Zentrale Zeitmarken ohne unabhängige Timer oder Audiouhr. */
export const FINISHER = Object.freeze({ impactAt: 1200, contactAt: 3400, lookUpAt: 5600, liftAt: 6500, closeAt: 14200, duration: 16000 });

/** Schneller Lidschluss und ruhigeres Öffnen als kurze vollständige Dunkelblende.
 * @param {number} elapsedMs Aktive Zeit in Millisekunden.
 * @param {Array<Array<number>>} windows Unregelmäßig verteilte Zeit-/Dauerpaare.
 * @returns {number} Deckkraft von 0 bis 1.
 */
function blinkOpacity(elapsedMs, windows) {
  for (const [at, duration] of windows) {
    const t = (elapsedMs-at)/duration;
    if (t >= 0 && t < 1) {
      if (t < .28) return ease(t/.28);
      if (t < .46) return 1;
      return 1-ease((t-.46)/.54);
    }
  }
  return 0;
}

/** Blinzeln begleitet bereits das Betreten und Erkunden der Dimension.
 * @param {number} elapsedMs Aktive Zeit seit dem Dimensionseintritt.
 * @param {boolean} reduced Unterdrückt wiederholte Dunkelimpulse.
 * @returns {number} Deckkraft der neutralen Schwarzblende.
 */
export function getDimensionBlink(elapsedMs, reduced = false) {
  return reduced ? 0 : blinkOpacity(elapsedMs, [[1900,240], [6300,220], [13900,270], [23700,250], [34100,320], [40600,360]]);
}

/** Lädt das Körperbild mit integriertem Hautansatz und die dunkle Schnuroberfläche vor.
 * @returns {Promise<boolean>} Erfolg aller benötigten Bilddekodierungen.
 */
export function prepareFinisher() {
  if (!ready) {
    body.src = new URL('../assets/ending-first-person.webp', import.meta.url).href;
    cord.src = new URL('../assets/ending-cord-skin.webp', import.meta.url).href;
    ready = Promise.all([body.decode(), cord.decode()]).then(() => {
      return true;
    }).catch(() => false);
  }
  return ready;
}

/** Blick senkt sich zunächst zum Bauch und richtet sich nach dem Andocken wieder auf.
 * @param {number} elapsedMs Aktive Zeit seit dem Finisherbeginn.
 * @param {boolean} reduced Unterdrückt Blinzeln und Kamerazucken.
 * @returns {{blink:number, look:number, up:number, focus:number, reach:number, lift:number, black:number, impact:boolean, attached:boolean, done:boolean}}
 */
export function getFinisherFrame(elapsedMs, reduced = false) {
  const up = ease((elapsedMs-FINISHER.lookUpAt)/2500);
  return {
    blink: reduced ? 0 : blinkOpacity(elapsedMs, [[1230,260], [13400,420]]),
    look: ease((elapsedMs-1400)/1800)*(1-up),
    up,
    focus: ease((elapsedMs-1400)/1800),
    reach: ease((elapsedMs-1500)/1900),
    lift: ease((elapsedMs-FINISHER.liftAt)/6600),
    black: ease((elapsedMs-FINISHER.closeAt)/1800),
    impact: elapsedMs >= FINISHER.impactAt,
    attached: elapsedMs >= FINISHER.contactAt,
    done: elapsedMs >= FINISHER.duration,
  };
}

/** Die Kurve führt aus der Höhe hinter der Hüfte herum bis zum Ansatz am Bauch. */
function cordPoint(t, joint, width, height, frame, time) {
  const q = 1-t;
  const upperX = width*(.67-.1*frame.up);
  const bendX = width*(1.12-.38*frame.up);
  const lowerX = joint.x+width*(.11-.07*frame.up);
  const upperY = -height*.23;
  const lowerY = joint.y-height*(.17+.15*frame.up);
  const wave = Math.sin(t*Math.PI)*Math.sin(time*.8+t*7)*height*.013*(1-frame.lift*.6);
  return {
    x: q*q*q*upperX+3*q*q*t*bendX+3*q*t*t*lowerX+t*t*t*joint.x+wave,
    y: q*q*q*upperY+3*q*q*t*height*.13+3*q*t*t*lowerY+t*t*t*joint.y,
  };
}

/** Texturbänder folgen der Kurve; örtliche Verdickungen wandern vom Bauch nach oben.
 * @param {CanvasRenderingContext2D} ctx Vordergrundkontext.
 * @param {{x:number,y:number}} joint Anschluss an der Bildwurzel.
 * @param {number} width Viewportbreite.
 * @param {number} height Viewporthöhe.
 * @param {object} frame Abgeleiteter Sequenzzustand.
 * @param {number} time Bewegungszeit in Sekunden.
 * @param {number} start Beginn des sichtbaren Kurvenabschnitts.
 */
function drawCord(ctx, joint, width, height, frame, time, start = 0) {
  if (!cord.complete || !cord.naturalWidth || frame.reach <= 0) return;
  const segments = 92;
  const end = frame.reach;
  const radius = Math.min(width*.045,height*(.0257+.0193*frame.up));
  const flow = 1-(time*.19%1);
  ctx.save();
  for (let i=Math.floor(start*segments);i<segments;i++) {
    const t=i/segments;
    if (t >= end) break;
    const next=Math.min((i+1)/segments,end);
    const p=cordPoint(t,joint,width,height,frame,time);
    const q=cordPoint(next,joint,width,height,frame,time);
    const bulge=frame.attached ? Math.exp(-(((t-flow)/.07)**2))*.5 : 0;
    const diameter=radius*2*(.33+t*.67)*(1+bulge)/.7;
    const length=Math.hypot(q.x-p.x,q.y-p.y);
    ctx.save();
    ctx.translate((p.x+q.x)/2,(p.y+q.y)/2);
    ctx.rotate(Math.atan2(q.y-p.y,q.x-p.x)-Math.PI/2);
    const sourceY=(.03+t*.93)*cord.naturalHeight;
    const sourceHeight=Math.max(1,cord.naturalHeight/segments);
    ctx.drawImage(cord,0,sourceY,cord.naturalWidth,sourceHeight,-diameter/2,-length/2-1,diameter,length+2);
    ctx.restore();
  }
  ctx.restore();
}

/** Passt den gesamten seitlichen Körperumriss ein, auch im Hochformat.
 * Nur der kameranahe Rumpf darf unten natürlich über den Bildrand hinausreichen.
 * @param {number} width Viewportbreite in CSS-Pixeln.
 * @param {number} height Viewporthöhe in CSS-Pixeln.
 * @returns {{left:number, top:number, width:number, height:number}} Eingepasste Bildebene.
 */
function getBodyLayout(width,height) {
  const ratio=body.naturalWidth/body.naturalHeight;
  const h=Math.min(height,width*.94/ratio);
  const w=h*ratio;
  return { left: (width-w)/2, top: height-h, width: w, height: h };
}

/** Blick aus den eigenen Augen: Oberkörper nah im Vordergrund, Beine verkürzt dahinter.
 * Nach dem Aufrichten verschwindet er unter dem Bildrand; die Schnur bleibt vorn sichtbar.
 * @param {CanvasRenderingContext2D} ctx Transparente Ebene über Welt und Nebel.
 * @param {number} width Viewportbreite in CSS-Pixeln.
 * @param {number} height Viewporthöhe in CSS-Pixeln.
 * @param {number} elapsedMs Aktive Finisherzeit.
 * @param {boolean} reduced Reduzierte Bewegung ohne Schwanken.
 * @param {object} camera Gemeinsame Projektionskamera von Umgebung und Körper.
 */
export function drawFinisher(ctx, width, height, elapsedMs, reduced = false, camera = null) {
  ctx.clearRect(0,0,width,height);
  const frame=getFinisherFrame(elapsedMs,reduced);
  if (!body.complete || !body.naturalWidth) return;
  camera ??= getHeadCamera(frame,width,height,reduced);
  const time=reduced ? 0 : elapsedMs/1000;
  const {left,top,width:w,height:h}=getBodyLayout(width,height);
  const projected=projectHeadPoint(left+w*.51,top+h*.72,camera,BODY_PITCH);
  const joint=projected && projected.y<=height*2.4 ? projected : { x: width*.51, y: height*2.4 };
  ctx.save();
  if (!reduced) {
    ctx.translate(width/2,height*.5);
    ctx.rotate(Math.sin(time*1.15)*.006*frame.lift);
    ctx.translate(-width/2,-height*.5);
  }
  drawCord(ctx,joint,width,height,frame,time);
  ctx.filter='brightness(.68) saturate(.65)';
  drawHeadLayer(ctx,body,{left,top,width:w,height:h},camera,BODY_PITCH);
  ctx.filter='none';
  drawCord(ctx,joint,width,height,frame,time,.7);
  ctx.restore();
}
