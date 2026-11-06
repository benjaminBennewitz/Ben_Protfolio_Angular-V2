/**
 * @file Gemeinsamer Übergang aus der Empfangskonsole in Ronnies Schlussbilder.
 * @description Nutzt die vorhandene pausierbare Spieluhr. Der native Vollbilddialog
 * übernimmt Fokus und Hintergrundsperre; begrenzte Tiefenebenen ersetzen eine 3D-Engine.
 * @author Benjamin Bennewitz
 */
const COPY = Object.freeze({
  de: {
    title: 'KEIN RÜCKSIGNAL', ending: 'NCBS / VERBINDUNG BEENDET', who: 'Ermittler', status: 'Status', missing: 'NICHT ERREICHBAR',
    restart: 'Erneut empfangen', archive: 'Zurück zum Archiv', skip: 'Zum Status', forward: 'Weitergehen',
    look: 'Umsehen: Maus oder Ziehen · Weitergehen: W / ↑ oder Button',
    swing: 'Die Schaukel ist leer.', ronnie: 'An der Jacke hängt derselbe Name wie an deinem Empfänger.',
    dimension: 'Vor dir liegt die andere Seite.', close: 'Ein trockenes Klicken. Direkt neben dir.',
    region: 'Die andere Dimension. Mit Maus oder Ziehen umsehen; W, Pfeil nach oben oder Weitergehen bewegt dich vorwärts.',
    swingRegion: 'Der Stationshof jenseits des Monitors. Eine leere Schaukel; im Nebel erscheint darauf Ronnie mit unkenntlichem Gesicht.',
    pause: 'Pause', resume: 'Fortsetzen', mute: 'Ton aus', unmute: 'Ton an',
    flash: 'Ein Licht dringt aus dem Bildschirm. Die Geräte verschwinden im Nebel.',
  },
  en: {
    title: 'NO RETURN SIGNAL', ending: 'NCBS / CONNECTION TERMINATED', who: 'Investigator', status: 'Status', missing: 'UNREACHABLE',
    restart: 'Receive again', archive: 'Back to archive', skip: 'Show status', forward: 'Walk on',
    look: 'Look: mouse or drag · Walk: W / ↑ or button',
    swing: 'The swing is empty.', ronnie: 'The jacket carries the same name as your receiver.',
    dimension: 'The other side lies ahead.', close: 'A dry click. Right beside you.',
    region: 'The other dimension. Look with the mouse or by dragging; W, arrow up or Walk on moves you forward.',
    swingRegion: 'The station courtyard beyond the monitor. An empty swing; in the fog Ronnie appears on it with an unrecognizable face.',
    pause: 'Pause', resume: 'Resume', mute: 'Mute', unmute: 'Sound on',
    flash: 'Light spills from the screen. The devices disappear into fog.',
  },
});
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const ease = value => { const t = clamp(value); return t * t * (3 - 2 * t); };

/** Eine einmal erzeugte Wolkentextur; pro Frame werden nur gecachte Ebenen verschoben. */
function createFogTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  for (let i = 0; i < 70; i++) {
    const x = (Math.sin(i * 19.73) * .5 + .5) * canvas.width;
    const y = (Math.cos(i * 11.91) * .5 + .5) * canvas.height;
    const radius = 80 + (i % 7) * 17;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, 'rgba(38, 22, 19, .35)');
    gradient.addColorStop(.5, 'rgba(58, 35, 25, .18)');
    gradient.addColorStop(1, 'rgba(32, 17, 15, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  return canvas;
}

export class Ending {
  constructor({ scene, investigation, soundscape, onLanguage, onPause, onMute, onTakeover }) {
    Object.assign(this, { scene, investigation, soundscape, onLanguage, onPause, onMute, onTakeover });
    this.dialog = document.querySelector('#ending-dialog');
    this.canvas = document.querySelector('#ending-fog');
    this.context = this.canvas.getContext('2d');
    this.world = document.querySelector('#ending-world');
    this.active = false;
    this.phase = 'idle';
    this.mode = null;
    this.startedAt = 0;
    this.closedAt = null;
    this.frame = 0;
    this.lastDraw = 0;
    this.depth = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.lookX = 0;
    this.lookY = 0;
    this.walking = false;
    this.backing = false;
    this.drag = null;
    this.fogTexture = null;
    this.ronnieVisible = false;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  }

  get copy() { return COPY[this.scene.language]; }
  get elapsed() { return Math.max(0, this.scene.anomaly.activeMs - this.startedAt); }

