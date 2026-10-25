import { CartridgeState } from './state.js';
import { CartridgeCover } from './cover.js';
import { loadCartridge } from './model.js';
import { fitCartridge } from './fit.js';
import { insertionPosition } from './poses.js';

/** Verbindet den Modulzustand mit seiner sichtbaren Position. */
export class Cartridge {
  /** Bereitet das Modul vor. @param {object} device Zugehöriges Gerät. */
  constructor(device) { this.device = device; this.state = new CartridgeState(); this.model = null; this.blowTime = 0; this.turned = false; this.insertionProgress=null; }
  /** Lädt und befestigt das eigenständige Modell. */
  async load() {
    this.model = await loadCartridge();
    this.cover = new CartridgeCover(this.model);
    this.device.root.add(this.model);
    this.baseScale=this.model.scale.clone();
    this.poses=fitCartridge(this.device,this.model);
    this.model.position.set(...this.poses.partial);
  }
  /** Liefert die Zielposition relativ zur zentrierten Gerätewurzel. */
  target() {
    if (this.insertionProgress!==null) return insertionPosition(this.poses,this.insertionProgress);
    return this.poses[this.state.slot];
  }
  /** Projiziert die Einsetzrichtung mit derselben Kamera wie das sichtbare Modell. */
  insertionAxis() {
    const point=this.model.position.clone();
    const start=this.device.project(this.device.root,point.fromArray(this.poses.partial));
    const end=this.device.project(this.device.root,point.fromArray(this.poses.seated));
    return {x:end.x-start.x,y:end.y-start.y};
  }
  /** Bewegt das Modul ohne springende Transformationen. @param {number} dt Zeitschritt. */
  update(dt) {
    if (!this.model) return false;
    const target = this.target();
    const alpha = this.insertionProgress!==null || this.device.reduced.matches ? 1 : 1 - Math.exp(-dt * 10);
    const distance = this.distance(target);
    if (distance<0.00001) this.model.position.set(...target);
    else this.model.position.lerp({ x: target[0], y: target[1], z: target[2] }, alpha);
    this.blowTime = Math.max(0, this.blowTime - dt);
    this.model.rotation.x = this.blowTime && !this.device.reduced.matches ? Math.sin(this.blowTime * 16) * 0.035 : 0;
    const rotation = this.state.slot === 'removed' && this.turned ? Math.PI : 0;
    this.model.rotation.y += (rotation-this.model.rotation.y)*alpha;
    const scaling=this.animateScale(alpha);
    return distance > 0.00001 || scaling || this.blowTime > 0 || Math.abs(rotation-this.model.rotation.y)>0.001;
  }
  /** Vergrößert ausschließlich die nach vorn gezogene Cartridge. @param {number} alpha Interpolationsfaktor. */
  animateScale(alpha) {
    const factor=this.state.slot==='removed'?1.8:1;
    const target=this.baseScale.clone().multiplyScalar(factor);
    this.model.scale.lerp(target,alpha);
    if (this.model.scale.distanceTo(target)<0.001) { this.model.scale.copy(target); return false; }
    return true;
  }
  /** Misst den Abstand zur Zielposition. @param {number[]} target Zielkoordinaten. */
  distance(target) {
    return Math.hypot(this.model.position.x - target[0], this.model.position.y - target[1], this.model.position.z - target[2]);
  }
}
