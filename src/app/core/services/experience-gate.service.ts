/* src/app/core/services/experience-gate.service.ts */

/**
 * @file Freigabe der eigentlichen Portfolio-Experience.
 * @description Hält schwere Seiteninhalte bis zum finalen Loader-Launch aus dem kritischen Startpfad heraus.
 */

import { Injectable, signal } from '@angular/core';

/** Zentraler, einmaliger Freigabezustand nach Loader-Interaktion. */
@Injectable({ providedIn: 'root' })
export class ExperienceGateService {
  private readonly readySignal = signal(false);   // Interner Freigabezustand.
  readonly ready = this.readySignal.asReadonly(); // Readonly-Signal für verzögert geladene Seiteninhalte.

  /** Gibt die eigentliche Portfolio-Experience dauerhaft frei. */
  release(): void {
    this.readySignal.set(true);
  }
}
