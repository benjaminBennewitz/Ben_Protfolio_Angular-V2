/* src/app/shared/reveal-text/reveal-text.component.ts */

/**
 * @file Wiederverwendbare Text-Reveal-Komponente.
 * @description Teilt Text in Wörter und animiert sie gestaffelt beim Rendern.
 */

import { Component, Input } from '@angular/core';

/** Rendert animierte Headlines mit gestaffelten Wort-Reveals. */
@Component({
  selector: 'bp-reveal-text',
  standalone: true,
  templateUrl: './reveal-text.component.html',
  styleUrl: './reveal-text.component.scss',
})
export class RevealTextComponent {
  /** Optionales Eyebrow-Label über dem Titel. */
  @Input() eyebrow = '';

  /** Zu animierender Titeltext. */
  @Input({ required: true }) text = '';

  /** Überschriftenebene als CSS-Variante. */
  @Input() size: 'hero' | 'section' = 'section';

  /** Liefert die einzelnen Wörter für die Reveal-Animation. */
  get words(): readonly string[] {
    return this.text.split(' ').filter(Boolean);
  }
}
