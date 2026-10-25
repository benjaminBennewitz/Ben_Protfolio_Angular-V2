import { canvas } from '../core/dom.js';
import { PALETTE } from '../core/config.js';

/** Zeichnet LCD-Kontaktstörungen und das langsame Entladen nach dem Ausschalten. */
export class LcdEffects {
  /** Hält eine unabhängige Kopie des letzten LCD-Bildes bereit. @param {HTMLCanvasElement} surface LCD-Fläche. */
  constructor(surface) {
    this.surface = surface; this.snapshot = canvas(160,144);
    this.remaining = 0; this.duration = 1.4; this.reduced = false;
  }
  /** Friert das aktuelle Bild vor dem Spielreset ein. @param {boolean} reduced Bewegungsreduktion. */
  startFade(reduced) {
    this.snapshot.getContext('2d').drawImage(this.surface,0,0);
    this.reduced = reduced; this.duration = reduced ? 0.35 : 1.4;
    this.remaining = this.duration;
  }
  /** Blendet Restbild und einzelne schwache Zeilen bis zum ausgeschalteten LCD aus. @param {CanvasRenderingContext2D} ctx LCD-Kontext. */
  drawFade(ctx) {
    if (!this.remaining) return;
    const strength = this.remaining / this.duration;
    ctx.save(); ctx.globalAlpha = strength * strength;
    ctx.drawImage(this.snapshot,0,0);
    if (!this.reduced) {
      ctx.globalAlpha = strength * (1-strength) * 0.32; ctx.fillStyle = PALETTE[3];
      for (let y = 9; y < 144; y += 13) ctx.fillRect(8+(y%17),y,128-(y%23),1);
    }
    ctx.restore();
  }
  /** Erzeugt schwache, deterministische Kontaktmuster ohne helle Vollbildblitze. @param {CanvasRenderingContext2D} ctx LCD-Kontext. @param {number} time Laufzeit. */
  drawNoise(ctx,time) {
    const frame = Math.floor(time*8);
    ctx.save(); ctx.globalAlpha = 0.32;
    for (let i = 0; i < 310; i++) {
      const seed = (i*7919+frame*104729) >>> 0;
      ctx.fillStyle = PALETTE[2+seed%2];
      ctx.fillRect(seed%160,Math.floor(seed/163)%92+5,1+seed%4,1);
    }
    ctx.globalAlpha = 0.5; ctx.fillStyle = PALETTE[3];
    for (let i = 0; i < 7; i++) ctx.fillRect(15+(i*17+frame)%28,58+i*3,95-i*8,1);
    ctx.restore();
  }
}
