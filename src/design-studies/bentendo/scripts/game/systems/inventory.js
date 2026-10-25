import { useEastCanteen } from './east-story.js';
import { BAG_TABS,navigateQuests,activateQuest,questDescription } from './quest-log.js';
import { heroStats,useBandage } from './health.js';
import { openAudioMenu } from './audio-menu.js';
import { ITEM_INFO } from '../data/items.js';
import { ACTIONS } from './actions.js';
import { tryFetch,stickBorrowed } from './dog-fetch.js';

/** Bewegt die Auswahl zwischen sechs Fächern, Karte und dem Gegenstandsmenü. @param {object} game Spiel. @param {string} direction Richtung. */
export function navigateBag(game,direction) {
  const previous=`${game.bagIndex}:${game.bagChoice}:${game.bagTab}:${game.bagTabFocus}:${game.questIndex}:${game.questPage}`;
  moveBag(game,direction);
  if (`${game.bagIndex}:${game.bagChoice}:${game.bagTab}:${game.bagTabFocus}:${game.questIndex}:${game.questPage}`!==previous) game.sounds.push('ui-move');
}

/** Ändert Fach oder Gegenstandsaktion innerhalb der bestehenden Rucksackgrenzen. @param {object} game Spiel. @param {string} direction Richtung. */
function moveBag(game,direction) {
  if (game.message) return;
  if (game.bagTabFocus || game.bagTab==='profile') return moveBagTabs(game,direction);
  if (game.bagTab==='quests') return navigateQuests(game,direction);
  if (game.bagAction) { game.bagChoice=1-game.bagChoice; return; }
  const index=game.bagIndex;
  if (index>=6) return moveBagTools(game,direction);
  if (direction==='up' && index<2) { game.bagTabFocus=true; return; }
  if (direction==='up') game.bagIndex=Math.max(0,index-2);
  if (direction==='down') game.bagIndex=index>=4?6+index%2:index+2;
  if (direction==='left') game.bagIndex=index%2?index-1:index;
  if (direction==='right') game.bagIndex=index%2?index:index+1;
}

/** Bestätigt Karte, Gegenstand oder die gewählte Aktion. @param {object} game Spiel. */
export function activateBag(game) {
  if (game.bagTabFocus || game.bagTab==='profile') { game.bagTabFocus=false; return; }
  if (game.bagTab==='quests') return activateQuest(game);
  if (game.bagIndex===7) return game.journal();
  if (game.bagIndex===8) return openAudioMenu(game);
  if (game.bagIndex===6) { game.sounds.push('ui-confirm'); game.bagOpen=false; game.mapOpen=true; return; }
  const item=game.inventory[game.bagIndex];
  if (!item) return;
  if (!game.bagAction) { game.sounds.push('ui-confirm'); game.bagAction=true; game.bagChoice=0; return; }
  if (game.bagChoice===1) return game.say(item,ITEM_INFO[item] || 'Ein aufbewahrtes Fundstück. Vielleicht wird es später noch gebraucht.');
  useItem(game,item);
}

