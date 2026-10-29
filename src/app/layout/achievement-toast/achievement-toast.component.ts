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
  readonly unlocked: string;   // Label oberhalb der Trophy.
  readonly closeLabel: string; // Aria-Label für den Schließen-Button.
}

/** Rendert freigeschaltete Achievements als kurze globale Overlay-Benachrichtigung. */
@Component({
  selector: 'bp-achievement-toast',
  standalone: true,
  templateUrl: './achievement-toast.component.html',
  styleUrl: './achievement-toast.component.scss',
})
export class AchievementToastComponent {
  readonly achievementService = inject(AchievementService);   // Achievement-Service mit aktiver Notification.
  private readonly languageService = inject(LanguageService); // Sprachservice für die kleine Systemmeldung.
  readonly texts = computed<AchievementToastTexts>(           // Übersetzte UI-Texte der Notification.
    /** Übersetzte UI-Texte der Notification. */
    () => TOAST_TEXTS[this.languageService.language()]
  );
}

const TOAST_TEXTS: Record<'de' | 'en', AchievementToastTexts> = { // Übersetzungen der globalen Trophy-Notification.
  de: {
    unlocked: 'trophäe freigeschaltet',
    closeLabel: 'Achievement-Notification schließen',
  },
  en: {
    unlocked: 'achievement unlocked',
    closeLabel: 'Close achievement notification',
  },
};
