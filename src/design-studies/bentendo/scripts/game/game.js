import { restChoiceLabel } from './systems/rest-menu.js';
import { START_MINUTES,updateWorldClock,dayPhase } from './systems/world-clock.js';
import { updateDoorStudy,updateForestAmbience,finishDoorReading } from './systems/forest-return.js';
import { leaveForestAtEdge } from './systems/forest-travel.js';
import { recordQuestContact,closeQuests } from './systems/quest-log.js';
import { toggleQuestMarkers,questMapDescription } from './systems/quest-map.js';
import { MOVE_DIRECTIONS,diagonalBlocked,stepDuration } from './systems/player-movement.js';
import { collectHearts } from './systems/heart-drops.js';
import { damageHero,createHealth,trackDungeonVisit,recoveryObjects,updateRest } from './systems/health.js';
import { enterDungeonRoom,dungeonObjects,updateDungeon } from './systems/dungeon.js';
import { enemyAt,attack,updateCombat } from './systems/dungeon-combat.js';
import { audioMenuDescription } from './systems/audio-menu.js';
import { refreshQuestJournal } from './systems/quest-journal.js';
import { closeSystemMenu } from './systems/system-menu.js';
import { restoreGame } from './systems/save-state.js';
import { confirmCharacter,CHARACTER_PRESETS } from './data/characters.js';
import { wandererOccupies, wanderersMoving } from './systems/wanderers.js';
import { INVITATION } from './data/village.js';
import { villageObjects, updateVillage } from './systems/village.js';
import { DIRECTIONS } from '../core/config.js';
import { contains, wall, steamHot } from './systems/collision.js';
import { wrapText, objectHint } from './systems/text.js';
import { ACTIONS } from './systems/actions.js';
import { updateResidentChatter } from './systems/resident-chatter.js';
import { observeResidentAction,updateResidentReactions } from './systems/resident-reactions.js';
import { settleFetch,stickBorrowed,yieldCompanion } from './systems/dog-fetch.js';
import { activateBag,bagDescription } from './systems/inventory.js';
import { sitDown,standUp,serveDrink,openDrinks,clearTavern } from './systems/tavern.js';
import { taskObjects,recordVillageTask } from './systems/village-tasks.js';

