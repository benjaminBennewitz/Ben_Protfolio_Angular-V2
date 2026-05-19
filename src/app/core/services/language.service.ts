/* src/app/core/services/language.service.ts */

/**
 * @file Sprachverwaltung des Portfolios.
 * @description Stellt die aktuell gewählte Sprache und übersetzte Inhalte per Signals bereit.
 */

import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { PORTFOLIO_TRANSLATIONS } from '../data/portfolio-content';
import { PortfolioContent, PortfolioLanguage } from '../models/portfolio.models';

/** Verwaltet Sprache, Persistenz und HTML-Lang-Attribut. */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  /** Schlüssel für die Persistenz im LocalStorage. */
  private readonly storageKey = 'bp-language';

  /** Root-Klasse für den kurzen Bahnhofstafel-Wechsel. */
  private readonly transitionClass = 'bp-language-is-switching';

  /** Dauer der Sprachwechselanimation in Millisekunden. */
  private readonly transitionDurationMs = 560;

  /** Dokumentreferenz für das lang-Attribut. */
  private readonly document = inject(DOCUMENT);

  /** Interner Sprachzustand. */
  private readonly languageSignal = signal<PortfolioLanguage>(this.readInitialLanguage());

  /** Timer zum Entfernen der Sprachwechselklasse. */
  private transitionTimer?: number;

  /** Aktuell ausgewählte Sprache. */
  readonly language = computed<PortfolioLanguage>(() => this.languageSignal());

  /** Übersetzter Inhalt der aktuell ausgewählten Sprache. */
  readonly content = computed<PortfolioContent>(() => PORTFOLIO_TRANSLATIONS[this.language()]);

  /** Initialisiert die Synchronisierung von Sprache und Dokument. */
  constructor() {
    effect(() => {
      const language = this.language();
      this.document.documentElement.lang = language;
      localStorage.setItem(this.storageKey, language);
    });
  }

  /** Schaltet zwischen Deutsch und Englisch um. */
  toggleLanguage(): void {
    this.startTransition();
    this.languageSignal.update((language) => (language === 'de' ? 'en' : 'de'));
  }

  /** Setzt eine konkrete Sprache, sofern diese unterstützt wird. */
  setLanguage(language: PortfolioLanguage): void {
    this.startTransition();
    this.languageSignal.set(language);
  }

  /** Liest die initiale Sprache aus LocalStorage, Browserliste oder Deutsch als Fallback. */
  private readInitialLanguage(): PortfolioLanguage {
    const savedLanguage = localStorage.getItem(this.storageKey);

    if (savedLanguage === 'de' || savedLanguage === 'en') {
      return savedLanguage;
    }

    return this.browserPrefersEnglish() ? 'en' : 'de';
  }

  /** Prüft, ob die Browser- oder Systemsprache Englisch bevorzugt. */
  private browserPrefersEnglish(): boolean {
    const languages = navigator.languages?.length ? navigator.languages : [navigator.language];

    return languages.some((language) => language.toLowerCase().startsWith('en'));
  }

  /** Startet eine kurze Root-Animation für den sichtbaren Sprachwechsel. */
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
}
