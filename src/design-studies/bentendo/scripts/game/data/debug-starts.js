import { DUNGEON_MESSAGE } from './quell-dungeon.js';
import { rememberNote } from '../systems/loot.js';

const SOURCE_PROGRESS={waterFlowing:true,guildOpen:true,stockDone:true,spoolDone:true,maraStarted:true,maraArchiveOpen:true,maraReported:true,maraDone:true,northOpen:true,maraSpringSurveyed:true,maraSpringReported:true};
const DUNGEON_PROGRESS={...SOURCE_PROGRESS,sourceDrained:true,sourceStage:3};
const FOREST_PROGRESS={...DUNGEON_PROGRESS,quellNestCleared:true,maraLowerMessage:true,maraLowerReported:true,eastPumpKnown:true,eastPumpSurveyed:true,eastSpareTaken:true,eastPipeRepaired:true,eastOpen:true};
const MEADOW_PROGRESS={...FOREST_PROGRESS,eastEdaMet:true,eastTrailDone:true,eastTrailReported:true,eastDoorStudied:true,eastRootOpen:true};

const STARTS={
  storage:{flags:{hallPowered:true}},
  steam:{items:['Runenkupplung'],flags:{hallPowered:true,storageOpen:true}},
  archive:{flags:{hallPowered:true,storageOpen:true,coupled:true,steamSafe:true,valve0:true,valve1:true,valve2:true}},
  'mara-cave':{items:['Ast'],flags:SOURCE_PROGRESS},
  'quell-entry':{items:['Ast'],flags:DUNGEON_PROGRESS},
  'quell-nest':{items:['Ast'],flags:DUNGEON_PROGRESS},
  'east-wood':{items:['Ast','Rostiges Schwert'],flags:FOREST_PROGRESS},
  'east-waystation':{items:['Ast','Rostiges Schwert'],flags:MEADOW_PROGRESS},
  'root-entry':{items:['Ast','Geschärftes Schwert'],flags:{...MEADOW_PROGRESS,eastStreamOpen:true,eastLowlandGateOpen:true}},
  'east-meadow':{items:['Ast','Rostiges Schwert'],flags:MEADOW_PROGRESS},
};

/** Startet einen isolierten Testlauf mit der bis zum Einstieg erspielten Ausrüstung. @param {object} game Spiel. @param {string} id Raumkennung. */
export function startDebugRun(game,id) {
  game.reset(); game.mode='world'; game.debugging=true;
  const start=Object.hasOwn(STARTS,id)?STARTS[id]:null;
  if (start?.items) game.inventory.push(...start.items);
  Object.assign(game.flags,start?.flags);
  if (game.flags.quellNestCleared) {
    rememberNote(game,DUNGEON_MESSAGE);
    game.states.set('quell-nest',{blocks:[],taken:new Set(['reward'])});
  }
  game.travel(id);
}
