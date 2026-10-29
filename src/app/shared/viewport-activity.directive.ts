/* src/app/shared/viewport-activity.directive.ts */

/**
 * @file Viewport-Aktivitätsdirektive.
 * @description Pausiert CSS-Endlosanimationen in Bereichen, die außerhalb des sichtbaren Viewports liegen.
 */

import { AfterViewInit, Directive, ElementRef, OnDestroy, Renderer2, inject } from '@angular/core';

/** Beobachtet ein Host-Element und markiert es außerhalb des Viewports als pausiert. */
@Directive({
  selector: '[bpViewportActivity]',
  standalone: true,
})
export class ViewportActivityDirective implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef); // Host-Element, dessen Animationszustand kontrolliert wird.
  private readonly renderer = inject(Renderer2);                       // Renderer für klassenbasierte DOM-Änderungen.
  private observer: IntersectionObserver | null = null;                // Sichtbarkeitsobserver für den Host.

  /** Startet die Sichtbarkeitsmessung nach dem ersten Rendern. */
  ngAfterViewInit(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    this.observer = new IntersectionObserver(
      /** Startet die Sichtbarkeitsmessung nach dem ersten Rendern. */([entry]) => this.setPaused(!entry?.isIntersecting),
      { root: null, threshold: 0, rootMargin: '18% 0px 18% 0px' },
    );

    this.observer.observe(this.host.nativeElement);
  }

  /** Stoppt den Observer und entfernt die Pausenklasse. */
  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.setPaused(false);
  }

  /** Schaltet die globale Pausenklasse für den beobachteten Bereich. */
  private setPaused(paused: boolean): void {
    if (paused) {
      this.renderer.addClass(this.host.nativeElement, 'bp-is-paused');
      return;
    }

    this.renderer.removeClass(this.host.nativeElement, 'bp-is-paused');
  }
}
