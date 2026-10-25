import { ButtonMotion } from './button-motion.js';
import * as THREE from 'three';
import { createScene, animateView, resizeScene } from './scene.js';
import { loadHandheld, collectParts, mountScreen } from './model.js';
import { labelDevice } from './brand.js';
import { Cartridge } from './cartridge/cartridge.js';
import { clamp } from '../core/dom.js';
import { VIEWS } from '../core/config.js';

/** Kapselt ausschließlich Darstellung und Bedienelemente des Handhelds. */
export class Handheld {
  /** Erstellt die Geräteszene. @param {HTMLElement} viewport Zeichencontainer. */
  constructor(viewport) {
    Object.assign(this, createScene(viewport));
    this.viewport = viewport; this.view = 'front'; this.span = 0.06; this.width = 0.08;
    this.compact=matchMedia('(max-width: 600px), (pointer: coarse)');
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)');
    this.cartridge = new Cartridge(this);
    this.ready = false; this.drag = null;
    this.contrast = 0.75; this.volume = 0.35; this.power = false;
    this.raycaster = new THREE.Raycaster();
  }
  /** Lädt Gerät und Modul. @param {HTMLCanvasElement} surface LCD-Zeichenfläche. */
  async load(surface) {
    this.root = await loadHandheld(this.rig);
    this.refs = collectParts(this.root); this.buttons=new ButtonMotion(this.root);
    labelDevice(this.root); mountScreen(this, surface);
    await this.cartridge.load();
    this.ready = true;
  }
  /** Wählt eine stabile Geräteansicht. @param {string} view Ansichtsname. */
  setView(view) { if (VIEWS[view] && !this.drag) this.view = view; }
  /** Setzt den tatsächlichen Power-Schieber und die LED. @param {boolean} on Einschaltzustand. */
  setPower(on) {
    this.power = on;
    this.refs.power.position.x = this.refs.powerOff + (on ? 0.006 : 0);
    const material = this.refs.led.material;
    material.color.set(on ? '#d83928' : '#541611');
    material.emissive.set(on ? '#ff2208' : '#000000');
    material.emissiveIntensity = on ? 0.6 : 0;
  }
  /** Aktualisiert ein Stellrad. @param {string} key Reglername. @param {number} value Wert. */
  setValue(key, value) {
    this[key] = clamp(value, key === 'contrast' ? 0.2 : 0, 1);
    this.refs[key].rotation.z = this.refs[`${key}Angle`] + this[key] * Math.PI * 1.3;
  }
  /** Projiziert einen Modellpunkt in CSS-Pixel. @param {THREE.Object3D} object Modellobjekt. @param {THREE.Vector3} local Optionaler lokaler Punkt. */
  project(object, local = new THREE.Vector3()) {
    const point = object.localToWorld(local.clone()).project(this.camera);
    return { x: (point.x + 1) * this.viewport.clientWidth / 2, y: (1 - point.y) * this.viewport.clientHeight / 2 };
  }
  /** Findet ein angeklicktes 3D-Bauteil. @param {PointerEvent} event Zeigerereignis. */
  hit(event) {
    const rect = this.viewport.getBoundingClientRect();
    const point = new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, 1 - (event.clientY - rect.top) / rect.height * 2);
    this.raycaster.setFromCamera(point, this.camera);
    return this.raycaster.intersectObject(this.rig, true)[0]?.object || null;
  }
  /** Prüft die Zugehörigkeit zum eigenständigen Modul. @param {THREE.Object3D} object Getroffenes Objekt. */
  isCartridge(object) {
    while (object) {
      if (object === this.cartridge.model) return true;
      object = object.parent;
    }
    return false;
  }
  /** Aktualisiert und zeichnet die Szene. @param {number} dt Zeitschritt. */
  render(dt) {
    if (!this.ready) return false;
    const moving = animateView(this, dt);
    const buttonsMoving=this.buttons.update(dt,this.reduced.matches);
    const cartridgeMoving = this.cartridge.update(dt);
    resizeScene(this); this.scene.updateMatrixWorld(true);
    this.panel.material.color.setScalar(0.48 + this.contrast * 0.52);
    this.texture.needsUpdate = true;
    this.renderer.render(this.scene, this.camera);
    return moving || cartridgeMoving || buttonsMoving;
  }
}
