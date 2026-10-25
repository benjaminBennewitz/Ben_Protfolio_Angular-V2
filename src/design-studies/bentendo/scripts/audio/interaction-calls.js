import { playSynthCall } from './synth-calls.js';

const INTERACTION_CALLS={
  door:{wave:'triangle',duration:0.32,pitches:[420,180,320,130],count:2,gap:0.12,level:1.6},
  chest:{wave:'triangle',duration:0.3,pitches:[240,160,480,720],count:1,gap:0,level:2},
  treasure:{wave:'triangle',duration:0.24,pitches:[523,659,784,1047],count:1,gap:0,delay:0.34,level:1.6},
  throw:{wave:'noise',duration:0.16,pitches:[],count:1,gap:0,level:0.9},
};

/** Spielt kräftige Öffnungsklänge und einen nachfolgenden Fundjubel im Retro-Stil. @param {object} effects Vorhandener Effektkanal. @param {string} cue Klangkennung. */
export function playInteractionCall(effects,cue) { playSynthCall(effects,INTERACTION_CALLS[cue],1.5); }
