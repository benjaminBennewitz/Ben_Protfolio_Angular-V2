/**
 * @file Die Paper-Stage als unabhängige, frameworkfreie Origami-Interaktion.
 * Ein gemeinsamer Fortschrittswert steuert Faltachsen, Objektperspektive und UI.
 */
(() => {
  'use strict';

  const object = document.querySelector('#paper-object');
  const surface = document.querySelector('#paper-surface');
  const handle = document.querySelector('#fold-handle');
  const toggle = document.querySelector('#fold-toggle');
  const toggleLabel = document.querySelector('#fold-toggle-label');
  const percent = document.querySelector('#fold-percent');
  const meter = document.querySelector('#fold-meter-fill');
  const zone = document.querySelector('#object-zone');
  const nextSection = document.querySelector('#unfolded');

  if (!object || !surface || !handle || !toggle || !zone || !meter || !nextSection) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let progress = 0;
  let desired = 0;
  let frame = 0;
  let dragging = false;
  let hasMoved = false;
  let pointerStart = 0;
  let progressStart = 0;
  let driftX = 0;
  let driftY = 0;
  let targetDriftX = 0;
  let targetDriftY = 0;

  /** Begrenzt einen Wert auf das Intervall [0, 1]. */
  const clamp = value => Math.min(1, Math.max(0, value));

  /** Rendert Scharniere und optische Tiefe direkt aus demselben Faltfortschritt. */
  function render() {
    if (reducedMotion.matches) {
      progress = desired;
      driftX = 0;
      driftY = 0;
    } else {
      progress += (desired - progress) * (dragging ? .38 : .17);
      driftX += (targetDriftX - driftX) * .075;
      driftY += (targetDriftY - driftY) * .075;
      if (Math.abs(progress - desired) < .0003) progress = desired;
    }

    // Dreiteiliger Wickelfalz: Die äußere rechte Lasche öffnet zuerst,
    // danach die innere linke. Beim Schließen läuft die Folge umgekehrt.
    // Beide Laschen liegen geschlossen über dem Mittelfeld, ohne Koplanarität.
    const outerProgress = clamp(progress * 2);
    const innerProgress = clamp(progress * 2 - 1);
    const outerAngle = -(1 - outerProgress) * 180;
    const innerAngle = (1 - innerProgress) * 180;
    object.style.setProperty('--fold', progress.toFixed(4));
    object.style.setProperty('--left-angle', `${innerAngle.toFixed(2)}deg`);
    object.style.setProperty('--right-angle', `${outerAngle.toFixed(2)}deg`);
    object.style.setProperty('--left-depth', `${((1 - innerProgress) * 2.5).toFixed(3)}px`);
    object.style.setProperty('--right-depth', `${((1 - outerProgress) * 5).toFixed(3)}px`);

    const rotationZ = -10 + progress * 9;
    const rotationX = 13 - progress * 9 + driftY;
    const rotationY = -17 + progress * 17 + driftX;
    const scale = .98 + progress * .11;
    object.style.transform = `rotateZ(${rotationZ.toFixed(2)}deg) rotateX(${rotationX.toFixed(2)}deg) rotateY(${rotationY.toFixed(2)}deg) scale(${scale.toFixed(3)})`;

    const fullPercent = Math.round(progress * 100);
    percent.textContent = `${String(fullPercent).padStart(2, '0')}%`;
    meter.style.setProperty('--progress', progress.toFixed(4));
    handle.style.setProperty('--handle-shift', `${Math.max(0,progress * surface.clientWidth * .19).toFixed(1)}px`);

    const isOpen = desired > .5;
    toggle.setAttribute('aria-expanded', String(isOpen));
    handle.setAttribute('aria-expanded', String(isOpen));
    toggleLabel.textContent = isOpen ? 'CLOSE THE PAPER' : 'UNFOLD THE PAPER';
    surface.classList.toggle('is-open', progress > .94);

    if (Math.abs(progress - desired) > .0004 || Math.abs(driftX - targetDriftX) > .02 || Math.abs(driftY - targetDriftY) > .02) {
      frame = requestAnimationFrame(render);
    } else {
      frame = 0;
    }
  }

  /** Startet maximal einen Animationsframe. */
  function schedule() {
    if (!frame) frame = requestAnimationFrame(render);
  }

  /** Setzt die gewünschte Öffnung und aktiviert den Renderer. */
  function setFold(value) {
    desired = clamp(value);
    schedule();
  }

  /** Öffnet oder schließt auf die nächstgelegene vollständige Papierform. */
  function toggleFold() {
    setFold(desired > .5 ? 0 : 1);
  }

  toggle.addEventListener('click', toggleFold);

  handle.addEventListener('pointerdown', event => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    dragging = true;
    hasMoved = false;
    pointerStart = event.clientX;
    progressStart = desired;
    handle.setPointerCapture(event.pointerId);
  });

  handle.addEventListener('pointermove', event => {
    if (!dragging) return;
    const displacement = event.clientX - pointerStart;
    if (Math.abs(displacement) > 5) hasMoved = true;
    const distance = Math.max(140, Math.min(340, surface.clientWidth * .35));
    setFold(progressStart + displacement / distance);
  });

  /** Rastet eine halb geöffnete Falte bewusst ein oder wieder zurück. */
  function finishDrag(event) {
    if (!dragging) return;
    dragging = false;
    if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
    setFold(desired >= .42 ? 1 : 0);
  }

  handle.addEventListener('pointerup', finishDrag);
  handle.addEventListener('pointercancel', finishDrag);
  handle.addEventListener('click', event => {
    if (hasMoved) {
      event.preventDefault();
      hasMoved = false;
      return;
    }
    toggleFold();
  });

  /** Sanfte räumliche Reaktion ohne dauernde Bewegung außerhalb der Papier-Stage. */
  zone.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || dragging || reducedMotion.matches) return;
    const bounds = zone.getBoundingClientRect();
    targetDriftX = ((event.clientX - bounds.left) / bounds.width - .5) * 5;
    targetDriftY = ((event.clientY - bounds.top) / bounds.height - .5) * -4;
    schedule();
  });

  zone.addEventListener('pointerleave', () => {
    targetDriftX = 0;
    targetDriftY = 0;
    schedule();
  });

  /** Die bereits geöffnete Papierwelt kann direkt über die CTA erreicht werden. */
  const heroCta = document.querySelector('.topbar__nav');
  heroCta?.addEventListener('click', () => setFold(1));

  reducedMotion.addEventListener?.('change', () => schedule());
  render();
})();

