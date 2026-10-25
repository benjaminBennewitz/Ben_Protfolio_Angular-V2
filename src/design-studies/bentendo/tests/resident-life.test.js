import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../scripts/game/game.js';
import { createVillage,createGuildEntrance } from '../scripts/game/data/village.js';
import { createVillageInteriors } from '../scripts/game/data/house-rooms.js';
import { contains,wall } from '../scripts/game/systems/collision.js';
import { isResident,residentSeesPlayer } from '../scripts/game/systems/resident-visibility.js';
import { updateResidentReactions } from '../scripts/game/systems/resident-reactions.js';
import { createResidentSpeech } from '../scripts/game/systems/resident-chatter.js';
import { residentLines } from '../scripts/game/data/resident-lines.js';
import { npcIdle } from '../scripts/game/render/village-life.js';
import { dismiss } from './helpers.js';

/** Liefert reproduzierbare Reaktionsauswahl. */
function zero() { return 0; }
/** Erstellt ein Dorf mit allen realen Innenräumen. */
function villageGame() {
  const map=new Map();
  for (const room of [createVillage(),createGuildEntrance(),...createVillageInteriors()]) map.set(room.id,room);
  const game=new Game(map); game.mode='world'; return game;
}
/** Erstellt einen kleinen real begehbaren Raum für Sicht- und Interaktionsprüfungen. */
function reactionGame() {
  const room={id:'city',width:10,height:10,spawn:[4,5],title:'Prüfraum',furnished:true,objects:[],layout:[]};
  for (let y=0;y<10;y++) room.layout.push(y===0 || y===9?'##########':'#........#');
  room.objects.push({id:'innkeeper',name:'Wirt',kind:'resident',action:'talk',x:4,y:2,facing:'down',text:'Guten Abend.'});
  room.objects.push({id:'cabinet',name:'Schrank',kind:'interior-prop',action:'inspect',art:'cupboard',x:5,y:5,text:'Geschirr und Leinen.'});
  const game=new Game(new Map([['city',room]])); game.mode='world'; game.locationNotice=null; game.chatterWait=100;
  return game;
}

/** Prüft Sichtkegel und Abschattung durch Wände/hohe Schränke, aber nicht niedrige Tische. */
function visibility() {
  const game=reactionGame(),person=game.objects[0];
  assert.equal(residentSeesPlayer(game,person),true);
  assert.equal(residentSeesPlayer(game,{...person,facing:'up'}),false);
  game.room.objects.push({id:'blocker',kind:'interior-prop',art:'cupboard',x:4,y:4});
  assert.equal(residentSeesPlayer(game,person),false);
  game.room.objects[2].art='table'; assert.equal(residentSeesPlayer(game,person),true);
  game.room.layout[4]='#...#....#'; assert.equal(residentSeesPlayer(game,person),false);
  game.player={x:8,y:2}; assert.equal(residentSeesPlayer(game,person),false);
}

/** Spielt Schrankuntersuchung, Funddialog und anschließende beobachtete Reaktion durch. */
function observedSearch() {
  const game=reactionGame(); game.player.facing='right'; game.interact();
  assert.equal(game.message.speaker,'Schrank'); assert.equal(game.ambientSpeech,null); assert.equal(game.pendingReaction.speakerId,'innkeeper');
  game.update(20,false); assert.equal(game.ambientSpeech,null); dismiss(game); game.update(0.1,false);
  assert.equal(game.ambientSpeech.speakerId,'innkeeper'); assert.equal(game.pendingReaction,null); assert.ok(game.reactionWait>0);
  game.interact(); assert.equal(game.ambientSpeech,null); assert.equal(game.pendingReaction,null);
  dismiss(game); game.update(0.1,false); assert.equal(game.ambientSpeech,null);
  game.room.objects[0].facing='up'; game.reactionWait=0; game.interact(); assert.equal(game.pendingReaction,null);
}

/** Prüft Vorrang von Gesprächen selbst dann, wenn eine andere Person schon eine Blase zeigt. */
function conversationPriority() {
  const game=reactionGame(); game.ambientSpeech=createResidentSpeech({id:'someone',name:'Nachbar'},'Hallo!');
  game.pendingReaction={speakerId:'innkeeper',text:'Ein alter Kommentar.'};
  game.player={x:3,y:2,facing:'right'}; game.interact();
  assert.equal(game.message.speaker,'Wirt'); assert.equal(game.ambientSpeech,null); assert.equal(game.pendingReaction,null);
  dismiss(game); game.update(0.1,false); assert.equal(game.ambientSpeech,null);
}

