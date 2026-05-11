/* src/app/shared/reveal-on-scroll.directive.ts */

/**
 * @file Scroll-Reveal-Direktive.
 * @description Aktiviert ein sichtbares CSS-State, sobald ein Element in den Viewport kommt.
 */

import { AfterViewInit, Directive, ElementRef, OnDestroy, inject } from '@angular/core';

/** Fügt Elementen eine wiederverwendbare Reveal-Animation beim Scrollen hinzu. */
@Directive({
  selector: '[bpReveal]',
  standalone: true,
})
export class RevealOnScrollDirective implements AfterViewInit, OnDestroy {
  /** Referenz auf das hostende DOM-Element. */
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** IntersectionObserver für performantes Scroll-Reveal. */
  private observer?: IntersectionObserver;

  /** Initialisiert den Observer und setzt den Ausgangszustand. */
  ngAfterViewInit(): void {
    const element = this.elementRef.nativeElement;

    element.classList.add('bp-reveal');

    if (!('IntersectionObserver' in window)) {
      element.classList.add('bp-reveal--visible');
      return;
    }

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        element.classList.add('bp-reveal--visible');
        this.observer?.disconnect();
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.18 },
    );

    this.observer.observe(element);
  }

  /** Räumt den Observer beim Entfernen des Elements auf. */
  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
