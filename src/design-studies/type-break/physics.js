/**
 * @file Interaktive, frameworkfreie Typography-Stage.
 * @description Canvas-Glyphen reagieren auf Cursor-Kräfte und zerfallen in physikalische Bildfragmente.
 */
(() => {
  'use strict';

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
  const pointer = { x: -9999, y: -9999, lastX: -9999, lastY: -9999, down: false, id: null };
  const palette = { ink: '#111111', white: '#efeee7', acid: '#e52242' };
  let poster = { x: 0, y: 0, w: 0, h: 0 };
  let grainPattern = null;

  let width = 0;
  let height = 0;
  let mode = 'push';
  let letters = [];
  let fragments = [];
  let moving = false;
  let reducedMotion = mediaQuery.matches;
  let lastFrame = 0;
  let frameId = 0;
  let interactionCount = 0;
  let broken = false;
  let reforming = false;
  let grabbed = null;
  let stageVisible = false;

  /** Passt Canvas-Pixel an die tatsächliche Darstellungsgröße an. */
  function resize() {
    const bounds = container.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
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

  /** Verteilt echte Font-Glyphen auf zwei typografische Zeilen. */
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
    const layouts = lines.map(word => {
      const widths = [...word].map(char => context.measureText(char).width);
      const total = widths.reduce((sum, value) => sum + value, 0) + gap * (word.length - 1);
      return { word, widths, scale: Math.min(1.12, maxWidth / total) };
    });
    const lineHeight = fontSize * .93;
    const firstBaseline = poster.y + poster.h * .47;
    layouts.forEach((line, row) => {
      const total = line.widths.reduce((sum, value) => sum + value, 0) + gap * (line.word.length - 1);
      let currentX = poster.x + (poster.w - total * line.scale) / 2;
      [...line.word].forEach((char, index) => {
        const letterWidth = line.widths[index] * line.scale;
        const baseline = firstBaseline + row * lineHeight;
        letters.push({ char, row, x: currentX, y: baseline, homeX: currentX, homeY: baseline,
          width: letterWidth, size: fontSize * line.scale, vx: 0, vy: 0, angle: 0, va: 0 });
        currentX += (line.widths[index] + gap) * line.scale;
      });
    });
    stateLabel.textContent = 'STRUCTURE: INTACT';
    prompt.textContent = 'DRAG THE POSTER ↗';
  }

  /** Druckobjekt: Nur echte Glyphen erzeugen rote Überlagerungen, keine Linien-Spikes. */
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

  /** Rote Kalligrafie bildet eine eigenständige typografische Gegenstimme. */
  function drawCalligraphy() {
    context.save();
    context.beginPath();
    context.rect(poster.x, poster.y, poster.w, poster.h);
    context.clip();
    context.globalAlpha = broken ? .34 : .84;
    context.fillStyle = palette.acid;
    context.font = `bold ${poster.w * .63}px CJK, serif`;
    context.textBaseline = 'alphabetic';
    context.translate(poster.x + poster.w * .1, poster.y + poster.h * .40);
    context.rotate(-.11);
    context.fillText('破', 0, 0);
    context.restore();
    context.save();
    context.beginPath();
    context.rect(poster.x, poster.y, poster.w, poster.h);
    context.clip();
    context.globalAlpha = broken ? .34 : .79;
    context.fillStyle = palette.acid;
    context.font = `bold ${poster.w * .61}px CJK, serif`;
    context.textBaseline = 'alphabetic';
    context.translate(poster.x + poster.w * .36, poster.y + poster.h * .79);
    context.rotate(.1);
    context.fillText('壊', 0, 0);
    context.restore();
  }

  /** Zeichnet einen einzelnen Buchstaben inklusive seiner dynamischen Rotation. */
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

  /** Erzeugt aus jedem Glyphen eine transparente Textur und teilt sie in sichtbare Splitter. */
  function fracture() {
    if (broken) return;
    broken = true;
    reforming = false;
    grabbed = null;
    fragments = [];
    letters.forEach((letter, index) => {
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
          fragments.push({ image, sx, sy, sw, sh, x: centerX, y: centerY,
            originX: centerX, originY: centerY,
            vx: spread + (Math.random() - .5) * 6,
            vy: -Math.random() * 8 - 1 - index * .07,
            angle: 0, va: (Math.random() - .5) * .12 });
        }
      }
    });
    stateLabel.textContent = 'STRUCTURE: FRACTURED';
    prompt.textContent = '↺ REFORM TO START AGAIN';
    interactionCount = Math.min(100, interactionCount + 28);
  }

  /** Führt zerbrochene Glyphenfragmente physikalisch an ihre Ausgangsposition zurück. */
  function drawFragments(step) {
    let settled = true;
    fragments.forEach(fragment => {
      if (reforming) {
        const easing = 1 - Math.pow(.80, step);
        fragment.x += (fragment.originX - fragment.x) * easing;
        fragment.y += (fragment.originY - fragment.y) * easing;
        fragment.angle *= 1 - easing;
        if (Math.abs(fragment.x - fragment.originX) > .45 ||
            Math.abs(fragment.y - fragment.originY) > .45 ||
            Math.abs(fragment.angle) > .004) settled = false;
      } else if (!reducedMotion) {
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
      context.save();
      context.translate(fragment.x, fragment.y);
      context.rotate(fragment.angle);
      context.drawImage(fragment.image, fragment.sx, fragment.sy, fragment.sw, fragment.sh,
        -fragment.sw / 2, -fragment.sh / 2, fragment.sw, fragment.sh);
      context.restore();
    });

    if (reforming && settled) finishReform();
  }

  /** Schließt die Rückformung erst nach der sichtbaren Fragmentbewegung ab. */
  function finishReform() {
    layout();
    interactionCount = 0;
    prompt.style.opacity = '1';
    stateLabel.textContent = 'STRUCTURE: REFORMED';
  }

  /** Kräfte werden nur in der Nähe des Mauszeigers angewendet. */
  function updateLetters(step) {
    letters.forEach(letter => {
      if (reducedMotion) return;
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
      if (grabbed === letter && pointer.down) {
        letter.vx += (pointer.x - grabbed.grabOffsetX - letter.x) * .085 * step;
        letter.vy += (pointer.y - grabbed.grabOffsetY - letter.y) * .085 * step;
      }
      letter.vx += (letter.homeX - letter.x) * .012 * step;
      letter.vy += (letter.homeY - letter.y) * .012 * step;
      letter.va += -letter.angle * .01 * step;
      letter.vx *= Math.pow(.90, step);
      letter.vy *= Math.pow(.90, step);
      letter.va *= Math.pow(.88, step);
      letter.x += letter.vx * step;
      letter.y += letter.vy * step;
      letter.angle += letter.va * step;
    });
  }

  /** Ein einziger Animationsloop mit DPR-Limit und Sichtbarkeitsprüfung. */
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
    if (moving && !reducedMotion) {
      context.strokeStyle = palette.acid;
      context.lineWidth = 1;
      context.beginPath();
      context.arc(pointer.x, pointer.y, pointer.down ? 38 : 22, 0, Math.PI * 2);
      context.stroke();
    }
    counter.textContent = String(Math.floor(Math.min(100, interactionCount))).padStart(3, '0');
    frameId = requestAnimationFrame(render);
  }

  /** Übernimmt die Maus-/Touch-Koordinaten relativ zur Canvas-Bühne. */
  function updatePointer(event) {
    const bounds = container.getBoundingClientRect();
    pointer.lastX = pointer.x;
    pointer.lastY = pointer.y;
    pointer.x = event.clientX - bounds.left;
    pointer.y = event.clientY - bounds.top;
    moving = true;
  }

  function pickLetter() {
    return [...letters].reverse().find(letter => pointer.x >= letter.x - 15 && pointer.x <= letter.x + letter.width + 15 &&
      pointer.y >= letter.y - letter.size && pointer.y <= letter.y + letter.size * .12);
  }

  container.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.target !== canvas) return;
    updatePointer(event);
    pointer.down = true;
    pointer.id = event.pointerId;
    canvas.setPointerCapture(event.pointerId);
    container.classList.add('is-dragging');
    interactionCount = Math.min(100, interactionCount + 5);
    prompt.style.opacity = '0';
    if (mode === 'break') fracture();
    else if (mode === 'reform' && !reforming) reform();
    else if (!broken && !reducedMotion) {
      grabbed = pickLetter();
      if (grabbed) {
        grabbed.grabOffsetX = pointer.x - grabbed.x;
        grabbed.grabOffsetY = pointer.y - grabbed.y;
      }
    }
  });
  container.addEventListener('pointermove', event => {
    if (!moving && event.pointerType === 'touch' && !pointer.down) return;
    updatePointer(event);
    if (pointer.down && !broken && !reducedMotion) interactionCount = Math.min(100, interactionCount + .1);
    if (pointer.down && broken && !reforming && !reducedMotion) {
      fragments.forEach(fragment => {
        const dx = fragment.x - pointer.x;
        const dy = fragment.y - pointer.y;
        const dist = Math.max(1, Math.hypot(dx, dy));
        if (dist < 110) {
          const sign = mode === 'pull' ? -1 : 1;
          fragment.vx += sign * dx / dist * 1.5;
          fragment.vy += sign * dy / dist * 1.5;
        }
      });
    }
  });
  function releasePointer() { pointer.down = false; grabbed = null; pointer.id = null; container.classList.remove('is-dragging'); }
  canvas.addEventListener('pointerup', releasePointer);
  canvas.addEventListener('pointercancel', releasePointer);
  canvas.addEventListener('lostpointercapture', releasePointer);
  container.addEventListener('pointerleave', () => { if (!pointer.down) moving = false; });

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

  function selectMode(nextMode) {
    mode = nextMode;
    document.querySelectorAll('[data-mode]').forEach(button => {
      const active = button.dataset.mode === nextMode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (nextMode === 'reform') reform();
    if (nextMode === 'break') fracture();
    if (nextMode === 'push' || nextMode === 'pull') {
      stateLabel.textContent = broken ? 'STRUCTURE: FRACTURED' : `FORCE: ${nextMode.toUpperCase()}`;
    }
  }

  document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => selectMode(button.dataset.mode)));
  document.querySelector('#reset').addEventListener('click', () => { reform(); selectMode('push'); });
  function syncMotionLabel() {
    document.documentElement.classList.toggle('reduce-motion', reducedMotion);
    document.dispatchEvent(new Event('typebreak:motion'));
    motionButton.setAttribute('aria-pressed', String(reducedMotion));
    motionButton.textContent = `REDUCE MOTION: ${reducedMotion ? 'ON' : 'OFF'}`;
  }
  motionButton.addEventListener('click', () => { reducedMotion = !reducedMotion; syncMotionLabel(); reform(); });
  mediaQuery.addEventListener('change', event => { reducedMotion = event.matches; syncMotionLabel(); reform(); });
  window.addEventListener('resize', resize, { passive: true });
  document.fonts.ready.then(resize);
  const stageObserver = new IntersectionObserver(entries => {
    stageVisible = entries[0].isIntersecting;
    if (stageVisible && !frameId) frameId = requestAnimationFrame(render);
  });
  stageObserver.observe(container);
  syncMotionLabel();
  resize();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && stageVisible && !frameId) frameId = requestAnimationFrame(render);
  });
  window.addEventListener('pagehide', () => cancelAnimationFrame(frameId), { once: true });
})();
