/* src/app/core/data/portfolio-content.spec.ts */

/**
 * @file Basistests für die zentralen Portfolio-Inhalte.
 * @description Prüft, dass beide Sprachen die wichtigsten Inhaltsbereiche bereitstellen.
 */

import { describe, expect, it } from 'vitest';
import { PORTFOLIO_TRANSLATIONS } from './portfolio-content';

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
    expect(content.servicesTeaser.items).toHaveLength(5);
    expect(content.pricing.cards).toHaveLength(3);
    expect(content.pricing.metaTitle.trim()).not.toBe('');
    expect(content.projects.length).toBeGreaterThan(0);
    expect(content.faqs.length).toBeGreaterThan(0);
    expect(content.contact.title.trim()).not.toBe('');
  });

  it('hält die Anzahl zentraler Inhalte zwischen DE und EN synchron', () => {
    const german = PORTFOLIO_TRANSLATIONS.de;
    const english = PORTFOLIO_TRANSLATIONS.en;

    expect(english.about.text).toHaveLength(german.about.text.length);
    expect(english.about.highlights).toHaveLength(german.about.highlights.length);
    expect(english.about.metrics.facts).toHaveLength(german.about.metrics.facts.length);
    expect(english.servicesTeaser.items).toHaveLength(german.servicesTeaser.items.length);
    expect(english.pricing.cards).toHaveLength(german.pricing.cards.length);
    expect(english.pricing.supportPlans).toHaveLength(german.pricing.supportPlans.length);
    expect(english.projects).toHaveLength(german.projects.length);
    expect(english.faqs).toHaveLength(german.faqs.length);
  });
});
