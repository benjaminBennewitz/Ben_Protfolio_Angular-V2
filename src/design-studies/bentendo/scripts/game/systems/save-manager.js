import { migrateSave } from './save-migrations.js';
import { captureGame,SAVE_KEY } from './save-state.js';
import { validSave } from './save-validation.js';

/** Liefert Browserspeicher auch bei gesperrtem Zugriff ohne Spielabbruch. */
export function gameStorage() {
  try { return window.localStorage; } catch { return null; }
}

/** Sichert Raumwechsel und ausdrückliche Speicheraktionen und hält Debugdurchläufe getrennt. */
export class SaveManager {
  /** Verbindet Spiel und austauschbaren Speicher. @param {object} game Spiel. @param {object} storage Browserspeicher oder null. */
  constructor(game,storage) { this.game=game; this.storage=storage; this.last=''; this.load(); }
  /** Prüft einen vorhandenen Stand vor dem Angebot zum Fortsetzen. */
  load() {
    this.game.resumeData=null; this.game.titleChoice=0; this.last=''; this.lastVisit=this.game.roomVisit; this.game.saveNotice=null;
    try {
      const raw=this.storage?.getItem(SAVE_KEY);
      if (raw) {
        if (raw.length>250000) throw new Error('Spielstand zu groß');
        const data=migrateSave(this.game,JSON.parse(raw));
        if (!validSave(this.game,data)) throw new Error('Spielstand unlesbar');
        this.game.resumeData=data; this.last=raw;
      }
      this.game.saveStatus=this.storage?'Speichern bei Raumwechsel aktiv. SELECT speichert manuell.':'Browserspeicher nicht verfügbar. Fortschritt wird nicht gespeichert.';
    } catch { this.game.saveStatus='Spielstand konnte nicht gelesen werden. Ein neues Spiel ist möglich.'; }
  }
  /** Erkennt neue Raumbesuche ohne Serialisierung und blendet das Speichersymbol zeitgesteuert aus. @param {number} dt Zeitschritt. */
  update(dt) {
    if (this.game.saveNotice) this.game.saveNotice.remaining=Math.max(0,this.game.saveNotice.remaining-dt);
    if (this.game.mode!=='world' || this.lastVisit===this.game.roomVisit) return;
    this.lastVisit=this.game.roomVisit; this.flush();
  }
  /** Schreibt einen konsistenten logischen Stand, bei Raumwechsel oder manueller Bestätigung. */
  flush() {
    const game=this.game;
    if (game.mode!=='world' || game.debugging) return false;
    if (!this.storage) return this.result(false);
    try {
      const data=captureGame(game),raw=JSON.stringify(data);
      if (raw.length>250000 || !validSave(game,data)) throw new Error('Spielstand ungültig');
      if (raw!==this.last) this.storage.setItem(SAVE_KEY,raw);
      this.last=raw; this.lastVisit=game.roomVisit; game.resumeData=data; return this.result(true);
    } catch { return this.result(false); }
  }
  /** Zeigt ausschließlich das tatsächliche Speicherergebnis, niemals einen vorgetäuschten Erfolg. @param {boolean} success Erfolgreich gesichert. */
  result(success) {
    this.game.saveNotice={success,remaining:success?1.6:3};
    this.game.saveStatus=success?'Spielstand lokal gespeichert.':this.storage?'Speichern fehlgeschlagen. Bitte Browserspeicher prüfen.':'Speichern fehlgeschlagen. Browserspeicher nicht verfügbar.';
    return success;
  }

}
