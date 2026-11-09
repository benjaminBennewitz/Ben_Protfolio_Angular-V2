import { damageHero,refillHero } from './health.js';

/** Verbraucht Reiseheilmittel erst, wenn ihr Effekt tatsächlich gebraucht wird. @param {object} game Spiel. @param {string} item Gegenstand. */
export function useTravelPotion(game,item) {
  const now=Math.floor(game.time*1000);
  if (item==='Heiltrank' && game.health.hp>=game.health.maxHp) return game.say(item,'Deine Herzen sind voll.');
  if (item==='Stärkungstrank' && game.flags.strengthUntil>now) return game.say(item,'Die Stärkung wirkt bereits.');
  if (!game.consume(item)) return;
  if (item==='Heiltrank') refillHero(game,6);
  if (item==='Gegengift') {
    delete game.flags.poisonTicks;
    delete game.flags.poisonNext;
    game.flags.antidoteUntil=now+60000;
  }
  if (item==='Stärkungstrank') game.flags.strengthUntil=now+60000;
  game.bagAction=false;
  const text={Heiltrank:'Bis zu drei Herzen geheilt.',Gegengift:'Gift neutralisiert. Du bist 60 aktive Spielsekunden gegen neues Gift geschützt.',Stärkungstrank:'60 aktive Spielsekunden lang Angriff +2.'};
  game.say(item,text[item],'success-small');
}

/** Vergiftet nur bei einem erfolgreichen Insektentreffer und ohne Gegengiftschutz. @param {object} game Spiel. @param {object} actor Gegner. */
export function poisonFromEnemy(game,actor) {
  const now=Math.floor(game.time*1000);
  if (game.resting || !actor?.venom || game.flags.antidoteUntil>now || game.flags.poisonTicks) return;
  game.flags.poisonTicks=4;
  game.flags.poisonNext=now+3000;
  game.say('Vergiftet','Der Stich brennt. Viermal ein Viertelherz Giftschaden droht. Gegengift im Rucksack stoppt das Gift.','combat-hurt');
}

/** Lässt Effekte nur mit aktiver Weltzeit fortschreiten. @param {object} game Spiel. */
export function updateCombatEffects(game) {
  const now=Math.floor(game.time*1000);
  for (const key of ['strengthUntil','antidoteUntil']) if (game.flags[key]<=now) delete game.flags[key];
  if (!game.flags.poisonTicks || now<game.flags.poisonNext) return;
  game.flags.poisonNext=now+3000;
  game.flags.poisonTicks--;
  const hurt=game.hurtTime;
  game.hurtTime=0;
  const deaths=game.health.deaths;
  damageHero(game,0.5);
  if (game.health.deaths===deaths) game.hurtTime=hurt;
  if (!game.flags.poisonTicks) delete game.flags.poisonNext;
}
