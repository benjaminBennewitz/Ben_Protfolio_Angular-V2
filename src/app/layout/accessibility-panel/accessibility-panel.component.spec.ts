/* src/app/layout/accessibility-panel/accessibility-panel.component.spec.ts */

import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageService } from '../../core/services/language.service';
import { AccessibilityPreferenceService } from '../../core/services/accessibility-preference.service';
import { AchievementService } from '../../core/services/achievement.service';
import { GlobalOverlayService } from '../../core/services/global-overlay.service';
import { SystemToastService } from '../../core/services/system-toast.service';
import { AccessibilityPanelComponent } from './accessibility-panel.component';

/** Prüft reale Panel-Bedienung, Fokusgrenzen, Fokusrückkehr und Einstellungsänderungen. */
describe('AccessibilityPanelComponent', /** Gruppiert die Verhaltensprüfungen der Layout-Komponente. */ () => {

  let fixture: ComponentFixture<AccessibilityPanelComponent>; // Gerenderte Angular-Testkomponente mit realem Template.
  let trigger: HTMLButtonElement;                             // Externer Button als ursprüngliches Fokusziel.

  /** Öffnet das Panel über einen externen Auslöser und lässt die Fokusplanung ausführen. */
  function openPanel(): HTMLElement {
    trigger.focus();
    TestBed.inject(GlobalOverlayService).requestAccessibilityPanel();
    fixture.detectChanges();
    vi.advanceTimersByTime(20);
    return fixture.nativeElement.querySelector('[role="dialog"]');
  }

  beforeEach(/** Bereitet isolierte Komponenten-, Browser- und Service-Zustände vor. */ () => {
    vi.useFakeTimers();
    localStorage.clear();
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
    TestBed.configureTestingModule({ providers: [
      { provide: LanguageService, useValue: { language: /** Liefert die deutsche Testsprache. */ () => 'de' } },
      { provide: AchievementService, useValue: { unlock: vi.fn() } },
      { provide: SystemToastService, useValue: { show: vi.fn() } },
    ] });
    trigger = document.createElement('button');
    document.body.appendChild(trigger);
    fixture = TestBed.createComponent(AccessibilityPanelComponent);
    fixture.detectChanges();
  });

  afterEach(/** Entfernt Testkomponenten, Browser-Stubs und ausstehende Timer. */ () => {
    TestBed.resetTestingModule();
    trigger.remove();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    localStorage.clear();
    for (const key of ['motion', 'comfort', 'contrast', 'colorVision']) delete document.documentElement.dataset[key]; // Attributname der zurückzusetzenden Einstellung.
  });

  it('setzt initialen Fokus, begrenzt Tab und schließt mit Escape samt Fokusrückgabe', /** Setzt initialen Fokus, begrenzt Tab und schließt mit Escape samt Fokusrückgabe. */ () => {

    const panel = openPanel();                                    // Gerendertes Dialogfenster des geöffneten Panels.
    const buttons = Array.from(panel.querySelectorAll('button')); // Bedienbare Buttons innerhalb des Dialogfensters.
    const first = buttons[0];                                     // Erstes Bedienelement der Fokusreihenfolge.
    const last = buttons[buttons.length - 1];                     // Letztes Bedienelement der Fokusreihenfolge.

    expect(document.activeElement).toBe(first);
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));
    expect(document.activeElement).toBe(last);
    last.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(first);
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    vi.advanceTimersByTime(20);
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('wendet den Calm-Modus über den UI-Button an und setzt die Auswahl wieder zurück', /** Wendet den Calm-Modus über den UI-Button an und setzt die Auswahl wieder zurück. */ () => {

    const panel = openPanel();                                                                        // Gerendertes Dialogfenster des geöffneten Panels.
    const preferences = TestBed.inject(AccessibilityPreferenceService);                               // Realer Service für die durch das Panel geänderten Einstellungen.
    const actions = panel.querySelectorAll<HTMLButtonElement>('.access-panel__quick-actions button'); // Gerenderte Buttons für Calm-Modus und Zurücksetzen.

    actions[0].click();
    fixture.detectChanges();
    expect(preferences.motionMode()).toBe('off');
    expect(preferences.usesSimpleMode()).toBe(true);
    expect(TestBed.inject(AchievementService).unlock).toHaveBeenCalledWith('world-upside-down');
    expect(panel.querySelectorAll('.is-active')).toHaveLength(4);
    actions[1].click();
    fixture.detectChanges();
    expect(preferences.motionMode()).toBe('full');
    expect(preferences.usesSimpleMode()).toBe(false);
  });

  it('nutzt nach Entfernen des ursprünglichen Auslösers den eingebauten Toggle als Fokusziel', /** Nutzt nach Entfernen des ursprünglichen Auslösers den eingebauten Toggle als Fokusziel. */ () => {
    openPanel();
    trigger.remove();
    fixture.componentInstance.close();
    fixture.detectChanges();
    vi.advanceTimersByTime(20);
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('.access-panel__toggle'));
  });

  it('meldet den globalen Auslöser beim Zerstören ab', /** Meldet den globalen Auslöser beim Zerstören ab. */ () => {

    const component = fixture.componentInstance; // Zu prüfende Komponenteninstanz.

    fixture.destroy();
    TestBed.inject(GlobalOverlayService).requestAccessibilityPanel();
    expect(component.open()).toBe(false);
  });
});
