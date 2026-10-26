/* src/app/core/services/achievement.service.spec.ts */
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AchievementService } from './achievement.service';
import { LanguageService } from './language.service';
import { STUDY_ACHIEVEMENTS } from '../../../design-studies/shared/achievement-catalog.js';
import { readStudyAchievements, resetStudyAchievements, STUDY_STORAGE_PREFIX, unlockStudyAchievement } from '../../../design-studies/shared/achievement-progress.js';

/** Prüft DLC-Speicher, Tab-Synchronisierung und die unveränderten Platin-Voraussetzungen. */
describe('AchievementService mit Design Studies DLC', () => {
  const language = signal<'de' | 'en'>('de');
  function create(): AchievementService {
    TestBed.configureTestingModule({ providers: [{ provide: LanguageService, useValue: { language } }] });
    return TestBed.inject(AchievementService);
  }
  beforeEach(() => { localStorage.clear(); resetStudyAchievements(); language.set('de'); vi.useFakeTimers(); });
  afterEach(() => { TestBed.resetTestingModule(); vi.clearAllTimers(); vi.useRealTimers(); });

  it('zählt den DLC separat und erhält vollständige deutsche und englische Texte', () => {
    const service = create();
    expect(service.achievements().filter(item => item.dlc)).toHaveLength(9);
    for (const lang of ['de', 'en'] as const) {
      language.set(lang);
      for (const item of service.achievements()) {
        expect(item.title.length).toBeGreaterThan(3);
        expect(item.description.length).toBeGreaterThan(10);
        expect(item.hint.length).toBeGreaterThan(10);
      }
    }
  });

  it('verdient und erhält Platin auch ohne DLC-Fortschritt', () => {
    let service = create();
    for (const item of service.achievements().filter(item => !item.dlc && item.id !== 'platinum-complete')) service.unlock(item.id);
    expect(service.achievements().find(item => item.id === 'platinum-complete')?.unlocked).toBe(true);
    expect(readStudyAchievements()).toEqual([]);
    TestBed.resetTestingModule();
    service = create();
    expect(service.achievements().find(item => item.id === 'platinum-complete')?.unlocked).toBe(true);
  });

  it('zählt für Feldforschung vier Studien statt vier Trophäen', () => {
    create();
    for (const id of ['study-growth-ascent', 'study-growth-discovery', 'study-type-poster', 'study-type-reform'] as const) unlockStudyAchievement(id);
    expect(readStudyAchievements()).not.toContain('study-field-research');
    unlockStudyAchievement('study-scoop-mix');
    expect(readStudyAchievements()).not.toContain('study-field-research');
    unlockStudyAchievement('study-fold-perspectives');
    expect(readStudyAchievements()).toContain('study-field-research');
  });

  it('speichert parallele Studien einzeln und meldet doppelte Unlocks nicht erneut', () => {
    const service = create();
    const notify = vi.fn();
    document.addEventListener('bp:study-unlocked', notify);
    unlockStudyAchievement('study-scoop-mix');
    unlockStudyAchievement('study-scoop-mix');
    localStorage.setItem(STUDY_STORAGE_PREFIX + 'study-type-poster', '1');
    window.dispatchEvent(new StorageEvent('storage', { key: STUDY_STORAGE_PREFIX + 'study-type-poster', newValue: '1' }));
    expect(service.achievements().filter(item => item.dlc && item.unlocked)).toHaveLength(2);
    expect(notify).toHaveBeenCalledOnce();
    expect(service.activeUnlock()).toBeNull();
    document.removeEventListener('bp:study-unlocked', notify);
  });

  it('behält Hauptspiel, Hinweise und Platin beim Hinzufügen von Studien-Erfolgen', () => {
    const service = create();
    service.unlock('loader-human');
    service.revealHint('coffee-glitch');
    unlockStudyAchievement('study-growth-ascent');
    const base = JSON.parse(localStorage.getItem('bp-achievements-v1')!);
    expect(base.unlocked).toEqual(['loader-human']);
    expect(base.hints).toContain('coffee-glitch');
    expect(service.unlockedCount()).toBe(2);
  });

  it('behält bei blockiertem Speicher den DLC-Erfolg für die aktuelle Sitzung', () => {
    const storage = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Blocked', 'SecurityError'); });
    unlockStudyAchievement('study-bentendo-turn');
    expect(readStudyAchievements()).toContain('study-bentendo-turn');
    storage.mockRestore();
    resetStudyAchievements();
    expect(readStudyAchievements()).toEqual([]);
  });

  it('setzt Hauptspiel und DLC gemeinsam zurück und synchronisiert einen entfernten Reset', () => {
    const service = create();
    service.unlock('loader-human');
    unlockStudyAchievement('study-scoop-mix');
    service.resetProgress();
    expect(service.unlockedCount()).toBe(0);
    expect(readStudyAchievements()).toEqual([]);
    localStorage.setItem(STUDY_STORAGE_PREFIX + STUDY_ACHIEVEMENTS[0].id, '1');
    window.dispatchEvent(new StorageEvent('storage', { key: null }));
    expect(service.unlockedCount()).toBe(1);
    localStorage.clear();
    window.dispatchEvent(new StorageEvent('storage', { key: null }));
    expect(service.unlockedCount()).toBe(0);
  });
});
