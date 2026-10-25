import * as THREE from 'three';
import { GLTFLoader } from '../../vendor/three/addons/loaders/GLTFLoader.js';
import { addCartridgePocket } from './cartridge/pocket.js';
import { ASSETS } from '../core/config.js';

/** Lädt ein erforderliches Modellobjekt. @param {THREE.Object3D} root Wurzel. @param {string} name Objektname. */
export function requiredObject(root, name) {
  const object = root.getObjectByName(name);
  if (!object) throw new Error(`Modellobjekt fehlt: ${name}`);
  return object;
}

/** Lädt das unveränderte Handheld-Modell. @param {THREE.Group} rig Gerätehalter. */
export async function loadHandheld(rig) {
  const gltf = await new GLTFLoader().loadAsync(ASSETS.handheld);
  const root = requiredObject(gltf.scene, 'DMG_01_ROOT');
  root.position.set(0, 0, 0);
  rig.add(root); addCartridgePocket(root);
  return root;
}

/** Sammelt die beweglichen Originalbauteile. @param {THREE.Object3D} root Modellwurzel. */
export function collectParts(root) {
  const names = { power: 'POWER_SLIDER', contrast: 'CONTRAST_WHEEL', volume: 'VOLUME_WHEEL', lcd: 'LCD_SCREEN', led: 'POWER_LED', bezel: 'Display_Bezel' };
  const refs = {};
  for (const [key, name] of Object.entries(names)) refs[key] = requiredObject(root, name);
  refs.buttons=[];
  for (const name of ['BUTTON_A','BUTTON_B','BUTTON_START','BUTTON_SELECT','DPAD']) refs.buttons.push(requiredObject(root,name));
  refs.powerOff = refs.power.position.x;
  refs.contrastAngle = refs.contrast.rotation.z;
  refs.volumeAngle = refs.volume.rotation.z;
  refs.led.material = refs.led.material.clone();
  root.updateWorldMatrix(true, true);
  refs.bounds = new THREE.Box3().setFromObject(requiredObject(root, 'Shell_Front'));
  return refs;
}

/** Erzeugt das scharfe LCD-Overlay. @param {object} device Gerät. @param {HTMLCanvasElement} surface LCD-Zeichenfläche. */
export function mountScreen(device, surface) {
  const texture = new THREE.CanvasTexture(surface);
  texture.magFilter = THREE.NearestFilter; texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false; texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(0.0467, 0.042), material);
  panel.position.copy(device.refs.lcd.position); panel.position.z += 0.00016;
  panel.name = 'LCD_OVERLAY'; device.root.add(panel);
  device.panel = panel; device.texture = texture;
}
