/** @file founder-wave.js — Gekapselter Teilbereich der SCOOP!-Studie. */

import { updateArms, resetFounderArms } from './arm-motion.js';

/**
 * Registriert Hover-, Fokus- und Touch-Reaktionen der Portrait-Figuren.
 * @param {object} context - Explizite Abhängigkeiten dieses Bereichs.
 * @returns {void} Kein Rückgabewert.
 */
export function initFounderWaves({
  $,
  $$,
  motion,
  automaticHover,
  watchAutomaticHover,
  requestFrame,
  founderActors,
}) {
  $$('.founder-wave').forEach(

    /**
     * Verarbeitet den aktuellen Eintrag der zugehörigen DOM- oder Datenliste.
     * @param {unknown} button - Zur Interaktion gehörende Schaltfläche.
     * @returns {void} Kein Rückgabewert.
     */
    button => {
      // Animierbarer Zustand einer SVG-Figur.
      const actor = {
        arms: [],
        active: false,
      };
      // Die Maus befindet sich über der Interaktion.
      let hovering = false;
      // Die Interaktion besitzt Tastaturfokus.
      let focused = false;
      // Touch-Klick hält die Wellenbewegung aktiv.
      let tapped = false;
      // Simulierter Hover ist aktiv.
      let automaticActive = false;
      // Timeout zum Beenden der Touch-Wellenbewegung.
      let tapTimer = 0;
      $$('[data-founder-arm]', button).forEach(

        /**
         * Verarbeitet den aktuellen Eintrag der zugehörigen DOM- oder Datenliste.
         * @param {unknown} path - Aktuell bearbeitete SVG-Pfadkontur.
         * @returns {void} Kein Rückgabewert.
         */
        path => {
          // Gemessene Gesamtlänge des SVG-Pfads.
          const length = path.getTotalLength();
          // Stützpunkte für die aktuelle SVG-Geometrie.
          const points = [0, 1 / 3, 2 / 3, 1].map(

            /**
             * Berechnet den Zielwert für den aktuellen Listeneintrag.
             * @param {unknown} t - Normierter Interpolationswert.
             * @returns {unknown} Ergebnis der Verarbeitung.
             */
            t => {
              // Berechneter Punkt oder normierter Animationsfortschritt.
              const p = path.getPointAtLength(t * length);
              return {
                x: p.x,
                y: p.y,
              };
            },
          );
          // Zielrechteck beziehungsweise letzter Armanker.
          const end = points[3];
          // Arm-Abtastpunkt unmittelbar vor der Hand.
          const near = path.getPointAtLength(length - 1);
          actor.arms.push({
            path,
            hand: $('[data-founder-hand]', path.parentElement),
            points,
            original: path.getAttribute('d'),
            phase: actor.arms.length * 2.4,
            angle: Math.atan2(end.y - near.y, end.x - near.x),
          });
        },
      );

      /**
       * Steuert die Wellenanimation anhand von Hover, Fokus und Touch.
       *
       * @returns {void} Kein Rückgabewert.
       */
      function syncWave() {
        actor.active =
          (hovering || focused || tapped || automaticActive) &&
          !document.hidden &&
          (!automaticHover.matches || automaticActive || hovering);
        if (!actor.active || motion.matches) resetFounderArms(actor);
        else requestFrame();
      }
      button.addEventListener(
        'pointerenter',

        /**
         * Verarbeitet das Ereignis „pointerenter“ für diese Interaktion.
         * @param {Event} event - Eingabewert des Callbacks.
         * @returns {void} Kein Rückgabewert.
         */
        event => {
          if (event.pointerType === 'mouse') {
            hovering = true;
            syncWave();
          }
        },
      );
      button.addEventListener(
        'pointerleave',

        /**
         * Verarbeitet das Ereignis „pointerleave“ für diese Interaktion.
         * @returns {void} Kein Rückgabewert.
         */
        () => {
          hovering = false;
          syncWave();
        },
      );
      button.addEventListener(
        'focus',

        /**
         * Verarbeitet das Ereignis „focus“ für diese Interaktion.
         * @returns {void} Kein Rückgabewert.
         */
        () => {
          focused = true;
          syncWave();
        },
      );
      button.addEventListener(
        'blur',

        /**
         * Verarbeitet das Ereignis „blur“ für diese Interaktion.
         * @returns {void} Kein Rückgabewert.
         */
        () => {
          focused = false;
          syncWave();
        },
      );
      button.addEventListener(
        'click',

        /**
         * Verarbeitet das Ereignis „click“ für diese Interaktion.
         * @returns {void} Kein Rückgabewert.
         */
        () => {
          clearTimeout(tapTimer);
          tapped = true;
          syncWave();
          tapTimer = setTimeout(

            /**
             * Führt den zeit- oder zustandsabhängigen Callback aus.
             * @returns {void} Kein Rückgabewert.
             */
            () => {
              tapped = false;
              syncWave();
            },
            1600,
          );
        },
      );
      watchAutomaticHover(
        button,

        /**
         * Führt den zeit- oder zustandsabhängigen Callback aus.
         * @param {unknown} active - Eingabewert des Callbacks.
         * @returns {void} Kein Rückgabewert.
         */
        active => {
          automaticActive = active;
          button.classList.toggle('is-auto-hover', active);
          syncWave();
        },
      );
      founderActors.add(actor);
    },
  );
}