/**
 * @file Scrollgesteuerte Akkordeon-Faltung für Kapitel 02.
 * Die bestehenden Hero-Interaktionen bleiben davon unabhängig.
 */
(() => {
  'use strict';

  const scene = document.querySelector('#the-other-side');
  const object = document.querySelector('#fold-story-object');
  const meter = document.querySelector('#story-meter');
  const percent = document.querySelector('#story-percent');
  if (!scene || !object || !meter || !percent) return;
  const turnControls = [...scene.querySelectorAll('[data-turn-sheet]')];

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = value => Math.min(1, Math.max(0, value));

  /** Erzeugt einen weichen Verlauf zwischen zwei Scroll-Marken. */
  const smoothstep = (start, end, value) => {
    const t = clamp((value - start) / (end - start));
    return t * t * (3 - 2 * t);
  };

  let frame = 0;
  let lastPercent = -1;
  let turnReady = false;

  /** Übersetzt die Scrollposition in Scharnierwinkel, Zoom und Fortschrittsanzeige. */
  function update() {
    frame = 0;
    const bounds = scene.getBoundingClientRect();
    const distance = Math.max(1, bounds.height - window.innerHeight);
    const travel = clamp(-bounds.top / distance);
    // Zwei gleichgerichtete Scharnierbewegungen: erst entfalten, am Ende wieder schließen.
    const unfolded = reducedMotion.matches ? 1 : smoothstep(.06, .48, travel);
    const refold = reducedMotion.matches ? 0 : smoothstep(.59, .70, travel);
    const halfOne = reducedMotion.matches ? 0 : smoothstep(.70, .80, travel);
    const halfTwo = reducedMotion.matches ? 0 : smoothstep(.81, .90, travel);
    const halfThree = reducedMotion.matches ? 0 : smoothstep(.91, .995, travel);
    const visibleFold = unfolded * (1 - refold);
    const currentPercent = Math.round(visibleFold * 100);
    const ready = unfolded >= .98 && refold < .04;
    if (ready !== turnReady) {
      turnReady = ready;
      scene.classList.toggle('fold-story--ready', ready);
      turnControls.forEach(control => {
        control.disabled = !ready;
        if (!ready) {
          control.setAttribute('aria-pressed', 'false');
          const leaf = control.closest('.fold-story__leaf');
          leaf?.classList.remove('is-turned');
          leaf?.querySelector('.fold-story__turnable > .fold-story__face:not(.fold-story__face--turned)')?.setAttribute('aria-hidden', 'false');
          leaf?.querySelector('.fold-story__face--turned')?.setAttribute('aria-hidden', 'true');
        }
      });
    }

    object.style.setProperty('--story-angle', `${((1 - visibleFold) * 86).toFixed(2)}deg`);
    object.style.setProperty('--story-progress', visibleFold.toFixed(4));
    object.style.setProperty('--story-collapse', refold.toFixed(4));
    scene.style.setProperty('--packet-presence', smoothstep(.665, .715, travel).toFixed(4));
    scene.style.setProperty('--packet-half-1', halfOne.toFixed(4));
    scene.style.setProperty('--packet-half-2', halfTwo.toFixed(4));
    scene.style.setProperty('--packet-half-3', halfThree.toFixed(4));
    scene.style.setProperty('--story-progress', visibleFold.toFixed(4));

    if (currentPercent !== lastPercent) {
      lastPercent = currentPercent;
      meter.setAttribute('aria-valuenow', String(currentPercent));
      percent.textContent = `${String(currentPercent).padStart(2, '0')}%`;
    }
  }

  /** Fasst schnelle Scroll- und Resize-Ereignisse in einem Frame zusammen. */
  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  /** Dreht eine komplette bedruckte Papierfläche um die eigene senkrechte Falzachse. */
  turnControls.forEach(control => {
    control.addEventListener('click', () => {
      if (control.disabled) return;
      const leaf = control.closest('.fold-story__leaf');
      const opened = leaf?.classList.toggle('is-turned') ?? false;
      control.setAttribute('aria-pressed', String(opened));
      leaf?.querySelector('.fold-story__turnable > .fold-story__face:not(.fold-story__face--turned)')?.setAttribute('aria-hidden', String(opened));
      leaf?.querySelector('.fold-story__face--turned')?.setAttribute('aria-hidden', String(!opened));
    });
  });

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  reducedMotion.addEventListener?.('change', schedule);
  update();
})();


