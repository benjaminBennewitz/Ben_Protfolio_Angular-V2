/** @file Einstieg und lokale Bedienelemente der eigenständigen PHASE-Studie. */
import { createPhaseStudy, SPECIMENS } from './phase-study.js';
import { buildArchive } from './archive.js';
import { renderView, renderRange, resetRanges, showFailure } from './view.js';

/** Verbindet die Oberfläche mit der unabhängig nutzbaren Zeichenengine. */
class PhaseApp {
  /** Erstellt Anfangszustand und lokale DOM-Bindungen. */
  constructor() {
    this.abort = new AbortController();
    this.host = document.querySelector('#stage');
    this.state = {
      language: 'de',
      theme: 'dark',
      specimen: SPECIMENS[0],
      paused: matchMedia('(prefers-reduced-motion: reduce)').matches,
    };
    this.initialize();
  }

  /** Initialisiert die Studie und zeigt Ladefehler in derselben Oberfläche an. */
  initialize() {
    try {
      this.startStudy();
    } catch (error) {
      showFailure(error);
    }
    renderView(this.state);
  }

  /** Legt Archiv und Canvas einmalig an und aktiviert die Bedienelemente. */
  startStudy() {
    buildArchive(document.querySelector('#specimen-list'));
    this.study = createPhaseStudy(this.host, window.p5);
    resetRanges();
    this.bindControls();
    this.bindLifecycle();
  }

  /** Registriert lokale UI-Ereignisse mit gemeinsamer Abbruchsteuerung. */
  bindControls() {
    const targets = { pause: 'togglePause', reset: 'reset', theme: 'toggleTheme', language: 'toggleLanguage' };
    for (const [id, method] of Object.entries(targets)) this.listen(document.getElementById(id), 'click', method);
    this.listen(document.querySelector('#specimen-list'), 'click', 'selectSpecimen');
    this.listen(document.querySelector('.controls'), 'input', 'updateRange');
  }

  /** Verbindet Systemeinstellungen und Seitenende mit dem vorhandenen Lifecycle. */
  bindLifecycle() {
    this.listen(this.host, 'phase:paused', 'onReducedMotion');
    this.listen(window, 'pagehide', 'onPageHide');
  }

  /** Registriert eine gebundene Methode als entfernbaren DOM-Listener. */
  listen(target, type, method) {
    target.addEventListener(type, this[method].bind(this), { signal: this.abort.signal });
  }

  /** Wählt eine bekannte Probe ohne Neuanlage des Canvas. */
  selectSpecimen(event) {
    const button = event.target.closest('[data-specimen]');
    if (!button) return;
    const specimen = SPECIMENS.find(matchesButton);
    /** Prüft die Kennung des angeklickten Archivbuttons. */
    function matchesButton(item) {
      return item.id === button.dataset.specimen;
    }
    if (!specimen || specimen.id === this.state.specimen.id) return;
    this.study.setSpecimen(specimen.id);
    this.state.specimen = specimen;
    renderView(this.state);
  }

  /** Übergibt den Wert eines nativen Reglers an die Zeichenengine. */
  updateRange(event) {
    const input = event.target;
    if (!input.matches('input[type="range"]')) return;
    this.study.update({ [input.id]: Number(input.value) });
    renderRange(input);
  }

  /** Schaltet zwischen Standbild und laufender Bewegung um. */
  togglePause() {
    this.state.paused = !this.state.paused;
    this.study.setPaused(this.state.paused);
    renderView(this.state);
  }

  /** Setzt die aktuellen Regler und die Simulationszeit zurück. */
  reset() {
    this.study.reset();
    resetRanges();
  }

  /** Wechselt UI- und Zeichenfarben gemeinsam. */
  toggleTheme() {
    this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
    this.study.setTheme(this.state.theme);
    renderView(this.state);
  }

  /** Wechselt alle Texte zwischen Deutsch und Englisch. */
  toggleLanguage() {
    this.state.language = this.state.language === 'de' ? 'en' : 'de';
    renderView(this.state);
  }

  /** Spiegelt die aktivierte Systemeinstellung im Pausebutton. */
  onReducedMotion() {
    this.state.paused = true;
    renderView(this.state);
  }

  /** Erhält den Back/Forward-Cache und räumt bei endgültigem Verlassen auf. */
  onPageHide(event) {
    if (event.persisted) return;
    this.study.destroy();
    this.abort.abort();
  }
}

new PhaseApp();
