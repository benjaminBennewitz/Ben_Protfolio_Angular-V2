import { sleepUntil,dayPhase } from './world-clock.js';

export const HERO_BED={room:'village-inn-upper',id:'bed-west',spawn:[2,3]};

/** Beginnt mit drei Herzen; ein Lebenspunkt entspricht einem halben Herzen. */
export function createHealth() { return {hp:6,maxHp:6,deaths:0,run:null,lost:null}; }

/** Berechnet Kampfwerte aus der tatsächlich getragenen Ausrüstung. @param {object} game Spiel. */
export function heroStats(game) {
  const sword=game.inventory.includes('Rostiges Schwert'),stick=game.inventory.includes('Ast');
  return {attack:sword?2:1,defense:0,weapon:sword?'Rostiges Schwert':stick?'Ast':'Fäuste',armor:'Reisekleidung'};
}

/** Sichert die mitgebrachten Dinge beim Einstieg und bankt Beute beim sicheren Verlassen. @param {object} game Spiel. @param {object} room Zielraum. */
export function trackDungeonVisit(game,room) {
  const health=game.health;
  if (health.run?.dungeon===room.dungeon) return;
  health.run=room.dungeon?{dungeon:room.dungeon,inventory:[...game.inventory],coins:game.coins}:null;
}

/** Zieht Treffer nur in aktiven Dungeons und außerhalb kurzer Unverwundbarkeit ab. @param {object} game Spiel. @param {number} amount Schaden in Lebenspunkten; 0,5 entspricht einem Viertelherz. */
export function damageHero(game,amount) {
  if (!game.room.dungeon || game.mode!=='world' || game.message || game.bagOpen || game.journalOpen || game.mapOpen || game.systemMenu || game.resting || game.hurtTime>0) return false;
  if (typeof amount!=='number' || !Number.isSafeInteger(amount*2) || amount<=0) return false;
  game.health.hp=Math.max(0,game.health.hp-amount); game.hurtTime=1.1; game.sounds.push(game.health.hp?'combat-hurt':'combat-death-hero');
  if (!game.health.hp) defeatHero(game);
  return true;
}

/** Lässt nur seit dem Einstieg hinzugekommene Gegenstände im Dungeon zurück. @param {object} game Spiel. */
function dropRunLoot(game) {
  const run=game.health.run,baseline=[...(run?.inventory || [])],items=[],kept=[];
  for (const item of game.inventory) {
    const index=baseline.indexOf(item);
    if (index<0) items.push(item); else { baseline.splice(index,1); kept.push(item); }
  }
  const coins=Math.max(0,game.coins-(run?.coins ?? game.coins));
  game.inventory=kept; game.coins-=coins;
  game.health.lost=items.length || coins?{dungeon:game.room.dungeon,room:game.room.id,x:game.player.x,y:game.player.y,items,coins}:null;
}

/** Ersetzt einen nicht zurückgeholten Beutel und weckt die Figur im reservierten Bett. @param {object} game Spiel. */
function defeatHero(game) {
  dropRunLoot(game); game.health.run=null; game.health.deaths++;
  const room=game.rooms.has(HERO_BED.room)?HERO_BED.room:game.rooms.has('village')?'village':'city';
  game.travel(room,room===HERO_BED.room?HERO_BED.spawn:undefined);
  game.sounds=game.sounds.filter(withoutDoor);
  game.health.hp=game.health.maxHp; game.hurtTime=0; game.attackTime=0; game.attackCooldown=0;
  game.systemMenu=null; game.bagTab='items'; game.resting={remaining:1.2,reason:'defeat'};
  game.locationNotice=null;
}

