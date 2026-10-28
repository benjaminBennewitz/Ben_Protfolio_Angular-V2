/** @file shop.js — Gekapselter Teilbereich der SCOOP!-Studie. */

import { products } from './products.js';
import { createCart } from './cart.js';
import { createAutomaticHover } from './automatic-hover.js';
import { initProductCards } from './product-cards.js';
import { createMixPicker } from './mix-picker.js';

/**
 * Verbindet Warenkorb, Produktkarten und Mix-Auswahl zur Shop-Schnittstelle.
 * @param {object} context - Explizite Abhängigkeiten dieses Bereichs.
 * @returns {object} Ergebnis der beschriebenen Operation.
 */
export function createShop(context) {

  const cart = createCart(context);             // Öffentliche Schnittstelle der Warenkorb-Steuerung.
  const hover = createAutomaticHover(context);  // Schnittstelle der sichtbarkeitsabhängigen Hover-Steuerung.

  // Sortenkennungen der drei Mix-Plätze.
  const mix = ['strawlarry', 'brostacchio', 'jochen'];
  initProductCards({
    ...context,
    ...cart,
    ...hover,
  });

  /**
   * Bindet Auswahl und Tastaturbedienung der drei Mix-Box-Plätze.
   *
   * @param {Function} mountArtwork - Bindet eine SVG-Grafik ein.
   * @param {Function} requestFrame - Fordert einen Animationsframe an.
   * @returns {void} Kein Rückgabewert.
   */
  function initMix(mountArtwork, requestFrame) {
    createMixPicker({
      ...context,
      ...cart,
      products,
      mix,
      mountArtwork,
      requestFrame,
    });
  }
  return {
    addToCart: cart.addToCart,
    showToast: cart.showToast,
    ...hover,
    initMix,
    initCart: cart.initCart,
  };
}
