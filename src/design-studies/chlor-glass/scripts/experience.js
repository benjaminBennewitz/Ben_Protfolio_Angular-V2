/* src/design-studies/chlor-glass/scripts/experience.js */

/**
 * @file Three.js-Laufzeit und Lebenszyklus der Materialstudie.
 * @description Kapselt Renderziele, Kamera, Szenenwechsel, Größenänderung und Cleanup.
 * @author Benjamin Bennewitz
 */

import * as THREE from '../../bentendo/vendor/three/three.module.js';
import { SCENARIOS } from './content.js';
import { createPlants } from './plants.js';
import { createFrogs } from './frogs.js';
import { createGlass } from './glass.js';
import { createEnvironment } from './environment.js';

/** Verantwortet die GPU-Ressourcen und die bedarfsgesteuerte Animationsschleife. */
export class GlassExperience {
  /**
   * Initialisiert die Szene; Fehler werden von der Bedienoberfläche abgefangen.
   * @param {HTMLCanvasElement} canvas Ausgabefläche für WebGL 2.
   * @param {'light' | 'dark'} theme Initiale Gewächshausstimmung.
   */
  constructor(canvas, theme = 'light') {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'low-power' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
    this.camera.position.z = 12;
    const targetType = this.renderer.extensions.has('EXT_color_buffer_float') ? THREE.HalfFloatType : THREE.UnsignedByteType;
    this.targets = {};
    for (const key of ['background', 'canopy', 'middle', 'foreground', 'frog']) {
      const target = new THREE.WebGLRenderTarget(1, 1, {
        type: targetType,
        samples: Math.min(4, this.renderer.capabilities.maxSamples),
        resolveDepthBuffer: key === 'frog',
      });
      if (key === 'frog') target.depthTexture = new THREE.DepthTexture(1, 1);
      target.texture.generateMipmaps = true;
      target.texture.minFilter = THREE.LinearMipmapLinearFilter;
      this.targets[key] = target;
    }
    this.glass = createGlass(this.targets);
    this.renderer.setClearColor(0x000000, 0);
    this.pointer = new THREE.Vector2();
    this.view = new THREE.Vector2();
    this.sourceProjection = new THREE.Vector3();
    this.elapsed = 0;
    this.lastTime = 0;
    this.lastFrame = 0;
    this.frame = 0;
    this.paused = false;
    this.wallpaper = false;
    this.suspended = document.hidden;
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.disposed = false;
    this.tick = this.tick.bind(this);
    this.theme = theme;
    this.environment = createEnvironment();
    this.scene.add(this.environment.group);
    this.scene.fog = this.environment.fog;
    this.selectScene(0);
    this.resize();
  }

  /**
   * Synchronisiert das gesamte Gewächshaus mit dem gewählten Interface-Theme.
   * @param {'light' | 'dark'} theme Gewünschte Raum- und Lichtstimmung.
   */
  setTheme(theme) {
    this.theme = theme;
    this.environment.setTheme(theme, this.scenario?.light ?? 1);
    this.glass.material.uniforms.uDark.value = Number(theme === 'dark');
    this.render();
  }

  /**
   * Tauscht nur szeneneigene Ressourcen aus; Renderer und Glaspass bleiben erhalten.
   * @param {number} index Index der Versuchsanordnung.
   */
  selectScene(index) {
    const scenario = SCENARIOS[index];
    if (!scenario) return;
    for (const item of [this.plants, this.frogs]) {
      if (!item) continue;
      this.scene.remove(item.group);
      item.dispose();
    }
    this.scenario = scenario;
    this.plants = createPlants(scenario);
    this.frogs = scenario.frogs ? createFrogs() : null;
    this.scene.add(this.plants.group);
    if (this.frogs) this.scene.add(this.frogs.group);
    this.glass.material.uniforms.uLight.value = scenario.light;
    this.setTheme(this.theme);
    this.render();
    this.schedule();
  }

