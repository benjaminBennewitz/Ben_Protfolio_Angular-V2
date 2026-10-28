/** @file automatic-hover.js — Gekapselter Teilbereich der SCOOP!-Studie. */

/**
 * Registriert einen gemeinsamen Sichtbarkeitsbeobachter für simulierten Hover.
 * @param {object} context - Explizite Abhängigkeiten dieses Bereichs.
 * @returns {object} Ergebnis der beschriebenen Operation.
 */
export function createAutomaticHover({ automaticHover, motion }) {
  // Registrierte Ziele mit Sichtbarkeit und Update-Callback.
  const automaticHoverTargets = new Map();
  // Beobachter der Sichtbarkeit für simulierten Hover.
  const automaticHoverObserver =
    'IntersectionObserver' in window
      ? new IntersectionObserver(

        /**
         * Liest oder aktualisiert den zugehörigen Interaktionszustand.
         * @param {unknown} entries - Eingabewert des Callbacks.
         * @returns {void} Kein Rückgabewert.
         */
        entries => {
          for (const entry of entries) {
            // Sichtbarkeit und Update-Callback des Hover-Ziels.
            const state = automaticHoverTargets.get(entry.target);
            if (state) {
              state.visible = entry.isIntersecting && entry.intersectionRatio >= 0.3;
              refreshAutomaticHover(entry.target);
            }
          }
        },
        {
          threshold: [0, 0.3],
        },
      )
      : null;

  /**
   * Aktualisiert den simulierten Hover-Zustand eines Elements.
   *
   * @param {HTMLElement} target - Beobachtetes Element.
   * @returns {void} Kein Rückgabewert.
   */
  function refreshAutomaticHover(target) {
    // Sichtbarkeit und Update-Callback des Hover-Ziels.
    const state = automaticHoverTargets.get(target);
    state?.update(automaticHover.matches && state.visible && !document.hidden && !motion.matches);
  }

  /**
   * Registriert ein Element für den sichtbarkeitsabhängigen Hover.
   *
   * @param {HTMLElement} target - Zu beobachtendes Element.
   * @param {Function} update - Callback für den Hover-Zustand.
   * @returns {void} Kein Rückgabewert.
   */
  function watchAutomaticHover(target, update) {
    automaticHoverTargets.set(target, {
      visible: false,
      update,
    });
    automaticHoverObserver?.observe(target);
    refreshAutomaticHover(target);
  }

  /**
   * Synchronisiert die registrierten Auto-Hover-Effekte.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function refreshAutomaticHovers() {
    for (const target of automaticHoverTargets.keys()) refreshAutomaticHover(target);
  }
  automaticHover.addEventListener('change', refreshAutomaticHovers);
  motion.addEventListener('change', refreshAutomaticHovers);
  document.addEventListener('visibilitychange', refreshAutomaticHovers);
  return {
    watchAutomaticHover,
    refreshAutomaticHovers,
  };
}
