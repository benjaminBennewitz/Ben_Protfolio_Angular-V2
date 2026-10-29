/* src/app/layout/loader/loader.component.spec.ts */

import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import type { LoaderComponent } from './loader.component';

/** Prüft Boot-Phasen, manuelle Freigabe, ruhigen Start und Timer-Cleanup. */
describe('LoaderComponent', /** Gruppiert die Verhaltensprüfungen der Layout-Komponente. */ () => {

  let fixture: ComponentFixture<LoaderComponent>; // Gerenderte Angular-Testkomponente mit realem Template.
  let component: LoaderComponent;                 // Zu prüfende Komponenteninstanz.
  let shell: Mock<() => void>;                    // Erfasst Freigaben der nicht kritischen App-Shell.
  let human: Mock<() => void>;                    // Erfasst manuelle Loader-Bestätigungen.

  /** Importiert die Bootsequenz mit frischem modulweitem Runtime-Fallback. */
  async function createLoader(): Promise<void> {

    const module = await import('./loader.component'); // Frisch importierte Bootsequenz mit eigenem Runtime-Zustand.

    fixture = TestBed.createComponent(module.LoaderComponent);
    component = fixture.componentInstance;
    shell = vi.fn();
    human = vi.fn();
    component.shellRequested.subscribe(shell);
    component.humanConfirmed.subscribe(human);
    fixture.detectChanges();
  }

  beforeEach(/** Bereitet isolierte Komponenten-, Browser- und Service-Zustände vor. */ () => {
    vi.resetModules();
    vi.useFakeTimers();
    localStorage.clear();
    sessionStorage.clear();
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
  });

  afterEach(/** Entfernt Testkomponenten, Browser-Stubs und ausstehende Timer. */ () => {
    TestBed.resetTestingModule();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    localStorage.clear();
    sessionStorage.clear();
    document.documentElement.classList.remove('bp-loader-active');
  });

  it('durchläuft Boot, Storm und Ready und gibt erst nach manueller Bestätigung frei', /** Durchläuft Boot, Storm und Ready und gibt erst nach manueller Bestätigung frei. */ async () => {
    await createLoader();
    expect(component.phase()).toBe('boot');
    component.dismiss();
    expect(human).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1900);
    expect(component.phase()).toBe('storm');
    vi.advanceTimersByTime(6 * 620 + 900);
    expect(component.phase()).toBe('ready');
    expect(component.percent()).toBe(100);
    expect(shell).not.toHaveBeenCalled();
    component.dismiss();
    component.dismiss();
    expect(human).toHaveBeenCalledTimes(1);
    expect(shell).toHaveBeenCalledTimes(1);
    expect(component.visible()).toBe(true);
    vi.advanceTimersByTime(1450 + 560);
    expect(component.visible()).toBe(false);
    expect(document.documentElement.classList.contains('bp-loader-active')).toBe(false);
  });

  it('überspringt die Sequenz ohne manuelle Trophäen-Bestätigung', /** Überspringt die Sequenz ohne manuelle Trophäen-Bestätigung. */ async () => {
    await createLoader();
    component.skip();
    component.skip();
    expect(shell).toHaveBeenCalledTimes(1);
    expect(human).not.toHaveBeenCalled();
    vi.advanceTimersByTime(3000);
    expect(component.visible()).toBe(false);
    expect(component.openDialogCount()).toBe(6);
  });

  it('wählt bei reduzierter Bewegung den ruhigen Fortschritt mit automatischer Freigabe', /** Wählt bei reduzierter Bewegung den ruhigen Fortschritt mit automatischer Freigabe. */ async () => {
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation(/** Simuliert ausschließlich die reduzierte Systemeinstellung. */ (query: string) => ({ matches: query.includes('prefers-reduced-motion') })));
    await createLoader();
    expect(component.useCalmLoader()).toBe(true);
    component.skip();
    vi.advanceTimersByTime(1600);
    expect(component.percent()).toBeGreaterThan(0);
    expect(component.percent()).toBeLessThan(100);
    expect(shell).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1900);
    expect(shell).toHaveBeenCalledTimes(1);
    expect(human).not.toHaveBeenCalled();
    expect(component.visible()).toBe(false);
  });

  it('gibt bei bereits gespielter Session sofort frei und startet keine Animation', /** Gibt bei bereits gespielter Session sofort frei und startet keine Animation. */ async () => {
    sessionStorage.setItem('bp.boot-sequence.played.v2', '1');
    await createLoader();
    expect(component.visible()).toBe(false);
    expect(shell).toHaveBeenCalledTimes(1);
    expect(human).not.toHaveBeenCalled();
    vi.advanceTimersByTime(10000);
    expect(shell).toHaveBeenCalledTimes(1);
  });

  it('verhindert bei gesperrtem Speicher den zweiten Start über den Runtime-Fallback', /** Verhindert bei gesperrtem Speicher den zweiten Start über den Runtime-Fallback. */ async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(/** Simuliert nicht verfügbaren Browser-Speicher. */ () => { throw new Error('blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(/** Simuliert nicht verfügbaren Browser-Speicher. */ () => { throw new Error('blocked'); });
    await createLoader();
    expect(component.visible()).toBe(true);
    fixture.destroy();
    await createLoader();
    expect(component.visible()).toBe(false);
    expect(shell).toHaveBeenCalledTimes(1);
  });

  it('beendet beim Zerstören ausstehende Boot-Timer und entfernt die globale Sperrklasse', /** Beendet beim Zerstören ausstehende Boot-Timer und entfernt die globale Sperrklasse. */ async () => {
    await createLoader();
    fixture.destroy();
    vi.advanceTimersByTime(10000);
    expect(shell).not.toHaveBeenCalled();
    expect(human).not.toHaveBeenCalled();
    expect(document.documentElement.classList.contains('bp-loader-active')).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
});
