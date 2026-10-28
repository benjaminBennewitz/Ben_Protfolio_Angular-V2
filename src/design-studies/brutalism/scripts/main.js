/** @file main.js — RAW/FORM-Navigation, Demo-Dialog und einmalige Reveals. */
'use strict';

/**
 * Verknüpft die unabhängigen Interaktionen nach dem Einlesen des HTML-Dokuments.
 * @returns {void} Kein Rückgabewert.
 */
(function initializeStudy() {
  initDemoActions();
  initNavigation();
  initCookieDemo();
  initScrollTop();
  initReveals();

  /**
   * Verhindert echte Navigation und Übermittlung bei ausdrücklich gekennzeichneten Demo-Aktionen.
   * @returns {void} Kein Rückgabewert.
   */
  function initDemoActions() {

    const links = document.querySelectorAll('.social-placeholder');  // Fiktive Social-Verweise ohne externe Ziele.
    const form = document.querySelector('.signup');                  // Fiktive Social-Verweise ohne externe Ziele.

    for (const link of links) link.addEventListener('click', preventDemoAction);
    form?.addEventListener('submit', preventDemoAction);
  }

  /**
   * Unterbindet ausschließlich die Standardaktion eines Demo-Verweises oder Demo-Formulars.
   * @param {Event} event - Vom Benutzer ausgelöste Demo-Aktion.
   * @returns {void} Kein Rückgabewert.
   */
  function preventDemoAction(event) {
    event.preventDefault();
  }

  /**
   * Kapselt den Zustand des mobilen Menüs einschließlich Escape und Desktop-Rücksetzung.
   * @returns {void} Kein Rückgabewert.
   */
  function initNavigation() {

    const menuToggle = document.querySelector('#menu-toggle');  // Schaltfläche der mobilen Navigation.
    const mobileNav = document.querySelector('#mobile-nav');    // Schaltfläche der mobilen Navigation.

    if (!menuToggle || !mobileNav) return;
    menuToggle.addEventListener('click', toggleMenu);
    mobileNav.addEventListener('click', closeAfterNavigation);
    document.addEventListener('keydown', closeOnEscape);
    window.addEventListener('resize', closeOnDesktop, {
      passive: true,
    });

    /**
     * Synchronisiert Menüanzeige, ARIA-Attribute und Scroll-Lock.
     * @param {boolean} open - Gewünschter geöffneter Menüzustand.
     * @returns {void} Kein Rückgabewert.
     */
    function setMenuState(open) {
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
      mobileNav.setAttribute('aria-hidden', String(!open));
      mobileNav.classList.toggle('is-open', open);
      document.documentElement.classList.toggle('menu-open', open);
    }

    /**
     * Wechselt zwischen geöffnetem und geschlossenem mobilen Menü.
     * @returns {void} Kein Rückgabewert.
     */
    function toggleMenu() {
      setMenuState(menuToggle.getAttribute('aria-expanded') !== 'true');
    }

    /**
     * Schließt das Menü nach Ankernavigation oder einem Klick auf seine freie Fläche.
     * @param {MouseEvent} event - Klick innerhalb der mobilen Navigation.
     * @returns {void} Kein Rückgabewert.
     */
    function closeAfterNavigation(event) {
      if (event.target.closest('a') || event.target === mobileNav) setMenuState(false);
    }

    /**
     * Schließt das mobile Menü mit Escape.
     * @param {KeyboardEvent} event - Aktuelle Tastatureingabe.
     * @returns {void} Kein Rückgabewert.
     */
    function closeOnEscape(event) {
      if (event.key === 'Escape') setMenuState(false);
    }

    /**
     * Setzt das mobile Menü oberhalb seines bisherigen Breakpoints zurück.
     * @returns {void} Kein Rückgabewert.
     */
    function closeOnDesktop() {
      if (window.innerWidth > 1100) setMenuState(false);
    }
  }

  /**
   * Bindet den fiktiven Cookie-Hinweis mit sitzungsbezogener Ausblendung ein.
   * @returns {void} Kein Rückgabewert.
   */
  function initCookieDemo() {

    const cookieDemo = document.querySelector('#cookie-demo');                // Ausdrücklich als Demo gekennzeichneter Hinweis.
    const cookieButtons = document.querySelectorAll('[data-cookie-choice]');  // Ausdrücklich als Demo gekennzeichneter Hinweis.

    if (cookieDemo && !isCookieDismissed()) requestAnimationFrame(showCookieDemo);
    for (const button of cookieButtons) button.addEventListener('click', dismissCookieDemo);

    /**
     * Blendet den Cookie-Hinweis nach dem ersten Layout ein.
     * @returns {void} Kein Rückgabewert.
     */
    function showCookieDemo() {
      cookieDemo.classList.add('is-visible');
      document.body.classList.add('cookie-open');
    }

    /**
     * Blendet den Demo-Hinweis auch bei gesperrtem Sitzungsspeicher aus.
     * @returns {void} Kein Rückgabewert.
     */
    function dismissCookieDemo() {
      saveCookieDismissal();
      cookieDemo?.classList.remove('is-visible');
      document.body.classList.remove('cookie-open');
    }
  }

  /**
   * Liest die bisherige Demo-Entscheidung ohne andere Seitenbereiche bei Speicherfehlern zu blockieren.
   * @returns {boolean} Der Hinweis wurde in dieser Sitzung bereits ausgeblendet.
   */
  function isCookieDismissed() {
    try {
      return sessionStorage.getItem('rawform-cookie-demo') === 'dismissed';
    } catch {
      return false;
    }
  }

  /**
   * Merkt die Ausblendung, sofern der Browser Sitzungsspeicher zulässt.
   * @returns {void} Kein Rückgabewert.
   */
  function saveCookieDismissal() {
    try {
      sessionStorage.setItem('rawform-cookie-demo', 'dismissed');
    } catch {
      // Die Demo bleibt ohne gespeicherte Entscheidung bedienbar.
    }
  }

  /**
   * Bindet die sichtbarkeitsabhängige Rückkehr an den Dokumentanfang ein.
   * @returns {void} Kein Rückgabewert.
   */
  function initScrollTop() {

    const scrollTopButton = document.querySelector('#scroll-top');  // Rücksprung-Schaltfläche ab 520 Pixeln Scrollhöhe.

    window.addEventListener('scroll', syncScrollTop, {
      passive: true,
    });
    syncScrollTop();
    scrollTopButton?.addEventListener('click', scrollToStart);

    /**
     * Synchronisiert die Sichtbarkeit der Rücksprung-Schaltfläche.
     * @returns {void} Kein Rückgabewert.
     */
    function syncScrollTop() {
      scrollTopButton?.classList.toggle('is-visible', window.scrollY > 520);
    }
  }

  /**
   * Führt die bisherige sanfte Rückkehr zum Dokumentanfang aus.
   * @returns {void} Kein Rückgabewert.
   */
  function scrollToStart() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  /**
   * Registriert einmalige Text- und Bild-Reveals nur bei erlaubter Bewegung und vorhandenem Observer.
   * @returns {void} Kein Rückgabewert.
   */
  function initReveals() {

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;  // Beim Start geltende Präferenz für reduzierte Bewegung.

    if (reduceMotion || !('IntersectionObserver' in window)) return;
    prepareRevealTargets();

    const observer = new IntersectionObserver(revealEntries, {
      threshold: 0.16,
      rootMargin: '0px 0px -8% 0px',
    });                                                                                  // Gemeinsamer Beobachter der vorbereiteten Inhalte.

    for (const element of document.querySelectorAll('.reveal, .image-reveal')) observer.observe(element);
  }

  /**
   * Ergänzt dieselben Reveal-Klassen und Verzögerungen für Text und Bilder wie bisher.
   * @returns {void} Kein Rückgabewert.
   */
  function prepareRevealTargets() {

    const textSelector =
      '.eyebrow, .display, .panel h3, .panel li, .manifesto-right p, .ticket-card, .newsletter-copy > p, .signup';  // Unveränderte Auswahl der Text- und Karten-Reveals.
    const imageSelector = '.hero-media, .intro-media, .panel-image, .location-media, .newsletter-media';            // Unveränderte Auswahl der Text- und Karten-Reveals.
    const targets = [...document.querySelectorAll(textSelector)];                                                   // Unveränderte Auswahl der Bild-Reveals.

    for (const [index, element] of targets.entries()) {
      element.classList.add('reveal');
      element.style.setProperty('--reveal-delay', `${Math.min(index % 5, 4) * 55}ms`);
    }
    for (const element of document.querySelectorAll(imageSelector)) element.classList.add('image-reveal');
  }

  /**
   * Gibt eingetretene Inhalte frei und beendet ihre weitere Beobachtung.
   * @param {IntersectionObserverEntry[]} entries - Aktuelle Sichtbarkeitsänderungen.
   * @param {IntersectionObserver} observer - Gemeinsamer Reveal-Beobachter.
   * @returns {void} Kein Rückgabewert.
   */
  function revealEntries(entries, observer) {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }
})();
