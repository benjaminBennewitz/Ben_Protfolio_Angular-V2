import { confirmRest } from './rest-menu.js';
import { openAudioMenu,navigateAudioMenu } from './audio-menu.js';
/** Schaltet eine Pause ein, ohne das aktuelle Gespräch oder den Rucksack zu verlieren. @param {object} game Spiel. */
export function togglePause(game) {
  if (game.mode!=='world') return game.interact();
  game.held=null;
  if (game.systemMenu) { closeSystemMenu(game); return; }
  game.systemMenu={kind:'pause',choice:0}; game.sounds.push('ui-confirm');
}

/** Öffnet über SELECT die ausdrückliche Speicherbestätigung. @param {object} game Spiel. */
export function openSaveMenu(game) {
  if (game.mode!=='world') return;
  const returnPause=Boolean(game.systemMenu?.kind==='pause' || game.systemMenu?.returnPause);
  game.held=null; game.systemMenu={kind:'save',choice:0,returnPause}; game.sounds.push('ui-confirm');
}

/** Wählt Speichern oder Zurück ohne Weltbewegung. @param {object} game Spiel. @param {string} direction Richtung. @param {object} audio Audiosteuerung. */
export function navigateSystemMenu(game,direction,audio) {
  const menu=game.systemMenu;
  if (!menu || menu.status) return;
  if (menu.kind==='rest') { menu.choice=(menu.choice+(['left','up'].includes(direction)?3:1))%4; game.sounds.push('ui-move'); return; }
  if (menu.kind==='audio') return navigateAudioMenu(game,direction,audio);
  if (menu.kind==='pause') { menu.choice=(menu.choice+(['left','up'].includes(direction)?4:1))%5; game.sounds.push('ui-move'); return; }
  const next=['left','up'].includes(direction)?0:1;
  if (menu.choice!==next) game.sounds.push('ui-move');
  menu.choice=next;
}

/** Bestätigt Pause, Speicheraktion oder Abschlussmeldung genau einmal. @param {object} game Spiel. @param {object} saves Vorhandene Speicherverwaltung. @param {object} audio Audiosteuerung. */
export function activateSystemMenu(game,saves,audio) {
  const menu=game.systemMenu;
  if (!menu) return;
  if (menu.kind==='rest') return confirmRest(game);
  if (menu.kind==='pause') return activatePause(game);
  if (menu.kind==='audio') return menu.choice===3?closeSystemMenu(game):navigateAudioMenu(game,menu.choice===2?'toggle':'right',audio);
  if (menu.status || menu.choice===1) return closeSystemMenu(game);
  if (game.debugging) { menu.status='Debuglauf wird nicht gespeichert.'; game.sounds.push('ui-back'); return; }
  const success=saves.flush();
  menu.status=success?'Gespeichert.':game.saveStatus || 'Speichern nicht möglich.';
  game.sounds.push(success?'ui-confirm':'ui-back');
}

/** Schließt nur das Gerätemenü und gibt den bisherigen Spielzustand wieder frei. @param {object} game Spiel. */
export function closeSystemMenu(game) {
  const menu=game.systemMenu;
  game.systemMenu=menu?.returnPause?{kind:'pause',choice:0}:null;
  if (menu?.returnBag) game.bagOpen=true;
  game.held=null; game.sounds.push('ui-back');
}

/** Bestätigt eine mit dem Steuerkreuz gewählte Pausenaktion. @param {object} game Spiel. */
function activatePause(game) {
  const choice=game.systemMenu.choice;
  if (choice===0) return closeSystemMenu(game);
  if (choice===3) return openAudioMenu(game,true);
  if (choice===4) return openSaveMenu(game);
  game.systemMenu=null;
  if (choice===1) return game.journal();
  game.bagOpen=false; game.mapOpen=true; game.bagIndex=6;
}
