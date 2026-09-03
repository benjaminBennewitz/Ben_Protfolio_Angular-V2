/* src/app/core/services/seo.service.ts */

/**
 * @file SEO-Meta-Verwaltung.
 * @description Aktualisiert Titel, Description, Canonical, Social-Meta-Tags und strukturierte Daten pro Route.
 */

import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { PortfolioProject, SeoContent } from '../models/portfolio.models';
import { TabTitleService } from './tab-title.service';

/** Optionen für eine einzelne SEO-Aktualisierung. */
interface SeoApplyOptions {
  /** Vollständiger Seitentitel. */
  readonly title: string;
  /** Meta-Description der aktuellen Seite. */
  readonly description: string;
  /** Suchbegriffe für Meta- und JSON-LD-Daten. */
  readonly keywords: string;
  /** Alternativtext für Social-Preview-Bilder. */
  readonly imageAlt: string;
  /** Relativer Pfad für Canonical und OpenGraph-URL. */
  readonly path: string;
  /** OpenGraph-Typ der aktuellen Seite. */
  readonly type: 'website' | 'article';
  /** Robots-Anweisung für Suchmaschinen. */
  readonly robots: 'index, follow' | 'noindex, follow';
  /** Strukturierte Daten als JSON-LD-Objekt. */
  readonly structuredData: Record<string, unknown> | readonly Record<string, unknown>[];
}

/** Zentraler Service für routenabhängige SEO-Daten. */
@Injectable({ providedIn: 'root' })
export class SeoService {
  /** Primäre Domain für Canonical, OpenGraph und JSON-LD. */
  private readonly siteUrl: string = environment.siteUrl;

  /** Social-Preview-Bild für OpenGraph und Twitter Cards. */
  private readonly socialImage = '/assets/social/og-portfolio-preview.svg';

  /** Fallback-Keywords für Seiten ohne eigene Keywordliste. */
  private readonly fallbackKeywords = 'Benjamin Bennewitz, Full Stack Webentwicklung, Angular Portfolio, Django, UI UX Design, Grafikdesign, Web Apps, Intranet, Accessibility, SEO';

  /** Fallback-Alternativtext für Social-Preview-Bilder. */
  private readonly fallbackImageAlt = 'B² Portfolio Preview von Benjamin Bennewitz';

  /** ID des dynamisch verwalteten JSON-LD-Scripts. */
  private readonly structuredDataId = 'bp-structured-data';

  /** Angular Meta-Service. */
  private readonly meta = inject(Meta);

  /** Dokumentreferenz für Canonical-Link und JSON-LD-Script. */
  private readonly document = inject(DOCUMENT);

  /** Service für aktive und inaktive Tab-Titel. */
  private readonly tabTitle = inject(TabTitleService);

  /** Setzt die Meta-Daten der Startseite. */
  setHomeSeo(content: SeoContent): void {
    this.applySeo({
      title: content.title,
      description: content.description,
      keywords: content.keywords,
      imageAlt: content.imageAlt,
      path: '/',
      type: 'website',
      robots: 'index, follow',
      structuredData: [
        this.createPersonSchema(),
        this.createWebsiteSchema(content),
        this.createWebPageSchema(content.title, content.description, '/', content.keywords),
      ],
    });
  }

  /** Setzt allgemeine Meta-Daten für statische Inhaltsseiten. */
  setPageSeo(title: string, description: string, path = '/'): void {
    this.applySeo({
      title,
      description,
      keywords: this.fallbackKeywords,
      imageAlt: this.fallbackImageAlt,
      path,
      type: 'website',
      robots: 'index, follow',
      structuredData: [
        this.createPersonSchema(),
        this.createWebPageSchema(title, description, path, this.fallbackKeywords),
        this.createBreadcrumbSchema(path, title),
      ],
    });
  }

  /** Setzt noindex-Meta-Daten für reine Bestätigungs- und Systemseiten. */
  setNoIndexPageSeo(title: string, description: string, path = '/'): void {
    this.applySeo({
      title,
      description,
      keywords: this.fallbackKeywords,
      imageAlt: this.fallbackImageAlt,
      path,
      type: 'website',
      robots: 'noindex, follow',
      structuredData: this.createWebPageSchema(title, description, path, this.fallbackKeywords),
    });
  }

  /** Setzt die Meta-Daten für eine Projekt-Detailseite. */
  setProjectSeo(project: PortfolioProject): void {
    const title = `${project.name} | Benjamin Bennewitz Portfolio`;
    const description = project.summary;
    const path = `/projects/${project.slug}`;
    const keywords = [...project.techStack, project.type, project.name, 'Benjamin Bennewitz Portfolio'].join(', ');

    this.applySeo({
      title,
      description,
      keywords,
      imageAlt: `${project.name} Projektvorschau im B² Portfolio`,
      path,
      type: 'article',
      robots: 'index, follow',
      structuredData: [
        this.createPersonSchema(),
        this.createProjectSchema(project, title, description, path, keywords),
        this.createBreadcrumbSchema(path, project.name),
      ],
    });
  }

  /** Setzt die Meta-Daten für eine Fehlerseite. */
  setNotFoundSeo(title: string, description: string): void {
    this.applySeo({
      title,
      description,
      keywords: this.fallbackKeywords,
      imageAlt: this.fallbackImageAlt,
      path: '/',
      type: 'website',
      robots: 'noindex, follow',
      structuredData: this.createWebPageSchema(title, description, '/', this.fallbackKeywords),
    });
  }

