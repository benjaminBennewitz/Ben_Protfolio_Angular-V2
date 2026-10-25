import * as THREE from 'three';
import { insidePolygon } from '../../core/geometry.js';

/** Bestimmt die aktuelle Bildschirmfläche des Gehäuses. @param {object} device Geräteinstanz. */
export function deviceBounds(device) {
  const bounds = new THREE.Box3().setFromObject(device.root.getObjectByName('Shell_Front'));
  bounds.expandByObject(device.root.getObjectByName('Shell_Rear'));
  const screen = { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity };
  for (const x of [bounds.min.x,bounds.max.x]) {
    for (const y of [bounds.min.y,bounds.max.y]) {
      for (const z of [bounds.min.z,bounds.max.z]) expandScreen(screen,new THREE.Vector3(x,y,z).project(device.camera),device.viewport);
    }
  }
  return screen;
}

/** Erweitert projizierte Bildschirmgrenzen. @param {object} screen Grenzen. @param {THREE.Vector3} point Projizierter Punkt. @param {HTMLElement} viewport Zeichencontainer. */
function expandScreen(screen,point,viewport) {
  const x = (point.x+1)*viewport.clientWidth/2, y = (1-point.y)*viewport.clientHeight/2;
  screen.left = Math.min(screen.left,x); screen.right = Math.max(screen.right,x);
  screen.top = Math.min(screen.top,y); screen.bottom = Math.max(screen.bottom,y);
}

/** Ordnet das Verlassen der Rückseite einer Geräteansicht zu. @param {object} bounds Gehäusegrenzen. @param {number} x Zeiger-X. @param {number} y Zeiger-Y. */
export function rearExit(bounds,x,y) {
  if (x < bounds.left-8) return 'left';
  if (x > bounds.right) return null;
  if (y < bounds.top-8) return 'top';
  if (y > bounds.bottom+8) return 'front';
  return null;
}

/** Prüft den tatsächlich projizierten dunkelgrauen Displayrahmen. @param {object} device Gerät. @param {number} x Zeiger-X. @param {number} y Zeiger-Y. */
export function overDisplayFrame(device,x,y) {
  const bezel=device.refs.bezel;
  if (!bezel.geometry.boundingBox) bezel.geometry.computeBoundingBox();
  const bounds=bezel.geometry.boundingBox, polygon=[];
  for (const [xx,yy] of [[bounds.min.x,bounds.min.y],[bounds.max.x,bounds.min.y],[bounds.max.x,bounds.max.y],[bounds.min.x,bounds.max.y]]) {
    polygon.push(device.project(bezel,new THREE.Vector3(xx,yy,bounds.max.z)));
  }
  return insidePolygon(polygon,{x,y});
}
