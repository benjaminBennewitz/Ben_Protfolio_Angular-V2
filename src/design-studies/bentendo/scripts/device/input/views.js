import { ModelButtons } from './model-buttons.js';
import { element } from '../../core/dom.js';
import { RearIntent } from './rear-intent.js';
import { CartridgeDrag } from './cartridge-drag.js';
import { deviceBounds, rearExit, overDisplayFrame } from './view-zones.js';

/** Erkennt Maus-Randzonen und Touchgesten ohne Reglerflucht. */
export class ViewControls {
  /** Verbindet die Geräteansicht. @param {object} app Anwendung. */
  constructor(app) {
    this.app = app; this.touch = null; this.pointer=null; this.rearPointer=null; this.rearIntent=new RearIntent();
    this.cartridgeDrag=new CartridgeDrag(app); this.modelButtons=new ModelButtons(app);
    const viewport = app.device.viewport;
    document.addEventListener('pointermove', this.move.bind(this));
    viewport.addEventListener('pointerdown', this.start.bind(this));
    viewport.addEventListener('pointerup', this.end.bind(this));
    viewport.addEventListener('pointercancel', this.cancel.bind(this));
    viewport.addEventListener('lostpointercapture', this.cancel.bind(this));
    window.addEventListener('blur',this.cancel.bind(this));
  }
  /** Erkennt Randbereiche in der frontalen Projektion. @param {number} x Zeiger-X. @param {number} y Zeiger-Y. */
  edge(x, y) {
    const device = this.app.device, width = device.viewport.clientWidth, height = device.viewport.clientHeight;
    const aspect = width / height, span = Math.max(0.06, 0.08 / aspect);
    const bounds = device.refs.bounds;
    const left = (0.5 + (bounds.min.x - device.camera.position.x) / (span * aspect)) * width;
    const right = (0.5 + (bounds.max.x - device.camera.position.x) / (span * aspect)) * width;
    const top = (0.5 - (bounds.max.y - device.camera.position.y) / span) * height;
    if (y < Math.max(30, top + 35)) return 'top';
    if (x < Math.max(30, left + 35)) return 'left';
    if (x > Math.min(width - 30, right - 35)) return 'right';
    return null;
  }
  /** Hält die gewählte Ansicht in Reglernähe fest. @param {number} x Zeiger-X. @param {number} y Zeiger-Y. */
  nearControl(x, y) {
    const device = this.app.device;
    const key = { top: 'power', left: 'contrast', right: 'volume' }[device.view];
    if (device.view==='bottom') {
      for (const button of device.refs.buttons) { const p=device.project(button); if (Math.hypot(x-p.x,y-p.y)<65) return true; }
    }
    if (!key) return false;
    const p = device.project(device.refs[key]);
    return Math.hypot(x - p.x, y - p.y) < 100;
  }
  /** Verarbeitet Mausbewegung und priorisiert den Displayrahmen als Rückkehrfläche. @param {PointerEvent} event Ereignis. */
  move(event) {
    const device=this.app.device, rect=device.viewport.getBoundingClientRect();
    const x=event.clientX-rect.left, y=event.clientY-rect.top;
    if (event.pointerType==='mouse') this.pointer={x,y};
    if (this.modelButtons.move(event)) return;
    if (this.cartridgeDrag.move(event)) return;
    if (!device.ready || device.compact?.matches || event.pointerType!=='mouse' || device.drag || this.app.helpOpen) return;
    if (event.target.closest('.panel,.utility,.hotspot,#game-controls')) return;
    if (device.view==='rear') { this.rearPointer={x,y}; return this.moveRear(x,y); }
    if (device.view==='front' && y>device.viewport.clientHeight*0.86) return this.app.setView('bottom');
    if (device.view==='bottom' && this.nearControl(x,y)) return;
    if (overDisplayFrame(device,x,y)) { if (device.view!=='front') this.app.setView('front'); return; }
    if (device.view==='bottom' || this.nearControl(x,y)) return;
    const view=this.edge(x,y);
    if (view) this.app.setView(view);
  }
  /** Verwirft die Zeigerposition vor einer neuen Rückansicht. */
  resetRear() { this.rearPointer=null; this.rearIntent.reset(this.pointer); }
  /** Prüft eine bereits verlassene Fläche erneut nach abgeschlossener Kameradrehung. */
  update() {
    if (!this.rearPointer || this.app.device.view !== 'rear' || this.app.helpOpen || this.app.device.drag) return;
    this.moveRear(this.rearPointer.x,this.rearPointer.y);
  }
  /** Gibt die Rückansicht außerhalb des Gehäuses wieder frei. @param {number} x Zeiger-X. @param {number} y Zeiger-Y. */
  moveRear(x,y) {
    const device = this.app.device;
    if (Math.abs(device.rig.rotation.y-Math.PI)>0.02) return;
    const bounds=deviceBounds(device), panel=element('cartridge-panel').getBoundingClientRect();
    const offset=device.viewport.getBoundingClientRect();
    const actions={left:panel.left-offset.left,right:panel.right-offset.left,top:panel.top-offset.top,bottom:panel.bottom-offset.top};
    if (!this.rearIntent.mayLeave({x,y},bounds,actions)) return;
    const view = rearExit(bounds,x,y);
    if (view) this.app.cartridge.leave(view);
  }
  /** Merkt den Beginn einer möglichen Tipp- oder Wischgeste. @param {PointerEvent} event Ereignis. */
  start(event) {
    if (event.button > 0) return;
    if (this.cartridgeDrag.start(event)) { this.touch=null; this.rearPointer=null; return; }
    if (this.modelButtons.start(event)) { this.touch=null; return; }
    this.app.pressVisual(event);
    this.touch = { x: event.clientX, y: event.clientY, id: event.pointerId };
    if (event.pointerType !== 'mouse') event.currentTarget.setPointerCapture(event.pointerId);
  }
  /** Führt Tipp oder Wischgeste aus. @param {PointerEvent} event Ereignis. */
  end(event) {
    if (this.modelButtons.end(event)) return;
    this.app.device.buttons?.release(); this.app.request();
    if (this.cartridgeDrag.end(false,event)) { this.resetRear(); return; }
    if (!this.touch || this.touch.id !== event.pointerId) return;
    const dx = event.clientX - this.touch.x, dy = event.clientY - this.touch.y;
    this.touch = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 12) return this.app.pressModel(event);
    if (event.pointerType === 'mouse') return;
    const view = Math.abs(dy) > Math.abs(dx) ? (this.app.device.view==='front'?(dy>0?'top':'bottom'):'front') : (dx < 0 ? 'right' : 'left');
    if (this.app.device.view === 'rear') this.app.cartridge.leave(view); else this.app.setView(view);
  }
  /** Verwirft abgebrochene Gesten einschließlich Cartridge-Vorschau. @param {PointerEvent} event Optionales Abbruchereignis. */
  cancel(event) { if (this.modelButtons.cancel(event)) return; this.app.device.buttons?.release(); this.app.request(); this.touch = null; this.cartridgeDrag.end(true,event); }
}
