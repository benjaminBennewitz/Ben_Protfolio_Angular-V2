/* src/app/shared/reveal-text/reveal-text.component.spec.ts */

import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RevealObserverService } from '../../core/services/reveal-observer.service';
import { RevealTextComponent } from './reveal-text.component';

afterEach(() => TestBed.resetTestingModule());

describe('RevealTextComponent', () => {
  it('behält Wortdaten bei normalen Updates bei und erneuert sie beim Sprachwechsel ohne zusätzliche Wort-Delays', () => {
    let reveal: (instant: boolean) => void = () => undefined;
    const cancel = vi.fn();
    TestBed.configureTestingModule({
      imports: [RevealTextComponent],
      providers: [{ provide: RevealObserverService, useValue: {
        observe: (_element: HTMLElement, callback: (instant: boolean) => void) => { reveal = callback; return cancel; },
      } }],
    });
    const fixture = TestBed.createComponent(RevealTextComponent);
    fixture.componentRef.setInput('text', 'Hallo Welt<br>Hallo');
    fixture.detectChanges();
    const words = fixture.componentInstance.wordLines;
    expect(words.map((line) => line.map((word) => word.text))).toEqual([['Hallo', 'Welt'], ['Hallo']]);
    fixture.detectChanges();
    expect(fixture.componentInstance.wordLines).toBe(words);
    const spans = fixture.nativeElement.querySelectorAll('.reveal__word') as NodeListOf<HTMLElement>;
    expect(spans[1].style.getPropertyValue('--delay')).toBe('');
    reveal(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.reveal--visible.reveal--instant')).not.toBeNull();
    fixture.componentRef.setInput('text', 'Hello world');
    fixture.detectChanges();
    expect(fixture.componentInstance.wordLines[0].map((word) => word.text)).toEqual(['Hello', 'world']);
    expect(fixture.nativeElement.querySelector('.reveal--visible.reveal--instant')).not.toBeNull();
    fixture.destroy();
    expect(cancel).toHaveBeenCalledOnce();
  });
});
