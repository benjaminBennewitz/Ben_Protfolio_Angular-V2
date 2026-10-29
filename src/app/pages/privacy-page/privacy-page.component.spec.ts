/* src/app/pages/privacy-page/privacy-page.component.spec.ts */

import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { LanguageService } from '../../core/services/language.service';
import { SeoService } from '../../core/services/seo.service';
import { PrivacyPageComponent } from './privacy-page.component';

/** Prüft Kapitelgruppierung, Scrollgrenzen und Wheel-Sperre des Datenschutzdecks. */
describe('PrivacyPageComponent', /** Gruppiert die Verhaltensprüfungen der Layout-Komponente. */() => {

  let fixture: ComponentFixture<PrivacyPageComponent>; // Gerenderte Angular-Testkomponente mit realem Template.
  let page: PrivacyPageComponent;                      // Zu prüfende Seitenkomponente.
  let track: HTMLDivElement;                           // Gerenderte horizontale Scroll-Strecke des Datenschutzdecks.
  let scroll: Mock<HTMLElement['scrollTo']>;           // Erfasst angeforderte horizontale Scrollbewegungen.

  beforeEach(/** Bereitet isolierte Komponenten-, Browser- und Service-Zustände vor. */() => {
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
    TestBed.configureTestingModule({
      providers: [
        { provide: LanguageService, useValue: { language: /** Liefert die deutsche Testsprache. */ () => 'de' } },
        { provide: SeoService, useValue: { setPageSeo: vi.fn() } },
      ]
    });
    TestBed.overrideComponent(PrivacyPageComponent, { set: { template: '<div #privacyTrack><section class="privacy-deck__panel"></section><section class="privacy-deck__panel"></section><section class="privacy-deck__panel"></section></div>', imports: [] } });
    fixture = TestBed.createComponent(PrivacyPageComponent);
    page = fixture.componentInstance;
    fixture.detectChanges();
    track = fixture.nativeElement.querySelector('div');
    Object.defineProperties(track, { clientWidth: { value: 1000 }, scrollWidth: { value: 3000 } });
    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({ left: 0 } as DOMRect);
    track.querySelectorAll<HTMLElement>('section').forEach(/** Stellt die für diesen Test vorgegebene Browser-Reaktion bereit. */(panel, index) => {
      vi.spyOn(panel, 'getBoundingClientRect').mockImplementation(/** Stellt die für diesen Test vorgegebene Browser-Reaktion bereit. */() => ({ left: index * 1000 - track.scrollLeft } as DOMRect));
    });
    scroll = vi.fn<HTMLElement['scrollTo']>();
    Object.defineProperty(track, 'scrollTo', { configurable: true, value: scroll });
  });
  afterEach(/** Entfernt Testkomponenten, Browser-Stubs und ausstehende Timer. */() => { TestBed.resetTestingModule(); vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals(); });

  it('gruppiert alle Kapitel vollständig in höchstens drei Karten pro Panel', /** Gruppiert alle Kapitel vollständig in höchstens drei Karten pro Panel. */() => {
    expect(page.chapterPanels().flat()).toEqual(page.content().chapters);
    expect(page.chapterPanels().every(/** Stellt die für diesen Test vorgegebene Browser-Reaktion bereit. */ panel => panel.length <= 3)).toBe(true);
  });

  it('begrenzt Fortschritt und Navigationszustände an beiden Enden des Decks', /** Begrenzt Fortschritt und Navigationszustände an beiden Enden des Decks. */() => {
    track.scrollLeft = -100;
    page.updateScrollState(track);
    expect(page.progress()).toBe(0);
    expect(page.canScrollLeft()).toBe(false);
    track.scrollLeft = 4000;
    page.updateScrollState(track);
    expect(page.progress()).toBe(100);
    expect(page.canScrollRight()).toBe(false);
  });

  it('ignoriert Zoom-Gesten und bündelt schnelle Wheel-Ereignisse zu einem Panelwechsel', /** Ignoriert Zoom-Gesten und bündelt schnelle Wheel-Ereignisse zu einem Panelwechsel. */() => {

    const zoom = new WheelEvent('wheel', { deltaY: 100, ctrlKey: true, cancelable: true }); // Wheel-Geste mit gedrückter Zoom-Modifikatortaste.

    page.handleWheel(zoom, track);
    expect(zoom.defaultPrevented).toBe(false);
    expect(scroll).not.toHaveBeenCalled();
    page.handleWheel(new WheelEvent('wheel', { deltaY: 30, cancelable: true }), track);
    page.handleWheel(new WheelEvent('wheel', { deltaY: 30, cancelable: true }), track);
    expect(scroll).toHaveBeenCalledExactlyOnceWith({ left: 1000, behavior: 'smooth' });
    vi.advanceTimersByTime(480);
    page.handleWheel(new WheelEvent('wheel', { deltaY: 30, cancelable: true }), track);
    expect(scroll).toHaveBeenCalledTimes(2);
  });

  it('respektiert reduzierte Bewegung und scrollt vom mittleren Panel exakt zurück', /** Respektiert reduzierte Bewegung und scrollt vom mittleren Panel exakt zurück. */() => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
    track.scrollLeft = 1000;
    page.scrollByPanel(track, -1);
    expect(scroll).toHaveBeenCalledWith({ left: 0, behavior: 'auto' });
  });

  it('räumt den Wheel-Freigabetimer beim Verlassen auf', /** Räumt den Wheel-Freigabetimer beim Verlassen auf. */() => {
    page.handleWheel(new WheelEvent('wheel', { deltaY: 30 }), track);
    fixture.destroy();
    expect(vi.getTimerCount()).toBe(0);
  });
});
