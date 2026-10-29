/* src/app/pages/not-found-page/not-found-page.component.spec.ts */

import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PORTFOLIO_TRANSLATIONS } from '../../core/data/portfolio-content';
import { LanguageService } from '../../core/services/language.service';
import { AccessibilityPreferenceService } from '../../core/services/accessibility-preference.service';
import { SeoService } from '../../core/services/seo.service';
import { NotFoundPageComponent } from './not-found-page.component';

/** Prüft Counter-Abschluss, Reduced Motion und Recovery-Link-Auflösung. */
describe('NotFoundPageComponent', /** Gruppiert die Verhaltensprüfungen der Layout-Komponente. */() => {

  let reduced: boolean; // Simulierter globaler Reduced-Motion-Zustand.

  /** Erstellt die Fehlerseite ohne ihre rein darstellenden Kindkomponenten. */
  function createPage() {

    const fixture = TestBed.createComponent(NotFoundPageComponent); // Gerenderte Angular-Testkomponente mit realem Template.

    fixture.detectChanges();
    return fixture;
  }

  beforeEach(/** Bereitet isolierte Komponenten-, Browser- und Service-Zustände vor. */() => {
    reduced = false;
    vi.useFakeTimers();
    vi.spyOn(window, 'scrollTo').mockImplementation(/** Stellt die für diesen Test vorgegebene Browser-Reaktion bereit. */() => undefined);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: LanguageService, useValue: { content: /** Liefert den deutschen Portfolio-Inhalt ohne Persistenz. */ () => PORTFOLIO_TRANSLATIONS.de } },
        { provide: AccessibilityPreferenceService, useValue: { reducesMotion: /** Stellt die für diesen Test vorgegebene Browser-Reaktion bereit. */ () => reduced } },
        { provide: SeoService, useValue: { setNotFoundSeo: vi.fn() } },
      ]
    });
    TestBed.overrideComponent(NotFoundPageComponent, { set: { template: '', imports: [] } });
  });
  afterEach(/** Entfernt Testkomponenten, Browser-Stubs und ausstehende Timer. */() => { TestBed.resetTestingModule(); vi.clearAllTimers(); vi.useRealTimers(); vi.restoreAllMocks(); });

  it('erreicht den Status 404 und räumt sämtliche geplanten Frames auf', /** Erreicht den Status 404 und räumt sämtliche geplanten Frames auf. */() => {

    const fixture = createPage(); // Gerenderte Angular-Testkomponente mit realem Template.

    expect(fixture.componentInstance.counterLabel()).toBe('000');
    vi.advanceTimersByTime(2400);
    expect(fixture.componentInstance.counterLabel()).toBe('404');
    fixture.destroy();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('zeigt bei reduzierter Bewegung sofort 404 und trennt Recovery-Pfad und Fragment', /** Zeigt bei reduzierter Bewegung sofort 404 und trennt Recovery-Pfad und Fragment. */() => {
    reduced = true;

    const fixture = createPage();           // Gerenderte Angular-Testkomponente mit realem Template.
    const page = fixture.componentInstance; // Zu prüfende Seitenkomponente.

    expect(page.counterLabel()).toBe('404');
    expect(page.routePath('/#contact')).toBe('/');
    expect(page.routeFragment('/#contact')).toBe('contact');
    expect(page.routeFragment('/portfolio')).toBeUndefined();
    expect(page.isRouteLink('https://example.org')).toBe(false);
    expect(page.requestedPath()).toBe(TestBed.inject(Router).url);
  });
});
