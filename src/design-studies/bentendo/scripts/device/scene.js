import * as THREE from 'three';
import { sceneTarget } from './view-target.js';

/** Erstellt eine lokale, sparsame Three.js-Szene. @param {HTMLElement} viewport Zeichencontainer. */
export function createScene(viewport) {
  const scene = new THREE.Scene();
  const rig = new THREE.Group();
  const camera = new THREE.OrthographicCamera(-0.05, 0.05, 0.03, -0.03, 0.001, 5);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.AgXToneMapping;
  camera.position.set(0.005, 0.0365, 0.4);
  camera.lookAt(0.005, 0.0365, 0);
  scene.add(rig);
  addLights(scene);
  viewport.append(renderer.domElement);
  return { scene, rig, camera, renderer };
}

/** Übernimmt die bewährte Gerätebeleuchtung. @param {THREE.Scene} scene Zielszene. */
function addLights(scene) {
  scene.add(new THREE.HemisphereLight(0xf4f5e8, 0x353a2d, 2.1));
  const key = new THREE.DirectionalLight(0xfff3db, 2.4);
  key.position.set(-0.15, 0.2, 0.3); scene.add(key);
  const rim = new THREE.DirectionalLight(0xdbe6ff, 1);
  rim.position.set(0.2, 0.12, -0.15); scene.add(rim);
}

/** Interpoliert die Geräteansicht. @param {object} device Geräteinstanz. @param {number} dt Zeitschritt. */
export function animateView(device, dt) {
  const target = sceneTarget(device);
  const alpha = device.reduced.matches ? 1 : 1 - Math.exp(-dt * 9);
  let moving = false;
  for (const axis of ['x', 'y', 'z']) {
    device.rig.rotation[axis] = THREE.MathUtils.lerp(device.rig.rotation[axis], target[axis], alpha);
    moving ||= Math.abs(device.rig.rotation[axis] - target[axis]) > 0.0001;
  }
  const center = target.center ?? (device.view === 'rear' ? 0.005 : device.view==='bottom'?0.002:0.0365);
  device.camera.position.y = THREE.MathUtils.lerp(device.camera.position.y,center,alpha);
  device.camera.lookAt(0.005,device.camera.position.y,0);
  device.span = THREE.MathUtils.lerp(device.span, target.span, alpha);
  device.width = THREE.MathUtils.lerp(device.width, target.width, alpha);
  return moving || Math.abs(device.span - target.span) > 0.00001;
}

/** Passt die Kamera an den verfügbaren Platz an. @param {object} device Geräteinstanz. */
export function resizeScene(device) {
  const { clientWidth: width, clientHeight: height } = device.viewport;
  const aspect = width / Math.max(1, height);
  const span = Math.max(device.span, device.width / aspect);
  device.camera.left = -span * aspect / 2;
  device.camera.right = span * aspect / 2;
  device.camera.top = span / 2;
  device.camera.bottom = -span / 2;
  device.camera.updateProjectionMatrix();
  const size = device.renderer.getSize(new THREE.Vector2());
  if (size.x !== width || size.y !== height) device.renderer.setSize(width, height);
}