  /** Alle Eingaben sind auf die Schlusssequenz beschränkt; kein globaler Cursor-Lock. */
  attach() {
    this.dialog.addEventListener('cancel', event => { event.preventDefault(); this.showStatus(); });
    document.querySelector('#ending-pause').addEventListener('click', () => { this.onPause(); this.render(); });
    document.querySelector('#ending-sound').addEventListener('click', () => { this.onMute(); this.render(); });
    document.querySelector('#ending-language').addEventListener('click', () => { this.onLanguage(); this.render(); });
    document.querySelector('#ending-skip').addEventListener('click', () => this.showStatus());
    document.querySelector('#ending-restart').addEventListener('click', () => window.location.reload());
    const forward = document.querySelector('#ending-forward');
    forward.addEventListener('pointerdown', () => { this.walking = true; this.requestFrame(); });
    forward.addEventListener('click', () => this.advance(.12));
    const release = () => { this.walking = false; this.backing = false; this.drag = null; };
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    window.addEventListener('blur', release);
    this.dialog.addEventListener('keydown', event => {
      if (this.mode !== 'dimension' || this.phase !== 'view') return;
      if (['KeyW', 'ArrowUp', 'KeyS', 'ArrowDown'].includes(event.code)) {
        event.preventDefault();
        this.walking = ['KeyW', 'ArrowUp'].includes(event.code);
        this.backing = !this.walking;
        this.requestFrame();
      }
    });
    this.dialog.addEventListener('keyup', event => {
      if (['KeyW', 'ArrowUp', 'KeyS', 'ArrowDown'].includes(event.code)) release();
    });
    this.world.addEventListener('pointerdown', event => {
      if (this.mode !== 'dimension' || this.phase !== 'view') return;
      this.drag = { x: event.clientX, y: event.clientY, lookX: this.targetX, lookY: this.targetY };
      this.world.setPointerCapture(event.pointerId);
    });
    this.world.addEventListener('pointermove', event => {
      if (this.mode !== 'dimension' || this.phase !== 'view' || this.scene.paused) return;
      const rect = this.world.getBoundingClientRect();
      if (event.pointerType === 'mouse' && !this.drag) {
        this.targetX = clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1);
        this.targetY = clamp((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1);
      } else if (this.drag) {
        this.targetX = clamp(this.drag.lookX + (event.clientX - this.drag.x) / rect.width * 2, -1, 1);
        this.targetY = clamp(this.drag.lookY + (event.clientY - this.drag.y) / rect.height * 2, -1, 1);
      }
      this.requestFrame();
    });
    this.world.addEventListener('wheel', event => {
      if (this.mode !== 'dimension' || this.phase !== 'view' || event.ctrlKey) return;
      event.preventDefault();
      this.advance(clamp(event.deltaY / 1600, -.12, .12));
    }, { passive: false });
    document.addEventListener('visibilitychange', () => { release(); this.lastDraw = 0; this.requestFrame(); });
    this.reducedMotion.addEventListener('change', () => this.requestFrame());
    this.resizeObserver = new ResizeObserver(() => { if (this.active) { this.resize(); this.requestFrame(); } });
    this.resizeObserver.observe(this.dialog);
    this.render();
  }

  /** Lädt die nächste Schlusskulisse bereits während des vorhandenen Finales. */
  prepare(mode) {
    const ids = mode === 'breach' ? ['ending-dimension'] : ['ending-yard', 'ending-empty', 'ending-ronnie'];
    for (const id of ids) {
      const image = document.querySelector(`#${id}`);
      if (!image.getAttribute('src')) image.src = image.dataset.asset;
      image.addEventListener('load', () => this.requestFrame(), { once: true });
    }
  }

  /** Beginnt erst nach dem etablierten Portal-Reveal beziehungsweise nach dem Lachen. */
  tick() {
    if (!this.active) {
      const finale = this.scene.finale;
      if (finale.mode === 'breach' && finale.phase === 'open'
        && this.scene.anomaly.activeMs - finale.startedAtMs >= 38_000) this.start('dimension');
      if (finale.mode === 'isolate' && this.investigation.localOpenedAt !== null
        && this.scene.anomaly.activeMs - this.investigation.localOpenedAt >= 10_000) this.start('swing');
      return;
    }
    if (this.phase === 'flash' && this.elapsed >= 1800) {
      this.phase = 'view';
      this.dialog.dataset.phase = 'view';
      this.announce(this.mode === 'dimension' ? 'dimension' : 'swing');
    }
    if (this.mode === 'swing' && this.elapsed >= 6500 && !this.ronnieVisible) {
      this.ronnieVisible = true;
      this.dialog.dataset.ronnie = 'true';
      this.announce('ronnie');
      void this.soundscape.play('sourceClicks', .2);
    }
    if (this.phase === 'closing' && this.closedAt !== null
      && this.scene.anomaly.activeMs - this.closedAt >= 1000) this.showStatus();
    if (this.phase === 'view' && this.mode === 'swing' && this.elapsed >= 19_000) this.showStatus();
    if (this.phase === 'view' && this.mode === 'dimension' && this.elapsed >= 42_000) this.beginClose();
    this.render();
  }

