import { clamp } from '../core/dom.js';
const KEY='bentendo.audio.v1';

/** Liefert erreichbaren Browserspeicher ohne Fehler bei gesperrtem Zugriff. */
export function audioStorage() {
  try { return window.localStorage; } catch { return null; }
}

/** Normalisiert gespeicherte Werte. @param {object} values Ungeprüfte Einstellungen. */
function normalize(values) {
  const valid=typeof values?.volume==='number' && Number.isFinite(values.volume);
  return {volume:valid?clamp(values.volume):0.35, muted:values?.muted===true, bgm:channelLevel(values?.bgm), sfx:channelLevel(values?.sfx),menuBeeps:values?.menuBeeps!==false};
}

/** Liest Lautstärke und Stummschaltung mit sicheren Standardwerten. @param {Storage} storage Optionaler Speicher. */
export function readAudioSettings(storage) {
  try { return normalize(JSON.parse(storage?.getItem(KEY)||'null')); }
  catch { return normalize(null); }
}

/** Speichert Lautstärke, Kanäle und die unabhängige Menüklangwahl. @param {Storage} storage Optionaler Speicher. @param {object} values Einstellungen. */
export function writeAudioSettings(storage,values) {
  try { storage?.setItem(KEY,JSON.stringify(normalize(values))); } catch { /* Gesperrter Speicher beeinträchtigt die Bedienung nicht. */ }
}

/** Erhält bestehende Tonstände und begrenzt neue Kanalwerte. @param {unknown} value Kanalwert. */
function channelLevel(value) { return typeof value==='number' && Number.isFinite(value)?clamp(value):1; }
