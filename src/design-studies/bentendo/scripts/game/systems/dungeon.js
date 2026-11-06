import { wall } from './collision.js';
import { enemy,DUNGEON_MESSAGE } from '../data/quell-dungeon.js';
import { chest,rememberNote } from './loot.js';

/** Filtert noch verdeckte Elemente, ohne globale Objektdefinitionen zu verändern. @param {object} game Spiel. @param {object[]} objects Raumobjekte. */
export function dungeonObjects(game,objects) {
  return objects.filter(visible.bind(null,game));
}

/** Prüft genau die am Objekt angegebenen Freigaben. @param {object} game Spiel. @param {object} object Objekt. */
function visible(game,object) { return (!object.revealedBy || game.flags[object.revealedBy]) && (!object.hiddenBy || !game.flags[object.hiddenBy]); }

/** Setzt nur flüchtige Kampfzustände beim Raumwechsel zurück; Beute bleibt dauerhaft gespeichert. @param {object} game Spiel. */
export function enterDungeonRoom(game) {
  const cleared=(game.room.boss && game.flags.quellNestCleared) || (game.room.id==='root-headwater' && (game.flags.rootSpringFlowing || game.flags.rootGuardsCleared));
  game.enemies=cleared?[]:structuredClone(game.room.enemies || []); game.heartDrops=[]; game.nestWave=0; game.waveWait=0;
  if (game.room.id==='root-headwater' && !cleared) game.nestWave=1;
  game.attackTime=0; game.attackCooldown=0;
}

/** Öffnet die versenkte Treppe nach der nachvollziehbaren Wartungsreihenfolge. @param {object} game Spiel. @param {object} object Armatur. */
export function sourceMechanism(game,object) {
  if (!game.flags.maraSpringReported) return game.say(object.name,'Melde Mara zuerst die frischen Spuren am Fluttor. Ohne ihren Quellplan solltest du die Anlage nicht verstellen.');
  if (game.flags.sourceDrained) return game.say(object.name,'Das Becken ist abgelassen. Die freigelegte Treppe führt in das untere Quellgewölbe.');
  const stage=game.flags.sourceStage || 0,step={'source-inlet':0,'source-outlet':1,'source-winch':2}[object.id];
  if (step>stage) return game.say(object.name,stage===0?'Die Mechanik steht unter Druck. Es strömt noch Wasser in das Becken.':'Der Zulauf ist zu, doch der Pegel ist noch zu hoch. Die Kette steht unter Last.');
  if (step<stage) return game.say(object.name,'Diese Armatur steht bereits richtig.');
  game.flags.sourceStage=stage+1; game.sounds.push('gear');
  if (step===2) {
    game.flags.sourceDrained=true; rememberNote(game,{id:'quell-entry-note',title:'Unter dem Wasser',text:'Die Staukammer ist abgelassen. Die Treppe im Becken führt zum Quellgewölbe. Käfer und Spinnen nisten dort. A schlägt, B öffnet den Rucksack. Sichere neue Beute durch einen lebenden Rückweg ins Dorf.'});
    return game.say('Das Wasser sinkt','Die Handwinde löst sich. Das Wasser läuft ab und legt eine Treppe im Becken frei. Darunter liegt das Quellgewölbe.','success-waterwheel');
  }
  game.say(object.name,step===0?'Der Zulauf ist geschlossen. Der Pegel im Becken bleibt vorerst unverändert.':'Der Ablauf ist offen. Das Wasser sinkt, und die Kette der Handwinde entspannt sich.');
}

/** Hält den Rückweg während des bewusst gestarteten Nestkampfes geschlossen. @param {object} game Spiel. @param {object} object Durchgang. */
export function dungeonDoor(game,object) {
  if (game.room.boss && game.nestWave && !game.flags.quellNestCleared) return game.say('Spinnenbrut','Die Spinnen versperren den Rückweg. Besiege die drei Wellen.');
  if (game.room.id==='root-headwater' && !game.flags.rootGuardsCleared && !game.flags.rootSpringFlowing) return game.say('Quellwache','Die Wachen versperren den Rückweg.');
  game.travel(object.to,object.spawn);
}

/** Beginnt die drei Wellen mit ausreichend Abstand zur Spielfigur. @param {object} game Spiel. */
export function startNest(game) {
  if (game.nestWave || game.flags.quellNestCleared) return;
  if (game.enemies.length) return game.say('Spinnennest','Besiege zuerst die Nestwachen. Danach kannst du das große Gespinst öffnen.');
  game.nestWave=1; spawnWave(game);
  game.say('Spinnenbrut','Das Gespinst reißt auf. Drei Wellen kommen aus den Mauerritzen. A schlägt in Blickrichtung; bleib in Bewegung!','gear');
}

/** Verteilt jede Welle auf feste freie Randfelder, fern von der Spielfigur. @param {object} game Spiel. */
function spawnWave(game) {
  const points=[[12,3],[3,3],[12,10],[8,2],[3,8],[11,7],[6,3],[6,10],[12,6],[3,6]],count=game.nestWave+1;
  let spawned=0;
  for (const point of points) {
    const distance=Math.abs(point[0]-game.player.x)+Math.abs(point[1]-game.player.y);
    if (distance<3 || wall(game,point[0],point[1]) || game.objectAt(point[0],point[1])) continue;
    game.enemies.push(enemy(`wave-${game.nestWave}-${spawned}`,'spider',point[0],point[1]));
    if (++spawned===count) break;
  }
}

