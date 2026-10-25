import { openRestMenu } from './rest-menu.js';
import { respectNightRest } from './daily-life.js';
import { openForestShortcut,talkForestTraveller } from './forest-return.js';
import { enterEastPump,enterEastGate,inspectPump,takeSparePipe,turnEastPipe,resetEastPipes,startEastPump,inspectEastClue,talkEda } from './east-story.js';
import { recoverLoot } from './health.js';
import { sourceMechanism,dungeonDoor,startNest,dungeonReward } from './dungeon.js';
import { talkMara,enterMaraArchive,enterSourceCave,inspectSourceGate } from './mara-quest.js';
import { villageBranch, villageSluice, villageKeeper, villageDoor } from './village.js';
import { take, chest, note } from './loot.js';
import { search, discoveryConversation } from './discoveries.js';
import { residentReply } from './resident-chatter.js';
import { tryFetch } from './dog-fetch.js';
import { stockInspectionText,villageTaskConversation } from './village-tasks.js';
import { push, resetFurniture } from './push.js';
import { hallConsole, hallExit, toggleSwitch, storageConsole, storageExit, steamConsole, valve, steamExit, returnCup } from './puzzles.js';

/** Zeigt den Objekttext. @param {object} game Spiel. @param {object} object Gegenstand. */
function inspect(game, object) {
  if (object.sleeping) return game.say(object.name,object.text);
  if (object.id==='mara') return talkMara(game);
  if (object.id==='workshop-helper' && game.flags.eastPumpSurveyed && !game.flags.eastSpareTaken) return game.say(object.name,'Die Bögen für die alte Druckleitung? Die habe ich nicht weggeworfen. Alles, was noch dicht war, kam zu den Beschlägen. Die kleinen Kisten lohnen oft den zweiten Blick.');
  if (object.kind==='dog' && tryFetch(game,object)) return;
  if (object.action==='talk' && villageTaskConversation(game,object)) return;
  if (object.action==='talk' && discoveryConversation(game,object)) return;
  let text=game.flags.waterFlowing && object.flowText?object.flowText:object.text;
  if (object.action==='talk') text=residentReply(game,object,text);
  text=stockInspectionText(game,object,text);
  const animal=object.kind==='wildlife'?object.animal:['cat','dog'].includes(object.kind)?object.kind:null;
  game.say(object.name,text || 'Hier gibt es gerade nichts weiter zu entdecken.',animal?`animal-${animal}`:'talk');
}
/** Wechselt durch eine benannte Tür. @param {object} game Spiel. @param {object} object Ausgang. */
function travel(game, object) { if (respectNightRest(game,object)) return; game.travel(object.to, object.spawn); }

export const ACTIONS = {
  'east-shortcut':openForestShortcut,'east-traveller':talkForestTraveller,
  'east-pump-entry':enterEastPump,'east-gate':enterEastGate,'east-pump-sign':inspectPump,'east-spares':takeSparePipe,'east-pipe':turnEastPipe,'east-pipe-reset':resetEastPipes,'east-pump-start':startEastPump,'east-clue':inspectEastClue,'east-eda':talkEda,
  sleep:openRestMenu,'recover-loot':recoverLoot,'source-mechanism':sourceMechanism,'dungeon-door':dungeonDoor,'start-nest':startNest,'dungeon-reward':dungeonReward,
  'mara-archive':enterMaraArchive,'mara-north':enterSourceCave,'mara-route':enterSourceCave,'mara-source':inspectSourceGate,
  'village-branch':villageBranch, 'village-sluice':villageSluice, 'village-keeper':villageKeeper, 'village-door':villageDoor,
  inspect, talk: inspect, travel, take, chest, note, search, push, reset: resetFurniture,
  'hall-console': hallConsole, 'hall-exit': hallExit, switch: toggleSwitch,
  'storage-console': storageConsole, 'storage-exit': storageExit,
  'steam-console': steamConsole, valve, 'steam-exit': steamExit, 'cup-return': returnCup,
};
