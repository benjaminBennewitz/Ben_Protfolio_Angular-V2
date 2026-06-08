/* src/app/layout/platinum-discount-modal/platinum-discount-modal.component.ts */

/**
 * @file Platin-Rabatt-Popup.
 * @description Zeigt nach dem Freischalten aller Trophäen einen großen Rabattdialog mit Gutscheincode.
 */

import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AchievementService } from '../../core/services/achievement.service';
import { LanguageService } from '../../core/services/language.service';

/** Übersetzbare Texte des Platin-Popups. */
interface PlatinumDiscountTexts {
  /** Kleine technische Beschriftung über dem Titel. */
  readonly eyebrow: string;
  /** Haupttitel des Dialogs. */
  readonly title: string;
  /** Erste erklärende Zeile. */
  readonly intro: string;
  /** Zweite erklärende Zeile. */
  readonly blink: string;
  /** Rabattbeschreibung. */
  readonly reward: string;
  /** Label vor dem Gutscheincode. */
  readonly codeLabel: string;
  /** Kleingedruckter Gültigkeitshinweis. */
  readonly validity: string;
  /** Hinweis zur Verrechnung nach Aufwandsschätzung. */
  readonly note: string;
  /** CTA zum Kontaktformular. */
  readonly ctaLabel: string;
  /** Label zum Schließen des Dialogs. */
  readonly closeLabel: string;
}

/** Großes Rabatt-Popup für die freigeschaltete Platin-Trophäe. */
@Component({
  selector: 'bp-platinum-discount-modal',
  standalone: true,
  templateUrl: './platinum-discount-modal.component.html',
  styleUrl: './platinum-discount-modal.component.scss',
})
export class PlatinumDiscountModalComponent {
  /** Achievement-Service mit Sichtbarkeitszustand des Platin-Popups. */
  readonly achievementService = inject(AchievementService);

  /** Sprachservice für lokalisierte Popup-Texte. */
  private readonly languageService = inject(LanguageService);

  /** Router für den Sprung zum Kontaktformular. */
  private readonly router = inject(Router);

  /** Aktive Popup-Texte passend zur Sprache. */
  readonly texts = computed<PlatinumDiscountTexts>(() => PLATINUM_TEXTS[this.languageService.language()]);

  /** Öffnet das Kontaktformular, ohne den Gutscheincode automatisch einzutragen. */
  async startDiscountInquiry(): Promise<void> {
    this.achievementService.dismissPlatinumModal();
    await this.router.navigate(['/'], { fragment: 'contact' });
  }
}

/** Übersetzungen des Platin-Rabatt-Popups. */
const PLATINUM_TEXTS: Record<'de' | 'en', PlatinumDiscountTexts> = {
  de: {
    eyebrow: 'platinum_reward.exe',
    title: 'Platin',
    intro: 'Trophäe freigeschaltet. Du hast alle versteckten Details gefunden.',
    blink: 'Das Internet hat kurz geblinzelt.',
    reward: 'Als Belohnung bekommst du 10 % Rabatt auf ein Angebot deiner Wahl.',
    codeLabel: 'Code',
    validity: 'Gültig für jedes Angebot von mir.',
    note: 'Der Rabatt wird nach gemeinsamer Aufwandseinschätzung auf das finale Angebot angewendet.',
    ctaLabel: 'Anfrage mit Rabatt starten',
    closeLabel: 'Platin-Rabatt-Popup schließen',
  },
  en: {
    eyebrow: 'platinum_reward.exe',
    title: 'Platinum',
    intro: 'Trophy unlocked. You found every hidden detail.',
    blink: 'The internet blinked for a second.',
    reward: 'As a reward, you get 10% off one offer of your choice.',
    codeLabel: 'Code',
    validity: 'Valid for every offer from me.',
    note: 'The discount is applied to the final offer after we estimate the scope together.',
    ctaLabel: 'Start inquiry with discount',
    closeLabel: 'Close platinum discount popup',
  },
};
