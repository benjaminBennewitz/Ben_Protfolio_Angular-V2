/* src/app/pages/project-detail-page/catalog-reader.spec.ts */

import { signal } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PORTFOLIO_PROJECTS } from '../../core/data/portfolio-projects';
import type { PortfolioProject } from '../../core/models/projects.models';
import { CatalogReader } from './catalog-reader';

/** Prüft Seitenwechsel, Sprachwechsel, Lupe und Fokusverwaltung des ausgelagerten Readers. */
describe('CatalogReader', /** Gruppiert die unabhängigen Reader-Vertragstests. */() => {

  const catalog = PORTFOLIO_PROJECTS.de.find(/** Wählt das Projekt mit Katalogansicht. */ project => project.catalogShowcase)!; // Reale Katalogdaten als strukturelle Testvorlage.
  const language = signal<'de' | 'en'>('de');                                                                                   // Aktive Testsprache für die Asset-Auswahl.
  const project = signal<PortfolioProject | undefined>(undefined);                                                              // Projektdaten des Reader-Tests.
  const panel = document.createElement('aside');                                                                                // Dialogcontainer für Tastatur- und Fokusprüfungen.
  const trigger = document.createElement('button');                                                                             // Menü-Trigger für die Fokusrückführung.
  let reader: CatalogReader;                                                                                                    // Für jeden Test isolierter Reader-Zustand.

  beforeEach(/** Erzeugt einen Katalog ohne externe Bild-Requests und einen echten Fokuscontainer. */() => {
    vi.useFakeTimers();
    language.set('de');
    project.set({
      ...catalog, catalogShowcase: {
        ...catalog.catalogShowcase!, spreads: catalog.catalogShowcase!.spreads.slice(0, 3).map(
      /** Verwendet leere Seiten, damit Navigation ohne Netzwerkanfragen abgeschlossen wird. */ spread => ({ ...spread, pages: [] }),
        )
      }
    });
    panel.innerHTML = '<button>Schließen</button><button>Kapitel</button>';
    document.body.append(trigger, panel);
    reader = new CatalogReader(project, language, /** Liefert den externen Menü-Trigger. */() => trigger, /** Liefert den gerenderten Menücontainer. */() => panel);
  });

  afterEach(/** Räumt Reader, DOM, Browser-Stubs und Timer auf. */() => {
    reader.destroy();
    panel.remove();
    trigger.remove();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('navigiert über beide Kataloggrenzen und übernimmt die Wechselrichtung', /** Prüft umlaufende Navigation nach fertig geladenen Seiten. */ async () => {
    reader.selectAdjacentCatalogSpread(-1);
    await vi.waitFor(/** Wartet auf den asynchronen Doppelseitenwechsel. */() => expect(reader.activeCatalogSpreadIndex()).toBe(2));
    expect(reader.catalogSpreadDirection()).toBe(-1);
    reader.selectAdjacentCatalogSpread(1);
    await vi.waitFor(/** Wartet auf die erste Doppelseite. */() => expect(reader.activeCatalogSpreadIndex()).toBe(0));
    expect(reader.catalogSpreadDirection()).toBe(1);
    expect(reader.isCatalogReaderBusy()).toBe(false);
  });

  it('wartet auf decodierte Bilder und verwendet laufende Ladeaufträge beim erneuten Navigieren wieder', /** Prüft die Bildfreigabe vor einem sichtbaren Doppelseitenwechsel. */ async () => {

    const images: { onload?: () => void; decode: ReturnType<typeof vi.fn> }[] = []; // Für den Test kontrollierbare Bildladeaufträge.
    const page = catalog.catalogShowcase!.spreads[0].pages[0];                      // Strukturell vollständige Katalogseite als Bildvorlage.

    vi.stubGlobal('Image', class {
      onload?: () => void;                           // Vom Reader registrierter Abschluss des Bildladens.
      onerror?: () => void;                          // Vom Reader registrierte Fehlerbehandlung.
      complete = false;                              // Verhindert eine vorzeitige Decodierfreigabe.
      decode = vi.fn().mockResolvedValue(undefined); // Simuliert den erfolgreichen Browser-Decoder.

      /** Erfasst jeden tatsächlich neu angelegten Bildladeauftrag. */
      constructor() { images.push(this); }
    });
    project.set({
      ...catalog, catalogShowcase: {
        ...catalog.catalogShowcase!, spreads: catalog.catalogShowcase!.spreads.slice(0, 2).map(
      /** Verwendet je Doppelseite ein eindeutiges Bild ohne sprachabhängige Überschreibung. */(spread, index) => ({ ...spread, pages: [{ ...page, image: `/page-${index}.webp`, imageByLanguage: undefined }] }),
        )
      }
    });
    reader.selectCatalogSpread(1);
    reader.selectCatalogSpread(1);
    expect(images).toHaveLength(1);
    expect(reader.activeCatalogSpreadIndex()).toBe(0);
    expect(reader.isCatalogReaderBusy()).toBe(true);
    images[0].onload!();
    await vi.waitFor(/** Wartet auf die Freigabe des decodierten Zielbildes. */() => expect(reader.activeCatalogSpreadIndex()).toBe(1));
    expect(images[0].decode).toHaveBeenCalledOnce();
    expect(reader.isCatalogReaderBusy()).toBe(false);
  });

  it('verwirft einen laufenden Wechsel beim Projekt-Reset', /** Verhindert das Übernehmen veralteter Reader-Ergebnisse. */ async () => {
    reader.selectCatalogSpread(1);
    expect(reader.isCatalogReaderBusy()).toBe(true);
    reader.reset();
    await Promise.resolve();
    await Promise.resolve();
    expect(reader.activeCatalogSpreadIndex()).toBe(0);
    expect(reader.isCatalogReaderBusy()).toBe(false);
    expect(reader.catalogSpreadDirection()).toBe(0);
  });

  it('löst lokalisierte Assets und den sichtbaren Seitenbereich reaktiv auf', /** Prüft unveränderte ViewModels nach einem Sprachwechsel. */() => {
    project.set({
      ...catalog, catalogShowcase: {
        ...catalog.catalogShowcase!, spreads: [{
          ...catalog.catalogShowcase!.spreads[0], pages: [
            { ...catalog.catalogShowcase!.spreads[0].pages[0], number: '1', image: '/fallback.webp', imageByLanguage: { de: '/de.webp', en: '/en.webp' } },
          ]
        }]
      }
    });
    expect(reader.activeCatalogSpread()?.pages[0].asset).toBe('/de.webp');
    expect(reader.activeCatalogSpread()?.pageLabel).toBe('1 / 1');
    language.set('en');
    expect(reader.activeCatalogSpread()?.pages[0].asset).toBe('/en.webp');
    project.set(undefined);
    expect(reader.activeCatalogSpread()).toBeUndefined();
    expect(/** Navigiert auch ohne Katalogdaten ohne Fehler. */() => reader.selectAdjacentCatalogSpread(1)).not.toThrow();
  });

  it('schaltet die Lupe aus, entfernt sie und erlaubt erneutes Einschalten', () => {
    reader.catalogLoupe.set({ isVisible: true, pageNumber: '1', x: 0, y: 0, width: 230, height: 156, asset: 'page.webp', backgroundSize: '', backgroundPosition: '' });
    reader.toggleCatalogLoupe();
    expect(reader.isCatalogLoupeEnabled()).toBe(false);
    expect(reader.catalogLoupe().isVisible).toBe(false);
    reader.updateCatalogLoupe({ pointerType: 'mouse' } as PointerEvent, { number: '1', asset: 'page.webp' } as Parameters<CatalogReader['updateCatalogLoupe']>[1]);
    expect(reader.catalogLoupe().isVisible).toBe(false);
    reader.toggleCatalogLoupe();
    expect(reader.isCatalogLoupeEnabled()).toBe(true);
  });

  it('hält Tab und Shift-Tab im Menü und gibt den Fokus beim Schließen zurück', /** Prüft Fokusgrenzen des ausgelagerten Inhaltsverzeichnisses. */() => {

    const buttons = panel.querySelectorAll('button');                                            // Erster und letzter Menübutton für die Fokusgrenzen.
    const tab = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });                  // Vorwärtsnavigation am Ende des Menüs.
    const back = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, cancelable: true }); // Rückwärtsnavigation am Anfang des Menüs.

    reader.toggleCatalogMenu();
    vi.advanceTimersByTime(20);
    expect(document.activeElement).toBe(buttons[0]);
    buttons[1].focus();
    reader.trapCatalogMenuFocus(tab);
    expect(document.activeElement).toBe(buttons[0]);
    reader.trapCatalogMenuFocus(back);
    expect(document.activeElement).toBe(buttons[1]);
    expect(tab.defaultPrevented).toBe(true);
    reader.closeCatalogMenu();
    vi.advanceTimersByTime(20);
    expect(document.activeElement).toBe(trigger);
  });

  it('zeigt die Lupe nur für Mausinteraktion innerhalb einer geladenen Seite', /** Prüft Lupengeometrie sowie Touch- und Menü-Ausschlüsse. */() => {

    const page = { ...catalog.catalogShowcase!.spreads[0].pages[0], number: '1', asset: '/page.webp' };                  // Geladene Reader-Seite für den Lupentest.
    const element = document.createElement('article');                                                                   // Simulierte Katalogseite mit fester Geometrie.
    const event = { currentTarget: element, clientX: 60, clientY: 70, pointerType: 'mouse' } as unknown as PointerEvent; // Mausposition innerhalb der Seite.

    element.getBoundingClientRect = /** Liefert stabile Seitenabmessungen. */ () => ({ left: 10, top: 20, width: 200, height: 300 } as DOMRect);
    reader.updateCatalogLoupe(event, page);
    expect(reader.catalogLoupe()).toMatchObject({ isVisible: true, x: 50, y: 50, backgroundSize: '360px 540px' });
    reader.updateCatalogLoupe({ ...event, pointerType: 'touch' }, page);
    expect(reader.catalogLoupe().isVisible).toBe(false);
    reader.toggleCatalogMenu();
    reader.updateCatalogLoupe(event, page);
    expect(reader.catalogLoupe().isVisible).toBe(false);
    reader.destroy();
    expect(vi.getTimerCount()).toBe(0);
  });
});
