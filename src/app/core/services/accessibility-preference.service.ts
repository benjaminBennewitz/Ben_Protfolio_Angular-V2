/* src/app/core/services/accessibility-preference.service.ts */

/**
 * @file Accessibility- und Comfort-Modi des Portfolios.
 * @description Persistiert Motion-, Kontrast-, Ruhe- und Farbseh-Modi und synchronisiert sie mit HTML-Data-Attributen.
 */

import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, signal } from '@angular/core';

/** Verfügbare Bewegungsstufen der Experience. */
export type MotionMode = 'full' | 'reduced' | 'off';

/** Verfügbare Komplexitätsstufen der Oberfläche. */
export type ComfortMode = 'expressive' | 'simple';

/** Verfügbare Kontraststufen der Oberfläche. */
export type ContrastMode = 'normal' | 'high';

/** Verfügbare Farbseh-Hilfen. */
export type ColorVisionMode = 'default' | 'deuteranopia' | 'protanopia' | 'tritanopia' | 'achromatopsia';

/** Persistierte Accessibility-Einstellungen. */
export interface AccessibilityPreferences {
  readonly motion: MotionMode;           // Bewegungsstufe für Animationen und JavaScript-Simulationen.
  readonly comfort: ComfortMode;         // Komplexitätsstufe für eine ruhigere Oberfläche.
  readonly contrast: ContrastMode;       // Kontraststufe für stärkere Lesbarkeit.
  readonly colorVision: ColorVisionMode; // Farbseh-Modus für robustere Akzentfarben.
}

/** Verwaltet globale Accessibility- und Comfort-Einstellungen. */
@Injectable({ providedIn: 'root' })
export class AccessibilityPreferenceService {
  private readonly storageKey = 'bp-accessibility-preferences-v1';                                      // Schlüssel für persistierte Einstellungen im LocalStorage.
  private readonly document = inject(DOCUMENT);                                                         // Dokumentreferenz für globale Data-Attribute.
  private readonly preferencesSignal = signal<AccessibilityPreferences>(this.readInitialPreferences()); // Interner Zustand der Accessibility-Einstellungen.
  readonly preferences = computed<AccessibilityPreferences>(                                            // Aktuelle Accessibility-Einstellungen.
    /** Aktuelle Accessibility-Einstellungen. */
    () => this.preferencesSignal()
  );

  readonly motionMode = computed<MotionMode>(                                                           // Aktueller Bewegungsmodus.
    /** Aktueller Bewegungsmodus. */
    () => this.preferences().motion
  );

  readonly comfortMode = computed<ComfortMode>(                                                         // Aktueller Comfort-Modus.
    /** Aktueller Comfort-Modus. */
    () => this.preferences().comfort
  );

  readonly contrastMode = computed<ContrastMode>(                                                       // Aktueller Kontrastmodus.
    /** Aktueller Kontrastmodus. */
    () => this.preferences().contrast
  );

  readonly colorVisionMode = computed<ColorVisionMode>(                                                 // Aktueller Farbseh-Modus.
    /** Aktueller Farbseh-Modus. */
    () => this.preferences().colorVision
  );

  readonly allowsMotion = computed<boolean>(                                                            // Gibt true zurück, wenn JS-Animationen normal laufen dürfen.
    /** Gibt true zurück, wenn JS-Animationen normal laufen dürfen. */
    () => this.motionMode() === 'full'
  );

  readonly reducesMotion = computed<boolean>(                                                           // Gibt true zurück, wenn Animationen reduziert oder deaktiviert werden sollen.
    /** Gibt true zurück, wenn Animationen reduziert oder deaktiviert werden sollen. */
    () => this.motionMode() !== 'full'
  );

  readonly usesSimpleMode = computed<boolean>(                                                          // Gibt true zurück, wenn die Oberfläche bewusst ruhiger sein soll.
    /** Gibt true zurück, wenn die Oberfläche bewusst ruhiger sein soll. */
    () => this.comfortMode() === 'simple'
  );