  /** Aktualisiert Titel, Description, Canonical, OpenGraph, Twitter und JSON-LD. */
  private applySeo(options: SeoApplyOptions): void {
    const canonicalUrl = this.absoluteUrl(options.path);
    const imageUrl = this.absoluteUrl(this.socialImage);
    const locale = this.currentLocale();

    this.tabTitle.setActiveTitle(options.title);
    this.meta.updateTag({ name: 'description', content: options.description });
    this.meta.updateTag({ name: 'robots', content: options.robots });
    this.meta.updateTag({ name: 'author', content: 'Benjamin Bennewitz' });
    this.meta.updateTag({ name: 'keywords', content: options.keywords });
    this.meta.updateTag({ name: 'application-name', content: 'B² Portfolio' });
    this.meta.updateTag({ name: 'format-detection', content: 'telephone=no' });
    this.meta.updateTag({ property: 'og:site_name', content: 'B² Portfolio' });
    this.meta.updateTag({ property: 'og:locale', content: locale });
    this.meta.updateTag({ property: 'og:type', content: options.type });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ property: 'og:title', content: options.title });
    this.meta.updateTag({ property: 'og:description', content: options.description });
    this.meta.updateTag({ property: 'og:image', content: imageUrl });
    this.meta.updateTag({ property: 'og:image:alt', content: options.imageAlt });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: options.title });
    this.meta.updateTag({ name: 'twitter:description', content: options.description });
    this.meta.updateTag({ name: 'twitter:image', content: imageUrl });
    this.meta.updateTag({ name: 'twitter:image:alt', content: options.imageAlt });
    this.setCanonical(canonicalUrl);
    this.setStructuredData(options.structuredData);
  }

  /** Erzeugt ein absolutes URL-Format aus einem relativen Pfad. */
  private absoluteUrl(path: string): string {
    if (path.startsWith('http')) {
      return path;
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return `${this.siteUrl}${normalizedPath}`;
  }

  /** Aktualisiert oder erzeugt den Canonical-Link im Dokumentkopf. */
  private setCanonical(url: string): void {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }

    link.href = url;
  }

  /** Aktualisiert das JSON-LD-Script im Dokumentkopf. */
  private setStructuredData(data: Record<string, unknown> | readonly Record<string, unknown>[]): void {
    let script = this.document.getElementById(this.structuredDataId) as HTMLScriptElement | null;

    if (!script) {
      script = this.document.createElement('script');
      script.id = this.structuredDataId;
      script.type = 'application/ld+json';
      this.document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(data);
  }

  /** Erstellt strukturierte Personendaten für die Startseite. */
  private createPersonSchema(): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': `${this.siteUrl}/#person`,
      name: 'Benjamin Bennewitz',
      alternateName: 'B²',
      url: this.siteUrl,
      jobTitle: 'Full Stack Web Developer und Grafikdesigner',
      knowsAbout: ['Angular', 'Django', 'UI/UX Design', 'Grafikdesign', 'SEO', 'Accessibility', 'Web Apps'],
      sameAs: [
        'https://www.linkedin.com/in/benjamin-bennewitz-116a12306/',
        'https://www.xing.com/profile/Benjamin_Bennewitz',
        'https://github.com/benjaminBennewitz',
      ],
    };
  }

  /** Erstellt strukturierte WebSite-Daten für die Startseite. */
  private createWebsiteSchema(content: SeoContent): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${this.siteUrl}/#website`,
      name: 'B² Portfolio',
      alternateName: content.title,
      url: this.siteUrl,
      description: content.description,
      keywords: content.keywords,
      inLanguage: this.document.documentElement.lang || 'de',
      publisher: { '@id': `${this.siteUrl}/#person` },
    };
  }

  /** Erstellt strukturierte WebPage-Daten für statische Seiten. */
  private createWebPageSchema(title: string, description: string, path: string, keywords: string): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${this.absoluteUrl(path)}#webpage`,
      name: title,
      url: this.absoluteUrl(path),
      description,
      keywords,
      isPartOf: { '@id': `${this.siteUrl}/#website` },
      inLanguage: this.document.documentElement.lang || 'de',
    };
  }

  /** Erstellt strukturierte CreativeWork-Daten für Projektseiten. */
  private createProjectSchema(project: PortfolioProject, title: string, description: string, path: string, keywords: string): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      '@id': `${this.absoluteUrl(path)}#creativework`,
      name: title,
      headline: project.name,
      url: this.absoluteUrl(path),
      description,
      keywords,
      temporalCoverage: project.year,
      creator: { '@id': `${this.siteUrl}/#person` },
      about: project.highlights,
      inLanguage: this.document.documentElement.lang || 'de',
    };
  }

  /** Erstellt strukturierte Breadcrumb-Daten für Projekt- und Unterseiten. */
  private createBreadcrumbSchema(path: string, currentName: string): Record<string, unknown> {
    const isProject = path.startsWith('/projects/');
    const list = [
      { '@type': 'ListItem', position: 1, name: 'Portfolio', item: this.siteUrl },
    ];

    if (isProject) {
      list.push({ '@type': 'ListItem', position: 2, name: 'Portfolio', item: this.absoluteUrl('/portfolio') });
      list.push({ '@type': 'ListItem', position: 3, name: currentName, item: this.absoluteUrl(path) });
    } else {
      list.push({ '@type': 'ListItem', position: 2, name: currentName, item: this.absoluteUrl(path) });
    }

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: list,
    };
  }

  /** Gibt die aktuelle Sprache als OpenGraph-Locale zurück. */
  private currentLocale(): string {
    return this.document.documentElement.lang === 'en' ? 'en_US' : 'de_DE';
  }
}
