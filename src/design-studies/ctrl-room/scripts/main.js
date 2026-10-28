/** @file main.js — Gekapselter Bereich der CTRL//ROOM-Studie. */

import { select, selectAll } from './dom.js';
import { createPlayer } from './player.js';
import { createArchive } from './archive.js';
import { createNavigation } from './navigation.js';
import { createEffects } from './effects.js';
const audio = select('#audio');                                                  // Das einzige gemeinsame Audioelement der Seite.
const playButtons = selectAll('[data-play]');                                    // Alle Schaltflächen für dieselbe Wiedergabeaktion.
const muteButtons = selectAll('[data-mute]');                                    // Alle Schaltflächen des gemeinsamen Stummzustands.
const volumeInputs = selectAll('[data-volume]');                                 // Alle Regler derselben Audio-Lautstärke.
const seekInputs = selectAll('[data-seek]');                                     // Alle Positionsregler des gemeinsamen Tracks.
const message = select('#player-message');                                       // Statusmeldung der regulären Player-Ansicht.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');  // Medienabfrage für reduzierte Bewegung.
const menuButton = select('.menu-toggle');                                       // Schaltfläche zum Öffnen und Schließen des mobilen Menüs.
const menu = select('#mobile-menu');                                             // Container der mobilen Navigation.
const main = select('main');                                                     // Hauptinhalt, der bei geöffnetem Menü inert wird.
const footer = select('footer');                                                 // Footer, der bei geöffnetem Menü inert wird.
const dialog = select('#detail-dialog');                                         // Nativer Detaildialog der Archivdatensätze.
const player = select('#mini-player');                                           // Das zwischen regulärer und modaler Ansicht verschobene Player-Element.
const playerDialog = select('#player-dialog');                                   // Nativer Dialog für die vergrößerte Player-Ansicht.
const playerMinimize = select('#player-minimize');                               // Schaltfläche zum Einklappen des Player-Inhalts.
const playerMaximize = select('#player-maximize');                               // Schaltfläche zum Vergrößern und Wiederherstellen des Players.
const search = select('#archive-search');                                        // Texteingabe zur Suche im lokalen Archiv.
const archiveBody = select('#archive-body');                                     // Tabellenkörper der lokalen Archivdatensätze.
const results = select('#archive-results');                                      // Textanzeige der Trefferzahl und aktiven Kategorie.

const context = {
  select,
  selectAll,
  audio,
  playButtons,
  muteButtons,
  volumeInputs,
  seekInputs,
  message,
  motionPreference,
  menuButton,
  menu,
  main,
  footer,
  dialog,
  player,
  playerDialog,
  playerMinimize,
  playerMaximize,
  search,
  archiveBody,
  results,
};                                                                               // Explizite DOM-Abhängigkeiten der Seitenbereiche.
createNavigation(context);
const audioPlayer = createPlayer(context);                                       // Öffentliche Aktionen der gemeinsamen Audiosteuerung.
const archive = createArchive({
  ...context,
  ...audioPlayer,
});                                                                              // Öffentliche Aktualisierungsschnittstelle des Archivs.
createEffects({
  ...context,
  ...audioPlayer,
});
const { syncAudio, resizeCanvas } = audioPlayer;                                 // Benötigte Werte und Aktionen dieses Teilbereichs.
const { renderArchive } = archive;                                               // Benötigte Werte und Aktionen dieses Teilbereichs.
audio.volume = 0.55;
audio.removeAttribute('controls');
volumeInputs.forEach(

  /**
   * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
   * @param {HTMLInputElement} input - Zu synchronisierendes Range-Eingabefeld.
   * @returns {void} Kein Rückgabewert.
   */
  input => {
    input.disabled = false;
  },
);
muteButtons.forEach(

  /**
   * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
   * @param {HTMLElement} button - Aktuell registrierte oder aktualisierte Schaltfläche.
   * @returns {void} Kein Rückgabewert.
   */
  button => {
    button.disabled = false;
  },
);
search.disabled = false;
select('#interview-button').disabled = !dialog.showModal;
menuButton.hidden = false;
document.body.classList.add('js-ready');
select('#copyright-year').textContent = String(new Date().getFullYear());
syncAudio();
renderArchive();
resizeCanvas();
