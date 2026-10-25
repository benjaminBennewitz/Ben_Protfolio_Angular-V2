import { App } from './app.js';
import { element } from './core/dom.js';

/** Meldet Ladefehler ohne leere Benutzeroberfläche. @param {Error} error Fehlerursache. */
function reportStartup(error) {
  element('loading').hidden = true;
  element('error').hidden = false;
  element('error').textContent = `Der Handheld konnte nicht gestartet werden: ${error.message}`;
  console.error(error);
}

/** Startet die Anwendung und hält WebGL-Fehler sichtbar. */
async function start() {
  try { await new App().init(); } catch (error) { reportStartup(error); }
}

start();
