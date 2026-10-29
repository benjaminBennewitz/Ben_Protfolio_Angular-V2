/* src/app/core/services/seo.service.spec.ts */

import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../environments/environment';
import { SeoService } from './seo.service';
import { TabTitleService } from './tab-title.service';

/** Prüft Robots-Wechsel, konsistente Metadaten und wiederverwendete Head-Elemente. */
describe('SeoService', /** Gruppiert die Verhaltensprüfungen des Services. */() => {
  let doc: Document; // Isoliertes Dokument für die Service-Prüfung.

  beforeEach(/** Bereitet isolierte Browser- und Testzustände vor. */() => {
    doc = document.implementation.createHTMLDocument('SEO-Test');
    doc.documentElement.lang = 'en';
    TestBed.configureTestingModule({
      providers: [
        { provide: DOCUMENT, useValue: doc },
        { provide: TabTitleService, useValue: { setActiveTitle: vi.fn() } },
      ]
    });
  });
  afterEach(/** Entfernt Testzustände, Timer und ersetzte Browser-APIs. */() => { TestBed.resetTestingModule(); });

  it('ersetzt noindex auf der nächsten öffentlichen Route und synchronisiert Social-URLs', /** Ersetzt noindex auf der nächsten öffentlichen Route und synchronisiert Social-URLs. */() => {

    const service = TestBed.inject(SeoService);    // Zu prüfender Service mit isoliertem Testzustand.
    const title = TestBed.inject(TabTitleService); // Testdouble für den aktiven Browser-Tab-Titel.

    service.setNoIndexPageSeo('Danke', 'Versendet', '/danke');
    expect(doc.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, follow');
    service.setPageSeo('Portfolio', 'Projektübersicht', '/portfolio');
    expect(doc.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('index, follow');
    expect(doc.querySelector('meta[property="og:locale"]')?.getAttribute('content')).toBe('en_US');
    expect(doc.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(`${environment.siteUrl}/portfolio`);
    expect(doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content')).toBe('Portfolio');
    expect(title.setActiveTitle).toHaveBeenLastCalledWith('Portfolio');
  });

  it('ersetzt Canonical und strukturierte Daten ohne doppelte Head-Elemente', /** Ersetzt Canonical und strukturierte Daten ohne doppelte Head-Elemente. */() => {

    const service = TestBed.inject(SeoService); // Zu prüfender Service mit isoliertem Testzustand.

    service.setPageSeo('Leistungen', 'Angebote', 'leistungen');
    service.setNotFoundSeo('Nicht gefunden', 'Unbekannte Route');
    expect(doc.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`${environment.siteUrl}/`);
    expect(doc.querySelectorAll('#bp-structured-data')).toHaveLength(1);
    expect(JSON.parse(doc.getElementById('bp-structured-data')!.textContent!)).toMatchObject({ '@type': 'WebPage', name: 'Nicht gefunden' });
    expect(doc.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, follow');
  });
});
