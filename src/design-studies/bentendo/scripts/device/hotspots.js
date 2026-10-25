import { updateTouchPoints } from './touch-points.js';
import * as THREE from 'three';
import { element } from '../core/dom.js';

/** Positioniert zugängliche HTML-Bedienelemente über dem 3D-Gerät. @param {object} app Anwendung. */
export function updateHotspots(app) {
  if (!app.device.ready) return;
  for (const [key,view] of Object.entries({ power:'top', contrast:'left', volume:'right' })) positionControl(app,key,view);
  const cartridge = element('cartridge-hotspot');
  cartridge.hidden = !['top','rear'].includes(app.device.view) || app.phase === 'boot' || app.cartridge.open;
  const point = hotspotPoint(app.device,app.device.cartridge.model,new THREE.Vector3(0,0.050,0));
  cartridge.style.transform = `translate(${point.x}px,${point.y}px)`;
  positionScreen(app); updateTouchPoints(app);
}

/** Positioniert einen einzelnen Regler. @param {object} app Anwendung. @param {string} key Regler. @param {string} view Zugehörige Ansicht. */
function positionControl(app, key, view) {
  const node = element(key), point = hotspotPoint(app.device,app.device.refs[key]);
  node.hidden = app.device.view !== view || app.phase === 'boot';
  node.style.transform = `translate(${point.x}px,${point.y}px)`;
  node.setAttribute('aria-disabled','false');
}

/** Legt die native Startfläche exakt über das frontale LCD. @param {object} app Anwendung. */
function positionScreen(app) {
  const node = element('screen-action'), device = app.device;
  node.hidden = app.phase !== 'on' || device.view !== 'front' || app.game.mode !== 'title';
  if (node.hidden) return;
  const a = hotspotPoint(device,device.panel,new THREE.Vector3(-0.02335,0.021,0));
  const b = hotspotPoint(device,device.panel,new THREE.Vector3(0.02335,-0.021,0));
  node.style.left = `${a.x}px`; node.style.top = `${a.y}px`;
  node.style.width = `${Math.max(44,b.x-a.x)}px`; node.style.height = `${Math.max(44,b.y-a.y)}px`;
}

/** Berücksichtigt den reservierten Tastaturbereich und den mobilen Rand beim HTML-Overlay. @param {object} device Gerät. @param {object} object Modellteil. @param {object} local Optionaler lokaler Punkt. */
export function hotspotPoint(device,object,local) {
  const point=device.project(object,local);
  return {x:point.x+device.viewport.offsetLeft,y:point.y+device.viewport.offsetTop};
}
