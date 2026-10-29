/* src/app/layout/app-runtime/app-runtime.component.ts */

/**
 * @file Verzögerte globale Runtime der Portfolio-Experience.
 * @description Aktiviert erst nach dem Loader die umfangreichen Globalstyles, Tab-Titel-Synchronisierung und Loader-Trophäe.
 */

import { Component, ViewEncapsulation, effect, inject, input } from '@angular/core';
import { AchievementService } from '../../core/services/achievement.service';
import { LanguageService } from '../../core/services/language.service';
import { TabTitleService } from '../../core/services/tab-title.service';

/** Unsichtbarer Runtime-Host für nicht kritische globale Funktionen und Styles. */
@Component({
  selector: 'bp-app-runtime',
  standalone: true,
  template: '',
  styleUrl: './app-runtime.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AppRuntimeComponent {
  private readonly achievementService = inject(AchievementService); // Achievement-Service wird erst mit der Experience geladen.
  private readonly languageService = inject(LanguageService);       // Sprachservice wird bewusst aus dem initialen Loader-Bundle herausgehalten.
  private readonly tabTitleService = inject(TabTitleService);       // Service für den spielerischen Titel eines inaktiven Browser-Tabs.
  readonly loaderHumanConfirmed = input(false);                     // Kennzeichnet einen manuellen Einstieg über den Loader-Button.

  /** Initialisiert nicht kritische globale Reaktionen erst nach der Loader-Freigabe. */
  constructor() {
    effect(/** Synchronisiert den Rückkehrtitel mit der aktiven Sprache. */() => {
      this.tabTitleService.setHiddenTitle(this.languageService.content().meta.hiddenTitle);
    });

    effect(/** Vergibt die Loader-Trophäe nach einer manuellen Startbestätigung. */() => {
      if (this.loaderHumanConfirmed()) {
        this.achievementService.unlock('loader-human');
      }
    });
  }
}
