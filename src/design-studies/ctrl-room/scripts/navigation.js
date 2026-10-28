/** @file navigation.js — Gekapselter Bereich der CTRL//ROOM-Studie. */

/**
 * Registriert mobiles Menü, Fokusfalle und das Such-Tastenkürzel.
 * @param {object} context - Explizite Abhängigkeiten beziehungsweise aktueller Dateneintrag.
 * @returns {void} Kein Rückgabewert.
 */
export function createNavigation({
  select,
  selectAll,
  motionPreference,
  menuButton,
  menu,
  main,
  footer,
  dialog,
  playerDialog,
  search,
}) {

  /**
   * Synchronisiert mobiles Menü, Scroll-Lock, Fokus und inerte Inhaltsbereiche.
   * @param {boolean} open - Gewünschter geöffneter Zustand des Menüs.
   * @param {boolean} [restoreFocus] - Fokus beim Schließen zur Menüschaltfläche zurückgeben.
   * @returns {void} Kein Rückgabewert.
   */
  function setMenu(open, restoreFocus = true) {
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    document.body.classList.toggle('menu-open', open);
    main.inert = open;
    footer.inert = open;
    if (open) select('a', menu).focus();
    else if (restoreFocus) menuButton.focus();
  }

  /**
   * Verschiebt nach mobiler Ankernavigation den Fokus auf die Zielüberschrift.
   * @param {string} anchor - CSS-Anker des gewünschten Zielabschnitts.
   * @returns {void} Kein Rückgabewert.
   */
  function focusSection(anchor) {

    const target = select(anchor);                       // Zielbereich einer mobilen Ankernavigation.

    if (!target) return;

    const heading = select('h1, h2', target) || target;  // Zielüberschrift für die Fokusführung nach Ankernavigation.

    heading.setAttribute('tabindex', '-1');
    heading.focus({
      preventScroll: true,
    });
    heading.addEventListener(
      'blur',

      /**
       * Verarbeitet das Ereignis „blur“ für die zugehörige Audio- oder Seiteninteraktion.
       * @returns {unknown} Ergebnis der beschriebenen Operation.
       */
      () => heading.removeAttribute('tabindex'),
      {
        once: true,
      },
    );
  }
  menuButton.addEventListener(
    'click',

    /**
     * Verarbeitet das Ereignis „click“ für die zugehörige Audio- oder Seiteninteraktion.
     * @returns {unknown} Ergebnis der beschriebenen Operation.
     */
    () => setMenu(menu.hidden),
  );
  selectAll('a', menu).forEach(

    /**
     * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
     * @param {HTMLElement} link - Aktueller Navigations- oder Filterverweis.
     * @returns {unknown} Ergebnis der beschriebenen Operation.
     */
    link =>
      link.addEventListener(
        'click',

        /**
         * Verarbeitet das Ereignis „click“ für die zugehörige Audio- oder Seiteninteraktion.
         * @returns {void} Kein Rückgabewert.
         */
        () => {
          setMenu(false, false);
          focusSection(link.getAttribute('href'));
        },
      ),
  );
  window.matchMedia('(min-width: 901px)').addEventListener(
    'change',

    /**
     * Verarbeitet das Ereignis „change“ für die zugehörige Audio- oder Seiteninteraktion.
     * @param {Event} event - Eingabewert „event“.
     * @returns {void} Kein Rückgabewert.
     */
    event => {
      if (event.matches && !menu.hidden) setMenu(false, false);
    },
  );
  document.addEventListener(
    'keydown',

    /**
     * Verarbeitet das Ereignis „keydown“ für die zugehörige Audio- oder Seiteninteraktion.
     * @param {Event} event - Eingabewert „event“.
     * @returns {void} Kein Rückgabewert.
     */
    event => {
      if (!menu.hidden) {
        if (event.key === 'Escape') {
          event.preventDefault();
          setMenu(false);
        }
        if (event.key === 'Tab') {

          const elements = [
            ...selectAll('button:not(:disabled), input:not(:disabled)', select('.site-header')),
            ...selectAll('a', menu),
          ];                                                       // Geordnete Fokusziele des geöffneten mobilen Menüs.
          const index = elements.indexOf(document.activeElement);  // Index des aktuellen Balkens, Wellenpunkts oder Fokusziels.

          if (event.shiftKey && index === 0) {
            event.preventDefault();
            elements.at(-1).focus();
          } else if (!event.shiftKey && index === elements.length - 1) {
            event.preventDefault();
            elements[0].focus();
          }
        }
      } else if (
        event.key === '/' &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !dialog.open &&
        !playerDialog.open &&
        !event.target.closest('input, textarea, select, [contenteditable]')
      ) {
        event.preventDefault();
        search.focus();
        search.scrollIntoView({
          block: 'center',
          behavior: motionPreference.matches ? 'instant' : 'smooth',
        });
      }
    },
  );
}
