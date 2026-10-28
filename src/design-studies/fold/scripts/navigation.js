/** @file navigation.js — Teilbereich der verbundenen FOLD-Papierexperience. */

import { clamp, ease } from './math.js';

/**
 * Kapselt Stationen, Touch-Rückmeldung, Scroll-Tweens und die Eingabeereignisse.
 * @param {object} context - Explizite Abhängigkeiten beziehungsweise aktueller Dateneintrag.
 * @returns {object} Ergebnis der beschriebenen Operation.
 */
export function createNavigation({ journey, mobileQuery, reduced }) {

  const guide = document.querySelector('#touch-guide');                 // Container der mobilen Wischrückmeldung.
  const guideFill = document.querySelector('#touch-guide-fill');        // Füllstandsanzeige des mobilen Gestenfortschritts.
  const guideLabel = document.querySelector('#touch-guide-label');      // Statusbeschriftung der mobilen Wischführung.
  const guidePercent = document.querySelector('#touch-guide-percent');  // Prozent- oder Bereitschaftsanzeige der mobilen Wischführung.
  const guideStep = document.querySelector('#touch-guide-step');        // Anzeige der aktuellen mobilen Station.
  const guideNext = document.querySelector('#touch-guide-next');        // Hinweis auf die nächste mobile Aktion.
  const mobile = {
    index: 0,
    active: false,
    dragging: false,
    preview: null,
    animating: false,
    progress: 0,
  };                                                                    // Privater Zustand der mobilen Stationen, Vorschau und Animation.

  /**
   * Zeigt den mobilen Gestenfortschritt unmittelbar vor dem eigentlichen Stationswechsel.
   * @param {number} progress - Gemeinsamer normierter Falt- oder Gestenfortschritt.
   * @param {string} label - Eingabewert „label“.
   * @returns {void} Kein Rückgabewert.
   */
  function touchFeedback(progress, label) {
    if (!mobileQuery.matches) return;

    const p = clamp(progress);  // Normierter Fortschritt des aktuellen Übergangs.

    mobile.progress = p;
    guideFill.style.transform = `scaleX(${p})`;
    guidePercent.textContent = p > 0 ? `${Math.round(p * 100)}%` : 'READY';
    guideLabel.textContent = label;
    guide.classList.toggle('touch-guide--engaged', p > 0.02);
    guideStep.textContent =
      mobile.index >= 6 ? '07 / UNFOLDED' : `${String(mobile.index + 1).padStart(2, '0')} / 06`;
    guideNext.textContent = mobile.index === 6 ? 'SWIPE FOR FOOTER ↓' : 'NEXT PERSPECTIVE ↓';
  }

  /**
   * Ermittelt den normierten Fortschritt innerhalb der realen Sticky-Reise.
   * @returns {number} Berechneter Zahlenwert.
   */
  function measure() {

    const r = journey.getBoundingClientRect();  // Aktuelles Begrenzungsrechteck der Sticky-Reise.

    return clamp(-r.top / Math.max(1, journey.offsetHeight - innerHeight));
  }

  /**
   * Berechnet die normierte Ruheposition einer Würfelseite oder des Netzes.
   * @param {number} index - Kennung der gewünschten Station beziehungsweise Index der Papierfläche.
   * @returns {number} Berechneter Zahlenwert.
   */
  function stopFraction(index) {
    return index === 6 ? 1 : (index * 1.5 + 0.22) / 9.75;
  }

  /**
   * Übersetzt eine Station in ihre absolute Dokument-Scrollposition.
   * @param {number} index - Kennung der gewünschten Station beziehungsweise Index der Papierfläche.
   * @returns {number} Berechneter Zahlenwert.
   */
  function stopY(index) {
    return (
      journey.getBoundingClientRect().top +
      scrollY +
      (journey.offsetHeight - innerHeight) * stopFraction(index)
    );
  }

  /**
   * Ermittelt die aktuelle Würfelseite oder die Netzstation aus dem Fortschritt.
   * @param {number} t - Normierter lokaler Interpolationswert.
   * @returns {number} Berechneter Zahlenwert.
   */
  function chapterAt(t) {

    const phase = t * 9.75;  // Gemeinsame Zeitachse für sechs Ansichten und das Öffnen des Netzes.

    return phase >= 9 ? 6 : Math.min(5, Math.floor(phase / 1.5));
  }

  /**
   * Interpoliert die Scrollposition mit einer eigenen Dauer und geglätteten Endpunkten.
   * @param {number} from - Absolute Scrollposition am Anfang des Tweens.
   * @param {number} to - Absolute Scrollposition am Ende des Tweens.
   * @param {number} duration - Dauer des Scroll-Tweens in Millisekunden.
   * @returns {Promise<void>} Ergebnis der beschriebenen Operation.
   */
  function tweenScroll(from, to, duration) {
    return new Promise(

      /**
       * Führt die Scroll-Interpolation aus und meldet ihren Abschluss.
       * @param {Function} resolve - Meldet den Abschluss der laufenden Scroll-Interpolation.
       * @returns {void} Kein Rückgabewert.
       */
      resolve => {
        if (reduced || duration <= 0) {
          scrollTo(0, to);
          resolve();
          return;
        }

        const start = performance.now();  // Zeitstempel am Beginn des Scroll-Tweens.

        /**
         * Interpoliert die Scrollposition bis zum Ende des aktuellen Tweens.
         * @param {number} now - Aktueller Zeitstempel in Millisekunden.
         * @returns {void} Kein Rückgabewert.
         */
        function step(now) {

          const progress = clamp((now - start) / duration);  // Gemeinsamer normierter Falt- oder Gestenfortschritt.
          const eased = ease(progress);                      // Geglätteter Fortschritt des laufenden Scroll-Tweens.

          scrollTo(0, from + (to - from) * eased);
          if (progress < 1) requestAnimationFrame(step);
          else {
            scrollTo(0, to);
            resolve();
          }
        }
        requestAnimationFrame(step);
      },
    );
  }

  /**
   * Beendet die mobile Sticky-Reise und scrollt zum regulären Footer.
   * @returns {Promise<void>} Ergebnis der beschriebenen Operation.
   */
  async function moveToFooter() {
    touchFeedback(1, 'TO THE FOOTER ↓');

    const footer = document.querySelector('footer#end');                                             // Regulärer Footer außerhalb der Sticky-Papierreise.
    const footerY = footer ? footer.getBoundingClientRect().top + scrollY : stopY(6) + innerHeight;  // Absolute Scrollposition am Beginn des Footers.

    await tweenScroll(scrollY, footerY, 900);
    mobile.index = 7;
  }

  /**
   * Trennt den letzten mobilen Flip vom längeren Öffnen des verbundenen Netzes.
   * @returns {Promise<void>} Ergebnis der beschriebenen Operation.
   */
  async function revealMobileNet() {
    mobile.index = 6;
    touchFeedback(0.35, 'PREPARING THE UNFOLD…');

    const revealStart =
      journey.getBoundingClientRect().top +
      scrollY +
      (journey.offsetHeight - innerHeight) * (9 / 9.75);  // Absolute Scrollposition am Beginn der Netzentfaltung.

    await tweenScroll(scrollY, revealStart, 550);
    touchFeedback(0.65, 'UNFOLDING…');
    await tweenScroll(scrollY, stopY(6), 2400);
  }

  /**
   * Führt den mobilen Scroll-Tween zur gewünschten Würfelseite aus.
   * @param {object} target - Auf gültige Grenzen beschränkte Zielstation.
   * @param {object} fromIndex - Station vor Beginn des aktuellen mobilen Wechsels.
   * @returns {Promise<void>} Ergebnis der beschriebenen Operation.
   */
  async function moveToChapter(target, fromIndex) {
    mobile.index = target;
    touchFeedback(1, target === 6 ? 'FOLDING BACK…' : 'FLIPPING…');
    await tweenScroll(scrollY, stopY(target), target === 5 && fromIndex === 6 ? 1100 : 850);
  }

  /**
   * Koordiniert genau einen mobilen Stationswechsel einschließlich Scroll-Verhalten und Statusrücksetzung.
   * @param {number} index - Kennung der gewünschten Station beziehungsweise Index der Papierfläche.
   * @returns {Promise<void>} Ergebnis der beschriebenen Operation.
   */
  async function animateMobileStop(index) {

    const target = clamp(index, 0, 7);                                  // Auf gültige Grenzen beschränkte Zielstation.

    if (mobile.animating || target === mobile.index) return;
    mobile.animating = true;
    mobile.preview = null;

    const fromIndex = mobile.index;                                     // Station vor Beginn des aktuellen mobilen Wechsels.
    const oldBehavior = document.documentElement.style.scrollBehavior;  // Vor dem Scroll-Tween gesetztes Inline-Scrollverhalten.

    document.documentElement.style.scrollBehavior = 'auto';
    try {
      if (target === 7) {
        await moveToFooter();
      } else if (target === 6 && fromIndex === 5) {
        await revealMobileNet();
      } else {
        await moveToChapter(target, fromIndex);
      }
    } finally {
      document.documentElement.style.scrollBehavior = oldBehavior;
      mobile.animating = false;
      touchFeedback(0, mobile.index === 6 ? 'SWIPE FOR FOOTER ↓' : 'SWIPE TO FLIP');
    }
  }

  /**
   * Navigiert abhängig vom Eingabegerät zur gewünschten Perspektive.
   * @param {number} index - Kennung der gewünschten Station beziehungsweise Index der Papierfläche.
   * @returns {void} Kein Rückgabewert.
   */
  function go(index) {
    if (mobileQuery.matches) {
      animateMobileStop(index);
    } else {
      scrollTo({
        top: stopY(index),
        behavior: reduced ? 'instant' : 'smooth',
      });
    }
  }

  let gesture = null;                                                   // Aktive Touch-Geste mit Ausgangspunkt und Erkennungszustand.

  /**
   * Prüft, ob die Sticky-Reise den sichtbaren Viewport noch vollständig umfasst.
   * @returns {boolean} Ergebnis der beschriebenen Operation.
   */
  function withinJourney() {

    const rect = journey.getBoundingClientRect();  // Aktuelles Begrenzungsrechteck der Sticky-Reise.

    return rect.top <= 1 && rect.bottom >= innerHeight - 1;
  }
  document.addEventListener(
    'touchstart',

    /**
     * Verarbeitet das Ereignis „touchstart“ für die Papierinteraktion.
     * @param {object} event - Eingabewert „event“.
     * @returns {void} Kein Rückgabewert.
     */
    event => {
      if (
        !mobileQuery.matches ||
        !withinJourney() ||
        mobile.animating ||
        event.touches.length !== 1
      )
        return;
      if (event.target.closest('header,footer,#touch-guide,a,button')) return;

      const touch = event.touches[0];  // Erster Berührungspunkt der laufenden Geste.

      gesture = {
        y: touch.clientY,
        x: touch.clientX,
        dy: 0,
        startedAt: performance.now(),
        captured: false,
      };
      mobile.dragging = true;
    },
    {
      passive: true,
      capture: true,
    },
  );
  document.addEventListener(
    'touchmove',

    /**
     * Verarbeitet das Ereignis „touchmove“ für die Papierinteraktion.
     * @param {object} event - Eingabewert „event“.
     * @returns {void} Kein Rückgabewert.
     */
    event => {
      if (!gesture || !mobileQuery.matches) return;
      if (event.touches.length !== 1) {
        gesture = null;
        mobile.dragging = false;
        return;
      }

      const touch = event.touches[0];                                                          // Erster Berührungspunkt der laufenden Geste.
      const dy = touch.clientY - gesture.y;                                                    // Vertikaler Versatz der aktuellen Wischbewegung.
      const dx = touch.clientX - gesture.x;                                                    // Horizontaler Versatz der aktuellen Wischbewegung.

      if (!gesture.captured && Math.abs(dy) < 9) return;
      if (!gesture.captured && Math.abs(dx) > Math.abs(dy) * 1.4) {
        gesture = null;
        mobile.dragging = false;
        return;
      }
      gesture.captured = true;
      event.preventDefault();
      gesture.dy = dy;

      const dir = dy < 0 ? 1 : -1;                                                             // Achsenrichtung des Scharniers beziehungsweise erkannte Wischrichtung.
      const canMove = mobile.index + dir >= 0 && mobile.index + dir <= 7;                      // Die erkannte Wischrichtung führt zu einer gültigen Station.
      const progress = canMove ? clamp(Math.abs(dy) / Math.max(100, innerHeight * 0.22)) : 0;  // Gemeinsamer normierter Falt- oder Gestenfortschritt.

      touchFeedback(
        progress,
        canMove
          ? mobile.index === 6 && dir > 0
            ? 'TO THE FOOTER ↓'
            : dir > 0
              ? 'REVEALING NEXT SIDE'
              : 'RETURNING TO PREVIOUS SIDE'
          : 'END OF EXPERIENCE',
      );
    },
    {
      passive: false,
      capture: true,
    },
  );

  /**
   * Wertet eine abgeschlossene Wischgeste aus und wechselt höchstens eine Station.
   * @param {Event} event - Eingabewert „event“.
   * @returns {void} Kein Rückgabewert.
   */
  function finishGesture(event) {
    if (!gesture) return;

    const dy = gesture.dy;              // Vertikaler Versatz der aktuellen Wischbewegung.
    const captured = gesture.captured;  // Die Geste wurde als vertikale Wischbewegung übernommen.

    gesture = null;
    mobile.dragging = false;
    if (!captured) {
      touchFeedback(0, 'SWIPE TO FLIP');
      return;
    }

    const dir = dy < 0 ? 1 : -1;        // Achsenrichtung des Scharniers beziehungsweise erkannte Wischrichtung.

    if (Math.abs(dy) >= 42 && mobile.index + dir >= 0 && mobile.index + dir <= 7) {
      animateMobileStop(mobile.index + dir);
    } else {
      touchFeedback(0, 'SWIPE TO FLIP');
    }
  }
  document.addEventListener('touchend', finishGesture, {
    passive: true,
    capture: true,
  });
  document.addEventListener(
    'touchcancel',

    /**
     * Verarbeitet das Ereignis „touchcancel“ für die Papierinteraktion.
     * @returns {void} Kein Rückgabewert.
     */
    () => {
      gesture = null;
      mobile.dragging = false;
      touchFeedback(0, 'SWIPE TO FLIP');
    },
    {
      passive: true,
      capture: true,
    },
  );

  let lastScrollSync = 0;                                               // Zeitstempel der letzten mobilen Kapitel-Synchronisierung.

  addEventListener(
    'scroll',

    /**
     * Synchronisiert die Papierdarstellung mit dem aktuellen Seitenzustand.
     * @returns {void} Kein Rückgabewert.
     */
    () => {
      if (!mobileQuery.matches || mobile.animating || mobile.dragging) return;

      const now = performance.now();  // Aktueller Zeitstempel in Millisekunden.

      if (now - lastScrollSync < 80) return;
      lastScrollSync = now;
      mobile.index = withinJourney() ? chapterAt(measure()) : mobile.index;
      touchFeedback(0, mobile.index === 6 ? 'SWIPE FOR FOOTER ↓' : 'SWIPE TO FLIP');
    },
    {
      passive: true,
    },
  );
  touchFeedback(0, 'SWIPE TO FLIP');
  document.addEventListener(
    'click',

    /**
     * Verarbeitet das Ereignis „click“ für die Papierinteraktion.
     * @param {object} event - Eingabewert „event“.
     * @returns {void} Kein Rückgabewert.
     */
    event => {

      const button = event.target.closest('[data-next],[data-go]');  // Aktuell betätigte Navigationstaste oder Rücksprungfläche.

      if (!button) return;
      if (!event.target.closest('button,a') && String(getSelection()?.toString() || '').trim())
        return;
      event.preventDefault();
      go(Number(button.dataset.next ?? button.dataset.go));
    },
  );
  return {
    mobile,
    measure,
    go,
  };
}
