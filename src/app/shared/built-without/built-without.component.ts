/**
 * @file Qualitätsgrundsätze des Portfolios.
 * @description Zeigt Qualitätsgrundsätze als animierte, per Tastatur bedienbare Accordions.
 */

import { Component, computed, inject, signal } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';
import { RevealOnScrollDirective } from '../reveal-on-scroll.directive';
import { RevealTextComponent } from '../reveal-text/reveal-text.component';
import { ViewportActivityDirective } from '../viewport-activity.directive';

/** Präsentiert Qualitätsgrundsätze mit jeweils einer geöffneten Erläuterung. */
@Component({
  selector: 'bp-built-without',
  standalone: true,
  imports: [RevealOnScrollDirective, RevealTextComponent, ViewportActivityDirective],
  templateUrl: './built-without.component.html',
  styleUrl: './built-without.component.scss',
})
export class BuiltWithoutComponent {
  private readonly languageService = inject(LanguageService);

  readonly openEntry = signal<string | null>(null); // Kennung der aktuell geöffneten Erläuterung.

  readonly content = computed(() => this.languageService.content().builtWithout);

  /**
   * Öffnet einen Eintrag oder schließt den bereits geöffneten Eintrag.
   * @param entryId Eindeutige Kennung des ausgewählten Qualitätsgrundsatzes.
   */
  toggleEntry(entryId: string): void {
    this.openEntry.update((current) => current === entryId ? null : entryId);
  }
}
