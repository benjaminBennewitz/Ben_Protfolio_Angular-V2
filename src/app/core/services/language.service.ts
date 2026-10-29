/* src/app/core/services/language.service.ts */

/**
 * @file Sprachverwaltung des Portfolios.
 * @description Stellt die aktuell gewählte Sprache und übersetzte Inhalte per Signals bereit.
 */

import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { PORTFOLIO_TRANSLATIONS } from '../data/portfolio-content';
import type { PortfolioBaseContent } from '../models/content.models';
import type { PortfolioLanguage } from '../models/shared.models';

/** Verwaltet Sprache, Persistenz und HTML-Lang-Attribut. */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly storageKey = 'bp-language';                                             // Schlüssel für die Persistenz im LocalStorage.
  private readonly document = inject(DOCUMENT);                                            // Dokumentreferenz für das lang-Attribut.
  private readonly languageSignal = signal<PortfolioLanguage>(this.readInitialLanguage()); // Interner Sprachzustand.
  readonly language = computed<PortfolioLanguage>(                                         // Aktuell ausgewählte Sprache.
    /** Aktuell ausgewählte Sprache. */
    () => this.languageSignal()
  );

  readonly content = computed<PortfolioBaseContent>(                                       // Übersetzter Inhalt der aktuell ausgewählten Sprache.
    /** Übersetzter Inhalt der aktuell ausgewählten Sprache. */
    () => PORTFOLIO_TRANSLATIONS[this.language()]
  );

  /** Initialisiert die Synchronisierung von Sprache und Dokument. */
  constructor() {
    effect(/** Synchronisiert den aktuellen Signalzustand mit Dokument und Persistenz. */() => {

      const language = this.language(); // Aktive Sprache für HTML-Attribut und Persistenz.

      this.document.documentElement.lang = language;
      localStorage.setItem(this.storageKey, language);
    });
  }

  /** Schaltet zwischen Deutsch und Englisch um. */
  toggleLanguage(): void {
    this.languageSignal.update(/** Wählt die jeweils andere unterstützte Sprache. */(language) => (language === 'de' ? 'en' : 'de'));
  }

  /** Setzt eine konkrete Sprache, sofern diese unterstützt wird. */
  setLanguage(language: PortfolioLanguage): void {
    this.languageSignal.set(language);
  }

  /** Liest die initiale Sprache aus LocalStorage oder verwendet Deutsch als Standardsprache. */
  private readInitialLanguage(): PortfolioLanguage {

    const savedLanguage = localStorage.getItem(this.storageKey); // Gespeicherte Sprachkennung vor der Validierung.

    if (savedLanguage === 'de' || savedLanguage === 'en') {
      return savedLanguage;
    }

    return 'de';
  }
}
