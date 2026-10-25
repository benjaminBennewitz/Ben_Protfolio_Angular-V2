import * as THREE from 'three';
import { canvas } from '../core/dom.js';

/** Rastert die bestehende Fantasiemarke. */
function brandTexture() {
  const surface = canvas(512, 96);
  const ctx = surface.getContext('2d');
  ctx.font = '64px Tiny5'; ctx.fillStyle = '#fff';
  ctx.fillText('BENTENDO™', 2, 68);
  const texture = new THREE.CanvasTexture(surface);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Ersetzt ausschließlich die Frontmarke. @param {THREE.Object3D} root Modellwurzel. */
export function labelDevice(root) {
  const original = root.getObjectByName('Front_Brand');
  if (!original) return;
  root.updateWorldMatrix(true, true);
  const bounds = new THREE.Box3().setFromObject(original);
  root.worldToLocal(bounds.min); root.worldToLocal(bounds.max);
  const size = bounds.getSize(new THREE.Vector3());
  const material = original.material.clone();
  material.map = brandTexture(); material.transparent = true; material.depthWrite = false;
  const label = new THREE.Mesh(new THREE.PlaneGeometry(size.x, size.x * 96 / 512), material);
  label.position.copy(bounds.getCenter(new THREE.Vector3()));
  label.position.z = bounds.max.z + 0.00005;
  original.visible = false; root.add(label);
}
