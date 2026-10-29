/* src/app/shared/pixel-transition/pixel-transition.component.spec.ts */

import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PixelTransitionComponent } from './pixel-transition.component';

describe('PixelTransitionComponent', /** Gruppiert die Verhaltensprüfungen der Shared-Komponente oder Direktive. */() => {

  afterEach(/** Entfernt Testkomponenten und stellt den Browserzustand wieder her. */() => { TestBed.resetTestingModule(); vi.restoreAllMocks(); });

  it('erzeugt drei Raster und blendet eine Zelle innerhalb gültiger Deckkraft- und Skalierungsgrenzen aus', /** Erzeugt drei Raster und blendet eine Zelle innerhalb gültiger Deckkraft- und Skalierungsgrenzen aus. */() => {

    const component = TestBed.createComponent(PixelTransitionComponent).componentInstance; // Zu prüfende Komponenteninstanz.
    const cell = { threshold: 0, accent: false };                                          // Rasterzelle ohne zeitlichen Versatz.

    expect([component.coarseCells.length, component.mediumCells.length, component.fineCells.length]).toEqual([84, 240, 612]);
    expect(component.veilOpacity()).toBe(1);
    expect(component.coarseOpacity(cell)).toBe(1);
    expect(component.coarseScale(cell)).toBe(1);
    component.progress.set(1);
    expect(component.veilOpacity()).toBe(0);
    expect(component.coarseOpacity(cell)).toBe(0);
    expect(component.mediumOpacity(cell)).toBe(0);
    expect(component.fineOpacity(cell)).toBe(0);
    expect(component.coarseScale(cell)).toBeCloseTo(0.22);
    expect(component.mediumScale(cell)).toBeCloseTo(0.18);
    expect(component.fineScale(cell)).toBeCloseTo(0.12);
  });

  it('bündelt Scrollmessungen pro Frame und entfernt die Hilfsklasse und den geplanten Frame', /** Bündelt Scrollmessungen pro Frame und entfernt die Hilfsklasse und den geplanten Frame. */() => {

    const request = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(42); // Erfasst geplante Animationsframes.
    const cancel = vi.spyOn(window, 'cancelAnimationFrame');                       // Erfasst abgebrochene Animationsframes.
    const fixture = TestBed.createComponent(PixelTransitionComponent);             // Angular-Testinstanz mit gerendertem Host.
    const parent = fixture.nativeElement.parentElement as HTMLElement;             // Übergeordneter Abschnitt des Pixel-Reveals.

    fixture.detectChanges();
    expect(parent.classList.contains('bp-pixel-reveal-target')).toBe(true);
    fixture.componentInstance.onScroll();
    fixture.componentInstance.onResize();
    expect(request).toHaveBeenCalledOnce();
    fixture.destroy();
    expect(cancel).toHaveBeenCalledWith(42);
    expect(parent.classList.contains('bp-pixel-reveal-target')).toBe(false);
  });
});
