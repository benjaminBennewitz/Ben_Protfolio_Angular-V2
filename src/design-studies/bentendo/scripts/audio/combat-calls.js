import { playSwordSwoosh } from './sword-swoosh.js';
import { playSynthCall } from './synth-calls.js';

export const COMBAT_CALLS={
  'combat-hurt':[
    {wave:'square',duration:0.16,pitches:[290,180,120,155],count:1,gap:0,level:1.2},
    {wave:'noise',duration:0.055,pitches:[],count:1,gap:0,level:0.45},
  ],
  'combat-refill':[
    {wave:'triangle',duration:0.09,pitches:[659,784],count:1,gap:0,level:1.8},
    {wave:'triangle',duration:0.16,pitches:[988,1319],count:1,gap:0,delay:0.09,level:1.6},
  ],
  'combat-swing-stick':[
    {wave:'noise',duration:0.09,pitches:[],count:1,gap:0,level:1.2},
    {wave:'triangle',duration:0.07,pitches:[230,90],count:1,gap:0,level:0.7},
  ],
  'combat-swing-sword':[
    {wave:'triangle',duration:0.06,pitches:[1100,650],count:1,gap:0,level:0.22},
  ],
  'combat-hit':[
    {wave:'noise',duration:0.055,pitches:[],count:1,gap:0,level:1.5},
    {wave:'square',duration:0.075,pitches:[170,75],count:1,gap:0,level:1.1},
  ],
  'combat-death-hero':[
    {wave:'square',duration:0.14,pitches:[440,370],count:1,gap:0,level:1.2},
    {wave:'square',duration:0.16,pitches:[330,247],count:1,gap:0,delay:0.15,level:1.1},
    {wave:'triangle',duration:0.45,pitches:[220,110,55],count:1,gap:0,delay:0.32,level:1.8},
  ],
  'combat-death-enemy':[
    {wave:'noise',duration:0.11,pitches:[],count:1,gap:0,level:0.9},
    {wave:'square',duration:0.18,pitches:[620,210,90],count:1,gap:0,level:0.9},
  ],
};

/** Spielt unterscheidbare Kampfklänge über den bestehenden SFX-, Master- und Mute-Pfad. @param {object} effects Gemeinsamer Effektkanal. @param {string} cue Kampfereignis. */
export function playCombatCall(effects,cue) {
  if (cue==='combat-swing-sword') playSwordSwoosh(effects);
  for (const profile of COMBAT_CALLS[cue] || []) playSynthCall(effects,profile,profile.wave==='noise'?2.5:1.5);
}
