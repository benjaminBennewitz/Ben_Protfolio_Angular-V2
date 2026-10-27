/**
 * @file script.js
 * @description Steuert die interaktive Typografie, Scroll-Szenen und den Poster-Export.
 */

/* ==========================================================================
   INHALTSVERZEICHNIS

   01   Grundlagen & Bewegungspräferenzen
   02   Hero & interaktive Glyphen
   03   Pressure & Scroll-Kompression
   04   Fracture-Text & Wort-Reformation
   05   Poster-Maker & PNG-Export
   06   Scroll-Theatre & Abschnitts-Reveals
   07   Initialisierung
   ========================================================================== */

(() => {
  'use strict';

  /* --------------------------------------------------------------------------
     01   Grundlagen & Bewegungspräferenzen
     -------------------------------------------------------------------------- */

  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

  /**
   * Begrenzt einen Zahlenwert auf einen Wertebereich.
   *
   * @param {number} value - Zu begrenzender Wert.
   * @param {number} min - Untere Grenze.
   * @param {number} max - Obere Grenze.
   * @returns {number} Begrenzter Wert.
   */
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  /**
   * Prüft die Systempräferenz und den manuellen Motion-Schalter.
   *
   * @returns {boolean} Ob Bewegungen reduziert werden sollen.
   */
  const isReducedMotion = () =>
    motionPreference.matches || document.documentElement.classList.contains('reduce-motion');

  /**
   * Glättet einen normierten Animationsfortschritt.
   *
   * @param {number} value - Fortschritt zwischen 0 und 1.
   * @returns {number} Geglätteter Fortschritt.
   */
  const smoothStep = value => value * value * (3 - 2 * value);

  /**
   * Erzeugt einzeln animierbare Glyphen und erhält die ARIA-Beschriftung.
   *
   * @param {HTMLElement} element - Textelement.
   * @param {string} text - Zugänglicher Originaltext.
   * @returns {HTMLElement[]} Erzeugte Glyphen.
   */
  function splitLetters(element, text) {
    element.textContent = '';
    element.setAttribute('aria-label', text);

    [...text].forEach((character, index) => {
      const glyph = document.createElement('span');
      glyph.className = 'glyph';
      glyph.textContent = character === ' ' ? '\u00a0' : character;
      glyph.setAttribute('aria-hidden', 'true');
      glyph.dataset.index = String(index);
      element.append(glyph);
    });

    return [...element.querySelectorAll('.glyph')];
  }

  /* --------------------------------------------------------------------------
     02   Hero & interaktive Glyphen
     -------------------------------------------------------------------------- */

  /**
   * Misst die ursprünglichen Glyphenmittelpunkte ohne Pointer-Verschiebung.
   *
   * @param {object} state - Hero-Zustand.
   * @returns {void} Kein Rückgabewert.
   */
  function updateHeroCenters(state) {
    state.glyphs.forEach((glyph, index) => {
      const bounds = glyph.getBoundingClientRect();

      // Die aktuelle Verschiebung abziehen, damit die Messpunkte stabil bleiben.
      state.centers[index].x = bounds.left + bounds.width / 2 - state.current[index].x;
      state.centers[index].y = bounds.top + bounds.height / 2 - state.current[index].y;
    });
  }

  /**
   * Animiert die Glyphen in Richtung ihrer Pointer-Zielpositionen.
   *
   * @param {object} state - Hero-Zustand.
   * @returns {void} Kein Rückgabewert.
   */
  function renderHeroFrame(state) {
    state.animationFrame = 0;
    if (!state.visible || isReducedMotion()) return;

    let unsettled = false;

    state.glyphs.forEach((glyph, index) => {
      const centerX = state.centers[index].x;
      const centerY = state.centers[index].y;
      const dx = state.pointer.x - centerX;
      const dy = state.pointer.y - centerY;
      const distance = Math.hypot(dx, dy);
      const influence = state.pointer.active ? Math.pow(clamp(1 - distance / 345, 0, 1), 1.55) : 0;
      const targetX = dx * influence * .42;
      const targetY = dy * influence * .44;
      const targetAngle = clamp(dx / 80, -3, 3) * influence;
      const targetScale = 1 + influence * .18;
      const current = state.current[index];

      current.x += (targetX - current.x) * .16;
      current.y += (targetY - current.y) * .16;
      current.angle += (targetAngle - current.angle) * .16;
      current.scale += (targetScale - current.scale) * .16;
      glyph.style.transform = `translate3d(${current.x.toFixed(2)}px,${current.y.toFixed(2)}px,0) rotate(${current.angle.toFixed(2)}deg) scale(${current.scale.toFixed(3)})`;

      if (Math.abs(targetX - current.x) > .15 || Math.abs(targetY - current.y) > .15 || Math.abs(targetAngle - current.angle) > .1 || Math.abs(targetScale - current.scale) > .003) {
        unsettled = true;
      }
    });

    // Nur weiterzeichnen, solange mindestens eine Glyphe in Bewegung ist.
    if (unsettled) state.animationFrame = requestAnimationFrame(() => renderHeroFrame(state));
  }

  /**
   * Plant höchstens einen ausstehenden Hero-Animationsframe ein.
   *
   * @param {object} state - Hero-Zustand.
   * @returns {void} Kein Rückgabewert.
   */
  function requestHeroFrame(state) {
    if (!state.animationFrame && state.visible && !isReducedMotion()) {
      state.animationFrame = requestAnimationFrame(() => renderHeroFrame(state));
    }
  }

  /**
   * Synchronisiert die Hero-Glyphen mit der Bewegungspräferenz.
   *
   * @param {object} state - Hero-Zustand.
   * @returns {void} Kein Rückgabewert.
   */
  function syncHeroMotion(state) {
    if (isReducedMotion()) {
      cancelAnimationFrame(state.animationFrame);
      state.animationFrame = 0;
      state.glyphs.forEach(glyph => { glyph.style.transform = ''; });
      state.current.forEach(current => {
        current.x = 0;
        current.y = 0;
        current.angle = 0;
        current.scale = 1;
      });
    } else {
      requestHeroFrame(state);
    }
  }

  /**
   * Beendet die aktive Pointer-Beeinflussung der Hero-Glyphen.
   *
   * @param {object} state - Hero-Zustand.
   * @returns {void} Kein Rückgabewert.
   */
  function releaseHeroPointer(state) {
    state.pointer.active = false;
    requestHeroFrame(state);
  }

  /**
   * Registriert Maus- und Touch-Interaktionen für den Hero.
   *
   * @param {HTMLElement} hero - Hero-Element.
   * @param {object} state - Hero-Zustand.
   * @returns {void} Kein Rückgabewert.
   */
  function bindHeroPointerEvents(hero, state) {
    hero.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'touch') return;
      state.pointer.x = event.clientX;
      state.pointer.y = event.clientY;
      state.pointer.active = true;
      requestHeroFrame(state);
    }, { passive: true });

    hero.addEventListener('pointerup', () => releaseHeroPointer(state));
    hero.addEventListener('pointercancel', () => releaseHeroPointer(state));
    hero.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      state.pointer.x = event.clientX;
      state.pointer.y = event.clientY;
      state.pointer.active = true;
      requestHeroFrame(state);
    }, { passive: true });
    hero.addEventListener('pointerleave', () => releaseHeroPointer(state));
  }

  /**
   * Aktualisiert die Hero-Messpunkte bei Größen- und Schriftänderungen.
   *
   * @param {HTMLElement} hero - Hero-Element.
   * @param {object} state - Hero-Zustand.
   * @returns {void} Kein Rückgabewert.
   */
  function bindHeroMeasurements(hero, state) {
    hero.addEventListener('pointerenter', () => updateHeroCenters(state));
    window.addEventListener('resize', () => updateHeroCenters(state), { passive: true });
    document.fonts.ready.then(() => updateHeroCenters(state));
    updateHeroCenters(state);
  }

  /**
   * Pausiert die Glyphenanimation außerhalb des sichtbaren Hero-Bereichs.
   *
   * @param {HTMLElement} hero - Hero-Element.
   * @param {object} state - Hero-Zustand.
   * @returns {void} Kein Rückgabewert.
   */
  function observeHeroVisibility(hero, state) {
    const observer = new IntersectionObserver(entries => {
      state.visible = entries[0].isIntersecting;
      if (state.visible) {
        updateHeroCenters(state);
        requestHeroFrame(state);
      }
    });
    observer.observe(hero);
  }

  /**
   * Initialisiert die Hero-Glyphen und verknüpft ihre Interaktionen.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function initHero() {
    const hero = document.querySelector('#hero-pull');
    if (!hero) return;

    const groups = [...hero.querySelectorAll('[data-kinetic]')].map(element =>
      splitLetters(element, element.dataset.kinetic)
    );
    const glyphs = groups.flat();
    const state = {
      glyphs,
      current: glyphs.map(() => ({ x: 0, y: 0, angle: 0, scale: 1 })),
      centers: glyphs.map(() => ({ x: 0, y: 0 })),
      pointer: { x: -10000, y: -10000, active: false },
      animationFrame: 0,
      visible: true,
    };

    bindHeroPointerEvents(hero, state);
    bindHeroMeasurements(hero, state);
    observeHeroVisibility(hero, state);
    motionPreference.addEventListener('change', () => syncHeroMotion(state));
    document.addEventListener('typebreak:motion', () => syncHeroMotion(state));
  }

  /* --------------------------------------------------------------------------
     03   Pressure & Scroll-Kompression
     -------------------------------------------------------------------------- */

  /**
   * Überträgt den Scrollfortschritt in Druckanzeige und Worttransforms.
   *
   * @param {object} state - Pressure-Zustand.
   * @returns {void} Kein Rückgabewert.
   */
  function updatePressure(state) {
    state.queued = false;
    const bounds = state.section.getBoundingClientRect();
    const available = Math.max(1, bounds.height - window.innerHeight);
    const progress = clamp(-bounds.top / available, 0, 1);
    const percent = Math.round(progress * 100);

    state.meter.setAttribute('aria-valuenow', String(percent));
    state.output.textContent = `${String(percent).padStart(2, '0')}%`;
    state.fill.style.width = `${percent}%`;

    const compression = isReducedMotion() ? 0 : progress;
    // Der visuelle Bruch beginnt erst im letzten Drittel der Scrollstrecke.
    const rupture = isReducedMotion() ? 0 : smoothStep(clamp((progress - .63) / .29, 0, 1));
    state.section.style.setProperty('--pressure-p', compression.toFixed(3));
    state.section.style.setProperty('--pressure-break', rupture.toFixed(3));

    state.words.forEach((word, index) => {
      const scale = 1 - compression * (index === 1 ? .5 : .3);
      const skew = (index % 2 === 0 ? -1 : 1) * compression * 12;
      const rotation = [7, -9, 5][index] * compression;
      const offset = [-.1, .12, -.13][index] * compression * window.innerWidth;
      word.style.transform = `translate3d(${offset.toFixed(1)}px,${(compression * index * 24).toFixed(1)}px,0) rotate(${rotation.toFixed(1)}deg) scaleX(${scale.toFixed(3)}) skewX(${skew.toFixed(2)}deg)`;
      word.style.letterSpacing = `${-compression * 8}px`;
    });
  }

  /**
   * Bündelt Scroll- und Resize-Ereignisse zu einem Pressure-Update.
   *
   * @param {object} state - Pressure-Zustand.
   * @returns {void} Kein Rückgabewert.
   */
  function requestPressureUpdate(state) {
    if (!state.queued) {
      state.queued = true;
      requestAnimationFrame(() => updatePressure(state));
    }
  }

  /**
   * Initialisiert die scrollabhängige Druckanzeige.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function initPressure() {
    const state = {
      section: document.querySelector('#pressure'),
      meter: document.querySelector('#pressure-meter'),
      fill: document.querySelector('#pressure-fill'),
      output: document.querySelector('#pressure-percent'),
      words: [...document.querySelectorAll('.pressure__word')],
      queued: false,
    };
    const requestUpdate = () => requestPressureUpdate(state);

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    motionPreference.addEventListener('change', requestUpdate);
    document.addEventListener('typebreak:motion', requestUpdate);
    updatePressure(state);
  }

  /* --------------------------------------------------------------------------
     04   Fracture-Text & Wort-Reformation
     -------------------------------------------------------------------------- */

  /**
   * Weist jeder Glyphe eine reproduzierbare Bruchtransformation zu.
   *
   * @param {HTMLElement[]} glyphs - Wort-Glyphen.
   * @returns {void} Kein Rückgabewert.
   */
  function applyFractureOffsets(glyphs) {
    glyphs.forEach((glyph, index) => {
      const step = index + 1;
      const x = (step % 3 - 1) * 5;
      const y = ((step * 7) % 5 - 2) * 5;
      const angle = ((step * 11) % 9 - 4) * 3;
      glyph.style.setProperty('--fracture-transform', `translate(${x}px,${y}px) rotate(${angle}deg)`);
      glyph.style.transform = isReducedMotion() ? '' : 'var(--fracture-transform)';
    });
  }

  /**
   * Setzt alle Wort-Glyphen in ihre lesbare Form zurück.
   *
   * @param {object} state - Wort-Zustand.
   * @returns {void} Kein Rückgabewert.
   */
  function reformFractureWord(state) {
    state.glyphs.forEach(glyph => { glyph.style.transform = ''; });
  }

  /**
   * Stellt die Bruchform wieder her, wenn Bewegung erlaubt ist.
   *
   * @param {object} state - Wort-Zustand.
   * @returns {void} Kein Rückgabewert.
   */
  function fractureWord(state) {
    if (isReducedMotion() || state.element.classList.contains('is-reformed')) return;
    state.glyphs.forEach(glyph => { glyph.style.transform = 'var(--fracture-transform)'; });
  }

  /**
   * Synchronisiert die Wortdarstellung mit der Bewegungspräferenz.
   *
   * @param {object} state - Wort-Zustand.
   * @returns {void} Kein Rückgabewert.
   */
  function syncFractureMotion(state) {
    if (isReducedMotion()) reformFractureWord(state);
    else fractureWord(state);
  }

  /**
   * Schaltet die dauerhafte Reformation eines klickbaren Wortes um.
   *
   * @param {object} state - Wort-Zustand.
   * @returns {void} Kein Rückgabewert.
   */
  function toggleFractureWord(state) {
    state.element.classList.toggle('is-reformed');
    if (state.element.classList.contains('is-reformed')) reformFractureWord(state);
    else fractureWord(state);
  }

  /**
   * Registriert die Pointer-, Fokus- und Klickreaktionen eines Wortes.
   *
   * @param {object} state - Wort-Zustand.
   * @param {boolean} buttonMode - Ob das Wort dauerhaft umgeschaltet werden kann.
   * @returns {void} Kein Rückgabewert.
   */
  function bindFractureEvents(state, buttonMode) {
    const element = state.element;
    element.addEventListener('pointerenter', () => reformFractureWord(state));
    element.addEventListener('pointerleave', () => fractureWord(state));
    element.addEventListener('focus', () => reformFractureWord(state));
    element.addEventListener('blur', () => fractureWord(state));

    if (buttonMode) {
      element.addEventListener('click', () => toggleFractureWord(state));
    }

    motionPreference.addEventListener('change', () => syncFractureMotion(state));
    document.addEventListener('typebreak:motion', () => syncFractureMotion(state));
  }

  /**
   * Erstellt die Glyphen und Interaktionen eines gebrochenen Wortes.
   *
   * @param {HTMLElement} element - Textelement mit Bruchanimation.
   * @returns {void} Kein Rückgabewert.
   */
  function initFractureWord(element) {
    const label = element.dataset.fractureText;
    const target = element.querySelector('span:first-child');
    const buttonMode = element.classList.contains('fracture-word');
    target.classList.add('fracture-letters');
    const glyphs = splitLetters(target, label);

    if (buttonMode) element.setAttribute('aria-label', `Reform ${label}`);
    else element.setAttribute('aria-label', label);

    applyFractureOffsets(glyphs);
    bindFractureEvents({ element, glyphs }, buttonMode);
  }

  /**
   * Initialisiert die interaktiven Bruchtexte der Seite.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function initFractureText() {
    document.querySelectorAll('[data-fracture-text]').forEach(initFractureWord);
  }

  /* --------------------------------------------------------------------------
     05   Poster-Maker & PNG-Export
     -------------------------------------------------------------------------- */

  /**
   * Bricht Postertext anhand der tatsächlichen Canvas-Textbreite um.
   * Überlange Wörter werden bei Bedarf zeichenweise geteilt.
   *
   * @param {CanvasRenderingContext2D} ctx - Zeichenkontext.
   * @param {string} text - Postertext.
   * @param {number} maxWidth - Maximale Textbreite in Pixeln.
   * @returns {string[]} Umgebrochene Textzeilen.
   */
  function wrapPosterText(ctx, text, maxWidth) {
    const words = text.toUpperCase().split(/\s+/).filter(Boolean);
    const lines = [];
    let line = '';

    words.forEach(word => {
      const candidate = line ? `${line} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxWidth) { line = candidate; return; }
      if (line) { lines.push(line); line = ''; }
      if (ctx.measureText(word).width <= maxWidth) { line = word; return; }

      let segment = '';
      [...word].forEach(character => {
        if (ctx.measureText(segment + character).width > maxWidth && segment) {
          lines.push(segment);
          segment = '';
        }
        segment += character;
      });
      line = segment;
    });

    if (line) lines.push(line);
    return lines;
  }

  /**
   * Zeichnet die feste Posterfläche und den Kopfbereich.
   *
   * @param {object} state - Poster-Zustand.
   * @returns {void} Kein Rückgabewert.
   */
  function drawPosterBackground(state) {
    const { ctx, canvas } = state;
    const { width, height } = canvas;
    const margin = 64;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ebe7df';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#111111';
    ctx.font = '22px monospace';
    ctx.fillText('TYPE破BREAK  —  YOUR NEW FORM', margin, 90);
    ctx.fillStyle = '#e32746';
    ctx.fillRect(margin, 112, 150, 7);
  }

  /**
   * Zeichnet die Posterbotschaft mit passender Schriftgröße.
   *
   * @param {object} state - Poster-Zustand.
   * @param {string} message - Posterbotschaft.
   * @returns {void} Kein Rückgabewert.
   */
  function drawPosterMessage(state, message) {
    const { ctx, canvas, variation } = state;
    const margin = 64;
    let size = 152;
    let lines;

    // Schrift verkleinern, bis Textbreite und maximale Zeilenhöhe passen.
    do {
      ctx.font = `${size}px Anton, Impact, sans-serif`;
      lines = wrapPosterText(ctx, message || 'MAKE SOMETHING NEW.', canvas.width - margin * 2);
      if (lines.length <= 6 && lines.length * size * .93 < 780) break;
      size -= 6;
    } while (size >= 54);

    const lineHeight = size * .95;
    const startY = 360 + Math.max(0, (520 - lines.length * lineHeight) / 2);
    ctx.textBaseline = 'alphabetic';

    lines.forEach((line, index) => {
      ctx.fillStyle = '#111111';
      const freeSpace = Math.max(0, canvas.width - margin * 2 - ctx.measureText(line).width);
      const shift = variation === 0 ? 0 : variation === 1 ? Math.min(freeSpace, index % 2 ? 75 : 24) : Math.min(freeSpace, index % 2 ? 0 : 110);
      ctx.fillText(line, margin + shift, startY + index * lineHeight);
    });
  }

  /**
   * Zeichnet das variierende rote Schriftzeichen auf das Poster.
   *
   * @param {object} state - Poster-Zustand.
   * @returns {void} Kein Rückgabewert.
   */
  function drawPosterStamp(state) {
    const { ctx, canvas, variation } = state;
    ctx.save();
    ctx.globalAlpha = .78;
    ctx.translate(canvas.width * (variation === 1 ? .33 : variation === 2 ? .68 : .55), canvas.height * (variation === 2 ? .53 : .49));
    ctx.rotate(variation === 1 ? .14 : -.16);
    ctx.font = 'bold 400px CJK, serif';
    ctx.fillStyle = '#e32746';
    ctx.fillText(['新', '創', '変'][variation], -150, 30);
    ctx.restore();
  }

  /**
   * Zeichnet Trennlinie und Copyright-Text des Posters.
   *
   * @param {object} state - Poster-Zustand.
   * @returns {void} Kein Rückgabewert.
   */
  function drawPosterFooter(state) {
    const { ctx, canvas } = state;
    const margin = 64;
    ctx.fillStyle = '#111111';
    ctx.fillRect(margin, canvas.height - 192, canvas.width - margin * 2, 2);
    ctx.font = '24px monospace';
    ctx.fillText('NOTHING NEW WITHOUT BREAKING.', margin, canvas.height - 130);
    ctx.font = '18px monospace';
    ctx.fillStyle = '#77716b';
    ctx.fillText('REMAKE / NOT RESTORE  —  2026', margin, canvas.height - 80);
  }

  /**
   * Setzt die Poster-Vorschau aus ihren Zeichenebenen zusammen.
   *
   * @param {object} state - Poster-Zustand.
   * @param {string} message - Aktueller Postertext.
   * @returns {void} Kein Rückgabewert.
   */
  function renderPoster(state, message) {
    drawPosterBackground(state);
    drawPosterMessage(state, message);
    drawPosterStamp(state);
    drawPosterFooter(state);
  }

  /**
   * Übernimmt den eingegebenen Text und wechselt die Layoutvariation.
   *
   * @param {object} state - Poster-Zustand.
   * @param {Event} event - Submit-Ereignis.
   * @returns {void} Kein Rückgabewert.
   */
  function remixPoster(state, event) {
    event.preventDefault();
    const message = state.input.value.replace(/\s+/g, ' ').trim();
    if (!message) {
      state.input.focus();
      state.feedback.textContent = 'ADD A STATEMENT TO CREATE A POSTER.';
      return;
    }

    state.currentMessage = message;
    state.variation = (state.variation + 1) % 3;
    renderPoster(state, state.currentMessage);
    state.feedback.textContent = 'A NEW FORM HAS BEEN CREATED.';
  }

  /**
   * Aktualisiert Zeichenzähler und Poster-Vorschau nach einer Eingabe.
   *
   * @param {object} state - Poster-Zustand.
   * @returns {void} Kein Rückgabewert.
   */
  function updatePosterInput(state) {
    state.counter.textContent = `${state.input.value.length} / ${state.input.maxLength}`;
    state.feedback.textContent = '';
    cancelAnimationFrame(state.previewFrame);
    state.previewFrame = requestAnimationFrame(() => {
      state.currentMessage = state.input.value.replace(/\s+/g, ' ').trim() || 'MAKE SOMETHING NEW.';
      renderPoster(state, state.currentMessage);
    });
  }

  /**
   * Erstellt einen Download-Link für den generierten PNG-Blob.
   *
   * @param {object} state - Poster-Zustand.
   * @param {Blob|null} blob - Exportiertes Canvas-Bild.
   * @returns {void} Kein Rückgabewert.
   */
  function savePosterBlob(state, blob) {
    if (!blob) {
      state.feedback.textContent = 'EXPORT COULD NOT BE GENERATED.';
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'TYPE-BREAK-My-New-Form.png';
    link.click();
    // Temporäre Objekt-URL erst nach dem Auslösen des Downloads freigeben.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    state.feedback.textContent = 'POSTER READY TO SAVE.';

    if (state.input.value.trim()) {
      document.dispatchEvent(new CustomEvent('bp:study-achievement', { detail: 'study-type-poster' }));
    }
  }

  /**
   * Exportiert die aktuelle Posteransicht als PNG-Datei.
   *
   * @param {object} state - Poster-Zustand.
   * @returns {void} Kein Rückgabewert.
   */
  function exportPoster(state) {
    state.currentMessage = state.input.value.replace(/\s+/g, ' ').trim() || state.currentMessage;
    renderPoster(state, state.currentMessage);
    state.canvas.toBlob(blob => savePosterBlob(state, blob), 'image/png');
  }

  /**
   * Initialisiert den Poster-Maker und seine Formularinteraktionen.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function initPosterMaker() {
    const form = document.querySelector('#poster-form');
    const canvas = document.querySelector('#remake-canvas');
    if (!form || !canvas) return;

    const input = document.querySelector('#poster-message');
    const state = {
      form,
      input,
      canvas,
      ctx: canvas.getContext('2d'),
      counter: document.querySelector('#char-count'),
      feedback: document.querySelector('#poster-feedback'),
      download: document.querySelector('#download-poster'),
      currentMessage: input.value.trim(),
      variation: 0,
      previewFrame: 0,
    };

    input.addEventListener('input', () => updatePosterInput(state));
    form.addEventListener('submit', event => remixPoster(state, event));
    state.download.addEventListener('click', () => exportPoster(state));
    document.fonts.ready.then(() => renderPoster(state, state.currentMessage));
    state.counter.textContent = `${input.value.length} / ${input.maxLength}`;
  }

  /* --------------------------------------------------------------------------
     06   Scroll-Theatre & Abschnitts-Reveals
     -------------------------------------------------------------------------- */

  /**
   * Berechnet den Rückzugseffekt des Hero beim Scrollen.
   *
   * @param {HTMLElement|null} hero - Hero-Element.
   * @param {number} viewport - Viewport-Höhe.
   * @param {boolean} reduced - Aktivierte Bewegungsreduktion.
   * @returns {void} Kein Rückgabewert.
   */
  function renderHeroExit(hero, viewport, reduced) {
    if (!hero) return;

    const bounds = hero.getBoundingClientRect();
    const distance = Math.max(1, bounds.height - viewport);
    const exit = reduced ? 0 : smoothStep(clamp(-bounds.top / distance, 0, 1));
    hero.style.setProperty('--hero-exit', exit.toFixed(3));
  }

  /**
   * Aktualisiert die Animation einer sichtbaren Impact-Szene.
   *
   * @param {HTMLElement} scene - Aktuelle Scroll-Szene.
   * @param {number} sceneIndex - Position in der Szenenfolge.
   * @param {number} viewport - Viewport-Höhe.
   * @param {number} headerHeight - Höhe der Navigation.
   * @param {boolean} reduced - Aktivierte Bewegungsreduktion.
   * @returns {void} Kein Rückgabewert.
   */
  function renderImpactScene(scene, sceneIndex, viewport, headerHeight, reduced) {
    const bounds = scene.getBoundingClientRect();
    // Entfernte Szenen überspringen, um unnötige Layoutmessungen zu vermeiden.
    if (bounds.bottom < -viewport || bounds.top > viewport * 2) return;

    const scrollLength = Math.max(1, bounds.height - viewport + headerHeight);
    const progress = clamp((headerHeight - bounds.top) / scrollLength, 0, 1);
    const entered = reduced ? 1 : smoothStep(clamp(progress / .32, 0, 1));
    const leaving = reduced ? 0 : smoothStep(clamp((progress - .70) / .30, 0, 1));
    const direction = sceneIndex === 1 ? -1 : 1;
    const title = scene.querySelector('.impact__title');
    const words = scene.querySelectorAll('.impact__word');
    const accent = scene.querySelector('.impact__kanji');

    title.style.setProperty('--impact-out', leaving.toFixed(3));
    words.forEach((word, index) => {
      const slideDirection = index % 2 === 0 ? -direction : direction;
      const horizontal = (1 - entered) * 112 * slideDirection;
      const vertical = index === 2 ? (1 - entered) * 55 : 0;
      const rotation = (1 - entered) * (index % 2 === 0 ? -8 : 8);
      word.style.transform = reduced ? '' : `translate3d(${horizontal.toFixed(2)}vw,${vertical.toFixed(2)}vh,0) rotate(${rotation.toFixed(2)}deg)`;
    });

    if (accent) {
      const zoom = .62 + entered * .38 + leaving * 2.9;
      const opacity = (1 - leaving) * (.30 + entered * .65);
      accent.style.transform = reduced ? '' : `scale(${zoom.toFixed(3)})`;
      accent.style.opacity = reduced ? '' : opacity.toFixed(3);
    }
  }

  /**
   * Verschiebt die beiden Billboard-Zeilen anhand der Scrollposition.
   *
   * @param {HTMLElement|null} billboard - Typografie-Billboard.
   * @param {number} viewport - Viewport-Höhe.
   * @param {boolean} reduced - Aktivierte Bewegungsreduktion.
   * @returns {void} Kein Rückgabewert.
   */
  function renderBillboard(billboard, viewport, reduced) {
    if (!billboard) return;

    const bounds = billboard.getBoundingClientRect();
    if (bounds.bottom >= 0 && bounds.top <= viewport) {
      const local = reduced ? .5 : clamp((viewport - bounds.top) / (viewport + bounds.height), 0, 1);
      billboard.style.setProperty('--billboard-x1', `${((-1 + local * 2) * 22).toFixed(2)}vw`);
      billboard.style.setProperty('--billboard-x2', `${((1 - local * 2) * 22).toFixed(2)}vw`);
    }
  }

  /**
   * Synchronisiert sämtliche Scroll-Szenen mit der aktuellen Position.
   *
   * @param {object} state - Scroll-Theatre-Zustand.
   * @returns {void} Kein Rückgabewert.
   */
  function renderScrollTheatre(state) {
    state.pending = false;
    const viewport = window.innerHeight;
    const headerHeight = document.querySelector('.masthead')?.offsetHeight || 72;
    const reduced = isReducedMotion();

    state.scrollTopLink?.classList.toggle('is-visible', window.scrollY > viewport * .9);
    renderHeroExit(state.hero, viewport, reduced);
    state.scenes.forEach((scene, index) => renderImpactScene(scene, index, viewport, headerHeight, reduced));
    renderBillboard(state.billboard, viewport, reduced);
  }

  /**
   * Bündelt Scroll- und Resize-Ereignisse zu einem Animationsframe.
   *
   * @param {object} state - Scroll-Theatre-Zustand.
   * @returns {void} Kein Rückgabewert.
   */
  function requestScrollRender(state) {
    if (!state.pending) {
      state.pending = true;
      requestAnimationFrame(() => renderScrollTheatre(state));
    }
  }

  /**
   * Beobachtet die Abschnitts-Reveals und macht fokussierte Inhalte sichtbar.
   *
   * @param {HTMLElement[]} entrances - Elemente mit Eintrittsanimation.
   * @returns {void} Kein Rückgabewert.
   */
  function observeScrollEntrances(entrances) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    }, { threshold: 0.04, rootMargin: '0px 0px -7% 0px' });

    entrances.forEach(element => {
      observer.observe(element);
      element.addEventListener('focusin', () => element.classList.add('is-visible'));
    });
  }

  /**
   * Initialisiert Scroll-Szenen, Abschnitts-Reveals und Fortschrittsanzeigen.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function initScrollTheatre() {
    const state = {
      scenes: [...document.querySelectorAll('[data-impact]')],
      hero: document.querySelector('#system'),
      billboard: document.querySelector('[data-billboard]'),
      scrollTopLink: document.querySelector('#scroll-top'),
      pending: false,
    };
    const requestRender = () => requestScrollRender(state);

    observeScrollEntrances([...document.querySelectorAll('[data-enter]')]);
    window.addEventListener('scroll', requestRender, { passive: true });
    window.addEventListener('resize', requestRender, { passive: true });
    motionPreference.addEventListener('change', requestRender);
    document.addEventListener('typebreak:motion', requestRender);
    document.documentElement.classList.add('motion-ready');
    document.querySelector('#year').textContent = String(new Date().getFullYear());
    requestRender();
  }

  /* --------------------------------------------------------------------------
     07   Initialisierung
     -------------------------------------------------------------------------- */

  initScrollTheatre();
  initHero();
  initPressure();
  initFractureText();
  initPosterMaker();
})();
