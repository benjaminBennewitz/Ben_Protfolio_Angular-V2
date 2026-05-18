/* src/app/core/services/system-toast.service.ts */

/**
 * @file System-Toast-Service.
 * @description Verwaltet kurze technische UI-Hinweise ohne externe Abhängigkeiten.
 */

import { computed, Injectable, signal } from '@angular/core';

/** Visuelle Kategorie eines System-Toasts. */
export type SystemToastTone = 'system' | 'success' | 'privacy' | 'accessibility';

/** Daten für einen neuen System-Toast. */
export interface SystemToastRequest {
  /** Material-Symbol des Toasts. */
  readonly icon: string;
  /** Kurzer Titel des Toasts. */
  readonly title: string;
  /** Kurze Detailmeldung des Toasts. */
  readonly message: string;
  /** Visuelle Kategorie des Toasts. */
  readonly tone?: SystemToastTone;
  /** Optionale feste Anzeigedauer in Millisekunden. */
  readonly durationMs?: number;
}

/** Sichtbarer System-Toast mit Laufzeitdaten. */
export interface SystemToast extends Required<Omit<SystemToastRequest, 'durationMs'>> {
  /** Eindeutige ID für Angular-Rendering und Dismiss. */
  readonly id: number;
  /** Berechnete Anzeigedauer in Millisekunden. */
  readonly durationMs: number;
}

/** Verwaltet System-Hinweise als kurze, nacheinander angezeigte Toasts. */
@Injectable({ providedIn: 'root' })
export class SystemToastService {
  /** Interner ID-Zähler für neue Toasts. */
  private nextToastId = 1;

  /** Warteschlange für Hinweise, wenn bereits ein Toast sichtbar ist. */
  private readonly queue: SystemToast[] = [];

  /** Aktuell sichtbarer Toast. */
  private readonly activeToastSignal = signal<SystemToast | null>(null);

  /** Timeout-ID für das automatische Schließen. */
  private activeTimeoutId: number | null = null;

  /** Aktuell sichtbarer Toast als read-only Signal. */
  readonly activeToast = computed<SystemToast | null>(() => this.activeToastSignal());

  /** Zeigt einen neuen Systemhinweis an. */
  show(request: SystemToastRequest): void {
    const toast = this.createToast(request);

    if (!this.activeToastSignal()) {
      this.showToast(toast);
      return;
    }

    this.queue.push(toast);
  }

  /** Schließt den aktiven Toast manuell. */
  dismissActiveToast(): void {
    if (this.activeTimeoutId !== null) {
      window.clearTimeout(this.activeTimeoutId);
      this.activeTimeoutId = null;
    }

    this.activeToastSignal.set(null);
    window.setTimeout(() => this.showNextToast(), 140);
  }

  /** Erzeugt einen vollständigen Toast aus den gewünschten Daten. */
  private createToast(request: SystemToastRequest): SystemToast {
    const durationMs = request.durationMs ?? this.calculateDuration(request.message);

    return {
      id: this.nextToastId++,
      icon: request.icon,
      title: request.title,
      message: request.message,
      tone: request.tone ?? 'system',
      durationMs,
    };
  }

  /** Berechnet eine lesbare Laufzeit zwischen drei und sechs Sekunden. */
  private calculateDuration(message: string): number {
    return Math.min(6000, Math.max(3000, 2600 + message.length * 42));
  }

  /** Zeigt einen vorbereiteten Toast und startet seinen Timeout. */
  private showToast(toast: SystemToast): void {
    this.activeToastSignal.set(toast);
    this.activeTimeoutId = window.setTimeout(() => this.dismissActiveToast(), toast.durationMs);
  }

  /** Zeigt den nächsten wartenden Toast. */
  private showNextToast(): void {
    if (this.activeToastSignal() || this.queue.length === 0) {
      return;
    }

    const nextToast = this.queue.shift();

    if (nextToast) {
      this.showToast(nextToast);
    }
  }
}
