export const CHARACTER_PRESETS=[
  {id:'female',label:'Weiblich',portraitX:0},
  {id:'male',label:'Männlich',portraitX:64},
];

/** Wechselt ausschließlich das Aussehen, ohne Fähigkeiten oder Questzustände zu verändern. @param {object} game Spiel. @param {string} direction Richtung. */
export function navigateCharacter(game,direction) {
  if (game.mode!=='character') return;
  const next=['left','up'].includes(direction)?0:1;
  if (next!==game.characterIndex) game.sounds.push('ui-move');
  game.characterIndex=next;
  game.held=null;
}

/** Startet den Rundgang mit dem ausgewählten Preset und dem vorhandenen Aushang. @param {object} game Spiel. */
export function confirmCharacter(game) {
  game.avatar=CHARACTER_PRESETS[game.characterIndex].id;
  game.mode='world'; game.held=null;
  const invitation=game.notes[0];
  if (game.room.id==='village') game.say('Aushang',invitation.text,'ui-confirm');
  else game.say('Hausmeister','Da biste! Willkommen in Bruchstein. Schau dich in Ruhe um.','ui-confirm');
}
