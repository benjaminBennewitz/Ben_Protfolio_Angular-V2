/* src/app/core/data/achievement-page-data.ts */

/** @file Sprachabhängige Inhalte der achievements-page-Route. */

import type { AchievementPageTexts } from '../models/page-content.models';

export const PAGE_TEXTS: Record<'de' | 'en', AchievementPageTexts> = { // Übersetzungen der geheimen Achievement-Seite.
  de: {
    metaTitle: 'Achievements | Benjamin Bennewitz Portfolio',
    metaDescription: 'Versteckte Trophäen und lokale Fortschritte der interaktiven Portfolio-Experience.',
    backLabel: 'Zurück zur Experience',
    eyebrow: 'secret_room.exe',
    title: 'Achievements',
    intro: 'Kleine Trophäen für versteckte Interaktionen, Mini-Games und bewusst unnötige Portfolio-Momente. Der Fortschritt bleibt lokal in deinem Browser.',
    progressLabel: 'Gesamt · inkl. DLC',
    lockedTitle: '???',
    hintButton: 'Hinweis anzeigen',
    resetButton: 'Fortschritt zurücksetzen',
  },
  en: {
    metaTitle: 'Achievements | Benjamin Bennewitz Portfolio',
    metaDescription: 'Hidden trophies and local progress for the interactive portfolio experience.',
    backLabel: 'Back to the experience',
    eyebrow: 'secret_room.exe',
    title: 'Achievements',
    intro: 'Tiny trophies for hidden interactions, mini-games and intentionally unnecessary portfolio moments. Progress stays local in your browser.',
    progressLabel: 'Total · incl. DLC',
    lockedTitle: '???',
    hintButton: 'Show hint',
    resetButton: 'Reset progress',
  },
};
