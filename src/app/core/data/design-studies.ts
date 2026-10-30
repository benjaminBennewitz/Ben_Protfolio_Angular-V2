/* src/app/core/data/design-studies.ts */

/** @file Geordnete Übersicht der eigenständigen visuellen Designstudien. */

import type { DesignStudy } from '../models/projects.models';

export const DESIGN_STUDIES: readonly DesignStudy[] = [ // Reihenfolge und öffentliche Ziele der Designstudien.
    {
      id: 'raw-form',
      name: 'RAW/FORM',
      subtitle: 'Brutalist Festival Landingpage',
      href: '/design-studies/brutalism/',
      preview: '/design-studies/brutalism/assets/img/hero.webp',
      tags: ['Brutalism', 'Editorial', 'Motion', 'HTML / CSS / JS'],
    },
    {
      id: 'whatwesee',
      name: '[WHATWESEE]',
      subtitle: 'Swiss-inspired Photography Journal',
      href: '/design-studies/swiss/',
      preview: '/design-studies/swiss/assets/images/hero-landscape.webp',
      tags: ['Swiss Style', 'Photography', 'Editorial', 'HTML / CSS / JS'],
    },
    {
      id: 'ctrl-room',
      name: 'CTRL//ROOM',
      subtitle: 'Y2K Audiovisual Culture Platform',
      href: '/design-studies/ctrl-room/',
      preview: '/design-studies/ctrl-room/assets/preview.webp',
      tags: ['Y2K', 'Chrome / Plastic', 'Web Audio', 'HTML / CSS / JS'],
    },
    {
      id: 'type-break',
      name: 'TYPE破BREAK',
      subtitle: 'Interactive Typographic Manifesto',
      href: '/design-studies/type-break/',
      preview: '/design-studies/type-break/assets/preview.webp',
      tags: ['Kinetic Type', 'Creative Coding', 'Interactive Poster', 'HTML / CSS / JS'],
    },
    {
      id: 'scoop',
      name: 'SCOOP!',
      subtitle: 'Playful Ice Cream Shop',
      href: '/design-studies/scoop/',
      preview: '/design-studies/scoop/assets/preview.webp',
      tags: ['Comic Design', 'SVG Animation', 'Illustrator', 'Interactive Shop', 'HTML / CSS / JS'],
    },
    {
      id: 'fold',
      name: 'FOLD.',
      subtitle: 'Six Sides. One Perspective Experiment.',
      href: '/design-studies/fold/',
      preview: '/design-studies/fold/assets/preview.webp',
      tags: ['3D CSS', 'Scroll Experience', 'Editorial', 'Vibe Coded'],
    },
    {
      id: 'growth',
      name: 'GROWTH.',
      subtitle: 'A Living World — 50 Metres of Discovery',
      href: '/design-studies/growth/',
      preview: '/design-studies/growth/assets/preview.webp',
      tags: ['Three.js', 'Procedural Nature', 'Scroll Experience', 'WebGL'],
    },
    {
      id: 'bentendo',
      name: 'BENTENDO™',
      subtitle: 'A Playable Handheld — DUNGEON WANTED',
      href: '/design-studies/bentendo/',
      preview: '/design-studies/bentendo/assets/preview.svg',
      tags: ['Three.js', 'Pixel RPG', 'Web Audio', 'Game Design'],
    },
  ]; // Reihenfolge und öffentliche Ziele der Designstudien.

/** Deutsche Karteninhalte; Marken und technische Eigennamen bleiben erhalten. */
export const DESIGN_STUDY_TRANSLATIONS_DE: Readonly<Record<string, Pick<DesignStudy, 'subtitle' | 'tags'>>> = {
  'raw-form': { subtitle: 'Brutalistische Festival-Landingpage', tags: ['Brutalismus', 'Editorial', 'Animation', 'HTML / CSS / JS'] },
  whatwesee: { subtitle: 'Fotografie-Journal im Schweizer Stil', tags: ['Schweizer Typografie', 'Fotografie', 'Editorial', 'HTML / CSS / JS'] },
  'ctrl-room': { subtitle: 'Audiovisuelle Kulturplattform im Y2K-Stil', tags: ['Y2K', 'Chrom / Kunststoff', 'Web Audio', 'HTML / CSS / JS'] },
  'type-break': { subtitle: 'Interaktives typografisches Manifest', tags: ['Kinetische Typografie', 'Kreative Programmierung', 'Interaktives Plakat', 'HTML / CSS / JS'] },
  scoop: { subtitle: 'Verspielter Eisshop', tags: ['Comic-Design', 'SVG-Animation', 'Illustrator', 'Interaktiver Shop', 'HTML / CSS / JS'] },
  fold: { subtitle: 'Sechs Seiten. Ein Perspektivexperiment.', tags: ['3D CSS', 'Scroll-Erlebnis', 'Editorial', 'KI-gestützte Entwicklung'] },
  growth: { subtitle: 'Eine lebendige Welt – 50 Meter voller Entdeckungen', tags: ['Three.js', 'Prozedurale Natur', 'Scroll-Erlebnis', 'WebGL'] },
  bentendo: { subtitle: 'Ein spielbarer Handheld – DUNGEON WANTED', tags: ['Three.js', 'Pixel-Rollenspiel', 'Web Audio', 'Spieldesign'] },
};
