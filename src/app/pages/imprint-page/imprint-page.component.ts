/* src/app/pages/imprint-page/imprint-page.component.ts */

/**
 * @file Impressumsseite des Portfolios.
 * @description Rendert Anbieterkennzeichnung und rechtliche Pflichtangaben aus den übersetzten Portfolio-Inhalten.
 */

import { Component, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { SeoService } from '../../core/services/seo.service';

/** Statische Impressumsseite mit übersetzbaren Pflichtangaben. */
@Component({
  selector: 'bp-imprint-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './imprint-page.component.html',
  styleUrl: './imprint-page.component.scss',
})
export class ImprintPageComponent {
  /** Sprachservice für Impressumsinhalte. */
  private readonly languageService = inject(LanguageService);

  /** SEO-Service für Meta-Daten der Impressumsroute. */
  private readonly seoService = inject(SeoService);

  /** Übersetzter Impressumsinhalt der aktuellen Sprache. */
  readonly imprint = computed(() => this.languageService.content().imprint);

  /** Synchronisiert Meta-Daten mit der aktiven Sprache. */
  constructor() {
    effect(() => this.seoService.setPageSeo(this.imprint().metaTitle, this.imprint().metaDescription, '/impressum'));
  }
}
