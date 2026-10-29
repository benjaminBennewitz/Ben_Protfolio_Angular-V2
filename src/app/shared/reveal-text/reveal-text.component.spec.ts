/* src/app/shared/reveal-text/reveal-text.component.spec.ts */

import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RevealObserverService } from '../../core/services/reveal-observer.service';
import { RevealTextComponent } from './reveal-text.component';

afterEach(/** Entfernt Testkomponenten und stellt den Browserzustand wieder her. */() => TestBed.resetTestingModule());

describe('RevealTextComponent', /** Gruppiert die Verhaltensprüfungen der Shared-Komponente oder Direktive. */() => {

  it('behält Wortdaten bei normalen Updates bei und erneuert sie beim Sprachwechsel ohne zusätzliche Wort-Delays', /** Behält Wortdaten bei normalen Updates bei und erneuert sie beim Sprachwechsel ohne zusätzliche Wort-Delays. */() => {

    let reveal: (instant: boolean) => void = /** Stellt den für den Test benötigten Zustand bereit. */ () => undefined; // Vom Observer registrierter Reveal-Callback.
    const cancel = vi.fn();                                                                                             // Erfasst abgebrochene Animationsframes.

    TestBed.configureTestingModule({
      imports: [RevealTextComponent],
      providers: [{
        provide: RevealObserverService, useValue: {
          observe: /** Stellt den für den Test benötigten Zustand bereit. */ (_element: HTMLElement, callback: (instant: boolean) => void) => { reveal = callback; return cancel; },
        }
      }],
    });

    const fixture = TestBed.createComponent(RevealTextComponent); // Angular-Testinstanz mit gerendertem Host.

    fixture.componentRef.setInput('text', 'Hallo Welt<br>Hallo');
    fixture.detectChanges();

    const words = fixture.componentInstance.wordLines; // Aufbereitete Wortgruppen mit fortlaufenden Animationsindizes.

    expect(words.map(/** Stellt den für den Test benötigten Zustand bereit. */(line) => line.map(/** Stellt den für den Test benötigten Zustand bereit. */(word) => word.text))).toEqual([['Hallo', 'Welt'], ['Hallo']]);
    fixture.detectChanges();
    expect(fixture.componentInstance.wordLines).toBe(words);

    const spans = fixture.nativeElement.querySelectorAll('.reveal__word') as NodeListOf<HTMLElement>; // Gerenderte Wortelemente für die Staffelungsprüfung.

    expect(spans[1].style.getPropertyValue('--delay')).toBe('');
    reveal(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.reveal--visible.reveal--instant')).not.toBeNull();
    fixture.componentRef.setInput('text', 'Hello world');
    fixture.detectChanges();
    expect(fixture.componentInstance.wordLines[0].map(/** Stellt den für den Test benötigten Zustand bereit. */(word) => word.text)).toEqual(['Hello', 'world']);
    expect(fixture.nativeElement.querySelector('.reveal--visible.reveal--instant')).not.toBeNull();
    fixture.destroy();
    expect(cancel).toHaveBeenCalledOnce();
  });
});
