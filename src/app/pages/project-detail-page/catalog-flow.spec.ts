/* src/app/pages/project-detail-page/catalog-flow.spec.ts */

import { NgZone, signal } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PORTFOLIO_PROJECTS } from '../../core/data/portfolio-projects';
import { CatalogFlow } from './catalog-flow';

/** Prüft Sichtbarkeit, Reduced Motion und saubere Freigabe der Canvas-Ressourcen. */
describe('CatalogFlow', /** Gruppiert die Lebenszyklusprüfungen der Kataloganimation. */() => {

  let flow: CatalogFlow;                                                                                                               // Zu prüfende lokale Canvas-Steuerung.
  let visible!: IntersectionObserverCallback;                                                                                          // Vom Visibility-Observer registrierter Callback.
  const disconnectVisibility = vi.fn();                                                                                                // Erfasst die Freigabe des Visibility-Observers.
  const disconnectResize = vi.fn();                                                                                                    // Erfasst die Freigabe des Resize-Observers.
  const context = { setTransform: vi.fn(), fillRect: vi.fn(), beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn() }; // Canvas-Doppel mit überprüfbaren Zeichenaufrufen.
  let canvas: HTMLCanvasElement;                                                                                                       // Mit dem Flow verbundene Zeichenfläche.

  beforeEach(/** Bereitet isolierte Browser-Observer und einen Zeichenkontext ohne GPU vor. */() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    vi.stubGlobal('IntersectionObserver', class {
      /** Erfasst die vom Flow registrierte Sichtbarkeitsreaktion. */
      constructor(callback: IntersectionObserverCallback) { visible = callback; }
      observe = vi.fn();                 // Simuliert die Registrierung des Hero-Elements.
      disconnect = disconnectVisibility; // Erfasst die Abmeldung beim Verlassen der Seite.
    });
    vi.stubGlobal('ResizeObserver', class {
      observe = vi.fn();             // Simuliert die Größenbeobachtung des Canvas.
      disconnect = disconnectResize; // Erfasst das Beenden der Größenbeobachtung.
    });
    canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ width: 200, height: 120 } as DOMRect);
    flow = new CatalogFlow(signal(PORTFOLIO_PROJECTS.de.find(/** Wählt die Case Study mit Canvas-Hero. */ project => project.slug === 'grafikdesign-katalog')), new NgZone({ enableLongStackTrace: false }));
    flow.setCanvas(canvas);
  });

  afterEach(/** Beendet den Flow und stellt Browser- und Timerzustände wieder her. */() => {
    flow.destroy();
    delete document.documentElement.dataset['motion'];
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('zeichnet bei reduzierter Bewegung ein statisches Bild ohne Animationsloop', /** Prüft Reduced Motion ohne laufende Animation. */ async () => {
    document.documentElement.dataset['motion'] = 'reduced';
    visible([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    flow.toggleCatalogFlow();
    await Promise.resolve();
    expect(context.fillRect).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
    expect(flow.isCatalogFlowHeroVisible()).toBe(true);
  });

  it('stoppt den Zeichenloop und die Größenbeobachtung außerhalb des Viewports', /** Prüft die ressourcenschonende Pause einer unsichtbaren Hero-Fläche. */ async () => {
    vi.stubGlobal('matchMedia', /** Simuliert uneingeschränkte Bewegung. */() => ({ matches: false }));
    visible([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    flow.toggleCatalogFlow();
    await Promise.resolve();
    expect(vi.getTimerCount()).toBe(1);
    visible([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(vi.getTimerCount()).toBe(0);
    expect(disconnectResize).toHaveBeenCalled();
    expect(flow.isCatalogFlowHeroVisible()).toBe(false);
  });

  it('verhindert einen bereits eingeplanten Neustart nach dem Zerstören', /** Prüft die Freigabe auch zwischen Microtask-Planung und Zeichenstart. */ async () => {
    visible([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    flow.toggleCatalogFlow();
    flow.destroy();
    await Promise.resolve();
    expect(canvas.getContext).not.toHaveBeenCalled();
    expect(disconnectVisibility).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
