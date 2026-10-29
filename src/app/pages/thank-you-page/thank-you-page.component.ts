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
import { SystemDialogComponent } from '../../shared/system-dialog/system-dialog.component';

/** Dankeseite nach erfolgreichem Kontaktformular-Submit. */
@Component({
  selector: 'bp-thank-you-page',
  standalone: true,
  imports: [RouterLink, SystemDialogComponent],
  templateUrl: './thank-you-page.component.html',
  styleUrl: './thank-you-page.component.scss',
})
export class ThankYouPageComponent {
  private readonly languageService = inject(LanguageService);       // Sprachservice für übersetzte Dankeseiten-Inhalte.
  private readonly seoService = inject(SeoService);                 // SEO-Service für noindex-Meta-Daten der Dankeseite.
  private readonly achievementService = inject(AchievementService); // Achievement-Service für geschlossene MS-DOS-Fenster.
  readonly content = computed(                                      // Übersetzter Inhalt der Dankeseite.
    /** Übersetzter Inhalt der Dankeseite. */
    () => this.languageService.content().thankYou
  );

  readonly isDialogVisible = signal<boolean>(true);                 // Sichtbarkeit des kleinen Statusfensters.

  /** Synchronisiert noindex-Meta-Daten mit der aktiven Sprache. */
  constructor() {
    effect(/** Synchronisiert Meta-Daten und abhängige Seitenzustände. */() => this.seoService.setNoIndexPageSeo(this.content().metaTitle, this.content().metaDescription, '/danke'));
  }

  /** Schließt das dekorative Statusfenster. */
  closeDialog(): void {
    this.achievementService.unlock('nostalgia-hater');
    this.isDialogVisible.set(false);
  }
}
