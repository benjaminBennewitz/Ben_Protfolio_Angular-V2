/* src/app/shared/tech-marquee/tech-marquee.component.ts */

/**
 * @file Infinity Tech Stack Bar.
 * @description Rendert eine endlos laufende Skill-Leiste mit manueller Drag-Bedienung für reduzierte Bewegung.
 */

import { Component, Input, signal } from '@angular/core';

/** Horizontale Endlos-Leiste für Technologien. */
@Component({
  selector: 'bp-tech-marquee',
  standalone: true,
  templateUrl: './tech-marquee.component.html',
  styleUrl: './tech-marquee.component.scss',
})
export class TechMarqueeComponent {
  /** Liste der darzustellenden Technologien. */
  @Input({ required: true }) items: readonly string[] = [];

  /** Aktiver Drag-Zustand für Cursor und manuelles horizontales Scrollen. */
  readonly isDragging = signal<boolean>(false);

  /** X-Startposition der aktuellen Drag-Geste. */
  private dragStartX = 0;

  /** ScrollLeft-Wert beim Start der aktuellen Drag-Geste. */
  private dragStartScrollLeft = 0;

  /**
   * Startet manuelles horizontales Scrollen per Pointer-Drag.
   * @param event Pointer-Ereignis auf der Marquee-Fläche.
   */
  startDrag(event: PointerEvent): void {
    const target = event.currentTarget;

    if (!(target instanceof HTMLElement) || target.scrollWidth <= target.clientWidth) {
      return;
    }

    this.isDragging.set(true);
    this.dragStartX = event.clientX;
    this.dragStartScrollLeft = target.scrollLeft;
    target.setPointerCapture(event.pointerId);
  }

  /**
   * Verschiebt die Leiste während einer aktiven Drag-Geste.
   * @param event Pointer-Ereignis auf der Marquee-Fläche.
   */
  drag(event: PointerEvent): void {
    const target = event.currentTarget;

    if (!this.isDragging() || !(target instanceof HTMLElement)) {
      return;
    }

    const dragDistanceX = event.clientX - this.dragStartX;
    target.scrollLeft = this.dragStartScrollLeft - dragDistanceX;
    event.preventDefault();
  }

  /**
   * Beendet die aktive Drag-Geste und gibt den Pointer wieder frei.
   * @param event Pointer-Ereignis auf der Marquee-Fläche.
   */
  finishDrag(event: PointerEvent): void {
    const target = event.currentTarget;

    if (!this.isDragging()) {
      return;
    }

    if (target instanceof HTMLElement && target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }

    this.isDragging.set(false);
  }
}
