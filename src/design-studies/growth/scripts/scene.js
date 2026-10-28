/** @file scene.js — Verknüpft Renderer, Szene, Kamera und Beleuchtung. */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

/**
 * Ergänzt Himmels-, Sonnen- und Fülllicht und gibt die animierbare Sonne zurück.
 * @param {object} scene - Gemeinsame Three.js-Szene.
 * @returns {THREE.DirectionalLight} Ergebnis der beschriebenen Operation.
 */
function createLights(scene) {

  const ambient = new THREE.HemisphereLight('#d9f0b9', '#332a20', 2.3);  // Hemisphärenlicht für Himmel und Boden.

  scene.add(ambient);

  const sun = new THREE.DirectionalLight('#f8eac1', 3.4);                // Animierbares Hauptlicht der Sonne.

  sun.position.set(-26, 65, 35);
  scene.add(sun);

  const fill = new THREE.DirectionalLight('#6abf86', 1.4);               // Grünes Fülllicht von der Gegenseite.

  fill.position.set(25, 20, -20);
  scene.add(fill);
  return sun;
}

/**
 * Initialisiert den Renderer und hängt seine Zeichenfläche in den Szenencontainer.
 * @returns {THREE.WebGLRenderer} Ergebnis der beschriebenen Operation.
 */
function createRenderer() {

  const root = document.querySelector('#scene');  // DOM-Container der WebGL-Zeichenfläche.
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });                                             // WebGL-Renderer der Studie.

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.32;
  root.append(renderer.domElement);
  return renderer;
}

/**
 * Verknüpft Renderer, Szene, Kamera und Beleuchtung.
 * @returns {object} Ergebnis der beschriebenen Operation.
 */
export function createScene() {

  const renderer = createRenderer();                                                                  // WebGL-Renderer der Studie.
  const scene = new THREE.Scene();                                                                    // Gemeinsame Three.js-Szene.

  scene.background = new THREE.Color('#14261c');
  scene.fog = new THREE.FogExp2('#152b20', 0.014);

  const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.15, 380);  // Perspektivische Kamera der Höhenreise.
  const sun = createLights(scene);                                                                    // Animierbares Hauptlicht der Sonne.

  return {
    renderer,
    scene,
    camera,
    sun,
  };
}
