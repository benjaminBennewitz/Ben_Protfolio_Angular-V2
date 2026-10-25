import { combinedDirection,worldMovement } from '../../game/systems/player-movement.js';
import { buttonAction } from '../button-motion.js';

/** Verbindet direkte Geräteberührung mit derselben Spiellogik wie native Tasten. */
export class ModelButtons {
  /** Merkt jede Fingerberührung getrennt für gleichzeitiges Laufen und Bestätigen. @param {object} app Anwendung. */
  constructor(app) { this.app=app; this.pointers=new Map(); }
  /** Vergrößert auf kleinen Displays nur die unsichtbare Trefferfläche der tatsächlichen Modellknöpfe. @param {PointerEvent} event Berührung. */
  actionAt(event) {
    const device=this.app.device,hit=buttonAction(device.hit(event));
    if (hit || !device.compact?.matches) return hit;
    const bounds=device.viewport.getBoundingClientRect(); let nearest=null,distance=26;
    for (const node of device.refs.buttons) {
      const point=device.project(node),d=Math.hypot(event.clientX-bounds.left-point.x,event.clientY-bounds.top-point.y);
      if (d<distance) { nearest=node; distance=d; }
    }
    return buttonAction(nearest);
  }
  /** Beginnt eine echte Tastenberührung ohne spätere Doppelauslösung beim Loslassen. @param {PointerEvent} event Berührung. @param {string} action Bekannte Taste oder Modelltreffer. @param {string} direction Explizite Richtung. */
  start(event,action=this.actionAt(event),direction=null) {
    const {device}=this.app;
    if (!device.ready || !['front','bottom'].includes(device.view) || this.app.helpOpen || this.app.cartridge.open) return false;
    if (!action) return false;
    event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId);
    direction=action==='dpad'?(direction || this.app.dpadDirection(event)):null;
    this.pointers.set(event.pointerId,{action,direction});
    if (direction) this.app.input.direction(direction,true); else this.app.input.action(action);
    device.buttons.hold(action,direction); this.restoreWalk(); this.app.request(); return true;
  }
  /** Erlaubt Richtungswechsel mit aufliegendem Finger und verhindert dabei eine Kamerageste. @param {PointerEvent} event Bewegung. */
  move(event) {
    const point=this.pointers.get(event.pointerId); if (!point) return false;
    if (point.action==='dpad') {
      const direction=this.app.dpadDirection(event);
      if (direction!==point.direction) { point.direction=direction; this.app.input.direction(direction,true); }
    }
    return true;
  }
  /** Löst genau den losgelassenen Finger und erhält ein separat gehaltenes Steuerkreuz. @param {PointerEvent} event Freigabe. */
  end(event) {
    const point=this.pointers.get(event.pointerId); if (!point) return false;
    this.pointers.delete(event.pointerId); this.app.audio.playMechanical?.(point.action,true);
    this.app.input.release(); this.restoreWalk(); this.app.request(); return true;
  }
  /** Entfernt abgebrochene Berührungen auch bei Fokusverlust. @param {Event} event Abbruch. */
  cancel(event) {
    if (event?.pointerId!==undefined) return this.end(event) || this.pointers.size>0;
    this.pointers.clear(); this.app.input.release(); return false;
  }
  /** Stellt nur außerhalb von Dialogen und Menüs eine weiterhin gehaltene Laufrichtung wieder her. */
  restoreWalk() {
    const {game,device}=this.app;
    const directions=[];
    for (const point of this.pointers.values()) if (point.direction) directions.push(point.direction);
    const direction=combinedDirection(directions);
    if (direction) {
      device.buttons.hold('dpad',direction);
      if (this.app.phase==='on' && worldMovement(game)) game.held=direction;
    }
  }
}
