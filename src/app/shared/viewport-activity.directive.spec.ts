/* src/app/shared/viewport-activity.directive.spec.ts */

import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ViewportActivityDirective } from './viewport-activity.directive';

@Component({ standalone: true, imports: [ViewportActivityDirective], template: '<div bpViewportActivity></div>' })
class ViewportHostComponent { }

describe('ViewportActivityDirective', /** Gruppiert die Verhaltensprüfungen der Shared-Komponente oder Direktive. */() => {

  afterEach(/** Entfernt Testkomponenten und stellt den Browserzustand wieder her. */() => { TestBed.resetTestingModule(); vi.unstubAllGlobals(); });

  it('pausiert unsichtbare Bereiche und entfernt Observer und Pausenklasse beim Zerstören', /** Pausiert unsichtbare Bereiche und entfernt Observer und Pausenklasse beim Zerstören. */() => {

    let notify!: IntersectionObserverCallback; // Erfasster Callback der Sichtbarkeitsbeobachtung.
    const observe = vi.fn();                   // Erfasst beobachtete DOM-Elemente.
    const disconnect = vi.fn();                // Erfasst das Beenden der Sichtbarkeitsbeobachtung.

    vi.stubGlobal('IntersectionObserver', class {
      /** Stellt den für den Test benötigten Zustand bereit. */ constructor(callback: IntersectionObserverCallback) { notify = callback; }
      observe = observe;       // Registriert das zu beobachtende Hostelement.
      disconnect = disconnect; // Beendet die simulierte Sichtbarkeitsbeobachtung.
    });

    const fixture = TestBed.createComponent(ViewportHostComponent);            // Angular-Testinstanz mit gerendertem Host.
    const element = fixture.nativeElement.querySelector('div') as HTMLElement; // Hostelement der getesteten Direktive.

    fixture.detectChanges();
    expect(observe).toHaveBeenCalledExactlyOnceWith(element);
    notify([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(element.classList.contains('bp-is-paused')).toBe(true);
    notify([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(element.classList.contains('bp-is-paused')).toBe(false);
    notify([], {} as IntersectionObserver);
    expect(element.classList.contains('bp-is-paused')).toBe(true);
    fixture.destroy();
    expect(disconnect).toHaveBeenCalledOnce();
    expect(element.classList.contains('bp-is-paused')).toBe(false);
  });
});
