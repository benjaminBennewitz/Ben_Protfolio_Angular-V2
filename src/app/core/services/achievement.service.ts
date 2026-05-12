/* src/app/core/services/achievement.service.ts */

/**
 * @file Achievement-System des Portfolios.
 * @description Verwaltet versteckte Trophäen, LocalStorage-Fortschritt und übersetzbare Hinweise.
 */

import { computed, inject, Injectable, signal } from '@angular/core';
import { PortfolioLanguage } from '../models/portfolio.models';
import { LanguageService } from './language.service';

/** Verfügbare Achievement-IDs der Portfolio-Interaktionen. */
export type AchievementId =
  | 'loader-human'
  | 'hero-face-switch'
  | 'nostalgia-hater'
  | 'coffee-glitch'
  | 'eye-poke'
  | 'bomb-defused'
  | 'game-oneup'
  | 'trash-dunk'
  | 'blood-complete'
  | 'cta-contact'
  | 'loyal-companion';

/** Technische Definition einer Trophäe. */
interface AchievementDefinition {
  /** Stabile ID für Persistenz und Unlocks. */
  readonly id: AchievementId;
  /** Material-Symbol für die freigeschaltete Trophäe. */
  readonly icon: string;
  /** Kurze Kategorie der Interaktion. */
  readonly category: string;
}

/** Übersetzbarer Text einer Trophäe. */
interface AchievementTranslation {
  /** Sichtbarer Titel nach Freischaltung. */
  readonly title: string;
  /** Beschreibung nach Freischaltung. */
  readonly description: string;
  /** Hinweis, der vor Freischaltung manuell eingeblendet werden kann. */
  readonly hint: string;
}

/** Sichtbarer View-Status einer Trophäe. */
export interface AchievementView extends AchievementDefinition, AchievementTranslation {
  /** Gibt an, ob die Trophäe freigeschaltet wurde. */
  readonly unlocked: boolean;
  /** Gibt an, ob der Hinweis auf der geheimen Seite eingeblendet wurde. */
  readonly hintVisible: boolean;
}

/** Persistierte Achievement-Daten. */
interface StoredAchievementState {
  /** Freigeschaltete Achievement-IDs. */
  readonly unlocked: readonly AchievementId[];
  /** Sichtbare Hinweis-IDs. */
  readonly hints: readonly AchievementId[];
}

/** Lokales Achievement-System ohne Backend-Abhängigkeit. */
@Injectable({ providedIn: 'root' })
export class AchievementService {
  /** Schlüssel für den Fortschritt im LocalStorage. */
  private readonly storageKey = 'bp-achievements-v1';

  /** Sprachservice für übersetzte Achievement-Texte. */
  private readonly languageService = inject(LanguageService);

  /** Feste Reihenfolge der Trophäen. */
  private readonly definitions: readonly AchievementDefinition[] = [
    { id: 'loader-human', icon: 'touch_app', category: 'loader' },
    { id: 'hero-face-switch', icon: 'face_retouching_natural', category: 'hero' },
    { id: 'nostalgia-hater', icon: 'close', category: 'hero' },
    { id: 'coffee-glitch', icon: 'local_cafe', category: 'about' },
    { id: 'eye-poke', icon: 'visibility', category: 'project' },
    { id: 'bomb-defused', icon: 'explosion', category: 'project' },
    { id: 'game-oneup', icon: 'sports_esports', category: 'project' },
    { id: 'trash-dunk', icon: 'delete', category: 'project' },
    { id: 'blood-complete', icon: 'hematology', category: 'project' },
    { id: 'cta-contact', icon: 'arrow_outward', category: 'contact' },
    { id: 'loyal-companion', icon: 'music_note', category: 'footer' },
  ];

  /** Interner Fortschrittszustand. */
  private readonly stateSignal = signal<StoredAchievementState>(this.readStoredState());

  /** Aktuell sichtbare Trophy-Notification. */
  private readonly activeUnlockIdSignal = signal<AchievementId | null>(null);

  /** Warteschlange für mehrere direkte Unlocks nacheinander. */
  private readonly unlockToastQueue: AchievementId[] = [];

  /** Timeout-ID für den automatischen Dismiss der Notification. */
  private activeUnlockTimeoutId: number | null = null;

