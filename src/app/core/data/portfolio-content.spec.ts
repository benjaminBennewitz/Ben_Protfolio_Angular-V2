/* src/app/core/data/portfolio-content.spec.ts */

/**
 * @file Basistests für die zentralen Portfolio-Inhalte.
 * @description Prüft, dass beide Sprachen die wichtigsten Inhaltsbereiche bereitstellen.
 */

import { describe, expect, it } from 'vitest';
import { PORTFOLIO_TRANSLATIONS } from './portfolio-content';
import { PORTFOLIO_PROJECTS } from './portfolio-projects';

/** Unterstützte Sprachen des Portfolios. */
const SUPPORTED_LANGUAGES = ['de', 'en'] as const;

describe('PORTFOLIO_TRANSLATIONS', () => {
  it.each(SUPPORTED_LANGUAGES)('stellt Kerninhalte für %s bereit', (language) => {
    const content = PORTFOLIO_TRANSLATIONS[language];

    expect(content.meta.title.trim()).not.toBe('');
    expect(content.meta.description.trim()).not.toBe('');
    expect(content.hero.title.trim()).not.toBe('');
    expect(content.hero.hook.trim()).not.toBe('');
    expect(content.about.title.trim()).not.toBe('');
    expect(content.about.text.length).toBeGreaterThan(0);
    expect(content.about.metrics.facts.length).toBeGreaterThan(0);
    expect(content.capabilities.items).toHaveLength(5);
    expect(PORTFOLIO_PROJECTS[language].length).toBeGreaterThan(0);
    expect(content.faqs.length).toBeGreaterThan(0);
    expect(content.contact.title.trim()).not.toBe('');
    expect(content.notFoundPage.title.trim()).not.toBe('');
    expect(content.notFoundPage.sitemapGroups.length).toBeGreaterThan(0);
  });

  it('hält die Anzahl zentraler Inhalte zwischen DE und EN synchron', () => {
    const german = PORTFOLIO_TRANSLATIONS.de;
    const english = PORTFOLIO_TRANSLATIONS.en;

    expect(english.about.text).toHaveLength(german.about.text.length);
    expect(english.about.highlights).toHaveLength(german.about.highlights.length);
    expect(english.about.metrics.facts).toHaveLength(german.about.metrics.facts.length);
    expect(english.capabilities.items).toHaveLength(german.capabilities.items.length);
    expect(PORTFOLIO_PROJECTS.en).toHaveLength(PORTFOLIO_PROJECTS.de.length);
    expect(english.faqs).toHaveLength(german.faqs.length);
    expect(english.notFoundPage.sitemapGroups).toHaveLength(german.notFoundPage.sitemapGroups.length);
  });

  it.each(SUPPORTED_LANGUAGES)('führt Dein Fußabdruck statt des alten Browsergames für %s', (language) => {
    const projects = PORTFOLIO_PROJECTS[language];
    const slugs = projects.map((project) => project.slug);

    expect(slugs).toContain('dein-fussabdruck');
    expect(slugs).not.toContain('html5-browser-game');
  });

  it.each(SUPPORTED_LANGUAGES)('liefert drei Telemetry-Charts pro Case Study für %s', (language) => {
    const projects = PORTFOLIO_PROJECTS[language];

    for (const project of projects) {
      expect(project.telemetry?.charts).toHaveLength(3);
      expect(project.metrics.length).toBeGreaterThanOrEqual(4);
    }
  });

  it.each(SUPPORTED_LANGUAGES)('liefert den erweiterten Intranet-Feature-Index für %s', (language) => {
    const intranet = PORTFOLIO_PROJECTS[language].find((project) => project.slug === 'intranet');

    expect(intranet?.capabilities?.items).toHaveLength(6);
    expect(intranet?.capabilities?.title.trim()).not.toBe('');
  });

});
