import { DIRECTIONS } from '../core/config.js';
import { element } from '../core/dom.js';
const PARTS={interact:'BUTTON_A',back:'BUTTON_B',start:'BUTTON_START',select:'BUTTON_SELECT'};

/** Zeigt Entdeckungspunkte vor dem Spiel und hält die unsichtbaren Spieltasten unabhängig vom Powerzustand aktiv. @param {object} app Anwendung. */
export function updateTouchPoints(app) {
  const {device}=app,guide=device.compact?.matches && !(app.phase==='on' && app.game.mode==='world');
  element('experience').dataset.touchGuides=String(Boolean(guide));
  const front=['front','bottom'].includes(device.view) && !app.helpOpen && !app.cartridge.open;
  element('model-controls').hidden=!front;
  for (const node of document.querySelectorAll('[data-model-action],[data-model-direction]')) positionButton(device,node);
  for (const node of document.querySelectorAll('[data-device-view]')) positionGuide(app,node,guide && front);
  for (const id of ['power','contrast','volume','cartridge-hotspot']) element(id).dataset.guide=String(Boolean(guide));
}

/** Projiziert jede echte Taste mit begrenzten, voneinander getrennten Richtungsflächen. @param {object} device Gerät. @param {HTMLButtonElement} node Fläche. */
function positionButton(device,node) {
  const direction=node.dataset.modelDirection,part=direction?'DPAD':PARTS[node.dataset.modelAction];
  const point=projectPoint(device,device.root.getObjectByName(part));
  if (direction) {
    const pixels=device.viewport.clientHeight/Math.max(.001,device.camera.top-device.camera.bottom);
    const offset=Math.max(20,Math.min(32,pixels*.006)),[dx,dy]=DIRECTIONS[direction];
    point.x+=dx*offset; point.y+=dy*offset;
  }
  node.style.left=`${point.x}px`; node.style.top=`${point.y}px`;
}

/** Verweist auf Power, Räder und Modul, solange die aktive Ansicht diese Bedienelemente verdeckt. @param {object} app Anwendung. @param {HTMLButtonElement} node Hinweis. @param {boolean} visible Hinweise aktiv. */
function positionGuide(app,node,visible) {
  const {device}=app,key=node.dataset.deviceView;
  node.hidden=!visible || app.phase==='boot';
  if (node.hidden) return;
  const part={top:device.refs.power,left:device.refs.contrast,right:device.refs.volume,rear:device.cartridge.model}[key];
  const local=key==='rear'?part.position.clone().set(0,.05,0):undefined;
  const point=projectPoint(device,part,local);
  node.style.left=`${point.x}px`; node.style.top=`${point.y}px`;
}

/** Rechnet Viewportkoordinaten in die gemeinsame HTML-Fläche um. @param {object} device Gerät. @param {object} part Modellteil. @param {object} local Optionaler lokaler Punkt. */
function projectPoint(device,part,local) {
  const point=device.project(part,local);
  return {x:point.x+device.viewport.offsetLeft,y:point.y+device.viewport.offsetTop};
}
