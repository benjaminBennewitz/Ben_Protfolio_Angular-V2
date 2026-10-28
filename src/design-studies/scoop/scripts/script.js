/** @file script.js — Startsequenz und Verknüpfung der Seitenmodule. */

import { createShop } from './shop.js';
import { createExperience } from './experience.js';
import { $, $$, element, readStorage, writeStorage } from './dom.js';
import { createNavigation } from './navigation.js';
import { initVoting } from './voting.js';
import { mountIngredients } from './ingredients.js';


const motion = matchMedia('(prefers-reduced-motion: reduce)');          // Medienabfrage für reduzierte Bewegung.
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');   // Medienabfrage für präzise Mausinteraktion.
const automaticHover = matchMedia('(hover: none), (pointer: coarse)');  // Medienabfrage für Geräte ohne präzisen Hover.
const loader = $('#page-loader');                                       // Startbildschirm bis zur Freigabe der Seite.
const loaderStarted = performance.now();                                // Zeitpunkt des Loader-Starts in Millisekunden.
const cartDialog = $('#cart-dialog');                                   // Modaler Warenkorb-Dialog.
const menuButton = $('#menu-toggle');                                   // Schaltfläche zum Öffnen der mobilen Navigation.

$('.site-shell').inert = true;
document.body.classList.add('is-loading');

const setMenu = createNavigation();                                     // Steuert Menüstatus und Fokus-Rückgabe.

// Öffentliche Schnittstelle der Shop-Steuerung.
const shop = createShop({
  $,
  $$,
  element,
  motion,
  automaticHover,
  cartDialog,
  setMenu,
  readStorage,
  writeStorage,
});

// Öffentliche Schnittstelle der Animationssteuerung.
const experience = createExperience({
  $,
  $$,
  motion,
  finePointer,
  automaticHover,
  loader,
  showToast: shop.showToast,
  watchAutomaticHover: shop.watchAutomaticHover,
});

shop.initMix(experience.mountArtwork, experience.requestFrame);
initVoting();
mountIngredients();
experience.bindPageEvents();
document.body.classList.add('js-ready');
menuButton.hidden = false;
$('#year').textContent = new Date().getFullYear();
$$('[data-add], #add-mix, #vote-form button, #replay-hero').forEach(

  /**
   * Verarbeitet den aktuellen Eintrag der zugehörigen DOM- oder Datenliste.
   * @param {unknown} button - Zur Interaktion gehörende Schaltfläche.
   * @returns {void} Kein Rückgabewert.
   */
  button => {
    button.disabled = false;
  },
);
$$('[data-open-cart]').forEach(

  /**
   * Verarbeitet den aktuellen Eintrag der zugehörigen DOM- oder Datenliste.
   * @param {unknown} button - Zur Interaktion gehörende Schaltfläche.
   * @returns {void} Kein Rückgabewert.
   */
  button => {
    button.disabled = !cartDialog.showModal;
  },
);
shop.initCart();
experience.layoutPath();
experience.heroLayers.forEach(

  /**
   * Verarbeitet den aktuellen Eintrag der zugehörigen DOM- oder Datenliste.
   * @param {unknown} layer - Aktuell verarbeitete Hero-Ebene.
   * @returns {void} Kein Rückgabewert.
   */
  layer => {
    if (layer.delay >= 0) layer.group.style.opacity = '0';
    if (layer.shadow) layer.shadow.style.opacity = '0';
  },
);

/**
 * Wartet auf Loader-Mindestdauer und sichtbare Ressourcen, bevor der Hero startet.
 *
 * @returns {Promise<void>} Abschluss der Startsequenz.
 */
async function startExperience() {

  /**
   * Wartet eine feste Anzahl an Millisekunden.
   *
   * @param {number} duration - Wartezeit in Millisekunden.
   * @returns {Promise<void>} Abschluss der Wartezeit.
   */
  const wait = duration => {
    return new Promise(

      /**
       * Liest oder aktualisiert den zugehörigen Interaktionszustand.
       * @param {unknown} resolve - Eingabewert des Callbacks.
       * @returns {unknown} Ergebnis der Verarbeitung.
       */
      resolve => {
        return setTimeout(resolve, duration);
      },
    );
  };
  // Abschluss des Ladens sichtbarer Bilder und Schriften.
  const assetsReady = Promise.allSettled([
    document.fonts?.ready,
    ...$$('img:not([loading="lazy"])').map(

      /**
       * Berechnet den Zielwert für den aktuellen Listeneintrag.
       * @param {unknown} img - Bild-Element der aktuellen Produktdarstellung.
       * @returns {unknown} Ergebnis der Verarbeitung.
       */
      img => {
        return img.decode?.();
      },
    ),
  ]);
  await Promise.all([
    wait(Math.max(0, 2000 - (performance.now() - loaderStarted))),
    Promise.race([assetsReady, wait(5000)]),
  ]);
  experience.layoutPath();
  loader.classList.add('is-leaving');
  await wait(motion.matches ? 0 : 220);
  loader.hidden = true;
  $('.site-shell').inert = false;
  document.body.classList.remove('is-loading');
  if (motion.matches) experience.finishHero();
  else experience.playHero();
}
startExperience();
