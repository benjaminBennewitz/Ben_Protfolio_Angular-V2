/**
 * @file Gemeinsame Tiefenkulisse für Portal und begehbaren Dimensionsabschluss.
 * @description Getrennte Bildlagen und deterministische Phasen bewegen Menschen
 * und organische Schläuche auf der vorhandenen pausierbaren Spieluhr.
 * @author Benjamin Bennewitz
 */

const backdrop = new Image();
const people = new Image();
backdrop.decoding = people.decoding = 'async';
let ready = null;
let swirlTexture = null;

/** Weicher Übergang für die Verjüngung unmittelbar am gezeichneten Ansatz. */
const ease01 = value => { const t=Math.max(0,Math.min(1,value)); return t*t*(3-2*t); };

/** Lädt die beiden lokalen Ebenen erst mit dem Dimensionsfinale. */
export function prepareDimension() {
  if (ready) return ready;
  backdrop.src = new URL('../assets/dimension-landscape.webp', import.meta.url).href;
  people.src = new URL('../assets/dimension-people.webp', import.meta.url).href;
  ready = Promise.all([backdrop.decode(), people.decode()]).then(() => { swirlTexture = createSwirlTexture(); return true; }).catch(() => false);
  return ready;
}

/** Hintergrundmenschen zuerst; Größen bleiben auch am Einstieg auf Abstand. */
const FIGURES = Object.freeze([
  { x: .18, y: .54, h: .055, sprite: 0, phase: 1.7, speed: .34 },
  { x: .77, y: .33, h: .065, sprite: 2, facing: -1, phase: 4.4, speed: .29 },
  { x: .61, y: .63, h: .052, sprite: 1, phase: 5.5, speed: .41 },
  { x: .32, y: .64, h: .073, sprite: 3, facing: -1, phase: 2.9, speed: .32 },
  { x: .44, y: .47, h: .071, sprite: 0, phase: 6.1, speed: .46 },
  { x: .26, y: .41, h: .13, sprite: 1, facing: -1, phase: .8, speed: .38 },
  { x: .71, y: .54, h: .12, sprite: 2, phase: 3.8, speed: .43 },
  { x: .57, y: .49, h: .165, sprite: 3, phase: 2.1, speed: .31 },
  { x: .41, y: .57, h: .145, sprite: 0, facing: -1, phase: 4.9, speed: .37 },
]);

/** Endpunkte innerhalb der gezeichneten Nabelansätze; die Figuren überdecken die Schnurenden. */
const CORD_JOINTS = Object.freeze([
  { x: 0.791897, y: 0.251381 },
  { x: 0.786372, y: 0.241713 },
  { x: 0.779006, y: 0.267956 },
  { x: 0.780847, y: 0.238950 }
]);

/** Verdrillt ausschließlich den Wolkenausschnitt einmalig zu einer weich auslaufenden Textur. */
function createSwirlTexture() {
  const sample = document.createElement('canvas');
  sample.width=1024; sample.height=576;
  const source=sample.getContext('2d');
  if (!source) return null;
  source.drawImage(backdrop,0,0,1024,576);
  const image=source.getImageData(0,0,1024,576).data;
  const texture=document.createElement('canvas');
  texture.width=texture.height=768;
  const ctx=texture.getContext('2d');
  if (!ctx) return null;
  const out=ctx.createImageData(768,768);
  for (let y=0;y<768;y++) for (let x=0;x<768;x++) {
    const dx=(x-384)/384; const dy=(y-384)/384;
    const radius=Math.hypot(dx,dy);
    if(radius>=1) continue;
    const angle=Math.atan2(dy,dx)+2.7*(1-radius)**2;
    const sx=Math.max(0,Math.min(1022,520+Math.cos(angle)*radius*270));
    const sy=Math.max(0,Math.min(574,180+Math.sin(angle)*radius*170));
    const ix=Math.floor(sx); const iy=Math.floor(sy); const fx=sx-ix; const fy=sy-iy;
    const at=(y*768+x)*4;
    for(let c=0;c<3;c++) {
      const row=(iy*1024+ix)*4+c;
      const upper=image[row]*(1-fx)+image[row+4]*fx;
      const lower=image[row+4096]*(1-fx)+image[row+4100]*fx;
      out.data[at+c]=upper*(1-fy)+lower*fy;
    }
    out.data[at+3]=Math.round(Math.min(1,(1-radius)*3)*190);
  }
  ctx.putImageData(out,0,0);
  return texture;
}

/** Langsame Wetterimpulse auf der pausierbaren Spieluhr, ohne eigene Timer. */
const WEATHER_EVENTS = Object.freeze([
    { at: 4.5, x: 1160, y: 290, bolt: true },
    { at: 11.5, x: 500, y: 230, bolt: false },
    { at: 18.3, x: 1300, y: 350, bolt: true },
    { at: 27.2, x: 780, y: 200, bolt: true },
    { at: 36.4, x: 390, y: 350, bolt: true },
]);

