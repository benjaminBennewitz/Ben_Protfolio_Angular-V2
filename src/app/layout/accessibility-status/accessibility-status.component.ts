/* src/app/layout/accessibility-status/accessibility-status.component.ts */

/**
 * @file Globale Accessibility-Statusanzeige.
 * @description Zeigt unten links den aktuellen Barrierefreiheitszustand der Portfolio-Experience.
 */

import { Component, computed, inject } from '@angular/core';
import { AccessibilityPreferenceService, ColorVisionMode, ComfortMode, ContrastMode, MotionMode } from '../../core/services/accessibility-preference.service';
import { LanguageService } from '../../core/services/language.service';

/** Übersetzte Labels für den Accessibility-Status. */
interface AccessibilityStatusTexts {
  /** Sichtbarer Titel der Statusanzeige. */
  readonly title: string;
  /** Zugängliche Beschriftung der Statusanzeige. */
  readonly ariaLabel: string;
  /** Labels der Bewegungsmodi. */
  readonly motion: Record<MotionMode, string>;
  /** Labels der Comfort-Modi. */
  readonly comfort: Record<ComfortMode, string>;
  /** Labels der Kontrastmodi. */
  readonly contrast: Record<ContrastMode, string>;
  /** Labels der Farbseh-Modi. */
  readonly color: Record<ColorVisionMode, string>;
}

/** Kompakte globale Anzeige für aktive Accessibility-Einstellungen. */
@Component({
  selector: 'bp-accessibility-status',
  standalone: true,
  templateUrl: './accessibility-status.component.html',
  styleUrl: './accessibility-status.component.scss',
})
export class AccessibilityStatusComponent {
  /** Accessibility-Service mit aktuellen Modi. */
  private readonly accessibility = inject(AccessibilityPreferenceService);

  /** Sprachservice für übersetzte Labels. */
  private readonly languageService = inject(LanguageService);

  /** Übersetzte Status-Texte. */
  readonly texts = computed<AccessibilityStatusTexts>(() => STATUS_TEXTS[this.languageService.language()]);

  /** Kompakte Zusammenfassung der aktuellen Accessibility-Einstellungen. */
  readonly statusText = computed<string>(() => {
    const texts = this.texts();
    const preferences = this.accessibility.preferences();

    return [
      texts.motion[preferences.motion],
      texts.comfort[preferences.comfort],
      texts.contrast[preferences.contrast],
      texts.color[preferences.colorVision],
    ].join(' · ');
  });
}

/** Übersetzungen der globalen Accessibility-Statusanzeige. */
const STATUS_TEXTS: Record<'de' | 'en', AccessibilityStatusTexts> = {
  de: {
    title: 'Barrierefreiheit',
    ariaLabel: 'Aktueller Barrierefreiheitsstatus',
    motion: {
      full: 'volle Animationen',
      reduced: 'reduzierte Bewegung',
      off: 'Motion aus',
    },
    comfort: {
      expressive: 'expressive Oberfläche',
      simple: 'ruhige Oberfläche',
    },
    contrast: {
      normal: 'normaler Kontrast',
      high: 'hoher Kontrast',
    },
    color: {
      default: 'Standardfarben',
      deuteranopia: 'Grünblindheit angepasst',
      protanopia: 'Rotblindheit angepasst',
      tritanopia: 'Blaublindheit angepasst',
      achromatopsia: 'Schwarz-Weiß-Modus',
    },
  },
  en: {
    title: 'Accessibility',
    ariaLabel: 'Current accessibility status',
    motion: {
      full: 'full motion',
      reduced: 'reduced motion',
      off: 'motion off',
    },
    comfort: {
      expressive: 'expressive interface',
      simple: 'calmer interface',
    },
    contrast: {
      normal: 'normal contrast',
      high: 'high contrast',
    },
    color: {
      default: 'default colors',
      deuteranopia: 'green-blind mode',
      protanopia: 'red-blind mode',
      tritanopia: 'blue-blind mode',
      achromatopsia: 'grayscale mode',
    },
  },
};
