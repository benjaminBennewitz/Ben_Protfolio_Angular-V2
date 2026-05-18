/* src/app/shared/built-without/built-without.component.ts */

/**
 * @file Schmale Qualitäts-Section.
 * @description Zeigt bewusste technische Entscheidungen und ergänzende gefragte Fähigkeiten.
 */

import { Component, computed, inject } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';
import { RevealOnScrollDirective } from '../reveal-on-scroll.directive';
import { ViewportActivityDirective } from '../viewport-activity.directive';

/** Kompakte Section für Built-without- und Capability-Aussagen. */
@Component({
  selector: 'bp-built-without',
  standalone: true,
  imports: [RevealOnScrollDirective, ViewportActivityDirective],
  templateUrl: './built-without.component.html',
  styleUrl: './built-without.component.scss',
})
export class BuiltWithoutComponent {
  /** Sprachservice für übersetzte Section-Inhalte. */
  private readonly languageService = inject(LanguageService);

  /** Übersetzter Section-Inhalt. */
  readonly content = computed(() => this.languageService.content().builtWithout);
}