  /** Sichtbare Achievement-Liste in aktiver Sprache. */
  readonly achievements = computed<readonly AchievementView[]>(() => {
    const state = this.stateSignal();
    const translations = ACHIEVEMENT_TRANSLATIONS[this.languageService.language()];

    return this.definitions.map((definition) => ({
      ...definition,
      ...translations[definition.id],
      unlocked: state.unlocked.includes(definition.id),
      hintVisible: state.hints.includes(definition.id),
    }));
  });

  /** Aktuell sichtbare Trophy-Notification inklusive Übersetzung. */
  readonly activeUnlock = computed<AchievementView | null>(() => {
    const activeId = this.activeUnlockIdSignal();
    return activeId ? this.achievements().find((achievement) => achievement.id === activeId) ?? null : null;
  });

  /** Anzahl freigeschalteter Trophäen. */
  readonly unlockedCount = computed<number>(() => this.stateSignal().unlocked.length);

  /** Gesamtanzahl verfügbarer Trophäen. */
  readonly totalCount = computed<number>(() => this.definitions.length);

  /** Schaltet eine Trophäe dauerhaft frei. */
  unlock(id: AchievementId): void {
    let unlockedNow = false;

    this.stateSignal.update((state) => {
      if (state.unlocked.includes(id)) {
        return state;
      }

      unlockedNow = true;
      return this.persistState({ ...state, unlocked: [...state.unlocked, id] });
    });

    if (unlockedNow) {
      this.enqueueUnlockToast(id);
    }
  }

  /** Blendet den Hinweis zu einer Trophäe ein. */
  revealHint(id: AchievementId): void {
    this.stateSignal.update((state) => {
      if (state.hints.includes(id)) {
        return state;
      }

      return this.persistState({ ...state, hints: [...state.hints, id] });
    });
  }

  /** Schließt die aktuelle Trophy-Notification manuell. */
  dismissActiveUnlock(): void {
    if (this.activeUnlockTimeoutId !== null) {
      window.clearTimeout(this.activeUnlockTimeoutId);
      this.activeUnlockTimeoutId = null;
    }

    this.activeUnlockIdSignal.set(null);
    window.setTimeout(() => this.showNextUnlockToast(), 160);
  }

  /** Setzt den lokalen Fortschritt zurück. */
  resetProgress(): void {
    this.unlockToastQueue.splice(0, this.unlockToastQueue.length);

    if (this.activeUnlockTimeoutId !== null) {
      window.clearTimeout(this.activeUnlockTimeoutId);
      this.activeUnlockTimeoutId = null;
    }

    this.activeUnlockIdSignal.set(null);
    this.stateSignal.set(this.persistState({ unlocked: [], hints: [] }));
  }

  /** Liest den Fortschritt aus LocalStorage. */
  private readStoredState(): StoredAchievementState {
    try {
      const value = localStorage.getItem(this.storageKey);
      const parsed = value ? JSON.parse(value) as Partial<StoredAchievementState> : null;

      return {
        unlocked: this.validIds(parsed?.unlocked),
        hints: this.validIds(parsed?.hints),
      };
    } catch {
      return { unlocked: [], hints: [] };
    }
  }

  /** Persistiert den Fortschritt und gibt denselben Zustand zurück. */
  private persistState(state: StoredAchievementState): StoredAchievementState {
    localStorage.setItem(this.storageKey, JSON.stringify(state));
    return state;
  }

  /** Merkt sich eine neue Notification und zeigt sie an, wenn gerade Platz ist. */
  private enqueueUnlockToast(id: AchievementId): void {
    this.unlockToastQueue.push(id);
    this.showNextUnlockToast();
  }

  /** Zeigt die nächste Notification aus der Warteschlange. */
  private showNextUnlockToast(): void {
    if (this.activeUnlockIdSignal() !== null || this.unlockToastQueue.length === 0) {
      return;
    }

    const nextId = this.unlockToastQueue.shift() ?? null;

    if (!nextId) {
      return;
    }

    this.activeUnlockIdSignal.set(nextId);
    this.activeUnlockTimeoutId = window.setTimeout(() => this.dismissActiveUnlock(), 4200);
  }

  /** Filtert gespeicherte IDs auf bekannte Achievement-IDs. */
  private validIds(values: unknown): readonly AchievementId[] {
    const knownIds = new Set(this.definitions.map((definition) => definition.id));

    return Array.isArray(values)
      ? values.filter((value): value is AchievementId => typeof value === 'string' && knownIds.has(value as AchievementId))
      : [];
  }
}

