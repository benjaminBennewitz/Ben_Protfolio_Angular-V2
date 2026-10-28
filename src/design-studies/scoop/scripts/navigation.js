/** @file navigation.js — Gekapselter Teilbereich der SCOOP!-Studie. */

import { $, $$ } from './dom.js';

/**
 * Registriert das mobile Menü mit Fokusfalle und Escape-Bedienung.
 * @returns {Function} Ergebnis der beschriebenen Operation.
 */
export function createNavigation() {
  // Container der mobilen Navigation.
  const menu = $('#mobile-menu');
  // Schaltfläche zum Öffnen der mobilen Navigation.
  const menuButton = $('#menu-toggle');

  /** Öffnet oder schließt das mobile Menü und erhält die Fokusführung. */
  function setMenu(open, restore = true) {
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    document.body.classList.toggle('menu-open', open);
    $('main').inert = open;
    $('footer').inert = open;
    if (open) $('a', menu).focus();
    else if (restore) menuButton.focus();
  }
  menuButton.addEventListener(
    'click',

    /**
     * Verarbeitet das Ereignis „click“ für diese Interaktion.
     * @returns {unknown} Ergebnis der Verarbeitung.
     */
    () => {
      return setMenu(menu.hidden);
    },
  );
  $$('a', menu).forEach(

    /**
     * Verarbeitet den aktuellen Eintrag der zugehörigen DOM- oder Datenliste.
     * @param {unknown} link - Eingabewert des Callbacks.
     * @returns {unknown} Ergebnis der Verarbeitung.
     */
    link => {
      return link.addEventListener(
        'click',

        /**
         * Verarbeitet das Ereignis „click“ für diese Interaktion.
         * @returns {void} Kein Rückgabewert.
         */
        () => {
          setMenu(false, false);
          // Zielüberschrift für die Fokusführung.
          const heading = $('h2', $(link.getAttribute('href')));
          heading.setAttribute('tabindex', '-1');
          heading.focus({
            preventScroll: true,
          });
          heading.addEventListener(
            'blur',

            /**
             * Verarbeitet das Ereignis „blur“ für diese Interaktion.
             * @returns {unknown} Ergebnis der Verarbeitung.
             */
            () => {
              return heading.removeAttribute('tabindex');
            },
            {
              once: true,
            },
          );
        },
      );
    },
  );
  document.addEventListener(
    'keydown',

    /**
     * Verarbeitet das Ereignis „keydown“ für diese Interaktion.
     * @param {Event} event - Eingabewert des Callbacks.
     * @returns {void} Kein Rückgabewert.
     */
    event => {
      if (menu.hidden) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenu(false);
      }
      if (event.key === 'Tab') {
        // Geordnete Fokusziele der mobilen Navigation.
        const nodes = [...$$('button:not(:disabled)', $('.site-header')), ...$$('a', menu)];
        // Laufender Index der aktuellen Berechnung.
        const i = nodes.indexOf(document.activeElement);
        if (event.shiftKey && i === 0) {
          event.preventDefault();
          nodes.at(-1).focus();
        } else if (!event.shiftKey && i === nodes.length - 1) {
          event.preventDefault();
          nodes[0].focus();
        }
      }
    },
  );
  matchMedia('(min-width:801px)').addEventListener(
    'change',

    /**
     * Verarbeitet das Ereignis „change“ für diese Interaktion.
     * @param {Event} event - Eingabewert des Callbacks.
     * @returns {void} Kein Rückgabewert.
     */
    event => {
      if (event.matches && !menu.hidden) setMenu(false, false);
    },
  );
  return setMenu;
}
