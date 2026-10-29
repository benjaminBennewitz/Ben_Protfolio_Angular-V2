/* src/app/shared/about-metrics-window/about-metrics-window.component.spec.ts */

import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PORTFOLIO_TRANSLATIONS } from '../../core/data/portfolio-content';
import { AchievementService } from '../../core/services/achievement.service';
import { AboutMetricsWindowComponent } from './about-metrics-window.component';

describe('AboutMetricsWindowComponent', /** Gruppiert die Verhaltensprüfungen der Shared-Komponente oder Direktive. */() => {

  let component: AboutMetricsWindowComponent; // Zu prüfende Komponenteninstanz.

  beforeEach(/** Bereitet isolierte Komponenten und Service-Doubles vor. */() => {
    TestBed.configureTestingModule({ providers: [{ provide: AchievementService, useValue: { unlock: vi.fn() } }] });
    TestBed.overrideComponent(AboutMetricsWindowComponent, { set: { template: '' } });

    const fixture = TestBed.createComponent(AboutMetricsWindowComponent); // Angular-Testinstanz mit gerendertem Host.

    fixture.componentRef.setInput('content', PORTFOLIO_TRANSLATIONS.de.about.metrics);
    component = fixture.componentInstance;
  });

  afterEach(/** Entfernt Testkomponenten und stellt den Browserzustand wieder her. */() => { TestBed.resetTestingModule(); vi.useRealTimers(); });

  it('rechnet Zentimeter und Kilogramm in dieselbe ausgewählte Objekteinheit um', /** Rechnet Zentimeter und Kilogramm in dieselbe ausgewählte Objekteinheit um. */() => {
    component.calculatorUnitKey.set('wiener');
    component.calculatorHeightCm.set(30);
    component.calculatorWeightKg.set(0.16);
    expect(component.calculatorHeightResult().count).toBe('2');
    expect(component.calculatorWeightResult().count).toBe('2');
    expect(component.calculatorHeightResult().unit).toBe(component.selectedCalculatorUnit().shortLabel);
  });

  it('liest Dezimalkommas, begrenzt große Werte und behält bei ungültigen Eingaben den Standard', /** Liest Dezimalkommas, begrenzt große Werte und behält bei ungültigen Eingaben den Standard. */() => {

    const input = document.createElement('input'); // Simuliertes Eingabefeld.
    const event = new Event('input');              // Eingabeereignis mit dem simulierten Zielfeld.

    Object.defineProperty(event, 'target', { value: input });
    input.value = '12,5';
    component.updateCalculatorWeight(event);
    expect(component.calculatorWeightKg()).toBe(12.5);
    input.value = '10000';
    component.updateCalculatorHeight(event);
    expect(component.calculatorHeightCm()).toBe(9999);
    input.value = '-1';
    component.updateCalculatorWeight(event);
    expect(component.calculatorWeightKg()).toBe(87);
    input.value = 'kein Wert';
    component.updateCalculatorHeight(event);
    expect(component.calculatorHeightCm()).toBe(185);
  });

  it('meldet nur einen tatsächlichen Wechsel in den absurden Modus und räumt die Animation auf', /** Meldet nur einen tatsächlichen Wechsel in den absurden Modus und räumt die Animation auf. */() => {
    vi.useFakeTimers();

    const changed = vi.fn(); // Erfasst tatsächlich ausgegebene Moduswechsel.

    component.weirdModeSelected.subscribe(changed);
    component.setMode('weird');
    component.setMode('weird');
    expect(changed).toHaveBeenCalledOnce();
    expect(component.isRecalculating()).toBe(true);
    vi.runAllTimers();
    expect(component.isRecalculating()).toBe(false);
    component.setMode('metric');
    component.ngOnDestroy();
    expect(vi.getTimerCount()).toBe(0);
  });
});
