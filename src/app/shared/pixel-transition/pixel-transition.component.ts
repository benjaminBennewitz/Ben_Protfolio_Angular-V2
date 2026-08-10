/* src/app/shared/pixel-transition/pixel-transition.component.ts */

/**
 * @file Scrollgebundene Pixel-Raster-Transition.
 * @description Lässt zwischen zwei Sections ein grobes Raster in ein feineres Raster übergehen und räumt dieses schrittweise frei.
 */

import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, ViewChild, signal } from '@angular/core';

/** Farbvarianten für unterschiedliche Übergänge auf der Startseite. */
export type PixelTransitionTone = 'dark-to-base' | 'base-to-contact';

/** Beschreibt eine einzelne Rasterzelle mit deterministischer Auflöseschwelle. */
interface PixelTransitionCell {
  /** Individuelle Schwelle der Zelle. */
  readonly threshold: number;
  /** Hebt einzelne Zellen als Akzentpunkte hervor. */
  readonly accent: boolean;
}

/** Scrollgesteuerte Rasterauflösung zwischen zwei Inhaltsbereichen. */
@Component({
  selector: 'bp-pixel-transition',
  standalone: true,
  templateUrl: './pixel-transition.component.html',
  styleUrl: './pixel-transition.component.scss',
  host: {
    'aria-hidden': 'true',
  },
})
export class PixelTransitionComponent implements AfterViewInit, OnDestroy {
  /** Farbkontext des Übergangs. */
  @Input() tone: PixelTransitionTone = 'dark-to-base';

  /** Referenz auf die Transition-Bühne. */
  @ViewChild('sectionRef') private readonly sectionRef?: ElementRef<HTMLElement>;

  /** Aktueller Scrollfortschritt zwischen 0 und 1. */
  readonly progress = signal(0);

  /** Grobe Rasterebene für den ersten Reveal-Schritt. */
  readonly coarseCells: readonly PixelTransitionCell[] = this.createCells(12, 6, 0.58, 5);

  /** Feinere Rasterebene für die spätere Detailauflösung. */
  readonly fineCells: readonly PixelTransitionCell[] = this.createCells(28, 16, 0.84, 7, 0.14);

  /** Geplanter AnimationFrame für gedrosselte Scrollmessung. */
  private frameId = 0;

  /** Initialisiert den Fortschritt nach dem ersten Rendern. */
  ngAfterViewInit(): void {
    this.scheduleProgressUpdate();
  }

  /** Stoppt einen noch geplanten Scroll-Frame beim Entfernen der Transition. */
  ngOnDestroy(): void {
    cancelAnimationFrame(this.frameId);
    this.frameId = 0;
  }

  /** Aktualisiert die Rasterauflösung beim Scrollen. */
  @HostListener('window:scroll')
  onScroll(): void {
    this.scheduleProgressUpdate();
  }

  /** Aktualisiert die Rasterauflösung bei veränderter Viewport-Höhe. */
  @HostListener('window:resize')
  onResize(): void {
    this.scheduleProgressUpdate();
  }

  /** Liefert die sichtbare Skalierung einer groben Rasterzelle. */
  coarseScale(threshold: number): number {
    return this.resolveScale(threshold, 0.34, 0.1);
  }

  /** Liefert die Deckkraft einer groben Rasterzelle. */
  coarseOpacity(threshold: number): number {
    return this.resolveOpacity(threshold, 0.34);
  }

  /** Liefert die sichtbare Skalierung einer feinen Rasterzelle. */
  fineScale(threshold: number): number {
    return this.resolveScale(threshold, 0.24, 0.14);
  }

  /** Liefert die Deckkraft einer feinen Rasterzelle. */
  fineOpacity(threshold: number): number {
    return this.resolveOpacity(threshold, 0.24);
  }

  /** Steuert die Restabdeckung über dem Reveal. */
  veilOpacity(): number {
    return Math.max(0, 0.52 - this.progress() * 0.58);
  }

  /** Bündelt Scrollmessungen auf maximal ein Update pro AnimationFrame. */
  private scheduleProgressUpdate(): void {
    if (this.frameId) {
      return;
    }

    this.frameId = requestAnimationFrame(() => {
      this.frameId = 0;
      this.updateProgress();
    });
  }

  /** Rechnet die Position der Transition-Bühne in einen Fortschritt von 0 bis 1 um. */
  private updateProgress(): void {
    const element = this.sectionRef?.nativeElement;

    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const start = window.innerHeight * 0.9;
    const end = window.innerHeight * 0.04 - rect.height * 0.26;
    const rawProgress = (start - rect.top) / Math.max(1, start - end);

    this.progress.set(Math.max(0, Math.min(1, rawProgress)));
  }

  /** Erzeugt eine deterministische Menge an Rasterzellen. */
  private createCells(columns: number, rows: number, spread: number, accentModulo: number, offset = 0): readonly PixelTransitionCell[] {
    return Array.from({ length: columns * rows }, (_, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const pseudoRandom = ((column * 37 + row * 53 + (column + row) * 11) % 100) / 100;

      return {
        threshold: offset + pseudoRandom * spread,
        accent: (column + row) % accentModulo === 0,
      };
    });
  }

  /** Ermittelt die Skalierung einer Zelle auf Basis des globalen Fortschritts. */
  private resolveScale(threshold: number, spread: number, minScale: number): number {
    const localProgress = (this.progress() - threshold) / spread;
    return Math.max(0, Math.min(1, Math.max(minScale, 1 - localProgress)));
  }

  /** Ermittelt die Deckkraft einer Zelle auf Basis des globalen Fortschritts. */
  private resolveOpacity(threshold: number, spread: number): number {
    const localProgress = (this.progress() - threshold) / spread;
    const opacity = 1 - Math.max(0, Math.min(1, localProgress));
    return opacity <= 0.05 ? 0 : opacity;
  }
}
