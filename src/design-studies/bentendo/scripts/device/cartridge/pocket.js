import * as THREE from 'three';

/** Ergänzt die Schachtwand bis zur Mitte des eingerasteten Moduls. @param {THREE.Object3D} root Handheld-Modellwurzel. */
export function addCartridgePocket(root) {
  const rear = root.getObjectByName('Shell_Rear');
  const material = Array.isArray(rear.material) ? rear.material[0] : rear.material;
  const geometry = new THREE.BoxGeometry(0.058,0.0302,0.0038);
  const lip = new THREE.Mesh(geometry,material);
  lip.name = 'Cartridge_Pocket_Lip';
  lip.position.set(0,0.0316,-0.0176);
  root.add(lip);
}
