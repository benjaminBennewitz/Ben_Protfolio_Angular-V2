/* src/app/layout/custom-cursor/custom-cursor.component.ts */

/**
 * @file Custom Cursor.
 * @description Reagiert auf Mausbewegung, Klicks und interaktive Elemente.
 */

import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { AccessibilityPreferenceService } from '../../core/services/accessibility-preference.service';

/** Zeichnet einen eigenen Cursor für Desktop-Geräte. */
@Component({
  selector: 'bp-custom-cursor',
  standalone: true,
  templateUrl: './custom-cursor.component.html',
  styleUrl: './custom-cursor.component.scss',
})
export class CustomCursorComponent {
  private readonly accessibility = inject(AccessibilityPreferenceService); // Accessibility-Service für ruhige oder bewegungsreduzierte Modi.
  readonly disabled = computed<boolean>(                                   // Gibt true zurück, wenn der Custom Cursor deaktiviert werden soll.
    /** Gibt true zurück, wenn der Custom Cursor deaktiviert werden soll. */
    () => this.accessibility.usesSimpleMode() || this.accessibility.reducesMotion()
  );

  readonly x = signal<number>(-120);                                       // Aktuelle X-Position des Cursors.
  readonly y = signal<number>(-120);                                       // Aktuelle Y-Position des Cursors.
  readonly interactive = signal<boolean>(false);                           // Markiert Hover über interaktiven Elementen.
  readonly pressed = signal<boolean>(false);                               // Markiert einen aktiven Klick.

  /** Aktualisiert Cursorposition und Hover-Zustand. */
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.disabled()) {
      return;
    }

    const target = event.target instanceof Element ? event.target : null;                                         // Element unter dem Mauszeiger oder null.
    const isInteractive = Boolean(target?.closest('a, button, input, textarea, select, summary, [data-cursor]')); // Zeiger befindet sich über einem bedienbaren Element.

    this.x.set(event.clientX);
    this.y.set(event.clientY);
    this.interactive.set(isInteractive);
  }

  /** Aktiviert den gedrückten Cursor-Zustand. */
  @HostListener('document:mousedown')
  onMouseDown(): void {
    if (this.disabled()) {
      return;
    }

    this.pressed.set(true);
  }

  /** Deaktiviert den gedrückten Cursor-Zustand. */
  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.pressed.set(false);
  }
}
