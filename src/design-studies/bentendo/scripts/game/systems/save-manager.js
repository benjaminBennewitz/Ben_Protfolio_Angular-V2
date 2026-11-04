import { migrateSave } from './save-migrations.js';
import { captureGame,SAVE_KEY } from './save-state.js';
import { validSave } from './save-validation.js';

export const DEBUG_SAVE_KEY='bentendo-dungeon-wanted-debug-save-v1';

/** Liefert Browserspeicher auch bei gesperrtem Zugriff ohne Spielabbruch. */
export function gameStorage() {
  try { return window.localStorage; } catch { return null; }
}

/** Sichert Raumwechsel und ausdrückliche Speicheraktionen und hält Debugdurchläufe getrennt. */
export class SaveManager {
  /** Verbindet Spiel und austauschbaren Speicher. @param {object} game Spiel. @param {object} storage Browserspeicher oder null. */
  constructor(game,storage) { this.game=game; this.storage=storage; this.last=''; this.load(); }
  /** Lädt beide Slots unabhängig voneinander. */
  load() {
    const game=this.game;
    game.titleChoice=0; this.lastVisit=game.roomVisit; game.saveNotice=null;
    const normal=this.readSlot(SAVE_KEY),debug=this.readSlot(DEBUG_SAVE_KEY);
    game.resumeData=normal.data; game.debugResumeData=debug.data;
    this.last=normal.raw; this.lastDebug=debug.raw;
    game.saveStatus=normal.error || debug.error?'Ein Spielstand konnte nicht gelesen werden.':this.storage?'Speichern bei Raumwechsel aktiv. SELECT speichert manuell.':'Browserspeicher nicht verfügbar. Fortschritt wird nicht gespeichert.';
  }
  /** Liest einen validierten lokalen Slot. @param {string} key Speicherschlüssel. */
  readSlot(key) {
    try {
      const raw=this.storage?.getItem(key);
      if (!raw) return {data:null,raw:''};
      if (raw.length>250000) throw new Error('Spielstand zu groß');
      const data=migrateSave(this.game,JSON.parse(raw));
      if (!validSave(this.game,data)) throw new Error('Spielstand unlesbar');
      return {data,raw};
    } catch { return {data:null,raw:'',error:true}; }
  }
  /** Erkennt neue Raumbesuche ohne Serialisierung und blendet das Speichersymbol zeitgesteuert aus. @param {number} dt Zeitschritt. */
  update(dt) {
    if (this.game.saveNotice) this.game.saveNotice.remaining=Math.max(0,this.game.saveNotice.remaining-dt);
    if (this.game.mode!=='world' || this.lastVisit===this.game.roomVisit) return;
    this.lastVisit=this.game.roomVisit; this.flush();
  }
  /** Schreibt den normalen Slot oder bei manueller Bestätigung den Debug-Slot. @param {boolean} manual Ausdrücklich bestätigt. */
  flush(manual=false) {
    const game=this.game;
    if (game.mode!=='world' || game.debugging && !manual) return false;
    if (!this.storage) return this.result(false);
    try {
      const data=captureGame(game),raw=JSON.stringify(data);
      if (raw.length>250000 || !validSave(game,data)) throw new Error('Spielstand ungültig');
      if (game.debugging) {
        if (raw!==this.lastDebug) this.storage.setItem(DEBUG_SAVE_KEY,raw);
        this.lastDebug=raw; game.debugResumeData=data;
      } else {
        if (raw!==this.last) this.storage.setItem(SAVE_KEY,raw);
        this.last=raw; game.resumeData=data;
      }
      this.lastVisit=game.roomVisit; return this.result(true);
    } catch { return this.result(false); }
  }
  /** Zeigt ausschließlich das tatsächliche Speicherergebnis, niemals einen vorgetäuschten Erfolg. @param {boolean} success Erfolgreich gesichert. */
  result(success) {
    this.game.saveNotice={success,remaining:success?1.6:3};
    this.game.saveStatus=success?'Spielstand lokal gespeichert.':this.storage?'Speichern fehlgeschlagen. Bitte Browserspeicher prüfen.':'Speichern fehlgeschlagen. Browserspeicher nicht verfügbar.';
    return success;
  }

}
