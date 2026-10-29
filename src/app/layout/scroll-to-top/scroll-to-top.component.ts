/* src/app/layout/scroll-to-top/scroll-to-top.component.ts */

/**
 * @file Scroll-to-top Button.
 * @description Blendet einen festen Button ein, sobald der User weiter unten auf der Seite ist.
 */

import { Component, HostListener, inject, signal } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';
import { SystemToastService } from '../../core/services/system-toast.service';

/** Globaler Scroll-to-top Button für lange Portfolio-Seiten. */
@Component({
  selector: 'bp-scroll-to-top',
  standalone: true,
  templateUrl: './scroll-to-top.component.html',
  styleUrl: './scroll-to-top.component.scss',
})
export class ScrollToTopComponent {
  private readonly languageService = inject(LanguageService); // Sprachservice für übersetzte Scroll-Hinweise.
  private readonly toastService = inject(SystemToastService); // Toast-Service für kurze Systemmeldungen.
  readonly visible = signal<boolean>(false);                  // Markiert, ob der Button sichtbar sein soll.

  /** Aktualisiert die Sichtbarkeit abhängig von der aktuellen Scrollposition. */
  @HostListener('window:scroll')
  onScroll(): void {
    this.visible.set(window.scrollY > 640);
  }

  /** Scrollt zurück an den Seitenanfang. */
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.toastService.show(this.languageService.language() === 'de'
      ? { icon: 'keyboard_double_arrow_up', title: 'returning to origin', message: 'Zurück zum Startpunkt.', tone: 'system' }
      : { icon: 'keyboard_double_arrow_up', title: 'returning to origin', message: 'Back to the origin point.', tone: 'system' });
  }
}
