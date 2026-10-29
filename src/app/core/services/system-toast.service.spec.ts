/* src/app/core/services/system-toast.service.spec.ts */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SystemToastService } from './system-toast.service';

/** Prüft FIFO-Reihenfolge, Lesedauer und manuelles Schließen ohne alte Timer. */
describe('SystemToastService', /** Gruppiert die Verhaltensprüfungen des Services. */() => {
  beforeEach(/** Bereitet isolierte Browser- und Testzustände vor. */() => { vi.useFakeTimers(); });
  afterEach(/** Entfernt Testzustände, Timer und ersetzte Browser-APIs. */() => { vi.clearAllTimers(); vi.useRealTimers(); });

  it('begrenzt berechnete Laufzeiten und respektiert eine explizite Vorgabe', /** Begrenzt berechnete Laufzeiten und respektiert eine explizite Vorgabe. */() => {

    const service = new SystemToastService(); // Zu prüfender Service mit isoliertem Testzustand.

    service.show({ icon: 'info', title: 'Kurz', message: 'Hi' });
    expect(service.activeToast()?.durationMs).toBe(3000);
    expect(service.activeToast()?.tone).toBe('system');
    service.dismissActiveToast();
    service.show({ icon: 'info', title: 'Lang', message: 'x'.repeat(200) });
    expect(service.activeToast()?.durationMs).toBe(6000);
    service.dismissActiveToast();
    service.show({ icon: 'done', title: 'Fest', message: 'OK', tone: 'success', durationMs: 500 });
    expect(service.activeToast()?.durationMs).toBe(500);
    expect(service.activeToast()?.tone).toBe('success');
  });

  it('zeigt wartende Hinweise in Reihenfolge mit einer Ausblendpause', /** Zeigt wartende Hinweise in Reihenfolge mit einer Ausblendpause. */() => {

    const service = new SystemToastService(); // Zu prüfender Service mit isoliertem Testzustand.

    service.show({ icon: 'info', title: 'A', message: 'A', durationMs: 1000 });
    service.show({ icon: 'info', title: 'B', message: 'B', durationMs: 2000 });
    expect(service.activeToast()?.title).toBe('A');
    vi.advanceTimersByTime(1000);
    expect(service.activeToast()).toBeNull();
    vi.advanceTimersByTime(139);
    expect(service.activeToast()).toBeNull();
    vi.advanceTimersByTime(1);
    expect(service.activeToast()?.title).toBe('B');
    expect(service.activeToast()?.id).toBe(2);
    vi.advanceTimersByTime(2000);
    expect(service.activeToast()).toBeNull();
  });

  it('verwirft beim manuellen Schließen den alten Auto-Dismiss-Timer', /** Verwirft beim manuellen Schließen den alten Auto-Dismiss-Timer. */() => {

    const service = new SystemToastService(); // Zu prüfender Service mit isoliertem Testzustand.

    service.show({ icon: 'info', title: 'A', message: 'A', durationMs: 1000 });
    service.show({ icon: 'info', title: 'B', message: 'B', durationMs: 2000 });
    vi.advanceTimersByTime(100);
    service.dismissActiveToast();
    vi.advanceTimersByTime(140);
    expect(service.activeToast()?.title).toBe('B');
    vi.advanceTimersByTime(760);
    expect(service.activeToast()?.title).toBe('B');
  });
});
