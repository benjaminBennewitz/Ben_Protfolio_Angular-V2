/* src/app/core/data/achievement-data.ts */

/** @file Trophäendefinitionen und übersetzte Texte einschließlich der Studien-DLCs. */

import { STUDY_ACHIEVEMENTS } from '../../../design-studies/shared/achievement-catalog.js';
import type { StudyAchievementId } from '../../../design-studies/shared/achievement-catalog.js';
import type { AchievementDefinition, AchievementId, AchievementTranslation } from '../models/achievement.models';
import type { PortfolioLanguage } from '../models/shared.models';

export const ACHIEVEMENT_DEFINITIONS: readonly AchievementDefinition[] = [ // Feste Reihenfolge der Hauptspiel- und DLC-Trophäen.
  { id: 'loader-human', icon: 'touch_app', category: 'loader' },
  { id: 'hero-face-switch', icon: 'face_retouching_natural', category: 'hero' },
  { id: 'nostalgia-hater', icon: 'close', category: 'hero' },
  { id: 'coffee-glitch', icon: 'local_cafe', category: 'about' },
  { id: 'weird-units', icon: 'straighten', category: 'about' },
  { id: 'sugar-covered', icon: 'cookie', category: 'project' },
  { id: 'eye-poke', icon: 'visibility', category: 'project' },
  { id: 'bomb-defused', icon: 'explosion', category: 'project' },
  { id: 'trash-dunk', icon: 'delete', category: 'project' },
  { id: 'blood-complete', icon: 'hematology', category: 'project' },
  { id: 'cta-contact', icon: 'arrow_outward', category: 'contact' },
  { id: 'skilled-driver', icon: 'directions_car', category: 'cta' },
  { id: 'rescue-lane-404', icon: 'emergency', category: 'cta' },
  { id: 'world-upside-down', icon: 'accessibility_new', category: 'access' },
  { id: 'loyal-companion', icon: 'music_note', category: 'footer' },
  { id: 'platinum-complete', icon: 'workspace_premium', category: 'platin' },
  ...STUDY_ACHIEVEMENTS.map(/** Übernimmt eine Studien-Trophäe als zusätzlichen DLC-Inhalt. */ ({ id, category, icon }) => ({ id, category, icon, dlc: true })),
];

