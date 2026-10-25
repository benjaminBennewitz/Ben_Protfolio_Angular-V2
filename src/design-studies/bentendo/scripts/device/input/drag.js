import { powerGestureState } from './power-gesture.js';
import { clamp } from '../../core/dom.js';
import * as THREE from 'three';

/** Verwaltet Reglergesten einschließlich Abbruch und Pointer-Capture. */
export class DragControls {
  /** Verbindet Regler mit dem Controller. @param {object} app Anwendung. */
  constructor(app) { this.app = app; this.drag = null; }
  /** Bindet ein natives Bedienelement. @param {HTMLElement} node Regler. @param {string} key Reglername. */
  bind(node, key) {
    node.addEventListener('pointerdown', this.start.bind(this, key));
    node.addEventListener('pointermove', this.move.bind(this));
    node.addEventListener('pointerup', this.end.bind(this, false));
    node.addEventListener('pointercancel', this.end.bind(this, true));
    node.addEventListener('lostpointercapture', this.end.bind(this, true));
  }
  /** Startet eine gültige Geste. @param {string} key Reglername. @param {PointerEvent} event Ereignis. */
  start(key, event) {
    if (!this.app.device.ready || this.app.phase === 'boot' || event.button > 0) return;
    event.preventDefault(); event.currentTarget.focus({ preventScroll: true });
    this.app.audio.unlock();
    const device = this.app.device;
    const p0 = device.project(device.refs.power);
    const p1 = device.project(device.refs.power, new THREE.Vector3(0.006, 0, 0));
    this.drag = { pointerType:event.pointerType,distance:0,key, id: event.pointerId, x: event.clientX, y: event.clientY, value: key === 'power' ? Number(device.power) : device[key], axisX: p1.x - p0.x, axisY: p1.y - p0.y };
    device.drag = this.drag; event.currentTarget.setPointerCapture(event.pointerId);
  }
  /** Bewegt Schieber oder Rad. @param {PointerEvent} event Ereignis. */
  move(event) {
    const drag = this.drag;
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y; drag.distance=Math.max(drag.distance,Math.hypot(dx,dy));
    if (drag.key === 'power') {
      const value = clamp(drag.value + (dx * drag.axisX + dy * drag.axisY) / Math.max(25, drag.axisX ** 2 + drag.axisY ** 2));
      this.app.device.refs.power.position.x = this.app.device.refs.powerOff + value * 0.006;
      drag.preview = value;
    } else this.app.setValue(drag.key, drag.value - dy / 160);
    this.app.request();
  }
  /** Beendet oder verwirft eine Geste. @param {boolean} cancelled Abbruch. @param {PointerEvent} event Ereignis. */
  end(cancelled, event) {
    const drag = this.drag;
    if (!drag || drag.id !== event.pointerId) return;
    this.drag = null; this.app.device.drag = null;
    if (drag.key === 'power') this.finishPower(drag, cancelled);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    this.app.request();
  }
  /** Übernimmt ausschließlich entschiedene Schieberbewegungen. @param {object} drag Geste. @param {boolean} cancelled Abbruch. */
  finishPower(drag, cancelled) {
    const wasOn = this.app.device.power;
    const next=powerGestureState(drag,wasOn,cancelled);
    if (next !== wasOn) this.app.setPower(next);
    else this.app.device.setPower(wasOn);
  }
}
