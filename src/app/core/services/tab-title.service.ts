/* src/app/core/services/tab-title.service.ts */

/**
 * @file Dynamische Browser-Tab-Titel.
 * @description Zeigt bei inaktivem Tab einen spielerischen Rückkehr-Hinweis.
 */

import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

/** Verwaltet aktive und inaktive Dokumenttitel. */
@Injectable({ providedIn: 'root' })
export class TabTitleService {
  /** Dokumentreferenz zur Titelsteuerung. */
  private readonly document = inject(DOCUMENT);

  /** Regulärer Seitentitel. */
  private readonly activeTitleSignal = signal<string>('Benjamin Bennewitz | Portfolio');

  /** Titel für den inaktiven Browser-Tab. */
  private readonly hiddenTitleSignal = signal<string>('psst... komm zurück 👀');

  /** Registriert den Visibility-Listener genau einmal. */
  constructor() {
    this.document.addEventListener('visibilitychange', () => this.applyCurrentTitle());
  }

  /** Setzt den regulären Titel der aktuellen Route. */
  setActiveTitle(title: string): void {
    this.activeTitleSignal.set(title);
    this.applyCurrentTitle();
  }

  /** Setzt den Titel für inaktive Tabs. */
  setHiddenTitle(title: string): void {
    this.hiddenTitleSignal.set(title);
    this.applyCurrentTitle();
  }

  /** Wendet abhängig von der Sichtbarkeit den passenden Titel an. */
  private applyCurrentTitle(): void {
    this.document.title = this.document.hidden ? this.hiddenTitleSignal() : this.activeTitleSignal();
  }
}
