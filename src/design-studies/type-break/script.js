/**
 * @file Steuerung der TYPE//BREAK-Experience.
 * @description Kinetische Typografie, Scroll-Druck, interaktive Wort-Reformation und Poster-Export.
 */
(() => {
  'use strict';

  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const isReducedMotion = () => motionPreference.matches || document.documentElement.classList.contains('reduce-motion');

  /** Erzeugt eine sanfte, zeitunabhängige Interpolation zwischen 0 und 1. */
  const smoothStep = value => value * value * (3 - 2 * value);

  /** Erzeugt einzeln animierbare Glyphen, ohne den zugänglichen Text zu verlieren. */
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

  /** Lässt Hero-Glyphen ohne Werkzeugwahl auf die Maus reagieren. */
  function initHero() {
    const hero = document.querySelector('#hero-pull');
    if (!hero) return;
    const groups = [...hero.querySelectorAll('[data-kinetic]')].map(element =>
      splitLetters(element, element.dataset.kinetic)
    );
    const glyphs = groups.flat();
    const current = glyphs.map(() => ({ x: 0, y: 0, angle: 0, scale: 1 }));
    const centers = glyphs.map(() => ({ x: 0, y: 0 }));

    function updateCenters() {
      glyphs.forEach((glyph, index) => {
        const bounds = glyph.getBoundingClientRect();
        centers[index].x = bounds.left + bounds.width / 2 - current[index].x;
        centers[index].y = bounds.top + bounds.height / 2 - current[index].y;
      });
    }
    const pointer = { x: -10000, y: -10000, active: false };
    let animationFrame = 0;
    let visible = true;

    /** Aktualisiert nur Transform-Werte; die Glyphenpositionen bleiben im DOM. */
    function tick() {
      animationFrame = 0;
      if (!visible || isReducedMotion()) return;
      let unsettled = false;
      glyphs.forEach((glyph, index) => {
        const centerX = centers[index].x;
        const centerY = centers[index].y;
        const dx = pointer.x - centerX;
        const dy = pointer.y - centerY;
        const distance = Math.hypot(dx, dy);
        const influence = pointer.active ? Math.pow(clamp(1 - distance / 345, 0, 1), 1.55) : 0;
        const targetX = dx * influence * .42;
        const targetY = dy * influence * .44;
        const targetAngle = clamp(dx / 80, -3, 3) * influence;
        const targetScale = 1 + influence * .18;
        const state = current[index];
        state.x += (targetX - state.x) * .16;
        state.y += (targetY - state.y) * .16;
        state.angle += (targetAngle - state.angle) * .16;
        state.scale += (targetScale - state.scale) * .16;
        glyph.style.transform = `translate3d(${state.x.toFixed(2)}px,${state.y.toFixed(2)}px,0) rotate(${state.angle.toFixed(2)}deg) scale(${state.scale.toFixed(3)})`;
        if (Math.abs(targetX - state.x) > .15 || Math.abs(targetY - state.y) > .15 || Math.abs(targetAngle - state.angle) > .1 || Math.abs(targetScale - state.scale) > .003) unsettled = true;
      });
      if (unsettled) animationFrame = requestAnimationFrame(tick);
    }

    function queueFrame() {
      if (!animationFrame && visible && !isReducedMotion()) animationFrame = requestAnimationFrame(tick);
    }

    hero.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'touch') return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      queueFrame();
    }, { passive: true });
    hero.addEventListener('pointerup', () => { pointer.active = false; queueFrame(); });
    hero.addEventListener('pointercancel', () => { pointer.active = false; queueFrame(); });
    hero.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      queueFrame();
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { pointer.active = false; queueFrame(); });
    hero.addEventListener('pointerenter', updateCenters);
    window.addEventListener('resize', updateCenters, { passive: true });
    document.fonts.ready.then(updateCenters);
    updateCenters();
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible) { updateCenters(); queueFrame(); }
    });
    observer.observe(hero);
    function syncHeroMotion() {
      if (isReducedMotion()) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        glyphs.forEach(glyph => { glyph.style.transform = ''; });
        current.forEach(state => { state.x = 0; state.y = 0; state.angle = 0; state.scale = 1; });
      } else queueFrame();
    }
    motionPreference.addEventListener('change', syncHeroMotion);
    document.addEventListener('typebreak:motion', syncHeroMotion);
  }

  /** Scrollstrecke wird zur Ursache der typografischen Kompression. */
  function initPressure() {
    const section = document.querySelector('#pressure');
    const meter = document.querySelector('#pressure-meter');
    const fill = document.querySelector('#pressure-fill');
    const output = document.querySelector('#pressure-percent');
    const words = [...document.querySelectorAll('.pressure__word')];
    let queued = false;

    function update() {
      queued = false;
      const bounds = section.getBoundingClientRect();
      const available = Math.max(1, bounds.height - window.innerHeight);
      const progress = clamp(-bounds.top / available, 0, 1);
      const percent = Math.round(progress * 100);
      meter.setAttribute('aria-valuenow', String(percent));
      output.textContent = `${String(percent).padStart(2, '0')}%`;
      fill.style.width = `${percent}%`;
      const compression = isReducedMotion() ? 0 : progress;
      const rupture = isReducedMotion() ? 0 : smoothStep(clamp((progress - .63) / .29, 0, 1));
      section.style.setProperty('--pressure-p', compression.toFixed(3));
      section.style.setProperty('--pressure-break', rupture.toFixed(3));
      words.forEach((word, index) => {
        const scale = 1 - compression * (index === 1 ? .5 : .3);
        const skew = (index % 2 === 0 ? -1 : 1) * compression * 12;
        const rotation = [7, -9, 5][index] * compression;
        const offset = [-.1, .12, -.13][index] * compression * window.innerWidth;
        word.style.transform = `translate3d(${offset.toFixed(1)}px,${(compression * index * 24).toFixed(1)}px,0) rotate(${rotation.toFixed(1)}deg) scaleX(${scale.toFixed(3)}) skewX(${skew.toFixed(2)}deg)`;
        word.style.letterSpacing = `${-compression * 8}px`;
      });
    }

    function requestUpdate() {
      if (!queued) { queued = true; requestAnimationFrame(update); }
    }
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    motionPreference.addEventListener('change', requestUpdate);
    document.addEventListener('typebreak:motion', requestUpdate);
    update();
  }

  /** Erzeugt typografische Bruchlagen anstelle von Glitch-/RGB-Effekten. */
  function initFractureText() {
    const elements = document.querySelectorAll('[data-fracture-text]');
    elements.forEach(element => {
      const label = element.dataset.fractureText;
      const target = element.querySelector('span:first-child');
      const buttonMode = element.classList.contains('fracture-word');
      target.classList.add('fracture-letters');
      const glyphs = splitLetters(target, label);
      if (buttonMode) element.setAttribute('aria-label', `Reform ${label}`);
      else element.setAttribute('aria-label', label);
      glyphs.forEach((glyph, index) => {
        const step = index + 1;
        const x = (step % 3 - 1) * 5;
        const y = ((step * 7) % 5 - 2) * 5;
        const angle = ((step * 11) % 9 - 4) * 3;
        glyph.style.setProperty('--fracture-transform', `translate(${x}px,${y}px) rotate(${angle}deg)`);
        glyph.style.transform = isReducedMotion() ? '' : 'var(--fracture-transform)';
      });
      const reform = () => glyphs.forEach(glyph => { glyph.style.transform = ''; });
      const fracture = () => {
        if (isReducedMotion() || element.classList.contains('is-reformed')) return;
        glyphs.forEach(glyph => { glyph.style.transform = 'var(--fracture-transform)'; });
      };
      element.addEventListener('pointerenter', reform);
      element.addEventListener('pointerleave', fracture);
      element.addEventListener('focus', reform);
      element.addEventListener('blur', fracture);
      if (buttonMode) {
        element.addEventListener('click', () => {
          element.classList.toggle('is-reformed');
          if (element.classList.contains('is-reformed')) reform();
          else fracture();
        });
      }
      const syncLetters = () => { if (isReducedMotion()) reform(); else fracture(); };
      motionPreference.addEventListener('change', syncLetters);
      document.addEventListener('typebreak:motion', syncLetters);
    });
  }

  /** Rendert benutzerdefinierte Poster ohne Canvas-Textur-Assets und ohne zusätzliche Library. */
  function initPosterMaker() {
    const form = document.querySelector('#poster-form');
    const input = document.querySelector('#poster-message');
    const canvas = document.querySelector('#remake-canvas');
    const counter = document.querySelector('#char-count');
    const feedback = document.querySelector('#poster-feedback');
    const download = document.querySelector('#download-poster');
    if (!form || !canvas) return;
    const ctx = canvas.getContext('2d');
    let currentMessage = input.value.trim();
    let variation = 0;
    let previewFrame = 0;

    /** Passt Textzeilen an die feste Druckbreite des exportierbaren Posters an. */
    function wrapPosterText(text, maxWidth) {
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

    function renderPoster(message) {
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

      let size = 152;
      let lines;
      do {
        ctx.font = `${size}px Anton, Impact, sans-serif`;
        lines = wrapPosterText(message || 'MAKE SOMETHING NEW.', width - margin * 2);
        if (lines.length <= 6 && lines.length * size * .93 < 780) break;
        size -= 6;
      } while (size >= 54);
      const lineHeight = size * .95;
      const startY = 360 + Math.max(0, (520 - lines.length * lineHeight) / 2);
      ctx.textBaseline = 'alphabetic';
      lines.forEach((line, index) => {
        ctx.fillStyle = '#111111';
        const freeSpace = Math.max(0, width - margin * 2 - ctx.measureText(line).width);
        const shift = variation === 0 ? 0 : variation === 1 ? Math.min(freeSpace, index % 2 ? 75 : 24) : Math.min(freeSpace, index % 2 ? 0 : 110);
        ctx.fillText(line, margin + shift, startY + index * lineHeight);
      });
      ctx.save();
      ctx.globalAlpha = .78;
      ctx.translate(width * (variation === 1 ? .33 : variation === 2 ? .68 : .55), height * (variation === 2 ? .53 : .49));
      ctx.rotate(variation === 1 ? .14 : -.16);
      ctx.font = 'bold 400px CJK, serif';
      ctx.fillStyle = '#e32746';
      ctx.fillText(['新', '創', '変'][variation], -150, 30);
      ctx.restore();
      ctx.fillStyle = '#111111';
      ctx.fillRect(margin, height - 192, width - margin * 2, 2);
      ctx.font = '24px monospace';
      ctx.fillText('NOTHING NEW WITHOUT BREAKING.', margin, height - 130);
      ctx.font = '18px monospace';
      ctx.fillStyle = '#77716b';
      ctx.fillText('REMAKE / NOT RESTORE  —  2026', margin, height - 80);
    }

    function remix(event) {
      event.preventDefault();
      const message = input.value.replace(/\s+/g, ' ').trim();
      if (!message) { input.focus(); feedback.textContent = 'ADD A STATEMENT TO CREATE A POSTER.'; return; }
      currentMessage = message;
      variation = (variation + 1) % 3;
      renderPoster(currentMessage);
      feedback.textContent = 'A NEW FORM HAS BEEN CREATED.';
    }

    input.addEventListener('input', () => {
      counter.textContent = `${input.value.length} / ${input.maxLength}`;
      feedback.textContent = '';
      cancelAnimationFrame(previewFrame);
      previewFrame = requestAnimationFrame(() => {
        currentMessage = input.value.replace(/\s+/g, ' ').trim() || 'MAKE SOMETHING NEW.';
        renderPoster(currentMessage);
      });
    });
    form.addEventListener('submit', remix);
    download.addEventListener('click', () => {
      currentMessage = input.value.replace(/\s+/g, ' ').trim() || currentMessage;
      renderPoster(currentMessage);
      canvas.toBlob(blob => {
        if (!blob) { feedback.textContent = 'EXPORT COULD NOT BE GENERATED.'; return; }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'TYPE-BREAK-My-New-Form.png';
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        feedback.textContent = 'POSTER READY TO SAVE.';
        if (input.value.trim()) document.dispatchEvent(new CustomEvent('bp:study-achievement', { detail: 'study-type-poster' }));
      }, 'image/png');
    });
    document.fonts.ready.then(() => renderPoster(currentMessage));
    counter.textContent = `${input.value.length} / ${input.maxLength}`;
  }

  /**
   * Verknüpft die große Typografie der Zwischenspiele direkt mit dem Body-Scroll.
   * Jede Szene hat Einfahrt, Haltephase und bildfüllenden Zoom beim Verlassen.
   * Keine Scroll-Sperre, keine Listener pro Element und kein unnötiger RAF-Loop.
   */
  function initScrollTheatre() {
    const scenes = [...document.querySelectorAll('[data-impact]')];
    const hero = document.querySelector('#system');
    const billboard = document.querySelector('[data-billboard]');
    const entrances = [...document.querySelectorAll('[data-enter]')];
    const scrollTopLink = document.querySelector('#scroll-top');
    let pending = false;

    function render() {
      pending = false;
      const viewport = window.innerHeight;
      const headerHeight = document.querySelector('.masthead')?.offsetHeight || 72;
      const reduced = isReducedMotion();
      scrollTopLink?.classList.toggle('is-visible', window.scrollY > viewport * .9);

      if (hero) {
        const bounds = hero.getBoundingClientRect();
        const distance = Math.max(1, bounds.height - viewport);
        const exit = reduced ? 0 : smoothStep(clamp(-bounds.top / distance, 0, 1));
        hero.style.setProperty('--hero-exit', exit.toFixed(3));
      }

      scenes.forEach((scene, sceneIndex) => {
        const bounds = scene.getBoundingClientRect();
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
      });

      if (billboard) {
        const bounds = billboard.getBoundingClientRect();
        if (bounds.bottom >= 0 && bounds.top <= viewport) {
          const local = reduced ? .5 : clamp((viewport - bounds.top) / (viewport + bounds.height), 0, 1);
          billboard.style.setProperty('--billboard-x1', `${((-1 + local * 2) * 22).toFixed(2)}vw`);
          billboard.style.setProperty('--billboard-x2', `${((1 - local * 2) * 22).toFixed(2)}vw`);
        }
      }
    }

    function requestRender() {
      if (!pending) {
        pending = true;
        requestAnimationFrame(render);
      }
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    }, { threshold: 0.04, rootMargin: '0px 0px -7% 0px' });
    entrances.forEach(element => {
      observer.observe(element);
      element.addEventListener('focusin', () => element.classList.add('is-visible'));
    });

    window.addEventListener('scroll', requestRender, { passive: true });
    window.addEventListener('resize', requestRender, { passive: true });
    motionPreference.addEventListener('change', requestRender);
    document.addEventListener('typebreak:motion', requestRender);
    document.documentElement.classList.add('motion-ready');
    document.querySelector('#year').textContent = String(new Date().getFullYear());
    requestRender();
  }

  initScrollTheatre();
  initHero();
  initPressure();
  initFractureText();
  initPosterMaker();
})();
