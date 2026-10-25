import { sleepInBed } from './health.js';
import { minuteOfDay } from './world-clock.js';

export const REST_TIMES=[{label:'Morgen',minute:420},{label:'Abend',minute:1140},{label:'Nacht',minute:1260}];

/** Fragt am eigenen Bett nach der gewünschten Tageszeit, ohne bereits zu heilen oder Zeit zu verbrauchen. @param {object} game Spiel. */
export function openRestMenu(game) {
  game.held=null; game.message=null; game.pages=[]; game.locationNotice=null;
  game.ambientSpeech=null; game.tavernReply=null; game.systemMenu={kind:'rest',choice:0}; game.sounds.push('ui-confirm');
}

/** Beschriftet den nächsten passenden Zeitpunkt und benennt einen nötigen Tageswechsel. @param {object} game Spiel. @param {number} choice Auswahl. */
export function restChoiceLabel(game,choice) {
  const target=REST_TIMES[choice];
  if (!target) return 'Zurück';
  const hour=String(Math.floor(target.minute/60)).padStart(2,'0');
  return `${target.label} ${hour}:00${target.minute<=minuteOfDay(game)?' +1 Tag':''}`;
}

/** Bestätigt genau eine Bettruhe oder schließt ohne Änderung der Welt. @param {object} game Spiel. */
export function confirmRest(game) {
  const target=REST_TIMES[game.systemMenu.choice];
  game.systemMenu=null;
  if (!target) { game.sounds.push('ui-back'); return; }
  sleepInBed(game,target.minute);
}
