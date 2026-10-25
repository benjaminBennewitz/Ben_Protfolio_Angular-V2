/** Zustandsautomat der Cartridge, unabhängig von Kamera und Renderer. */
export class CartridgeState {
  /** Startet mit zu drei Vierteln eingesetztem Modul. */
  constructor() {
    this.slot = 'partial'; this.contactsFault = false;
    this.successfulBoots = 0; this.faultUsed = false; this.gimmicks = true;
  }
  /** Prüft, ob das Gerät zuverlässig starten kann. */
  get ready() { return this.slot === 'seated' && !this.contactsFault; }
  /** Rastet das eingesetzte Modul ein. */
  push() {
    if (this.slot === 'removed') return false;
    this.slot = 'seated';
    return true;
  }
  /** Nimmt das Modul heraus. */
  remove() { this.slot = 'removed'; }
  /** Reinigt ausschließlich ein herausgenommenes Modul. */
  blow() {
    if (this.slot !== 'removed') return false;
    this.contactsFault = false;
    return true;
  }
  /** Steckt das herausgenommene Modul wieder teilweise ein. */
  insert() {
    if (this.slot !== 'removed') return false;
    this.slot = 'partial';
    return true;
  }
  /** Ermittelt höchstens einen optionalen Kontaktfehler nach dem ersten erfolgreichen Start. @param {number} random Zufallswert. */
  checkBoot(random) {
    if (this.gimmicks && this.successfulBoots > 0 && !this.faultUsed && random < 0.12) {
      this.contactsFault = true; this.faultUsed = true;
    }
    return this.ready;
  }
}
