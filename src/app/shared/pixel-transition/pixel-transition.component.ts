/* src/app/shared/pixel-transition/pixel-transition.component.ts */

/**
 * @file Scrollgebundener Pixel-Reveal.
 * @description Liegt direkt über dem echten Section-Content und löst ihn grob-zu-fein mit quadratischen Rasterzellen, Glitch-Bändern und Scanlines auf.
 */

import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, computed, inject, signal } from '@angular/core';

/** Farbvarianten für unterschiedliche Section-Untergründe. */
export type PixelTransitionTone = 'base' | 'surface' | 'dark' | 'accented';

/** Einzelne Zelle eines Reveal-Rasters. */
interface PixelTransitionCell {
  readonly threshold: number; // Individuelle Auflöseschwelle der Zelle.
  readonly accent: boolean;   // Zusätzlicher Akzent für vereinzelte Zellen.
}

/** Scrollgesteuerter Overlay-Reveal, der immer den tatsächlichen Parent-Content freilegt. */
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
  @Input() tone: PixelTransitionTone = 'base';                         // Farbkontext des Reveals.
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef); // Hostelement für den Zugriff auf die tatsächlich zu enthüllende Parent-Section.
  readonly progress = signal(0);                                       // Aktueller Reveal-Fortschritt zwischen 0 und 1.
  readonly veilOpacity = computed(                                     // Solid-Veil für einen vollständig verdeckten Startzustand.
    /** Solid-Veil für einen vollständig verdeckten Startzustand. */
    () => this.inverseWindow(0, 0.18)
  );

  readonly coarseCells = this.createCells(12, 7, 0.46, 5, 0.02);       // Grobes Raster für den ersten Block-Out.
  readonly mediumCells = this.createCells(20, 12, 0.58, 7, 0.18);      // Mittleres Raster für den Hauptteil des Reveals.
  readonly fineCells = this.createCells(34, 18, 0.68, 9, 0.34);        // Feines Raster für das letzte Decode-Stadium.
  readonly glitchShiftPrimary = computed(                              // Leichte horizontale Verschiebung der ersten Glitch-Spur.
    /** Leichte horizontale Verschiebung der ersten Glitch-Spur. */
    () => `${Math.round((1 - this.progress()) * 26)}px`
  );

  readonly glitchShiftSecondary = computed(                            // Gegenläufige Verschiebung der zweiten Glitch-Spur.
    /** Gegenläufige Verschiebung der zweiten Glitch-Spur. */
    () => `${Math.round((1 - this.progress()) * -18)}px`
  );

  readonly scanPosition = computed(                                    // Hauptscanlinie wandert mit dem Reveal.
    /** Hauptscanlinie wandert mit dem Reveal. */
    () => this.progress() * 100
  );

  readonly echoScanPosition = computed(                                // Echo-Scanlinie folgt leicht versetzt.
    /** Echo-Scanlinie folgt leicht versetzt. */
    () => Math.min(100, this.progress() * 100 + 8)
  );

  private frameId = 0;                                                 // Geplanter AnimationFrame für gedrosselte Scrollmessung.
  private targetSection?: HTMLElement;                                 // Parent-Section, deren echter Content vom Overlay enthüllt wird.

  /** Initialisiert die Parent-Section und den ersten Reveal-Zustand. */
  ngAfterViewInit(): void {
    this.targetSection = this.host.nativeElement.parentElement ?? undefined;
    this.targetSection?.classList.add('bp-pixel-reveal-target');
    this.scheduleProgressUpdate();
  }

  /** Entfernt Hilfsklasse und laufenden AnimationFrame. */
  ngOnDestroy(): void {
    cancelAnimationFrame(this.frameId);
    this.frameId = 0;
    this.targetSection?.classList.remove('bp-pixel-reveal-target');
  }

  /** Aktualisiert den Reveal beim Scrollen. */
  @HostListener('window:scroll')
  onScroll(): void {
    this.scheduleProgressUpdate();
  }

  /** Aktualisiert den Reveal bei Viewportänderungen. */
  @HostListener('window:resize')
  onResize(): void {
    this.scheduleProgressUpdate();
  }

  /** Liefert die Deckkraft einer Grobzelle. */
  coarseOpacity(cell: PixelTransitionCell): number {
    return this.cellOpacity(cell, 0.04, 0.42);
  }

  /** Liefert die Deckkraft einer Mittelzelle. */
  mediumOpacity(cell: PixelTransitionCell): number {
    return this.cellOpacity(cell, 0.2, 0.7);
  }

  /** Liefert die Deckkraft einer Feinzelle. */
  fineOpacity(cell: PixelTransitionCell): number {
    return this.cellOpacity(cell, 0.42, 0.98);
  }

  /** Liefert die Skalierung einer Grobzelle. */
  coarseScale(cell: PixelTransitionCell): number {
    return this.cellScale(cell, 0.04, 0.42, 0.22);
  }

  /** Liefert die Skalierung einer Mittelzelle. */
  mediumScale(cell: PixelTransitionCell): number {
    return this.cellScale(cell, 0.2, 0.7, 0.18);
  }

  /** Liefert die Skalierung einer Feinzelle. */
  fineScale(cell: PixelTransitionCell): number {
    return this.cellScale(cell, 0.42, 0.98, 0.12);
  }

  /** Bündelt Scrollmessungen auf maximal einen Update pro AnimationFrame. */
  private scheduleProgressUpdate(): void {
    if (this.frameId) {
      return;
    }

    this.frameId = requestAnimationFrame(/** Bündelt Scrollmessungen auf maximal einen Update pro AnimationFrame. */() => {
      this.frameId = 0;
      this.updateProgress();
    });
  }

  /** Rechnet die eintretende Parent-Section in einen langen Reveal-Fortschritt um. */
  private updateProgress(): void {

    const section = this.targetSection; // Übergeordneter Abschnitt, dessen Inhalt freigelegt wird.

    if (!section) {
      return;
    }

    const rect = section.getBoundingClientRect();                      // Gemessene Grenzen des aktuellen Elements.
    const viewportHeight = window.innerHeight;                         // Aktuelle Höhe des Browserfensters in Pixeln.
    const start = viewportHeight * 0.98;                               // Startwert der Interpolation.
    const end = viewportHeight * 0.16;                                 // Zielwert der Interpolation.
    const rawProgress = (start - rect.top) / Math.max(1, start - end); // Unbegrenzter Fortschritt vor der Bereichsprüfung.

    this.progress.set(Math.max(0, Math.min(1, rawProgress)));
  }

  /** Liefert eine weich auslaufende inverse Fensterfunktion für globale Layer. */
  private inverseWindow(start: number, end: number): number {

    const normalized = Math.max(0, Math.min(1, (this.progress() - start) / Math.max(0.001, end - start))); // Auf das Zeitfenster normierter Reveal-Fortschritt.
    const smooth = normalized * normalized * (3 - 2 * normalized);                                         // Geglätteter Fortschritt des Pixel-Reveals.

    return 1 - smooth;
  }

  /** Berechnet die Auflösung einer einzelnen Zelle innerhalb eines Zeitfensters. */
  private cellOpacity(cell: PixelTransitionCell, start: number, end: number): number {

    const normalized = (this.progress() - cell.threshold - start) / Math.max(0.001, end - start); // Auf das Zeitfenster normierter Reveal-Fortschritt.
    const clamped = Math.max(0, Math.min(1, normalized));                                         // Auf den gültigen Bereich begrenzter Fortschritt.
    const smooth = clamped * clamped * (3 - 2 * clamped);                                         // Geglätteter Fortschritt des Pixel-Reveals.
    const opacity = 1 - smooth;                                                                   // Deckkraft der aktuellen Rasterzelle.

    return opacity < 0.03 ? 0 : opacity;
  }

  /** Berechnet die Skalierung einer einzelnen Zelle. */
  private cellScale(cell: PixelTransitionCell, start: number, end: number, minScale: number): number {

    const normalized = (this.progress() - cell.threshold - start) / Math.max(0.001, end - start); // Auf das Zeitfenster normierter Reveal-Fortschritt.
    const clamped = Math.max(0, Math.min(1, normalized));                                         // Auf den gültigen Bereich begrenzter Fortschritt.
    const smooth = clamped * clamped * (3 - 2 * clamped);                                         // Geglätteter Fortschritt des Pixel-Reveals.

    return 1 - smooth * (1 - minScale);
  }

  /** Erzeugt deterministische Rasterzellen mit leicht versetzten Schwellenwerten. */
  private createCells(columns: number, rows: number, spread: number, accentModulo: number, offset: number): readonly PixelTransitionCell[] {
    return Array.from({ length: columns * rows }, /** Erzeugt deterministische Rasterzellen mit leicht versetzten Schwellenwerten. */(_, index) => {

      const column = index % columns;                                             // Spalte des aktuellen Blocks.
      const row = Math.floor(index / columns);                                    // Zeile des aktuellen Blocks.
      const noise = ((column * 37 + row * 53 + (column + row) * 17) % 100) / 100; // Deterministischer Störwert für das Pixelraster.

      return {
        threshold: offset + noise * spread,
        accent: (column + row * 2) % accentModulo === 0,
      };
    });
  }
}
