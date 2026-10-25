export const GBFX_CUES={
  'ui-move':'00_beep','ui-confirm':'00_beep','ui-back':'01_beep',
  'combat-refill':'10_bling_up','ui-denied':'11_bling_down',
  'combat-hit':'20_pitch_up','combat-death-enemy':'21_pitch_down',
  'combat-death-large':'23_pitch_down_echo',bomb:'30_explosion',
  'combat-hit-spider':'33_weird_pitch_up','buff-gained':'35_pitch_up_echo','buff-expired':'36_pitch_down_echo',
};

/** Lädt Originalklänge vorab und verbindet sie ausschließlich mit dem bestehenden SFX-Kanal. */
export class GbfxSounds {
  /** Merkt den gemeinsamen Effektkanal. @param {object} effects Effektkanal. */
  constructor(effects) { this.effects=effects; this.buffers=new Map(); this.pending=new Set(); }
  /** Startet jeden Ladevorgang höchstens einmal; fehlende Dateien behalten den Synthesizer als Ersatz. */
  prepare() {
    if (!this.effects.context) return;
    for (const file of new Set(Object.values(GBFX_CUES))) {
      if (this.pending.has(file)) continue;
      this.pending.add(file); this.load(file).catch(this.failed.bind(this,file));
    }
  }
  /** Dekodiert eine Datei im gemeinsamen Kontext. @param {string} file Dateiname ohne Endung. */
  async load(file) {
    const response=await fetch(`./assets/sounds/gbfx/${file}.wav`);
    if (!response.ok) throw new Error(`GBFX ${response.status}`);
    const buffer=await this.effects.context.decodeAudioData(await response.arrayBuffer());
    this.buffers.set(file,buffer);
  }
  /** Meldet Ladefehler einmalig; der Synthesizer übernimmt ohne erneute Ladeflut. @param {string} file Dateiname. @param {Error} error Ladefehler. */
  failed(file,error) { console.warn('GBFX nicht geladen:',file,error.message); }
  /** Spielt nur fertig geladene Klänge ohne verspätete Ereignisse nach einem Raumwechsel. @param {string} cue Ereignis. */
  play(cue) {
    const buffer=this.buffers.get(GBFX_CUES[cue]),{context,gain}=this.effects;
    if (!buffer || context?.state!=='running') return false;
    const source=context.createBufferSource(),level=context.createGain(); level.gain.value=3.2;
    source.buffer=buffer; source.connect(level); level.connect(gain);
    source.addEventListener('ended',this.effects.disconnect.bind(this.effects,source,level),{once:true});
    source.start(context.currentTime); return true;
  }
}
