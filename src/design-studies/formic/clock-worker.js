/**
 * @file Unabhängiger Simulationstakt der FORMIC-Designstudie.
 * @description Liefert kurze Zeitdifferenzen an den Hauptthread, damit die
 * Verhaltenssimulation nicht unmittelbar an requestAnimationFrame gebunden ist.
 * @author Benjamin Bennewitz
 */

let timer = null;
let previous = 0;

/** Stoppt den aktuell laufenden Worker-Timer. */
function stopTimer() {
  if (timer === null) return;
  clearInterval(timer);
  timer = null;
}

/** Startet den Worker-Timer und begrenzt lange Browser-Unterbrechungen auf eine Sekunde. */
function startTimer() {
  previous = performance.now();
  timer = setInterval(() => {
    const now = performance.now();
    const seconds = Math.min((now - previous) / 1000, 1);
    previous = now;
    self.postMessage({ type: 'tick', seconds });
  }, 1000 / 30);
}

/** Reagiert ausschließlich auf start/stop-Nachrichten des Hauptthreads. */
self.onmessage = (event) => {
  stopTimer();
  if (event.data.type === 'start') startTimer();
};
