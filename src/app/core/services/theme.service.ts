/* src/app/core/services/theme.service.ts */

/**
 * @file Theme-Verwaltung des Portfolios.
 * @description Synchronisiert Dark-/Light-Mode mit CSS-Tokens und LocalStorage.
 */

import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { PortfolioTheme } from '../models/portfolio.models';

/** Verwaltet das visuelle Theme der Anwendung. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** Schlüssel für die Persistenz im LocalStorage. */
  private readonly storageKey = 'bp-theme';

  /** Dokumentreferenz für das data-theme-Attribut. */
  private readonly document = inject(DOCUMENT);

  /** Interner Theme-Zustand. */
  private readonly themeSignal = signal<PortfolioTheme>(this.readInitialTheme());

  /** Aktuell ausgewähltes Theme. */
  readonly currentTheme = computed<PortfolioTheme>(() => this.themeSignal());

  /** Gibt true zurück, wenn der Light Mode aktiv ist. */
  readonly isLight = computed<boolean>(() => this.currentTheme() === 'light');

  /** Initialisiert die Synchronisierung von Theme und Dokument. */
  constructor() {
    effect(() => {
      const theme = this.currentTheme();
      this.document.documentElement.dataset['theme'] = theme;
      localStorage.setItem(this.storageKey, theme);
    });
  }

  /** Wechselt zwischen Dark und Light Mode. */
  toggleTheme(): void {
    this.themeSignal.update((theme) => (theme === 'dark' ? 'light' : 'dark'));
  }

  /** Setzt eine konkrete Theme-Variante. */
  setTheme(theme: PortfolioTheme): void {
    this.themeSignal.set(theme);
  }

  /** Ermittelt das initiale Theme aus Persistenz oder Systemeinstellung. */
  private readInitialTheme(): PortfolioTheme {
    const savedTheme = localStorage.getItem(this.storageKey);

    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
}
