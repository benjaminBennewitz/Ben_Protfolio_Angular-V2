/* src/app/layout/app-runtime/app-runtime.component.spec.ts */

import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AchievementService } from '../../core/services/achievement.service';
import { LanguageService } from '../../core/services/language.service';
import { TabTitleService } from '../../core/services/tab-title.service';
import { AppRuntimeComponent } from './app-runtime.component';

/** Prüft die manuelle Loader-Trophäe und reaktive Synchronisierung des Rückkehr-Titels. */
describe('AppRuntimeComponent', /** Gruppiert die Verhaltensprüfungen der Layout-Komponente. */ () => {
  afterEach(/** Entfernt Testkomponenten, Browser-Stubs und ausstehende Timer. */ () => { TestBed.resetTestingModule(); });

  it('vergibt ohne manuelle Bestätigung keine Trophäe und folgt späteren Sprachänderungen', /** Vergibt ohne manuelle Bestätigung keine Trophäe und folgt späteren Sprachänderungen. */ () => {

    const content = signal({ meta: { hiddenTitle: 'Komm zurück' } }); // Reaktiver Sprachinhalt für den inaktiven Browser-Tab.
    const unlock = vi.fn();                                           // Erfasst die Vergabe der Loader-Trophäe.
    const setHiddenTitle = vi.fn();                                   // Erfasst die Synchronisierung des Rückkehr-Titels.

    TestBed.configureTestingModule({ providers: [
      { provide: LanguageService, useValue: { content } },
      { provide: AchievementService, useValue: { unlock } },
      { provide: TabTitleService, useValue: { setHiddenTitle } },
    ] });

    const fixture = TestBed.createComponent(AppRuntimeComponent); // Gerenderte Angular-Testkomponente mit realem Template.

    fixture.detectChanges();
    expect(unlock).not.toHaveBeenCalled();
    expect(setHiddenTitle).toHaveBeenLastCalledWith('Komm zurück');
    content.set({ meta: { hiddenTitle: 'Come back' } });
    fixture.detectChanges();
    expect(setHiddenTitle).toHaveBeenLastCalledWith('Come back');
    expect(unlock).not.toHaveBeenCalled();
    fixture.componentRef.setInput('loaderHumanConfirmed', true);
    fixture.detectChanges();
    expect(unlock).toHaveBeenCalledExactlyOnceWith('loader-human');
    content.set({ meta: { hiddenTitle: 'Noch da?' } });
    fixture.detectChanges();
    expect(unlock).toHaveBeenCalledTimes(1);
  });
});
