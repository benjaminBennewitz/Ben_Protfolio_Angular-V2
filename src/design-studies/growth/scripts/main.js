/** @file main.js — Koordiniert einen Frame für Kamera, Umgebung, HUD und Discovery-Punkte. */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { readConfig } from './config.js';
import { createGrowthWorld } from './world.js';
import { mountDebug } from './debug.js';
import { createScene } from './scene.js';
import { createDiscovery } from './discovery.js';
import { createCameraFlight } from './camera-flight.js';
import { updateWater, updateAtmosphere } from './environment-motion.js';
const { renderer, scene, camera, sun } = createScene();                                           // Benötigte Werte und Aktionen dieses Teilbereichs.
const config = readConfig();                                                                      // Validierte Generatorparameter und Seeds.
const world = createGrowthWorld(scene, renderer, config);                                         // Öffentliche Zustände und Aktionen der prozeduralen Welt.
mountDebug({
  world,
  config,
});
const sections = [...document.querySelectorAll('.chapter')];                                      // Kapitel des Dokuments beziehungsweise Abschnitte der aktuellen Oberfläche.
const discovery = createDiscovery({
  world,
  camera,
});                                                                                               // Gekapselte Steuerung der Discovery-Punkte.
const altimeterValue = document.querySelector('#height-value');                                   // Textanzeige der aktuellen Kamerahöhe.
const altimeterFill = document.querySelector('#altimeter-fill');                                  // Füllstand der Höhenfortschrittsanzeige.
const navLinks = [...document.querySelectorAll('.chapter-nav a')];                                // Kapitelverweise der Seitennavigation.
const orientation = document.querySelector('#orientation');                                       // Orientierungshinweis am Beginn der Reise.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');                      // Medienabfrage für reduzierte Bewegung.
let desiredProgress = 0;                                                                          // Aus dem Dokument bestimmte Zielposition der Kamerafahrt.
let scrollTicking = false;                                                                        // Ein Scroll-Update ist bereits für den nächsten Frame geplant.
let lastTime = 0;                                                                                 // Zeitstempel des zuletzt verarbeiteten Frames.
let frame = 0;                                                                                    // Aufsummierte Animationszeit in Sekunden.
const flight = createCameraFlight({
  camera,
  scene,
  sun,
  sections,
  reducedMotion,
});                                                                                               // Gekapselte Steuerung der Kamerafahrt.

/**
 * Synchronisiert Scroll-Zielwert, aktive Kapitel und Navigationsanzeigen.
 * @returns {void} Kein Rückgabewert.
 */
function updateScroll() {

  const maximum = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);  // Gesamter nutzbarer Scrollbereich.

  desiredProgress = THREE.MathUtils.clamp(1 - window.scrollY / maximum, 0, 1);

  const center = window.scrollY + window.innerHeight * 0.5;                                 // Mittelpunkt der aktuellen Geometrie beziehungsweise des Viewports.
  let active = sections[sections.length - 1];                                               // Aktives Kapitel beziehungsweise freigegebener Höhenbereich.

  for (const section of sections) {
    if (center >= section.offsetTop && center < section.offsetTop + section.offsetHeight) {
      active = section;
      break;
    }
  }
  sections.forEach(

    /**
     * Aktualisiert die Darstellung des aktuellen Eintrags.
     * @param {HTMLElement} section - Aktuell geprüftes Kapitel.
     * @returns {unknown} Ergebnis der beschriebenen Operation.
     */
    section => section.classList.toggle('is-active', section === active),
  );
  navLinks.forEach(

    /**
     * Aktualisiert die Darstellung des aktuellen Eintrags.
     * @param {HTMLAnchorElement} link - Eingabewert „link“.
     * @returns {void} Kein Rückgabewert.
     */
    link => {

      const enabled = link.getAttribute('href') === `#${active.id}`;  // Der Verweis gehört zum aktiven Kapitel.

      link.classList.toggle('active', enabled);
      if (enabled) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    },
  );
  orientation.style.opacity = desiredProgress > 0.09 ? '0' : '1';
  scrollTicking = false;
}
window.addEventListener(
  'scroll',

  /**
   * Verarbeitet das Ereignis „scroll“ für die zugehörige Interaktion.
   * @returns {void} Kein Rückgabewert.
   */
  () => {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(updateScroll);
    }
  },
  {
    passive: true,
  },
);
window.addEventListener(
  'resize',

  /**
   * Verarbeitet das Ereignis „resize“ für die zugehörige Interaktion.
   * @returns {void} Kein Rückgabewert.
   */
  () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    updateScroll();
  },
);

/**
 * Koordiniert einen Frame für Kamera, Umgebung, HUD und Discovery-Punkte.
 * @param {number} ms - Zeitstempel des aktuellen Frames in Millisekunden.
 * @returns {void} Kein Rückgabewert.
 */
function animate(ms) {

  const delta = Math.min((ms - lastTime) / 1000 || 0.016, 0.05);       // Auf 50 Millisekunden begrenzte vergangene Frame-Zeit in Sekunden.

  lastTime = ms;
  frame += delta;
  updateWater(world, frame, reducedMotion);

  const { height, progress } = flight.update(desiredProgress, delta);  // Benötigte Werte und Aktionen dieses Teilbereichs.

  updateAtmosphere(world, height, frame, reducedMotion);
  altimeterValue.textContent = `${height < 0 ? '−' : ''}${Math.abs(height).toFixed(1).padStart(4, '0')}`;
  altimeterFill.style.height = `${progress * 100}%`;
  world.restoreLayerVisibility();
  discovery.update(height);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
const hasAnchor = Boolean(window.location.hash && document.querySelector(window.location.hash));  // Die Startadresse verweist auf ein vorhandenes Dokumentziel.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.addEventListener(
  'load',

  /**
   * Verarbeitet das Ereignis „load“ für die zugehörige Interaktion.
   * @returns {void} Kein Rückgabewert.
   */
  () => {
    if (!hasAnchor)
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'instant',
      });
    updateScroll();
    flight.start(desiredProgress);
    document.querySelector('#loading').classList.add('is-hidden');
  },
);
requestAnimationFrame(animate);
document.querySelector('#begin-button').addEventListener(
  'click',

  /**
   * Verarbeitet das Ereignis „click“ für die zugehörige Interaktion.
   * @returns {void} Kein Rückgabewert.
   */
  () => {
    document.querySelector('#origin').scrollIntoView({
      behavior: reducedMotion.matches ? 'instant' : 'smooth',
    });
  },
);
