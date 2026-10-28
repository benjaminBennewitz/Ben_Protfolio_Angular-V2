/**
 * @file physics.js
 * @description Steuert die Canvas-Physik, Fragmentierung und Interaktion der TYPE/BREAK-Stage.
 */

/* ==========================================================================
   INHALTSVERZEICHNIS

   01   DOM-Referenzen & Bühnenzustand
   02   Canvas-Größe & Typografie-Layout
   03   Poster & Glyphen zeichnen
   04   Fragmentierung & Rückformung
   05   Glyphen-Physik
   06   Rendering & Sichtbarkeit
   07   Pointer & Werkzeugsteuerung
   08   Motion-Einstellungen & Initialisierung
   ========================================================================== */

(() => {
  'use strict';

  /* --------------------------------------------------------------------------
     01   DOM-Referenzen & Bühnenzustand
     -------------------------------------------------------------------------- */

  const canvas = document.querySelector('#type-stage');
  const container = document.querySelector('#stage-wrap');
  const counter = document.querySelector('#live-counter');
  const stateLabel = document.querySelector('#stage-state');
  const prompt = document.querySelector('#stage-prompt');
  const motionButton = document.querySelector('#motion-toggle');

  if (!canvas || !container) return;

  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return;

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = {
    x: -9999,
    y: -9999,
    down: false,
  };
  const palette = {
    ink: '#111111',
    white: '#efeee7',
    acid: '#e52242',
  };
  const calligraphyGlyphs = [
    { char: '破', x: .1, y: .40, scale: .63, rotation: -.11, alpha: .84 },
    { char: '壊', x: .36, y: .79, scale: .61, rotation: .1, alpha: .79 },
  ];

  const poster = { x: 0, y: 0, w: 0, h: 0 };
  let width = 0;
  let height = 0;
  let letters = [];
  let fragments = [];

  // Bedien- und Simulationszustände bleiben im Modul gekapselt.
  let mode = 'push';
  let moving = false;
  let reducedMotion = mediaQuery.matches;
  let lastFrame = 0;
  let frameId = 0;
  let interactionCount = 0;
  let broken = false;
  let reforming = false;
  let trophyFractured = false;
  let trophyReforming = false;
  let grabbed = null;
  let stageVisible = false;

  /* --------------------------------------------------------------------------
     02   Canvas-Größe & Typografie-Layout
     -------------------------------------------------------------------------- */

  /**
   * Aktualisiert Canvas-Auflösung und Postergröße passend zur Bühne.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function resize() {
    // Layoutmaße statt transformierter Bounding-Box für die Canvas-Simulation verwenden.
    width = canvas.clientWidth;
    height = canvas.clientHeight;

    // Die Pixeldichte begrenzen, damit große Displays nicht unnötig viel rendern.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    poster.h = Math.min(height * .92, width * 1.35, 655);
    poster.w = Math.min(poster.h * .74, width * .86);
    poster.x = (width - poster.w) / 2;
    poster.y = (height - poster.h) / 2;
    layout();
  }

  /**
   * Ermittelt die Breiten und Skalierung einer typografischen Zeile.
   *
   * @param {string} word - Text der Zeile.
   * @param {number} gap - Abstand zwischen den Glyphen.
   * @param {number} maxWidth - Verfügbare Zeilenbreite.
   * @returns {{word: string, widths: number[], scale: number}} Zeilenlayout.
   */
  function measureLine(word, gap, maxWidth) {
    const widths = [...word].map(char => context.measureText(char).width);
    const total = widths.reduce((sum, value) => sum + value, 0) + gap * (word.length - 1);
    return { word, widths, scale: Math.min(1.12, maxWidth / total) };
  }

  /**
   * Positioniert die einzelnen Glyphen einer typografischen Zeile.
   *
   * @param {object} line - Gemessene Zeile.
   * @param {number} row - Zeilenindex.
   * @param {object} metrics - Schriftgröße, Abstände und erste Grundlinie.
   * @returns {void} Kein Rückgabewert.
   */
  function placeLineLetters(line, row, { fontSize, gap, firstBaseline, lineHeight }) {
    const total = line.widths.reduce((sum, value) => sum + value, 0) + gap * (line.word.length - 1);
    let currentX = poster.x + (poster.w - total * line.scale) / 2;

    [...line.word].forEach((char, index) => {
      const letterWidth = line.widths[index] * line.scale;
      const baseline = firstBaseline + row * lineHeight;
      letters.push({
        char, x: currentX, y: baseline, homeX: currentX, homeY: baseline,
        width: letterWidth, size: fontSize * line.scale,
        vx: 0, vy: 0, angle: 0, va: 0,
      });
      currentX += (line.widths[index] + gap) * line.scale;
    });
  }

  /**
   * Baut die beiden Glyphenzeilen neu auf und setzt den Bruchzustand zurück.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function layout() {
    letters = [];
    fragments = [];
    broken = false;
    reforming = false;

    const lines = ['TYPE', 'BREAK'];
    const fontSize = poster.w * .39;
    const maxWidth = poster.w * .82;
    const gap = -fontSize * .11;
    context.font = `${fontSize}px Anton, Impact, sans-serif`;

    const layouts = lines.map(word => measureLine(word, gap, maxWidth));
    const lineHeight = fontSize * .93;
    const firstBaseline = poster.y + poster.h * .47;
    const metrics = { fontSize, gap, firstBaseline, lineHeight };
    layouts.forEach((line, row) => placeLineLetters(line, row, metrics));

    stateLabel.textContent = 'STRUCTURE: INTACT';
    prompt.textContent = 'DRAG THE POSTER ↗';
  }

  /* --------------------------------------------------------------------------
     03   Poster & Glyphen zeichnen
     -------------------------------------------------------------------------- */

  /**
   * Zeichnet die Posterfläche mit Schatten und Druckmarkierungen.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function drawPoster() {
    context.save();
    context.shadowColor = 'rgba(0,0,0,.5)';
    context.shadowBlur = 36;
    context.shadowOffsetY = 18;
    context.fillStyle = palette.white;
    context.fillRect(poster.x, poster.y, poster.w, poster.h);
    context.restore();

    context.save();
    context.beginPath();
    context.rect(poster.x, poster.y, poster.w, poster.h);
    context.clip();
    context.strokeStyle = 'rgba(17,17,17,.26)';
    context.lineWidth = 1;

    const inset = poster.w * .075;
    for (const px of [poster.x + inset, poster.x + poster.w - inset]) {
      for (const py of [poster.y + inset, poster.y + poster.h - inset]) {
        context.beginPath();
        context.moveTo(px - 6, py);
        context.lineTo(px + 6, py);
        context.moveTo(px, py - 6);
        context.lineTo(px, py + 6);
        context.stroke();
      }
    }
    context.restore();
  }

  /**
   * Zeichnet ein kalligrafisches Zeichen innerhalb der Postergrenzen.
   *
   * @param {object} glyph - Zeichen und typografische Positionierung.
   * @returns {void} Kein Rückgabewert.
   */
  function drawKanji({ char, x, y, scale, rotation, alpha }) {
    context.save();
    context.beginPath();
    context.rect(poster.x, poster.y, poster.w, poster.h);
    context.clip();
    context.globalAlpha = broken ? .34 : alpha;
    context.fillStyle = palette.acid;
    context.font = `bold ${poster.w * scale}px CJK, serif`;
    context.textBaseline = 'alphabetic';
    context.translate(poster.x + poster.w * x, poster.y + poster.h * y);
    context.rotate(rotation);
    context.fillText(char, 0, 0);
    context.restore();
  }

  /**
   * Überlagert das Poster mit zwei roten kalligrafischen Zeichen.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function drawCalligraphy() {
    for (const glyph of calligraphyGlyphs) drawKanji(glyph);
  }

  /**
   * Zeichnet eine bewegliche Glyphe an ihrer aktuellen Position.
   *
   * @param {object} letter - Glyphenzustand mit Position und Rotation.
   * @returns {void} Kein Rückgabewert.
   */
  function drawLetter(letter) {
    context.save();
    context.translate(letter.x + letter.width / 2, letter.y - letter.size * .38);
    context.rotate(letter.angle);
    context.font = `${letter.size}px Anton, Impact, sans-serif`;
    context.textBaseline = 'alphabetic';
    context.fillStyle = palette.ink;
    context.fillText(letter.char, -letter.width / 2, letter.size * .38);
    context.restore();
  }

  /* --------------------------------------------------------------------------
     04   Fragmentierung & Rückformung
     -------------------------------------------------------------------------- */

  /**
   * Rendert eine Glyphe als Textur für ihre späteren Splitter.
   *
   * @param {object} letter - Zu fragmentierende Glyphe.
   * @returns {HTMLCanvasElement} Canvas mit der Glyphentextur.
   */
  function createGlyphTexture(letter) {
    const w = Math.ceil(letter.width + 12);
    const h = Math.ceil(letter.size * 1.15);
    const image = document.createElement('canvas');
    image.width = Math.max(w, 1);
    image.height = Math.max(h, 1);

    const ctx = image.getContext('2d');
    ctx.font = `${letter.size}px Anton, Impact, sans-serif`;
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = palette.ink;
    ctx.fillText(letter.char, 6, letter.size * .88);
    return image;
  }

  /**
   * Zerlegt die Glyphentextur in zwölf physikalische Fragmente.
   *
   * @param {object} letter - Ausgangsglyphe und deren Position.
   * @param {number} index - Glyphenindex für den vertikalen Impuls.
   * @returns {void} Kein Rückgabewert.
   */
  function createLetterFragments(letter, index) {
    const image = createGlyphTexture(letter);
    const columns = 3;
    const rows = 4;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const sx = Math.floor(x * image.width / columns);
        const sy = Math.floor(y * image.height / rows);
        const sw = Math.ceil((x + 1) * image.width / columns) - sx;
        const sh = Math.ceil((y + 1) * image.height / rows) - sy;
        const centerX = letter.x + sx - 6 + sw / 2;
        const centerY = letter.y - letter.size * .88 + sy + sh / 2;
        const spread = (x - 1) * 1.7;

        fragments.push({
          image, sx, sy, sw, sh, x: centerX, y: centerY,
          originX: centerX, originY: centerY,
          vx: spread + (Math.random() - .5) * 6,
          vy: -Math.random() * 8 - 1 - index * .07,
          angle: 0, va: (Math.random() - .5) * .12,
        });
      }
    }
  }

  /**
   * Startet den Bruchzustand und erzeugt Splitter für alle Glyphen.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function fracture() {
    if (broken) return;
    trophyFractured = true;
    broken = true;
    reforming = false;
    grabbed = null;
    fragments = [];

    letters.forEach(createLetterFragments);
    stateLabel.textContent = 'STRUCTURE: FRACTURED';
    prompt.textContent = '↺ REFORM TO START AGAIN';
    interactionCount = Math.min(100, interactionCount + 28);
  }

  /**
   * Bewegt ein Fragment schrittweise zu seiner ursprünglichen Position zurück.
   *
   * @param {object} fragment - Zurückzuführendes Fragment.
   * @param {number} step - Zeitfaktor seit dem letzten Frame.
   * @returns {boolean} Ob Position und Rotation weitgehend zurückgesetzt sind.
   */
  function updateReformingFragment(fragment, step) {
    const easing = 1 - Math.pow(.80, step);
    fragment.x += (fragment.originX - fragment.x) * easing;
    fragment.y += (fragment.originY - fragment.y) * easing;
    fragment.angle *= 1 - easing;

    return !(Math.abs(fragment.x - fragment.originX) > .45 ||
      Math.abs(fragment.y - fragment.originY) > .45 ||
      Math.abs(fragment.angle) > .004);
  }

  /**
   * Simuliert ein freies Fragment mit Schwerkraft, Reibung und Randkollisionen.
   *
   * @param {object} fragment - Zu bewegendes Fragment.
   * @param {number} step - Zeitfaktor seit dem letzten Frame.
   * @returns {void} Kein Rückgabewert.
   */
  function updateLooseFragment(fragment, step) {
    fragment.vy += .32 * step;
    fragment.x += fragment.vx * step;
    fragment.y += fragment.vy * step;
    fragment.angle += fragment.va * step;
    fragment.vx *= Math.pow(.995, step);

    const radius = Math.max(fragment.sw, fragment.sh) / 2;
    if (fragment.y > poster.y + poster.h - radius) {
      fragment.y = poster.y + poster.h - radius;
      fragment.vy *= -.45;
      fragment.vx *= .85;
      fragment.va *= .9;
    }
    if (fragment.x < poster.x + radius || fragment.x > poster.x + poster.w - radius) {
      fragment.x = Math.min(poster.x + poster.w - radius, Math.max(poster.x + radius, fragment.x));
      fragment.vx *= -.65;
    }
  }

  /**
   * Zeichnet einen Splitter mit seiner Position und Rotation.
   *
   * @param {object} fragment - Bildausschnitt und Transformationszustand.
   * @returns {void} Kein Rückgabewert.
   */
  function drawFragment(fragment) {
    context.save();
    context.translate(fragment.x, fragment.y);
    context.rotate(fragment.angle);
    context.drawImage(fragment.image, fragment.sx, fragment.sy, fragment.sw, fragment.sh,
      -fragment.sw / 2, -fragment.sh / 2, fragment.sw, fragment.sh);
    context.restore();
  }

  /**
   * Aktualisiert und zeichnet alle Splitter; beendet eine abgeschlossene Rückformung.
   *
   * @param {number} step - Zeitfaktor seit dem letzten Frame.
   * @returns {void} Kein Rückgabewert.
   */
  function drawFragments(step) {
    let settled = true;

    fragments.forEach(fragment => {
      if (reforming) {
        if (!updateReformingFragment(fragment, step)) settled = false;
      } else if (!reducedMotion) {
        updateLooseFragment(fragment, step);
      }
      drawFragment(fragment);
    });

    if (reforming && settled) finishReform();
  }

  /**
   * Schließt die Rückformung ab und setzt die Glyphenbühne zurück.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function finishReform() {
    if (trophyReforming) {
      document.dispatchEvent(new CustomEvent('bp:study-achievement', { detail: 'study-type-reform' }));
      trophyReforming = false;
    }
    layout();
    interactionCount = 0;
    prompt.style.opacity = '1';
    stateLabel.textContent = 'STRUCTURE: REFORMED';
  }

  /**
   * Leitet die Rückformung ein oder beendet sie bei reduzierter Bewegung sofort.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function reform() {
    grabbed = null;
    pointer.down = false;
    if (!broken || reducedMotion) {
      finishReform();
      return;
    }
    if (reforming) return;
    reforming = true;
    stateLabel.textContent = 'STRUCTURE: REFORMING';
    prompt.textContent = 'REBUILDING STRUCTURE…';
    prompt.style.opacity = '1';
  }

  /* --------------------------------------------------------------------------
     05   Glyphen-Physik
     -------------------------------------------------------------------------- */

  /**
   * Wendet die gewählte Push- oder Pull-Kraft auf eine Glyphe an.
   *
   * @param {object} letter - Bewegliche Glyphe.
   * @param {number} step - Zeitfaktor seit dem letzten Frame.
   * @returns {void} Kein Rückgabewert.
   */
  function applyPointerForce(letter, step) {
    const centerX = letter.x + letter.width / 2;
    const centerY = letter.y - letter.size * .38;
    const dx = centerX - pointer.x;
    const dy = centerY - pointer.y;
    const distance = Math.max(15, Math.hypot(dx, dy));
    const influence = Math.max(0, 1 - distance / Math.max(115, letter.size * 1.1));

    if (pointer.down && mode !== 'reform' && influence > 0) {
      const direction = mode === 'pull' ? -1 : 1;
      letter.vx += dx / distance * influence * 2.8 * direction * step;
      letter.vy += dy / distance * influence * 2.8 * direction * step;
      letter.va += (dx / distance) * influence * .002 * step;
    }
  }

  /**
   * Zieht eine gegriffene Glyphe in Richtung des Pointers.
   *
   * @param {object} letter - Bewegliche Glyphe.
   * @param {number} step - Zeitfaktor seit dem letzten Frame.
   * @returns {void} Kein Rückgabewert.
   */
  function applyGrabForce(letter, step) {
    if (grabbed === letter && pointer.down) {
      letter.vx += (pointer.x - grabbed.grabOffsetX - letter.x) * .085 * step;
      letter.vy += (pointer.y - grabbed.grabOffsetY - letter.y) * .085 * step;
    }
  }

  /**
   * Führt eine Glyphe gedämpft zu ihrem Ausgangspunkt zurück.
   *
   * @param {object} letter - Bewegliche Glyphe.
   * @param {number} step - Zeitfaktor seit dem letzten Frame.
   * @returns {void} Kein Rückgabewert.
   */
  function settleLetter(letter, step) {
    letter.vx += (letter.homeX - letter.x) * .012 * step;
    letter.vy += (letter.homeY - letter.y) * .012 * step;
    letter.va += -letter.angle * .01 * step;
    letter.vx *= Math.pow(.90, step);
    letter.vy *= Math.pow(.90, step);
    letter.va *= Math.pow(.88, step);
    letter.x += letter.vx * step;
    letter.y += letter.vy * step;
    letter.angle += letter.va * step;
  }

  /**
   * Aktualisiert die Positionen aller Glyphen im intakten Poster.
   *
   * @param {number} step - Zeitfaktor seit dem letzten Frame.
   * @returns {void} Kein Rückgabewert.
   */
  function updateLetters(step) {
    letters.forEach(letter => {
      if (reducedMotion) return;
      applyPointerForce(letter, step);
      applyGrabForce(letter, step);
      settleLetter(letter, step);
    });
  }

  /* --------------------------------------------------------------------------
     06   Rendering & Sichtbarkeit
     -------------------------------------------------------------------------- */

  /**
   * Zeichnet den Kreis zur aktiven Pointer-Interaktion.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function drawPointerIndicator() {
    if (!moving || reducedMotion) return;
    context.strokeStyle = palette.acid;
    context.lineWidth = 1;
    context.beginPath();
    context.arc(pointer.x, pointer.y, pointer.down ? 38 : 22, 0, Math.PI * 2);
    context.stroke();
  }

  /**
   * Rendert den nächsten Frame und begrenzt den physikalischen Zeitschritt.
   *
   * @param {number} timestamp - Zeitstempel von requestAnimationFrame.
   * @returns {void} Kein Rückgabewert.
   */
  function render(timestamp) {
    frameId = 0;
    if (document.hidden || !stageVisible || !width || !height) return;
    const step = Math.min((timestamp - (lastFrame || timestamp)) / 16.667, 2);
    lastFrame = timestamp;

    context.clearRect(0, 0, width, height);
    drawPoster();
    if (broken) drawFragments(step);
    else {
      updateLetters(step);
      letters.forEach(drawLetter);
    }
    drawCalligraphy();
    drawPointerIndicator();
    counter.textContent = String(Math.floor(Math.min(100, interactionCount))).padStart(3, '0');
    frameId = requestAnimationFrame(render);
  }

  /**
   * Startet Rendering nur bei sichtbarer Bühne und ohne laufenden Frame.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function startRenderIfVisible() {
    if (!document.hidden && stageVisible && !frameId) frameId = requestAnimationFrame(render);
  }

  /**
   * Aktualisiert die Sichtbarkeit der Bühne anhand des Observers.
   *
   * @param {IntersectionObserverEntry[]} entries - Beobachtete Sichtbarkeitswechsel.
   * @returns {void} Kein Rückgabewert.
   */
  function handleStageVisibility(entries) {
    stageVisible = entries[0].isIntersecting;
    if (stageVisible && !frameId) frameId = requestAnimationFrame(render);
  }

  /* --------------------------------------------------------------------------
     07   Pointer & Werkzeugsteuerung
     -------------------------------------------------------------------------- */

  /**
   * Überträgt Pointer-Koordinaten in das lokale Bühnen-Koordinatensystem.
   *
   * @param {PointerEvent} event - Pointer-Ereignis.
   * @returns {void} Kein Rückgabewert.
   */
  function updatePointer(event) {
    const bounds = canvas.getBoundingClientRect();
    // CSS-Transformationen der Bühne bei der Pointer-Position berücksichtigen.
    pointer.x = (event.clientX - bounds.left) * (width / bounds.width);
    pointer.y = (event.clientY - bounds.top) * (height / bounds.height);
    moving = true;
  }

  /**
   * Sucht die oberste Glyphe unter dem aktuellen Pointer.
   *
   * @returns {object|undefined} Getroffene Glyphe oder undefined.
   */
  function pickLetter() {
    return [...letters].reverse().find(letter =>
      pointer.x >= letter.x - 15 &&
      pointer.x <= letter.x + letter.width + 15 &&
      pointer.y >= letter.y - letter.size &&
      pointer.y <= letter.y + letter.size * .12);
  }

  /**
   * Merkt sich die unter dem Pointer gegriffene Glyphe und den Griffversatz.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function grabLetter() {
    grabbed = pickLetter();
    if (grabbed) {
      grabbed.grabOffsetX = pointer.x - grabbed.x;
      grabbed.grabOffsetY = pointer.y - grabbed.y;
    }
  }

  /**
   * Beginnt eine Interaktion und führt das aktuelle Werkzeug aus.
   *
   * @param {PointerEvent} event - Pointer-Down-Ereignis.
   * @returns {void} Kein Rückgabewert.
   */
  function handlePointerDown(event) {
    if (event.button !== 0 || event.target !== canvas) return;
    updatePointer(event);
    pointer.down = true;
    canvas.setPointerCapture(event.pointerId);
    container.classList.add('is-dragging');
    interactionCount = Math.min(100, interactionCount + 5);
    prompt.style.opacity = '0';

    if (mode === 'break') fracture();
    else if (mode === 'reform' && !reforming) reform();
    else if (!broken && !reducedMotion) grabLetter();
  }

  /**
   * Lenkt lose Fragmente bei Pointer-Bewegung durch Push- oder Pull-Kräfte.
   *
   * @param {object} fragment - Zu beeinflussendes Fragment.
   * @returns {void} Kein Rückgabewert.
   */
  function applyFragmentPointerForce(fragment) {
    const dx = fragment.x - pointer.x;
    const dy = fragment.y - pointer.y;
    const dist = Math.max(1, Math.hypot(dx, dy));

    if (dist < 110) {
      const sign = mode === 'pull' ? -1 : 1;
      fragment.vx += sign * dx / dist * 1.5;
      fragment.vy += sign * dy / dist * 1.5;
    }
  }

  /**
   * Aktualisiert den Pointer und überträgt Bewegungsimpulse auf die Bühne.
   *
   * @param {PointerEvent} event - Pointer-Move-Ereignis.
   * @returns {void} Kein Rückgabewert.
   */
  function handlePointerMove(event) {
    if (!moving && event.pointerType === 'touch' && !pointer.down) return;
    updatePointer(event);
    if (pointer.down && !broken && !reducedMotion) interactionCount = Math.min(100, interactionCount + .1);
    if (pointer.down && broken && !reforming && !reducedMotion) {
      fragments.forEach(applyFragmentPointerForce);
    }
  }

  /**
   * Beendet Dragging und gibt die aktuell gegriffene Glyphe frei.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function releasePointer() {
    pointer.down = false;
    grabbed = null;
    container.classList.remove('is-dragging');
  }

  /**
   * Deaktiviert den Pointer-Indikator nach dem Verlassen der Bühne.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function handlePointerLeave() {
    if (!pointer.down) moving = false;
  }

  /**
   * Synchronisiert aktive Werkzeug-Buttons und deren ARIA-Zustand.
   *
   * @param {string} nextMode - Gewählter Werkzeugmodus.
   * @returns {void} Kein Rückgabewert.
   */
  function updateModeButtons(nextMode) {
    document.querySelectorAll('[data-mode]').forEach(button => {
      const active = button.dataset.mode === nextMode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  /**
   * Aktiviert ein Werkzeug und stößt gegebenenfalls Bruch oder Rückformung an.
   *
   * @param {string} nextMode - Gewählter Werkzeugmodus.
   * @returns {void} Kein Rückgabewert.
   */
  function selectMode(nextMode) {
    mode = nextMode;
    updateModeButtons(nextMode);

    if (nextMode === 'reform') {
      trophyReforming = trophyFractured && broken;
      reform();
    }
    if (nextMode === 'break') fracture();
    if (nextMode === 'push' || nextMode === 'pull') {
      stateLabel.textContent = broken ? 'STRUCTURE: FRACTURED' : `FORCE: ${nextMode.toUpperCase()}`;
    }
  }

  /**
   * Setzt die Bühne zurück und aktiviert wieder den Push-Modus.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function resetStage() {
    reform();
    selectMode('push');
  }

  /**
   * Bindet Pointer-Ereignisse und Werkzeug-Buttons der Bühne.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function bindStageControls() {
    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', releasePointer);
    canvas.addEventListener('pointercancel', releasePointer);
    canvas.addEventListener('lostpointercapture', releasePointer);
    container.addEventListener('pointerleave', handlePointerLeave);
    document.querySelectorAll('[data-mode]').forEach(button =>
      button.addEventListener('click', () => selectMode(button.dataset.mode)));
    document.querySelector('#reset').addEventListener('click', resetStage);
  }

  /* --------------------------------------------------------------------------
     08   Motion-Einstellungen & Initialisierung
     -------------------------------------------------------------------------- */

  /**
   * Überträgt die Motion-Einstellung an Styles, weitere Scripts und Bedienoberfläche.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function syncMotionLabel() {
    document.documentElement.classList.toggle('reduce-motion', reducedMotion);
    container.classList.toggle('has-custom-pointer', !reducedMotion);
    document.dispatchEvent(new Event('typebreak:motion'));
    motionButton.setAttribute('aria-pressed', String(reducedMotion));
    motionButton.textContent = `REDUCE MOTION: ${reducedMotion ? 'ON' : 'OFF'}`;
  }

  /**
   * Schaltet reduzierte Bewegungen manuell um und stellt die Bühne zurück.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function toggleReducedMotion() {
    reducedMotion = !reducedMotion;
    syncMotionLabel();
    reform();
  }

  /**
   * Übernimmt Änderungen an der systemseitigen Bewegungspräferenz.
   *
   * @param {MediaQueryListEvent} event - Geänderte Motion-Media-Query.
   * @returns {void} Kein Rückgabewert.
   */
  function handleMotionPreference(event) {
    reducedMotion = event.matches;
    syncMotionLabel();
    reform();
  }

  /**
   * Registriert die Bühnenereignisse und startet die Canvas-Simulation.
   *
   * @returns {void} Kein Rückgabewert.
   */
  function initStage() {
    bindStageControls();
    motionButton.addEventListener('click', toggleReducedMotion);
    mediaQuery.addEventListener('change', handleMotionPreference);
    window.addEventListener('resize', resize, { passive: true });
    document.fonts.ready.then(resize);

    const stageObserver = new IntersectionObserver(handleStageVisibility);
    stageObserver.observe(container);
    syncMotionLabel();
    resize();
    document.addEventListener('visibilitychange', startRenderIfVisible);
    window.addEventListener('pagehide', () => cancelAnimationFrame(frameId), { once: true });
  }

  initStage();
})();
