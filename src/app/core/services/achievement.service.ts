/* src/app/core/services/achievement.service.ts */

/**
 * @file Achievement-System des Portfolios.
 * @description Verwaltet versteckte Trophäen, LocalStorage-Fortschritt und übersetzbare Hinweise.
 */

import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import type { StudyAchievementId } from '../../../design-studies/shared/achievement-catalog.js';
import { readStudyAchievements, resetStudyAchievements, STUDY_STORAGE_PREFIX, unlockStudyAchievement } from '../../../design-studies/shared/achievement-progress.js';
import { ACHIEVEMENT_DEFINITIONS, ACHIEVEMENT_TRANSLATIONS } from '../data/achievement-data';
import type { AchievementId, AchievementView, StoredAchievementState } from '../models/achievement.models';
import { LanguageService } from './language.service';

/** Lokales Achievement-System ohne Backend-Abhängigkeit. */
@Injectable({ providedIn: 'root' })
export class AchievementService {
  private readonly storageKey = 'bp-achievements-v1';                                             // Schlüssel für den Fortschritt im LocalStorage.
  private readonly languageService = inject(LanguageService);                                     // Sprachservice für übersetzte Achievement-Texte.
  private readonly definitions = ACHIEVEMENT_DEFINITIONS;                                         // Feste Reihenfolge der Trophäen aus den Inhaltsdaten.

  private readonly stateSignal = signal<StoredAchievementState>(this.readStoredState());          // Interner Fortschrittszustand.
  private readonly studyUnlocks = signal<readonly StudyAchievementId[]>(readStudyAchievements()); // Getrennter DLC-Speicher verhindert Konflikte mit parallel geöffneten Studien-Tabs.

  /** Synchronisiert lokale Erfolge auch bei Rückkehr aus einer eigenständigen Studie. */
  constructor() {

    /** Liest den aktuellen DLC-Fortschritt erneut ein. */
    const refreshStudies = (): void => { this.studyUnlocks.set(readStudyAchievements()); };

    /** Synchronisiert geänderte Hauptspiel- und DLC-Speicherwerte. */
    const onStorage = (event: StorageEvent): void => {
      if (event.key === null || event.key.startsWith(STUDY_STORAGE_PREFIX)) refreshStudies();
      if (event.key === null || event.key === this.storageKey) this.stateSignal.set(this.readStoredState());
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', refreshStudies);
    document.addEventListener('bp:study-unlocked', refreshStudies);
    document.addEventListener('bp:study-reset', refreshStudies);
    inject(DestroyRef).onDestroy(/** Entfernt registrierte Listener und noch ausstehende Browser-Aufgaben. */() => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', refreshStudies);
      document.removeEventListener('bp:study-unlocked', refreshStudies);
      document.removeEventListener('bp:study-reset', refreshStudies);
      if (this.activeUnlockTimeoutId !== null) window.clearTimeout(this.activeUnlockTimeoutId);
      this.clearPlatinumModalTimeout();
    });
  }

  private readonly activeUnlockIdSignal = signal<AchievementId | null>(null); // Aktuell sichtbare Trophy-Notification.
  private readonly platinumModalVisibleSignal = signal<boolean>(false);       // Sichtbarkeit des großen Platin-Abschluss-Popups.
  private readonly unlockToastQueue: AchievementId[] = [];                    // Warteschlange für mehrere direkte Unlocks nacheinander.
  private activeUnlockTimeoutId: number | null = null;                        // Timeout-ID für den automatischen Dismiss der Notification.
  private platinumModalTimeoutId: number | null = null;                       // Timeout-ID für das verzögerte Platin-Popup nach der Platin-Notification.
  readonly achievements = computed<readonly AchievementView[]>(               // Sichtbare Achievement-Liste in aktiver Sprache.
    /** Sichtbare Achievement-Liste in aktiver Sprache. */
    () => {

      const state = this.stateSignal();                                               // Aktueller lokaler Achievement-Fortschritt.
      const translations = ACHIEVEMENT_TRANSLATIONS[this.languageService.language()]; // Trophäentexte in der aktiven Sprache.

      return this.definitions.map(/** Verbindet Definition, Übersetzung und Fortschrittszustand. */(definition) => ({
        ...definition,
        ...translations[definition.id],
        unlocked: definition.dlc ? this.studyUnlocks().includes(definition.id as StudyAchievementId) : state.unlocked.includes(definition.id),
        hintVisible: state.hints.includes(definition.id),
      }));
    }
  );

  readonly activeUnlock = computed<AchievementView | null>(                   // Aktuell sichtbare Trophy-Notification inklusive Übersetzung.
    /** Aktuell sichtbare Trophy-Notification inklusive Übersetzung. */
    () => {

      const activeId = this.activeUnlockIdSignal(); // ID der aktuell eingeblendeten Trophäe.

      return activeId ? this.achievements().find(/** Findet die aktuell eingeblendete Trophäe. */(achievement) => achievement.id === activeId) ?? null : null;
    }
  );

  readonly isPlatinumModalVisible = computed<boolean>(                        // Sichtbarkeit des großen Platin-Abschluss-Popups.
    /** Sichtbarkeit des großen Platin-Abschluss-Popups. */
    () => this.platinumModalVisibleSignal()
  );

  readonly unlockedCount = computed<number>(                                  // Anzahl freigeschalteter Trophäen.
    /** Anzahl freigeschalteter Trophäen. */
    () => this.achievements().filter(/** Prüft den Freischaltstatus einer Trophäe. */(achievement) => achievement.unlocked).length
  );

