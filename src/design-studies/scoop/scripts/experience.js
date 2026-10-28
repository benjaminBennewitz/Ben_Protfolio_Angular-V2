/** @file experience.js — Koordination von Hero und Animationsframes. */

import { createArtworkMount } from './artwork-mount.js';
import { updateArms, resetFounderArms } from './arm-motion.js';
import { createEyeMotion } from './eye-motion.js';
import { initFounderWaves } from './founder-wave.js';
import { createScrollPath } from './scroll-path.js';

/**
 * Initialisiert die Figuren und die gemeinsame Animationssteuerung.
 *
 * @param {object} context - DOM-Helfer und Bewegungseinstellungen der Designstudie.
 * @returns {object} Zugriff auf SVG-Mounting, Animations- und Scrollsteuerung.
 */
export function createExperience(context) {
  // Explizite Abhängigkeiten und öffentliche Schnittstellen dieses Bereichs.
  const { $, $$, motion, finePointer, automaticHover, loader, showToast, watchAutomaticHover } = context;
  // Registrierte SVG-Figuren.
  const actors = new Set();
  // Registrierte Portrait-Figuren für Wellenbewegungen.
  const founderActors = new Set();
  // Letzte Mausposition im Viewport.
  let pointer = null;
  // Aktualisiert die Augen einer SVG-Figur mit dem aktuellen Pointer.
  const updateEyes = createEyeMotion({
    finePointer,
    automaticHover,
    loader,
    getPointer:

      /**
       * Liest oder aktualisiert den zugehörigen Interaktionszustand.
       * @returns {unknown} Ergebnis der Verarbeitung.
       */
      () => {
        return pointer;
      },
  });
  // ID des vorgemerkten Animationsframes.
  let frame = 0;
  // Sichtbare Laufzeit der Hero-Animation in Millisekunden.
  let heroElapsed = 0;
  // Zeitstempel des letzten sichtbaren Hero-Frames.
  let heroPreviousFrame = 0;
  // Die Fallsequenz ist aktiv.
  let heroRunning = false;
  // Die Figuren haben ihre Endposition erreicht.
  let heroLanded = false;
  // Die Hero-Komposition ist im Sichtbereich.
  let heroVisible = true;
  // Schnittstelle der Scroll-Pfad-Steuerung.
  const scrollPath = createScrollPath({
    $,
    $$,
    motion,
    requestFrame,
  });
  // Explizite Abhängigkeiten und öffentliche Schnittstellen dieses Bereichs.
  const { layoutPath, updatePath, advancePath } = scrollPath;
  // Beobachter für sichtbare Figuren und Hero-Bereiche.
  let visibilityObserver;
  if ('IntersectionObserver' in window)
    visibilityObserver = new IntersectionObserver(

      /**
       * Liest oder aktualisiert den zugehörigen Interaktionszustand.
       * @param {unknown} entries - Eingabewert des Callbacks.
       * @returns {void} Kein Rückgabewert.
       */
      entries => {
        for (const entry of entries) {
          // Animierbarer Zustand einer SVG-Figur.
          const actor = [...actors].find(

            /**
             * Prüft die Kennung des gesuchten Eintrags.
             * @param {unknown} item - Aktuell verarbeitete Warenkorbposition.
             * @returns {unknown} Ergebnis der Verarbeitung.
             */
            item => {
              return item.svg === entry.target;
            },
          );
          if (actor) actor.visible = entry.isIntersecting;
          if (entry.target === $('#hero-art')) heroVisible = entry.isIntersecting;
          if (entry.target === $('.mix-illustration'))
            entry.target.classList.toggle('is-in-view', entry.isIntersecting);
        }
        requestFrame();
      },
      {
        rootMargin: '40px',
        threshold: 0,
      },
    );
  // Explizite Abhängigkeiten und öffentliche Schnittstellen dieses Bereichs.
  const { mountArtwork } = createArtworkMount({
    $,
    $$,
    actors,
    visibilityObserver,
  });
  $$('[data-art]').forEach(

    /**
     * Verarbeitet den aktuellen Eintrag der zugehörigen DOM- oder Datenliste.
     * @param {unknown} host - Eingabewert des Callbacks.
     * @returns {unknown} Ergebnis der Verarbeitung.
     */
    host => {
      return mountArtwork(host.dataset.art, host);
    },
  );
  // Geometrie und Zustand der gestapelten Hero-Figuren.
  const heroLayers = [
    {
      name: 'cone',
      key: 'Unbenannt-5',
      x: 286.6,
      y: 944.7,
      w: 391.85,
      h: 626.43,
      angle: 0,
      delay: -1,
    },
    {
      name: 'jochen',
      key: 'jochen-scoop',
      x: 73.75,
      y: 573,
      w: 880.83,
      h: 481.18,
      angle: 0,
      delay: 100,
    },
    {
      name: 'brostacchio',
      key: 'brostacchio-scoop',
      x: 99.3,
      y: 281.85,
      w: 640.92,
      h: 516.62,
      angle: 0,
      delay: 950,
    },
    {
      name: 'strawlarry',
      key: 'strawlarry-scoop',
      x: 201,
      y: 73.6,
      w: 543.3,
      h: 527.38,
      angle: -8,
      delay: 1800,
    },
  ];
  heroLayers.forEach(

    /**
     * Verarbeitet den aktuellen Eintrag der zugehörigen DOM- oder Datenliste.
     * @param {unknown} layer - Aktuell verarbeitete Hero-Ebene.
     * @returns {void} Kein Rückgabewert.
     */
    layer => {
      layer.group = $(`[data-hero="${layer.name}"]`);
      // SVG-Gruppe für die feste Hero-Grundposition.
      const pose = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      pose.setAttribute(
        'transform',
        `translate(${layer.x},${layer.y}) rotate(${layer.angle}) scale(.935)`,
      );
      layer.group.replaceChildren(pose);
      layer.svg = mountArtwork(layer.key, pose);
      layer.svg.setAttribute('width', layer.w);
      layer.svg.setAttribute('height', layer.h);
      layer.shadow = $('[data-contact-shadow]', layer.svg);
      layer.offset = 0;
      layer.contact = false;
    },
  );

  /**
   * Berechnet den vertikalen Versatz mit zwei Nachfederungen.
   *
   * @param {number} progress - Fortschritt der Fallanimation von 0 bis 1.
   * @returns {number} Vertikaler Versatz.
   */
  function dropOffset(progress) {
    // Stützpunkte für die aktuelle SVG-Geometrie.
    const points = [
      [0, -1400],
      [0.55, 0],
      [0.7, -65],
      [0.84, 0],
      [0.92, -14],
      [1, 0],
    ];
    for (let i = 1; i < points.length; i++)
      if (progress <= points[i][0]) {
        // Explizite Abhängigkeiten und öffentliche Schnittstellen dieses Bereichs.
        const [a, from] = points[i - 1];
        // Explizite Abhängigkeiten und öffentliche Schnittstellen dieses Bereichs.
        const [b, to] = points[i];
        // Normierter Interpolationswert.
        let t = Math.max(0, (progress - a) / (b - a));
        t = i === 1 ? t * t : (1 - Math.cos(t * Math.PI)) / 2;
        return from + (to - from) * t;
      }
    return 0;
  }

  /**
   * Setzt die Hero-Komposition in ihren endgültigen Zustand.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function finishHero() {
    heroRunning = false;
    heroLanded = true;
    heroLayers.forEach(

      /**
       * Verarbeitet den aktuellen Eintrag der zugehörigen DOM- oder Datenliste.
       * @param {unknown} layer - Aktuell verarbeitete Hero-Ebene.
       * @returns {void} Kein Rückgabewert.
       */
      layer => {
        layer.offset = 0;
        layer.contact = true;
        layer.group.removeAttribute('transform');
        layer.group.style.opacity = '1';
        if (layer.shadow) layer.shadow.style.opacity = '1';
      },
    );
    scrollPath.setReady(true);
    updatePath();
    requestFrame();
  }

  /**
   * Startet die Fallanimation der Hero-Figuren erneut.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function playHero() {
    if (motion.matches) {
      finishHero();
      showToast('Weniger Bewegung ist aktiv. Die Kugeln bleiben an ihrem Platz.');
      return;
    }
    heroElapsed = 0;
    heroPreviousFrame = 0;
    heroRunning = true;
    scrollPath.setReady(false);
    updatePath();
    heroLanded = false;
    heroLayers.forEach(

      /**
       * Verarbeitet den aktuellen Eintrag der zugehörigen DOM- oder Datenliste.
       * @param {unknown} layer - Aktuell verarbeitete Hero-Ebene.
       * @returns {void} Kein Rückgabewert.
       */
      layer => {
        layer.contact = false;
        if (layer.delay >= 0) {
          layer.group.style.opacity = '0';
          layer.group.setAttribute('transform', 'translate(0,-1400)');
        }
        if (layer.shadow) layer.shadow.style.opacity = '0';
      },
    );
    requestFrame();
  }
  $('#replay-hero').addEventListener('click', playHero);
  initFounderWaves({
    $,
    $$,
    motion,
    automaticHover,
    watchAutomaticHover,
    requestFrame,
    founderActors,
  });

  /**
   * Plant höchstens einen aktiven Animationsframe.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function requestFrame() {
    if (!frame && !document.hidden && !motion.matches) frame = requestAnimationFrame(tick);
  }

  /**
   * Aktualisiert Fallfortschritt und Kontaktschatten der Hero-Figuren.
   * @param {number} now - Eingabewert der Operation.
   * @returns {void} Kein Rückgabewert.
   */
  function advanceHero(now) {
    if (heroRunning && heroVisible) {
      heroElapsed += heroPreviousFrame ? Math.min(now - heroPreviousFrame, 50) : 0;
      heroPreviousFrame = now;
      for (const layer of heroLayers)
        if (layer.delay >= 0) {
          // Berechneter Punkt oder normierter Animationsfortschritt.
          const p = Math.max(0, Math.min(1, (heroElapsed - layer.delay) / 900));
          layer.offset = dropOffset(p);
          layer.contact = p >= 0.55;
          layer.group.style.opacity = p > 0 ? '1' : '0';
          layer.group.setAttribute('transform', `translate(0,${layer.offset})`);
        }
      for (let i = 0; i < 3; i++) {
        // Untere Hero-Ebene mit Kontaktschatten.
        const lower = heroLayers[i];
        // Darüberliegende Hero-Ebene.
        const above = heroLayers[i + 1];
        if (lower.shadow)
          lower.shadow.style.opacity = above.contact
            ? String(Math.max(0, 1 - Math.abs(above.offset - lower.offset) / 90))
            : '0';
      }
      if (heroElapsed >= 2700) finishHero();
    } else heroPreviousFrame = 0;
  }

  /**
   * Aktualisiert Blick und Arme ausschließlich sichtbarer SVG-Figuren.
   * @param {number} now - Eingabewert der Operation.
   * @returns {boolean} Ergebnis der beschriebenen Operation.
   */
  function updateVisibleActors(now) {
    // Mindestens eine Blickbewegung benötigt weitere Frames.
    let eyesMoving = false;
    advanceHero(now);
    for (const actor of actors)
      if (actor.visible && actor.svg.isConnected) {
        eyesMoving =
          updateEyes(actor, now / 1000) || (automaticHover.matches && loader.hidden) || eyesMoving;
        if (heroVisible && heroLanded && actor.arms.length) updateArms(actor, now / 1000);
      }
    return eyesMoving;
  }

  /**
   * Aktualisiert aktive Portrait-Wellenbewegungen.
   * @param {number} now - Eingabewert der Operation.
   * @returns {boolean} Ergebnis der beschriebenen Operation.
   */
  function updateFounders(now) {
    // Mindestens eine Portrait-Figur winkt.
    let founderMoving = false;
    for (const actor of founderActors)
      if (actor.active) {
        updateArms(actor, now / 1000);
        founderMoving = true;
      }
    return founderMoving;
  }

  /**
   * Aktualisiert die sichtbaren Figuren und den Scroll-Pfad pro Frame.
   *
   * @param {number} now - Zeitstempel von requestAnimationFrame.
   * @returns {void} Kein Rückgabewert.
   */
  function tick(now) {
    frame = 0;
    if (document.hidden || motion.matches) return;
    // Mindestens eine Blickbewegung benötigt weitere Frames.
    const eyesMoving = updateVisibleActors(now);
    // Mindestens eine Portrait-Figur winkt.
    const founderMoving = updateFounders(now);
    // Der Scroll-Pfad benötigt weitere Frames.
    const pathMoving = advancePath();
    if ((heroVisible && (heroRunning || heroLanded)) || eyesMoving || founderMoving || pathMoving)
      requestFrame();
  }
  window.addEventListener(
    'pointermove',

    /**
     * Verarbeitet das Ereignis „pointermove“ für diese Interaktion.
     * @param {Event} event - Eingabewert des Callbacks.
     * @returns {void} Kein Rückgabewert.
     */
    event => {
      if (event.pointerType === 'mouse') {
        pointer = {
          x: event.clientX,
          y: event.clientY,
        };
        requestFrame();
      }
    },
    {
      passive: true,
    },
  );
  document.documentElement.addEventListener(
    'pointerleave',

    /**
     * Verarbeitet das Ereignis „pointerleave“ für diese Interaktion.
     * @returns {void} Kein Rückgabewert.
     */
    () => {
      pointer = null;
      requestFrame();
    },
  );
  visibilityObserver?.observe($('#hero-art'));
  visibilityObserver?.observe($('.mix-illustration'));
  if (!visibilityObserver) $('.mix-illustration').classList.add('is-in-view');

  /** Registriert die Seitenzustände für Sichtbarkeit und reduzierte Bewegung. */
  function bindPageEvents() {
    document.addEventListener(
      'visibilitychange',

      /**
       * Verarbeitet das Ereignis „visibilitychange“ für diese Interaktion.
       * @returns {void} Kein Rückgabewert.
       */
      () => {
        document.body.classList.toggle('page-hidden', document.hidden);
        if (document.hidden) {
          cancelAnimationFrame(frame);
          frame = 0;
          heroPreviousFrame = 0;
        } else requestFrame();
      },
    );
    motion.addEventListener(
      'change',

      /**
       * Verarbeitet das Ereignis „change“ für diese Interaktion.
       * @returns {void} Kein Rückgabewert.
       */
      () => {
        if (motion.matches) {
          cancelAnimationFrame(frame);
          frame = 0;
          finishHero();
          founderActors.forEach(resetFounderArms);
          pointer = null;
          for (const actor of actors)
            for (const eye of actor.eyes) {
              if (eye.base)
                eye.mover.setAttribute(
                  'transform',
                  `translate(${eye.base.centerX},${eye.base.centerY})`,
                );
            }
        } else requestFrame();
        updatePath();
      },
    );
  }
  return {
    mountArtwork,
    requestFrame,
    finishHero,
    playHero,
    layoutPath,
    updatePath,
    heroLayers,
    bindPageEvents,
  };
}
