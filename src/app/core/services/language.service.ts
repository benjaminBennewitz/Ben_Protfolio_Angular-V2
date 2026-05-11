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

  /** Dokumentreferenz für das lang-Attribut. */
  private readonly document = inject(DOCUMENT);

  /** Interner Sprachzustand. */
  private readonly languageSignal = signal<PortfolioLanguage>(this.readInitialLanguage());

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
    this.languageSignal.update((language) => (language === 'de' ? 'en' : 'de'));
  }

  /** Setzt eine konkrete Sprache, sofern diese unterstützt wird. */
  setLanguage(language: PortfolioLanguage): void {
    this.languageSignal.set(language);
  }

  /** Liest die initiale Sprache aus LocalStorage oder nutzt Deutsch als Default. */
  private readInitialLanguage(): PortfolioLanguage {
    const savedLanguage = localStorage.getItem(this.storageKey);

    return savedLanguage === 'en' ? 'en' : 'de';
  }
}
