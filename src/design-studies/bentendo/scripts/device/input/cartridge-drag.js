import { clamp } from '../../core/dom.js';

/** Schiebt die sichtbare Cartridge entlang ihrer projizierten Schachtachse. */
export class CartridgeDrag {
  /** Übernimmt den bestehenden Gerätecontroller. @param {object} app Anwendung. */
  constructor(app) { this.app=app; this.drag=null; }
  /** Greift ausschließlich eine teilweise eingesteckte Cartridge in der Rückansicht. @param {PointerEvent} event Zeigerereignis. */
  start(event) {
    const {device,phase,helpOpen}=this.app;
    if (!device.ready || device.view!=='rear' || phase==='boot' || helpOpen || device.drag || event.button>0) return false;
    if (device.cartridge.state.slot!=='partial' || Math.abs(device.rig.rotation.y-Math.PI)>0.02) return false;
    if (!device.isCartridge(device.hit(event))) return false;
    const axis=device.cartridge.insertionAxis();
    if (Math.hypot(axis.x,axis.y)<4) return false;
    event.preventDefault();
    this.drag={id:event.pointerId,x:event.clientX,y:event.clientY,axis,progress:0,node:event.currentTarget,cursor:device.viewport.style.cursor};
    device.drag=this.drag; device.cartridge.insertionProgress=0;
    event.currentTarget.setPointerCapture(event.pointerId); device.viewport.style.cursor='grabbing';
    this.app.audio.unlock(); this.app.request(); return true;
  }
  /** Führt das Modul direkt mit dem gehaltenen Zeiger, ohne eine Kamera-Geste auszulösen. @param {PointerEvent} event Zeigerereignis. */
  move(event) {
    const drag=this.drag;
    if (!drag || drag.id!==event.pointerId) return false;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y,{x,y}=drag.axis;
    drag.progress=clamp((dx*x+dy*y)/(x*x+y*y));
    this.app.device.cartridge.insertionProgress=drag.progress;
    event.preventDefault(); this.app.request(); return true;
  }
  /** Rastet entschiedene Bewegungen ein und verwirft Abbruch, Fokusverlust oder zu kurze Gesten. @param {boolean} cancelled Abbruch. @param {PointerEvent} event Optionales Zeigerereignis. */
  end(cancelled,event) {
    const drag=this.drag;
    if (!drag || (event?.pointerId!==undefined && drag.id!==event.pointerId)) return false;
    if (!cancelled && event) this.move(event);
    this.drag=null; this.app.device.drag=null; this.app.device.cartridge.insertionProgress=null;
    this.app.device.viewport.style.cursor=drag.cursor;
    if (drag.node.hasPointerCapture(drag.id)) drag.node.releasePointerCapture(drag.id);
    if (!cancelled && drag.progress>=0.65) this.app.cartridge.act('push');
    else if (!cancelled && event && Math.hypot(event.clientX-drag.x,event.clientY-drag.y)<6) this.app.pressModel(event);
    this.app.request(); return true;
  }
}
