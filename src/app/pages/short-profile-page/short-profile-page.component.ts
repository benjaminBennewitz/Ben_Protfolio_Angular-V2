/**
 * @file Kompaktes, sprachabhängiges Kompetenzprofil.
 * @description Verwendet dieselben Erfahrungs- und Kompetenzdaten wie die Startseite.
 */

import { Component, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { SeoService } from '../../core/services/seo.service';

/** Eigenständige, bewusst neutrale Kurzprofilseite. */
@Component({
  selector: 'bp-short-profile-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './short-profile-page.component.html',
  styleUrl: './short-profile-page.component.scss',
})
export class ShortProfilePageComponent {
  private readonly languageService = inject(LanguageService);
  private readonly seoService = inject(SeoService);
  readonly content = computed(() => this.languageService.content());
  readonly profile = computed(() => this.content().shortProfile);

  /** Synchronisiert Meta-Daten mit dem Sprachwechsel. */
  constructor() {
    effect(() => this.seoService.setPageSeo(
      this.profile().metaTitle, this.profile().metaDescription, '/kurzprofil'
    ));
  }
}