/** Bemerkt Herumstehen nur bei freier Sicht und hält eine Pause zwischen Reaktionen. */
function idleReactions() {
  const game=reactionGame(); updateResidentReactions(game,13,zero); assert.equal(game.ambientSpeech,null);
  updateResidentReactions(game,1.1,zero); assert.equal(game.ambientSpeech.speakerId,'innkeeper');
  game.ambientSpeech=null; updateResidentReactions(game,1,zero); assert.equal(game.ambientSpeech,null);
  game.reactionWait=0; game.idleTime=14; game.room.objects[0].facing='up';
  updateResidentReactions(game,1,zero); assert.equal(game.ambientSpeech,null);
  game.room.objects[0].facing='down'; game.bagOpen=true; const idle=game.idleTime;
  updateResidentReactions(game,10,zero); assert.equal(game.idleTime,idle); assert.equal(game.ambientSpeech,null);
}

/** Prüft freie, kurze und geschlossene Laufwege in sämtlichen sieben Dorfhäusern. */
function authoredPatrols() {
  const game=villageGame(); let count=0;
  for (const room of game.rooms.values()) for (const person of room.objects) {
    if (!room.furnished || !person.route) continue;
    count++; game.travel(room.id); assert.ok(isResident(person));
    for (let i=0;i<person.route.length;i++) {
      const [x,y]=person.route[i],[nextX,nextY]=person.route[(i+1)%person.route.length];
      assert.equal(wall(game,x,y),false); assert.equal(Math.abs(x-nextX)+Math.abs(y-nextY),1);
      for (const other of room.objects) if (other.id!==person.id) assert.equal(contains(other,x,y),false,`${room.id}: ${person.id}/${other.id}`);
    }
    assert.ok(residentLines(game,person).length>=2);
  }
  assert.equal(count,8);
}

/** Prüft Bewegungsinterpolation, Pausen beim Ansprechen und reservierte Ausgangsfelder. */
function walkingResidents() {
  const game=villageGame(); game.travel('village-inn'); game.locationNotice=null;
  for (let i=0;i<60 && !game.roomState.wanderers?.innkeeper?.moving;i++) game.update(0.1,false);
  const actor=game.roomState.wanderers.innkeeper; assert.equal(actor.moving,true);
  assert.equal(game.occupied(actor.fromX,actor.fromY),true); assert.equal(game.occupied(actor.x,actor.y),true);
  game.update(0.1,false); const person=game.objects.find(isResident); assert.notEqual(person.drawY,person.y);
  game.say('Wirt','Einen Moment.'); const elapsed=actor.elapsed; game.update(2,false); assert.equal(actor.elapsed,elapsed);
  dismiss(game); game.update(0.5,false); const x=actor.x,y=actor.y;
  game.player={x:x+1,y,facing:'left'};
  for (let i=0;i<20;i++) game.update(0.5,false);
  assert.equal(actor.x,x); assert.equal(actor.y,y);
  const position=[actor.x,actor.y]; game.player={x:6,y:12}; game.update(5,true); assert.deepEqual([actor.x,actor.y],position);
}

/** Prüft native Richtungsframes statt rückwärts laufender Bewohner. */
function humanDirections() {
  const object={x:1,y:1,route:[[1,1],[2,1]],walking:true},game={time:0.2,reduced:false};
  assert.equal(npcIdle(game,{...object,facing:'right'}).flip,true);
  assert.equal(npcIdle(game,{...object,facing:'left'}).flip,false);
  assert.ok(npcIdle(game,{...object,facing:'up'}).offsetX>=48);
  assert.ok(npcIdle(game,{...object,facing:'down'}).offsetX<48);
}

test('Bewohnerreaktionen: Blickrichtung, Wände und Schränke bestimmen freie Sicht',visibility);
test('Bewohnerreaktionen: Schrankkommentar folgt dem Funddialog und hat Abklingzeit',observedSearch);
test('Bewohnerreaktionen: direktes Gespräch verwirft alle Sprechblasen und wartenden Kommentare',conversationPriority);
test('Bewohnerreaktionen: Herumstehen nur bei Sichtkontakt, mit Pausen und Menü-Stopp',idleReactions);
test('Bewohnerwege: sieben freie geschlossene Wege ohne Möbelkollisionen',authoredPatrols);
test('Bewohnerwege: Interpolation, Reservierung, Gesprächsstopp und reduzierte Bewegung',walkingResidents);
test('Bewohnerwege: Blickrichtung und native Gehframes passen zusammen',humanDirections);
