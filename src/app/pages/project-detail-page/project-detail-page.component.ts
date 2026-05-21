/* src/app/pages/project-detail-page/project-detail-page.component.ts */

/**
 * @file Projekt-Detailseite.
 * @description Rendert SEO-freundliche Detailseiten mit projektspezifischen Deep-Dive-, App-Stack- und Evidence-Modulen.
 */

import { Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProjectAppModule } from '../../core/models/portfolio.models';
import { RevealOnScrollDirective } from '../../shared/reveal-on-scroll.directive';
import { LanguageService } from '../../core/services/language.service';
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

  /** Prüft, ob ein Terminalfenster im Hero noch sichtbar ist. */
  isTerminalWidgetVisible(widgetId: string): boolean {
    return !this.closedTerminalWidgetIds().includes(widgetId);
  }

  /** Schließt ein einzelnes Terminalfenster im Hero. */
  closeTerminalWidget(widgetId: string): void {
    this.closedTerminalWidgetIds.update((ids) => (ids.includes(widgetId) ? ids : [...ids, widgetId]));
  }

  /** Schließt das Fallback-MS-DOS-Terminalfenster im Hero. */
  closeTerminal(): void {
    this.isTerminalVisible.set(false);
  }

  /** Schließt das technische Hinweisfenster im Deep-Dive. */
  closeCaseNote(): void {
    this.isCaseNoteVisible.set(false);
  }

  /** Aktualisiert den Slug und setzt Detailseiten-Zustände zurück. */
  private updateSlug(slug: string): void {
    this.slug.set(slug);
    this.selectedArchitectureNodeId.set('');
    this.selectedAppModuleId.set('');
    this.closedTerminalWidgetIds.set([]);
    this.isTerminalVisible.set(true);
    this.isCaseNoteVisible.set(true);
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
