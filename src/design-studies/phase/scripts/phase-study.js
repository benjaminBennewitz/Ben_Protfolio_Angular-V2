/** @file Gekapselte p5-Instanz und öffentliche Steuerung der PHASE-Studie. */
import { DEFAULT_SETTINGS, SPECIMENS } from './organisms.js';
import { CanvasRenderer } from './canvas-renderer.js';
import { StudyObservers } from './study-observers.js';
export { DEFAULT_SETTINGS, SPECIMENS } from './organisms.js';

/** Erstellt eine isolierte Studie in einem Container mit definierter Höhe. */
export function createPhaseStudy(host, P5) {
  if (!host || !P5) throw new Error('PHASE benötigt einen Container und p5.js.');
  return new PhaseStudy(host, P5);
}

/** Verbindet Geometrie, Rendering und Lebenszyklus ohne globale p5-Funktionen. */
class PhaseStudy {
  /** Erzeugt genau einen Canvas und dessen Beobachter. */
  constructor(host, P5) {
    this.host = host;
    this.initializeState();
    this.renderer = new CanvasRenderer();
    this.p = new P5(this.configure.bind(this), host);
    this.observers = new StudyObservers(this);
  }

  /** Legt den Ausgangszustand einschließlich der Systemeinstellung fest. */
  initializeState() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.specimen = SPECIMENS[0];
    this.motion = matchMedia('(prefers-reduced-motion: reduce)');
    this.paused = this.motion.matches;
    this.visible = true;
    this.ready = false;
    this.destroyed = false;
    this.light = false;
    this.time = 0;
  }

  /** Verknüpft die beiden p5-Lifecycle-Callbacks mit dieser Instanz. */
  configure(p) {
    p.setup = this.setup.bind(this, p);
    p.draw = this.draw.bind(this, p);
  }

  /** Richtet die Zeichengröße und eine begrenzte Pixeldichte ein. */
  setup(p) {
    if (this.destroyed) {
      p.remove();
      return;
    }
    p.pixelDensity(Math.min(devicePixelRatio || 1, 1.75));
    const canvas = p.createCanvas(Math.max(1, this.host.clientWidth), Math.max(1, this.host.clientHeight));
    canvas.elt.setAttribute('aria-hidden', 'true');
    p.frameRate(60);
    this.ready = true;
    this.syncLoop();
  }

  /** Zeichnet ausschließlich die aktive Probe in die gemeinsame Punktdarstellung. */
  draw(p) {
    this.advanceTime(p.deltaTime);
    this.renderer.prepare(p, this.specimen);
    this.specimen.render({
      time: this.time,
      settings: this.settings,
      compact: p.width < 420,
      addPoint: this.renderer.addPoint,
    });
    this.renderer.paint(p.drawingContext, this.light);
  }

  /** Begrenzt Zeitfortschritte nach inaktiven Frames und erhält pausierte Standbilder. */
  advanceTime(delta) {
    if (this.paused || !this.visible || document.hidden) return;
    this.time += Math.min(delta, 50) * 0.001 * this.settings.speed * 1.7;
  }

  /** Aktiviert den Loop nur bei sichtbarer und freigegebener Animation. */
  syncLoop() {
    if (!this.ready || this.destroyed) return;
    if (!this.paused && this.visible && !document.hidden) {
      this.p.loop();
      return;
    }
    this.p.noLoop();
    if (this.visible && !document.hidden) this.p.redraw();
  }

  /** Übernimmt bekannte Reglerwerte innerhalb ihrer zulässigen Grenzen. */
  update(values) {
    const bounds = { speed: [0.1, 2], amplitude: [0.2, 1.5], frequency: [0.5, 2] };
    for (const key of Object.keys(bounds)) {
      if (!Number.isFinite(values[key])) continue;
      this.settings[key] = Math.max(bounds[key][0], Math.min(bounds[key][1], values[key]));
    }
    if (this.ready && this.paused) this.p.redraw();
  }

  /** Wechselt die Geometrie; gemeinsame Reglerwerte und Pause bleiben erhalten. */
  setSpecimen(id) {
    const next = SPECIMENS.find(isRequestedSpecimen);
    /** Prüft die Kennung der auszuwählenden Probe. */
    function isRequestedSpecimen(item) {
      return item.id === id;
    }
    if (!next) throw new Error(`Unbekannte PHASE-Probe: ${id}`);
    this.specimen = next;
    this.time = 0;
    if (this.ready) this.p.redraw();
  }

  /** Pausiert oder startet die Zeitentwicklung. */
  setPaused(value) {
    this.paused = Boolean(value);
    this.syncLoop();
  }

  /** Passt ausschließlich die Zeichenfarben an das gewählte Theme an. */
  setTheme(value) {
    this.light = value === 'light';
    if (this.ready && this.paused) this.p.redraw();
  }

  /** Setzt Parameter und Zeit zurück; Art und Pause bleiben erhalten. */
  reset() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.time = 0;
    if (this.ready) this.p.redraw();
  }

  /** Entfernt Canvas, Observer und Listener vollständig. */
  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.observers.destroy();
    this.p.remove();
  }
}
