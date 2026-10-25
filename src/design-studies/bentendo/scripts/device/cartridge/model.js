import * as THREE from 'three';
import { GLTFLoader } from '../../../vendor/three/addons/loaders/GLTFLoader.js';
import { ASSETS } from '../../core/config.js';

/** Erstellt eine abgerundete Modulkontur. */
function outline() {
  const shape = new THREE.Shape();
  const x = 0.028, h = 0.054, r = 0.001;
  shape.moveTo(-x + r, 0); shape.lineTo(x - r, 0);
  shape.quadraticCurveTo(x, 0, x, r); shape.lineTo(x, h - r);
  shape.quadraticCurveTo(x, h, x - r, h); shape.lineTo(-x + r, h);
  shape.quadraticCurveTo(-x, h, -x, h - r); shape.lineTo(-x, r);
  shape.quadraticCurveTo(-x, 0, -x + r, 0);
  return shape;
}

/** Fügt ein kleines Gehäuseteil hinzu. @param {THREE.Group} root Modul. @param {number[]} size Maße. @param {number[]} position Position. @param {number} color Farbe. */
function detail(root, size, position, color) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), new THREE.MeshStandardMaterial({ color, roughness: 0.72 }));
  mesh.position.set(...position); root.add(mesh);
}

/** Baut einen sofort nutzbaren Web-Ersatz für den noch nicht gelieferten Blender-Export. */
function createShell() {
  const root = new THREE.Group(); root.name = 'CARTRIDGE_ROOT';
  const geometry = new THREE.ExtrudeGeometry(outline(), { depth: 0.0058, bevelEnabled: true, bevelThickness: 0.0002, bevelSize: 0.0002, bevelSegments: 2, steps: 1 });
  geometry.translate(0, 0, -0.0029);
  root.add(new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x90938b, roughness: 0.75 })));
  detail(root, [0.048, 0.0403, 0.00015], [0, 0.0265, -0.00315], 0x60645c);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) detail(root, [0.0055, 0.0006, 0.0004], [side * 0.0237, 0.0485 + i * 0.0009, -0.00315], 0x686c63);
  }
  detail(root, [0.039, 0.0055, 0.00015], [0, 0.0035, 0.0032], 0x1b211a);
  for (let i = 0; i < 20; i++) detail(root, [0.0011, 0.0034, 0.0001], [-0.0166 + i * 0.00175, 0.0033, 0.00335], 0xa88940);
  return root;
}

/** Lädt das Cover ohne Veränderung. @param {THREE.Group} root Modulwurzel. */
async function applyCover(root) {
  const texture = await new THREE.TextureLoader().loadAsync(ASSETS.cover);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const height = 0.046 * texture.image.height / texture.image.width;
  const label = new THREE.Mesh(new THREE.PlaneGeometry(0.046, height), new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }));
  label.name = 'CARTRIDGE_LABEL'; label.rotation.y = Math.PI;
  label.position.set(0, 0.0265, -0.00325); root.add(label);
}

/** Lädt optional den Blender-Export oder erzeugt das Web-Modell. */
export async function loadCartridge() {
  if (ASSETS.cartridge) {
    const gltf = await new GLTFLoader().loadAsync(ASSETS.cartridge);
    const root = gltf.scene.getObjectByName('CARTRIDGE_ROOT');
    if (!root) throw new Error('CARTRIDGE_ROOT fehlt im Cartridge-Export.');
    return root;
  }
  const root = createShell();
  await applyCover(root);
  return root;
}
