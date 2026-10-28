/** @file experience.js — Teilbereich der verbundenen FOLD-Papierexperience. */

import { createStage } from './stage.js';
import { createPaperModel } from './paper-model.js';
import { createView } from './view.js';
import { createNavigation } from './navigation.js';
import { createFrameLoop } from './frame-loop.js';
import { createInteractionSurface } from './interaction-surface.js';
const journey = document.querySelector('#journey');                      // Real scrollbarer Bereich der Sticky-Experience.
const sceneNode = document.querySelector('#scene');                      // DOM-Ziel der aktiven CSS3D-Ausgabe.
const counter = document.querySelector('#counter');                      // HUD-Anzeige der aktiven Perspektive.
const instruction = document.querySelector('#instruction');              // HUD-Hinweis zur aktuellen Scroll- oder Rücksprungaktion.
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;  // Beim Start erfasste Präferenz für reduzierte Bewegung.
try {
  const THREE = await import('three');                                                             // Innerhalb des abgesicherten Starts geladenes Three.js-Modul.
  const { CSS3DRenderer, CSS3DObject } = await import('three/addons/renderers/CSS3DRenderer.js');  // Benötigte Werte und Aktionen dieses Teilbereichs.
  const stage = createStage({
    THREE,
    CSS3DRenderer,
    sceneNode,
  });                                                                                              // Renderer, Szene, Kamera und Schatten beziehungsweise WebGL-Bühnencontainer.
  const { renderer, scene, camera, root, shadow } = stage;                                         // Benötigte Werte und Aktionen dieses Teilbereichs.
  const model = createPaperModel({
    THREE,
    CSS3DObject,
    root,
  });                                                                                              // Papierflächen, Scharniere und Kameraposen des gemeinsamen Modells.
  const view = createView({
    THREE,
    camera,
    root,
    shadow,
    ...model,
    counter,
    instruction,
  });                                                                                              // Gekapselte Ansichtssteuerung des Würfels und Netzes.
  const mobileQuery = matchMedia('(max-width: 800px) and (pointer: coarse)');                      // Medienabfrage für schmale Geräte mit grobem Zeiger.

  /**
   * Synchronisiert Perspektive und Renderergröße mit den aktuellen Bühnenabmessungen.
   * @returns {void} Kein Rückgabewert.
   */
  function resize() {

    const w = sceneNode.clientWidth;   // Aktuelle Bühnenbreite.
    const h = sceneNode.clientHeight;  // Aktuelle Bühnenhöhe.

    camera.aspect = w / h;
    camera.fov = w < 700 ? 55 : 40;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  addEventListener('resize', resize, {
    passive: true,
  });
  resize();
  const navigation = createNavigation({
    journey,
    mobileQuery,
    reduced,
  });                                                                                              // Stationen, Messfunktion und Aktionen der mobilen Navigation.
  const interaction = createInteractionSurface({ renderer, sceneNode, ...model });  // Native Eingabe auf der ruhenden Papierfläche 05.
  const loop = createFrameLoop({
    renderer: interaction,
    scene,
    camera,
    update: view.update,
    ...navigation,
    mobileQuery,
    reduced,
  });                                                                                              // Gekapselte Frame-Steuerung der aktiven Experience.
  loop.start();
  addEventListener('resize', loop.invalidate, { passive: true });
} catch (error) {
  console.error('FOLD. Engine:', error);
  document.querySelector('#fallback').hidden = false;
}
