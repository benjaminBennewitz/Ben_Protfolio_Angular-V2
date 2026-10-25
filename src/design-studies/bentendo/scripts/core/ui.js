import { element } from './dom.js';
import { updateSoundUI } from './sound-ui.js';
import { DragControls } from '../device/input/drag.js';

/** Bindet native, tastaturbedienbare Geräteaktionen. */
export class UI {
  /** Verbindet die Oberfläche. @param {object} app Anwendung. */
  constructor(app) {
    this.app = app; this.lastDescription = '';
    this.drag = new DragControls(app);
    this.bindDevice(); this.bindNavigation(); this.bindSettings();
    for (const node of document.querySelectorAll('[data-cartridge]')) node.addEventListener('click',this.cartridgeAction.bind(this,node.dataset.cartridge));
    element('cartridge-hotspot').addEventListener('click',app.cartridge.inspect.bind(app.cartridge));
    element('screen-action').addEventListener('focus',app.setView.bind(app,'front'));
  }
  /** Bindet Schalter und Stellräder. */
  bindDevice() {
    for (const key of ['power','contrast','volume']) this.drag.bind(element(key),key);
    element('power').addEventListener('click',this.powerClick.bind(this));
    for (const key of ['contrast','volume']) {
      element(`${key}-input`).addEventListener('input',this.range.bind(this,key));
      element(key).addEventListener('keydown',this.sliderKey.bind(this,key));
    }
  }
  /** Bindet Ansichten und Hilfeflächen. */
  bindNavigation() {
    element('help-toggle').addEventListener('click',this.toggleHelp.bind(this));
    element('help-close').addEventListener('click',this.toggleHelp.bind(this));
    for (const node of document.querySelectorAll('[data-view]')) node.addEventListener('click',this.app.setView.bind(this.app,node.dataset.view));
    for (const node of document.querySelectorAll('[data-device-view]')) node.addEventListener('click',this.deviceView.bind(this,node.dataset.deviceView));
    element('inspect-cartridge').addEventListener('click',this.inspect.bind(this));
    element('debug-level').addEventListener('change',this.debug.bind(this));
    document.addEventListener('keydown',this.escape.bind(this));
  }
  /** Öffnet ein am Gehäuse markiertes Bedienelement. @param {string} view Geräteansicht. */
  deviceView(view) { if (view==='rear') this.inspect(); else this.app.setView(view); }
  /** Bindet Ton und optionale Kontaktfehler. */
  bindSettings() {
    element('sound-toggle').addEventListener('click',this.toggleSound.bind(this));
    for (const channel of ['bgm','sfx']) element(`${channel}-input`).addEventListener('input',this.channelRange.bind(this,channel));
    element('gimmicks').addEventListener('change',this.toggleGimmicks.bind(this));
  }
  /** Übernimmt die getrennten Musik- und Effektregler. @param {string} channel Kanal. @param {Event} event Eingabe. */
  channelRange(channel,event) { this.app.audio.unlock(); this.app.audio.setChannel(channel,Number(event.target.value)/100); this.sync(); this.app.request(); }
  /** Verarbeitet Tastaturklicks am Power-Schalter. @param {MouseEvent} event Ereignis. */
  powerClick(event) { if (!event.detail) { this.app.audio.unlock(); this.app.setPower(!this.app.device.power); } }
  /** Übernimmt einen nativen Bereichsregler. @param {string} key Regler. @param {Event} event Ereignis. */
  range(key,event) { this.app.audio.unlock(); this.app.setValue(key,Number(event.target.value)/100); }
  /** Unterstützt Pfeiltasten, Pos1 und Ende am Stellrad. @param {string} key Regler. @param {KeyboardEvent} event Ereignis. */
  sliderKey(key,event) {
    const steps = { ArrowUp:0.05, ArrowRight:0.05, ArrowDown:-0.05, ArrowLeft:-0.05 };
    if (!(event.key in steps) && !['Home','End'].includes(event.key)) return;
    event.preventDefault(); this.app.audio.unlock();
    this.app.setValue(key,event.key==='Home'?0:event.key==='End'?1:this.app.device[key]+steps[event.key]);
  }
  /** Öffnet oder schließt die Bedienhilfe. */
  toggleHelp() {
    this.app.helpOpen = !this.app.helpOpen;
    element('help').hidden = !this.app.helpOpen;
    element('help-toggle').setAttribute('aria-expanded',String(this.app.helpOpen));
    this.app.game.held = null;
    if (this.app.helpOpen) element('help-close').focus(); else this.focusHelp();
    this.app.request();
  }
  /** Öffnet das Modul aus der Tastaturalternative. */
  inspect() { if (this.app.helpOpen) this.toggleHelp(); this.app.cartridge.inspect(); }
  /** Führt eine Modulaktion aus. @param {string} action Aktion. */
  cartridgeAction(action) { this.app.cartridge.act(action); }
  /** Schaltet sämtliche Audiokanäle stumm. */
  toggleSound() { this.app.audio.muted = !this.app.audio.muted; this.app.audio.applyVolume(); this.app.audio.saveSettings(); this.sync(); }
  /** Deaktiviert Kontaktfehler auf Wunsch dauerhaft für die Sitzung. @param {Event} event Ereignis. */
  toggleGimmicks(event) {
    const state = this.app.device.cartridge.state;
    state.gimmicks = event.target.checked;
    if (!state.gimmicks) state.contactsFault = false;
  }
  /** Schließt offene Bedienflächen mit Escape. @param {KeyboardEvent} event Ereignis. */
  escape(event) {
    if (event.key !== 'Escape') return;
    if (this.app.helpOpen) this.toggleHelp(); else if (this.app.cartridge.open) this.app.cartridge.close();
  }
  /** Startet einen ausdrücklich gewählten Debugraum. @param {Event} event Ereignis. */
  debug(event) { if (event.target.value) this.app.debug(event.target.value); event.target.value = ''; }
  /** Fokussiert die Modulaktionen. */
  focusCartridge() { element('cartridge-panel').hidden = false; element('cartridge-heading').focus(); }
  /** Stellt einen erreichbaren Fokus wieder her. */
  focusHelp() { element('help-toggle').focus(); }
  /** Aktualisiert Zustände ohne wiederholte Live-Ansagen. */
  sync() {
    if (!this.app.device.ready) return;
    this.syncDevice(); this.syncCartridge();
    element('game-controls').hidden = this.app.phase !== 'on' || !['world','character'].includes(this.app.game.mode) && !(this.app.game.mode==='title' && this.app.game.resumeData) || this.app.cartridge.open;
    const description = this.app.phase === 'on' ? this.app.game.description : '';
    if (description && description !== this.lastDescription) { this.app.announce(description); this.lastDescription = description; }
    const saveNode=element('save-status'),saveText=this.app.game.saveStatus || '';
    if (saveNode.textContent!==saveText) {
      saveNode.textContent=saveText;
      if (this.app.phase==='on' && saveText.startsWith('Speichern fehlgeschlagen')) this.app.announce(saveText);
    }
  }
  /** Spiegelt Reglerwerte und Disabled-Zustände. */
  syncDevice() {
    const { device, phase, audio } = this.app;
    element('power').setAttribute('aria-checked',String(device.power));
    for (const key of ['volume','contrast']) {
      element(key).setAttribute('aria-valuenow',String(Math.round(device[key]*100)));
      element(`${key}-input`).value = Math.round(device[key]*100);
    }
    element('contrast-input').disabled = false;
    updateSoundUI(audio);
    element('debug-level').disabled = false;
  }
  /** Zeigt ausschließlich gültige Cartridge-Aktionen. */
  syncCartridge() {
    const state = this.app.device.cartridge.state;
    element('cartridge-panel').hidden = !this.app.cartridge.open;
    element('cartridge-state').textContent = state.slot === 'removed' ? 'Detailansicht' : state.slot === 'seated' ? 'Eingerastet' : 'Zu ¾ im Schacht';
    element('cart-push').disabled = state.slot !== 'partial';
    element('cart-examine').disabled = state.slot === 'removed';
    element('cart-turn').disabled = state.slot !== 'removed';
    element('cart-blow').disabled = state.slot !== 'removed';
    element('cart-insert').disabled = state.slot !== 'removed';
    element('cart-close').disabled = false;
  }
}
