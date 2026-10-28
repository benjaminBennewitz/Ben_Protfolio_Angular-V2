/** @file stage.js — Teilbereich der verbundenen FOLD-Papierexperience. */

/**
 * Verknüpft CSS3D-Renderer, Szene, Kamera, Wurzelgruppe und Netzhintergrundschatten.
 * @param {object} context - Explizite Abhängigkeiten beziehungsweise aktueller Dateneintrag.
 * @returns {object} Ergebnis der beschriebenen Operation.
 */
export function createStage({ THREE, CSS3DRenderer, sceneNode }) {

  const renderer = new CSS3DRenderer();                         // Renderer der aktuellen Papierbühne.

  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.inset = '0';
  renderer.domElement.style.pointerEvents = 'auto';
  sceneNode.append(renderer.domElement);

  const scene = new THREE.Scene();                              // Gemeinsame dreidimensionale Papierbühne.
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);  // Perspektivkamera der Papierbühne.
  const root = new THREE.Group();                               // Gemeinsame räumliche Wurzelgruppe der Papierflächen.

  scene.add(root);

  const stage = sceneNode.closest('.stage');                    // Renderer, Szene, Kamera und Schatten beziehungsweise WebGL-Bühnencontainer.
  const shadow = document.createElement('div');                 // Bodenschatten unter dem geöffneten Netz.

  shadow.className = 'unfold-ground-shadow';
  shadow.setAttribute('aria-hidden', 'true');
  stage.insertBefore(shadow, sceneNode);
  return {
    renderer,
    scene,
    camera,
    root,
    shadow,
  };
}
