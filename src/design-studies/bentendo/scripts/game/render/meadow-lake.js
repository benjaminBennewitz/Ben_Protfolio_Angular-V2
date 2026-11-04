import { canvas } from '../../core/dom.js';

const layersByRoom=new WeakMap();
const RADIUS=18;

/** Zeichnet die gesamte Seefläche mit bewegter Textur unter einer festen Ufermaske. @param {object} render Zeicheninformationen. */
export function drawMeadowLake(render) {
  const {ctx,game,assets}=render,room=game.room;
  if (!layersByRoom.has(room)) layersByRoom.set(room,buildLakeLayers(room));
  const layers=layersByRoom.get(room);
  const shift=game.reduced?0:Math.floor(game.time*5)%16;
  if (shift!==layers.shift) moveLakeTexture(layers,assets.meadow.water,shift);
  ctx.drawImage(layers.sand,0,0); ctx.drawImage(layers.water,0,0);
}

/** Aktualisiert die Wasserfläche nur beim Wechsel des Pixelversatzes. @param {object} layers Zwischengespeicherte Ebenen. @param {HTMLCanvasElement} tile Wassertextur. @param {number} shift Pixelversatz. */
function moveLakeTexture(layers,tile,shift) {
  const {mask,water}=layers,surface=water.getContext('2d');
  layers.pattern ||= surface.createPattern(tile,'repeat');
  surface.globalCompositeOperation='source-over';
  surface.save(); surface.translate(-shift,0);
  surface.fillStyle=layers.pattern;
  surface.fillRect(shift,0,water.width,water.height); surface.restore();
  surface.globalCompositeOperation='destination-in';
  surface.drawImage(mask,0,0);
  layers.shift=shift;
}

/** Erzeugt feste Pixelmasken für Wasser und breiten Sand aus derselben gerundeten Kontur. @param {object} room Raum. */
function buildLakeLayers(room) {
  const w=room.width*16,h=room.height*16,stride=w+1;
  const sum=new Uint32Array(stride*(h+1));
  for (let y=0;y<h;y++) for (let x=0,row=0;x<w;x++) {
    row+=Number(room.ground[y>>4][x>>4]==='l');
    sum[(y+1)*stride+x+1]=sum[y*stride+x+1]+row;
  }
  const mask=canvas(w,h),sand=canvas(w,h),water=canvas(w,h);
  const mc=mask.getContext('2d'),sc=sand.getContext('2d');
  const m=mc.createImageData(w,h),s=sc.createImageData(w,h);
  for (let y=0;y<h;y++) for (let x=0;x<w;x++) {
    const kind=room.ground[y>>4][x>>4];
    if (kind==='s' || kind==='r' && lakeCliffPixel(room,x>>4,y>>4,x%16,y%16)) continue;
    const coverage=lakeCoverage(sum,w,h,x,y);
    writeLakePixel(m.data,s.data,(y*w+x)*4,kind==='r'?Math.min(coverage,0.42):coverage,x,y);
  }
  mc.putImageData(m,0,0); sc.putImageData(s,0,0);
  return {sand,mask,water};
}

/** Rundet Rasterecken über die Wasserbelegung der benachbarten Pixel ab. @param {Uint32Array} sum Summenbild. @param {number} w Breite. @param {number} h Höhe. @param {number} x Spalte. @param {number} y Zeile. */
function lakeCoverage(sum,w,h,x,y) {
  const x0=Math.max(0,x-RADIUS),x1=Math.min(w,x+RADIUS+1);
  const y0=Math.max(0,y-RADIUS),y1=Math.min(h,y+RADIUS+1),stride=w+1;
  return (sum[y1*stride+x1]-sum[y1*stride+x0]-sum[y0*stride+x1]+sum[y0*stride+x0])/((x1-x0)*(y1-y0));
}

/** Setzt Wasser, dunkle Nasskante und auslaufende Sandkörnung im LCD-Stil. @param {Uint8ClampedArray} mask Wassermaske. @param {Uint8ClampedArray} sand Ufermaske. @param {number} i Pixelindex. @param {number} coverage Wasseranteil. @param {number} x Spalte. @param {number} y Zeile. */
function writeLakePixel(mask,sand,i,coverage,x,y) {
  if (coverage>=0.49) { mask[i+3]=255; return; }
  const grain=(x*37+y*53+x*y*11)%17;
  if (coverage<0.08 || (coverage<0.16 && grain>=5)) return;
  const tone=coverage>=0.43?[76,98,59]:grain<3?[142,159,88]:[206,211,153];
  sand.set([...tone,255],i);
}


/** Hält die abgestufte Ostfelswand innerhalb ihrer Kacheln und lässt davor Ufersand frei. @param {object} room Raum. @param {number} x Kachelspalte. @param {number} y Kachelzeile. @param {number} px Pixelspalte. @param {number} py Pixelzeile. */
export function lakeCliffPixel(room,x,y,px,py) {
  if (x<30 || y<=2) return true;
  const left=room.ground[y][x-1]!=='r',bottom=room.ground[y+1]?.[x]!=='r';
  const foot=bottom?(left && px<6?11:13):16;
  return py<foot && (!left || px>=(py<4?2:py<10?3:4));
}
