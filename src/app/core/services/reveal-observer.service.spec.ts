/* src/app/core/services/reveal-observer.service.spec.ts */

import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AccessibilityPreferenceService } from './accessibility-preference.service';
import { RevealObserverService } from './reveal-observer.service';

/** Prüft tatsächliche Scroll-/Layoutübergänge mit kontrollierten Browser-Frames. */
describe('RevealObserverService', () => {
  let service: RevealObserverService;
  let frames: Map<number, FrameRequestCallback>;
  let frameId: number;
  let intersectionCallback: () => void;
  let resizeCallback: () => void;
  let observerCount: number;
  let disconnect: ReturnType<typeof vi.fn>;
  const reduced = signal(false);
  const simple = signal(false);

  /** Führt alle im letzten Ereignis gebündelten Frames genau einmal aus. */
  function flushFrame(): void {
    const callbacks = [...frames.values()];
    frames.clear();
    for (const callback of callbacks) callback(0);
  }

  /** Erstellt ein Element mit dynamisch kontrollierbarer Layoutposition. */
  function target(initialTop: number, parent: HTMLElement = document.body): {
    element: HTMLElement;
    move: (top: number) => void;
    measure: ReturnType<typeof vi.spyOn>;
  } {
    let top = initialTop;
    const element = document.createElement('div');
    parent.append(element);
    const measure = vi.spyOn(element, 'getBoundingClientRect').mockImplementation(() => new DOMRect(0, top, 400, 160));
    return { element, move: (value) => { top = value; }, measure };
  }

  beforeEach(() => {
    document.body.replaceChildren();
    frames = new Map();
    frameId = 0;
    observerCount = 0;
    reduced.set(false);
    simple.set(false);
    disconnect = vi.fn();
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1000);
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.set(++frameId, callback);
      return frameId;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => { frames.delete(id); });
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: () => void) { intersectionCallback = callback; observerCount++; }
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = disconnect;
    });
    vi.stubGlobal('ResizeObserver', class {
      constructor(callback: () => void) { resizeCallback = callback; }
      observe = vi.fn();
      disconnect = vi.fn();
    });
    TestBed.configureTestingModule({
      providers: [{ provide: AccessibilityPreferenceService, useValue: { reducesMotion: reduced, usesSimpleMode: simple } }],
    });
    service = TestBed.inject(RevealObserverService);
    TestBed.tick();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.body.replaceChildren();
  });

  it('misst neue Routen erst nach dem sofortigen Scroll-Reset', () => {
    document.documentElement.classList.add('bp-route-scroll-reset');
    const item = target(-400);
    const reveal = vi.fn();
    service.observe(item.element, reveal);
    flushFrame();
    expect(item.measure).not.toHaveBeenCalled();
    expect(reveal).not.toHaveBeenCalled();
    item.move(250);
    document.documentElement.classList.remove('bp-route-scroll-reset');
    document.dispatchEvent(new Event('bp:route-scroll-ready'));
    flushFrame();
    expect(reveal).toHaveBeenCalledWith(false);
  });

  it('wartet während eines Scroll-/Snap-Vorgangs auch bei Observer-Ereignissen mit dem Reveal', () => {
    const item = target(1600);
    const reveal = vi.fn();
    service.observe(item.element, reveal);
    flushFrame();
    expect(reveal).not.toHaveBeenCalled();
    item.move(400);
    for (let i = 0; i < 8; i++) window.dispatchEvent(new Event('scroll'));
    intersectionCallback();
    flushFrame();
    expect(reveal).not.toHaveBeenCalled();
    window.dispatchEvent(new Event('scrollend'));
    flushFrame();
    expect(reveal).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('gibt übersprungene Ziele auch ohne Intersection-Ereignis frei und spielt nicht erneut ab', () => {
    const item = target(2500);
    const reveal = vi.fn();
    service.observe(item.element, reveal);
    flushFrame();
    item.move(-1400);
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scrollend'));
    flushFrame();
    item.move(450);
    window.dispatchEvent(new Event('scroll'));
    flushFrame();
    expect(reveal).toHaveBeenCalledExactlyOnceWith(true);
    expect(frames.size).toBe(0);
  });

  it('erfasst beim Nachladen bereits überscrollte Inhalte sowie spätere Layoutänderungen', () => {
    const late = target(-300);
    const lateReveal = vi.fn();
    service.observe(late.element, lateReveal);
    flushFrame();
    expect(lateReveal).toHaveBeenCalledOnce();
    const shifted = target(1800);
    const shiftedReveal = vi.fn();
    service.observe(shifted.element, shiftedReveal);
    flushFrame();
    shifted.move(450);
    resizeCallback();
    flushFrame();
    expect(shiftedReveal).toHaveBeenCalledOnce();
  });

  it('misst zuerst alle Ziele und schreibt danach; alle Ziele teilen sich einen Observer', () => {
    const order: string[] = [];
    const first = target(500);
    const second = target(600);
    first.measure.mockImplementation(() => { order.push('read-first'); return new DOMRect(0, 500, 400, 160); });
    second.measure.mockImplementation(() => { order.push('read-second'); return new DOMRect(0, 600, 400, 160); });
    service.observe(first.element, () => { order.push('write-first'); });
    service.observe(second.element, () => { order.push('write-second'); });
    expect(observerCount).toBe(1);
    flushFrame();
    expect(order).toEqual(['read-first', 'read-second', 'write-first', 'write-second']);
  });

  it('liest keine Kinder weit unterhalb des Viewports und prüft ihre Section nur einmal', () => {
    const section = document.createElement('section');
    document.body.append(section);
    const rect = vi.spyOn(section, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 3000, 900, 1000));
    const first = target(3100, section);
    const second = target(3300, section);
    service.observe(first.element, vi.fn());
    service.observe(second.element, vi.fn());
    flushFrame();
    expect(rect).toHaveBeenCalledOnce();
    expect(first.measure).not.toHaveBeenCalled();
    expect(second.measure).not.toHaveBeenCalled();
  });

  it('gibt überscrollte Sections ohne Layoutmessungen ihrer Kinder frei', () => {
    const section = document.createElement('section');
    document.body.append(section);
    vi.spyOn(section, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, -1500, 900, 1000));
    const item = target(-1200, section);
    const reveal = vi.fn();
    service.observe(item.element, reveal);
    flushFrame();
    expect(reveal).toHaveBeenCalledOnce();
    expect(item.measure).not.toHaveBeenCalled();
  });

  it('funktioniert ohne IntersectionObserver und räumt vor einem Routenwechsel vollständig auf', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const item = target(1700);
    const reveal = vi.fn();
    const cancel = service.observe(item.element, reveal);
    cancel();
    item.move(100);
    window.dispatchEvent(new Event('scroll'));
    flushFrame();
    expect(reveal).not.toHaveBeenCalled();
    expect(frames.size).toBe(0);
  });

  it('teilt die Messung zwischen mehreren Nutzern desselben Elements und gibt alle frei', () => {
    const item = target(600);
    const elementReveal = vi.fn();
    const skillReveal = vi.fn();
    service.observe(item.element, elementReveal);
    service.observe(item.element, skillReveal);
    flushFrame();
    expect(item.measure).toHaveBeenCalledOnce();
    expect(elementReveal).toHaveBeenCalledOnce();
    expect(skillReveal).toHaveBeenCalledOnce();
  });

  it('behält die Beobachtung eines Elements bei, wenn nur einer seiner Nutzer entfernt wird', () => {
    const item = target(1500);
    const removed = vi.fn();
    const remaining = vi.fn();
    const cancel = service.observe(item.element, removed);
    service.observe(item.element, remaining);
    cancel();
    item.move(600);
    flushFrame();
    expect(removed).not.toHaveBeenCalled();
    expect(remaining).toHaveBeenCalledOnce();
  });

  it('verbraucht Reveals nicht, während eine Snap-Section erst in den Viewport einläuft', () => {
    let top = 400;
    const section = document.createElement('section');
    document.body.append(section);
    vi.spyOn(section, 'getBoundingClientRect').mockImplementation(() => new DOMRect(0, top, 900, 1000));
    const item = target(500, section);
    const reveal = vi.fn();
    service.observe(item.element, reveal);
    flushFrame();
    expect(reveal).not.toHaveBeenCalled();
    top = 0;
    item.move(100);
    window.dispatchEvent(new Event('scroll'));
    intersectionCallback();
    flushFrame();
    expect(reveal).not.toHaveBeenCalled();
    window.dispatchEvent(new Event('scrollend'));
    flushFrame();
    expect(reveal).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('zeigt sichtbare Inhalte einer verpassten Snap-Position direkt statt mit Nachanimation', () => {
    const section = document.createElement('section');
    document.body.append(section);
    vi.spyOn(section, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, -200, 900, 1000));
    const item = target(400, section);
    const reveal = vi.fn();
    service.observe(item.element, reveal);
    flushFrame();
    expect(reveal).toHaveBeenCalledExactlyOnceWith(true);
  });

  it('hat bei fehlendem scrollend einen gemeinsamen Scrollruhe-Fallback', async () => {
    const item = target(1500);
    const reveal = vi.fn();
    service.observe(item.element, reveal);
    flushFrame();
    item.move(300);
    window.dispatchEvent(new Event('scroll'));
    flushFrame();
    expect(reveal).not.toHaveBeenCalled();
    await new Promise((resolve) => window.setTimeout(resolve, 120));
    flushFrame();
    expect(reveal).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('gibt bei einem Motion-Wechsel alle wartenden Inhalte frei, ohne sie später erneut zu verstecken', () => {
    const item = target(1700);
    const reveal = vi.fn();
    service.observe(item.element, reveal);
    flushFrame();
    reduced.set(true);
    TestBed.tick();
    expect(reveal).toHaveBeenCalledOnce();
    reduced.set(false);
    TestBed.tick();
    intersectionCallback();
    window.dispatchEvent(new Event('scroll'));
    flushFrame();
    expect(reveal).toHaveBeenCalledOnce();
    expect(disconnect).toHaveBeenCalled();
  });
});