export const ACHIEVEMENT_TRANSLATIONS: Record<PortfolioLanguage, Record<AchievementId, AchievementTranslation>> = { // Übersetzungen der geheimen Trophäen.
  de: {
    ...Object.fromEntries(STUDY_ACHIEVEMENTS.map(/** Ordnet den Studien-IDs ihre deutschen Trophäentexte zu. */ item => [item.id, item.de])) as Record<StudyAchievementId, AchievementTranslation>,
    'loader-human': {
      title: 'Menschliche Freigabe',
      description: 'Du hast die beleidigte Bootsequenz überzeugt und das Interface gestartet.',
      hint: 'Manche Systeme starten erst, wenn ein Mensch etwas Cooles sagt.',
    },
    'hero-face-switch': {
      title: 'Gesichtskontrolle',
      description: 'Du hast den Hero-Kopf durch einen alternativen Zustand gejagt.',
      hint: 'Ein Mensch hat viele Gesichter.',
    },
    'nostalgia-hater': {
      title: 'Ich hasse Nostalgie',
      description: 'Du hast dein erstes MS-DOS-Fenster ohne Sentimentalität konsequent geschlossen.',
      hint: 'Schließe irgendein MS-DOS-Fenster. Hauptsache ohne Sentimentalität.',
    },
    'coffee-glitch': {
      title: 'Koffeinfehler',
      description: 'err, 404 Koffeein not found.',
      hint: 'Ein guter Tag startet mit einer Tasse Kaffee.',
    },
    'weird-units': {
      title: 'Einheitenkrise',
      description: 'Du hast normale Maße erfolgreich in Snacks umgerechnet.',
      hint: 'Nicht alles muss in Zentimetern gemessen werden.',
    },
    'sugar-covered': {
      title: 'Tagesbedarf gedeckt',
      description: 'Tagesbedarf an Zucker ist gedeckt.',
      hint: 'Die WHO empfiehlt max. 50g Zucker am Tag.',
    },
    'eye-poke': {
      title: 'Nicht ins Auge',
      description: 'Musst du alles anfassen?',
      hint: 'Fühlst du dich beobachtet?',
    },
    'bomb-defused': {
      title: 'Boom-Management',
      description: '"Kabuuum" <- Onomatopoesie.',
      hint: 'Ich glaube, du hast den Knall nicht gehört.',
    },
    'trash-dunk': {
      title: 'Papierkorb-Korb',
      description: 'Willkommen in der Digitalisierung. Reduziere Papiermüll!',
      hint: 'Rette den Planeten.',
    },
    'blood-complete': {
      title: 'Betriebsarzt',
      description: 'Das Dashboard behauptet, dass Sie zu 99,9% Hammer sind.',
      hint: 'Geh mal zum Arzt!',
    },
    'cta-contact': {
      title: 'Schwerkraft besiegt',
      description: 'you can touch this und jonglieren - cool',
      hint: 'Besiege die Schwerkraft.',
    },
    'skilled-driver': {
      title: 'Versierter Fahrer',
      description: 'Zuverlässiger als die Deutsche Bahn.',
      hint: 'Stelle deine Fahrkünste unter Beweis.',
    },
    'rescue-lane-404': {
      title: '404 Rettungsgasse not found',
      description: 'Denk daran: immer eine Rettungsgasse bilden!',
      hint: 'Jeden Morgen Stau auf der CTA.',
    },
    'world-upside-down': {
      title: 'Verkehrte Welt',
      description: 'Sieh die Welt aus anderen Augen.',
      hint: 'Passe das Weberlebnis an.',
    },
    'loyal-companion': {
      title: 'I feel good',
      description: 'Sie wird dort, immer auf dich warten.',
      hint: 'Finde einen treuen Begleiter.',
    },
    'platinum-complete': {
      title: 'Platin freigeschaltet',
      description: 'Du hast alle versteckten Details gefunden. 100 % Hauptspiel erkundet – Ruhm freigeschaltet.',
      hint: 'Schalte alle Trophäen des Hauptspiels frei. Die DLC-Studien sind ein eigener Ausflug.',
    },
  },
  en: {
    ...Object.fromEntries(STUDY_ACHIEVEMENTS.map(/** Ordnet den Studien-IDs ihre englischen Trophäentexte zu. */ item => [item.id, item.en])) as Record<StudyAchievementId, AchievementTranslation>,
    'loader-human': {
      title: 'Human Clearance',
      description: 'You convinced the offended boot sequence and launched the interface.',
      hint: 'Some systems only start when a human says something cool.',
    },
    'hero-face-switch': {
      title: 'Face Control',
      description: 'You pushed the hero head through an alternative state.',
      hint: 'A human has many faces.',
    },
    'nostalgia-hater': {
      title: 'I Hate Nostalgia',
      description: 'You closed your first MS-DOS window with absolutely no sentimentality.',
      hint: 'Close any MS-DOS window. Preferably without sentimentality.',
    },
    'coffee-glitch': {
      title: 'Caffeine Fault',
      description: 'err, 404 caffeine not found.',
      hint: 'A good day starts with a cup of coffee.',
    },
    'weird-units': {
      title: 'Unit Crisis',
      description: 'You successfully converted normal measurements into snacks.',
      hint: 'Not everything has to be measured in centimeters.',
    },
    'sugar-covered': {
      title: 'Daily Needs Covered',
      description: 'Your daily sugar needs are covered.',
      hint: 'The WHO recommends a maximum of 50g sugar per day.',
    },
    'eye-poke': {
      title: 'Do Not Poke',
      description: 'Do you have to touch everything?',
      hint: 'Do you feel watched?',
    },
    'bomb-defused': {
      title: 'Boom Management',
      description: '"Kaboom" <- onomatopoeia.',
      hint: 'I think you did not hear the bang.',
    },
    'trash-dunk': {
      title: 'Trash Dunk',
      description: 'Welcome to digitalization. Reduce paper waste!',
      hint: 'Save the planet.',
    },
    'blood-complete': {
      title: 'Company Doctor',
      description: 'The dashboard claims you are 99.9% awesome.',
      hint: 'Go see a doctor!',
    },
    'cta-contact': {
      title: 'Gravity Defeated',
      description: 'you can touch this and juggle - cool',
      hint: 'Defeat gravity.',
    },
    'skilled-driver': {
      title: 'Skilled Driver',
      description: 'More reliable than Deutsche Bahn.',
      hint: 'Put your driving skills to the test.',
    },
    'rescue-lane-404': {
      title: '404 Rescue lane not found',
      description: 'Remember: always leave an emergency corridor!',
      hint: 'Traffic jam on the CTA every morning.',
    },
    'world-upside-down': {
      title: 'Upside Down',
      description: 'See the world through different eyes.',
      hint: 'Adjust the web experience.',
    },
    'loyal-companion': {
      title: 'I Feel Good',
      description: 'She will always be waiting for you there.',
      hint: 'Find a loyal companion.',
    },
    'platinum-complete': {
      title: 'Platinum Unlocked',
      description: 'You found every hidden detail. 100% of the base game explored – glory unlocked.',
      hint: 'Unlock every base-game trophy. The DLC studies are a separate adventure.',
    },
  },
}; // Übersetzungen der geheimen Trophäen.
