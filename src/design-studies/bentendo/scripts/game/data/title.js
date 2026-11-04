/** Liefert verfügbare Startoptionen mit ihrem zugehörigen Spielstand. @param {object} game Spiel. */
export function titleOptions(game) {
  const options=[];
  if (game.resumeData) options.push({label:'Fortsetzen',data:game.resumeData});
  if (game.debugResumeData) options.push({label:'Debugstand laden',data:game.debugResumeData,debug:true});
  options.push({label:'Neues Spiel'});
  return options;
}

/** Bewegt die Auswahl über die verfügbaren Startoptionen. @param {object} game Spiel. @param {string} direction Richtung. */
export function navigateTitle(game,direction) {
  if (game.mode!=='title') return;
  const next=Math.max(0,Math.min(titleOptions(game).length-1,game.titleChoice+(['left','up'].includes(direction)?-1:1)));
  if (next!==game.titleChoice) game.sounds.push('ui-move');
  game.titleChoice=next; game.held=null;
}
