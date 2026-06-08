/* src/app/pages/project-detail-page/project-detail-page.component.ts */

/**
 * @file Projekt-Detailseite.
 * @description Rendert SEO-freundliche Detailseiten mit projektspezifischen Deep-Dive-, App-Stack- und Evidence-Modulen.
 */

import { Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProjectAppModule, ProjectCatalogSpread, ProjectGalleryItem } from '../../core/models/portfolio.models';
import { RevealOnScrollDirective } from '../../shared/reveal-on-scroll.directive';
import { LanguageService } from '../../core/services/language.service';
import { AchievementService } from '../../core/services/achievement.service';
import { SeoService } from '../../core/services/seo.service';

/** Detailseite für einzelne Projekte. */
@Component({
  selector: 'bp-project-detail-page',
  standalone: true,
  imports: [RouterLink, RevealOnScrollDirective],
  templateUrl: './project-detail-page.component.html',
  styleUrl: './project-detail-page.component.scss',
})
export class ProjectDetailPageComponent {
  /** Aktive Route mit Projekt-Slug. */
  private readonly route = inject(ActivatedRoute);

  /** Sprachservice für Inhalte. */
  private readonly languageService = inject(LanguageService);

  /** SEO-Service für Detailseiten-Meta-Daten. */
  private readonly seoService = inject(SeoService);

  /** Achievement-Service für geschlossene MS-DOS-Fenster. */
  private readonly achievementService = inject(AchievementService);

  /** Aktueller Slug aus der Route. */
  private readonly slug = signal<string>('');

  /** Ausgewählter Architektur-Knoten im Deep-Dive-Modul. */
  private readonly selectedArchitectureNodeId = signal<string>('');

  /** Ausgewählte App-Karte im gestapelten Hero-Modul. */
  private readonly selectedAppModuleId = signal<string>('');

  /** Geschlossene Terminalfenster im Hero. */
  private readonly closedTerminalWidgetIds = signal<readonly string[]>([]);

  /** Sichtbarkeit des Fallback-MS-DOS-Terminalfensters im Hero. */
  readonly isTerminalVisible = signal<boolean>(true);

  /** Sichtbarkeit des technischen Hinweisfensters im Deep-Dive. */
  readonly isCaseNoteVisible = signal<boolean>(true);

  /** Aktuell ausgewählte Doppelseite im Designkatalog. */
  readonly activeCatalogSpreadIndex = signal<number>(0);

  /** Aktuell geöffneter Masonry-Galerieeintrag in der Lightbox. */
  readonly activeGalleryLightboxIndex = signal<number | null>(null);

  /** Sichtbarkeit des Inhaltsverzeichnis-Overlays im Designkatalog. */
  readonly isCatalogMenuOpen = signal<boolean>(false);

  /** Übersetzter Inhalt der aktuellen Sprache. */
  readonly content = computed(() => this.languageService.content());

  /** Ausgewähltes Projekt passend zum Route-Slug. */
  readonly project = computed(() => this.content().projects.find((project) => project.slug === this.slug()));

  /** Aktiver Architektur-Knoten mit Fallback auf den ersten Eintrag. */
  readonly activeArchitectureNode = computed(() => {
    const nodes      = this.project()?.architecture ?? [];
    const selectedId = this.selectedArchitectureNodeId();

    return nodes.find((node) => node.id === selectedId) ?? nodes[0];
  });

  /** Aktive App-Karte im Hero mit Fallback auf die erste Karte. */
  readonly activeAppModule = computed<ProjectAppModule | undefined>(() => {
    const modules    = this.project()?.appModules ?? [];
    const selectedId = this.selectedAppModuleId();

    return modules.find((module) => module.id === selectedId) ?? modules[0];
  });

  /** Index der aktiven App-Karte für Stack-Offset und Pagination. */
  readonly activeAppModuleIndex = computed(() => {
    const modules    = this.project()?.appModules ?? [];
    const selectedId = this.activeAppModule()?.id;
    const index      = modules.findIndex((module) => module.id === selectedId);

    return Math.max(index, 0);
  });

  /** Aktive Doppelseite des digitalen Designkatalogs. */
  readonly activeCatalogSpread = computed<ProjectCatalogSpread | undefined>(() => {
    const spreads = this.project()?.catalogShowcase?.spreads ?? [];
    const index   = this.getNormalizedCatalogSpreadIndex();

    return spreads[index] ?? spreads[0];
  });

  /** Aktiver Galerieeintrag für die Lightbox des Designkatalogs. */
  readonly activeGalleryLightboxItem = computed<ProjectGalleryItem | undefined>(() => {
    const index = this.activeGalleryLightboxIndex();

    if (index === null) {
      return undefined;
    }

    return this.project()?.gallery[index];
  });

