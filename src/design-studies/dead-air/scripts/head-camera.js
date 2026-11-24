/**
 * @file Gemeinsame Kopfkamera für Umgebung und den unter ihr liegenden eigenen Körper.
 * @description Perspektivische Rotation um die horizontale Kameraachse, ohne Bildüberblendung.
 * @author Benjamin Bennewitz
 */

/** Referenzwinkel, aus dem die vorhandene Ego-Körpergrafik aufgenommen wurde. */
export const BODY_PITCH = 65*Math.PI/180;
/** Die bestehende Kulisse zeigt in der Ausgangsansicht überwiegend Himmel. */
export const FORWARD_PITCH = -Math.atan(.3/.9);
/** Unveränderte Augenhöhe während Stand, Kopfneigung und Andocken. */
export const STANDING_HEIGHT = 1.68;

/** Ein gemeinsamer Blickwinkel ersetzt unabhängiges Verschieben und Zoomen der Ebenen.
 * @param {object} frame Zustand der pausierbaren Finishersequenz.
 * @param {number} width Viewportbreite in CSS-Pixeln.
 * @param {number} height Viewporthöhe in CSS-Pixeln.
 * @param {boolean} reduced Wechselt bei reduzierter Bewegung zwischen festen Blicklagen.
 * @returns {{pitch:number, focal:number, width:number, height:number, forward:number, eyeHeight:number}} Kamera in Metern über dem Boden.
 */
export function getHeadCamera(frame,width,height,reduced=false) {
  const look=reduced ? (frame.look >= .5 ? 1 : 0) : frame.look;
  const attached=Boolean(frame.attached);
  return {
    pitch: FORWARD_PITCH+(BODY_PITCH-FORWARD_PITCH)*look,
    focal: height*.9, width, height, forward: 0,
    eyeHeight: STANDING_HEIGHT+(attached ? frame.lift*4.8 : 0),
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
 * @param {boolean} panorama Die ferne Umgebung umschließt die Kamera horizontal.
 */
export function drawHeadLayer(ctx,image,rect,camera,referencePitch=0,panorama=false) {
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
    const left=panorama ? 0 : camera.width/2+(rect.left-camera.width/2)*middle.depth;
    const width=panorama ? camera.width : rect.width*middle.depth;
    ctx.drawImage(image,0,sourceY,sourceWidth,sourceH,left,top,width,last-top+.25);
  }
}

/** Projiziert einen Punkt der Bodenebene aus der tatsächlichen Augenhöhe.
 * @param {number} x Weltposition seitlich in Metern.
 * @param {number} z Weltposition vor Ronnie in Metern.
 * @param {object} camera Blickwinkel, Brennweite, Position und Höhe.
 * @returns {{x:number,y:number}|null} Bildschirmposition oder null hinter der Kamera.
 */
export function projectGroundPoint(x,z,camera) {
  const forward=z-camera.forward;
  const depth=camera.eyeHeight*Math.sin(camera.pitch)+forward*Math.cos(camera.pitch);
  if(depth<=.04) return null;
  return { x:camera.width/2+camera.focal*x/depth,
    y:camera.height/2+camera.focal*(camera.eyeHeight*Math.cos(camera.pitch)-forward*Math.sin(camera.pitch))/depth };
}
