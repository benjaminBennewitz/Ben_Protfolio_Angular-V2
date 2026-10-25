import { playSynthCall } from './synth-calls.js';

const SUCCESSES={
  'success-waterwheel':{notes:[392,494,587,784,880,988,1175],step:0.14,length:0.23,bass:[196,247,294]},
  'success-quest':{notes:[523,659,784,659,1047],step:0.14,length:0.24,bass:[131,196]},
  'success-small':{notes:[659,784,1047],step:0.1,length:0.15,bass:[]},
};

/** Spielt kurze mehrstimmige Retro-Fanfaren mit echten Einzelnoten statt eines Tonhöhen-Gleiters. @param {object} effects Effektkanal. @param {string} cue Erfolgskennung. */
export function playSuccessCall(effects,cue) {
  const song=SUCCESSES[cue];
  if (!song) return;
  for (let i=0;i<song.notes.length;i++) successNote(effects,song.notes[i],0.15+i*song.step,song.length,'square',0.8);
  for (let i=0;i<song.bass.length;i++) successNote(effects,song.bass[i],0.15+i*0.28,0.3,'triangle',1.1);
}

/** Plant eine einzelne Note weich begrenzt am bestehenden Master-Ausgang. @param {object} effects Effektkanal. @param {number} pitch Tonhöhe. @param {number} delay Startversatz. @param {number} duration Länge. @param {string} wave Wellenform. @param {number} level Pegel. */
function successNote(effects,pitch,delay,duration,wave,level) {
  playSynthCall(effects,{wave,duration,pitches:[pitch,pitch],count:1,gap:0,delay,level},1.5);
}
