/* src/app/pages/project-detail-page/project-detail-page.component.ts */

/**
 * @file Projekt-Detailseite.
 * @description Rendert SEO-freundliche Detailseiten für alle Portfolio-Projekte.
 */

import { Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { SeoService } from '../../core/services/seo.service';
import { ProjectVisualComponent } from '../../shared/project-visual/project-visual.component';

/** Detailseite für einzelne Projekte. */
@Component({
  selector: 'bp-project-detail-page',
  standalone: true,
  imports: [RouterLink, ProjectVisualComponent],
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

  /** Übersetzter Inhalt der aktuellen Sprache. */
  readonly content = computed(() => this.languageService.content());

  /** Ausgewähltes Projekt passend zum Route-Slug. */
  readonly project = computed(() => this.content().projects.find((project) => project.slug === this.slug()));

  /** Initialisiert Route- und SEO-Reaktionen. */
  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => this.slug.set(params.get('slug') ?? ''));

    effect(() => {
      const project = this.project();

      if (project) {
        this.seoService.setProjectSeo(project);
        return;
      }

      this.seoService.setNotFoundSeo(this.content().notFoundTitle, this.content().notFoundText);
    });
  }
}
