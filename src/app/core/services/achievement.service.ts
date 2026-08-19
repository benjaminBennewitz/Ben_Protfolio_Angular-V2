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
  | 'weird-units'
  | 'sugar-covered'
  | 'eye-poke'
  | 'bomb-defused'
  | 'trash-dunk'
  | 'blood-complete'
  | 'cta-contact'
  | 'skilled-driver'
  | 'rescue-lane-404'
  | 'world-upside-down'
  | 'loyal-companion'
  | 'platinum-complete';

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
    { id: 'weird-units', icon: 'straighten', category: 'about' },
    { id: 'sugar-covered', icon: 'cookie', category: 'project' },
    { id: 'eye-poke', icon: 'visibility', category: 'project' },
    { id: 'bomb-defused', icon: 'explosion', category: 'project' },
    { id: 'trash-dunk', icon: 'delete', category: 'project' },
    { id: 'blood-complete', icon: 'hematology', category: 'project' },
    { id: 'cta-contact', icon: 'arrow_outward', category: 'contact' },
    { id: 'skilled-driver', icon: 'directions_car', category: 'cta' },
    { id: 'rescue-lane-404', icon: 'emergency', category: 'cta' },
    { id: 'world-upside-down', icon: 'accessibility_new', category: 'access' },
    { id: 'loyal-companion', icon: 'music_note', category: 'footer' },
    { id: 'platinum-complete', icon: 'workspace_premium', category: 'platin' },
  ];

  /** Interner Fortschrittszustand. */
  private readonly stateSignal = signal<StoredAchievementState>(this.readStoredState());

  /** Aktuell sichtbare Trophy-Notification. */
  private readonly activeUnlockIdSignal = signal<AchievementId | null>(null);

  /** Sichtbarkeit des großen Platin-Abschluss-Popups. */
  private readonly platinumModalVisibleSignal = signal<boolean>(false);

  /** Warteschlange für mehrere direkte Unlocks nacheinander. */
  private readonly unlockToastQueue: AchievementId[] = [];

  /** Timeout-ID für den automatischen Dismiss der Notification. */
  private activeUnlockTimeoutId: number | null = null;

  /** Timeout-ID für das verzögerte Platin-Popup nach der Platin-Notification. */
  private platinumModalTimeoutId: number | null = null;

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

  /** Sichtbarkeit des großen Platin-Abschluss-Popups. */
  readonly isPlatinumModalVisible = computed<boolean>(() => this.platinumModalVisibleSignal());

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
      this.unlockPlatinumCompletion(id);
    }
  }

  /** Öffnet das große Platin-Abschluss-Popup manuell. */
  showPlatinumModal(): void {
    this.clearPlatinumModalTimeout();
    this.platinumModalVisibleSignal.set(true);
  }

  /** Schließt das große Platin-Abschluss-Popup. */
  dismissPlatinumModal(): void {
    this.clearPlatinumModalTimeout();
    this.platinumModalVisibleSignal.set(false);
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
    this.clearPlatinumModalTimeout();
    this.platinumModalVisibleSignal.set(false);
    this.stateSignal.set(this.persistState({ unlocked: [], hints: [] }));
  }


  /** Schaltet die Platin-Trophäe frei, sobald alle anderen Trophäen aktiv sind. */
  private unlockPlatinumCompletion(lastUnlockedId: AchievementId): void {
    if (lastUnlockedId === 'platinum-complete') {
      return;
    }

    const state = this.stateSignal();
    const regularIds = this.definitions.filter((definition) => definition.id !== 'platinum-complete').map((definition) => definition.id);
    const allRegularUnlocked = regularIds.every((id) => state.unlocked.includes(id));

    if (!allRegularUnlocked || state.unlocked.includes('platinum-complete')) {
      return;
    }

    this.stateSignal.set(this.persistState({ ...state, unlocked: [...state.unlocked, 'platinum-complete'] }));
    this.enqueueUnlockToast('platinum-complete');
  }

  /** Liest den Fortschritt aus LocalStorage. */
  private readStoredState(): StoredAchievementState {
    try {
      const value = localStorage.getItem(this.storageKey);
      const parsed = value ? JSON.parse(value) as Partial<StoredAchievementState> : null;

      const unlocked = this.validIds(this.migrateLegacyAchievementIds(parsed?.unlocked));
      const hints = this.validIds(this.migrateLegacyAchievementIds(parsed?.hints));
      const regularIds = this.definitions.filter((definition) => definition.id !== 'platinum-complete').map((definition) => definition.id);
      const normalizedUnlocked = unlocked.includes('platinum-complete') && !regularIds.every((id) => unlocked.includes(id))
        ? unlocked.filter((id) => id !== 'platinum-complete')
        : unlocked;

      return {
        unlocked: normalizedUnlocked,
        hints,
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

    if (nextId === 'platinum-complete') {
      this.schedulePlatinumModal();
    }

    this.activeUnlockTimeoutId = window.setTimeout(() => this.dismissActiveUnlock(), 4200);
  }

  /** Plant das große Platin-Popup zwei Sekunden nach Start der Platin-Notification. */
  private schedulePlatinumModal(): void {
    this.clearPlatinumModalTimeout();
    this.platinumModalTimeoutId = window.setTimeout(() => {
      this.platinumModalTimeoutId = null;
      this.platinumModalVisibleSignal.set(true);
    }, 2000);
  }

  /** Entfernt ein noch ausstehendes Platin-Popup-Timeout. */
  private clearPlatinumModalTimeout(): void {
    if (this.platinumModalTimeoutId === null) {
      return;
    }

    window.clearTimeout(this.platinumModalTimeoutId);
    this.platinumModalTimeoutId = null;
  }

  /** Migriert den früheren kommerziellen Platin-Identifier, ohne bestehenden lokalen Fortschritt zu verlieren. */
  private migrateLegacyAchievementIds(values: unknown): unknown {
    if (!Array.isArray(values)) {
      return values;
    }

    return values.map((value) => value === 'platinum-discount' ? 'platinum-complete' : value);
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
      description: 'Du hast dein erstes MS-DOS-Fenster ohne Sentimentalität konsequent geschlossen.',
      hint: 'Schließe irgendein MS-DOS-Fenster. Hauptsache ohne Sentimentalität.',
    },
    'coffee-glitch': {
      title: 'Koffeinfehler',
      description: 'err, 404 Koffeein not found.',
      hint: 'Ein guter Tag startet mit einer Tasse Kaffee.',
    },
    'weird-units': {
      title: 'Einheitenkrise',
      description: 'Du hast normale Maße erfolgreich in Snacks umgerechnet.',
      hint: 'Nicht alles muss in Zentimetern gemessen werden.',
    },
    'sugar-covered': {
      title: 'Tagesbedarf gedeckt',
      description: 'Tagesbedarf an Zucker ist gedeckt.',
      hint: 'Die WHO empfiehlt max. 50g Zucker am Tag.',
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
    'trash-dunk': {
      title: 'Papierkorb-Korb',
      description: 'Willkommen in der Digitalisierung. Reduziere Papiermüll!',
      hint: 'Rette den Planeten.',
    },
    'blood-complete': {
      title: 'Betriebsarzt',
      description: 'Das Dashboard behauptet, dass Sie zu 99,9% Hammer sind.',
      hint: 'Geh mal zum Arzt!',
    },
    'cta-contact': {
      title: 'Schwerkraft besiegt',
      description: 'you can touch this und jonglieren - cool',
      hint: 'Besiege die Schwerkraft.',
    },
    'skilled-driver': {
      title: 'Versierter Fahrer',
      description: 'Zuverlässiger als die Deutsche Bahn.',
      hint: 'Stelle deine Fahrkünste unter Beweis.',
    },
    'rescue-lane-404': {
      title: '404 Rettungsgasse not found',
      description: 'Denk daran: immer eine Rettungsgasse bilden!',
      hint: 'Jeden Morgen Stau auf der CTA.',
    },
    'world-upside-down': {
      title: 'Verkehrte Welt',
      description: 'Sieh die Welt aus anderen Augen.',
      hint: 'Passe das Weberlebnis an.',
    },
    'loyal-companion': {
      title: 'I feel good',
      description: 'Sie wird dort, immer auf dich warten.',
      hint: 'Finde einen treuen Begleiter.',
    },
    'platinum-complete': {
      title: 'Platin freigeschaltet',
      description: 'Du hast alle versteckten Details gefunden. 100 % Portfolio erkundet – Ruhm freigeschaltet.',
      hint: 'Schalte alle anderen Trophäen frei und vervollständige die Experience.',
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
      description: 'You closed your first MS-DOS window with absolutely no sentimentality.',
      hint: 'Close any MS-DOS window. Preferably without sentimentality.',
    },
    'coffee-glitch': {
      title: 'Caffeine Fault',
      description: 'err, 404 caffeine not found.',
      hint: 'A good day starts with a cup of coffee.',
    },
    'weird-units': {
      title: 'Unit Crisis',
      description: 'You successfully converted normal measurements into snacks.',
      hint: 'Not everything has to be measured in centimeters.',
    },
    'sugar-covered': {
      title: 'Daily Needs Covered',
      description: 'Your daily sugar needs are covered.',
      hint: 'The WHO recommends a maximum of 50g sugar per day.',
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
    'trash-dunk': {
      title: 'Trash Dunk',
      description: 'Welcome to digitalization. Reduce paper waste!',
      hint: 'Save the planet.',
    },
    'blood-complete': {
      title: 'Company Doctor',
      description: 'The dashboard claims you are 99.9% awesome.',
      hint: 'Go see a doctor!',
    },
    'cta-contact': {
      title: 'Gravity Defeated',
      description: 'you can touch this and juggle - cool',
      hint: 'Defeat gravity.',
    },
    'skilled-driver': {
      title: 'Skilled Driver',
      description: 'More reliable than Deutsche Bahn.',
      hint: 'Put your driving skills to the test.',
    },
    'rescue-lane-404': {
      title: '404 Rescue lane not found',
      description: 'Remember: always leave an emergency corridor!',
      hint: 'Traffic jam on the CTA every morning.',
    },
    'world-upside-down': {
      title: 'Upside Down',
      description: 'See the world through different eyes.',
      hint: 'Adjust the web experience.',
    },
    'loyal-companion': {
      title: 'I Feel Good',
      description: 'She will always be waiting for you there.',
      hint: 'Find a loyal companion.',
    },
    'platinum-complete': {
      title: 'Platinum Unlocked',
      description: 'You found every hidden detail. 100% of the portfolio explored – glory unlocked.',
      hint: 'Unlock every other trophy and complete the experience.',
    },
  },
};
