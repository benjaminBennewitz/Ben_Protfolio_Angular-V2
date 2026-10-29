/* src/app/shared/reveal-on-scroll.directive.spec.ts */

import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RevealObserverService } from '../core/services/reveal-observer.service';
import { RevealOnScrollDirective } from './reveal-on-scroll.directive';

@Component({ standalone: true, imports: [RevealOnScrollDirective], template: '<div bpReveal></div>' })
class RevealHostComponent { }

describe('RevealOnScrollDirective', /** Gruppiert die Verhaltensprüfungen der Shared-Komponente oder Direktive. */() => {

  afterEach(/** Entfernt Testkomponenten und stellt den Browserzustand wieder her. */() => { TestBed.resetTestingModule(); });

  it('übernimmt den Reveal-Zustand und meldet das Element beim Zerstören ab', /** Übernimmt den Reveal-Zustand und meldet das Element beim Zerstören ab. */() => {

    let reveal!: (instant: boolean) => void;                                                                                                                                               // Vom Observer registrierter Reveal-Callback.
    const stop = vi.fn();                                                                                                                                                                  // Erfasst die Abmeldung beim Reveal-Service.
    const observe = vi.fn(/** Stellt den für den Test benötigten Zustand bereit. */(_element: HTMLElement, callback: (instant: boolean) => void) => { reveal = callback; return stop; }); // Erfasst beobachtete DOM-Elemente.

    TestBed.configureTestingModule({ providers: [{ provide: RevealObserverService, useValue: { observe } }] });

    const fixture = TestBed.createComponent(RevealHostComponent);              // Angular-Testinstanz mit gerendertem Host.
    const element = fixture.nativeElement.querySelector('div') as HTMLElement; // Hostelement der getesteten Direktive.

    fixture.detectChanges();
    expect(observe).toHaveBeenCalledExactlyOnceWith(element, expect.any(Function));
    expect(element.classList.contains('bp-reveal')).toBe(true);
    reveal(true);
    expect(element.classList.contains('bp-reveal--visible')).toBe(true);
    expect(element.classList.contains('bp-reveal--instant')).toBe(true);
    reveal(false);
    expect(element.classList.contains('bp-reveal--instant')).toBe(false);
    fixture.destroy();
    expect(stop).toHaveBeenCalledOnce();
  });
});