  /** Synchronisiert die Einstellungen mit HTML-Attributen und LocalStorage. */
  constructor() {
    effect(/** Synchronisiert den aktuellen Signalzustand mit Dokument und Persistenz. */() => {

      const preferences = this.preferences(); // Aktuelle Einstellungen für DOM-Synchronisierung und Persistenz.

      this.document.documentElement.dataset['motion'] = preferences.motion;
      this.document.documentElement.dataset['comfort'] = preferences.comfort;
      this.document.documentElement.dataset['contrast'] = preferences.contrast;
      this.document.documentElement.dataset['colorVision'] = preferences.colorVision;
      localStorage.setItem(this.storageKey, JSON.stringify(preferences));
    });
  }

  /** Setzt den Bewegungsmodus. */
  setMotionMode(motion: MotionMode): void {
    this.patchPreferences({ motion });
  }

  /** Setzt den Comfort-Modus. */
  setComfortMode(comfort: ComfortMode): void {
    this.patchPreferences({ comfort });
  }

  /** Setzt den Kontrastmodus. */
  setContrastMode(contrast: ContrastMode): void {
    this.patchPreferences({ contrast });
  }

  /** Setzt den Farbseh-Modus. */
  setColorVisionMode(colorVision: ColorVisionMode): void {
    this.patchPreferences({ colorVision });
  }

  /** Aktiviert einen ruhigen, neuro-sensitiven Modus mit reduzierter Komplexität. */
  enableCalmMode(): void {
    this.preferencesSignal.set({
      motion: 'off',
      comfort: 'simple',
      contrast: 'high',
      colorVision: this.colorVisionMode(),
    });
  }

  /** Setzt alle Accessibility-Overrides auf die expressive Standarddarstellung zurück. */
  resetPreferences(): void {
    this.preferencesSignal.set({
      motion: this.systemPrefersReducedMotion() ? 'reduced' : 'full',
      comfort: 'expressive',
      contrast: 'normal',
      colorVision: 'default',
    });
  }

  /** Aktualisiert einzelne Einstellungen ohne die restlichen Werte zu verlieren. */
  private patchPreferences(patch: Partial<AccessibilityPreferences>): void {
    this.preferencesSignal.update(/** Übernimmt geänderte Einstellungen unter Erhalt der übrigen Werte. */(preferences) => ({ ...preferences, ...patch }));
  }

  /** Ermittelt initiale Einstellungen aus Persistenz und Systemeinstellung. */
  private readInitialPreferences(): AccessibilityPreferences {

    const fallback: AccessibilityPreferences = { // Standardwerte unter Berücksichtigung der Systemeinstellung.
      motion: this.systemPrefersReducedMotion() ? 'reduced' : 'full',
      comfort: 'expressive',
      contrast: 'normal',
      colorVision: 'default',
    };

    try {

      const savedValue = localStorage.getItem(this.storageKey);                                            // Unveränderter Speicherwert der Accessibility-Einstellungen.
      const parsedValue = savedValue ? JSON.parse(savedValue) as Partial<AccessibilityPreferences> : null; // Eingelesene, noch zu validierende Einstellungen.

      return {
        motion: this.validMotionMode(parsedValue?.motion) ? parsedValue.motion : fallback.motion,
        comfort: this.validComfortMode(parsedValue?.comfort) ? parsedValue.comfort : fallback.comfort,
        contrast: this.validContrastMode(parsedValue?.contrast) ? parsedValue.contrast : fallback.contrast,
        colorVision: this.validColorVisionMode(parsedValue?.colorVision) ? parsedValue.colorVision : fallback.colorVision,
      };
    } catch {
      return fallback;
    }
  }

  /** Prüft die Systemeinstellung für reduzierte Bewegung. */
  private systemPrefersReducedMotion(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** Validiert gespeicherte Bewegungsstufen. */
  private validMotionMode(value: unknown): value is MotionMode {
    return value === 'full' || value === 'reduced' || value === 'off';
  }

  /** Validiert gespeicherte Comfort-Stufen. */
  private validComfortMode(value: unknown): value is ComfortMode {
    return value === 'expressive' || value === 'simple';
  }

  /** Validiert gespeicherte Kontraststufen. */
  private validContrastMode(value: unknown): value is ContrastMode {
    return value === 'normal' || value === 'high';
  }

  /** Validiert gespeicherte Farbseh-Modi. */
  private validColorVisionMode(value: unknown): value is ColorVisionMode {
    return value === 'default' || value === 'deuteranopia' || value === 'protanopia' || value === 'tritanopia' || value === 'achromatopsia';
  }
}
