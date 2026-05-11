/* src/app/layout/scroll-to-top/scroll-to-top.component.ts */

/**
 * @file Scroll-to-top Button.
 * @description Blendet einen festen Button ein, sobald der User weiter unten auf der Seite ist.
 */

import { Component, HostListener, signal } from '@angular/core';

/** Globaler Scroll-to-top Button für lange Portfolio-Seiten. */
@Component({
  selector: 'bp-scroll-to-top',
  standalone: true,
  templateUrl: './scroll-to-top.component.html',
  styleUrl: './scroll-to-top.component.scss',
})
export class ScrollToTopComponent {
  /** Markiert, ob der Button sichtbar sein soll. */
  readonly visible = signal<boolean>(false);

  /** Aktualisiert die Sichtbarkeit abhängig von der aktuellen Scrollposition. */
  @HostListener('window:scroll')
  onScroll(): void {
    this.visible.set(window.scrollY > 640);
  }

  /** Scrollt zurück an den Seitenanfang. */
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
