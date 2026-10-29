/* src/app/core/services/language.service.spec.ts */

import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PORTFOLIO_TRANSLATIONS } from '../data/portfolio-content';
import { LanguageService } from './language.service';

/** Prüft gespeicherte Sprachwahl, Übersetzungen und Dokument-Synchronisierung. */
describe('LanguageService', /** Gruppiert die Verhaltensprüfungen des Services. */() => {
  beforeEach(/** Bereitet isolierte Browser- und Testzustände vor. */() => { localStorage.clear(); });
  afterEach(/** Entfernt Testzustände, Timer und ersetzte Browser-APIs. */() => { TestBed.resetTestingModule(); localStorage.clear(); document.documentElement.lang = ''; });

  it('verwendet bei einem ungültigen Speicherwert Deutsch', /** Verwendet bei einem ungültigen Speicherwert Deutsch. */() => {
    localStorage.setItem('bp-language', 'fr');

    const service = TestBed.inject(LanguageService); // Zu prüfender Service mit isoliertem Testzustand.

    TestBed.tick();
    expect(service.language()).toBe('de');
    expect(service.content()).toBe(PORTFOLIO_TRANSLATIONS.de);
    expect(document.documentElement.lang).toBe('de');
  });

  it('übernimmt Englisch aus dem Speicher und synchronisiert nach einem Wechsel', /** Übernimmt Englisch aus dem Speicher und synchronisiert nach einem Wechsel. */() => {
    localStorage.setItem('bp-language', 'en');

    const service = TestBed.inject(LanguageService); // Zu prüfender Service mit isoliertem Testzustand.

    TestBed.tick();
    expect(service.content()).toBe(PORTFOLIO_TRANSLATIONS.en);
    expect(document.documentElement.lang).toBe('en');
    service.toggleLanguage();
    TestBed.tick();
    expect(service.language()).toBe('de');
    expect(localStorage.getItem('bp-language')).toBe('de');
    service.setLanguage('en');
    TestBed.tick();
    expect(document.documentElement.lang).toBe('en');
    expect(localStorage.getItem('bp-language')).toBe('en');
  });
});
