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
      hint: 'Im Hero-Dialog sind Buttons, die mehr machen als nur nett aussehen.',
    },
    'nostalgia-hater': {
      title: 'Ich hasse Nostalgie',
      description: 'Du hast den ersten MS-DOS-Dialog ohne Sentimentalität konsequent geschlossen.',
      hint: 'Ganz oben im Hero wartet ein kleines X auf eine klare Entscheidung.',
    },
    'coffee-glitch': {
      title: 'Koffeinfehler',
      description: 'Du hast das About-Bild in den kontrollierten Kaffee-Glitch geschickt.',
      hint: 'Im About-Bereich wartet ein kleiner Button auf sehr schlechte Kaffeelaune.',
    },
    'eye-poke': {
      title: 'Nicht ins Auge',
      description: 'Du hast das Intranet-Auge angestupst. Es nimmt das persönlich.',
      hint: 'Projekt eins beobachtet dich. Vielleicht beobachtest du zurück.',
    },
    'bomb-defused': {
      title: 'Boom-Management',
      description: 'Du hast die Bombe gezündet und das Chaos aus dem Preview entfernt.',
      hint: 'Projekt eins hat ein zweites Asset, das nicht nur Dekoration ist.',
    },
    'game-oneup': {
      title: '1UP-Regen',
      description: 'Alle Game-Assets haben den Boden erreicht und die kleine Bonussequenz ausgelöst.',
      hint: 'Bleib beim Browser-Game, bis die fallenden Assets ihren Job erledigt haben.',
    },
    'trash-dunk': {
      title: 'Papierkorb-Korb',
      description: 'Du hast die Papierkugel sauber in den Trash Bin geworfen.',
      hint: 'Beim Taskboard gibt es Müll. Und manchmal möchte Müll fliegen.',
    },
    'blood-complete': {
      title: 'Labor sauber',
      description: 'Die Blutegel-Analyse ist vollständig durchgelaufen.',
      hint: 'Beim Blutanalyse-Projekt startet ein Sticker mehr als nur eine Grafik.',
    },
    'cta-contact': {
      title: 'Kontaktportal',
      description: 'Du hast die Chaos-CTA als Abkürzung zum Kontaktbereich genutzt.',
      hint: 'Eine Section mit beweglichen Steinen ist eigentlich ein großer Button.',
    },
    'loyal-companion': {
      title: 'I feel good',
      description: 'Du hast Fülli gefunden und deinen treuen Begleiter im Footer entdeckt.',
      hint: 'Im Footer sitzt ein kleiner Freund. Fahr mal vorsichtig mit der Maus hin.',
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
      hint: 'The hero dialog has buttons that do more than look nice.',
    },
    'nostalgia-hater': {
      title: 'I Hate Nostalgia',
      description: 'You closed the first MS-DOS dialog with absolutely no sentimentality.',
      hint: 'At the top of the hero, a tiny X is waiting for a clear decision.',
    },
    'coffee-glitch': {
      title: 'Caffeine Fault',
      description: 'You pushed the about image into a controlled coffee glitch.',
      hint: 'A tiny button in the about section is in a very bad coffee mood.',
    },
    'eye-poke': {
      title: 'Do Not Poke',
      description: 'You poked the intranet eye. It took that personally.',
      hint: 'Project one is watching you. Maybe you should watch back.',
    },
    'bomb-defused': {
      title: 'Boom Management',
      description: 'You triggered the bomb and removed the chaos from the preview.',
      hint: 'Project one has a second asset that is more than decoration.',
    },
    'game-oneup': {
      title: '1UP Rain',
      description: 'All game assets reached the ground and triggered the small bonus sequence.',
      hint: 'Stay with the browser game until the falling assets finish their job.',
    },
    'trash-dunk': {
      title: 'Trash Dunk',
      description: 'You landed the paper ball cleanly inside the trash bin.',
      hint: 'The taskboard has trash. And sometimes trash wants to fly.',
    },
    'blood-complete': {
      title: 'Lab Cleared',
      description: 'The leech analysis completed successfully.',
      hint: 'In the blood analysis project, a sticker starts more than just a graphic.',
    },
    'cta-contact': {
      title: 'Contact Portal',
      description: 'You used the chaos CTA as a shortcut to the contact section.',
      hint: 'A section with moving tiles is actually one giant button.',
    },
    'loyal-companion': {
      title: 'I Feel Good',
      description: 'You found Fülli and discovered your loyal companion in the footer.',
      hint: 'There is a tiny companion in the footer. Hover carefully and see what happens.',
    },
  },
};