/** Langsam drehende Wolken und vereinzeltes oranges Wetterleuchten bleiben auf den Himmel begrenzt. */
function drawSky(ctx,time) {
  if (swirlTexture) {
    ctx.save();
    ctx.translate(895,155);
    // Erst die Wolken drehen, dann die gesamte Ebene perspektivisch abflachen.
    ctx.scale(1,.30);
    ctx.rotate(time*.024);
    ctx.globalAlpha=.66;
    ctx.drawImage(swirlTexture,-560,-560,1120,1120);
    ctx.restore();
  }
  for (const event of WEATHER_EVENTS) {
    const age=time-event.at;
    const pulse=Math.exp(-((age/1.5)**2))*.6;
    if (pulse<.002) continue;
    ctx.save();
    ctx.globalCompositeOperation='screen';
    const light=ctx.createRadialGradient(event.x,event.y,12,event.x,event.y,330);
    light.addColorStop(0,`rgba(255,132,38,${pulse})`);
    light.addColorStop(.48,`rgba(220,69,16,${pulse*.7})`);
    light.addColorStop(1,'rgba(110,30,10,0)');
    ctx.fillStyle=light;
    ctx.fillRect(event.x-330,Math.max(0,event.y-330),660,660);
    // Schmale Fernblitze glimmen einzeln aus; kein schneller Wechsel des gesamten Bildes.
    if (event.bolt && age>=0 && age<1.1) {
      const strength=Math.sin(Math.PI*age/1.1)*.85;
      const points=[];
      for(let i=0;i<10;i++) points.push({
        x:event.x-i*2+Math.sin(i*8.13+event.x)*12,
        y:event.y+i*15,
      });
      ctx.lineJoin='round';
      for (const [width,alpha] of [[7,strength*.13],[1.4,strength]]) {
        ctx.lineWidth=width;
        ctx.strokeStyle=`rgba(255,184,105,${alpha})`;
        ctx.beginPath();
        points.forEach((point,index)=>index ? ctx.lineTo(point.x,point.y) : ctx.moveTo(point.x,point.y));
        ctx.stroke();
      }
      ctx.lineWidth=.8;
      ctx.strokeStyle=`rgba(255,176,92,${strength*.55})`;
      ctx.beginPath();ctx.moveTo(points[4].x,points[4].y);
      ctx.lineTo(points[4].x+23,points[4].y+12);
      ctx.lineTo(points[4].x+36,points[4].y+41);ctx.stroke();
    }
    ctx.restore();
  }
}

/** Gegeneinander laufende Biegungen formen Tentakel; die beiden Anschlüsse bleiben ortsfest. */
function tubePoint(a, b, t, figure, time) {
  const q = 1-t;
  const phase = figure.phase;
  const facing = figure.facing ?? 1;
  const span = b.y-a.y;
  const envelope = Math.sin(Math.PI*t)**1.35;
  const bend = Math.sin(t*Math.PI*2.6+phase+time*.17)*span*.13
    + Math.sin(t*Math.PI*5.2+phase*.7-time*.12)*span*.035;
  return {
    x: q*q*q*a.x+3*q*q*t*(a.x-28*Math.sin(phase))
      +3*q*t*t*(b.x+(55+12*Math.sin(phase))*facing)+t*t*t*b.x+envelope*bend,
    y: a.y+span*t+Math.sin(t*Math.PI*3+phase-time*.11)*span*.025*envelope,
  };
}

