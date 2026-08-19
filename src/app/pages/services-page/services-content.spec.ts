/* src/app/pages/services-page/services-content.spec.ts */

import { describe, expect, it } from 'vitest';
import { SERVICES_TRANSLATIONS } from './services-content';

describe('SERVICES_TRANSLATIONS', () => {
  it('preserves the complete German and English Phase-2 source data', () => {
    expect(SERVICES_TRANSLATIONS.de.cards).toHaveLength(3);
    expect(SERVICES_TRANSLATIONS.en.cards).toHaveLength(3);
    expect(SERVICES_TRANSLATIONS.de.supportPlans).toHaveLength(3);
    expect(SERVICES_TRANSLATIONS.en.supportPlans).toHaveLength(3);
  });
});
