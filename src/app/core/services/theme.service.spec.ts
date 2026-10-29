/* src/app/core/services/theme.service.spec.ts */

import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeService } from './theme.service';

/** Prüft Vorrang der Persistenz, Browserfarbe und überholte Übergangstimer. */
describe('ThemeService', /** Gruppiert die Verhaltensprüfungen des Services. */() => {
  beforeEach(/** Bereitet isolierte Browser- und Testzustände vor. */() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
    document.head.insertAdjacentHTML('beforeend', '<meta name="theme-color" content="#000">');
  });
  afterEach(/** Entfernt Testzustände, Timer und ersetzte Browser-APIs. */() => {
    TestBed.resetTestingModule();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    localStorage.clear();
    document.querySelector('meta[name="theme-color"]')?.remove();
    document.documentElement.classList.remove('bp-theme-is-switching');
    delete document.documentElement.dataset['theme'];
  });

  it('nutzt bei ungültiger Persistenz die Systemeinstellung', /** Nutzt bei ungültiger Persistenz die Systemeinstellung. */() => {
    localStorage.setItem('bp-theme', 'unknown');

    const service = TestBed.inject(ThemeService); // Zu prüfender Service mit isoliertem Testzustand.

    TestBed.tick();
    expect(service.isLight()).toBe(true);
    expect(document.documentElement.dataset['theme']).toBe('light');
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe('#fffaf1');
  });

  it('bevorzugt die gespeicherte Auswahl und aktualisiert Theme sowie Browserfarbe', /** Bevorzugt die gespeicherte Auswahl und aktualisiert Theme sowie Browserfarbe. */() => {
    localStorage.setItem('bp-theme', 'dark');

    const service = TestBed.inject(ThemeService); // Zu prüfender Service mit isoliertem Testzustand.

    TestBed.tick();
    expect(service.currentTheme()).toBe('dark');
    service.toggleTheme();
    TestBed.tick();
    expect(localStorage.getItem('bp-theme')).toBe('light');
    expect(service.isLight()).toBe(true);
    service.setTheme('dark');
    TestBed.tick();
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe('#0b0b0d');
  });

  it('entfernt bei schnellen Wechseln die Übergangsklasse erst nach dem letzten Timer', /** Entfernt bei schnellen Wechseln die Übergangsklasse erst nach dem letzten Timer. */() => {

    const service = TestBed.inject(ThemeService); // Zu prüfender Service mit isoliertem Testzustand.

    service.toggleTheme();
    vi.advanceTimersByTime(500);
    service.toggleTheme();
    vi.advanceTimersByTime(220);
    expect(document.documentElement.classList.contains('bp-theme-is-switching')).toBe(true);
    vi.advanceTimersByTime(500);
    expect(document.documentElement.classList.contains('bp-theme-is-switching')).toBe(false);
  });
});
