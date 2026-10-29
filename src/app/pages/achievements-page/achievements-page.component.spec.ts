/* src/app/pages/achievements-page/achievements-page.component.spec.ts */

import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AchievementService } from '../../core/services/achievement.service';
import { LanguageService } from '../../core/services/language.service';
import { SeoService } from '../../core/services/seo.service';
import type { AchievementView } from '../../core/models/achievement.models';
import { AchievementsPageComponent } from './achievements-page.component';

/** Prüft getrennten DLC-Fortschritt und die Freigabe der Platin-Aktion. */
describe('AchievementsPageComponent', /** Gruppiert die Verhaltensprüfungen der Layout-Komponente. */ () => {

  let page: AchievementsPageComponent; // Zu prüfende Seitenkomponente.
  const items = [                      // Trophäen-Fixtures mit getrenntem Hauptspiel- und DLC-Fortschritt.
    { id: 'loader-human', unlocked: true },
    { id: 'platinum-complete', unlocked: false },
    { id: 'study-growth', dlc: true, unlocked: true },
  ] as AchievementView[];

  beforeEach(/** Bereitet isolierte Komponenten-, Browser- und Service-Zustände vor. */ () => {
    TestBed.configureTestingModule({ providers: [
      { provide: LanguageService, useValue: { language: /** Liefert die deutsche Testsprache. */ () => 'de' } },
      { provide: SeoService, useValue: { setPageSeo: vi.fn() } },
      { provide: AchievementService, useValue: { achievements: /** Stellt die für diesen Test vorgegebene Browser-Reaktion bereit. */ () => items, unlockedCount: /** Stellt die für diesen Test vorgegebene Browser-Reaktion bereit. */ () => 2, totalCount: /** Stellt die für diesen Test vorgegebene Browser-Reaktion bereit. */ () => 3, showPlatinumModal: vi.fn(), revealHint: vi.fn() } },
    ] });
    TestBed.overrideComponent(AchievementsPageComponent, { set: { template: '', imports: [] } });

    const fixture = TestBed.createComponent(AchievementsPageComponent); // Gerenderte Testinstanz mit isolierter Seitenansicht.

    page = fixture.componentInstance;
    fixture.detectChanges();
  });
  afterEach(/** Entfernt Testkomponenten, Browser-Stubs und ausstehende Timer. */ () => { TestBed.resetTestingModule(); });

  it('zählt Hauptspiel und DLC unabhängig bei erhaltenem Gesamtfortschritt', /** Zählt Hauptspiel und DLC unabhängig bei erhaltenem Gesamtfortschritt. */ () => {
    expect(page.groups().map(/** Stellt die für diesen Test vorgegebene Browser-Reaktion bereit. */ group => [group.id, group.items.length, group.unlocked])).toEqual([['base', 2, 1], ['dlc', 1, 1]]);
    expect(page.progressText()).toBe('2 / 3');
  });

  it('öffnet ausschließlich freigeschaltetes Platin und leitet Hinweise an den Service weiter', /** Öffnet ausschließlich freigeschaltetes Platin und leitet Hinweise an den Service weiter. */ () => {
    page.openAchievement(items[0]);
    page.openAchievement(items[1]);
    expect(TestBed.inject(AchievementService).showPlatinumModal).not.toHaveBeenCalled();

    const platinum = { ...items[1], unlocked: true }; // Freigeschaltete Platin-Trophäe für die Aktionsprüfung.

    expect(page.achievementIsInteractive(platinum)).toBe(true);
    page.openAchievement(platinum);
    expect(TestBed.inject(AchievementService).showPlatinumModal).toHaveBeenCalledOnce();
    page.revealHint('loader-human');
    expect(TestBed.inject(AchievementService).revealHint).toHaveBeenCalledWith('loader-human');
  });
});
