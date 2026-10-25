import test from 'node:test';
import assert from 'node:assert/strict';
import { bubblePosition,speechScroll } from '../scripts/game/render/speech-bubble.js';
import { createResidentSpeech } from '../scripts/game/systems/resident-chatter.js';
import { residentLines } from '../scripts/game/data/resident-lines.js';

/** Prüft Blasenpositionen an allen Bildrändern sowie den Versatz bei Kamerabewegung. */
function bubbleBounds() {
  for (const x of [0,4,9]) for (const y of [0,2,7]) {
    const box=bubblePosition({x,y},{x:0,y:0},112);
    assert.ok(box); assert.ok(box.x>=2); assert.ok(box.x+box.width<=158);
    assert.ok(box.y>=2); assert.ok(box.y+box.height<126);
    assert.ok(box.tailX>=box.x); assert.ok(box.tailX<box.x+box.width);
  }
  assert.equal(bubblePosition({x:0,y:0},{x:0,y:0},112).below,true);
  assert.equal(bubblePosition({x:4,y:4},{x:0,y:0},112).below,false);
  const fixed=bubblePosition({x:4,y:4},{x:0,y:0},64),moved=bubblePosition({x:4,y:4},{x:8,y:8},64);
  assert.equal(moved.x,fixed.x-8); assert.equal(moved.y,fixed.y-8);
  assert.equal(bubblePosition({x:30,y:30},{x:0,y:0},112),null);
}

/** Prüft Start-/End-Lesepausen, langsamen Zeilenvorschub und reduzierte Bewegung. */
function teleprompterTiming() {
  const speech=createResidentSpeech({id:'innkeeper',name:'Wirt'},'Frau Moos hat einen Zettel auf dem Gästetisch liegen lassen. Vielleicht schaust du einmal nach.');
  assert.equal(speech.speakerId,'innkeeper'); assert.ok(speech.lines.length>2); assert.ok(speech.duration>5);
  assert.equal(speechScroll(speech,false),0); speech.remaining=speech.duration-1.9; assert.equal(speechScroll(speech,false),0);
  speech.remaining=speech.duration-3.2; assert.ok(Math.abs(speechScroll(speech,false)-0.5)<0.001);
  assert.equal(speechScroll(speech,true),0);
  speech.remaining=1; assert.equal(speechScroll(speech,false),speech.lines.length-2);
  const short=createResidentSpeech({id:'reader',name:'Leserin'},'Ein schöner Tag.');
  assert.equal(short.duration,5); short.remaining=1; assert.equal(speechScroll(short,false),0);
}

/** Prüft vollständigen Textinhalt und ausreichende Lesezeit der vorhandenen Sprüche. */
function completeText() {
  const game={states:new Map()},ids=['innkeeper','host','fisher','weaver','carpenter','reader','miller','grandmother','keeper'];
  for (const id of ids) for (const text of residentLines(game,{id})) {
    const speech=createResidentSpeech({id,name:id},text);
    assert.equal(speech.lines.join(' '),text); assert.ok(speech.duration>=5);
    for (const line of speech.lines) assert.ok(line.length<=22);
    speech.remaining=0; assert.equal(speechScroll(speech,false),Math.max(0,speech.lines.length-2));
  }
}

test('Sprechblasen: an Figuren verankert, lesbar innerhalb des LCD',bubbleBounds);
test('Sprechblasen: zwei Zeilen mit Lesepausen und langsamem Teleprompter',teleprompterTiming);
test('Sprechblasen: vorhandene Sprüche bleiben vollständig lesbar',completeText);
