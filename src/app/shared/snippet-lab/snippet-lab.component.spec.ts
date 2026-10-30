import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { signal } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageService } from '../../core/services/language.service';
import { SnippetLabComponent } from './snippet-lab.component';

/** Prüft interaktive Vorschauen mit echtem Template und nativen Eingabe-Events. */
describe('SnippetLabComponent', () => {
  let fixture: ComponentFixture<SnippetLabComponent>;
  const language = signal<'de' | 'en'>('de');

  beforeEach(() => {
    language.set('de');
    TestBed.configureTestingModule({ providers: [{ provide: LanguageService, useValue: { language } }] });
    fixture = TestBed.createComponent(SnippetLabComponent);
  });
  afterEach(() => { TestBed.resetTestingModule(); vi.restoreAllMocks(); });

  it('verbindet native Regler, Pfad und Kontrollpunkt ohne Mausbedienung', () => {
    fixture.componentRef.setInput('kind', 'svg');
    fixture.detectChanges();
    const sliders = fixture.nativeElement.querySelectorAll('input');
    sliders[1].value = '110';
    sliders[1].dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.componentInstance.path()).toBe('M 25 140 C 80 110, 220 20, 275 140');
    expect(fixture.nativeElement.querySelector('.curve__path').getAttribute('d')).toContain('80 110');
    expect(fixture.nativeElement.querySelector('.curve__handle').getAttribute('cy')).toBe('110');
  });

  it('begrenzt gezogene Kontrollpunkte und beendet die Bewegung zuverlässig', () => {
    fixture.componentRef.setInput('kind', 'svg');
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg');
    const handle = fixture.nativeElement.querySelector('.curve__handle');
    handle.setPointerCapture = vi.fn();
    vi.spyOn(svg, 'getBoundingClientRect').mockReturnValue({ left: 10, top: 20, width: 300, height: 180 } as DOMRect);
    fixture.componentInstance.startPointDrag(1, { preventDefault: vi.fn(), currentTarget: handle, pointerId: 2 } as unknown as PointerEvent);
    const move = { currentTarget: svg, clientX: 900, clientY: -50 } as unknown as PointerEvent;
    fixture.componentInstance.movePoint(move);
    expect(fixture.componentInstance.curve()).toMatchObject({ x1: 300, y1: 0 });
    fixture.componentInstance.stopPointDrag();
    fixture.componentInstance.movePoint({ ...move, clientX: 60 } as unknown as PointerEvent);
    expect(fixture.componentInstance.curve().x1).toBe(300);
  });

  it('wechselt das Vorschau-Theme und erhält Eingaben und Fehlerbeschriftungen', () => {
    fixture.componentRef.setInput('kind', 'tokens');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    input.value = 'B²';
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.theme-card').dataset.theme).toBe('light');
    expect(fixture.nativeElement.querySelector('button').getAttribute('aria-pressed')).toBe('true');
    expect(input.value).toBe('B²');
    const errorInput = fixture.nativeElement.querySelector('[aria-invalid]');
    expect(fixture.nativeElement.querySelector('#' + errorInput.getAttribute('aria-describedby')).textContent).toContain('Fehler');
    expect(fixture.nativeElement.querySelector('button:disabled')).not.toBeNull();
  });

  it('verändert beide Kartencontainer bei unverändertem Viewport', () => {
    fixture.componentRef.setInput('kind', 'container');
    fixture.detectChanges();
    const slider = fixture.nativeElement.querySelector('input');
    slider.value = '40';
    slider.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const containers = fixture.nativeElement.querySelectorAll('.card-space');
    expect(Array.from(containers, (element: unknown) => (element as HTMLElement).style.width)).toEqual(['40%', '40%']);
    expect(fixture.nativeElement.querySelectorAll('.card-space--query')).toHaveLength(1);
  });

  it('übersetzt Texte reaktiv, ohne den Demo-Zustand zurückzusetzen', () => {
    fixture.componentRef.setInput('kind', 'tokens');
    fixture.detectChanges();
    fixture.componentInstance.theme.set('light');
    language.set('en');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('One component. Two themes.');
    expect(fixture.componentInstance.theme()).toBe('light');
  });
});
