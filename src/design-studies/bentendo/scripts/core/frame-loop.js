/** Bündelt Zeichenanforderungen und pausiert im Hintergrund. */
export class FrameLoop {
  /** Verbindet die Zeichenfunktion. @param {Function} draw Frame-Verarbeitung. */
  constructor(draw) {
    this.draw = draw;
    this.frame = this.frame.bind(this);
    this.request = this.request.bind(this);
    this.handleVisibility = this.handleVisibility.bind(this);
    this.pending = 0;
    this.last = 0;
    document.addEventListener('visibilitychange', this.handleVisibility);
  }
  /** Fordert höchstens einen ausstehenden Frame an. */
  request() {
    if (!this.pending && !document.hidden) this.pending = requestAnimationFrame(this.frame);
  }
  /** Zeichnet und plant gegebenenfalls weiter. @param {number} time Zeitstempel. */
  frame(time) {
    this.pending = 0;
    const dt = this.last ? Math.min((time - this.last) / 1000, 0.1) : 0;
    this.last = time;
    if (this.draw(dt)) this.request();
  }
  /** Verhindert große Zeitsprünge beim Tabwechsel. */
  handleVisibility() {
    this.last = 0;
    if (document.hidden) cancelAnimationFrame(this.pending);
    this.pending = 0;
    this.request();
  }
}
