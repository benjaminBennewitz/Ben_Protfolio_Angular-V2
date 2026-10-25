import { combinedDirection,worldMovement } from '../../game/systems/player-movement.js';
import { syncAudioMenu } from '../../game/systems/audio-menu.js';
import { togglePause,openSaveMenu,navigateSystemMenu,activateSystemMenu,closeSystemMenu } from '../../game/systems/system-menu.js';
import { KeyboardCursor } from './keyboard-cursor.js';
import { navigateTitle } from '../../game/data/title.js';
import { navigateCharacter } from '../../game/data/characters.js';
import { element } from '../../core/dom.js';
import { navigateDrinks } from '../../game/systems/tavern.js';
import { navigateBag } from '../../game/systems/inventory.js';
const KEYS = { ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right' };

/** Vereinheitlicht Tastatur und Touch-Richtungstasten. */
export class GameInput {
  /** Verbindet Spielaktionen. @param {object} app Anwendung. */
  constructor(app) {
    this.app = app; this.keys=new Set(); this.cursor=new KeyboardCursor(app);
    document.addEventListener('keydown',this.keydown.bind(this));
    document.addEventListener('keyup',this.release.bind(this));
    window.addEventListener('blur',this.release.bind(this));
    document.addEventListener('visibilitychange',this.release.bind(this));
    for (const node of document.querySelectorAll('[data-direction]')) this.bindDirection(node);
    for (const node of document.querySelectorAll('[data-game]')) node.addEventListener('click',this.action.bind(this,node.dataset.game));
    element('screen-action').addEventListener('click',this.action.bind(this,'interact'));
  }
  /** Bindet einen Touchknopf mit Pointer-Capture. @param {HTMLButtonElement} node Richtungsknopf. */
  bindDirection(node) {
    node.addEventListener('pointerdown',this.pressDirection.bind(this,node.dataset.direction));
    node.addEventListener('pointerup',this.release.bind(this));
    node.addEventListener('pointercancel',this.release.bind(this));
    node.addEventListener('lostpointercapture',this.release.bind(this));
    node.addEventListener('click',this.accessibleDirection.bind(this,node.dataset.direction));
  }
  /** Startet eine gehaltene Touchrichtung. @param {string} direction Richtung. @param {PointerEvent} event Ereignis. */
  pressDirection(direction,event) {
    event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId);
    this.direction(direction,true);
  }
  /** Unterstützt tastaturausgelöste native Klicks. @param {string} direction Richtung. @param {MouseEvent} event Ereignis. */
  accessibleDirection(direction,event) { if (!event.detail) this.direction(direction); }
  /** Bewegt oder blättert. @param {string} direction Richtung. @param {boolean} held Wiederholung. */
  direction(direction,held=false) {
    if (this.app.helpOpen || this.app.cartridge.open) return;
    this.app.device?.buttons?.direction(direction,held); this.app.audio.playMechanical?.('dpad');
    if (this.app.phase !== 'on') { this.app.request(); return; }
    const game = this.app.game;
    if (game.systemMenu) { this.app.audio.unlock(); navigateSystemMenu(game,direction,this.app.audio); }
    else if (game.mode==='title' && game.resumeData) { this.app.audio.unlock(); navigateTitle(game,direction); }
    else if (game.mode==='character') { this.app.audio.unlock(); navigateCharacter(game,direction); }
    else if (game.tavernMenu && !game.message) navigateDrinks(game,direction);
    else if (game.bagOpen) { this.app.audio.unlock(); navigateBag(game,direction); }
    else if (game.journalOpen) game.browse(['left','up'].includes(direction)?-1:1);
    else if (!game.bagOpen && !game.mapOpen && game.mode === 'world') { game.held = held ? direction : null; game.step(direction); }
    this.app.request();
  }
  /** Führt eine Eingabe im aktiven Spiel aus. @param {string} action Aktion. */
  action(action) {
    if (this.app.helpOpen || this.app.cartridge.open) return;
    this.app.device?.buttons?.pulse(action); this.app.audio.playMechanical?.(action);
    if (this.app.phase !== 'on') { this.app.request(); return; }
    this.app.audio.unlock();
    if (action==='start') togglePause(this.app.game);
    else if (action==='select') openSaveMenu(this.app.game);
    else if (this.app.game.systemMenu) {
      if (action==='back') closeSystemMenu(this.app.game);
      else if (action==='interact') activateSystemMenu(this.app.game,this.app.saves,this.app.audio);
    }
    else if (action === 'journal') this.app.game.journal();
    else if (action === 'back') this.app.game.back();
    else this.app.game.interact();
    syncAudioMenu(this.app.game,this.app.audio); this.app.request();
  }
  /** Übersetzt Tastatureingaben ohne native Bedienelemente zu stören. @param {KeyboardEvent} event Ereignis. */
  keydown(event) {
    if (event.target.closest('input,select,textarea') || (['Enter',' '].includes(event.key) && event.target.closest('button,a')) || event.altKey || event.ctrlKey || event.metaKey) return;
    if (KEYS[event.key]) { event.preventDefault(); if (!event.repeat) this.pressKey(KEYS[event.key]); return; }
    const action = { a:'interact', A:'interact', Enter:'start', p:'start', P:'start', s:'select', S:'select', ' ':'interact', b:'back', B:'back' }[event.key];
    if (action) { event.preventDefault(); if (!event.repeat) this.action(action); }
  }
  /** Merkt jede Pfeiltaste getrennt und kombiniert sie ausschließlich beim freien Laufen. @param {string} direction Richtung. */
  pressKey(direction) {
    this.keys.add(direction);
    const next=worldMovement(this.app.game)?combinedDirection(this.keys):direction;
    if (next) this.direction(next,true); else { this.app.game.held=null; this.app.request(); }
  }
  /** Löst nur die betroffene Pfeiltaste und erhält Bewegung beim Loslassen von A. @param {Event} event Freigabe oder Fokuswechsel. */
  release(event) {
    if (event?.type==='keyup') {
      if (!KEYS[event.key]) return;
      this.keys.delete(KEYS[event.key]);
      const next=combinedDirection(this.keys);
      if (next && worldMovement(this.app.game)) { this.direction(next,true); return; }
    } else this.keys?.clear();
    if (this.app.game) this.app.game.held=null;
    this.app.device?.buttons?.release(); this.app.request();
  }
}
