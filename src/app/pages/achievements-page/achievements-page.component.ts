/* src/app/pages/achievements-page/achievements-page.component.ts */

/**
 * @file Versteckte Achievement-Seite.
 * @description Rendert lokale Trophäen, Hinweise und Fortschritt aus dem Achievement-Service.
 */

import { Component, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AchievementService } from '../../core/services/achievement.service';
import type { AchievementId, AchievementView } from '../../core/models/achievement.models';
import { LanguageService } from '../../core/services/language.service';
import { SeoService } from '../../core/services/seo.service';
import { PAGE_TEXTS } from '../../core/data/achievement-page-data';
import type { AchievementPageTexts } from '../../core/models/page-content.models';

/** Geheime lokale Trophäenübersicht. */
@Component({
  selector: 'bp-achievements-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './achievements-page.component.html',
  styleUrl: './achievements-page.component.scss',
})
export class AchievementsPageComponent {
  readonly achievementsService = inject(AchievementService);  // Achievement-Service mit lokalem Fortschritt.
  private readonly languageService = inject(LanguageService); // Sprachservice für Seitentexte.
  private readonly seoService = inject(SeoService);           // SEO-Service für die geheime Route.
  readonly texts = computed<AchievementPageTexts>(            // Übersetzte Seitentexte.
    /** Übersetzte Seitentexte. */
    () => PAGE_TEXTS[this.languageService.language()]
  );

  readonly progressText = computed<string>(                   // Fortschrittstext der freigeschalteten Trophäen.
    /** Fortschrittstext der freigeschalteten Trophäen. */
    () => `${this.achievementsService.unlockedCount()} / ${this.achievementsService.totalCount()}`
  );

  readonly groups = computed(                                 // Eigenständige Fortschritte für Hauptspiel und optionale Designstudien.
    /** Eigenständige Fortschritte für Hauptspiel und optionale Designstudien. */
    () => [ // Eigenständige Fortschritte für Hauptspiel und optionale Designstudien.
      { id: 'base', title: this.languageService.language() === 'de' ? 'Portfolio · Hauptspiel' : 'Portfolio · Base Game', description: this.languageService.language() === 'de' ? 'Diese Trophäen zählen für Platin.' : 'These trophies count towards platinum.', items: this.achievementsService.achievements().filter(/** Prüft, ob der Eintrag die Auswahlbedingung erfüllt. */ item => !item.dlc) },
      { id: 'dlc', title: 'Design Studies · DLC', description: this.languageService.language() === 'de' ? 'Neun zusätzliche Trophäen aus sechs Designstudien. Zählen zum Gesamtfortschritt, nicht für Platin.' : 'Nine extra trophies across six design studies. Count towards total progress, not platinum.', items: this.achievementsService.achievements().filter(/** Prüft, ob der Eintrag die Auswahlbedingung erfüllt. */ item => item.dlc) },
    ].map(/** Überträgt den Eintrag in die benötigte Seiten- oder Fensterdarstellung. */ group => ({ ...group, unlocked: group.items.filter(/** Prüft, ob der Eintrag die Auswahlbedingung erfüllt. */ item => item.unlocked).length }))
  );

  /** Synchronisiert Meta-Daten mit der aktiven Sprache. */
  constructor() {
    effect(/** Synchronisiert Meta-Daten und abhängige Seitenzustände. */() => this.seoService.setPageSeo(this.texts().metaTitle, this.texts().metaDescription, '/achievements'));
  }

  /** Öffnet besondere Aktionen für freigeschaltete Achievement-Karten. */
  openAchievement(achievement: AchievementView): void {
    if (achievement.id !== 'platinum-complete' || !achievement.unlocked) {
      return;
    }

    this.achievementsService.showPlatinumModal();
  }

  /** Gibt zurück, ob eine Achievement-Karte direkt interaktiv ist. */
  achievementIsInteractive(achievement: AchievementView): boolean {
    return achievement.id === 'platinum-complete' && achievement.unlocked;
  }

  /** Blendet einen Hinweis für eine gesperrte Trophäe ein. */
  revealHint(id: AchievementId): void {
    this.achievementsService.revealHint(id);
  }
}
