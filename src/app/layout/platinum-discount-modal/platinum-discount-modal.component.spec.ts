/* src/app/layout/platinum-discount-modal/platinum-discount-modal.component.spec.ts */

import { signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AchievementService } from '../../core/services/achievement.service';
import { LanguageService } from '../../core/services/language.service';
import { PlatinumCompletionModalComponent } from './platinum-discount-modal.component';

/** Prüft Tastaturführung und Navigation des über den Service geöffneten Abschlussdialogs. */
describe('PlatinumCompletionModalComponent', /** Gruppiert die Verhaltensprüfungen der Layout-Komponente. */ () => {

  let fixture: ComponentFixture<PlatinumCompletionModalComponent>; // Gerenderte Angular-Testkomponente mit realem Template.
  let trigger: HTMLButtonElement;                                  // Externer Button als ursprüngliches Fokusziel.
  const visible = signal(false);                                   // Vom Service bereitgestellter Sichtbarkeitszustand des Platin-Dialogs.

  /** Öffnet den Dialog über seinen Service-Zustand und wartet auf den initialen Fokus. */
  function openModal(): HTMLElement {
    trigger.focus();
    visible.set(true);
    fixture.detectChanges();
    vi.advanceTimersByTime(20);
    return fixture.nativeElement.querySelector('[role="dialog"]');
  }

  beforeEach(/** Bereitet isolierte Komponenten-, Browser- und Service-Zustände vor. */ () => {
    vi.useFakeTimers();
    visible.set(false);
    TestBed.configureTestingModule({ providers: [
      { provide: LanguageService, useValue: { language: /** Liefert die deutsche Testsprache. */ () => 'de' } },
      { provide: AchievementService, useValue: { isPlatinumModalVisible: visible, dismissPlatinumModal: vi.fn(/** Schließt den Dialog über seinen Service-Zustand. */ () => visible.set(false)) } },
      { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } },
    ] });
    trigger = document.createElement('button');
    document.body.appendChild(trigger);
    fixture = TestBed.createComponent(PlatinumCompletionModalComponent);
    fixture.detectChanges();
  });

  afterEach(/** Entfernt Testkomponenten, Browser-Stubs und ausstehende Timer. */ () => {
    TestBed.resetTestingModule();
    trigger.remove();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('setzt den Fokus in den Dialog und hält Tab sowie Shift-Tab innerhalb seiner Buttons', /** Setzt den Fokus in den Dialog und hält Tab sowie Shift-Tab innerhalb seiner Buttons. */ () => {

    const panel = openModal();                                    // Gerendertes Dialogfenster des geöffneten Panels.
    const buttons = Array.from(panel.querySelectorAll('button')); // Bedienbare Buttons innerhalb des Dialogfensters.
    const first = buttons[0];                                     // Erstes Bedienelement der Fokusreihenfolge.
    const last = buttons[buttons.length - 1];                     // Letztes Bedienelement der Fokusreihenfolge.

    expect(document.activeElement).toBe(first);
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));
    expect(document.activeElement).toBe(last);
    last.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(first);
  });

  it('schließt mit Escape und stellt den Fokus auf den ursprünglichen Auslöser zurück', /** Schließt mit Escape und stellt den Fokus auf den ursprünglichen Auslöser zurück. */ () => {

    const panel = openModal(); // Gerendertes Dialogfenster des geöffneten Panels.

    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    vi.advanceTimersByTime(20);
    expect(visible()).toBe(false);
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('schließt vor der Navigation zu den Case Studies den Dialog', /** Schließt vor der Navigation zu den Case Studies den Dialog. */ async () => {
    openModal();
    await fixture.componentInstance.openCaseStudies();
    expect(visible()).toBe(false);
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledExactlyOnceWith(['/portfolio']);
  });
});