/** Prüft Druckplatte und Wellenfortschritt ausschließlich während aktiver Spielzeit. @param {object} game Spiel. @param {number} dt Zeitschritt. */
export function updateDungeon(game,dt) {
  if (!game.room.dungeon) return;
  if (game.room.id==='root-headwater') return updateRootWaves(game,dt);
  if (game.room.id==='quell-sluice' && !game.flags.quellGateOpen) {
    for (const block of game.roomState.blocks) if (block.x===6 && block.y===5) { game.flags.quellGateOpen=true; game.sounds.push('success-small'); }
  }
  if (!game.room.boss || !game.nestWave || game.flags.quellNestCleared || game.enemies.length) return;
  game.waveWait+=dt;
  if (game.waveWait<1.5) return;
  game.waveWait=0;
  if (game.nestWave<3) { game.nestWave++; spawnWave(game); game.sounds.push('gear'); return; }
  game.flags.quellNestCleared=true;
  game.say('Das Nest ist still','Die letzte Spinne fällt. Das Gespinst gibt eine Waffentruhe und eine alte Wartungstreppe frei.','success-quest');
}

/** Vergibt die Schwertbeute nur bei freiem Fach und ergänzt den nächsten Storyhinweis. @param {object} game Spiel. @param {object} object Truhe. */
export function dungeonReward(game,object) {
  const taken=game.roomState.taken.has(object.id); chest(game,object);
  if (!taken && game.roomState.taken.has(object.id)) {
    rememberNote(game,DUNGEON_MESSAGE); game.flags.maraLowerMessage=true;
    game.say('Waffentruhe','Ein rostiges Schwert und acht Münzen! Darunter liegt eine frische Nachricht mit Maras Zeichen. Sie liegt jetzt im Journal. Sichere deine Beute über die Wartungstreppe und zeige Mara den Fund.','success-quest');
  }
}

/** Gibt die Fassung erst nach dem Wachkampf und der Bestätigung frei. @param {object} game Spiel. */
export function inspectRootValve(game) {
  if (game.flags.rootSpringFlowing) { claimSpringHeart(game); return game.say('Quellherz','Der Stein sitzt wieder in seiner Führung. Das Wasser rauscht durch den Überlauf.'); }
  if (!game.flags.rootGuardsCleared || game.enemies.length) return game.say('Quellherz','Ein Speer schrammt über den Stein. Solange hier Wachen stehen, kannst du die Wurzeln nicht lösen.');
  game.say('Quellherz','Unter der Wurzel zittert ein flacher Stein. Die Wurzel kappen und den Stein lösen? A: Ja · B: Zurück');
  (game.pages.at(-1) || game.message).onConfirm=releaseRootSpring;
}

/** Öffnet dauerhaft den Überlauf und hinterlegt den Hinweis auf den östlichen Wasserlauf. @param {object} game Spiel. */
function releaseRootSpring(game) {
  if (game.flags.rootSpringFlowing) return;
  game.flags.rootSpringFlowing=true;
  claimSpringHeart(game);
  rememberNote(game,{id:'root-headwater',title:'Der Lauf unter den Wurzeln',text:'Im Quellherz fließt wieder Wasser. Der alte Überlauf mündet in der Bachniederung. Auf der Fassung ist ein See östlich der Niederung eingeritzt.'});
  game.say('Wurzelgrund · Quelle befreit','Die Wurzel reißt. Wasser hebt den Stein aus seiner Kerbe und spült den Überlauf frei. Eine leuchtende Quellscherbe sinkt in deine Hand. Du erhältst dauerhaft ein zusätzliches Herz. Durch den Gang riechst du die feuchte Luft der Bachniederung.','success-quest');
}

/** Führt drei gemischte Wachenwellen mit einer kurzen Atempause fort. @param {object} game Spiel. @param {number} dt Zeitschritt. */
function updateRootWaves(game,dt) {
  if (game.flags.rootSpringFlowing || game.flags.rootGuardsCleared || game.enemies.length) return;
  game.nestWave=Math.max(1,game.nestWave);
  game.waveWait+=dt;
  if (game.waveWait<1.2) return;
  game.waveWait=0;
  if (game.nestWave===3) {
    game.flags.rootGuardsCleared=true;
    return game.say('Quellherz','Die letzte Wache fällt. Jetzt hörst du das Pochen hinter dem Quellstein.','success-quest');
  }
  const candidates=game.room.rootWaves[game.nestWave-1];
  /** Freie Startfelder halten Abstand zur aktuellen Spielerposition. */
  const points=[[6,3],[14,4],[13,7],[6,8],[12,6],[9,3],[14,8],[5,5]];
  const free=points.filter(([x,y])=>Math.abs(x-game.player.x)+Math.abs(y-game.player.y)>=3 && !wall(game,x,y) && !game.objectAt(x,y));
  game.enemies=structuredClone(candidates);
  for (let i=0;i<game.enemies.length;i++) {
    game.enemies[i].x=free[i][0]; game.enemies[i].y=free[i][1];
  }
  game.nestWave++;
  game.say('Quellwache',`Welle ${game.nestWave} von 3. Zwischen den Wurzeln drängen weitere Wachen hervor.`,'gear');
}

/** Bindet den dauerhaften Herzgewinn an die einmalig geborgene Quellscherbe. @param {object} game Spiel. */
function claimSpringHeart(game) {
  if (game.flags.rootHeartTaken) return;
  game.flags.rootHeartTaken=true;
  game.health.maxHp=8; game.health.hp=8;
  rememberNote(game,{id:'root-heart',title:'Quellscherbe',text:'Ein heller Splitter aus der befreiten Quellfassung. Er pulsiert wie ein Herz. Seit du ihn berührt hast, besitzt du dauerhaft vier Herzen. Der Fund bleibt bei dir, auch wenn du im Dungeon fällst.'});
}
