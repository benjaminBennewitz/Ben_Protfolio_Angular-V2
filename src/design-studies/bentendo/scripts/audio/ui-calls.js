import { playSynthCall } from './synth-calls.js';

const UI_CALLS={
  'ui-move':[[784,0,0.045]],
  'ui-confirm':[[988,0,0.065],[1568,0.075,0.12]],
  'ui-back':[[523,0,0.065]],
  'ui-denied':[[330,0,0.08],[220,0.09,0.1]],
};

/** Spielt kurze Auswahl-Bleeps und einen zweistufigen Bestätigungsklang am bestehenden Effektkanal. @param {object} effects Effektkanal. @param {string} cue Bedienereignis. */
export function playUiCall(effects,cue) {
  for (const [pitch,delay,duration] of UI_CALLS[cue] || []) {
    playSynthCall(effects,{wave:'square',duration,pitches:[pitch,pitch],count:1,gap:0,delay,level:0.9},1.5);
  }
}
