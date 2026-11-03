/* src/app/pages/archive-page/archive-page.component.spec.ts */

import { ElementRef, signal } from '@angular/core';
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

  it('zeigt sämtliche zehn Studien mit stabilen, eindeutigen Archivnummern', /** Prüft die zentrale Quelle. */() => {
    expect(page.studies()).toHaveLength(DESIGN_STUDIES.length);
    expect(page.studyNumber('ctrl-room')).toBe('DS/003');
    expect(page.studyNumber('phase')).toBe('DS/009');
    expect(page.studyNumber('dead-air')).toBe('DS/010');
    expect(page.categoryCount('spatial')).toBe(2);
  });

  it('kombiniert Kategorien mit mehrteiliger Suche und synchronisiert den Inspector', /** Prüft zusammengesetzte Filter. */() => {
    page.setCategory('retro');
    expect(page.filteredStudies().map(study => study.id)).toEqual(['ctrl-room', 'dead-air']);
    expect(page.activeStudy()?.id).toBe('ctrl-room');
    page.setSearch('Chrom Kultur');
    expect(page.filteredStudies().map(study => study.id)).toEqual(['ctrl-room']);
    page.setSearch('unbekanntes-wort');
    expect(page.filteredStudies()).toEqual([]);
    expect(page.activeStudy()).toBeNull();
    page.clearFilters();
    expect(page.filteredStudies()).toHaveLength(10);
  });

  it('reagiert auf den globalen Sprachwechsel auch bei Textsuche', /** Prüft lokalisierte Suchindizes. */() => {
    page.setSearch('Fotografie-Journal');
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

  it('verteilt frei skalierte Fenster über die Bühne, ohne sie an einer Stelle zu ballen', /** Prüft die freie Startgeometrie. */() => {
    const stage = { clientWidth: 1170, clientHeight: 702 } as HTMLElement; // Unabhängiger Test-Canvas.

    Object.defineProperty(page, 'canvas', { configurable: true, value: new ElementRef(stage) });
    page.resetLayout();

    const placed = page.visibleWindows(); // Die zehn anfänglich geöffneten Fenster.
    const centerX = placed.map(({ state }) => state.x + state.width / 2); // Horizontale Mittelpunkte.
    const centerY = placed.map(({ state }) => state.y + state.height / 2); // Vertikale Mittelpunkte.
    const widths = new Set(placed.map(({ state }) => Math.round(state.width))); // Unterschiedliche Fensterformate.

    expect(placed).toHaveLength(10);
    expect(widths.size).toBeGreaterThan(3);
    expect(Math.max(...centerX) - Math.min(...centerX)).toBeGreaterThan(stage.clientWidth * 0.55);
    expect(Math.max(...centerY) - Math.min(...centerY)).toBeGreaterThan(stage.clientHeight * 0.45);

    for (const { state } of placed) {
      expect(state.x).toBeGreaterThanOrEqual(0);
      expect(state.y).toBeGreaterThanOrEqual(0);
      expect(state.x + state.width).toBeLessThanOrEqual(stage.clientWidth);
      expect(state.y + state.height).toBeLessThanOrEqual(stage.clientHeight);
    }
  });

  it('behält freie Fensterpositionen beim Filtern bei', /** Verhindert unerwartete Neupositionierungen während der Suche. */() => {
    const stage = { clientWidth: 1170, clientHeight: 702 } as HTMLElement; // Konstant große Testarbeitsfläche.

    Object.defineProperty(page, 'canvas', { configurable: true, value: new ElementRef(stage) });
    page.resetLayout();
    const original = page.windows().find(state => state.id === 'ctrl-room'); // Position vor dem Filterwechsel.

    page.setCategory('retro');
    expect(page.visibleWindows()).toHaveLength(1);
    expect(page.windows().find(state => state.id === 'ctrl-room')).toMatchObject({
      x: original?.x, y: original?.y, width: original?.width, height: original?.height,
    });
  });

  it('erhält geschlossene Fenster beim Neuverteilen und passt die Anordnung an Filter an', /** Prüft die Reset-Semantik. */() => {
    const stage = { clientWidth: 1170, clientHeight: 702 } as HTMLElement; // Desktopgröße für deterministische Tests.

    Object.defineProperty(page, 'canvas', { configurable: true, value: new ElementRef(stage) });
    page.resetLayout();
    page.closeWindow('phase', new Event('click'));
    page.shuffleLayout();
    expect(page.windows().find(state => state.id === 'phase')?.closed).toBe(true);
    page.setCategory('editorial');
    expect(page.visibleWindows()).toHaveLength(2);
    page.resetLayout();
    expect(page.windows().find(state => state.id === 'phase')?.closed).toBe(false);
  });
});
