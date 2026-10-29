/* src/app/pages/project-detail-page/catalog-flow.ts */

/** @file Verwaltet ausschließlich die Canvas-Animation des Katalog-Heros und ihre Browser-Ressourcen. */

import { signal, type NgZone, type Signal } from '@angular/core';
import type { PortfolioProject } from '../../core/models/projects.models';

/** Beweglicher Partikel des generativen Katalog-Hintergrunds. */
interface CatalogFlowParticle {
  x: number;     // Aktuelle X-Position auf dem Canvas.
  y: number;     // Aktuelle Y-Position auf dem Canvas.
  speed: number; // Individuelle Bewegungsgeschwindigkeit.
  phase: number; // Individueller Phasenversatz für weicheres Noise-Verhalten.
}

/** Lokale Canvas-Steuerung mit Sichtbarkeits- und Reduced-Motion-Behandlung. */
export class CatalogFlow {
  private catalogFlowCanvas?: HTMLCanvasElement;                     // Canvas-Element der generativen Design-Archiv-Hero-Fläche.
  private catalogFlowContext?: CanvasRenderingContext2D;             // Zeichenkontext der generativen Design-Archiv-Hero-Fläche.
  private catalogFlowAnimationId = 0;                                // Aktive Animation-Frame-ID für sauberes Stoppen.
  private catalogFlowResizeObserver?: ResizeObserver;                // Resize-Observer für responsive Canvas-Abmessungen.
  private catalogFlowVisibilityObserver?: IntersectionObserver;      // Sichtbarkeits-Observer für die Hero-gebundene Canvas-Animation.
  private catalogFlowTime = 0;                                       // Zeitwert der Flow-Field-Bewegung.
  private readonly catalogFlowParticles: CatalogFlowParticle[] = []; // Bewegliche Flow-Partikel für die Canvas-Linien.
  private readonly catalogFlowParticleCount = 180;                   // Anzahl der Flow-Partikel als Performance-Limit.
  readonly isCatalogFlowHeroVisible = signal<boolean>(false);        // Gibt an, ob die Design-Archiv-Hero-Fläche sichtbar genug für Animation ist.

  /** Verbindet die Animation mit Projektzustand und Angular-Zone. */
  constructor(
    private readonly project: Signal<PortfolioProject | undefined>, // Aktives Projekt als reaktive Datenquelle.
    private readonly zone: NgZone,                                  // Führt den Zeichenloop außerhalb der Change Detection aus.
  ) { }

  /** Startet oder stoppt die generative Katalog-Hero-Fläche passend zu Projekt und Viewport. */
  toggleCatalogFlow(): void {
    if (this.project()?.slug !== 'grafikdesign-katalog' || !this.isCatalogFlowHeroVisible()) {
      this.stopCatalogFlow();
      return;
    }

    queueMicrotask(/** Startet oder stoppt die generative Katalog-Hero-Fläche passend zu Projekt und Viewport. */() => this.restartCatalogFlow());
  }

  /** Initialisiert die Canvas-Animation neu. */
  private restartCatalogFlow(): void {
    this.stopCatalogFlow();

    if (!this.catalogFlowCanvas || this.project()?.slug !== 'grafikdesign-katalog' || !this.isCatalogFlowHeroVisible()) {
      return;
    }

    const context = this.catalogFlowCanvas.getContext('2d', { alpha: true }); // Verfügbarer Canvas-Zeichenkontext.

    if (!context) {
      return;
    }

    this.catalogFlowContext = context;
    this.catalogFlowResizeObserver = new ResizeObserver(/** Initialisiert die Canvas-Animation neu. */() => this.resizeCatalogFlow());
    this.catalogFlowResizeObserver.observe(this.catalogFlowCanvas);
    this.resizeCatalogFlow();
    this.seedCatalogFlowParticles();

    if (this.isCatalogMotionReduced()) {
      this.drawCatalogFlowFrame();
      return;
    }

    this.zone.runOutsideAngular(/** Plant den nächsten Layout- oder Animationsschritt der Seite. */() => {

      /** Plant den nächsten Layout- oder Animationsschritt der Seite. */
      const draw = () => {
        this.drawCatalogFlowFrame();

        if (!this.catalogFlowContext || !this.isCatalogFlowHeroVisible()) {
          return;
        }

        this.catalogFlowAnimationId = requestAnimationFrame(draw);
      };

      this.catalogFlowAnimationId = requestAnimationFrame(draw);
    });
  }

