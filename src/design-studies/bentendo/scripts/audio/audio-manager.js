import { GbfxSounds } from './gbfx-sounds.js';
import { MechanicalSounds } from './mechanical-sounds.js';
import { Effects } from './effects.js';
import { playGameCue } from './game-cues.js';
import { audioStorage, readAudioSettings, writeAudioSettings } from './preferences.js';

/** Verwaltet vorhandene MP3s ohne doppelte Musikstarts. */
export class AudioManager {
  /** Erstellt die wiederverwendbaren Audiokanäle. */
  constructor() {
    this.effects = new Effects(); this.mechanical=new MechanicalSounds(this.effects); this.gbfx=new GbfxSounds(this.effects);
    this.music = new Audio();
    this.boot = new Audio('./assets/sounds/start-beep.mp3');
    this.boot.preload = 'auto';
    this.track = '';
    this.storage=audioStorage(); this.settingsTimer=0;
    Object.assign(this,readAudioSettings(this.storage));
    this.finishBoot = null;
    this.ducking=false; this.duckTimer=0;
    this.music.addEventListener('timeupdate', this.trimTitle.bind(this));
    window.addEventListener('pagehide',this.persistSettings.bind(this));
    this.applyVolume();
  }
  /** Aktiviert Audio nach einer Eingabe. */
  unlock() { this.effects.unlock().then(this.prepareSounds.bind(this)).catch(this.report); }
  /** Lädt die Klangbank nach Freigabe und übernimmt die aktuellen Regler. */
  prepareSounds() { this.applyVolume(); this.gbfx?.prepare(); }
  /** Aktiviert Materialklänge auch vor dem Einschalten und erhält Master, SFX und Mute. @param {string} action Knopf. @param {boolean} released Loslassen. */
  playMechanical(action,released=false) {
    return this.effects.unlock().then(this.playUnlockedMechanical.bind(this,action,released)).catch(this.report);
  }
  /** Übernimmt nach dem Entsperren die aktuellen Regler vor dem Materialklang. @param {string} action Knopf. @param {boolean} released Loslassen. */
  playUnlockedMechanical(action,released) { this.applyVolume(); this.mechanical.play(action,released); }
  /** Meldet optionale Audiofehler ohne die Bedienung zu blockieren. @param {Error} error Fehler. */
  report(error) { console.warn('Audio konnte nicht abgespielt werden.', error); }
  /** Aktualisiert alle Kanäle. */
  applyVolume() {
    const level = this.muted ? 0 : this.volume;
    this.music.volume = level * (this.bgm ?? 1) * 0.9 * (this.ducking?0.3:1);
    this.boot.volume = level * (this.sfx ?? 1);
    this.effects.volume(level * (this.sfx ?? 1));
  }
  /** Ändert einen Audiokanal unabhängig vom physischen Lautstärkerad. @param {string} channel Kanal. @param {number} value Anteil. */
  setChannel(channel,value) {
    if (!['bgm','sfx'].includes(channel) || !Number.isFinite(value)) return;
    this[channel]=Math.max(0,Math.min(1,value)); this.applyVolume(); this.saveSettings();
  }
  /** Schaltet ausschließlich Menüauswahl und Abbrechen um. @param {boolean} enabled Menü-Beeps aktiv. */
  setMenuBeeps(enabled) { this.menuBeeps=enabled!==false; this.saveSettings(); }
  /** Spielt auch beim Aufwecken des Audiokontexts den angeforderten Klang. @param {string} cue Spielereignis. */
  playCue(cue) {
    if (cue==='success-quest' || cue==='success-waterwheel' || cue==='combat-death-hero') this.duckMusic();
    if (this.effects.context?.state==='running') return this.routeCue(cue);
    return this.effects.unlock().then(this.playUnlockedCue.bind(this,cue)).catch(this.report);
  }
  /** Übernimmt nach dem Aktivieren zuerst den aktuellen Regler und dann den Klang. @param {string} cue Spielereignis. */
  playUnlockedCue(cue) { this.prepareSounds(); this.routeCue(cue); }
  /** Verhindert ausgeschaltete Menü-Beeps und nutzt sofortigen Synth-Ersatz während des Ladens. @param {string} cue Spielereignis. */
  routeCue(cue) {
    if (this.menuBeeps===false && ['ui-move','ui-confirm','ui-back'].includes(cue)) return;
    this.gbfx?.prepare();
    if (!this.gbfx?.play(cue)) playGameCue(this.effects,cue);
  }
  /** Gibt Ziel-Fanfaren kurz hörbar Platz gegenüber der Musik. */
  duckMusic() {
    clearTimeout(this.duckTimer); this.ducking=true; this.applyVolume();
    this.duckTimer=setTimeout(this.restoreMusic.bind(this),1400);
  }
  /** Stellt den aktuellen Reglerwert wieder her, auch nach Lautstärke- oder Mute-Änderung. */
  restoreMusic() { clearTimeout(this.duckTimer); this.ducking=false; this.applyVolume(); }
  /** Bündelt Speicherzugriffe während einer Reglergeste. */
  saveSettings() {
    clearTimeout(this.settingsTimer);
    this.settingsTimer=setTimeout(this.persistSettings.bind(this),150);
  }
  /** Schreibt den letzten Zustand auch beim Verlassen der Seite. */
  persistSettings() {
    clearTimeout(this.settingsTimer);
    writeAudioSettings(this.storage,{volume:this.volume,muted:this.muted,bgm:this.bgm,sfx:this.sfx,menuBeeps:this.menuBeeps});
  }
  /** Wechselt die Hintergrundmusik. @param {string} track Dateiname ohne Endung oder leer. */
  playMusic(track) {
    if (track === this.track) return;
    this.music.pause(); this.track = track;
    if (!track) return;
    this.music.src = `./assets/sounds/${track}.mp3`;
    this.music.loop = true;
    this.music.play().catch(this.report);
  }
  /** Überspringt ausschließlich die bekannte Nachlaufstille der Titeldatei. */
  trimTitle() {
    if (this.track === 'title-screen' && this.music.currentTime >= 68.8) this.music.currentTime = 0;
  }
  /** Spielt den Bootklang vollständig. @param {Function} done Abschluss auch bei Audiofehlern. */
  playBoot(done) {
    this.stopBoot(); this.finishBoot = done;
    this.boot.onended = this.completeBoot.bind(this);
    this.boot.onerror = this.completeBoot.bind(this);
    this.boot.currentTime = 0;
    this.boot.play().catch(this.completeBoot.bind(this));
  }
  /** Schließt den aktuellen Bootklang genau einmal ab. */
  completeBoot() {
    const done = this.finishBoot;
    this.finishBoot = null;
    if (done) done();
  }
  /** Stoppt den Bootklang ohne veraltete Abschlussaktionen. */
  stopBoot() {
    this.finishBoot = null;
    this.boot.onended = null; this.boot.onerror = null;
    this.boot.pause();
  }
  /** Stoppt alle Dateikanäle. */
  stop() { this.restoreMusic(); this.stopBoot(); this.playMusic(''); }
}
