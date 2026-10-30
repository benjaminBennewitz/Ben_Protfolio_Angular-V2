/** @file Größen-, Sichtbarkeits- und Bewegungspräferenzen der Zeichenfläche. */
export class StudyObservers {
  /** Registriert ausschließlich die zum Canvas gehörenden Beobachter. */
  constructor(study) {
    this.study = study;
    this.abort = new AbortController();
    this.resize = new ResizeObserver(this.onResize.bind(this));
    this.visibility = new IntersectionObserver(this.onVisibility.bind(this));
    this.resize.observe(study.host);
    this.visibility.observe(study.host);
    this.listen();
  }

  /** Verknüpft Tab-Sichtbarkeit und Systemeinstellung mit dem vorhandenen Loop. */
  listen() {
    const options = { signal: this.abort.signal };
    document.addEventListener('visibilitychange', this.study.syncLoop.bind(this.study), options);
    this.study.motion.addEventListener('change', this.onMotion.bind(this), options);
  }

  /** Passt den Canvas an seinen tatsächlichen Container an. */
  onResize() {
    if (!this.study.ready || this.study.destroyed) return;
    this.study.p.resizeCanvas(Math.max(1, this.study.host.clientWidth), Math.max(1, this.study.host.clientHeight));
  }

  /** Stoppt die Animation außerhalb des sichtbaren Seitenbereichs. */
  onVisibility(entries) {
    this.study.visible = entries[0].isIntersecting;
    this.study.syncLoop();
  }

  /** Übernimmt eine neu aktivierte Einstellung für reduzierte Bewegung. */
  onMotion(event) {
    if (!event.matches) return;
    this.study.setPaused(true);
    this.study.host.dispatchEvent(new CustomEvent('phase:paused', { detail: true }));
  }

  /** Entfernt alle Listener und Observer dieser Instanz. */
  destroy() {
    this.abort.abort();
    this.resize.disconnect();
    this.visibility.disconnect();
  }
}