/** Verwendet vorhandene Objektaktionen im passenden Kontext statt einer zweiten Questlogik. @param {object} game Spiel. @param {string} item Gegenstand. */
function useItem(game,item) {
  if (['Feldflasche','Volle Feldflasche'].includes(item)) return useEastCanteen(game,item);
  if (item==='Rohrbogen' && game.target?.action==='east-pipe') { game.bagOpen=false; game.bagAction=false; ACTIONS['east-pipe'](game,game.target); return; }
  if (item==='Rostiges Schwert') return game.say(item,'Das Schwert ist automatisch ausgerüstet. Im Dungeon schlägst du mit A in Blickrichtung zu. Angriff: 2.');
  if (item==='Ast' && game.room.dungeon) return game.say('Ast','Du verwendest den Ast automatisch als Waffe, solange du kein Schwert trägst. Im Dungeon schlägst du mit A in Blickrichtung zu.');
  if (item==='Feldverband') return useBandage(game);
  if (item==='Ast') {
    if (stickBorrowed(game)) return game.say('Ast','Der Hund bringt ihn gerade zurück.');
    const dog=nearbyObject(game,'dog',2);
    if (!dog) return game.say('Ast','Zum Werfen muss der Hund in deiner Nähe sein.');
    game.bagOpen=false; game.bagAction=false; tryFetch(game,dog); return;
  }
  const people={'Blaue Brosche':'grandmother',Messingknopf:'carpenter',Glasperle:'fisher',Garnspule:'weaver-helper',Pausenbecher:'keeper'};
  const person=nearbyObject(game,people[item],1),target=game.target;
  if (person) { game.bagOpen=false; game.bagAction=false; (item==='Pausenbecher'?ACTIONS['cup-return']:ACTIONS.talk)(game,person); return; }
  const action={Ersatzrune:'hall-console',Runenkupplung:'steam-console'}[item];
  if (action && target?.action===action) { game.bagOpen=false; game.bagAction=false; ACTIONS[action](game,target); return; }
  game.say(item,`${ITEM_INFO[item] || 'Diesen Gegenstand bewahrst du erst einmal auf.'} Hier kannst du ihn gerade nicht verwenden.`);
}

/** Sucht erreichbare Empfänger im selben Raum und in unmittelbarer Nähe. @param {object} game Spiel. @param {string} id Kennung. @param {number} range Entfernung. */
function nearbyObject(game,id,range) {
  for (const object of game.objects) if (object.id===id && Math.abs(object.x-game.player.x)+Math.abs(object.y-game.player.y)<=range) return object;
  return null;
}

/** Beschreibt die aktuelle Rucksackauswahl für die vorhandene zugängliche Statusausgabe. @param {object} game Spiel. */
export function bagDescription(game) {
  if (game.bagTab==='quests') return game.bagTabFocus?'Rucksackreiter Quests. Links zum Profil, unten zur Aufgabenliste. B zum Beutel.':questDescription(game);
  if (game.bagTab==='profile') return `Profil: ${game.avatar==='female'?'Heldin':'Held'}. Leben ${game.health.hp} von ${game.health.maxHp}. Angriff ${heroStats(game).attack}, Schutz ${heroStats(game).defense}. Waffe: ${heroStats(game).weapon}. Links zum Beutel, rechts zu Quests, B zurück.`;
  if (game.bagTabFocus) return 'Rucksackreiter: Beutel. Rechts zu Profil und Quests, unten zu den Gegenständen.';
  if (game.bagIndex>=6) return `Rucksack: ${['Karte','Notizen','Ton einstellen'][game.bagIndex-6]} ausgewählt. A öffnet, Pfeile wählen, B schließt.`;
  const item=game.inventory[game.bagIndex] || 'Leeres Fach';
  return `Rucksack: ${item}. ${game.bagAction?(game.bagChoice?'Ansehen':'Benutzen'):'A öffnet die Gegenstandsaktionen'}. Pfeile wählen, A bestätigt, B zurück.`;
}

/** Verbindet Karte, Notizen und Ton mit denselben vier Richtungen wie die Gegenstände. @param {object} game Spiel. @param {string} direction Richtung. */
function moveBagTools(game,direction) {
  const index=game.bagIndex;
  if (direction==='up') game.bagIndex=index-2;
  if (direction==='down') game.bagIndex=index>=8?index:8;
  if (direction==='left' && index%2===1) game.bagIndex=index-1;
  if (direction==='right' && index===6) game.bagIndex=index+1;
}

/** Wechselt vorhandene Reiter ohne eine zweite Menüführung für Quests einzuführen. @param {object} game Spiel. @param {string} direction Richtung. */
function moveBagTabs(game,direction) {
  const index=BAG_TABS.indexOf(game.bagTab);
  if (['left','right'].includes(direction)) {
    game.bagTab=BAG_TABS[Math.max(0,Math.min(BAG_TABS.length-1,index+(direction==='left'?-1:1)))];
    game.bagTabFocus=true; game.bagAction=false; game.questDetail=false;
  }
  if (direction==='down' && game.bagTab!=='profile') { game.bagTabFocus=false; game.bagIndex=0; }
}