/** Verwaltet Raumzustände, Bewegung und Funde unabhängig vom Handheld. */
export class Game {
  /** Übernimmt fertig geladene Raumdaten. @param {Map} rooms Raumverzeichnis. */
  constructor(rooms) { this.rooms = rooms; this.reset(); }
  /** Startet einen neuen Prototyp-Durchlauf ohne Bewerbungs- und Skillformular. */
  reset() {
    this.states = new Map(); this.flags = {}; this.inventory = []; this.notes = []; this.coins = 0;
    this.systemMenu=null; this.journalFromBag=false; this.health=createHealth(); this.resting=null; this.hurtTime=0; this.bagTab='items'; this.bagTabFocus=false;
    this.titleChoice=0; this.debugging=false; this.saveNotice=null; this.questIndex=0; this.questPage=0; this.questDetail=false;
    this.worldMinutes=START_MINUTES; this.doorStudy=null; this.pendingDoorStudy=null; this.forestAmbienceWait=5; this.forestAmbienceCount=0;
    this.residentHistory=new Map(); this.avatar='male'; this.characterIndex=0;
    this.mode = 'title'; this.time = 0; this.sounds = []; this.message = null; this.pages = [];
    this.bagOpen = false; this.mapOpen = false; this.journalOpen = false; this.journalIndex = 0;
    this.move = null; this.slide = null; this.held = null;
    if (this.rooms.has('village')) this.notes.push({...INVITATION});
    this.travel(this.rooms.has('village') ? 'village' : 'city'); this.mode = 'title'; this.sounds = [];
    this.reduced = false;
  }
  /** Erhält Räume und Funde beim Ortswechsel. @param {string} id Raumkennung. @param {number[]} spawn Optionaler Einstieg. */
  travel(id, spawn) {
    const room = this.rooms.get(id);
    if (!room) throw new Error(`Unbekannter Raum: ${id}`);
    trackDungeonVisit(this,room); clearTavern(this); settleFetch(this,Boolean(room.furnished));
    this.doorStudy=null; this.pendingDoorStudy=null; this.room = room; this.roomVisit=(this.roomVisit || 0)+1; this.locationNotice = {title:room.title,remaining:1.6};
    this.ambientSpeech=null; this.chatterWait=10+Math.random()*10;
    this.pendingReaction=null; this.tavernReply=null; this.idleTime=0; this.reactionWait=0;
    if (!this.states.has(id)) this.states.set(id, { blocks: structuredClone(room.blocks || []), taken: new Set() });
    this.roomState = this.states.get(id);
    const point = spawn || room.spawn;
    this.player = { x: point[0], y: point[1], facing: 'up' };
    this.move = null; this.slide = null; this.held = null; this.message = null; this.pages = [];
    this.bagOpen = false; this.mapOpen = false; this.journalOpen = false; this.sounds.push('door');
    this.bagIndex=6; this.bagAction=false; this.bagChoice=0; this.bagTab='items'; this.bagTabFocus=false;
    enterDungeonRoom(this);
  }
  /** Liefert noch vorhandene Objekte und die aktuellen Möbelpositionen. */
  get objects() {
    const objects = [...this.roomState.blocks];
    for (const object of this.room.objects) {
      const removed = ['take','note'].includes(object.action) && !object.persistent && this.roomState.taken.has(object.id);
      if (!removed) objects.push(object.discovery && this.roomState.taken.has(object.id)?{...object,searched:true,hint:object.discovery.note?'lesen':'erneut ansehen'}:object);
    }
    return recoveryObjects(this,dungeonObjects(this,taskObjects(this,villageObjects(this,objects))));
  }
  /** Findet ein Objekt über dessen vollständigen Fußabdruck. @param {number} x Spalte. @param {number} y Zeile. @param {object} ignore Ausgenommenes Objekt. */
  objectAt(x, y, ignore = null) {
    for (const object of this.objects) if (object !== ignore && !object.passable && contains(object, x, y)) return object;
    return null;
  }
  /** Prüft begehbare Felder. @param {number} x Spalte. @param {number} y Zeile. */
  occupied(x, y) {
    const object=this.objectAt(x,y);
    return wall(this,x,y) || Boolean(object && !object.walkThrough) || Boolean(enemyAt(this,x,y)) || wandererOccupies(this,x,y);
  }
  /** Liefert das Objekt unmittelbar vor der Figur. */
  get target() {
    const underfoot=this.objectAt(this.player.x,this.player.y);
    if (underfoot?.kind==='loot-bag') return underfoot;
    const [dx,dy] = DIRECTIONS[this.player.facing];
    return this.objectAt(this.player.x + dx, this.player.y + dy);
  }
  /** Liefert den benannten Aktionshinweis. */
  get hint() { if (this.resting) return 'Du schläfst ...'; if (this.room.dungeon && !this.target) return 'A: Angriff  B: Rucksack'; return this.seat?(this.roomState.service?.phase==='ready'?'A: Getränke  B: aufstehen':this.roomState.service?.phase==='approach'?'Der Wirt kommt. B: aufstehen':'B: aufstehen'):objectHint(this.target); }
  /** Beginnt einen Schritt ohne Wanddurchquerung. @param {string} direction Laufrichtung. */
  step(direction) {
    if (this.mode!=='world' || this.systemMenu || this.resting || this.doorStudy) return false;
    if (!MOVE_DIRECTIONS[direction] || this.move || this.slide || this.message || this.bagOpen || this.journalOpen || this.mapOpen) return false;
    if (this.tavernMenu) return false;
    if (this.seat) { standUp(this); return false; }
    if (diagonalBlocked(this,direction)) return false;
    const [dx,dy] = MOVE_DIRECTIONS[direction], x = this.player.x + dx, y = this.player.y + dy;
    if (leaveForestAtEdge(this,x,y)) return true;
    if (enemyAt(this,x,y)) { damageHero(this,1); return false; }
    const passing=yieldCompanion(this,x,y);
    if (!passing && this.occupied(x, y)) return false;
    if (steamHot(this, x, y)) { this.say('Du', 'Heißer Dampf! Ich warte kurz.'); return false; }
    this.idleTime=0;
    this.move = { fromX: this.player.x, fromY: this.player.y, x, y, time: 0 };
    this.sounds.push('step'); return true;
  }
  /** Aktualisiert nur aktive Spielzeit. @param {number} dt Zeitschritt. @param {boolean} reduced Reduzierte Bewegung. */
  update(dt, reduced) {
    if (this.mode !== 'world' || this.systemMenu) return;
    this.reduced = reduced;
    if (updateDoorStudy(this,dt)) return;
    if (this.resting) { updateRest(this,dt); return; }
    const paused = this.message || this.bagOpen || this.journalOpen || this.mapOpen || this.tavernMenu;
    if (!paused) { this.time += dt; updateWorldClock(this,dt); updateForestAmbience(this,dt); this.updateLocation(dt); }
    if (this.move) this.updateMove(dt, reduced);
    if (this.slide) { this.slide.time += dt; if (reduced || this.slide.time >= 0.28) this.slide = null; }
    if (this.held && !this.move && !this.slide) this.step(this.held);
    if (!paused) { collectHearts(this); updateCombat(this,dt); updateDungeon(this,dt); updateVillage(this,dt,reduced); updateResidentReactions(this,dt); updateResidentChatter(this,dt); }
  }
  /** Schließt einen einzelnen Bewegungsschritt ab. @param {number} dt Zeitschritt. @param {boolean} reduced Reduzierte Bewegung. */
  updateMove(dt, reduced) {
    this.move.time += dt;
    if (!reduced && this.move.time < stepDuration(this.move)) return;
    this.player.x = this.move.x; this.player.y = this.move.y; this.move = null;
  }
  /** Bestätigt Titel, Dialog oder Objektaktion. */
  interact() {
    if (this.systemMenu || this.resting || this.doorStudy) return;
    if (this.mode === 'title') return this.beginAdventure();
    if (this.mode === 'character') return confirmCharacter(this);
    if (this.move && this.room.dungeon && !this.message && !this.bagOpen && !this.journalOpen && !this.mapOpen) return attack(this);
    if (this.move || this.slide) return;
    if (this.journalOpen) return this.browse(1);
    if (this.mapOpen) return toggleQuestMarkers(this);
    if (this.message) { this.message = this.pages.shift() || null; finishDoorReading(this); return; }
    if (this.tavernMenu) return serveDrink(this);
    if (this.bagOpen) return activateBag(this);
    if (this.seat) return openDrinks(this);
    const target = this.target;
    if (!target && this.room.dungeon) return attack(this);
    this.held = null;
    if (target && sitDown(this,target)) return;
    if (target) { recordQuestContact(this,target); recordVillageTask(this,target); observeResidentAction(this,target); (ACTIONS[target.action] || ACTIONS.inspect)(this, target); refreshQuestJournal(this); }
  }
  /** Öffnet nach dem Titel die einfache Auswahl der beiden Figuren. */
  beginAdventure() {
    if (this.resumeData && this.titleChoice===0 && restoreGame(this,this.resumeData)) return;
    this.mode='character'; this.held=null; this.message=null; this.pages=[];
    this.bagOpen=false; this.journalOpen=false; this.mapOpen=false;
  }
  /** Meldet eine noch laufende Hausmeisterbewegung ohne zusätzliche Daueranimation. */
  get animating() {
    if (this.mode!=='world' || this.systemMenu || this.resting) return false;
    if (this.doorStudy) return true;
    if (this.message || this.bagOpen || this.journalOpen || this.mapOpen) return false;
    const keeper=this.room.id==='village' && this.roomState.keeper && !this.roomState.keeper.waiting && !this.flags.guildOpen;
    return Boolean(this.resting || (this.room.dungeon && (this.enemies.length || this.attackTime || this.attackCooldown || this.nestWave && !this.flags.quellNestCleared)) || (this.room.pipeBoard && !this.reduced) || this.locationNotice || (this.roomState.service && this.roomState.service.phase!=='ready') || keeper || ['throw','pickup'].includes(this.roomState.fetch?.phase) || wanderersMoving(this));
  }
  /** Beendet die Ortsmeldung nach kurzer aktiver Spielzeit. @param {number} dt Zeitschritt. */
  updateLocation(dt) {
    if (!this.locationNotice) return;
    this.locationNotice.remaining-=dt;
    if (this.locationNotice.remaining<=0) this.locationNotice=null;
  }
  /** Seitenweise lesbarer Dialog ohne abgeschnittene Zeilen. @param {string} speaker Sprecher. @param {string} text Inhalt. @param {string} voice Klangkennung beim Ansprechen. */
  say(speaker, text, voice='talk') {
    this.locationNotice=null; this.ambientSpeech=null; this.tavernReply=null;
    const lines = wrapText(text, 26);
    this.pages = []; this.held = null;
    for (let i = 0; i < lines.length; i += 3) this.pages.push({ speaker, lines: lines.slice(i, i + 3) });
    this.message = this.pages.shift(); this.sounds.push(voice);
  }
  /** Verbraucht einen Schlüsselgegenstand genau einmal. @param {string} item Gegenstandstitel. */
  consume(item) {
    if (item==='Ast' && stickBorrowed(this)) return false;
    const index = this.inventory.indexOf(item);
    if (index < 0) return false;
    this.inventory.splice(index, 1); return true;
  }
  /** Öffnet Inventar oder schließt den aktuellen Dialog. */
  back() {
    this.held = null;
    if (this.resting || this.doorStudy) return;
    if (this.systemMenu) return closeSystemMenu(this);
    if (this.mode==='title') return;
    if (this.mode==='character') { this.mode='title'; this.sounds.push('ui-back'); return; }
    if (this.message) { this.message = null; this.pages = []; finishDoorReading(this); return; }
    if (this.bagOpen && this.bagTab==='quests') return closeQuests(this);
    if (this.bagOpen && this.bagTab==='profile') { this.bagTab='items'; this.bagTabFocus=false; return; }
    if (this.bagOpen && this.bagAction) { this.bagAction=false; return; }
    if (this.mapOpen) { this.mapOpen=false; this.bagOpen=true; return; }
    if (this.journalOpen) { this.journalOpen=false; this.bagOpen=this.journalFromBag; this.journalFromBag=false; return; }
    if (this.seat) { standUp(this); return; }
    this.bagOpen = !this.bagOpen;
  }
  /** Öffnet das wiederlesbare Journal. */
  journal() {
    if (this.mode!=='world' || this.systemMenu || this.doorStudy) return;
    this.journalFromBag=this.bagOpen; this.bagAction=false; this.tavernMenu=false;
    this.held = null; this.message = null; this.pages = []; this.bagOpen = false; this.mapOpen = false;
    this.journalOpen = !this.journalOpen;
  }
  /** Blättert zwischen gesammelten Notizen. @param {number} direction Blätterrichtung. */
  browse(direction) {
    if (this.notes.length) this.journalIndex = (this.journalIndex + direction + this.notes.length) % this.notes.length;
  }
  /** Liefert eine textuelle Alternative zur Canvas-Darstellung. */
  get description() {
    if (this.mode === 'title') return this.resumeData?`DUNGEON WANTED. ${this.titleChoice===0?'Fortsetzen':'Neues Spiel'} gewählt. Pfeile wählen, A bestätigt.`:'DUNGEON WANTED. A oder START beginnt das Abenteuer.';
    if (this.systemMenu?.kind==='rest') return `Schlafen bis: ${restChoiceLabel(this,this.systemMenu.choice)}. Pfeile wählen, A bestätigt, B bricht ab.`;
    if (this.systemMenu?.kind==='audio') return audioMenuDescription(this.systemMenu);
    if (this.systemMenu) return this.systemMenu.kind==='pause'?`Pause. ${['Weiter','Notizen','Karte','Ton einstellen','Speichern'][this.systemMenu.choice]} gewählt. Pfeile wählen, A bestätigt, B setzt fort.`:`Spiel speichern. ${this.systemMenu.status || (this.systemMenu.choice===0?'Speichern':'Zurück')} gewählt. A bestätigt, B schließt.`;
    if (this.mode==='character') return `Figur wählen: ${CHARACTER_PRESETS[this.characterIndex].label}. Pfeile wählen, A startet, B zum Titel. Beide Presets haben dieselben Fähigkeiten.`;
    if (this.doorStudy) return 'Du untersuchst die verwitterten Kerben. Währenddessen bricht der Abend an.';
    if (this.message) return `${this.message.speaker}: ${this.message.lines.join(' ')}`;
    if (this.tavernMenu) return 'Getränke: Wasser gratis, Apfelsaft 1 Münze, Kräutertee 2 Münzen. Pfeile wählen, A bestellt, B steht auf.';
    if (this.journalOpen) return this.notes[this.journalIndex]?.text || 'Noch keine Notizen gefunden.';
    if (this.mapOpen) return `Ortskarte: ${this.room.title}. ${dayPhase(this)}. Dein Standort: ${this.player.x}, ${this.player.y}. ${questMapDescription(this)} B führt zum Rucksack zurück.`;
    if (this.bagOpen) return bagDescription(this);
    return `${this.room.title}. ${this.room.dungeon?`Leben ${this.health.hp} von ${this.health.maxHp}. ${this.enemies.length} Gegner. `:''}Position ${this.player.x}, ${this.player.y}. ${this.hint}`;
  }
}
