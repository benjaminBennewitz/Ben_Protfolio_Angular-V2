import { dailyLifeObjects,animalsRest,settleSleepingDog,respectNightRest } from './daily-life.js';
import { forestReturnObjects } from './forest-return.js';
import { updateTavern } from './tavern-service.js';
import { projectWanderers, updateWanderers } from './wanderers.js';
import { KEEPER_PATH } from '../data/village.js';
import { updateFetch,dogHint } from './dog-fetch.js';

/** Projiziert Dorfobjekte aus dem bestehenden Spielzustand. @param {object} game Spiel. @param {object[]} objects Vorhandene Objekte. */
export function villageObjects(game,objects) {
  if (game.room.id !== 'village') return dailyLifeObjects(game,projectWanderers(game,forestReturnObjects(game,objects)));
  const result = [];
  for (const object of objects) {
    if (object.id==='east-gate' && game.flags.eastOpen) { result.push({...object,kind:'trail',name:'Östlicher Waldsaum',hint:'betreten'}); continue; }
    if (object.id==='north-gate' && game.flags.northOpen) { result.push({...object,kind:'cave-entry',name:'Quellstollen',hint:'betreten'}); continue; }
    if (object.id === 'branch' && game.flags.branchCleared) continue;
    if (object.id === 'keeper') result.push(keeperObject(game,object));
    else if (object.kind==='dog') result.push({...object,hint:dogHint(game),carryingStick:game.roomState.fetch?.phase==='return'});
    else if (object.id === 'branch') result.push({...object,hint:game.flags.branchSeen ? 'herausziehen' : 'untersuchen'});
    else if (object.id === 'mill-door' && game.flags.waterFlowing) result.push({...object,text:'Das Mühlrad läuft wieder. Hinter der Tür klappert ein altes Mahlwerk.'});
    else if (object.flowText && game.flags.waterFlowing) result.push({...object,text:object.flowText});
    else result.push(object);
  }
  return dailyLifeObjects(game,projectWanderers(game,result));
}

/** Liefert Position und Zeicheninterpolation des Hausmeisters. @param {object} game Spiel. @param {object} object Hausmeister. */
function keeperObject(game,object) {
  const actor = game.roomState.keeper;
  const index = actor?.index || 0, [x,y] = KEEPER_PATH[index];
  const [fromX,fromY] = KEEPER_PATH[Math.max(0,index-1)];
  const progress = actor ? Math.min(1,actor.elapsed/0.3) : 1;
  return {...object,x,y,drawX:fromX+(x-fromX)*progress,drawY:fromY+(y-fromY)*progress};
}

/** Untersucht und entfernt das sichtbare Hindernis in zwei Aktionen. @param {object} game Spiel. */
export function villageBranch(game) {
  if (!game.flags.branchSeen) {
    game.flags.branchSeen = true;
    return game.say('Ast','Ein langer Ast hat sich zwischen Ufer und Speichen des Wasserrads verkeilt. Du kannst ihn vom linken Ufer aus herausziehen.');
  }
  if (game.flags.branchCleared) return;
  if (game.inventory.length>=6) return game.say('Rucksack','Der Rucksack ist voll. Der Ast bleibt hier, bis du Platz gemacht hast.');
  game.flags.branchCleared = true; game.inventory.push('Ast');
  game.say('Du','Der Ast ist draußen und bleibt im Rucksack. Vielleicht freut sich der Hund darüber. Das Rad zuckt kurz, wird aber noch von der Bremse gehalten.'); game.sounds.push('pickup');
}

/** Öffnet das Wehr erst nach dem Entfernen des Astes. @param {object} game Spiel. */
export function villageSluice(game) {
  if (!game.flags.branchCleared) return game.say('Wehrhebel','Die Bremse hält das Rad fest. Zwischen den Speichen sitzt noch etwas; unter Last lässt sich hier nichts bewegen.');
  if (game.flags.waterFlowing) return game.say('Wehrhebel','Die Bremse ist gelöst. Das Rad der Mühle dreht sich wieder.');
  game.flags.waterFlowing = true;
  game.say('Hausmeister','Na also! Das Rad läuft wieder. Komm mit, ich mache dir die Gilde auf.');
  game.roomState.keeper = {index:0,elapsed:0.3}; game.sounds.push('gear','success-waterwheel');
}

/** Führt den Hausmeister sichtbar zur Gilde und wartet bei blockiertem Weg. @param {object} game Spiel. @param {number} dt Zeitschritt. @param {boolean} reduced Reduzierte Bewegung. */
export function updateVillage(game,dt,reduced) {
  settleSleepingDog(game);
  if (game.room.id === 'village' || game.room.villageLandscape || game.room.furnished) updateWanderers(game,dt,reduced);
  if (game.room.id==='village' && !animalsRest(game)) updateFetch(game,dt,reduced);
  if (game.room.id==='village-inn') updateTavern(game,dt,reduced);
  const actor = game.roomState.keeper;
  if (game.room.id !== 'village' || !actor || game.flags.guildOpen) return;
  actor.elapsed += dt;
  if (actor.elapsed < 0.3) return;
  if (actor.index === KEEPER_PATH.length-1) {
    game.flags.guildOpen = true; game.sounds.push('door','success-quest');
    return game.say('Hausmeister','Ist offen! Schau dich in der Gilde um. Oben liegen noch alte Reiseunterlagen.');
  }
  const [x,y] = KEEPER_PATH[actor.index+1];
  actor.waiting = (game.player.x === x && game.player.y === y) || (game.move?.x === x && game.move?.y === y);
  if (actor.waiting) return;
  actor.index++; actor.elapsed = reduced ? 0.3 : 0;
}

/** Gibt kurze, fortschrittsabhängige Hinweise. @param {object} game Spiel. */
export function villageKeeper(game) {
  if (game.flags.guildOpen) return game.say('Hausmeister','Die Tür ist offen. Komm rein.');
  if (game.flags.waterFlowing) return game.say('Hausmeister','Zur Gilde geht es hier entlang. Einen Moment noch.');
  game.say('Hausmeister','Du kommst wegen des Aushangs? Ausgerechnet heute klemmt auch noch die Gildentür. Und vom Wasserrad kommt dieses Klappern. Irgendetwas hängt zwischen den Speichen; seitdem steht das ganze Werk still.');
}

/** Öffnet den Gildeneingang ausschließlich nach der Aufgabe. @param {object} game Spiel. */
export function villageDoor(game) {
  if (respectNightRest(game,{name:'Gildentür',action:'village-door'})) return;
  if (!game.flags.guildOpen) return game.say('Gildentür','Sie klemmt. Am Türpfosten hängt ein Zettel vom Hausmeister. Vielleicht ist er noch in der Nähe.');
  game.travel('village-guild');
}
