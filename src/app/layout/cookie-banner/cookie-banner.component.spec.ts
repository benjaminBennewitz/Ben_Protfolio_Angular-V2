/* src/app/layout/cookie-banner/cookie-banner.component.spec.ts */

import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageService } from '../../core/services/language.service';
import { GlobalOverlayService } from '../../core/services/global-overlay.service';
import { SystemToastService } from '../../core/services/system-toast.service';
import { CookieBannerComponent } from './cookie-banner.component';

/** Prüft Privacy-Bestätigung, erneutes Öffnen und nicht verfügbaren Browser-Speicher. */
describe('CookieBannerComponent', /** Gruppiert die Verhaltensprüfungen der Layout-Komponente. */ () => {

  let fixture: ComponentFixture<CookieBannerComponent>; // Gerenderte Angular-Testkomponente mit realem Template.

  /** Erstellt das reale Banner mit isolierten Sprach- und Toast-Abhängigkeiten. */
  function createBanner(): CookieBannerComponent {
    fixture = TestBed.createComponent(CookieBannerComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  beforeEach(/** Bereitet isolierte Komponenten-, Browser- und Service-Zustände vor. */ () => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [
      { provide: LanguageService, useValue: { language: /** Liefert die deutsche Testsprache. */ () => 'de' } },
      { provide: SystemToastService, useValue: { show: vi.fn() } },
    ] });
  });

  afterEach(/** Entfernt Testkomponenten, Browser-Stubs und ausstehende Timer. */ () => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('speichert die Bestätigung per Button und zeigt den Hinweis bei erneuter Erstellung nicht', /** Speichert die Bestätigung per Button und zeigt den Hinweis bei erneuter Erstellung nicht. */ () => {
    createBanner();
    fixture.nativeElement.querySelector('.cookie-banner__submit').click();
    fixture.detectChanges();
    expect(localStorage.getItem('bp-cookie-consent-v1')).toBe('accepted');
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
    fixture.destroy();
    expect(createBanner().visible()).toBe(false);
  });

  it('öffnet bestätigte Hinweise über den globalen Auslöser direkt in der Detailansicht', /** Öffnet bestätigte Hinweise über den globalen Auslöser direkt in der Detailansicht. */ () => {
    localStorage.setItem('bp-cookie-consent-v1', 'accepted');
    createBanner();
    TestBed.inject(GlobalOverlayService).requestPrivacyPanel();
    fixture.detectChanges();
    expect(fixture.componentInstance.detailsOpen()).toBe(true);
    expect(fixture.nativeElement.querySelectorAll('.cookie-banner__control')).toHaveLength(4);
    fixture.nativeElement.querySelector('.cookie-banner__details').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.cookie-banner__chips')).not.toBeNull();
  });

  it('bleibt bei gesperrtem Speicher bedienbar und blendet sich nach Bestätigung aus', /** Bleibt bei gesperrtem Speicher bedienbar und blendet sich nach Bestätigung aus. */ () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(/** Simuliert nicht verfügbaren Browser-Speicher. */ () => { throw new Error('blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(/** Simuliert nicht verfügbaren Browser-Speicher. */ () => { throw new Error('blocked'); });

    const component = createBanner(); // Zu prüfende Komponenteninstanz.

    expect(component.visible()).toBe(true);
    expect(/** Betätigt den Bestätigungsbutton des gerenderten Banners. */ () => fixture.nativeElement.querySelector('.cookie-banner__submit').click()).not.toThrow();
    expect(component.visible()).toBe(false);
  });

  it('meldet globale Öffnen-Ereignisse beim Zerstören ab', /** Meldet globale Öffnen-Ereignisse beim Zerstören ab. */ () => {

    const component = createBanner();                     // Zu prüfende Komponenteninstanz.
    const reopen = vi.spyOn(component, 'reopenBanner');   // Überwacht Öffnungsversuche nach dem Zerstören des Banners.
    const overlay = TestBed.inject(GlobalOverlayService); // Überwacht den globalen Auslöser des Accessibility-Panels.

    fixture.destroy();
    overlay.requestPrivacyPanel();
    expect(reopen).not.toHaveBeenCalled();
  });
});
