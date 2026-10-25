import { playSynthCall } from './synth-calls.js';

const CALLS={
  'forest-crickets':{wave:'sine',duration:0.035,pitches:[3400,3700,3300],count:4,gap:0.11,level:0.08},
  'forest-rustle':{wave:'noise',duration:0.45,pitches:[400],count:1,gap:0,level:0.18},
  'forest-metal':{wave:'triangle',duration:0.6,pitches:[760,751,740],count:2,gap:0.26,level:0.16},
};

/** Spielt zurückhaltende Abendgeräusche über den vorhandenen SFX-Regler und Mute-Pfad. @param {object} effects Effektkanal. @param {string} cue Geräuschkennung. */
export function playForestCall(effects,cue) { playSynthCall(effects,CALLS[cue],2); }
