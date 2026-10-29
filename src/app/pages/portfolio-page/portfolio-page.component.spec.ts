/* src/app/pages/portfolio-page/portfolio-page.component.spec.ts */

import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PORTFOLIO_TRANSLATIONS } from '../../core/data/portfolio-content';
import { DESIGN_STUDIES } from '../../core/data/design-studies';
import { LanguageService } from '../../core/services/language.service';
import { AchievementService } from '../../core/services/achievement.service';
import { SeoService } from '../../core/services/seo.service';
import { PortfolioPageComponent } from './portfolio-page.component';

/** Prüft den interaktiven Kartenindex und wiederholbare Portfolio-Aktionen. */
describe('PortfolioPageComponent', /** Gruppiert die Verhaltensprüfungen der Layout-Komponente. */() => {

  let page: PortfolioPageComponent; // Zu prüfende Seitenkomponente.

  beforeEach(/** Bereitet isolierte Komponenten-, Browser- und Service-Zustände vor. */() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: LanguageService, useValue: { content: /** Liefert den deutschen Portfolio-Inhalt ohne Persistenz. */ () => PORTFOLIO_TRANSLATIONS.de, language: /** Liefert die deutsche Testsprache. */ () => 'de' } },
        { provide: AchievementService, useValue: { unlock: vi.fn() } },
        { provide: SeoService, useValue: { setPageSeo: vi.fn() } },
      ]
    });
    TestBed.overrideComponent(PortfolioPageComponent, { set: { template: '', imports: [] } });

    const fixture = TestBed.createComponent(PortfolioPageComponent); // Gerenderte Testinstanz mit isolierter Seitenansicht.

    page = fixture.componentInstance;
    fixture.detectChanges();
  });
  afterEach(/** Entfernt Testkomponenten, Browser-Stubs und ausstehende Timer. */() => { TestBed.resetTestingModule(); });

  it('begrenzt Kartenfortschritte und aktiviert jeweils nur die oberste eingeflogene Karte', /** Begrenzt Kartenfortschritte und aktiviert jeweils nur die oberste eingeflogene Karte. */() => {
    expect(page.designStudies).toBe(DESIGN_STUDIES);
    expect(page.activeDesignStudyIndex()).toBe(0);
    page.designStudiesProgress.set(1);
    expect(page.activeDesignStudyIndex()).toBe(DESIGN_STUDIES.length - 1);
    expect(page.designStudyCardProgress(0)).toBe(1);
    expect(page.designStudyCardProgress(DESIGN_STUDIES.length - 1)).toBe(1);
    expect(page.isDesignStudyCardInteractive(0)).toBe(false);
    expect(page.isDesignStudyCardInteractive(DESIGN_STUDIES.length - 1)).toBe(true);
  });

  it('setzt den Schoko-Zustand nur einmal und schließt das dekorative Terminal', /** Setzt den Schoko-Zustand nur einmal und schließt das dekorative Terminal. */() => {
    page.showPortfolioChocolateEaten();
    page.showPortfolioChocolateEaten();
    expect(page.isPortfolioChocolateEaten()).toBe(true);
    expect(TestBed.inject(AchievementService).unlock).toHaveBeenCalledExactlyOnceWith('sugar-covered');
    page.closeProjectsDialog();
    expect(page.isProjectsDialogVisible()).toBe(false);
  });
});
