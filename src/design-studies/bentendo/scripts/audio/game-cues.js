import { playForestCall } from './forest-calls.js';
import { playCombatCall } from './combat-calls.js';
import { playUiCall } from './ui-calls.js';
import { playAnimalCall } from './animal-calls.js';
import { playInteractionCall } from './interaction-calls.js';
import { playSuccessCall } from './success-calls.js';

/** Leitet Spielereignisse an ihre hörbaren Klangprofile weiter. @param {object} effects Gemeinsamer Effektkanal. @param {string} cue Klangkennung. */
export function playGameCue(effects,cue) {
  if (cue.startsWith('forest-')) return playForestCall(effects,cue);
  if (cue==='combat-hit-spider') cue='combat-hit';
  if (cue==='combat-death-large') cue='combat-death-enemy';
  if (cue.startsWith('combat-')) return playCombatCall(effects,cue);
  if (cue.startsWith('ui-')) return playUiCall(effects,cue);
  if (cue.startsWith('animal-')) return playAnimalCall(effects,cue.slice(7));
  if (cue.startsWith('success-')) return playSuccessCall(effects,cue);
  if (['door','chest','treasure','throw'].includes(cue)) return playInteractionCall(effects,cue);
  const frequencies={step:100,push:140,pickup:620,gear:240,rune:460,talk:300,steam:120};
  effects.tone(frequencies[cue] || 220,cue==='step'?0.025:0.06);
}
