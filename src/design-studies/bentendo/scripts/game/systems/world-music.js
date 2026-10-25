import { minuteOfDay } from './world-clock.js';

/** Wählt Nachtstücke für Wald, Dorf und Dorfhäuser und erhält die Dungeonmusik. @param {object} game Spiel. */
export function worldMusic(game) {
  const minute=minuteOfDay(game),dark=minute>=1140 || minute<360;
  if (dark && (game.room.id==='village' || game.room.id.startsWith('village-') && game.room.furnished)) return 'bruchstein-night';
  if (dark && game.room.villageLandscape && game.room.music==='forest-canopy') return 'forest-night';
  return game.room.music;
}
