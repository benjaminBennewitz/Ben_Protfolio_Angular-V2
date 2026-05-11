/* src/app/shared/tech-marquee/tech-marquee.component.ts */

/**
 * @file Infinity Tech Stack Bar.
 * @description Rendert eine endlos laufende, performante Skill-Leiste per CSS-Animation.
 */

import { Component, Input } from '@angular/core';

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

  /** Doppelt die Liste, damit die Schleife optisch nahtlos wirkt. */
  get loopItems(): readonly string[] {
    return [...this.items, ...this.items];
  }
}
