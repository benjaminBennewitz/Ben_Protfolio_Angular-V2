/**
 * @file Gemeinsame Kopfkamera für Umgebung und den unter ihr liegenden eigenen Körper.
 * @description Perspektivische Rotation um die horizontale Kameraachse, ohne Bildüberblendung.
 * @author Benjamin Bennewitz
 */

/** Referenzwinkel, aus dem die vorhandene Ego-Körpergrafik aufgenommen wurde. */
export const BODY_PITCH = 65*Math.PI/180;

/** Ein gemeinsamer Blickwinkel ersetzt unabhängiges Verschieben und Zoomen der Ebenen.
 * @param {object} frame Zustand der pausierbaren Finishersequenz.
 * @param {number} width Viewportbreite in CSS-Pixeln.
 * @param {number} height Viewporthöhe in CSS-Pixeln.
 * @param {boolean} reduced Wechselt bei reduzierter Bewegung zwischen festen Blicklagen.
 * @returns {{pitch:number, focal:number, width:number, height:number, worldY:number, worldScale:number}} Projektionskamera.
 */
export function getHeadCamera(frame,width,height,reduced=false) {
  const pitch=reduced ? (frame.look >= .5 ? BODY_PITCH : frame.up >= .5 ? -.2 : 0)
    : BODY_PITCH*frame.look-.2*frame.up;
  return { pitch, focal: height*.9, width, height,
    worldY: reduced ? 0 : height*(-frame.look*.45+frame.up*.24+frame.lift*.26),
    worldScale: reduced ? 1 : 1+frame.look*1.2+frame.up*.75+frame.lift*.35,
  };
}

/** Projiziert einen ortsfesten Bildpunkt aus seinem Referenzblick in die Kopfkamera.
 * @param {number} x Referenzposition horizontal.
 * @param {number} y Referenzposition vertikal.
 * @param {object} camera Aktuelle Projektionskamera.
 * @param {number} referencePitch Blickwinkel der Referenzebene.
 * @returns {{x:number,y:number}|null} Bildpunkt oder null hinter der Kamera.
 */
export function projectHeadPoint(x,y,camera,referencePitch=0) {
  const delta=camera.pitch-referencePitch;
  const vertical=(y-camera.height/2)/camera.focal;
  const depth=vertical*Math.sin(delta)+Math.cos(delta);
  if (depth <= .04) return null;
  return {
    x: camera.width/2+(x-camera.width/2)/depth,
    y: camera.height/2+camera.focal*(vertical*Math.cos(delta)-Math.sin(delta))/depth,
  };
}

/** Neigt eine Bildfläche durch perspektivische Zeilenabtastung; ihre Deckkraft bleibt konstant.
 * @param {CanvasRenderingContext2D} ctx Zielkontext in CSS-Pixeln.
 * @param {CanvasImageSource} image Ortsfeste Textur.
 * @param {{left:number,top:number,width:number,height:number}} rect Referenzlage der Textur.
 * @param {object} camera Gemeinsame Kopfkamera.
 * @param {number} referencePitch Aufnahmewinkel dieser Textur.
 */
export function drawHeadLayer(ctx,image,rect,camera,referencePitch=0) {
  const delta=camera.pitch-referencePitch;
  if (Math.abs(delta)<.0001) { ctx.drawImage(image,rect.left,rect.top,rect.width,rect.height); return; }
  const sourceWidth=image.naturalWidth || image.width;
  const sourceHeight=image.naturalHeight || image.height;
  const cosine=Math.cos(delta),sine=Math.sin(delta);
  const step=camera.height/Math.min(240,Math.ceil(camera.height/2));
  for(let y=0;y<camera.height;y+=step) {
    const bottom=Math.min(camera.height,y+step);
    const sample=position => {
      const ray=(position-camera.height/2)/camera.focal;
      const depth=cosine-ray*sine;
      return { depth, referenceY: camera.height/2+camera.focal*(ray*cosine+sine)/depth };
    };
    const a=sample(y),b=sample(bottom),middle=sample((y+bottom)/2);
    if (a.depth<=.04 || b.depth<=.04) continue;
    const start=Math.max(rect.top,a.referenceY),end=Math.min(rect.top+rect.height,b.referenceY);
    if (end<=start) continue;
    const sourceY=(start-rect.top)/rect.height*sourceHeight;
    const sourceH=Math.min(sourceHeight-sourceY,(end-start)/rect.height*sourceHeight);
    const top=projectHeadPoint(camera.width/2,start,camera,referencePitch)?.y;
    const last=projectHeadPoint(camera.width/2,end,camera,referencePitch)?.y;
    if (top===undefined || last===undefined || last<=top) continue;
    const left=camera.width/2+(rect.left-camera.width/2)*middle.depth;
    const width=rect.width*middle.depth;
    ctx.drawImage(image,0,sourceY,sourceWidth,sourceH,left,top,width,last-top+.25);
  }
}

/** Führt die bestehende Tiefenkulisse mit demselben Kopfzustand weiter.
 * @param {CanvasRenderingContext2D} ctx Umgebungskontext.
 * @param {object} camera Gemeinsame Kamera mit Kopfneigung und Aufwärtsbewegung.
 */
export function applyHeadCamera(ctx,camera) {
  ctx.translate(0,camera.worldY);
  ctx.translate(camera.width/2,camera.height/2);
  ctx.scale(camera.worldScale,camera.worldScale);
  ctx.translate(-camera.width/2,-camera.height/2);
}