/** Übersetzungen der geheimen Trophäen. */
const ACHIEVEMENT_TRANSLATIONS: Record<PortfolioLanguage, Record<AchievementId, AchievementTranslation>> = {
  de: {
    'loader-human': {
      title: 'Menschliche Freigabe',
      description: 'Du hast die beleidigte Bootsequenz überzeugt und das Interface gestartet.',
      hint: 'Manche Systeme starten erst, wenn ein Mensch etwas Cooles sagt.',
    },
    'hero-face-switch': {
      title: 'Gesichtskontrolle',
      description: 'Du hast den Hero-Kopf durch einen alternativen Zustand gejagt.',
      hint: 'Ein Mensch hat viele Gesichter.',
    },
    'nostalgia-hater': {
      title: 'Ich hasse Nostalgie',
      description: 'Du hast den ersten MS-DOS-Dialog ohne Sentimentalität konsequent geschlossen.',
      hint: 'Windows 95 war gestern.',
    },
    'coffee-glitch': {
      title: 'Koffeinfehler',
      description: 'err, 404 Koffeein not found.',
      hint: 'Ein guter Tag startet mit einer Tasse Kaffee.',
    },
    'eye-poke': {
      title: 'Nicht ins Auge',
      description: 'Musst du alles anfassen?',
      hint: 'Fühlst du dich beobachtet?',
    },
    'bomb-defused': {
      title: 'Boom-Management',
      description: '"Kabuuum" <- Onomatopoesie.',
      hint: 'Ich glaube, du hast den Knall nicht gehört.',
    },
    'game-oneup': {
      title: 'Unsterblich',
      description: 'Alle Game-Assets haben den Boden erreicht und dich unsterblich gemacht.',
      hint: 'Die Schwerkraft zieht alles zu Boden.',
    },
    'trash-dunk': {
      title: 'Papierkorb-Korb',
      description: 'Willkommen in der Digitalisierung. Reduziere Papiermüll!',
      hint: 'Rette den Planeten.',
    },
    'blood-complete': {
      title: 'Betriebsarzt',
      description: 'Die Blutanalyse hat ergeben, dass Sie zu 99,9% Hammer sind.',
      hint: 'Geh mal zum Arzt!',
    },
    'cta-contact': {
      title: 'Schwerkraft besiegt',
      description: 'you can touch this und jonglieren - cool',
      hint: 'Besiege die Schwerkraft.',
    },
    'loyal-companion': {
      title: 'I feel good',
      description: 'Sie wird dort, immer auf dich warten.',
      hint: 'Finde einen treuen Begleiter.',
    },
  },
  en: {
    'loader-human': {
      title: 'Human Clearance',
      description: 'You convinced the offended boot sequence and launched the interface.',
      hint: 'Some systems only start when a human says something cool.',
    },
    'hero-face-switch': {
      title: 'Face Control',
      description: 'You pushed the hero head through an alternative state.',
      hint: 'A human has many faces.',
    },
    'nostalgia-hater': {
      title: 'I Hate Nostalgia',
      description: 'You closed the first MS-DOS dialog with absolutely no sentimentality.',
      hint: 'Windows 95 was yesterday.',
    },
    'coffee-glitch': {
      title: 'Caffeine Fault',
      description: 'err, 404 caffeine not found.',
      hint: 'A good day starts with a cup of coffee.',
    },
    'eye-poke': {
      title: 'Do Not Poke',
      description: 'Do you have to touch everything?',
      hint: 'Do you feel watched?',
    },
    'bomb-defused': {
      title: 'Boom Management',
      description: '"Kaboom" <- onomatopoeia.',
      hint: 'I think you did not hear the bang.',
    },
    'game-oneup': {
      title: 'Immortal',
      description: 'All game assets reached the ground and made you immortal.',
      hint: 'Gravity pulls everything to the ground.',
    },
    'trash-dunk': {
      title: 'Trash Dunk',
      description: 'Welcome to digitalization. Reduce paper waste!',
      hint: 'Save the planet.',
    },
    'blood-complete': {
      title: 'Company Doctor',
      description: 'The blood analysis says you are 99.9% awesome.',
      hint: 'Go see a doctor!',
    },
    'cta-contact': {
      title: 'Gravity Defeated',
      description: 'you can touch this and juggle - cool',
      hint: 'Defeat gravity.',
    },
    'loyal-companion': {
      title: 'I Feel Good',
      description: 'She will always be waiting for you there.',
      hint: 'Find a loyal companion.',
    },
  },
};
