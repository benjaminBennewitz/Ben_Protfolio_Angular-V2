/* src/app/core/services/theme.service.ts */

/**
 * @file Theme-Verwaltung des Portfolios.
 * @description Synchronisiert Dark-/Light-Mode mit CSS-Tokens, LocalStorage und Umschaltanimation.
 */

import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { PortfolioTheme } from '../models/portfolio.models';

/** Verwaltet das visuelle Theme der Anwendung. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** Schlüssel für die Persistenz im LocalStorage. */
  private readonly storageKey = 'bp-theme';

  /** Root-Klasse für die kurze Theme-Übergangsanimation. */
  private readonly transitionClass = 'bp-theme-is-switching';

  /** Dauer der Theme-Übergangsanimation in Millisekunden. */
  private readonly transitionDurationMs = 720;

  /** Dokumentreferenz für das data-theme-Attribut. */
  private readonly document = inject(DOCUMENT);

  /** Interner Theme-Zustand. */
  private readonly themeSignal = signal<PortfolioTheme>(this.readInitialTheme());

  /** Timer zum Aufräumen der Übergangsklasse. */
  private transitionTimer?: number;

  /** Aktuell ausgewähltes Theme. */
  readonly currentTheme = computed<PortfolioTheme>(() => this.themeSignal());

  /** Gibt true zurück, wenn der Light Mode aktiv ist. */
  readonly isLight = computed<boolean>(() => this.currentTheme() === 'light');

  /** Initialisiert die Synchronisierung von Theme und Dokument. */
  constructor() {
    effect(() => {
      const theme = this.currentTheme();
      this.document.documentElement.dataset['theme'] = theme;
      this.updateThemeColor(theme);
      localStorage.setItem(this.storageKey, theme);
    });
  }

  /** Wechselt zwischen Dark und Light Mode. */
  toggleTheme(): void {
    this.startTransition();
    this.themeSignal.update((theme) => (theme === 'dark' ? 'light' : 'dark'));
  }

  /** Setzt eine konkrete Theme-Variante. */
  setTheme(theme: PortfolioTheme): void {
    this.startTransition();
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

  /** Startet die sichtbare, aber kurze Umschaltanimation am Dokument-Root. */
  private startTransition(): void {
    this.document.documentElement.classList.add(this.transitionClass);

    if (this.transitionTimer) {
      window.clearTimeout(this.transitionTimer);
    }

    this.transitionTimer = window.setTimeout(() => {
      this.document.documentElement.classList.remove(this.transitionClass);
      this.transitionTimer = undefined;
    }, this.transitionDurationMs);
  }

  /** Aktualisiert die mobile Browserfarbe passend zum aktiven Theme. */
  private updateThemeColor(theme: PortfolioTheme): void {
    const tag = this.document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');

    if (!tag) {
      return;
    }

    tag.content = theme === 'light' ? '#fffaf1' : '#0b0b0d';
  }
}
