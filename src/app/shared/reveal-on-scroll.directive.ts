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
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef); // Host-Element und gemeinsame Reveal-Steuerung.
  private readonly reveals = inject(RevealObserverService);                  // Gemeinsamer Service für einmalige Inhaltsfreigaben.
  private stopObserving?: () => void;                                        // Abmeldung beim Entfernen der Direktive.

  /** Registriert das Element nach dem Aufbau seiner View. */
  ngAfterViewInit(): void {

    const element = this.elementRef.nativeElement; // Gerendertes Element der aktuellen Interaktion.

    element.classList.add('bp-reveal');
    this.stopObserving = this.reveals.observe(element, /** Registriert das Element nach dem Aufbau seiner View. */(instant) => {
      element.classList.toggle('bp-reveal--instant', instant);
      element.classList.add('bp-reveal--visible');
    });
  }

  /** Entfernt ein noch nicht ausgelöstes Ziel aus dem gemeinsamen Observer. */
  ngOnDestroy(): void {
    this.stopObserving?.();
  }
}
