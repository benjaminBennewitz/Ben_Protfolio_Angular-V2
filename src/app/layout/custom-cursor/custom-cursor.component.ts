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
  /** Accessibility-Service für ruhige oder bewegungsreduzierte Modi. */
  private readonly accessibility = inject(AccessibilityPreferenceService);

  /** Gibt true zurück, wenn der Custom Cursor deaktiviert werden soll. */
  readonly disabled = computed<boolean>(() => this.accessibility.usesSimpleMode() || this.accessibility.reducesMotion());

  /** Aktuelle X-Position des Cursors. */
  readonly x = signal<number>(-120);

  /** Aktuelle Y-Position des Cursors. */
  readonly y = signal<number>(-120);

  /** Markiert Hover über interaktiven Elementen. */
  readonly interactive = signal<boolean>(false);

  /** Markiert einen aktiven Klick. */
  readonly pressed = signal<boolean>(false);

  /** Aktualisiert Cursorposition und Hover-Zustand. */
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.disabled()) {
      return;
    }

    const target = event.target instanceof Element ? event.target : null;
    const isInteractive = Boolean(target?.closest('a, button, input, textarea, select, summary, [data-cursor]'));

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
