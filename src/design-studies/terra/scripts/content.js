/* src/design-studies/terra/scripts/content.js */

/**
 * @file Szenenparameter und zweisprachige Inhalte von TERRA.
 * @description Hält Darstellung, Bedienoberfläche und zugängliche Texte konsistent.
 * @author Benjamin Bennewitz
 */

/** Unveränderliche Parameter der drei botanischen Versuchsanordnungen. */
export const SCENARIOS = Object.freeze([
  { id: 'greenhouse', number: '01', branches: 15, leaves: 13, seed: 31, light: 1, frogs: false },
  { id: 'understory', number: '02', branches: 30, leaves: 18, seed: 72, light: 0.63, frogs: false },
  { id: 'frogside', number: '03', branches: 18, leaves: 14, seed: 93, light: 0.82, frogs: true },
]);

/** Übersetzungen sämtlicher sichtbarer und assistiver Oberflächentexte. */
export const TEXTS = Object.freeze({
  de: {
    title: 'TERRA — Botanisches Lichtlabor',
    back: 'Zurück zum Archiv', lab: 'Botanisches Lichtlabor', edition: 'Materialstudie / 012',
    subtitle: 'Eine dünne Grenze. Eine lebendige Welt.', sceneLabel: 'Versuchsanordnung',
    wallpaper: 'Wallpapermodus starten', wallpaperHint: 'Wallpapermodus – mit Escape oder Klick beenden',
    settings: 'Einstellungen', settingsExpand: 'Einstellungen öffnen', settingsCollapse: 'Einstellungen minimieren',
    names: ['Normal', 'Dicht', 'Frosch'],
    descriptions: [
      'Locker wachsendes Blattwerk über dichtem Bodengrün. Feuchte Luft fängt das Licht.',
      'Üppiges Grün bis zum Boden. Dahinter verliert sich das Licht im Nebelschleier.',
      'Ein blau-violetter Frosch haftet zwischen Tropfen am Glas, klettert ein Stück und ruht.',
    ],
    frost: 'Mattierung', moisture: 'Feuchtigkeit', grid: 'Drahtgitter', gridToggle: 'Drahtgitter ein- oder ausblenden',
    pause: 'Bewegung pausieren', play: 'Bewegung fortsetzen', theme: 'Farbschema wechseln',
    language: 'Switch to English', info: 'Über die Studie', close: 'Schließen',
    hint: 'Bewege den Blick. Entdecke die Tiefe.', paused: 'Bewegung pausiert',
    reduced: 'Reduzierte Bewegung aktiv', live: 'Lebendige Szene',
    canvas: 'Botanische 3D-Szene hinter strukturiertem Mattglas',
    unavailable: '3D-Szene nicht verfügbar', loading: 'Licht wird gebrochen …', error: 'Die 3D-Szene konnte nicht gestartet werden. Bitte nutze einen aktuellen Browser mit aktivierter WebGL-2-Grafikbeschleunigung.',
    lost: 'Die Grafikverbindung wurde unterbrochen. Bitte lade die Seite neu.',
    aboutTitle: 'Zwischen Nähe und Unschärfe.',
    aboutText: 'TERRA untersucht Glas als räumliche Grenze: Ein feines Raster bleibt greifbar, während Pflanzen in unterschiedlicher Tiefe dahinter verschwimmen. Drei Versuchsanordnungen verbinden botanische Formen mit Licht, Material und langsamer Bewegung.',
    aboutTech: 'Prototyp 16 · Three.js / WebGL 2 · Prozedurale Pflanzen und ein blau-violett interpretierter Pfeilgiftfrosch · Kurze Kletterabschnitte, Ruhephasen und tiefenabhängiges Mattglas.',
    imprint: 'Impressum', privacy: 'Datenschutz', skip: 'Zur Szenenauswahl',
  },
  en: {
    title: 'TERRA — Botanical Light Laboratory',
    back: 'Back to archive', lab: 'Botanical light laboratory', edition: 'Material study / 012',
    subtitle: 'A thin boundary. A living world.', sceneLabel: 'Experimental setting',
    wallpaper: 'Start wallpaper mode', wallpaperHint: 'Wallpaper mode – press Escape or click to exit',
    settings: 'Settings', settingsExpand: 'Expand settings', settingsCollapse: 'Minimize settings',
    names: ['Normal', 'Dense', 'Frog'],
    descriptions: [
      'Open foliage above a lush green floor. Humid air catches the light.',
      'Lush growth down to the ground. Beyond it, light dissolves into a veil of mist.',
      'A blue-violet frog clings to the glass between droplets, climbs a little, then rests.',
    ],
    frost: 'Frosting', moisture: 'Moisture', grid: 'Wire mesh', gridToggle: 'Show or hide the wire mesh',
    pause: 'Pause motion', play: 'Resume motion', theme: 'Switch color theme',
    language: 'Zu Deutsch wechseln', info: 'About the study', close: 'Close',
    hint: 'Move your gaze. Discover the depth.', paused: 'Motion paused',
    reduced: 'Reduced motion enabled', live: 'Living scene',
    canvas: 'Botanical 3D scene behind textured frosted glass',
    unavailable: '3D scene unavailable', loading: 'Refracting light …', error: 'The 3D scene could not start. Please use a current browser with WebGL 2 hardware acceleration enabled.',
    lost: 'The graphics connection was interrupted. Please reload the page.',
    aboutTitle: 'Between proximity and blur.',
    aboutText: 'TERRA explores glass as a spatial boundary: a fine grid stays tangible while plants at different depths dissolve behind it. Three experimental settings combine botanical forms with light, material and slow movement.',
    aboutTech: 'Prototype 16 · Three.js / WebGL 2 · Procedural plants and one blue-violet poison dart frog interpretation · Short climbing bouts, resting phases and depth-aware frosted glass.',
    imprint: 'Legal notice', privacy: 'Privacy', skip: 'Skip to scene selection',
  },
});

/**
 * Erzeugt reproduzierbare Zufallswerte ohne globale Math.random-Zustände.
 * @param {number} seed Startwert des Generators.
 * @returns {() => number} Generator für Werte im Intervall [0, 1).
 */
export function createRandom(seed) {
  let value = seed;
  return function nextRandom() {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}
