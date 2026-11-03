/* src/app/pages/archive-page/archive-page.component.spec.ts */

import { signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DESIGN_STUDIES } from '../../core/data/design-studies';
import { LanguageService } from '../../core/services/language.service';
import { SeoService } from '../../core/services/seo.service';
import { ArchivePageComponent } from './archive-page.component';

/** Prüft Filterung, Sprachwechsel, Fensterfokus und Wiederherstellung im Designarchiv. */
describe('ArchivePageComponent', /** Isolierte Interaktionen des neuen Designarchivs. */() => {
  let fixture: ComponentFixture<ArchivePageComponent>; // Komponentenfixture mit Test-Template.
  let page: ArchivePageComponent;                      // Zu prüfende Archivinfrastruktur.
  const language = signal<'de' | 'en'>('de');           // Dynamische Testsprache.

  beforeEach(/** Richtet den Archivkontext mit unabhängigen Services ein. */() => {
    language.set('de');
    TestBed.configureTestingModule({
      providers: [
        { provide: LanguageService, useValue: { language } },
        { provide: SeoService, useValue: { setPageSeo: vi.fn() } },
      ],
    });
    TestBed.overrideComponent(ArchivePageComponent, { set: { template: '', imports: [] } });
    fixture = TestBed.createComponent(ArchivePageComponent);
    page = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(/** Bereinigt den isolierten Angular-Testkontext. */() => TestBed.resetTestingModule());

  it('zeigt sämtliche neun Studien mit stabilen, eindeutigen Archivnummern', /** Prüft die zentrale Quelle. */() => {
    expect(page.studies()).toHaveLength(DESIGN_STUDIES.length);
    expect(page.studyNumber('ctrl-room')).toBe('DS/003');
    expect(page.studyNumber('phase')).toBe('DS/009');
    expect(page.categoryCount('spatial')).toBe(2);
  });

  it('kombiniert Kategorien mit mehrteiliger Suche und synchronisiert den Inspector', /** Prüft zusammengesetzte Filter. */() => {
    page.setCategory('retro');
    expect(page.filteredStudies().map(study => study.id)).toEqual(['ctrl-room']);
    expect(page.activeStudy()?.id).toBe('ctrl-room');
    page.setSearch('Chrom Kultur');
    expect(page.filteredStudies().map(study => study.id)).toEqual(['ctrl-room']);
    page.setSearch('unbekanntes-wort');
    expect(page.filteredStudies()).toEqual([]);
    expect(page.activeStudy()).toBeNull();
    page.clearFilters();
    expect(page.filteredStudies()).toHaveLength(9);
  });

  it('reagiert auf den globalen Sprachwechsel auch bei Textsuche', /** Prüft lokalisierte Suchindizes. */() => {
    page.setSearch('Fotografie');
    expect(page.filteredStudies().map(study => study.id)).toEqual(['whatwesee']);
    language.set('en');
    fixture.detectChanges();
    expect(page.texts().searchLabel).toBe('Search design studies');
    page.setSearch('photography');
    expect(page.filteredStudies().map(study => study.id)).toEqual(['whatwesee']);
  });

  it('bringt ein Fenster nach oben und erlaubt Wiederöffnung nach dem Schließen', /** Prüft Fenster- und Z-Reihenfolge. */() => {
    page.windows.set(DESIGN_STUDIES.slice(0, 2).map((study, index) => ({
      id: study.id, x: 0, y: 0, width: 320, height: 240, zIndex: index,
      closed: false, maximized: false,
    })));
    page.focusStudy('raw-form');
    expect(page.windows()[0].zIndex).toBeGreaterThan(page.windows()[1].zIndex);
    page.closeWindow('raw-form', new Event('click'));
    expect(page.visibleWindows().map(item => item.study.id)).not.toContain('raw-form');
    page.focusStudy('raw-form');
    expect(page.visibleWindows().map(item => item.study.id)).toContain('raw-form');
  });
});