  /** Begrenzt Renderauflösung und erhält die räumliche Komposition im Hochformat. */
  resize() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    if (!width || !height) return;
    const ratio = Math.min(devicePixelRatio || 1, 1.5, 1800 / Math.max(width, height));
    this.renderer.setPixelRatio(ratio);
    this.renderer.setSize(width, height, false);
    const pixelWidth = Math.round(width * ratio);
    const pixelHeight = Math.round(height * ratio);
    for (const [key, target] of Object.entries(this.targets)) {
      const scale = key === 'foreground' || key === 'frog' ? 1 : key === 'background' ? 0.5 : 0.6;
      target.setSize(Math.max(1, Math.round(pixelWidth * scale)), Math.max(1, Math.round(pixelHeight * scale)));
    }
    const aspect = width / height;
    this.camera.aspect = aspect;
    this.camera.fov = aspect < 1 ? 53 : 45;
    this.camera.updateProjectionMatrix();
    this.updateView();
    this.glass.material.uniforms.uCameraNear.value = this.camera.near;
    this.glass.material.uniforms.uCameraFar.value = this.camera.far;
    this.glass.material.uniforms.uGlassDistance.value = this.camera.position.z;
    this.glass.material.uniforms.uResolution.value.set(pixelWidth, pixelHeight);
    this.glass.material.uniforms.uPixelRatio.value = ratio;
    this.render();
  }

  /** Verschiebt den Blick statt einzelner Pflanzen, damit Wurzeln und Boden verbunden bleiben. */
  updateView() {
    this.camera.position.x = this.view.x;
    this.camera.position.y = this.view.y;
    this.camera.updateMatrixWorld();
    this.sourceProjection.copy(this.environment.sourcePosition).project(this.camera);
    this.glass.material.uniforms.uSourceUv.value.set(this.sourceProjection.x * 0.5 + 0.5, this.sourceProjection.y * 0.5 + 0.5);
  }

  /**
   * Setzt das Parallax-Ziel in normalisierten Koordinaten; benötigt keine Pointer-Sperre.
   * @param {number} x Horizontale Position zwischen -1 und 1.
   * @param {number} y Vertikale Position zwischen -1 und 1.
   */
  setPointer(x, y) {
    if (this.paused || this.reduced || this.wallpaper) return;
    this.pointer.set(x * 0.22, -y * 0.14);
  }

  /** Aktiviert die autonome Blickbewegung, ohne Pause oder reduzierte Bewegung zu übergehen. */
  setWallpaper(enabled) {
    this.wallpaper = enabled;
    this.pointer.set(0, 0);
  }

  /** Aktualisiert eine Materialeinstellung und zeichnet auch im Pausenzustand neu. */
  setMaterial(name, value) {
    if (name === 'uFrost') value = THREE.MathUtils.clamp(Number.isFinite(value) ? value : 0.75, 0.5, 1);
    if (name === 'uMoisture') value = THREE.MathUtils.clamp(Number.isFinite(value) ? value : 0.4, 0, 1);
    this.glass.material.uniforms[name].value = value;
    this.render();
  }

  /** Synchronisiert die Animationsfreigabe mit Pause, Sichtbarkeit und Systemeinstellung. */
  setMotion({ paused = this.paused, reduced = this.reduced, suspended = this.suspended } = {}) {
    this.paused = paused;
    this.reduced = reduced;
    this.suspended = suspended;
    this.lastTime = 0;
    if (paused || reduced || suspended) {
      cancelAnimationFrame(this.frame);
      this.frame = 0;
    }
    this.render();
    this.schedule();
  }

  /** Plant höchstens einen Frame und bleibt in verborgenen Tabs vollständig inaktiv. */
  schedule() {
    if (!this.frame && !this.paused && !this.reduced && !this.suspended && !this.disposed) {
      this.frame = requestAnimationFrame(this.tick);
    }
  }

  /**
   * Aktualisiert die Simulation mit begrenztem Zeitschritt und maximal 40 Bildern/s.
   * @param {number} timestamp Browserzeit in Millisekunden.
   */
  tick(timestamp) {
    this.frame = 0;
    if (timestamp - this.lastFrame >= 25) {
      const delta = this.lastTime ? Math.min((timestamp - this.lastTime) / 1000, 0.05) : 0;
      this.lastTime = timestamp;
      this.lastFrame = timestamp;
      this.elapsed += delta;
      if (this.wallpaper) {
        this.pointer.set(Math.sin(this.elapsed * 0.13) * 0.32, Math.sin(this.elapsed * 0.09 + 0.7) * 0.16);
      }
      this.view.lerp(this.pointer, 1 - Math.exp(-delta * (this.wallpaper ? 1.2 : 4)));
      this.updateView();
      this.plants.update(this.elapsed);
      this.frogs?.update(this.elapsed);
      this.render();
    }
    this.schedule();
  }

  /** Zeichnet isolierte Farbebenen, damit deren Unschärfe keine Hintergrundsäume erzeugt. */
  render() {
    if (this.disposed || this.suspended) return;
    this.glass.material.uniforms.uTime.value = this.elapsed;
    const layers = this.plants.group.children;
    try {
      for (const [key, target] of Object.entries(this.targets)) {
        this.environment.surfaces.visible = key === 'background';
        for (const layer of layers) layer.visible = layer.name === (key === 'foreground' ? 'near' : key);
        if (this.frogs) this.frogs.group.visible = key === 'frog';
        this.renderer.setRenderTarget(target);
        this.renderer.render(this.scene, this.camera);
      }
    } finally {
      this.environment.surfaces.visible = true;
      for (const layer of layers) layer.visible = true;
      if (this.frogs) this.frogs.group.visible = true;
      this.renderer.setRenderTarget(null);
    }
    this.renderer.render(this.glass.scene, this.glass.camera);
  }

  /** Beendet die Schleife und gibt sämtliche eigenen WebGL-Ressourcen frei. */
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.plants.dispose();
    this.frogs?.dispose();
    this.glass.dispose();
    for (const target of Object.values(this.targets)) target.dispose();
    this.environment.dispose();
    this.renderer.dispose();
    this.scene.clear();
  }
}
