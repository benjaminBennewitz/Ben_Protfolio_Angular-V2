/* src/app/core/services/accessibility-preference.service.spec.ts */

import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AccessibilityPreferenceService } from './accessibility-preference.service';

/** Prüft validierte Einstellungen, Calm-Modus und Browser-Synchronisierung. */
describe('AccessibilityPreferenceService', /** Gruppiert die Verhaltensprüfungen des Services. */() => {
  beforeEach(/** Bereitet isolierte Browser- und Testzustände vor. */() => {
    localStorage.clear();
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
  });
  afterEach(/** Entfernt Testzustände, Timer und ersetzte Browser-APIs. */() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
    localStorage.clear();
    for (const key of ['motion', 'comfort', 'contrast', 'colorVision']) delete document.documentElement.dataset[key]; // Attributname der aufzuräumenden Einstellung.
  });

  it('fällt bei beschädigtem JSON auf die Systemeinstellung zurück', /** Fällt bei beschädigtem JSON auf die Systemeinstellung zurück. */() => {
    localStorage.setItem('bp-accessibility-preferences-v1', '{invalid');

    const service = TestBed.inject(AccessibilityPreferenceService); // Zu prüfender Service mit isoliertem Testzustand.

    TestBed.tick();
    expect(service.preferences()).toEqual({ motion: 'reduced', comfort: 'expressive', contrast: 'normal', colorVision: 'default' });
    expect(service.allowsMotion()).toBe(false);
    expect(document.documentElement.dataset['motion']).toBe('reduced');
  });

  it('validiert gespeicherte Felder einzeln und erhält gültige Werte', /** Validiert gespeicherte Felder einzeln und erhält gültige Werte. */() => {
    localStorage.setItem('bp-accessibility-preferences-v1', JSON.stringify({ motion: 'full', comfort: 'invalid', contrast: 'high', colorVision: 'tritanopia' }));

    const service = TestBed.inject(AccessibilityPreferenceService); // Zu prüfender Service mit isoliertem Testzustand.

    TestBed.tick();
    expect(service.preferences()).toEqual({ motion: 'full', comfort: 'expressive', contrast: 'high', colorVision: 'tritanopia' });
    expect(service.allowsMotion()).toBe(true);
    expect(JSON.parse(localStorage.getItem('bp-accessibility-preferences-v1')!)).toEqual(service.preferences());
  });

  it('bewahrt beim Calm-Modus die Farbsehhilfe und setzt anschließend auf Systemwerte zurück', /** Bewahrt beim Calm-Modus die Farbsehhilfe und setzt anschließend auf Systemwerte zurück. */() => {

    const service = TestBed.inject(AccessibilityPreferenceService); // Zu prüfender Service mit isoliertem Testzustand.

    service.setColorVisionMode('protanopia');
    service.setMotionMode('full');
    service.setContrastMode('normal');
    service.setComfortMode('expressive');
    service.enableCalmMode();
    TestBed.tick();
    expect(service.preferences()).toEqual({ motion: 'off', comfort: 'simple', contrast: 'high', colorVision: 'protanopia' });
    expect(service.usesSimpleMode()).toBe(true);
    expect(document.documentElement.dataset['colorVision']).toBe('protanopia');
    service.resetPreferences();
    TestBed.tick();
    expect(service.preferences()).toEqual({ motion: 'reduced', comfort: 'expressive', contrast: 'normal', colorVision: 'default' });
  });
});
