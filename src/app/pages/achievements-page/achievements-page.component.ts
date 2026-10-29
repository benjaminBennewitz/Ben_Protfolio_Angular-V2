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

/** Übersetzte Seitentexte der Achievement-Seite. */
interface AchievementPageTexts {
  /** Meta-Titel der Route. */
  readonly metaTitle: string;
  /** Meta-Description der Route. */
  readonly metaDescription: string;
  /** Link zurück zur Startseite. */
  readonly backLabel: string;
  /** Kleine technische Beschriftung. */
  readonly eyebrow: string;
  /** Haupttitel. */
  readonly title: string;
  /** Introtext. */
  readonly intro: string;
  /** Fortschrittslabel. */
  readonly progressLabel: string;
  /** Label für gesperrte Trophäen. */
  readonly lockedTitle: string;
  /** Button zum Einblenden von Hinweisen. */
  readonly hintButton: string;
  /** Button zum Zurücksetzen. */
  readonly resetButton: string;
}

/** Geheime lokale Trophäenübersicht. */
@Component({
  selector: 'bp-achievements-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './achievements-page.component.html',
  styleUrl: './achievements-page.component.scss',
})
export class AchievementsPageComponent {
  /** Achievement-Service mit lokalem Fortschritt. */
  readonly achievementsService = inject(AchievementService);

  /** Sprachservice für Seitentexte. */
  private readonly languageService = inject(LanguageService);

  /** SEO-Service für die geheime Route. */
  private readonly seoService = inject(SeoService);

  /** Übersetzte Seitentexte. */
  readonly texts = computed<AchievementPageTexts>(() => PAGE_TEXTS[this.languageService.language()]);

  /** Fortschrittstext der freigeschalteten Trophäen. */
  readonly progressText = computed<string>(() => `${this.achievementsService.unlockedCount()} / ${this.achievementsService.totalCount()}`);

  /** Eigenständige Fortschritte für Hauptspiel und optionale Designstudien. */
  readonly groups = computed(() => [
    { id: 'base', title: this.languageService.language() === 'de' ? 'Portfolio · Hauptspiel' : 'Portfolio · Base Game', description: this.languageService.language() === 'de' ? 'Diese Trophäen zählen für Platin.' : 'These trophies count towards platinum.', items: this.achievementsService.achievements().filter(item => !item.dlc) },
    { id: 'dlc', title: 'Design Studies · DLC', description: this.languageService.language() === 'de' ? 'Neun zusätzliche Trophäen aus sechs Designstudien. Zählen zum Gesamtfortschritt, nicht für Platin.' : 'Nine extra trophies across six design studies. Count towards total progress, not platinum.', items: this.achievementsService.achievements().filter(item => item.dlc) },
  ].map(group => ({ ...group, unlocked: group.items.filter(item => item.unlocked).length })));

  /** Synchronisiert Meta-Daten mit der aktiven Sprache. */
  constructor() {
    effect(() => this.seoService.setPageSeo(this.texts().metaTitle, this.texts().metaDescription, '/achievements'));
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

/** Übersetzungen der geheimen Achievement-Seite. */
const PAGE_TEXTS: Record<'de' | 'en', AchievementPageTexts> = {
  de: {
    metaTitle: 'Achievements | Benjamin Bennewitz Portfolio',
    metaDescription: 'Versteckte Trophäen und lokale Fortschritte der interaktiven Portfolio-Experience.',
    backLabel: 'Zurück zur Experience',
    eyebrow: 'secret_room.exe',
    title: 'Achievements',
    intro: 'Kleine Trophäen für versteckte Interaktionen, Mini-Games und bewusst unnötige Portfolio-Momente. Der Fortschritt bleibt lokal in deinem Browser.',
    progressLabel: 'Gesamt · inkl. DLC',
    lockedTitle: '???',
    hintButton: 'Hinweis anzeigen',
    resetButton: 'Fortschritt zurücksetzen',
  },
  en: {
    metaTitle: 'Achievements | Benjamin Bennewitz Portfolio',
    metaDescription: 'Hidden trophies and local progress for the interactive portfolio experience.',
    backLabel: 'Back to the experience',
    eyebrow: 'secret_room.exe',
    title: 'Achievements',
    intro: 'Tiny trophies for hidden interactions, mini-games and intentionally unnecessary portfolio moments. Progress stays local in your browser.',
    progressLabel: 'Total · incl. DLC',
    lockedTitle: '???',
    hintButton: 'Show hint',
    resetButton: 'Reset progress',
  },
};
