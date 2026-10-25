/** Verbindet Cartridge-Aktionen mit Power, Kamera und Ton. */
export class CartridgeController {
  /** Übernimmt die Anwendung. @param {object} app Anwendung. */
  constructor(app) { this.app = app; this.open = false; this.returnSlot = 'partial'; }
  /** Öffnet die Rückansicht mit zugänglichen Aktionen. */
  inspect() {
    if (!this.app.device.ready || this.app.phase === 'boot') return;
    this.app.views?.resetRear();
    this.open = true; this.app.setView('rear');
    this.app.ui.focusCartridge();
    this.app.announce('DUNGEON WANTED. Cartridge hineindrücken oder zum Betrachten heranzoomen.');
  }
  /** Führt eine einzelne Modulaktion aus. @param {string} action Aktionskennung. */
  act(action) {
    const { app } = this, state = app.device.cartridge.state;
    app.views?.cancel();
    app.audio.unlock();
    if (action === 'push' && state.slot !== 'removed') this.push();
    if (action === 'examine' && state.slot !== 'removed') this.examine();
    if (action === 'blow' && state.blow()) this.blow();
    if (action === 'insert' && state.insert()) { this.returnSlot = 'partial'; app.announce('Cartridge im Schacht. Jetzt vollständig hineindrücken.'); }
    if (action === 'turn' && state.slot === 'removed') app.device.cartridge.turned = !app.device.cartridge.turned;
    if (action === 'close') this.close();
    app.request(); app.ui.sync();
  }
  /** Rastet das Modul bei ausgeschaltetem Gerät ein. */
  push() {
    this.app.setPower(false);
    this.app.device.cartridge.state.push();
    this.app.audio.effects.tone(320,0.08);
    this.app.announce('Cartridge eingerastet. Du kannst den Handheld einschalten.');
  }
  /** Zieht die Cartridge zum vergrößerten Betrachten heraus. */
  examine() {
    this.returnSlot = this.app.device.cartridge.state.slot;
    this.app.device.cartridge.turned = false;
    this.app.setPower(false); this.app.device.cartridge.state.remove();
    this.app.audio.effects.tone(180,0.07);
    this.app.announce('Cartridge vergrößert. Du kannst sie umdrehen, durchpusten oder zurücklegen.');
  }
  /** Startet eine kurze Animation ohne Mikrofonzugriff. */
  blow() {
    this.app.device.cartridge.blowTime = 0.65;
    this.app.audio.effects.blow(); this.app.announce('Kontakte durchgepustet.');
  }
  /** Verlässt die Rückansicht und legt ein betrachtetes Modul zurück. @param {string} view Zielansicht. */
  leave(view) {
    this.app.views?.cancel();
    const state = this.app.device.cartridge.state;
    if (state.slot === 'removed') {
      state.insert();
      if (this.returnSlot === 'seated') state.push();
    }
    this.open = false; this.app.setView(view); this.app.ui.sync();
  }
  /** Kehrt jederzeit über die Tastaturalternative zur Front zurück. */
  close() { this.leave('front'); this.app.ui.focusHelp(); }
}