/** Wandernde örtliche Ausbeulungen verändern die Schlauchkontur statt ihre Helligkeit. */
function drawTube(ctx, anchor, attachment, time, figure) {
  ctx.save();
  const segments = 88;
  const flow = ((time*(.075 + figure.speed*.07) + figure.phase*.19) % 1.4) - .2;
  const radius = Math.max(1.1, figure.h*25);
  const points = [];
  const left = [];
  const right = [];
  for (let i = 0; i <= segments; i++) {
    const t = i/segments;
    const point = tubePoint(anchor, attachment, t, figure, time);
    const next = tubePoint(anchor, attachment, Math.min(1, t+.002), figure, time);
    const previous = tubePoint(anchor, attachment, Math.max(0, t-.002), figure, time);
    const dx = next.x-previous.x;
    const dy = next.y-previous.y;
    const length = Math.hypot(dx,dy) || 1;
    const bulge = Math.exp(-(((t-(1-flow))/.055)**2))*radius*1.65;
    const endTaper = 1-.67*ease01((t-.91)/.09);
    const width = (radius*(.78+.22*Math.sin(t*45+figure.phase)**2) + bulge)*endTaper;
    const nx = -dy/length;
    const ny = dx/length;
    points.push(point);
    left.push({ x: point.x+nx*width, y: point.y+ny*width });
    right.push({ x: point.x-nx*width, y: point.y-ny*width });
  }
  ctx.beginPath();
  [...left, ...right.slice().reverse()].forEach((p, i) => i ? ctx.lineTo(p.x,p.y) : ctx.moveTo(p.x,p.y));
  ctx.closePath();
  const skin = ctx.createLinearGradient(anchor.x,anchor.y,attachment.x,attachment.y);
  skin.addColorStop(0,'#19171300');
  skin.addColorStop(.16,'#191713');
  skin.addColorStop(1,'#191713');
  ctx.fillStyle = skin;
  ctx.fill();
  const rim = ctx.createLinearGradient(anchor.x,anchor.y,attachment.x,attachment.y);
  rim.addColorStop(0,'#7b614000');
  rim.addColorStop(.18,'#554a32');
  rim.addColorStop(1,'#786345');
  ctx.strokeStyle = rim;
  ctx.lineWidth = .8;
  ctx.stroke();
  // Unregelmäßige schräge Falten brechen die glatte Schlauchoberfläche.
  ctx.strokeStyle = '#51453088';
  ctx.lineWidth = Math.max(.4,radius*.16);
  for (let i=16;i<segments-3;i+=3) {
    ctx.beginPath();
    ctx.moveTo(left[i].x,left[i].y);
    ctx.quadraticCurveTo(points[i+1].x,points[i+1].y,right[i+2].x,right[i+2].y);
    ctx.stroke();
  }
  ctx.beginPath();
  points.forEach((p,i) => i ? ctx.lineTo(p.x-radius*.3,p.y) : ctx.moveTo(p.x-radius*.3,p.y));
  ctx.strokeStyle = rim;
  ctx.lineWidth = Math.max(.5,radius*.22);
  ctx.globalAlpha *= .55;
  ctx.stroke();
  ctx.restore();
}

/** Zeichnet dieselbe Welt in beiden Ansichten ohne eigene Timer oder DOM-Animationen.
 * @param {CanvasRenderingContext2D} ctx Zeichenfläche des aufrufenden Renderers.
 * @param {number} width Breite in logischen Pixeln.
 * @param {number} height Höhe in logischen Pixeln.
 * @param {number} time Aktive Spielzeit in Sekunden; bei Reduced Motion konstant.
 * @param {{depth?: number, lookX?: number, lookY?: number}} view Begrenzte Kamerabewegung.
 */
export function drawDimension(ctx, width, height, time, view = {}) {
  prepareDimension();
  if (!backdrop.complete || !backdrop.naturalWidth) return;
  const depth = view.depth ?? 0;
  const lookX = view.lookX ?? 0;
  const lookY = view.lookY ?? 0;
  const scale = Math.max(width/1672,height/941)*(1.04+depth*.12);
  ctx.save();
  ctx.translate(width/2-lookX*width*.035,height/2-lookY*height*.025);
  ctx.scale(scale,scale);
  ctx.translate(-836,-470.5);
  ctx.drawImage(backdrop,0,0,1672,941);
  ctx.fillStyle='#0306093b';
  ctx.fillRect(0,0,1672,941);
  drawSky(ctx,time);
  if (people.complete && people.naturalWidth) {
    const cellWidth = people.naturalWidth/4;
    for (const f of FIGURES) {
      const near = f.h/.165;
      const x = f.x*1672+Math.sin(time*f.speed+f.phase)*5*near-lookX*near*12;
      const y = f.y*941+Math.sin(time*f.speed*.79+f.phase*1.6)*7*near;
      const h = f.h*941*(1+depth*near*.18);
      const w = h*cellWidth/people.naturalHeight;
      const facing = f.facing ?? 1;
      const tilt = -.04+Math.sin(f.phase)*.04+Math.sin(time*f.speed*.6+f.phase)*.045;
      const joint = CORD_JOINTS[f.sprite];
      const localX = facing*w*(joint.x-.5);
      const localY = h*(joint.y-.35);
      const attachment = {
        x: x+localX*Math.cos(tilt)-localY*Math.sin(tilt),
        y: y+localX*Math.sin(tilt)+localY*Math.cos(tilt),
      };
      ctx.save();
      ctx.globalAlpha = .42+near*.5;
      drawTube(ctx,{x:f.x*1672+(65+Math.sin(f.phase)*20)*facing,y:55},attachment,time,f);
      // Der integrierte Nabelansatz liegt vor der beweglichen Schnur, nicht daneben.
      ctx.translate(x,y);
      ctx.rotate(tilt);
      ctx.scale(facing,1);
      ctx.drawImage(people,f.sprite*cellWidth,0,cellWidth,people.naturalHeight,-w/2,-h*.35,w,h);
      ctx.restore();
    }
  }
  const vignette=ctx.createRadialGradient(850,385,160,836,470,950);
  vignette.addColorStop(0,'#02050700');
  vignette.addColorStop(.48,'#02050714');
  vignette.addColorStop(.78,'#02050780');
  vignette.addColorStop(1,'#020507ed');
  ctx.fillStyle=vignette;
  ctx.fillRect(0,0,1672,941);
  ctx.restore();
}
