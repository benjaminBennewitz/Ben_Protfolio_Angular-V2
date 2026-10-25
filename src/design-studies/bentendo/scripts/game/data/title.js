/** Wählt Fortsetzen oder einen neuen Durchlauf, wenn ein gültiger Spielstand vorliegt. @param {object} game Spiel. @param {string} direction Richtung. */
export function navigateTitle(game,direction) {
  if (game.mode!=='title' || !game.resumeData) return;
  const next=['left','up'].includes(direction)?0:1;
  if (next!==game.titleChoice) game.sounds.push('ui-move');
  game.titleChoice=next; game.held=null;
}
