import { canvas } from '../core/dom.js';
import { PALETTE } from '../core/config.js';
import { pixelText } from './font.js';
import { drawCharacterSelection } from '../game/render/character.js';
import { drawWorld } from '../game/render/world.js';
import { LcdEffects } from './lcd-effects.js';
import { rect } from '../game/render/primitives.js';

/** Zeichnet ausschließlich den logischen LCD mit 160 × 144 Pixeln. */
export class Display {
  /** Erstellt die LCD-Zeichenfläche. */
  constructor() { this.surface = canvas(160,144); this.ctx = this.surface.getContext('2d'); this.assets = null; this.effects = new LcdEffects(this.surface); }
  /** Zeichnet den aktuellen Gerätezustand. @param {object} app Anwendung. */
  draw(app) {
    this.ctx.imageSmoothingEnabled = false;
    rect(this.ctx, 1, 0, 0, 160, 144);
    if (app.phase === 'off') return this.effects.drawFade(this.ctx);
    if (app.phase === 'fault') return this.drawFault(app);
    if (app.phase === 'boot') return this.drawBoot(app);
    if (app.game.mode === 'title') return this.drawTitle(app.time,app.game);
    if (app.game.mode==='character') return drawCharacterSelection({ctx:this.ctx,game:app.game,assets:this.assets});
    drawWorld({ ctx: this.ctx, game: app.game, assets: this.assets });
  }
  /** Zeichnet den wandernden Startschriftzug. @param {object} app Anwendung. */
  drawBoot(app) {
    const progress = app.device.reduced.matches ? 1 : Math.min(1,Math.max(0,(app.bootTime-0.35)/0.8));
    pixelText(this.ctx,'BENTENDO™',80,Math.round(-30+progress*94),PALETTE[3],3,true);
  }
  /** Zeichnet den vorhandenen Titel mit ruhiger Startaufforderung. @param {number} time Laufzeit. @param {object} game Spiel. */
  drawTitle(time,game) {
    this.ctx.drawImage(this.assets.title,0,0);
    this.ctx.drawImage(this.assets.logo,2,12);
    if (game?.resumeData) return this.drawResumeTitle(game);
    rect(this.ctx,3,35,115,90,17);
    if (Math.floor(time*2)%2 === 0) pixelText(this.ctx,'START',80,120,PALETTE[0],1,true);
  }
  /** Bietet Fortsetzen und einen ausdrücklich gewählten neuen Durchlauf am Titel an. @param {object} game Spiel. */
  drawResumeTitle(game) {
    rect(this.ctx,3,25,105,110,36);
    for (let index=0;index<2;index++) {
      const selected=game.titleChoice===index,y=109+index*15;
      if (selected) rect(this.ctx,0,28,y-1,104,13);
      pixelText(this.ctx,`${selected?'> ':'  '}${index===0?'FORTSETZEN':'NEUES SPIEL'}`,32,y,PALETTE[selected?3:0]);
    }
  }
  /** Zeigt einen ruhigen Kontaktfehler statt flackernder Vollbilder. @param {object} app Anwendung. */
  drawFault(app) {
    pixelText(this.ctx,'BENTENDO™',80,54,PALETTE[3],2,true);
    this.effects.drawNoise(this.ctx,app.device.reduced.matches ? 0 : app.time);
    pixelText(this.ctx,app.device.cartridge.state.slot === 'seated' ? 'KONTAKTE PRÜFEN' : 'MODUL EINRASTEN',80,102,PALETTE[3],1,true);
  }
  /** Bereitet den sichtbaren Ladungsabbau beim Ausschalten vor. @param {boolean} on Neues Einschalten. @param {boolean} wasOn Bisher eingeschaltet. @param {boolean} reduced Bewegungsreduktion. */
  powerChange(on,wasOn,reduced) {
    if (on) this.cancelFade();
    else if (wasOn) this.effects.startFade(reduced);
  }
  /** Beendet ein vorheriges LCD-Restbild. */
  cancelFade() { this.effects.remaining = 0; }
  /** Aktualisiert die Ausschaltanimation. @param {number} dt Zeitschritt. */
  update(dt) { this.effects.remaining = Math.max(0,this.effects.remaining-dt); }
  /** Meldet verbleibende LCD-Ladung. */
  get fading() { return this.effects.remaining > 0; }
}
