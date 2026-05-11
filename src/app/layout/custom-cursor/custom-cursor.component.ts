/* src/app/layout/custom-cursor/custom-cursor.component.ts */

/**
 * @file Custom Cursor.
 * @description Reagiert auf Mausbewegung, Klicks und interaktive Elemente.
 */

import { Component, HostListener, signal } from '@angular/core';

/** Zeichnet einen eigenen Cursor für Desktop-Geräte. */
@Component({
  selector: 'bp-custom-cursor',
  standalone: true,
  templateUrl: './custom-cursor.component.html',
  styleUrl: './custom-cursor.component.scss',
})
export class CustomCursorComponent {
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
    const target = event.target instanceof Element ? event.target : null;
    const isInteractive = Boolean(target?.closest('a, button, input, textarea, select, summary, [data-cursor]'));

    this.x.set(event.clientX);
    this.y.set(event.clientY);
    this.interactive.set(isInteractive);
  }

  /** Aktiviert den gedrückten Cursor-Zustand. */
  @HostListener('document:mousedown')
  onMouseDown(): void {
    this.pressed.set(true);
  }

  /** Deaktiviert den gedrückten Cursor-Zustand. */
  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.pressed.set(false);
  }
}
