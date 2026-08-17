/* src/app/pages/imprint-page/imprint-page.component.ts */

/**
 * @file Impressumsseite des Portfolios.
 * @description Rendert Anbieterkennzeichnung und rechtliche Pflichtangaben aus den übersetzten Portfolio-Inhalten.
 */

import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { AchievementService } from '../../core/services/achievement.service';
import { SeoService } from '../../core/services/seo.service';
import { SystemDialogComponent } from '../../shared/system-dialog/system-dialog.component';

/** Statische Impressumsseite mit übersetzbaren Pflichtangaben. */
@Component({
  selector: 'bp-imprint-page',
  standalone: true,
  imports: [RouterLink, SystemDialogComponent],
  templateUrl: './imprint-page.component.html',
  styleUrl: './imprint-page.component.scss',
})
export class ImprintPageComponent {
  /** Sprachservice für Impressumsinhalte. */
  private readonly languageService = inject(LanguageService);

  /** SEO-Service für Meta-Daten der Impressumsroute. */
  private readonly seoService = inject(SeoService);

  /** Achievement-Service für geschlossene MS-DOS-Fenster. */
  private readonly achievementService = inject(AchievementService);

  /** Übersetzter Impressumsinhalt der aktuellen Sprache. */
  readonly imprint = computed(() => this.languageService.content().imprint);

  /** Sichtbarkeit des Legal-Check-Dialogfensters. */
  readonly isLegalDialogVisible = signal<boolean>(true);

  /** Synchronisiert Meta-Daten mit der aktiven Sprache. */
  constructor() {
    effect(() => this.seoService.setPageSeo(this.imprint().metaTitle, this.imprint().metaDescription, '/impressum'));
  }

  /** Entfernt das Legal-Check-Dialogfenster aus der Ansicht. */
  closeLegalDialog(): void {
    this.achievementService.unlock('nostalgia-hater');
    this.isLegalDialogVisible.set(false);
  }
}
