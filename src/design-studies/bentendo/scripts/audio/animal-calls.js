import { playSynthCall } from './synth-calls.js';

export const ANIMAL_CALLS={
  frog:{wave:'triangle',duration:0.12,pitches:[180,95,140],count:2,gap:0.18,level:0.6},
  snake:{wave:'noise',duration:0.2,pitches:[700,350,180],count:1,gap:0,level:0.25},
  cat:{wave:'triangle',duration:0.32,pitches:[620,920,840,440],count:1,gap:0,level:0.55},
  dog:{wave:'square',duration:0.09,pitches:[250,190,115],count:2,gap:0.16,level:0.22},
  squirrel:{wave:'triangle',duration:0.065,pitches:[1500,2350,1800],count:3,gap:0.11,level:0.32},
  mouse:{wave:'sine',duration:0.1,pitches:[2300,3100,2000],count:2,gap:0.14,level:0.5},
  hedgehog:{wave:'noise',duration:0.12,pitches:[700,350,180],count:2,gap:0.17,level:0.35},
};

/** Spielt deutlich hörbare Tierlaute über den unveränderten Lautstärke- und Stummschaltungspfad. @param {object} effects Vorhandene Audioeffekte. @param {string} animal Tierart. */
export function playAnimalCall(effects,animal) {
  const profile=ANIMAL_CALLS[animal];
  playSynthCall(effects,profile,profile?.wave==='noise'?7.2:4.2);
}