  readonly totalCount = computed<number>(                                     // Gesamtanzahl verfügbarer Trophäen.
    /** Gesamtanzahl verfügbarer Trophäen. */
    () => this.definitions.length
  );

  /** Schaltet eine Trophäe dauerhaft frei. */
  unlock(id: AchievementId): void {
    if (id.startsWith('study-')) {
      unlockStudyAchievement(id as StudyAchievementId);
      return;
    }

    let unlockedNow = false; // Kennzeichnet eine erstmalige Freischaltung.

    this.stateSignal.update(/** Ergänzt eine neue Freischaltung und bewahrt vorhandenen Fortschritt. */(state) => {
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
    this.stateSignal.update(/** Ergänzt einen bisher unsichtbaren Hinweis und persistiert ihn. */(state) => {
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
    window.setTimeout(/** Zeigt nach der Ausblendpause die nächste Trophäenmeldung. */() => this.showNextUnlockToast(), 160);
  }

  /** Setzt den lokalen Fortschritt zurück. */
  resetProgress(): void {
    resetStudyAchievements();
    this.studyUnlocks.set([]);
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

    const state = this.stateSignal();                                                                                                                                                                                                                        // Aktueller lokaler Achievement-Fortschritt.
    const regularIds = this.definitions.filter(/** Wählt Trophäen des Hauptspiels ohne Platin aus. */(definition) => !definition.dlc && definition.id !== 'platinum-complete').map(/** Liest die stabile ID der Trophäe. */(definition) => definition.id); // IDs des Hauptspiels ohne Platin und DLC.
    const allRegularUnlocked = regularIds.every(/** Prüft die Freischaltung im aktuellen Hauptspiel-Fortschritt. */(id) => state.unlocked.includes(id));                                                                                                    // Alle Hauptspiel-Trophäen sind bereits freigeschaltet.

    if (!allRegularUnlocked || state.unlocked.includes('platinum-complete')) {
      return;
    }

    this.stateSignal.set(this.persistState({ ...state, unlocked: [...state.unlocked, 'platinum-complete'] }));
    this.enqueueUnlockToast('platinum-complete');
  }

  /** Liest den Fortschritt aus LocalStorage. */
  private readStoredState(): StoredAchievementState {
    try {

      const value = localStorage.getItem(this.storageKey);                                                                                                                                                                                                     // Gespeicherter Achievement-Zustand als JSON-Text.
      const parsed = value ? JSON.parse(value) as Partial<StoredAchievementState> : null;                                                                                                                                                                      // Eingelesener, noch zu normalisierender Fortschritt.

      const unlocked = this.validIds(this.migrateLegacyAchievementIds(parsed?.unlocked)).filter(/** Schließt separat gespeicherte DLC-Freischaltungen aus. */ id => !id.startsWith('study-'));                                                                 // Validierte Freischaltungen des Hauptspiels.
      const hints = this.validIds(this.migrateLegacyAchievementIds(parsed?.hints));                                                                                                                                                                            // Validierte IDs bereits sichtbarer Hinweise.
      const regularIds = this.definitions.filter(/** Wählt Trophäen des Hauptspiels ohne Platin aus. */(definition) => !definition.dlc && definition.id !== 'platinum-complete').map(/** Liest die stabile ID der Trophäe. */(definition) => definition.id); // IDs des Hauptspiels ohne Platin und DLC.
      const normalizedUnlocked = unlocked.includes('platinum-complete') && !regularIds.every(/** Prüft, ob eine Hauptspiel-Trophäe bereits freigeschaltet ist. */(id) => unlocked.includes(id))                                                                       // Freischaltungen mit gültigem Platin-Abschluss.
        ? unlocked.filter(/** Entfernt einen noch nicht berechtigten Platin-Abschluss. */(id) => id !== 'platinum-complete')
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

    const nextId = this.unlockToastQueue.shift() ?? null; // Nächste wartende Trophäe oder null.

    if (!nextId) {
      return;
    }

    this.activeUnlockIdSignal.set(nextId);

    if (nextId === 'platinum-complete') {
      this.schedulePlatinumModal();
    }

    this.activeUnlockTimeoutId = window.setTimeout(/** Schließt die Trophäenmeldung nach Ablauf ihrer Anzeigedauer. */() => this.dismissActiveUnlock(), 4200);
  }

  /** Plant das große Platin-Popup zwei Sekunden nach Start der Platin-Notification. */
  private schedulePlatinumModal(): void {
    this.clearPlatinumModalTimeout();
    this.platinumModalTimeoutId = window.setTimeout(/** Öffnet das verzögerte Platin-Abschlussfenster. */() => {
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

    return values.map(/** Ersetzt die frühere Platin-ID unter Erhalt der übrigen Werte. */(value) => value === 'platinum-discount' ? 'platinum-complete' : value);
  }

  /** Filtert gespeicherte IDs auf bekannte Achievement-IDs. */
  private validIds(values: unknown): readonly AchievementId[] {

    const knownIds = new Set(this.definitions.map(/** Liest die stabile ID der Trophäe. */(definition) => definition.id)); // Bekannte Trophäen-IDs zur Validierung gespeicherter Werte.

    return Array.isArray(values)
      ? values.filter(/** Behält ausschließlich bekannte Trophäen-IDs als Zeichenketten. */(value): value is AchievementId => typeof value === 'string' && knownIds.has(value as AchievementId))
      : [];
  }
}
