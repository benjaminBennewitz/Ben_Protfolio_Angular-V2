/* src/app/layout/achievement-toast/achievement-toast.component.ts */

/**
 * @file Globale Achievement-Notification.
 * @description Zeigt neue Trophäen als Top-Slide-In ähnlich einer Konsolen-Trophy an.
 */

import { Component, computed, inject } from '@angular/core';
import { AchievementService } from '../../core/services/achievement.service';
import { LanguageService } from '../../core/services/language.service';

/** Kurze Übersetzungen für die Trophy-Notification. */
interface AchievementToastTexts {
  /** Label oberhalb der Trophy. */
  readonly unlocked: string;
  /** Aria-Label für den Schließen-Button. */
  readonly closeLabel: string;
}

/** Rendert freigeschaltete Achievements als kurze globale Overlay-Benachrichtigung. */
@Component({
  selector: 'bp-achievement-toast',
  standalone: true,
  templateUrl: './achievement-toast.component.html',
  styleUrl: './achievement-toast.component.scss',
})
export class AchievementToastComponent {
  /** Achievement-Service mit aktiver Notification. */
  readonly achievementService = inject(AchievementService);

  /** Sprachservice für die kleine Systemmeldung. */
  private readonly languageService = inject(LanguageService);

  /** Übersetzte UI-Texte der Notification. */
  readonly texts = computed<AchievementToastTexts>(() => TOAST_TEXTS[this.languageService.language()]);
}

/** Übersetzungen der globalen Trophy-Notification. */
const TOAST_TEXTS: Record<'de' | 'en', AchievementToastTexts> = {
  de: {
    unlocked: 'trophäe freigeschaltet',
    closeLabel: 'Achievement-Notification schließen',
  },
  en: {
    unlocked: 'achievement unlocked',
    closeLabel: 'Close achievement notification',
  },
};
