/* src/app/layout/navigation/navigation.component.spec.ts */

import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PORTFOLIO_TRANSLATIONS } from '../../core/data/portfolio-content';
import { LanguageService } from '../../core/services/language.service';
import { ThemeService } from '../../core/services/theme.service';
import { SystemToastService } from '../../core/services/system-toast.service';
import { GlobalOverlayService } from '../../core/services/global-overlay.service';
import { NavigationComponent } from './navigation.component';

/** Prüft mobiles Menü, Tastaturfokus, Desktop-Wechsel und globalen Scroll-Lock. */
describe('NavigationComponent', /** Gruppiert die Verhaltensprüfungen der Layout-Komponente. */ () => {

  let fixture: ComponentFixture<NavigationComponent>; // Gerenderte Angular-Testkomponente mit realem Template.
  let burger: HTMLButtonElement;                      // Gerenderter Button des mobilen Menüs.
  let originalWidth: number;                          // Vor dem Test vorhandene Browserbreite.

  /** Öffnet das Menü über seinen tatsächlichen Button und wartet auf den Fokus-Frame. */
  function openMenu(): void {
    burger.click();
    fixture.detectChanges();
    vi.advanceTimersByTime(20);
  }

  beforeEach(/** Bereitet isolierte Komponenten-, Browser- und Service-Zustände vor. */ () => {
    vi.useFakeTimers();
    originalWidth = window.innerWidth;
    TestBed.configureTestingModule({ providers: [
      provideRouter([]),
      { provide: LanguageService, useValue: { content: /** Liefert den deutschen Portfolio-Inhalt ohne Persistenz. */ () => PORTFOLIO_TRANSLATIONS.de, language: /** Liefert die deutsche Testsprache. */ () => 'de' } },
      { provide: ThemeService, useValue: { isLight: /** Liefert den dunklen Theme-Zustand. */ () => false } },
      { provide: SystemToastService, useValue: { show: vi.fn() } },
    ] });
    fixture = TestBed.createComponent(NavigationComponent);
    fixture.detectChanges();
    burger = fixture.nativeElement.querySelector('.nav__burger');
  });

  afterEach(/** Entfernt Testkomponenten, Browser-Stubs und ausstehende Timer. */ () => {
    TestBed.resetTestingModule();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth });
    document.documentElement.classList.remove('bp-mobile-menu-open');
  });

  it('setzt Scroll-Lock und ARIA-Zustand und gibt bei Escape den Fokus an den Menübutton zurück', /** Setzt Scroll-Lock und ARIA-Zustand und gibt bei Escape den Fokus an den Menübutton zurück. */ () => {
    openMenu();
    expect(burger.getAttribute('aria-expanded')).toBe('true');
    expect(document.documentElement.classList.contains('bp-mobile-menu-open')).toBe(true);
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('.nav__links a'));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(burger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(burger);
    expect(document.documentElement.classList.contains('bp-mobile-menu-open')).toBe(false);
  });

  it('führt Tab und Shift-Tab an beiden Enden der sichtbaren Menüelemente im Kreis', /** Führt Tab und Shift-Tab an beiden Enden der sichtbaren Menüelemente im Kreis. */ () => {
    openMenu();

    const links = Array.from(fixture.nativeElement.querySelectorAll('header a[href], header button:not([disabled])')) as HTMLElement[]; // Für die Fokusprüfung sichtbar simulierte Header-Bedienelemente.
    const first = links[0];                                                                                                             // Erstes Bedienelement der Fokusreihenfolge.
    const last = links[links.length - 1];                                                                                               // Letztes Bedienelement der Fokusreihenfolge.
    const backwards = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });                    // Abbrechbares Shift-Tab-Ereignis am Anfang der Fokusreihenfolge.
    const forwards = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });                                     // Abbrechbares Tab-Ereignis am Ende der Fokusreihenfolge.

    // JSDOM misst keine Layoutrechtecke; nur die Sichtbarkeitsmessung wird ersetzt.
    for (const element of links) vi.spyOn(element, 'getClientRects').mockReturnValue([{}] as unknown as DOMRectList); // Header-Element mit simulierter Sichtbarkeit.
    first.focus();
    first.dispatchEvent(backwards);
    expect(backwards.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(last);
    last.dispatchEvent(forwards);
    expect(forwards.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(first);
  });

  it('schließt das Menü beim Öffnen des Access-Panels sowie beim Desktop-Wechsel', /** Schließt das Menü beim Öffnen des Access-Panels sowie beim Desktop-Wechsel. */ () => {

    const overlay = vi.spyOn(TestBed.inject(GlobalOverlayService), 'requestAccessibilityPanel'); // Überwacht den globalen Auslöser des Accessibility-Panels.

    openMenu();
    fixture.nativeElement.querySelector('.nav__access').click();
    expect(overlay).toHaveBeenCalledOnce();
    expect(fixture.componentInstance.menuOpen()).toBe(false);
    openMenu();
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1200 });
    window.dispatchEvent(new Event('resize'));
    expect(fixture.componentInstance.menuOpen()).toBe(false);
    expect(document.documentElement.classList.contains('bp-mobile-menu-open')).toBe(false);
  });

  it('räumt den globalen Scroll-Lock auch beim Zerstören des geöffneten Menüs auf', /** Räumt den globalen Scroll-Lock auch beim Zerstören des geöffneten Menüs auf. */ () => {
    openMenu();
    fixture.destroy();
    expect(document.documentElement.classList.contains('bp-mobile-menu-open')).toBe(false);
  });
});
