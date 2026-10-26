/* src/app/core/services/route-scroll.service.spec.ts */

import { TestBed } from '@angular/core/testing';
import { NavigationCancel, NavigationCancellationCode, NavigationEnd, NavigationStart, Router, Scroll } from '@angular/router';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RouteScrollService } from './route-scroll.service';

/** Prüft die Reihenfolge vor View-Wechsel und Router-Scroll sowie überholte Freigaben. */
describe('RouteScrollService', () => {
  let events: Subject<unknown>;
  let frames: Map<number, FrameRequestCallback>;
  let nextFrame: number;
  let scroll: ReturnType<typeof vi.spyOn>;
  const locked = () => document.documentElement.classList.contains('bp-route-scroll-reset');
  const flush = () => {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((callback) => callback(0));
  };

  beforeEach(() => {
    events = new Subject();
    frames = new Map();
    nextFrame = 0;
    scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.set(++nextFrame, callback);
      return nextFrame;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => { frames.delete(id); });
    TestBed.configureTestingModule({ providers: [{ provide: Router, useValue: {
      url: '/', events,
      parseUrl: (url: string) => ({ path: url.split(/[?#]/)[0], queryParams: {}, fragment: null }),
      serializeUrl: (tree: { path: string }) => tree.path,
    } }] });
    TestBed.inject(RouteScrollService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
    document.documentElement.classList.remove('bp-route-scroll-reset');
  });

  it('setzt vor dem View-Wechsel sofort zurück und wartet mit Reveals auf den Router-Scroll', () => {
    const ready = vi.fn();
    document.addEventListener('bp:route-scroll-ready', ready);
    events.next(new NavigationStart(1, '/portfolio'));
    expect(locked()).toBe(true);
    expect(scroll).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' });
    const end = new NavigationEnd(1, '/portfolio', '/portfolio');
    events.next(end);
    flush();
    expect(locked()).toBe(true);
    events.next(new Scroll(end, null, null));
    flush();
    expect(locked()).toBe(true);
    flush();
    expect(locked()).toBe(false);
    expect(ready).toHaveBeenCalledOnce();
    document.removeEventListener('bp:route-scroll-ready', ready);
  });

  it('verändert reine Anker- und Query-Wechsel nicht', () => {
    events.next(new NavigationStart(1, '/?language=en#about'));
    expect(locked()).toBe(false);
    expect(scroll).not.toHaveBeenCalled();
  });

  it('verwirft alte Layout-Freigaben bei schneller Folgenavigation', () => {
    const end = new NavigationEnd(1, '/portfolio', '/portfolio');
    events.next(new NavigationStart(1, '/portfolio'));
    events.next(end);
    events.next(new Scroll(end, null, null));
    flush();
    events.next(new NavigationStart(2, '/snippets'));
    flush();
    expect(locked()).toBe(true);
    events.next(new Scroll(end, null, null));
    flush();
    expect(locked()).toBe(true);
    events.next(new NavigationCancel(2, '/snippets', 'Abbruch', NavigationCancellationCode.GuardRejected));
    expect(locked()).toBe(false);
    expect(frames.size).toBe(0);
  });
});
