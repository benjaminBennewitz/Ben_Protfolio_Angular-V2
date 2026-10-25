import { animalsRest } from './daily-life.js';
import { createActor } from './wanderers.js';
import { fetchCellFree,fetchPath,throwTarget } from './fetch-path.js';
import { createResidentSpeech } from './resident-chatter.js';

/** Kennzeichnet die kontextabhängige Hundeaktion, ohne zusätzliche Menütasten. @param {object} game Spiel. */
export function dogHint(game) {
  if (game.roomState.fetch && game.roomState.fetch.phase!=='follow') return 'Apportieren ansehen';
  return game.inventory.includes('Ast')?'Ast werfen':'ansprechen';
}

/** Startet ein wiederholbares Apportierspiel; der Ast bleibt als reservierter Besitz im Rucksack. @param {object} game Spiel. @param {object} dog Angesprochener Hund. */
export function tryFetch(game,dog) {
  if (game.room.id!=='village' || dog.id!=='dog' || !game.inventory.includes('Ast')) return false;
  if (dog.sleeping || animalsRest(game)) { game.say('Hund','Er schläft vor dem Haus. Der Ast kann bis morgen warten.'); return true; }
  if (game.roomState.fetch && game.roomState.fetch.phase!=='follow') { game.say('Hund','Er ist noch mit dem Ast beschäftigt. Gleich ist er wieder da.','animal-dog'); return true; }
  if (dog.walking) { game.say('Hund','Er dreht sich zu dir. Versuch es gleich noch einmal.','animal-dog'); return true; }
  const goal=throwTarget(game,dog);
  if (!goal) { game.say('Hund','Hier ist zu wenig Platz zum Werfen. Versuch es von einer freien Seite.','animal-dog'); return true; }
  game.roomState.wanderers ||= {};
  game.roomState.wanderers.dog ||= createActor(dog);
  game.roomState.fetch={dogId:dog.id,phase:'throw',elapsed:0,wait:0,goal,origin:[game.player.x,game.player.y]};
  game.ambientSpeech=null; game.pendingReaction=null; game.sounds.push('throw','animal-dog'); return true;
}

/** Bewegt den Hund zum Ast, zum aktuellen Spieler und anschließend auf seinen normalen Weg zurück. @param {object} game Spiel. @param {number} dt Aktive Zeit. @param {boolean} reduced Reduzierte Bewegung. */
export function updateFetch(game,dt,reduced) {
  const fetch=game.roomState.fetch,actor=game.roomState.wanderers?.dog;
  if (!fetch || !actor) return;
  if (fetch.phase==='follow' && (fetch.followRemaining-=dt)<=0) fetch.phase='home';
  if (actor.moving) {
    actor.elapsed+=dt;
    if (reduced || actor.elapsed>=actor.duration) { actor.moving=false; actor.fromX=actor.x; actor.fromY=actor.y; }
    return;
  }
  fetch.wait=Math.max(0,fetch.wait-dt); if (fetch.wait>0) return;
  if (fetch.phase==='throw' || fetch.phase==='pickup') { advanceFetchPhase(game,fetch,dt); return; }
  if (fetch.phase==='follow' && Math.abs(actor.x-game.player.x)+Math.abs(actor.y-game.player.y)<=2) return;
  const playerGoal=['return','follow'].includes(fetch.phase);
  const goal=fetch.phase==='outbound'?fetch.goal:playerGoal?[game.player.x,game.player.y]:homePoint(game);
  const path=fetchPath(game,actor,goal,playerGoal);
  if (!path) { fetch.wait=0.4; return; }
  if (!path.length) { arriveFetch(game,fetch); return; }
  startFetchStep(actor,path[0]);
}

/** Zeigt den Wurf und eine kurze Aufnahmepause, bevor der Hund zurückläuft. @param {object} game Spiel. @param {object} fetch Spielzustand. @param {number} dt Zeitschritt. */
function advanceFetchPhase(game,fetch,dt) {
  fetch.elapsed+=dt;
  if (fetch.elapsed<(fetch.phase==='throw'?0.45:0.3)) return;
  fetch.phase=fetch.phase==='throw'?'outbound':'return'; fetch.elapsed=0;
}

/** Beginnt einen einzelnen durch den Wegplaner freigegebenen Hundeschritt. @param {object} actor Hundezustand. @param {number[]} point Ziel. */
function startFetchStep(actor,point) {
  actor.fromX=actor.x; actor.fromY=actor.y;
  if (point[0]!==actor.x) actor.facing=point[0]<actor.x?'left':'right';
  actor.x=point[0]; actor.y=point[1]; actor.elapsed=0; actor.moving=true;
}

/** Bestätigt den Fund und die Rückgabe genau einmal pro Wurf. @param {object} game Spiel. @param {object} fetch Spielzustand. */
function arriveFetch(game,fetch) {
  if (fetch.phase==='outbound') { fetch.phase='pickup'; fetch.elapsed=0; return; }
  if (fetch.phase==='home') { settleFetch(game); return; }
  if (game.move) return;
  game.flags.fetchCount=(game.flags.fetchCount || 0)+1; game.sounds.push('animal-dog','success-small');
  game.ambientSpeech=createResidentSpeech({id:'dog',name:'Hund'},'Wuff! Der Ast ist wieder bei dir.');
  fetch.phase='follow'; fetch.followRemaining=45;
}

/** Liefert den sicheren Ausgangspunkt des normalen Hundepfads. @param {object} game Spiel. */
function homePoint(game) {
  for (const object of game.room.objects) if (object.id==='dog') return object.route[0];
  return [25,24];
}

/** Beendet Würfe verlustfrei oder lässt den Begleiter vor einem Haus warten. @param {object} game Spiel. @param {boolean} waitOutside Begleitung draußen pausieren. */
export function settleFetch(game,waitOutside=false) {
  if (!game.roomState?.fetch) return;
  const actor=game.roomState.wanderers.dog;
  if (waitOutside && game.roomState.fetch.phase==='follow') {
    Object.assign(actor,{moving:false,fromX:actor.x,fromY:actor.y}); return;
  }
  const [x,y]=homePoint(game);
  Object.assign(actor,{x,y,fromX:x,fromY:y,index:0,elapsed:0,moving:false,wait:3});
  game.roomState.fetch=null;
}

/** Markiert den Ast während Wurf und Rückbringen als ausgeliehen, ohne einen Inventarplatz freizugeben. @param {object} game Spiel. */
export function stickBorrowed(game) {
  const fetch=game.states.get('village')?.fetch;
  return Boolean(fetch && ['throw','outbound','pickup','return'].includes(fetch.phase));
}

/** Lässt den Begleiter ausweichen; in einer Sackgasse tauschen beide koordiniert die Felder. @param {object} game Spiel. @param {number} x Gewünschtes Spielerfeld. @param {number} y Gewünschtes Spielerfeld. */
export function yieldCompanion(game,x,y) {
  const fetch=game.roomState.fetch,actor=game.roomState.wanderers?.dog;
  if (!['follow','home'].includes(fetch?.phase) || !actor || actor.moving || actor.x!==x || actor.y!==y) return false;
  fetch.wait=0.7;
  for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
    if (!fetchCellFree(game,x+dx,y+dy)) continue;
    startFetchStep(actor,[x+dx,y+dy]); return false;
  }
  startFetchStep(actor,[game.player.x,game.player.y]); return true;
}
