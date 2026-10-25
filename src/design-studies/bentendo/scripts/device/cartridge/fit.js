import * as THREE from 'three';
import { CARTRIDGE_POSES, flushHeight } from './poses.js';

/** Ermittelt Modellgrenzen relativ zur Gerätewurzel. @param {object} object Modellteil. @param {object} root Gerätewurzel. */
function localBounds(object,root) {
  root.updateWorldMatrix(true,true);
  return new THREE.Box3().setFromObject(object).applyMatrix4(root.matrixWorld.clone().invert());
}

/** Passt die Einsetztiefe an tatsächliche Gehäuse- und Cartridge-Abmessungen an. @param {object} device Gerät. @param {object} model Cartridge-Modell. */
export function fitCartridge(device,model) {
  const poses=structuredClone(CARTRIDGE_POSES);
  const front=localBounds(device.root.getObjectByName('Shell_Front'),device.root);
  const rear=localBounds(device.root.getObjectByName('Shell_Rear'),device.root);
  const cartridge=localBounds(model,device.root);
  const top=Math.max(front.max.y,rear.max.y), height=cartridge.max.y-cartridge.min.y;
  poses.seated[1]=flushHeight(top,cartridge.max.y);
  poses.partial[1]=top-cartridge.min.y-height*0.75;
  return poses;
}
