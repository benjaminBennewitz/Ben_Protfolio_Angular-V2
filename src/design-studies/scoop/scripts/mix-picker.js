/** @file mix-picker.js — Gekapselter Teilbereich der SCOOP!-Studie. */

/**
 * Bindet Vorschau und tastaturbedienbare Sortenwahl der Mix-Box.
 * @param {object} context - Explizite Abhängigkeiten dieses Bereichs.
 * @returns {void} Kein Rückgabewert.
 */
export function createMixPicker({ $, $$, products, mix, addToCart, mountArtwork, requestFrame }) {

  /**
   * Aktualisiert die drei Bechergrafiken der Mix-Box.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function renderMix() {
    $$('[data-mix-art]').forEach(

      /**
       * Verarbeitet den aktuellen Eintrag der zugehörigen DOM- oder Datenliste.
       * @param {unknown} host - Eingabewert des Callbacks.
       * @param {number} index - Index des aktuellen Mix-Platzes.
       * @returns {void} Kein Rückgabewert.
       */
      (host, index) => {
        mountArtwork(`${mix[index]}-cup`, host);
        host.setAttribute('role', 'img');
        host.setAttribute('aria-label', `${products[mix[index]].name} auf Platz ${index + 1}`);
      },
    );
    requestFrame();
  }
  // Derzeit geöffnete Mix-Sortenauswahl.
  let openMixPicker = null;

  /**
   * Schließt die geöffnete Sortenauswahl und stellt optional den Fokus wieder her.
   *
   * @param {boolean} restoreFocus - Fokus zur Schaltfläche zurückgeben.
   * @returns {void} Kein Rückgabewert.
   */
  function closeMixPicker(restoreFocus = false) {
    if (!openMixPicker) return;
    // Auslöser der aktuellen Mix-Sortenauswahl.
    const trigger = $('[data-mix-select]', openMixPicker);
    $('.mix-options', openMixPicker).hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) trigger.focus();
    openMixPicker = null;
  }

  /**
   * Registriert Auslöser, Listbox und Fokusführung eines Mix-Platzes.
   * @param {HTMLElement} picker - Eingabewert der Operation.
   * @returns {void} Kein Rückgabewert.
   */
  function bindPicker(picker) {
    // Auslöser der aktuellen Mix-Sortenauswahl.
    const trigger = $('[data-mix-select]', picker);
    // Container der Einträge beziehungsweise Sortenoptionen.
    const list = $('.mix-options', picker);
    // Fokussierbare Sortenoptionen des Mix-Platzes.
    const options = $$('[data-mix-option]', picker);
    // Index des aktuellen Mix-Platzes.
    const index = Number(picker.dataset.mixPicker);

    /**
     * Öffnet die Sortenauswahl der aktuellen Mix-Position.
     *
     * @returns {void} Kein Rückgabewert.
     */
    function openPicker() {
      closeMixPicker();
      openMixPicker = picker;
      list.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      options
        .find(

          /**
           * Prüft die Kennung des gesuchten Eintrags.
           * @param {unknown} option - Eingabewert des Callbacks.
           * @returns {unknown} Ergebnis der Verarbeitung.
           */
          option => {
            return option.dataset.mixOption === mix[index];
          },
        )
        .focus();
    }
    trigger.addEventListener(
      'click',

      /**
       * Verarbeitet das Ereignis „click“ für diese Interaktion.
       * @returns {void} Kein Rückgabewert.
       */
      () => {
        if (openMixPicker === picker) closeMixPicker(true);
        else openPicker();
      },
    );
    trigger.addEventListener(
      'keydown',

      /**
       * Verarbeitet das Ereignis „keydown“ für diese Interaktion.
       * @param {Event} event - Eingabewert des Callbacks.
       * @returns {void} Kein Rückgabewert.
       */
      event => {
        if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
          event.preventDefault();
          openPicker();
        }
      },
    );
    options.forEach(

      /**
       * Verarbeitet den aktuellen Eintrag der zugehörigen DOM- oder Datenliste.
       * @param {unknown} option - Eingabewert des Callbacks.
       * @returns {unknown} Ergebnis der Verarbeitung.
       */
      option => {
        return option.addEventListener(
          'click',

          /**
           * Verarbeitet das Ereignis „click“ für diese Interaktion.
           * @returns {void} Kein Rückgabewert.
           */
          () => {
            // Stabile Kennung der aktuellen Position oder Sorte.
            const id = option.dataset.mixOption;
            mix[index] = id;
            picker.dataset.flavor = id;
            $('.mix-choice-label', trigger).textContent =
              `${products[id].name} · ${products[id].flavor}`;
            $('.mix-choice-icon', trigger).src = `assets/${id}-cup.svg`;
            trigger.setAttribute(
              'aria-label',
              `Platz ${index + 1}: ${products[id].name}, ${products[id].flavor}`,
            );
            options.forEach(

              /**
               * Verarbeitet den aktuellen Eintrag der zugehörigen DOM- oder Datenliste.
               * @param {unknown} node - Aktuell bearbeitetes DOM-Element.
               * @returns {unknown} Ergebnis der Verarbeitung.
               */
              node => {
                return node.setAttribute('aria-selected', String(node === option));
              },
            );
            closeMixPicker(true);
            renderMix();
          },
        );
      },
    );
    list.addEventListener(
      'keydown',

      /**
       * Verarbeitet das Ereignis „keydown“ für diese Interaktion.
       * @param {Event} event - Eingabewert des Callbacks.
       * @returns {void} Kein Rückgabewert.
       */
      event => {
        // Index des aktuell fokussierten Listbox-Eintrags.
        const current = options.indexOf(document.activeElement);
        // Zuordnung der Navigationstasten zu Indexänderungen.
        const directions = {
          ArrowDown: 1,
          ArrowUp: -1,
          Home: -current,
          End: options.length - 1 - current,
        };
        if (Object.hasOwn(directions, event.key)) {
          event.preventDefault();
          options[(current + directions[event.key] + options.length) % options.length].focus();
        }
      },
    );
    picker.addEventListener(
      'keydown',

      /**
       * Verarbeitet das Ereignis „keydown“ für diese Interaktion.
       * @param {Event} event - Eingabewert des Callbacks.
       * @returns {void} Kein Rückgabewert.
       */
      event => {
        if (event.key === 'Escape' && openMixPicker === picker) {
          event.preventDefault();
          event.stopPropagation();
          closeMixPicker(true);
        } else if (event.key === 'Tab') closeMixPicker(true);
      },
    );
    picker.addEventListener(
      'focusout',

      /**
       * Verarbeitet das Ereignis „focusout“ für diese Interaktion.
       * @param {Event} event - Eingabewert des Callbacks.
       * @returns {void} Kein Rückgabewert.
       */
      event => {
        if (!picker.contains(event.relatedTarget) && openMixPicker === picker) closeMixPicker();
      },
    );
  }
  $$('[data-mix-picker]').forEach(bindPicker);
  document.addEventListener(
    'pointerdown',

    /**
     * Verarbeitet das Ereignis „pointerdown“ für diese Interaktion.
     * @param {Event} event - Eingabewert des Callbacks.
     * @returns {void} Kein Rückgabewert.
     */
    event => {
      if (openMixPicker && !openMixPicker.contains(event.target)) closeMixPicker();
    },
  );
  $('#add-mix').addEventListener(
    'click',

    /**
     * Verarbeitet das Ereignis „click“ für diese Interaktion.
     * @returns {unknown} Ergebnis der Verarbeitung.
     */
    () => {
      return addToCart({
        type: 'box',
        flavors: [...mix],
      });
    },
  );
  renderMix();
}
