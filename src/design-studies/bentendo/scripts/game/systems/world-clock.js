export const DAY_MINUTES=1440;
export const START_MINUTES=9*60;

/** Erkennt sichere optionale Tageszeiten und erhält alte Spielstände ohne Uhr. @param {unknown} value Gespeicherte Minuten. */
export function validWorldTime(value) { return value===undefined || Number.isFinite(value) && value>=0 && value<1e9; }

/** Liefert die aktuelle Minute innerhalb eines Spieltags. @param {object} game Spiel. */
export function minuteOfDay(game) { return (game.worldMinutes ?? START_MINUTES)%DAY_MINUTES; }

/** Benennt den Tagesabschnitt ohne zusätzliche Echtzeitabhängigkeit. @param {object} game Spiel. */
export function dayPhase(game) {
  const minute=minuteOfDay(game);
  return minute<360 || minute>=1200?'Nacht':minute<540?'Morgen':minute<1020?'Tag':'Abend';
}

/** Lässt eine Spielminute pro aktiver Sekunde verstreichen, ohne Hintergrundzeit nachzuholen. @param {object} game Spiel. @param {number} dt Aktive Sekunden. */
export function updateWorldClock(game,dt) {
  if (Number.isFinite(dt) && dt>0) game.worldMinutes=Math.min(1e9-1,(game.worldMinutes ?? START_MINUTES)+dt);
}

/** Springt nur vorwärts zum nächsten Morgen, wenn tatsächlich geschlafen wurde. @param {object} game Spiel. */
export function sleepUntilMorning(game) { sleepUntil(game,420); }

/** Springt vorwärts zur gewählten Tagesminute, gegebenenfalls am folgenden Tag. @param {object} game Spiel. @param {number} target Zielminute. */
export function sleepUntil(game,target) {
  const current=minuteOfDay(game);
  const elapsed=(target-current+DAY_MINUTES)%DAY_MINUTES || DAY_MINUTES;
  game.worldMinutes=(game.worldMinutes ?? START_MINUTES)+elapsed;
}

/** Hält den ersten Rückweg mindestens im Abendlicht, ohne eine bereits dunkle Nacht zurückzudrehen. @param {object} game Spiel. */
export function advanceToForestEvening(game) {
  const current=minuteOfDay(game);
  game.worldMinutes=(game.worldMinutes ?? START_MINUTES)+(current<1140?1140-current:30);
}

/** Erhält die Kontraste nachts und blendet Morgen und Abend über eine Stunde weich ein. @param {number} minute Tagesminute. */
export function nightShade(minute) {
  if (minute<300 || minute>=1200) return 0.36;
  if (minute<420) return 0.36*(420-minute)/120;
  if (minute<1020) return 0;
  return 0.36*Math.min(1,(minute-1020)/180);
}

/** Formatiert die gespeicherte Spielzeit auf der Ortskarte minutengenau. @param {object} game Spiel. */
export function clockLabel(game) {
  const minute=Math.floor(minuteOfDay(game));
  return `${String(Math.floor(minute/60)).padStart(2,'0')}:${String(minute%60).padStart(2,'0')}`;
}