  /** Initialisiert Route- und SEO-Reaktionen. */
  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => this.updateSlug(params.get('slug') ?? ''));

    effect(() => this.updateSeo());
  }

  /** Setzt den aktuell sichtbaren Architektur-Knoten. */
  selectArchitectureNode(nodeId: string): void {
    this.selectedArchitectureNodeId.set(nodeId);
  }

  /** Setzt die aktive App-Karte im Hero-Stack. */
  selectAppModule(moduleId: string): void {
    this.selectedAppModuleId.set(moduleId);
  }


  /** Wechselt im Hero-Stack zur nächsten oder vorherigen App-Karte. */
  selectAdjacentAppModule(direction: 1 | -1): void {
    const modules = this.project()?.appModules ?? [];

    if (!modules.length) {
      return;
    }

    const currentIndex = this.activeAppModuleIndex();
    const nextIndex    = (currentIndex + direction + modules.length) % modules.length;

    this.selectAppModule(modules[nextIndex]?.id ?? modules[0].id);
  }

  /** Wählt eine konkrete Katalog-Doppelseite aus. */
  selectCatalogSpread(index: number): void {
    const spreads = this.project()?.catalogShowcase?.spreads ?? [];

    if (!spreads.length) {
      return;
    }

    this.activeCatalogSpreadIndex.set((index + spreads.length) % spreads.length);
  }

  /** Öffnet oder schließt das Inhaltsverzeichnis des Designkatalogs. */
  toggleCatalogMenu(): void {
    this.isCatalogMenuOpen.update((isOpen) => !isOpen);
  }

  /** Schließt das Inhaltsverzeichnis des Designkatalogs. */
  closeCatalogMenu(): void {
    this.isCatalogMenuOpen.set(false);
  }

  /** Wechselt zur vorherigen oder nächsten Katalog-Doppelseite. */
  selectAdjacentCatalogSpread(direction: 1 | -1): void {
    this.selectCatalogSpread(this.getNormalizedCatalogSpreadIndex() + direction);
  }

  /** Öffnet einen Eintrag der Design-Masonry-Galerie in der Lightbox. */
  openGalleryLightbox(index: number): void {
    const items = this.project()?.gallery ?? [];

    if (!items[index]) {
      return;
    }

    this.activeGalleryLightboxIndex.set(index);
  }

  /** Schließt die Design-Masonry-Lightbox. */
  closeGalleryLightbox(): void {
    this.activeGalleryLightboxIndex.set(null);
  }

  /** Wechselt in der Design-Masonry-Lightbox zum vorherigen oder nächsten Bild. */
  selectAdjacentGalleryItem(direction: 1 | -1): void {
    const items = this.project()?.gallery ?? [];
    const index = this.activeGalleryLightboxIndex();

    if (!items.length || index === null) {
      return;
    }

    this.activeGalleryLightboxIndex.set((index + direction + items.length) % items.length);
  }

  /** Prüft, ob ein Terminalfenster im Hero noch sichtbar ist. */
  isTerminalWidgetVisible(widgetId: string): boolean {
    return !this.closedTerminalWidgetIds().includes(widgetId);
  }

  /** Schließt ein einzelnes Terminalfenster im Hero. */
  closeTerminalWidget(widgetId: string): void {
    this.achievementService.unlock('nostalgia-hater');
    this.closedTerminalWidgetIds.update((ids) => (ids.includes(widgetId) ? ids : [...ids, widgetId]));
  }

  /** Schließt das Fallback-MS-DOS-Terminalfenster im Hero. */
  closeTerminal(): void {
    this.achievementService.unlock('nostalgia-hater');
    this.isTerminalVisible.set(false);
  }

  /** Schließt das technische Hinweisfenster im Deep-Dive. */
  closeCaseNote(): void {
    this.achievementService.unlock('nostalgia-hater');
    this.isCaseNoteVisible.set(false);
  }

  /** Aktualisiert den Slug und setzt Detailseiten-Zustände zurück. */
  private updateSlug(slug: string): void {
    this.slug.set(slug);
    this.selectedArchitectureNodeId.set('');
    this.selectedAppModuleId.set('');
    this.closedTerminalWidgetIds.set([]);
    this.activeCatalogSpreadIndex.set(0);
    this.activeGalleryLightboxIndex.set(null);
    this.isCatalogMenuOpen.set(false);
    this.isTerminalVisible.set(true);
    this.isCaseNoteVisible.set(true);
  }

  /** Ermittelt den gültigen Katalog-Index für aktuelle Projektdaten. */
  private getNormalizedCatalogSpreadIndex(): number {
    const spreads = this.project()?.catalogShowcase?.spreads ?? [];

    if (!spreads.length) {
      return 0;
    }

    return Math.min(Math.max(this.activeCatalogSpreadIndex(), 0), spreads.length - 1);
  }

  /** Schreibt SEO-Daten für Treffer oder Missing-State. */
  private updateSeo(): void {
    const project = this.project();

    if (project) {
      this.seoService.setProjectSeo(project);
      return;
    }

    this.seoService.setNotFoundSeo(this.content().notFoundTitle, this.content().notFoundText);
  }
}
