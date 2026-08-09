/* src/app/pages/services-page/services-page.component.ts */

/**
 * @file Eigenständige Leistungs- und Preisseite.
 * @description Trennt die konkrete Angebotslogik bewusst von der Portfolio-Story der Startseite.
 */

import { Component, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { SeoService } from '../../core/services/seo.service';
import { RevealOnScrollDirective } from '../../shared/reveal-on-scroll.directive';
import { RevealTextComponent } from '../../shared/reveal-text/reveal-text.component';
import { ViewportActivityDirective } from '../../shared/viewport-activity.directive';

/** Leistungsseite mit drei Lösungsstufen und optionalen Maintenance-Modellen. */
@Component({
  selector: 'bp-services-page',
  standalone: true,
  imports: [RouterLink, RevealTextComponent, RevealOnScrollDirective, ViewportActivityDirective],
  templateUrl: './services-page.component.html',
  styleUrl: './services-page.component.scss',
})
export class ServicesPageComponent {
  /** Sprachservice für alle sichtbaren Inhalte. */
  private readonly languageService = inject(LanguageService);

  /** SEO-Service für routen- und sprachabhängige Meta-Daten. */
  private readonly seoService = inject(SeoService);

  /** Vollständiger Leistungsinhalt der aktiven Sprache. */
  readonly content = computed(() => this.languageService.content().pricing);

  /** Übersetztes Label für den Rücklink zur Startseite. */
  readonly backLabel = computed(() => this.languageService.language() === 'de' ? 'Zurück zur Experience' : 'Back to the experience');

  /** Synchronisiert die Leistungsroute mit den Meta-Daten der aktuellen Sprache. */
  constructor() {
    effect(() => this.seoService.setPageSeo(this.content().metaTitle, this.content().metaDescription, '/leistungen'));
  }
}
