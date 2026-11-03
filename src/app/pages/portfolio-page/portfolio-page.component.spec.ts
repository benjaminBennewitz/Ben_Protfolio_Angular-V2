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

  it('zeigt drei kuratierte Studien und verweist über stabile Nummern auf das Gesamtarchiv', /** Prüft die unveränderlichen Archivnummern der Portfolio-Vorschau. */() => {
    expect(page.featuredDesignStudies().map(study => study.id)).toEqual(['raw-form', 'ctrl-room', 'phase']);
    expect(page.designStudyNumber('raw-form')).toBe('DS/001');
    expect(page.designStudyNumber('ctrl-room')).toBe('DS/003');
    expect(page.designStudyNumber('phase')).toBe('DS/009');
    expect(DESIGN_STUDIES).toHaveLength(10);
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
