/**
 * @file Qualitätsgrundsätze des Portfolios.
 * @description Zeigt technische und gestalterische Prioritäten ohne zusätzliche Scrollstufe oder Diagramme.
 */

import { Component, computed, inject } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';
import { RevealOnScrollDirective } from '../reveal-on-scroll.directive';
import { RevealTextComponent } from '../reveal-text/reveal-text.component';
import { ViewportActivityDirective } from '../viewport-activity.directive';

/** Präsentiert die Qualitätsgrundsätze als lesbare Archivübersicht. */
@Component({
  selector: 'bp-built-without',
  standalone: true,
  imports: [RevealOnScrollDirective, RevealTextComponent, ViewportActivityDirective],
  templateUrl: './built-without.component.html',
  styleUrl: './built-without.component.scss',
})
export class BuiltWithoutComponent {
  private readonly languageService = inject(LanguageService);

  readonly content = computed(() => this.languageService.content().builtWithout);
}
