/* src/app/pages/snippets-page/snippets-page.component.spec.ts */

import { signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageService } from '../../core/services/language.service';
import { SeoService } from '../../core/services/seo.service';
import { SystemToastService } from '../../core/services/system-toast.service';
import { SnippetsPageComponent } from './snippets-page.component';

/** Prüft Suchbegriffe, Fensteridentität, Stapelreihenfolge und Clipboard-Ausgabe. */
describe('SnippetsPageComponent', /** Gruppiert die Verhaltensprüfungen der Layout-Komponente. */() => {

  let fixture: ComponentFixture<SnippetsPageComponent>; // Gerenderte Testinstanz für reaktive Sprachwechsel.
  let page: SnippetsPageComponent;            // Zu prüfende Seitenkomponente.
  const language = signal<'de' | 'en'>('de'); // Aktive Testsprache der Seite.

  beforeEach(/** Bereitet isolierte Komponenten-, Browser- und Service-Zustände vor. */() => {
    language.set('de');
    TestBed.configureTestingModule({
      providers: [
        { provide: LanguageService, useValue: { language } },
        { provide: SeoService, useValue: { setPageSeo: vi.fn() } },
        { provide: SystemToastService, useValue: { show: vi.fn() } },
      ]
    });
    TestBed.overrideComponent(SnippetsPageComponent, { set: { template: '', imports: [] } });

    fixture = TestBed.createComponent(SnippetsPageComponent);

    page = fixture.componentInstance;
    fixture.detectChanges();
  });
  afterEach(/** Entfernt Testkomponenten, Browser-Stubs und ausstehende Timer. */() => { TestBed.resetTestingModule(); vi.unstubAllGlobals(); });

  it('verknüpft mehrere Suchwörter und leert die Suche ohne Verlust der Einträge', /** Verknüpft mehrere Suchwörter und leert die Suche ohne Verlust der Einträge. */() => {
    page.searchQuery.set('CSS grid');
    expect(page.filteredEntries().length).toBeGreaterThan(0);
    page.searchQuery.set('CSS grid unmöglicherBegriff');
    expect(page.filteredEntries()).toEqual([]);
    page.clearSearch();
    expect(page.filteredEntries()).toHaveLength(page.texts().entries.length);
    language.set('en');
    fixture.detectChanges();
    expect(page.texts().searchLabel).not.toBe('');
    expect(page.filteredEntries()).toHaveLength(page.texts().entries.length);
  });

  it('öffnet einen Slug nur einmal und hebt ein vorhandenes Fenster nach vorne', /** Öffnet einen Slug nur einmal und hebt ein vorhandenes Fenster nach vorne. */() => {
    page.closeAllEntries();

    const slug = page.texts().entries[0].slug; // Stabile Kennung des ausgewählten Snippets.

    page.openEntry(slug);

    const firstLayer = page.openWindows()[0].zIndex; // Layer des Fensters vor erneutem Öffnen.

    page.openEntry(slug);
    expect(page.openWindows()).toHaveLength(1);
    expect(page.openWindows()[0].zIndex).toBeGreaterThan(firstLayer);
    page.closeEntry(slug);
    expect(page.isEntryOpen(slug)).toBe(false);
  });

  it('öffnet nur die aktuellen Suchtreffer als Fenster und schließt sie gemeinsam', /** Öffnet nur die aktuellen Suchtreffer als Fenster und schließt sie gemeinsam. */() => {
    page.searchQuery.set('grid');
    page.openAllEntries();
    expect(page.openWindows().map(/** Stellt die für diesen Test vorgegebene Browser-Reaktion bereit. */ item => item.slug)).toEqual(page.filteredEntries().map(/** Stellt die für diesen Test vorgegebene Browser-Reaktion bereit. */ item => item.slug));
    page.closeAllEntries();
    expect(page.visibleWindows()).toEqual([]);
  });

  it('kopiert beide Code-Varianten mit ihren Labels und bestätigt erst den erfolgreichen Versand', /** Kopiert beide Code-Varianten mit ihren Labels und bestätigt erst den erfolgreichen Versand. */ async () => {

    const writeText = vi.fn().mockResolvedValue(undefined); // Erfasst den in die Zwischenablage geschriebenen Inhalt.
    const entry = page.texts().entries[0];                  // Snippet-Eintrag mit klassischer und moderner Code-Variante.
    const event = new Event('click');                       // Simulierter Klick auf die Kopieraktion.

    vi.stubGlobal('navigator', new Proxy(navigator, { get: /** Ersetzt nur die Clipboard-API und erhält die übrigen Browser-Eigenschaften. */ (target, key) => key === 'clipboard' ? { writeText } : Reflect.get(target, key, target) }));
    await page.copyCode(entry, event);
    expect(writeText).toHaveBeenCalledExactlyOnceWith(`${entry.oldCodeLabel ?? page.texts().oldCodeLabel}\n${entry.oldCode}\n\n${entry.newCodeLabel ?? page.texts().newCodeLabel}\n${entry.newCode}`);
    expect(TestBed.inject(SystemToastService).show).toHaveBeenCalledOnce();
  });

  it('verzichtet ohne Clipboard-API auf eine falsche Erfolgsmeldung', /** Verzichtet ohne Clipboard-API auf eine falsche Erfolgsmeldung. */ async () => {
    vi.stubGlobal('navigator', new Proxy(navigator, { get: /** Simuliert eine fehlende Clipboard-API bei unverändertem Browser-Kontext. */ (target, key) => key === 'clipboard' ? undefined : Reflect.get(target, key, target) }));
    await page.copyCode(page.texts().entries[0], new Event('click'));
    expect(TestBed.inject(SystemToastService).show).not.toHaveBeenCalled();
  });
});
