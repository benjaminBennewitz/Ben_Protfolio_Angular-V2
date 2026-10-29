/* src/app/pages/project-detail-page/project-detail-page.component.spec.ts */

import { computed, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PORTFOLIO_TRANSLATIONS } from '../../core/data/portfolio-content';
import { LanguageService } from '../../core/services/language.service';
import { AchievementService } from '../../core/services/achievement.service';
import { SeoService } from '../../core/services/seo.service';
import { ProjectDetailPageComponent } from './project-detail-page.component';

/** Prüft Route-Reuse, Modulnavigation, Lightbox-Sperre und fehlende Projekte. */
describe('ProjectDetailPageComponent', /** Gruppiert die Verhaltensprüfungen der Layout-Komponente. */() => {

  let fixture: ComponentFixture<ProjectDetailPageComponent>;         // Gerenderte Angular-Testkomponente mit realem Template.
  let page: ProjectDetailPageComponent;                              // Zu prüfende Seitenkomponente.
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>; // Reaktiver Slug der aktuellen Projekt-Route.
  const language = signal<'de' | 'en'>('de');                        // Aktive Testsprache der Seite.

  beforeEach(/** Bereitet isolierte Komponenten-, Browser- und Service-Zustände vor. */() => {
    vi.useFakeTimers();
    vi.spyOn(window, 'scrollTo').mockImplementation(/** Stellt die für diesen Test vorgegebene Browser-Reaktion bereit. */() => undefined);
    language.set('de');
    params = new BehaviorSubject(convertToParamMap({ slug: 'intranet' }));
    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: params } },
        { provide: LanguageService, useValue: { language, content: computed(/** Liefert den deutschen Portfolio-Inhalt ohne Persistenz. */() => PORTFOLIO_TRANSLATIONS[language()]) } },
        { provide: AchievementService, useValue: { unlock: vi.fn() } },
        { provide: SeoService, useValue: { setProjectSeo: vi.fn(), setNotFoundSeo: vi.fn() } },
      ]
    });
    TestBed.overrideComponent(ProjectDetailPageComponent, { set: { template: '', imports: [] } });
    fixture = TestBed.createComponent(ProjectDetailPageComponent);
    page = fixture.componentInstance;
    fixture.detectChanges();
  });
  afterEach(/** Entfernt Testkomponenten, Browser-Stubs und ausstehende Timer. */() => {
    TestBed.resetTestingModule();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.documentElement.classList.remove('bp-lightbox-open');
    document.body.classList.remove('bp-lightbox-open');
  });

  it('setzt beim Slug-Wechsel lokale Fensterzustände zurück und folgt der aktiven Sprache', /** Setzt beim Slug-Wechsel lokale Fensterzustände zurück und folgt der aktiven Sprache. */() => {
    page.closeTerminal();
    page.closeCaseNote();
    page.closeTerminalWidget('status');
    params.next(convertToParamMap({ slug: 'blutanalyse' }));
    fixture.detectChanges();
    expect(page.project()?.slug).toBe('blutanalyse');
    expect(page.isTerminalVisible()).toBe(true);
    expect(page.isCaseNoteVisible()).toBe(true);
    expect(page.isTerminalWidgetVisible('status')).toBe(true);
    language.set('en');
    fixture.detectChanges();
    expect(TestBed.inject(SeoService).setProjectSeo).toHaveBeenLastCalledWith(page.project());
  });

  it('behandelt unbekannte Slugs als Missing-State mit passenden SEO-Daten', /** Behandelt unbekannte Slugs als Missing-State mit passenden SEO-Daten. */() => {
    params.next(convertToParamMap({ slug: 'missing-project' }));
    fixture.detectChanges();
    expect(page.project()).toBeUndefined();
    expect(TestBed.inject(SeoService).setNotFoundSeo).toHaveBeenCalledWith(PORTFOLIO_TRANSLATIONS.de.notFoundTitle, PORTFOLIO_TRANSLATIONS.de.notFoundText);
    expect(/** Stellt die für diesen Test vorgegebene Browser-Reaktion bereit. */() => page.selectAdjacentAppModule(1)).not.toThrow();
    page.openGalleryLightbox(0);
    expect(page.activeGalleryLightboxIndex()).toBeNull();
  });

  it('navigiert App-Module in beide Richtungen mit Umlauf an den Grenzen', /** Navigiert App-Module in beide Richtungen mit Umlauf an den Grenzen. */() => {

    const modules = page.project()!.appModules!; // App-Module des ausgewählten Projekts.

    expect(modules.length).toBeGreaterThan(1);
    page.selectAdjacentAppModule(-1);
    expect(page.activeAppModule()?.id).toBe(modules[modules.length - 1].id);
    page.selectAdjacentAppModule(1);
    expect(page.activeAppModule()?.id).toBe(modules[0].id);
  });

  it('ignoriert ungültige Galerieindizes und gibt den Scroll-Lock bei Escape wieder frei', /** Ignoriert ungültige Galerieindizes und gibt den Scroll-Lock bei Escape wieder frei. */() => {
    page.openGalleryLightbox(-1);
    expect(page.activeGalleryLightboxIndex()).toBeNull();
    page.openGalleryLightbox(0);
    fixture.detectChanges();
    expect(document.documentElement.classList.contains('bp-lightbox-open')).toBe(true);
    page.handleWindowKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(page.activeGalleryLightboxIndex()).toBeNull();
    expect(document.body.classList.contains('bp-lightbox-open')).toBe(false);
  });

  it('entfernt eine offene Lightbox-Sperre und ausstehende Scroll-Frames beim Zerstören', /** Entfernt eine offene Lightbox-Sperre und ausstehende Scroll-Frames beim Zerstören. */() => {
    page.openGalleryLightbox(0);
    fixture.detectChanges();
    fixture.destroy();
    expect(document.documentElement.classList.contains('bp-lightbox-open')).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
});
