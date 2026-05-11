/* src/app/core/services/seo.service.ts */

/**
 * @file SEO-Meta-Verwaltung.
 * @description Aktualisiert Titel, Description und Social-Meta-Tags pro Route.
 */

import { Injectable, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { PortfolioProject, SeoContent } from '../models/portfolio.models';
import { TabTitleService } from './tab-title.service';

/** Zentraler Service für routenabhängige SEO-Daten. */
@Injectable({ providedIn: 'root' })
export class SeoService {
  /** Angular Meta-Service. */
  private readonly meta = inject(Meta);

  /** Service für aktive und inaktive Tab-Titel. */
  private readonly tabTitle = inject(TabTitleService);

  /** Setzt die Meta-Daten der Startseite. */
  setHomeSeo(content: SeoContent): void {
    this.applySeo(content.title, content.description);
  }

  /** Setzt allgemeine Meta-Daten für statische Inhaltsseiten. */
  setPageSeo(title: string, description: string): void {
    this.applySeo(title, description);
  }

  /** Setzt die Meta-Daten für eine Projekt-Detailseite. */
  setProjectSeo(project: PortfolioProject): void {
    const title = `${project.name} | Benjamin Bennewitz Portfolio`;
    const description = project.summary;

    this.applySeo(title, description);
  }

  /** Setzt die Meta-Daten für eine Fehlerseite. */
  setNotFoundSeo(title: string, description: string): void {
    this.applySeo(title, description);
  }

  /** Aktualisiert Titel, Description, OpenGraph und Twitter-Meta-Tags. */
  private applySeo(title: string, description: string): void {
    this.tabTitle.setActiveTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
  }
}
