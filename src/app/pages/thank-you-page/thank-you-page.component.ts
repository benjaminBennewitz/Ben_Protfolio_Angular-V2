/* src/app/pages/thank-you-page/thank-you-page.component.ts */

/**
 * @file Dankeseite des Kontaktformulars.
 * @description Zeigt nach erfolgreichem Server-Versand eine bestätigende Rückmeldung mit Backlink an.
 */

import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { AchievementService } from '../../core/services/achievement.service';
import { SeoService } from '../../core/services/seo.service';

/** Dankeseite nach erfolgreichem Kontaktformular-Submit. */
@Component({
  selector: 'bp-thank-you-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './thank-you-page.component.html',
  styleUrl: './thank-you-page.component.scss',
})
export class ThankYouPageComponent {
  /** Sprachservice für übersetzte Dankeseiten-Inhalte. */
  private readonly languageService = inject(LanguageService);

  /** SEO-Service für noindex-Meta-Daten der Dankeseite. */
  private readonly seoService = inject(SeoService);

  /** Achievement-Service für geschlossene MS-DOS-Fenster. */
  private readonly achievementService = inject(AchievementService);

  /** Übersetzter Inhalt der Dankeseite. */
  readonly content = computed(() => this.languageService.content().thankYou);

  /** Sichtbarkeit des kleinen Statusfensters. */
  readonly isDialogVisible = signal<boolean>(true);

  /** Synchronisiert noindex-Meta-Daten mit der aktiven Sprache. */
  constructor() {
    effect(() => this.seoService.setNoIndexPageSeo(this.content().metaTitle, this.content().metaDescription, '/danke'));
  }

  /** Schließt das dekorative Statusfenster. */
  closeDialog(): void {
    this.achievementService.unlock('nostalgia-hater');
    this.isDialogVisible.set(false);
  }
}
