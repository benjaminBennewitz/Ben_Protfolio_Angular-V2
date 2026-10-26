/* src/app/shared/reveal-on-scroll.directive.ts */

/**
 * @file Scroll-Reveal-Direktive.
 * @description Verbindet vorhandene CSS-Reveals mit der gemeinsamen Sichtbarkeitserkennung.
 */

import { AfterViewInit, Directive, ElementRef, OnDestroy, inject } from '@angular/core';
import { RevealObserverService } from '../core/services/reveal-observer.service';

/** Aktiviert einen Element-Reveal einmalig, auch wenn sein Bereich überscrollt wurde. */
@Directive({
  selector: '[bpReveal]',
  standalone: true,
})
export class RevealOnScrollDirective implements AfterViewInit, OnDestroy {
  /** Host-Element und gemeinsame Reveal-Steuerung. */
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly reveals = inject(RevealObserverService);
  /** Abmeldung beim Entfernen der Direktive. */
  private stopObserving?: () => void;

  /** Registriert das Element nach dem Aufbau seiner View. */
  ngAfterViewInit(): void {
    const element = this.elementRef.nativeElement;
    element.classList.add('bp-reveal');
    this.stopObserving = this.reveals.observe(element, (instant) => {
      element.classList.toggle('bp-reveal--instant', instant);
      element.classList.add('bp-reveal--visible');
    });
  }

  /** Entfernt ein noch nicht ausgelöstes Ziel aus dem gemeinsamen Observer. */
  ngOnDestroy(): void {
    this.stopObserving?.();
  }
}
