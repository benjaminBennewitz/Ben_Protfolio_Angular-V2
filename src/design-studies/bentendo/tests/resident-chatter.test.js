import test from 'node:test';
import assert from 'node:assert/strict';
import { createVillage,createGuildEntrance } from '../scripts/game/data/village.js';
import { createVillageInteriors } from '../scripts/game/data/house-rooms.js';
import { Game } from '../scripts/game/game.js';
import { updateResidentChatter,chooseResidentLine } from '../scripts/game/systems/resident-chatter.js';
import { residentLines } from '../scripts/game/data/resident-lines.js';
import { currentOverlay } from '../scripts/game/render/overlays.js';
import { ACTIONS } from '../scripts/game/systems/actions.js';
import { clearTreeBackground } from '../scripts/display/tree-assets.js';

/** Erstellt das Dorf und seine eingerichteten Häuser. */
function chatterGame() {
  const rooms=[createVillage(),createGuildEntrance(),...createVillageInteriors()],map=new Map();
  for (const room of rooms) map.set(room.id,room);
  const game=new Game(map); game.mode='world'; return game;
}
/** Liefert einen reproduzierbaren Zufallswert. */
function zero() { return 0; }
/** Erkennt den Schankwirt. @param {object} object Bewohner. */
function isInnkeeper(object) { return object.id==='innkeeper'; }

/** Prüft zufällige Nähe-Sprüche ohne Dialogpause und sofortige Wiederholung. */
function ambientLife() {
  const game=chatterGame(); game.travel('village-inn'); game.locationNotice=null;
  game.player.x=9; game.player.y=5; game.chatterWait=0;
  updateResidentChatter(game,0.1,zero); assert.equal(game.ambientSpeech.speaker,'Wirt');
  assert.equal(game.message,null); const first=game.ambientSpeech.text;
  assert.equal(game.step('down'),true); game.move=null;
  updateResidentChatter(game,20,zero); assert.equal(game.ambientSpeech,null);
  game.chatterWait=0; updateResidentChatter(game,0.1,zero); assert.notEqual(game.ambientSpeech.text,first);
  assert.ok(game.chatterWait>=12); assert.ok(game.chatterWait<=22);
}

/** Prüft Pausen, Distanz, Ortswechsel und Vorrang neuer Dialoge. */
function speechLifecycle() {
  const game=chatterGame(); game.travel('village-inn'); game.locationNotice=null; game.chatterWait=0;
  game.player.x=1; game.player.y=9; updateResidentChatter(game,1,zero); assert.equal(game.ambientSpeech,null);
  game.player.x=9; game.player.y=5; game.chatterWait=0; updateResidentChatter(game,1,zero);
  const remaining=game.ambientSpeech.remaining;
  for (const menu of ['bagOpen','mapOpen','journalOpen']) {
    game[menu]=true; updateResidentChatter(game,9,zero); assert.equal(game.ambientSpeech.remaining,remaining); game[menu]=false;
  }
  game.say('Wirt','Ein neuer Dialog.'); assert.equal(game.ambientSpeech,null); assert.equal(game.locationNotice,null);
  game.travel('village'); assert.equal(game.message,null); assert.deepEqual(game.pages,[]); assert.equal(game.ambientSpeech,null);
  assert.equal(game.locationNotice.title,'Bruchstein');
  game.travel('village-inn'); game.travel('village'); assert.equal(game.locationNotice.title,'Bruchstein');
  game.reset(); assert.equal(game.residentHistory.size,0);
}

/** Prüft Einführung, Gesprächsvariation und verschwundene Hinweise nach dem Fund. */
function conversationsAndHints() {
  const game=chatterGame(); game.travel('village-inn'); const innkeeper=game.objects.find(isInnkeeper);
  ACTIONS.talk(game,innkeeper); assert.match(game.message.lines.join(' '),/Such dir einen Platz/u);
  ACTIONS.talk(game,innkeeper); assert.notEqual(game.message.lines.join(' '),innkeeper.text);
  assert.ok(residentLines(game,innkeeper).some(mentionsNote));
  game.roomState.taken.add('table-a'); assert.equal(residentLines(game,innkeeper).some(mentionsNote),false);
  const first=chooseResidentLine(game,innkeeper,zero),second=chooseResidentLine(game,innkeeper,zero); assert.notEqual(first,second);
  assert.equal(typeof chooseResidentLine(game,{id:'visitor'},zero),'string'); assert.equal(typeof chooseResidentLine(game,{id:'visitor'},zero),'string');
  for (const room of game.rooms.values()) for (const object of room.objects) {
    if (!['resident','npc','host'].includes(object.kind)) continue;
    for (const line of residentLines(game,object)) assert.ok(line.length<=96);
  }
}
/** Erkennt den Hinweis auf die Tischnotiz. @param {string} line Spruch. */
function mentionsNote(line) { return line.includes('Gästetisch'); }

/** Prüft eine einzige sichtbare Box auch beim schnellen Wechsel und vorhandenen Aktionshinweis. */
function overlayPriority() {
  const game=chatterGame(); game.player.x=4; game.player.y=13; game.player.facing='up';
  assert.ok(game.hint); assert.equal(currentOverlay(game),'location');
  game.travel('village-inn'); game.travel('village'); assert.equal(currentOverlay(game),'location');
  game.say('Neue Nachricht','Nur diese Nachricht.'); assert.equal(currentOverlay(game),'dialog');
  game.message=null; assert.equal(currentOverlay(game),'hud');
  game.ambientSpeech={text:'Hallo',speaker:'Wirt',remaining:5}; assert.equal(currentOverlay(game),'hud');
  game.bagOpen=true; assert.equal(currentOverlay(game),'bag');
}

/** Prüft transparente Außenränder bei erhaltenen eingeschlossenen hellen Baumpixeln. */
function treeTransparency() {
  const pixels={width:7,height:7,data:new Uint8ClampedArray(7*7*4)};
  for (let i=0;i<pixels.data.length;i+=4) pixels.data.set([200,200,184,255],i);
  for (let y=1;y<6;y++) for (let x=1;x<6;x++) if (x===1 || y===1 || x===5 || y===5) pixels.data.set([40,88,72,255],(y*7+x)*4);
  clearTreeBackground(pixels);
  assert.equal(pixels.data[3],0); assert.equal(pixels.data[(6*7+6)*4+3],0);
  assert.equal(pixels.data[(3*7+3)*4+3],255); assert.equal(pixels.data[(1*7+1)*4+3],255);
}

test('Bewohner: Wirt spricht gelegentlich in der Nähe, ohne Bewegung zu blockieren',ambientLife);
test('Bewohner: Menüs pausieren Sprüche, Raumwechsel und Dialoge verwerfen alte Meldungen',speechLifecycle);
test('Bewohner: wechselnde Antworten und Hinweise auf noch offene echte Fundstellen',conversationsAndHints);
test('Anzeige: Ortsmeldung und Aktionshinweis überlagern sich nicht',overlayPriority);
test('Baum: Außenhintergrund transparent, eingeschlossene Glanzpixel erhalten',treeTransparency);
