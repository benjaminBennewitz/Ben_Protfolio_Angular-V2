/* src/app/core/services/theme.service.ts */

/**
 * @file Theme-Verwaltung des Portfolios.
 * @description Synchronisiert Dark-/Light-Mode mit CSS-Tokens, LocalStorage und Umschaltanimation.
 */

import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import type { PortfolioTheme } from '../models/shared.models';

/** Verwaltet das visuelle Theme der Anwendung. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'bp-theme';                                       // Schlüssel für die Persistenz im LocalStorage.
  private readonly transitionClass = 'bp-theme-is-switching';                     // Root-Klasse für die kurze Theme-Übergangsanimation.
  private readonly transitionDurationMs = 720;                                    // Dauer der Theme-Übergangsanimation in Millisekunden.
  private readonly document = inject(DOCUMENT);                                   // Dokumentreferenz für das data-theme-Attribut.
  private readonly themeSignal = signal<PortfolioTheme>(this.readInitialTheme()); // Interner Theme-Zustand.
  private transitionTimer?: number;                                               // Timer zum Aufräumen der Übergangsklasse.
  readonly currentTheme = computed<PortfolioTheme>(                               // Aktuell ausgewähltes Theme.
    /** Aktuell ausgewähltes Theme. */
    () => this.themeSignal()
  );

  readonly isLight = computed<boolean>(                                           // Gibt true zurück, wenn der Light Mode aktiv ist.
    /** Gibt true zurück, wenn der Light Mode aktiv ist. */
    () => this.currentTheme() === 'light'
  );

  /** Initialisiert die Synchronisierung von Theme und Dokument. */
  constructor() {
    effect(/** Synchronisiert den aktuellen Signalzustand mit Dokument und Persistenz. */() => {

      const theme = this.currentTheme(); // Aktives Theme für DOM-Synchronisierung und Persistenz.

      this.document.documentElement.dataset['theme'] = theme;
      this.updateThemeColor(theme);
      localStorage.setItem(this.storageKey, theme);
    });
  }

  /** Wechselt zwischen Dark und Light Mode. */
  toggleTheme(): void {
    this.startTransition();
    this.themeSignal.update(/** Wählt die jeweils andere Theme-Variante. */(theme) => (theme === 'dark' ? 'light' : 'dark'));
  }

  /** Setzt eine konkrete Theme-Variante. */
  setTheme(theme: PortfolioTheme): void {
    this.startTransition();
    this.themeSignal.set(theme);
  }

  /** Ermittelt das initiale Theme aus Persistenz oder Systemeinstellung. */
  private readInitialTheme(): PortfolioTheme {

    const savedTheme = localStorage.getItem(this.storageKey); // Gespeicherte Theme-Kennung vor der Validierung.

    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  /** Startet die sichtbare, aber kurze Umschaltanimation am Dokument-Root. */
  private startTransition(): void {
    this.document.documentElement.classList.add(this.transitionClass);

    if (this.transitionTimer) {
      window.clearTimeout(this.transitionTimer);
    }

    this.transitionTimer = window.setTimeout(/** Entfernt nach dem Theme-Wechsel die temporäre Übergangsklasse. */() => {
      this.document.documentElement.classList.remove(this.transitionClass);
      this.transitionTimer = undefined;
    }, this.transitionDurationMs);
  }

  /** Aktualisiert die mobile Browserfarbe passend zum aktiven Theme. */
  private updateThemeColor(theme: PortfolioTheme): void {

    const tag = this.document.querySelector<HTMLMetaElement>('meta[name="theme-color"]'); // Vorhandenes Meta-Tag für die Browserfarbe.

    if (!tag) {
      return;
    }

    tag.content = theme === 'light' ? '#fffaf1' : '#0b0b0d';
  }
}