  start(mode) {
    if (this.active) return;
    this.active = true;
    this.mode = mode;
    this.phase = 'flash';
    this.startedAt = this.scene.anomaly.activeMs;
    this.dialog.dataset.mode = mode;
    this.dialog.dataset.phase = 'flash';
    document.documentElement.dataset.epilogue = mode;
    this.onTakeover();
    this.soundscape.stop('localLaugh');
    this.soundscape.bedLevel = mode === 'dimension' ? .16 : .13;
    void this.soundscape.startBed(mode === 'dimension' ? 'hum' : 'swingCreak');
    this.soundscape.updateBed();
    this.fogTexture = createFogTexture();
    this.dialog.showModal();
    this.resize();
    this.announce('flash');
    this.render();
    this.requestFrame();
  }

  /** Begrenzte Vorwärtsbewegung verändert Tiefe und Nebel; am Ende kommt das Klicken näher. */
  advance(amount) {
    if (!this.active || this.mode !== 'dimension' || this.phase !== 'view' || this.scene.paused || document.hidden) return;
    this.depth = clamp(this.depth + amount);
    if (this.depth >= 1) this.beginClose();
    this.requestFrame();
  }

  /** Nahes Klicken und Schwarzblende schließen auch eine unbewegte Erkundung ab. */
  beginClose() {
    if (this.phase !== 'view') return;
    this.phase = 'closing';
    this.closedAt = this.scene.anomaly.activeMs;
    this.dialog.dataset.phase = 'closing';
    this.walking = false;
    this.backing = false;
    this.announce('close');
    void this.soundscape.play('sourceClicks', .6, 0, -.85);
    this.requestFrame();
  }

  announce(key) {
    const output = document.querySelector('#ending-description');
    output.dataset.key = key;
    output.textContent = this.copy[key];
  }

  /** Status bleibt erreichbar, auch wenn die Erkundung übersprungen wird. */
  showStatus() {
    if (!this.active || this.phase === 'status') return;
    this.phase = 'status';
    this.walking = false;
    this.backing = false;
    this.dialog.dataset.phase = 'status';
    if (this.mode === 'swing') {
      this.ronnieVisible = true;
      this.dialog.dataset.ronnie = 'true';
    }
    this.soundscape.bedLevel = .045;
    this.soundscape.updateBed();
    this.render();
    document.querySelector('#ending-title').focus({ preventScroll: true });
    this.requestFrame();
  }

  render() {
    const t = this.copy;
    const values = {
      'ending-title': 'title', 'ending-kicker': 'ending', 'ending-who-label': 'who',
      'ending-status-label': 'status', 'ending-status-value': 'missing',
      'ending-restart': 'restart', 'ending-archive': 'archive', 'ending-skip': 'skip',
      'ending-forward': 'forward', 'ending-instructions': 'look',
    };
    for (const [id, key] of Object.entries(values)) document.querySelector(`#${id}`).textContent = t[key];
    const pause = document.querySelector('#ending-pause');
    pause.textContent = this.scene.paused ? t.resume : t.pause;
    pause.setAttribute('aria-pressed', String(this.scene.paused));
    const sound = document.querySelector('#ending-sound');
    sound.textContent = this.scene.soundMuted ? t.unmute : t.mute;
    sound.setAttribute('aria-pressed', String(!this.scene.soundMuted));
    const language = document.querySelector('#ending-language');
    language.textContent = this.scene.language === 'de' ? 'EN' : 'DE';
    language.setAttribute('aria-label', this.scene.language === 'de' ? 'Switch to English' : 'Zu Deutsch wechseln');
    document.querySelector('#ending-tools').setAttribute('aria-label', this.scene.language === 'de' ? 'Abschlusssteuerung' : 'Ending controls');
    this.world.setAttribute('aria-label', this.mode === 'swing' ? t.swingRegion : t.region);
    const output = document.querySelector('#ending-description');
    if (output.dataset.key) output.textContent = t[output.dataset.key];
    document.querySelector('#ending-card').hidden = this.phase !== 'status';
    document.querySelector('#ending-movement').hidden = this.mode !== 'dimension' || this.phase !== 'view';
    document.querySelector('#ending-skip').hidden = this.phase === 'status';
    document.querySelector('#ending-tools').hidden = !this.active || this.phase === 'flash';
    if (this.active) this.requestFrame();
  }

