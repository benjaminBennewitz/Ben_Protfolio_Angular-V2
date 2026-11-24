/**
 * @file Bodenebene unter Ronnie mit perspektivischer Textur und Kontaktpunkten.
 * @description Schneidet Blickstrahlen mit einer waagerechten Ebene in Weltkoordinaten.
 * @author Benjamin Bennewitz
 */
import { projectGroundPoint, STANDING_HEIGHT } from './head-camera.js';
const ground = new Image();
ground.decoding = 'async';
let ready = null;
let pattern = null;
let patternContext = null;
let floorCache = null;
let floorKey = '';
const TILE_METERS = 2.8;
const clamp = value => Math.max(0,Math.min(1,value));

/** Lädt die lokale Bodentextur beim Öffnen des Portals vor.
 * @returns {Promise<boolean>} Erfolg der einmaligen Dekodierung.
 */
export function prepareGround() {
  if(!ready) {
    ground.src=new URL('../assets/dimension-ground.webp',import.meta.url).href;
    ready=ground.decode().then(()=>true).catch(()=>false);
  }
  return ready;
}

/** Weltposition des Bodens für eine Bildschirmzeile; negative Tiefen sind hinter Ronnie.
 * @param {number} y Bildschirmzeile in CSS-Pixeln.
 * @param {object} camera Brennweite, Höhe und Kopfneigung.
 * @returns {{distance:number,vertical:number,z:number}|null} Schnittpunkt oder Himmel.
 */
function groundRay(y,camera) {
  const ray=(y-camera.height/2)/camera.focal;
  const vertical=Math.sin(camera.pitch)+ray*Math.cos(camera.pitch);
  if(vertical<=.001) return null;
  const distance=camera.eyeHeight/vertical;
  return { distance,vertical,z:camera.forward+distance*(Math.cos(camera.pitch)-ray*Math.sin(camera.pitch)) };
}

/** Zeichnet die durch Kameraneigung sichtbare Bodenfläche in konstanten Weltmaßen.
 * @param {CanvasRenderingContext2D} ctx Zielkontext.
 * @param {object} camera Augenhöhe, Neigung, Brennweite und Vorwärtsposition.
 */
function paintGround(ctx,camera) {
  if(patternContext!==ctx || (!pattern && ground.complete && ground.naturalWidth)) {
    pattern=ground.complete && ground.naturalWidth ? ctx.createPattern(ground,'repeat') : null;
    patternContext=ctx;
  }
  const step=camera.height/Math.min(420,Math.ceil(camera.height/1.7));
  ctx.save();
  for(let y=0;y<camera.height;y+=step) {
    const mid=y+step/2;
    const hit=groundRay(mid,camera);
    if(!hit) continue;
    const opacity=clamp((hit.vertical-.005)/.09);
    ctx.globalAlpha=opacity;
    ctx.fillStyle='#20241f';ctx.fillRect(0,y,camera.width,step+.3);
    if(!pattern?.setTransform || hit.distance>65) continue;
    const after=groundRay(mid+.5,camera),before=groundRay(mid-.5,camera);
    if(!after || !before) continue;
    const derivative=(after.z-before.z)/TILE_METERS*ground.naturalHeight;
    if(Math.abs(derivative)<.00001) continue;
    const sx=TILE_METERS*camera.focal/(hit.distance*ground.naturalWidth);
    const sy=1/derivative;
    const v=hit.z/TILE_METERS*ground.naturalHeight;
    pattern.setTransform({a:sx,b:0,c:0,d:sy,e:camera.width/2,f:mid-v*sy});
    ctx.globalAlpha=opacity*Math.exp(-hit.distance*.035)*.83;
    ctx.fillStyle=pattern;ctx.fillRect(0,y,camera.width,step+.3);
  }
  ctx.restore();
}

/** Statische Standphasen benötigen nur eine Kopie des bereits projizierten Bodens.
 * @param {CanvasRenderingContext2D} ctx Zielkontext.
 * @param {object} camera Gemeinsame Kamera in Weltmaßen.
 */
export function drawGround(ctx,camera) {
  const key=[camera.width,camera.height,camera.pitch.toFixed(6),camera.eyeHeight.toFixed(5),camera.forward.toFixed(5),ground.naturalWidth].join('/');
  floorCache ??= document.createElement('canvas');
  if(key!==floorKey) {
    const w=Math.ceil(camera.width),h=Math.ceil(camera.height);
    if(floorCache.width!==w || floorCache.height!==h) { floorCache.width=w;floorCache.height=h; }
    const target=floorCache.getContext('2d');
    if(!target) return;
    target.clearRect(0,0,w,h);paintGround(target,camera);floorKey=key;
  }
  ctx.drawImage(floorCache,0,0,camera.width,camera.height);
}

/** Weiche Bodenkontakte bleiben unten zurück, wenn sich Ronnies Augenhöhe erhöht.
 * @param {CanvasRenderingContext2D} ctx Zielkontext.
 * @param {object} camera Aktuelle Weltkamera.
 * @param {Array<{x:number,z:number}>} contacts Standpunkte der beiden Stiefel.
 */
export function drawGroundContacts(ctx,camera,contacts) {
  ctx.save();ctx.fillStyle='#030603';ctx.filter='blur(3px)';
  ctx.globalAlpha=.42*Math.exp(-(camera.eyeHeight-STANDING_HEIGHT)*.22);
  for(const contact of contacts) {
    ctx.beginPath();let started=false;
    for(let i=0;i<=24;i++) {
      const angle=i/24*Math.PI*2;
      const point=projectGroundPoint(contact.x+Math.cos(angle)*.12,contact.z+Math.sin(angle)*.23,camera);
      if(!point) continue;
      if(!started){ctx.moveTo(point.x,point.y);started=true;}else ctx.lineTo(point.x,point.y);
    }
    ctx.closePath();ctx.fill();
  }
  ctx.restore();
}
