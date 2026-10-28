/** @file ingredients.js — Gekapselter Teilbereich der SCOOP!-Studie. */

import { $$, element } from './dom.js';

/**
 * Ergänzt die dekorativen Zutaten jeder Produktkarte.
 * @returns {void} Kein Rückgabewert.
 */
export function mountIngredients() {
  // Gemeinsame Konturfarbe der Zutatenzeichnungen.
  const ink = '#3b1811';
  // Dekorative Zutaten als vertrauenswürdige SVG-Vorlagen.
  const doodles = {
    berry: `<svg viewBox="0 0 100 120"><path d="M15 48C6 75 35 106 50 114c22-10 45-44 36-66-10-24-62-24-71 0Z" fill="#ff638c" stroke="${ink}" stroke-width="4"/><path d="M50 42 30 18l-2 23-18-3 21 18 20-7 24 7 18-19-22 4-2-24Z" fill="#86b84a" stroke="${ink}" stroke-width="3"/><path d="m29 66-2 7m25-8-2 7m23-5-2 7m-27 11-2 7m17-1-2 7" stroke="${ink}" stroke-width="3" stroke-linecap="round"/></svg>`,
    nut: `<svg viewBox="0 0 110 90"><path d="M9 54C17 17 67 8 96 24c14 36-22 65-48 59S15 68 9 54Z" fill="#e5c28d" stroke="${ink}" stroke-width="4"/><path d="M25 52C38 28 62 23 91 29c-10 23-34 28-66 23Z" fill="#91b849" stroke="${ink}" stroke-width="3"/><path d="M19 63c33 6 52-7 77-30" fill="none" stroke="${ink}" stroke-width="3"/></svg>`,
    flower: `<svg viewBox="0 0 110 110">${Array.from(
      {
        length: 5,
      },

      /**
       * Führt den zeit- oder zustandsabhängigen Callback aus.
       * @param {unknown} _ - Eingabewert des Callbacks.
       * @param {number} i - Laufender Index der aktuellen Berechnung.
       * @returns {unknown} Ergebnis der Verarbeitung.
       */
      (_, i) => {
        return `<ellipse cx="55" cy="28" rx="13" ry="24" transform="rotate(${i * 72} 55 55)" fill="#fff8e7" stroke="${ink}" stroke-width="3"/>`;
      },
    ).join('')}<circle cx="55" cy="55" r="13" fill="#fce362" stroke="${ink}" stroke-width="3"/></svg>`,
    pod: `<svg viewBox="0 0 140 100"><path d="M9 87C65 72 97 39 125 10c-6 31-44 68-103 83Z" fill="#986136" stroke="${ink}" stroke-width="4"/></svg>`,
  };
  $$('[data-ingredients]').forEach(

    /**
     * Verarbeitet den aktuellen Eintrag der zugehörigen DOM- oder Datenliste.
     * @param {unknown} host - Eingabewert des Callbacks.
     * @returns {void} Kein Rückgabewert.
     */
    host => {
      // Zutatenkennungen für die jeweilige Sorte.
      const keys =
        host.dataset.ingredients === 'strawlarry'
          ? ['berry', 'berry', 'berry', 'berry', 'berry']
          : host.dataset.ingredients === 'brostacchio'
            ? ['nut', 'nut', 'nut', 'nut', 'nut']
            : ['flower', 'pod', 'pod', 'flower', 'flower'];
      keys.forEach(

        /**
         * Verarbeitet den aktuellen Eintrag der zugehörigen DOM- oder Datenliste.
         * @param {unknown} key - Eingabewert des Callbacks.
         * @returns {void} Kein Rückgabewert.
         */
        key => {
          // Container einer dekorativen Zutatenzeichnung.
          const wrapper = element('span', 'ingredient');
          wrapper.innerHTML = doodles[key];
          host.append(wrapper);
        },
      );
    },
  );
}