  resize() {
    const rect = this.dialog.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    this.canvas.width = Math.round(this.width * ratio);
    this.canvas.height = Math.round(this.height * ratio);
    this.context?.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  /** Nebel verdeckt den Austausch; drei gegenläufige Ebenen geben den Blick danach frei. */
  paintFog(time) {
    if (!this.context || !this.fogTexture) return;
    const ctx = this.context;
    const w = this.width;
    const h = this.height;
    ctx.clearRect(0, 0, w, h);
    const warm = ctx.createRadialGradient(w * .55, h * .45, 0, w * .55, h * .45, Math.max(w, h));
    warm.addColorStop(0, 'rgba(238, 110, 42, .19)');
    warm.addColorStop(.5, 'rgba(101, 34, 15, .24)');
    warm.addColorStop(1, 'rgba(3, 5, 7, .8)');
    ctx.fillStyle = warm;
    ctx.fillRect(0, 0, w, h);
    const initial = 1 - ease((time - 1.8) / 5);
    const exchange = this.mode === 'swing' ? Math.exp(-((time - 6.4) ** 2) / 1.5) : 0;
    const weather = this.mode === 'dimension' ? .3 + .11 * Math.sin(time * .34) : .12;
    const density = clamp(Math.max(initial * .97, exchange, weather), .08, 1);
    const motionTime = this.reducedMotion.matches ? 0 : time;
    ctx.fillStyle = `rgba(27, 17, 14, ${density * .68})`;
    ctx.fillRect(0, 0, w, h);
    for (let layer = 0; layer < 3; layer++) {
      const scale = 1.9 + layer * .4;
      const x = (Math.sin(motionTime * (.035 + layer * .012) + layer * 2) * .25 - .55) * w;
      const y = (Math.cos(motionTime * .05 + layer) * .13 - .25) * h;
      ctx.globalAlpha = clamp(density * .9 + .12);
      ctx.drawImage(this.fogTexture, x + this.lookX * 30 * layer, y, w * scale, h * 1.7);
    }
    ctx.globalAlpha = 1;
  }

  requestFrame() {
    if (!this.active || this.frame || document.hidden) return;
    this.frame = requestAnimationFrame(timestamp => this.draw(timestamp));
  }

  draw(timestamp) {
    this.frame = 0;
    if (!this.active || document.hidden) return;
    if (timestamp - this.lastDraw < 32) { this.requestFrame(); return; }
    const delta = this.lastDraw ? clamp((timestamp - this.lastDraw) / 1000, 0, .1) : 0;
    this.lastDraw = timestamp;
    if (!this.scene.paused) {
      if (this.walking || this.backing) this.advance(delta * (this.backing ? -.18 : .11));
      this.lookX += (this.targetX - this.lookX) * .07;
      this.lookY += (this.targetY - this.lookY) * .07;
    }
    const interpolation = this.scene.paused ? 0 : Math.min(200, Math.max(0, performance.now() - this.scene.story.lastTick));
    const time = (this.elapsed + interpolation) / 1000;
    const flash = this.phase === 'flash' ? ease(time / .65) * (1 - ease((time - .65) / 1.1)) : 0;
    this.dialog.style.setProperty('--ending-flash', String(flash * (this.reducedMotion.matches ? .23 : .92)));
    this.dialog.style.setProperty('--ending-world', String(ease((time - .6) / 1.1)));
    const scale = 1.14 + this.depth * .3;
    document.querySelector('#ending-dimension').style.transform = `translate(${-this.lookX * 5}%, ${-this.lookY * 4}%) scale(${scale})`;
    const swingTime = this.reducedMotion.matches ? 0 : time;
    document.querySelector('#ending-rig').style.transform = `perspective(1100px) rotateX(${Math.sin(swingTime * 1.05) * 5}deg) scale(${1 + Math.sin(swingTime * 1.05) * .025})`;
    const blackout = this.phase === 'closing' && this.closedAt !== null
      ? ease((this.scene.anomaly.activeMs - this.closedAt + interpolation) / 900) : this.phase === 'status' ? .72 : 0;
    this.dialog.style.setProperty('--ending-black', String(blackout));
    this.paintFog(time);
    if (!this.scene.paused && (!this.reducedMotion.matches || this.phase === 'flash' || this.phase === 'closing' || this.walking || this.backing)) this.requestFrame();
  }

  dispose() {
    cancelAnimationFrame(this.frame);
    this.resizeObserver?.disconnect();
  }
}
