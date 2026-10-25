const PLAY_KEYS=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','a','A','b','B','j','J','Enter',' ','p','P','s','S'];

/** Verbirgt den Mauszeiger bei Spieltasten und zeigt ihn bei erneuter Mausbedienung wieder. */
export class KeyboardCursor {
  /** Verbindet ausschließlich Eingabewechsel, ohne Fokus oder Tastaturereignisse zu verändern. @param {object} app Anwendung. */
  constructor(app) {
    this.app=app;
    document.addEventListener('keydown',this.hide.bind(this));
    document.addEventListener('pointermove',this.show.bind(this));
    document.addEventListener('pointerdown',this.show.bind(this));
    window.addEventListener('blur',this.show.bind(this));
  }
  /** Reagiert auf Spieltasten außerhalb von Formularfeldern und geöffneten Bedienflächen. @param {KeyboardEvent} event Eingabe. */
  hide(event) {
    if (!PLAY_KEYS.includes(event.key) || event.ctrlKey || event.metaKey || event.altKey || this.app.phase!=='on' || this.app.helpOpen || this.app.cartridge.open) return;
    if (event.target.closest('input,select,textarea')) return;
    if (['Enter',' ','p','P','s','S'].includes(event.key) && event.target.closest('button,a')) return;
    document.documentElement.classList.add('keyboard-play');
    this.app.views.pointer=null; this.app.views.rearPointer=null;
  }
  /** Gibt den Zeiger bei Mausbewegung, Mausklick oder Fokusverlust frei. @param {Event} event Eingabe. */
  show(event) {
    if (event.type!=='blur' && event.pointerType!=='mouse') return;
    document.documentElement.classList.remove('keyboard-play');
  }
}
