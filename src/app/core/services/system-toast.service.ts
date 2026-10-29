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
  readonly icon: string;           // Material-Symbol des Toasts.
  readonly title: string;          // Kurzer Titel des Toasts.
  readonly message: string;        // Kurze Detailmeldung des Toasts.
  readonly tone?: SystemToastTone; // Visuelle Kategorie des Toasts.
  readonly durationMs?: number;    // Optionale feste Anzeigedauer in Millisekunden.
}

/** Sichtbarer System-Toast mit Laufzeitdaten. */
export interface SystemToast extends Required<Omit<SystemToastRequest, 'durationMs'>> {
  readonly id: number;         // Eindeutige ID für Angular-Rendering und Dismiss.
  readonly durationMs: number; // Berechnete Anzeigedauer in Millisekunden.
}

/** Verwaltet System-Hinweise als kurze, nacheinander angezeigte Toasts. */
@Injectable({ providedIn: 'root' })
export class SystemToastService {
  private nextToastId = 1;                                               // Interner ID-Zähler für neue Toasts.
  private readonly queue: SystemToast[] = [];                            // Warteschlange für Hinweise, wenn bereits ein Toast sichtbar ist.
  private readonly activeToastSignal = signal<SystemToast | null>(null); // Aktuell sichtbarer Toast.
  private activeTimeoutId: number | null = null;                         // Timeout-ID für das automatische Schließen.
  readonly activeToast = computed<SystemToast | null>(                   // Aktuell sichtbarer Toast als read-only Signal.
    /** Aktuell sichtbarer Toast als read-only Signal. */
    () => this.activeToastSignal()
  );

  /** Zeigt einen neuen Systemhinweis an. */
  show(request: SystemToastRequest): void {

    const toast = this.createToast(request); // Vollständiger Toast mit ID, Kategorie und Laufzeit.

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
    window.setTimeout(/** Zeigt nach der Ausblendpause den nächsten wartenden Toast. */() => this.showNextToast(), 140);
  }

  /** Erzeugt einen vollständigen Toast aus den gewünschten Daten. */
  private createToast(request: SystemToastRequest): SystemToast {

    const durationMs = request.durationMs ?? this.calculateDuration(request.message); // Explizite oder anhand der Textlänge berechnete Laufzeit.

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
    this.activeTimeoutId = window.setTimeout(/** Schließt den Toast nach Ablauf seiner Anzeigedauer. */() => this.dismissActiveToast(), toast.durationMs);
  }

  /** Zeigt den nächsten wartenden Toast. */
  private showNextToast(): void {
    if (this.activeToastSignal() || this.queue.length === 0) {
      return;
    }

    const nextToast = this.queue.shift(); // Nächster wartender Systemhinweis oder undefined.

    if (nextToast) {
      this.showToast(nextToast);
    }
  }
}
