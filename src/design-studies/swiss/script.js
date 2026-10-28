/**
 * @file script.js
 * @description Steuert Reveals, Bildslider, mobile Navigation und Scroll-Interaktionen der SWISS-Designstudie.
 */

/* ===========================================================================
   INHALTSVERZEICHNIS

   01   Konfiguration
   02   Scroll-Reveals
   03   Hero-Slider
   04   Mobile Navigation
   05   Scroll-to-Top
   06   Platzhalterlinks und Initialisierung
   ========================================================================== */

(() => {
  'use strict';

  /* ===========================================================================
     01   Konfiguration
     ========================================================================== */

  /**
   * Gibt an, ob der Nutzer reduzierte Animationen bevorzugt.
   *
   * @type {boolean}
   */
  const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===========================================================================
     02   Scroll-Reveals
     ========================================================================== */

  /**
   * Blendet sichtbare Reveal-Elemente ein und beendet deren Beobachtung.
   *
   * @param {IntersectionObserverEntry[]} entries - Beobachtete Sichtbarkeitsänderungen.
   * @param {IntersectionObserver} observer - Zugehöriger IntersectionObserver.
   * @returns {void} Kein Rückgabewert.
   */
  function revealVisibleElements(entries, observer) {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }

  /**
   * Initialisiert die Scroll-Reveals mit Rücksicht auf reduzierte Bewegung.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function initReveals() {
    const elements = [...document.querySelectorAll('[data-reveal]')];

    if (motionReduced || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(revealVisibleElements, {
      threshold: 0.12,
      rootMargin: '0px 0px -8% 0px',
    });
    elements.forEach((element) => observer.observe(element));
  }

  /* ===========================================================================
     03   Hero-Slider
     ========================================================================== */

  /**
   * Aktiviert das gewünschte Bild und aktualisiert die zugehörigen Metadaten.
   *
   * @param {SliderState} state - Zustand des Hero-Sliders.
   * @param {number} nextIndex - Gewünschter Bildindex.
   * @returns {void} Kein Rückgabewert.
   */
  function renderSlide(state, nextIndex) {
    state.activeIndex = (nextIndex + state.slides.length) % state.slides.length;
    state.slides.forEach((slide, index) => {
      slide.classList.toggle('is-active', index === state.activeIndex);
    });

    const active = state.slides[state.activeIndex];
    state.category.textContent = active.dataset.category || '';
    state.meta.textContent = active.dataset.meta || '';
    state.indexLabel.textContent = active.dataset.index || '';
  }

  /**
   * Beendet das automatische Weiterschalten des Hero-Sliders.
   *
   * @param {SliderState} state - Zustand des Hero-Sliders.
   * @returns {void} Kein Rückgabewert.
   */
  function stopSliderAutoplay(state) {
    if (state.autoplayId) window.clearInterval(state.autoplayId);
    state.autoplayId = 0;
  }

  /**
   * Startet das automatische Weiterschalten, sofern Bewegung erlaubt ist.
   *
   * @param {SliderState} state - Zustand des Hero-Sliders.
   * @returns {void} Kein Rückgabewert.
   */
  function startSliderAutoplay(state) {
    if (motionReduced) return;
    stopSliderAutoplay(state);
    state.autoplayId = window.setInterval(() => {
      renderSlide(state, state.activeIndex + 1);
    }, 6200);
  }

  /**
   * Wechselt das Slider-Bild und setzt das Autoplay-Intervall zurück.
   *
   * @param {SliderState} state - Zustand des Hero-Sliders.
   * @param {number} direction - Wechselrichtung (-1 oder 1).
   * @returns {void} Kein Rückgabewert.
   */
  function changeSlide(state, direction) {
    renderSlide(state, state.activeIndex + direction);
    startSliderAutoplay(state);
  }

  /**
   * Verknüpft Slider-Steuerung, Hover- und Fokuszustände mit dem Autoplay.
   *
   * @param {HTMLElement} slider - Container des Hero-Sliders.
   * @param {SliderState} state - Zustand des Hero-Sliders.
   * @returns {void} Kein Rückgabewert.
   */
  function bindSliderEvents(slider, state) {
    slider.querySelector('[data-slider-prev]')?.addEventListener('click', () => changeSlide(state, -1));
    slider.querySelector('[data-slider-next]')?.addEventListener('click', () => changeSlide(state, 1));
    slider.addEventListener('mouseenter', () => stopSliderAutoplay(state));
    slider.addEventListener('mouseleave', () => startSliderAutoplay(state));
    slider.addEventListener('focusin', () => stopSliderAutoplay(state));
    slider.addEventListener('focusout', () => startSliderAutoplay(state));
  }

  /**
   * @typedef {Object} SliderState
   * @property {HTMLElement[]} slides - Bilder des Sliders.
   * @property {HTMLElement} category - Anzeige der Bildkategorie.
   * @property {HTMLElement} meta - Anzeige der Bildinformationen.
   * @property {HTMLElement} indexLabel - Anzeige des Bildindexes.
   * @property {number} activeIndex - Index des aktuellen Bildes.
   * @property {number} autoplayId - ID des laufenden Intervalls.
   */

  /**
   * Initialisiert den Hero-Slider und seine automatische Bildrotation.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function initSlider() {
    const slider = document.querySelector('[data-slider]');
    if (!slider) return;

    /** @type {SliderState} */
    const state = {
      slides: [...slider.querySelectorAll('[data-slide]')],
      category: slider.querySelector('[data-slider-category]'),
      meta: slider.querySelector('[data-slider-meta]'),
      indexLabel: slider.querySelector('[data-slider-index]'),
      activeIndex: 0,
      autoplayId: 0,
    };

    bindSliderEvents(slider, state);
    startSliderAutoplay(state);
  }

  /* ===========================================================================
     04   Mobile Navigation
     ========================================================================== */

  /**
   * Aktualisiert Sichtbarkeit und ARIA-Zustände des mobilen Menüs.
   *
   * @param {MenuState} state - Elemente der mobilen Navigation.
   * @param {boolean} isOpen - Gewünschter Öffnungszustand.
   * @returns {void} Kein Rückgabewert.
   */
  function setMenuOpen(state, isOpen) {
    if (!state.toggle || !state.menu) return;

    state.toggle.setAttribute('aria-expanded', String(isOpen));
    state.toggle.setAttribute('aria-label', isOpen ? 'Menü schließen' : 'Menü öffnen');
    state.menu.classList.toggle('is-open', isOpen);
    state.menu.setAttribute('aria-hidden', String(!isOpen));
    document.documentElement.classList.toggle('menu-open', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
  }

  /**
   * Wechselt den Öffnungszustand des mobilen Menüs.
   *
   * @param {MenuState} state - Elemente der mobilen Navigation.
   * @returns {void} Kein Rückgabewert.
   */
  function toggleMenu(state) {
    const isOpen = state.toggle.getAttribute('aria-expanded') === 'true';
    setMenuOpen(state, !isOpen);
  }

  /**
   * Markiert den Navigationslink zum aktuell sichtbaren Abschnitt.
   *
   * @param {MenuState} state - Elemente der mobilen Navigation.
   * @param {string} id - ID des aktiven Abschnitts.
   * @returns {void} Kein Rückgabewert.
   */
  function setActiveMenuLink(state, id) {
    state.links.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  /**
   * Bestimmt aus sichtbaren Abschnitten das aktive Navigationsziel.
   *
   * @param {IntersectionObserverEntry[]} entries - Sichtbarkeitsänderungen der Abschnitte.
   * @param {MenuState} state - Elemente der mobilen Navigation.
   * @returns {void} Kein Rückgabewert.
   */
  function syncActiveMenuLink(entries, state) {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible?.target?.id) setActiveMenuLink(state, visible.target.id);
  }

  /**
   * Beobachtet Seitenabschnitte zur Hervorhebung des aktiven Menüpunkts.
   *
   * @param {MenuState} state - Elemente der mobilen Navigation.
   * @returns {void} Kein Rückgabewert.
   */
  function observeMenuSections(state) {
    if (!('IntersectionObserver' in window) || !state.links.length) return;

    const targets = state.links
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    const observer = new IntersectionObserver((entries) => syncActiveMenuLink(entries, state), {
      rootMargin: '-18% 0px -62% 0px',
      threshold: [0, 0.15, 0.4, 0.7],
    });
    targets.forEach((target) => observer.observe(target));
    setActiveMenuLink(state, 'top');
  }

  /**
   * Verknüpft Menüschalter, Abschnittslinks und Escape-Taste mit dem Menü.
   *
   * @param {MenuState} state - Elemente der mobilen Navigation.
   * @returns {void} Kein Rückgabewert.
   */
  function bindMenuEvents(state) {
    state.toggle?.addEventListener('click', () => toggleMenu(state));
    state.links.forEach((link) => {
      link.addEventListener('click', () => setMenuOpen(state, false));
    });
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setMenuOpen(state, false);
    });
  }

  /**
   * @typedef {Object} MenuState
   * @property {HTMLElement|null} toggle - Schaltfläche der mobilen Navigation.
   * @property {HTMLElement|null} menu - Navigationscontainer.
   * @property {HTMLAnchorElement[]} links - Interne Navigationslinks.
   */

  /**
   * Initialisiert die mobile Navigation und die aktive Abschnittsanzeige.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function initMobileMenu() {
    const menu = document.querySelector('.mobile-menu');

    /** @type {MenuState} */
    const state = {
      toggle: document.querySelector('.menu-toggle'),
      menu,
      links: [...(menu?.querySelectorAll('a[href^="#"]') || [])],
    };

    bindMenuEvents(state);
    observeMenuSections(state);
  }

  /* ===========================================================================
     05   Scroll-to-Top
     ========================================================================== */

  /**
   * Aktualisiert die Sichtbarkeit der Zurück-nach-oben-Schaltfläche.
   *
   * @param {HTMLElement|null} button - Schaltfläche am Seitenrand.
   * @returns {void} Kein Rückgabewert.
   */
  function syncScrollTopButton(button) {
    button?.classList.toggle('is-visible', window.scrollY > 700);
  }

  /**
   * Scrollt unter Berücksichtigung der Bewegungseinstellungen zum Seitenanfang.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: motionReduced ? 'auto' : 'smooth' });
  }

  /**
   * Initialisiert Sichtbarkeitssteuerung und Bedienung des Scroll-Buttons.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function initScrollTopButton() {
    const button = document.querySelector('[data-scroll-top]');
    window.addEventListener('scroll', () => syncScrollTopButton(button), { passive: true });
    syncScrollTopButton(button);
    button?.addEventListener('click', scrollToTop);
  }

  /* ===========================================================================
     06   Platzhalterlinks und Initialisierung
     ========================================================================== */

  /**
   * Verhindert die Navigation über noch nicht hinterlegte Platzhalterlinks.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function initPlaceholderLinks() {
    document.querySelectorAll('[data-placeholder-link]').forEach((link) => {
      link.addEventListener('click', (event) => event.preventDefault());
    });
  }

  initReveals();
  initSlider();
  initMobileMenu();
  initScrollTopButton();
  initPlaceholderLinks();
})();