  /** Verbindet die Katalog-Hero-Animation mit der echten Hero-Sichtbarkeit. */
  private connectCatalogFlowVisibilityObserver(): void {
    this.catalogFlowVisibilityObserver?.disconnect();
    this.catalogFlowVisibilityObserver = undefined;
    this.isCatalogFlowHeroVisible.set(false);

    if (!this.catalogFlowCanvas || typeof window === 'undefined') {
      this.stopCatalogFlow();
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      this.isCatalogFlowHeroVisible.set(true);
      return;
    }

    const heroElement = this.catalogFlowCanvas.closest('.project-detail__hero') ?? this.catalogFlowCanvas; // Hero-Bereich für die Sichtbarkeitsbeobachtung.

    this.catalogFlowVisibilityObserver = new IntersectionObserver(/** Verbindet die Katalog-Hero-Animation mit der echten Hero-Sichtbarkeit. */(entries) => {

      const isVisible = Boolean(entries[0]?.isIntersecting); // Hero liegt ausreichend im sichtbaren Bereich.

      this.isCatalogFlowHeroVisible.set(isVisible);

      if (!isVisible) {
        this.stopCatalogFlow();
      }
    }, { threshold: [0, 0.08, 0.2] });

    this.catalogFlowVisibilityObserver.observe(heroElement);
  }

  /** Stoppt Canvas-Animation und Observer. */
  private stopCatalogFlow(): void {
    if (this.catalogFlowAnimationId) {
      cancelAnimationFrame(this.catalogFlowAnimationId);
      this.catalogFlowAnimationId = 0;
    }

    this.catalogFlowResizeObserver?.disconnect();
    this.catalogFlowResizeObserver = undefined;
    this.catalogFlowContext = undefined;
  }

  /** Passt die Canvas-Auflösung an die echte Darstellungsgröße an. */
  private resizeCatalogFlow(): void {
    if (!this.catalogFlowCanvas || !this.catalogFlowContext) {
      return;
    }

    const rect = this.catalogFlowCanvas.getBoundingClientRect();    // Gemessene Grenzen des aktuellen Elements.
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);         // Begrenztes Pixelverhältnis für die Canvas-Auflösung.
    const width = Math.max(1, Math.floor(rect.width * pixelRatio));  // Berechnete Breite in CSS-Pixeln.
    const height = Math.max(1, Math.floor(rect.height * pixelRatio)); // Berechnete Höhe in CSS-Pixeln.

    if (this.catalogFlowCanvas.width === width && this.catalogFlowCanvas.height === height) {
      return;
    }

