/* src/app/pages/home-page/home-page.component.spec.ts */

import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PORTFOLIO_TRANSLATIONS } from '../../core/data/portfolio-content';
import { LanguageService } from '../../core/services/language.service';
import { AchievementService } from '../../core/services/achievement.service';
import { SeoService } from '../../core/services/seo.service';
import { HomePageComponent } from './home-page.component';

/** Prüft die zustandsabhängigen Easter Eggs und das wiederholte Schoko-Finale. */
describe('HomePageComponent', /** Gruppiert die Verhaltensprüfungen der Layout-Komponente. */() => {

  let page: HomePageComponent; // Zu prüfende Seitenkomponente.

  beforeEach(/** Bereitet isolierte Komponenten-, Browser- und Service-Zustände vor. */ async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: LanguageService, useValue: { content: /** Liefert den deutschen Portfolio-Inhalt ohne Persistenz. */ () => PORTFOLIO_TRANSLATIONS.de } },
        { provide: AchievementService, useValue: { unlock: vi.fn() } },
        { provide: SeoService, useValue: { setHomeSeo: vi.fn() } },
      ]
    });
    TestBed.overrideComponent(HomePageComponent, { set: { template: '', imports: [] } });
    await TestBed.compileComponents();

    const fixture = TestBed.createComponent(HomePageComponent); // Gerenderte Testinstanz mit isolierter Seitenansicht.

    page = fixture.componentInstance;
    fixture.detectChanges();
  });
  afterEach(/** Entfernt Testkomponenten, Browser-Stubs und ausstehende Timer. */() => { TestBed.resetTestingModule(); });

  it('wechselt das Kaffeebild samt Aktionslabel und stellt das Original wieder her', /** Wechselt das Kaffeebild samt Aktionslabel und stellt das Original wieder her. */() => {

    const original = page.currentAboutCoffeeSrc(); // Ursprünglicher Bildpfad vor der Interaktion.
    const label = page.aboutDialogActionLabel();   // Ursprüngliche Aktionsbeschriftung vor dem Bildwechsel.

    page.showAboutCoffeeError();
    expect(page.currentAboutCoffeeSrc()).not.toBe(original);
    expect(page.aboutDialogActionLabel()).not.toBe(label);
    expect(TestBed.inject(AchievementService).unlock).toHaveBeenCalledWith('coffee-glitch');
    page.resetAboutCoffeeImage();
    expect(page.currentAboutCoffeeSrc()).toBe(original);
  });

  it('vergibt das Schoko-Achievement beim mehrfachen Auslösen nur einmal', /** Vergibt das Schoko-Achievement beim mehrfachen Auslösen nur einmal. */() => {
    page.showProjectsChocolateEaten();
    page.showProjectsChocolateEaten();
    expect(page.isProjectsChocolateEaten()).toBe(true);
    expect(TestBed.inject(AchievementService).unlock).toHaveBeenCalledExactlyOnceWith('sugar-covered');
    page.resetProjectsChocolateImage();
    expect(page.isProjectsChocolateEaten()).toBe(false);
  });

  it('schließt das Hero-Fenster und erhält die zugehörige Trophäe', /** Schließt das Hero-Fenster und erhält die zugehörige Trophäe. */() => {
    page.closeHeroDialog();
    expect(page.isHeroDialogVisible()).toBe(false);
    expect(TestBed.inject(AchievementService).unlock).toHaveBeenCalledWith('nostalgia-hater');
  });
});