/** Heilt nach bestätigter Bettruhe und erhält den verlorenen Dungeonbeutel. @param {object} game Spiel. @param {number} target Gewählte Tagesminute. */
export function sleepInBed(game,target=420) {
  game.move=null; game.held=null; game.message=null; game.pages=[]; game.locationNotice=null;
  sleepUntil(game,target); game.resting={remaining:1.2,reason:'sleep'}; refillHero(game,game.health.maxHp);
  game.player={x:HERO_BED.spawn[0],y:HERO_BED.spawn[1],facing:'down'}; game.sounds.push('ui-confirm');
}

/** Beendet die kurze Bettruhe und meldet die einmalige Rückholchance verständlich. @param {object} game Spiel. @param {number} dt Zeitschritt. */
export function updateRest(game,dt) {
  if (!game.resting) return;
  game.resting.remaining-=dt;
  if (game.resting.remaining>0) return;
  const defeat=game.resting.reason==='defeat'; game.resting=null;
  game.say(defeat?'Wieder im Wirtshaus':'Ausgeruht',defeat?(game.health.lost?'Du wachst mit vollen Herzen in deinem Bett auf. Deine Dungeonbeute liegt am Ort deiner Niederlage. Hole sie zurück. Wenn du vorher erneut fällst, ist sie verloren.':'Du wachst mit vollen Herzen in deinem Bett auf. Dein alter Beutel ist verloren; mitgebrachte Ausrüstung bleibt bei dir.'):`Du wachst ${dayPhase(game)==='Nacht'?'in der Nacht':dayPhase(game)==='Abend'?'am Abend':'am Morgen'} auf. Alle Herzen sind wieder aufgefüllt.`,'success-small');
}

/** Ergänzt einen auffindbaren Beutel am gespeicherten, begehbaren Todesort. @param {object} game Spiel. @param {object[]} objects Raumobjekte. */
export function recoveryObjects(game,objects) {
  const lost=game.health.lost;
  if (lost?.room===game.room.id) objects.push({id:'lost-dungeon-loot',name:'Dein verlorener Beutel',x:lost.x,y:lost.y,kind:'loot-bag',walkThrough:true,action:'recover-loot',hint:'Beute zurückholen'});
  return objects;
}

/** Holt den gesamten Beutel atomar zurück, ohne bei Platzmangel etwas zu verlieren. @param {object} game Spiel. */
export function recoverLoot(game) {
  const lost=game.health.lost;
  if (!lost || lost.room!==game.room.id) return;
  if (game.inventory.length+lost.items.length>6) return game.say('Rucksack','Für den ganzen Beutel fehlen freie Fächer. Er bleibt hier, bis du Platz geschaffen hast.','ui-denied');
  game.inventory.push(...lost.items); game.coins+=lost.coins; game.health.lost=null;
  game.say('Beute gerettet','Alle verlorenen Gegenstände und Münzen sind wieder bei dir. Verlasse den Dungeon sicher, um sie zu behalten.','success-quest');
}

/** Verbraucht einen Verband nur bei fehlendem Leben und heilt bis zur Herzgrenze. @param {object} game Spiel. */
export function useBandage(game) {
  if (game.health.hp===game.health.maxHp) return game.say('Feldverband','Alle Herzen sind schon voll.','ui-denied');
  if (!game.consume('Feldverband')) return;
  refillHero(game,4); game.bagAction=false;
  game.say('Feldverband','Bis zu vier Lebenspunkte geheilt.','success-small');
}

/** Füllt Leben in exakten Viertelherzschritten auf und meldet nur tatsächliche Heilung. @param {object} game Spiel. @param {number} amount Heilung in Lebenspunkten. */
export function refillHero(game,amount) {
  if (typeof amount!=='number' || !Number.isSafeInteger(amount*2) || amount<=0) return false;
  const hp=Math.min(game.health.maxHp,game.health.hp+amount);
  if (hp===game.health.hp) return false;
  game.health.hp=hp; game.sounds.push('combat-refill'); return true;
}

/** Unterdrückt den Türklang beim erzwungenen Erwachen, damit der Todesklang hörbar bleibt. @param {string} cue Klangkennung. */
function withoutDoor(cue) { return cue!=='door'; }