    this.catalogFlowCanvas.width = width;
    this.catalogFlowCanvas.height = height;
    this.catalogFlowContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    this.seedCatalogFlowParticles();
  }

  /** Verteilt die Flow-Partikel neu über die gesamte Fläche. */
  private seedCatalogFlowParticles(): void {
    if (!this.catalogFlowCanvas) {
      return;
    }

    const rect = this.catalogFlowCanvas.getBoundingClientRect(); // Gemessene Grenzen des aktuellen Elements.

    this.catalogFlowParticles.length = 0;

    for (let index = 0; index < this.catalogFlowParticleCount; index += 1) {
      this.catalogFlowParticles.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        speed: 0.35 + Math.random() * 1.15,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  /** Zeichnet eine Flow-Field-ähnliche Animationsstufe. */
  private drawCatalogFlowFrame(): void {
    if (!this.catalogFlowCanvas || !this.catalogFlowContext) {
      return;
    }

    if (!this.isCatalogFlowHeroVisible()) {
      this.stopCatalogFlow();
      return;
    }

    const rect = this.catalogFlowCanvas.getBoundingClientRect(); // Gemessene Grenzen des aktuellen Elements.
    const ctx = this.catalogFlowContext;                        // Canvas-Kontext des aktuellen Zeichenframes.

    this.catalogFlowTime += 0.006;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.045)';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 0.85;

    for (const particle of this.catalogFlowParticles) {

      const previousX = particle.x;                         // Horizontale Partikelposition vor dem Bewegungsschritt.
      const previousY = particle.y;                         // Vertikale Partikelposition vor dem Bewegungsschritt.
      const angle = this.getCatalogFlowAngle(particle); // Strömungswinkel an der aktuellen Partikelposition.

      particle.x += Math.cos(angle) * particle.speed;
      particle.y += Math.sin(angle) * particle.speed;

      if (particle.x < -20 || particle.x > rect.width + 20 || particle.y < -20 || particle.y > rect.height + 20) {
        this.resetCatalogFlowParticle(particle, rect.width, rect.height);
        continue;
      }

      ctx.strokeStyle = this.getCatalogFlowStroke(particle, rect.width);
      ctx.beginPath();
      ctx.moveTo(previousX, previousY);
      ctx.lineTo(particle.x, particle.y);
      ctx.stroke();
    }
  }

  /** Erzeugt einen weichen Winkel aus trigonometrischem Pseudo-Noise. */
  private getCatalogFlowAngle(particle: CatalogFlowParticle): number {

    const xWave = Math.sin(particle.x * 0.0065 + this.catalogFlowTime + particle.phase);     // Horizontaler Wellenanteil des Flow-Feldes.
    const yWave = Math.cos(particle.y * 0.0075 - this.catalogFlowTime * 0.9);                // Vertikaler Wellenanteil des Flow-Feldes.
    const zWave = Math.sin((particle.x + particle.y) * 0.0028 + this.catalogFlowTime * 1.6); // Zeitabhängiger Wellenanteil des Flow-Feldes.

    return (xWave + yWave + zWave) * Math.PI;
  }

  /** Setzt ein Partikel am Rand neu ein, ohne harte Wrap-Linien zu zeichnen. */
  private resetCatalogFlowParticle(particle: CatalogFlowParticle, width: number, height: number): void {

    const side = Math.floor(Math.random() * 4); // Zufällig gewählte Eintrittskante des Partikels.

    particle.x = side === 0 ? 0 : side === 1 ? width : Math.random() * width;
    particle.y = side === 2 ? 0 : side === 3 ? height : Math.random() * height;
    particle.speed = 0.35 + Math.random() * 1.15;
    particle.phase = Math.random() * Math.PI * 2;
  }

  /** Ermittelt die Linienfarbe mit leichter Positionsvariation. */
  private getCatalogFlowStroke(particle: CatalogFlowParticle, width: number): string {

    const progress = width > 0 ? particle.x / width : 0;         // Normalisierter Fortschritt des aktuellen Ablaufs.
    const alpha = 0.16 + Math.sin(progress * Math.PI) * 0.22; // Deckkraft des aktuellen Partikelstrichs.

    return `rgba(255, 79, 216, ${alpha.toFixed(3)})`;
  }

  /** Prüft reduzierte Motion-Einstellungen für den Canvas. */
  private isCatalogMotionReduced(): boolean {

    const motionMode = document.documentElement.dataset['motion']; // Gespeicherter globaler Bewegungsmodus.

    return motionMode === 'off' || motionMode === 'reduced' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** Übernimmt die aktuelle Canvas-Referenz und erneuert die Sichtbarkeitsbeobachtung. */
  setCanvas(canvas: HTMLCanvasElement | undefined): void {
    this.catalogFlowCanvas = canvas;
    this.connectCatalogFlowVisibilityObserver();
  }

  /** Beendet die Zeichenanimation und die Sichtbarkeitsbeobachtung. */
  destroy(): void {
    this.stopCatalogFlow();
    this.catalogFlowVisibilityObserver?.disconnect();
    this.catalogFlowCanvas = undefined;
    this.isCatalogFlowHeroVisible.set(false);
  }
}