/** Zeigt den aus Papier gefalteten Scroll-to-Top-Pfeil erst nach dem Hero. */
(() => {
  'use strict';
  const button = document.querySelector('#scroll-top');
  if (!button) return;
  let frame = 0;
  const update = () => {
    frame = 0;
    const shown = window.scrollY > Math.max(350, window.innerHeight * .7);
    button.classList.toggle('is-visible', shown);
    button.tabIndex = shown ? 0 : -1;
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  update();
})();

/**
 * @file Kontrollierte Blattfaltung für inhaltliche Kapitel.
 * Öffnet die Fläche beim Betreten und schließt sie am Kapitelende.
 * Der Body bleibt dabei der einzige Scroll-Container.
 */
(() => {
  'use strict';
  const sections = [...document.querySelectorAll('[data-chapter-fold]')];
  if (!sections.length) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = value => Math.min(1, Math.max(0, value));
  const smoothstep = value => {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
  };
  let frame = 0;

  function update() {
    frame = 0;
    sections.forEach(section => {
      if (reducedMotion.matches) {
        section.style.setProperty('--chapter-angle', '0deg');
        section.style.setProperty('--chapter-hinge', '0%');
        return;
      }
      const bounds = section.getBoundingClientRect();
      const entering = smoothstep((window.innerHeight - bounds.top) / (window.innerHeight * .55));
      const leaving = smoothstep((window.innerHeight * .6 - bounds.bottom) / (window.innerHeight * .50));
      section.style.setProperty('--chapter-angle', `${((1 - entering) * -86 + leaving * 86).toFixed(2)}deg`);
      section.style.setProperty('--chapter-hinge', leaving > .01 ? '100%' : '0%');
    });
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  reducedMotion.addEventListener?.('change', schedule);
  update();
})();

/**
 * @file Finale: Die sechs Motive der Website entfalten sich zu einem Würfelnetz.
 * Die einzelnen Flächen drehen um geometrische Kanten statt frei zu zoomen.
 */
(() => {
  'use strict';
  const section = document.querySelector('#box-net');
  const stage = document.querySelector('#box-net-stage');
  const percent = document.querySelector('#box-net-percent');
  if (!section || !stage || !percent) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = value => Math.min(1, Math.max(0, value));
  const smoothstep = value => {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
  };
  let frame = 0;

  function update() {
    frame = 0;
    const bounds = section.getBoundingClientRect();
    const available = Math.max(1, bounds.height - window.innerHeight);
    const distance = clamp(-bounds.top / available);
    const open = reducedMotion.matches ? 1 : smoothstep((distance - .08) / .78);
    const first = reducedMotion.matches ? 1 : smoothstep((distance - .10) / .24);
    const second = reducedMotion.matches ? 1 : smoothstep((distance - .28) / .30);
    const last = reducedMotion.matches ? 1 : smoothstep((distance - .51) / .30);
    stage.style.setProperty('--net-open', open.toFixed(4));
    stage.style.setProperty('--net-top', first.toFixed(4));
    stage.style.setProperty('--net-sides', second.toFixed(4));
    stage.style.setProperty('--net-outer', last.toFixed(4));
    section.style.setProperty('--net-open', open.toFixed(4));
    percent.textContent = `${String(Math.round(open * 100)).padStart(2, '0')}%`;
    section.classList.toggle('box-net--open', open > .94);
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  reducedMotion.addEventListener?.('change', schedule);
  update();
})();

/**
 * @file Gemeinsame Faltübergänge des Würfelnetzes.
 * Die Hero-Lasche klappt rückwärts um die untere Kante; die nächste Fläche öffnet sich
 * aus ihrer oberen Scharnierkante. Normales Dokument-Scrollen bleibt erhalten.
 */
(() => {
  'use strict';
  const hero = document.querySelector('#surface');
  const center = document.querySelector('#unfolded');
  if (!hero || !center) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  let frame = 0;

  function render() {
    frame = 0;
    if (reducedMotion.matches) {
      hero.style.setProperty('--hero-hinge', '0');
      center.style.setProperty('--center-open', '1');
      return;
    }
    const heroBounds = hero.getBoundingClientRect();
    const centerBounds = center.getBoundingClientRect();
    const heroTravel = smooth((-heroBounds.top) / Math.max(1, heroBounds.height * .96));
    const centerTravel = smooth((innerHeight - centerBounds.top) / Math.max(1, innerHeight * .77));
    hero.style.setProperty('--hero-hinge', heroTravel.toFixed(4));
    center.style.setProperty('--center-open', centerTravel.toFixed(4));
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(render); }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule, {passive:true});
  reducedMotion.addEventListener?.('change',schedule);
  render();
})();
