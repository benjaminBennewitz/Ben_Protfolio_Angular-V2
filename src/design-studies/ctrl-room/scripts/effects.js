/** @file effects.js — Gekapselter Bereich der CTRL//ROOM-Studie. */

/**
 * Kapselt Signal-Ringe, Hero-Parallax, Reveals und sichtbarkeitsabhängige Effekte.
 * @param {object} context - Explizite Abhängigkeiten beziehungsweise aktueller Dateneintrag.
 * @returns {void} Kein Rückgabewert.
 */
export function createEffects({
  select,
  selectAll,
  motionPreference,
  menu,
  dialog,
  playerDialog,
  startVisualization,
  stopVisualization,
}) {

  const interactionLayer = select('#interaction-layer');  // Container der kurzlebigen Signal-Ringe.
  let lastRippleTime = 0;                                 // Zeitstempel des zuletzt erzeugten Signal-Rings.

  /**
   * Erzeugt begrenzte Signal-Ringe auf freien Flächen außerhalb aktiver Steuerelemente.
   * @param {Event} event - Eingabewert „event“.
   * @returns {void} Kein Rückgabewert.
   */
  function createSignalRipple(event) {
    if (
      motionPreference.matches ||
      document.hidden ||
      dialog.open ||
      playerDialog.open ||
      !menu.hidden ||
      event.detail === 0
    )
      return;
    if (
      event.target.closest(
        "a, button, input, select, textarea, label, summary, [role='button'], [contenteditable], [tabindex]",
      )
    )
      return;
    if (window.getSelection()?.isCollapsed === false) return;

    const now = performance.now();                  // Aktueller Zeitstempel in Millisekunden.

    if (now - lastRippleTime < 120) return;
    lastRippleTime = now;
    while (interactionLayer.children.length >= 4) interactionLayer.firstElementChild.remove();

    const ripple = document.createElement('span');  // Kurzlebige Gruppe dreier Signal-Ringe.

    ripple.className = 'signal-ripple';
    ripple.style.left = `${event.clientX}px`;
    ripple.style.top = `${event.clientY}px`;
    for (let index = 0; index < 3; index++) ripple.append(document.createElement('i'));
    ripple.lastElementChild.addEventListener(
      'animationend',

      /**
       * Verarbeitet das Ereignis „animationend“ für die zugehörige Audio- oder Seiteninteraktion.
       * @returns {unknown} Ergebnis der beschriebenen Operation.
       */
      () => ripple.remove(),
      {
        once: true,
      },
    );
    interactionLayer.append(ripple);
  }
  document.addEventListener('click', createSignalRipple);

  const hero = select('.hero');                           // Gemeinsamer Bereich der bewegten Hero-Ebenen.
  let heroFrame = 0;                                      // Kennung des ausstehenden Hero-Frames.
  let heroPointer = null;                                 // Letzte gültige Mausposition für die Hero-Parallax.
  let heroVisible = true;                                 // Der Hero befindet sich im sichtbaren Bereich.

  /**
   * Berechnet Pointer- und Scrollversatz aller Hero-Ebenen in einem gemeinsamen Frame.
   * @returns {void} Kein Rückgabewert.
   */
  function updateHeroLayers() {
    heroFrame = 0;
    if (!heroVisible || document.hidden || motionPreference.matches) return;

    const rect = hero.getBoundingClientRect();                     // Aktuelles Rechteck des betrachteten Canvas-, Hero- oder Dialogbereichs.
    const x = heroPointer
      ? Math.max(-1, Math.min(1, ((heroPointer.x - rect.left) / rect.width) * 2 - 1))
      : 0;                                                         // Horizontale Pointer- oder Wellenformkoordinate.
    const y = heroPointer
      ? Math.max(-1, Math.min(1, ((heroPointer.y - rect.top) / rect.height) * 2 - 1))
      : 0;                                                         // Vertikale Pointer- oder Wellenformkoordinate.
    const scroll = Math.max(0, Math.min(rect.height, -rect.top));  // Begrenzter Scrollversatz innerhalb der Hero-Komposition.

    hero.style.setProperty('--hero-x', `${x * 14}px`);
    hero.style.setProperty('--hero-y', `${y * 10}px`);
    hero.style.setProperty('--hero-scroll', `${scroll}px`);
  }

  /**
   * Plant höchstens einen Hero-Frame bei sichtbarer Seite und erlaubter Bewegung.
   * @returns {void} Kein Rückgabewert.
   */
  function requestHeroFrame() {
    if (!heroFrame && heroVisible && !document.hidden && !motionPreference.matches) {
      heroFrame = requestAnimationFrame(updateHeroLayers);
    }
  }

  /**
   * Stoppt ausstehende Hero-Frames und stellt die statischen Ebenen wieder her.
   * @returns {void} Kein Rückgabewert.
   */
  function resetHeroLayers() {
    cancelAnimationFrame(heroFrame);
    heroFrame = 0;
    heroPointer = null;
    ['--hero-x', '--hero-y', '--hero-scroll'].forEach(

      /**
       * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
       * @param {string} property - Zurückzusetzende CSS-Variable der Hero-Komposition.
       * @returns {unknown} Ergebnis der beschriebenen Operation.
       */
      property => hero.style.removeProperty(property),
    );
  }
  hero.addEventListener(
    'pointermove',

    /**
     * Verarbeitet das Ereignis „pointermove“ für die zugehörige Audio- oder Seiteninteraktion.
     * @param {Event} event - Eingabewert „event“.
     * @returns {void} Kein Rückgabewert.
     */
    event => {
      if (event.pointerType !== 'mouse') return;
      heroPointer = event.target.closest('a, button, input')
        ? null
        : {
          x: event.clientX,
          y: event.clientY,
        };
      requestHeroFrame();
    },
  );
  hero.addEventListener(
    'pointerleave',

    /**
     * Verarbeitet das Ereignis „pointerleave“ für die zugehörige Audio- oder Seiteninteraktion.
     * @returns {void} Kein Rückgabewert.
     */
    () => {
      heroPointer = null;
      requestHeroFrame();
    },
  );
  window.addEventListener('scroll', requestHeroFrame, {
    passive: true,
  });
  window.addEventListener('resize', requestHeroFrame);
  if ('IntersectionObserver' in window) {

    const heroObserver = new IntersectionObserver(

      /**
       * Führt die Scroll-Interpolation aus und meldet ihren Abschluss.
       * @param {Array} entries - Eingabewert „entries“.
       * @returns {void} Kein Rückgabewert.
       */
      entries => {
        heroVisible = entries[0].isIntersecting;
        if (heroVisible) requestHeroFrame();
        else {
          cancelAnimationFrame(heroFrame);
          heroFrame = 0;
        }
      },
    );  // Sichtbarkeitsbeobachter der Hero-Komposition.

    heroObserver.observe(hero);
  }
  requestHeroFrame();
  if ('IntersectionObserver' in window) {

    const revealObserver = new IntersectionObserver(

      /**
       * Führt die Scroll-Interpolation aus und meldet ihren Abschluss.
       * @param {Array} entries - Eingabewert „entries“.
       * @returns {void} Kein Rückgabewert.
       */
      entries => {
        entries.forEach(

          /**
           * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
           * @param {object} entry - Einzelne Sichtbarkeitsmeldung des Beobachters.
           * @returns {void} Kein Rückgabewert.
           */
          entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              entry.target.classList.remove('is-pending');
              revealObserver.unobserve(entry.target);
            }
          },
        );
      },
      {
        threshold: 0.12,
      },
    );  // Beobachter zum einmaligen Einblenden der Inhaltsbereiche.

    selectAll('.reveal').forEach(

      /**
       * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
       * @param {HTMLElement} element - Beobachtetes Inhalts- oder Reveal-Element.
       * @returns {void} Kein Rückgabewert.
       */
      element => {
        if (!motionPreference.matches) element.classList.add('is-pending');
        revealObserver.observe(element);
      },
    );

    const navigationObserver = new IntersectionObserver(

      /**
       * Führt die Scroll-Interpolation aus und meldet ihren Abschluss.
       * @param {Array} entries - Eingabewert „entries“.
       * @returns {void} Kein Rückgabewert.
       */
      entries => {

        const visible = entries
          .filter(

            /**
             * Synchronisiert die Seitendarstellung mit dem aktuellen Seitenzustand.
             * @param {object} entry - Einzelne Sichtbarkeitsmeldung des Beobachters.
             * @returns {unknown} Ergebnis der beschriebenen Operation.
             */
            entry => entry.isIntersecting,
          )
          .sort(

            /**
             * Synchronisiert die Seitendarstellung mit dem aktuellen Seitenzustand.
             * @param {object} a - Eingabewert „a“.
             * @param {object} b - Eingabewert „b“.
             * @returns {number} Berechneter Zahlenwert.
             */
            (a, b) => b.intersectionRatio - a.intersectionRatio,
          );  // Sichtbare Hauptbereiche nach ihrem Überdeckungsanteil sortiert.

        if (!visible.length) return;
        selectAll('.desktop-nav a').forEach(

          /**
           * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
           * @param {HTMLElement} link - Aktueller Navigations- oder Filterverweis.
           * @returns {void} Kein Rückgabewert.
           */
          link => {
            if (link.getAttribute('href') === `#${visible[0].target.id}`)
              link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
          },
        );
      },
      {
        rootMargin: '-15% 0px -45% 0px',
        threshold: [0, 0.2, 0.5],
      },
    );  // Sichtbarkeitsbeobachter der aktiven Hauptnavigation.

    selectAll('main > section').forEach(

      /**
       * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
       * @param {object} section - Beobachteter Hauptbereich der Seite.
       * @returns {unknown} Ergebnis der beschriebenen Operation.
       */
      section => navigationObserver.observe(section),
    );
  }
  document.addEventListener(
    'visibilitychange',

    /**
     * Verarbeitet das Ereignis „visibilitychange“ für die zugehörige Audio- oder Seiteninteraktion.
     * @returns {void} Kein Rückgabewert.
     */
    () => {
      document.body.classList.toggle('page-hidden', document.hidden);
      if (document.hidden) {
        stopVisualization();
        resetHeroLayers();
        interactionLayer.replaceChildren();
      } else {
        startVisualization();
        requestHeroFrame();
      }
    },
  );
  motionPreference.addEventListener(
    'change',

    /**
     * Verarbeitet das Ereignis „change“ für die zugehörige Audio- oder Seiteninteraktion.
     * @returns {void} Kein Rückgabewert.
     */
    () => {
      if (motionPreference.matches) {
        stopVisualization();
        resetHeroLayers();
        interactionLayer.replaceChildren();
        selectAll('.reveal.is-pending').forEach(

          /**
           * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
           * @param {HTMLElement} element - Beobachtetes Inhalts- oder Reveal-Element.
           * @returns {unknown} Ergebnis der beschriebenen Operation.
           */
          element => element.classList.remove('is-pending'),
        );
      } else {
        startVisualization();
        requestHeroFrame();
      }
    },
  );
}
