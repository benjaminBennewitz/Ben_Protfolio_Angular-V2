import { isResident,residentSeesPlayer } from './resident-visibility.js';
import { RESIDENT_REACTIONS } from '../data/resident-lines.js';
import { createResidentSpeech } from './resident-chatter.js';

/** Erkennt Suchhandlungen auch an Schränken, die bisher nur untersucht werden. @param {object} object Angesehenes Objekt. */
function reactionKind(object) {
  if (object.discovery?.note || object.detail==='note') return 'note';
  if (object.kind==='discovery-chest' || object.art==='chest' || object.action==='chest') return 'chest';
  if (object.art?.startsWith('vase')) return 'vase';
  if (['cupboard','dresser','bookcase','barrel','bottle-shelf'].includes(object.art)) return 'cupboard';
  return object.action==='search'?'cupboard':null;
}

/** Merkt eine beobachtete Handlung für eine Reaktion nach dem vorrangigen Funddialog. @param {object} game Spiel. @param {object} object Zielobjekt. @param {Function} random Zufallsquelle. */
export function observeResidentAction(game,object,random=Math.random) {
  game.idleTime=0;
  if (isResident(object)) { game.ambientSpeech=null; game.pendingReaction=null; return; }
  const kind=reactionKind(object);
  game.pendingReaction=null;
  if (!kind || game.reactionWait>0) return;
  const witnesses=game.objects.filter(seesAction.bind(null,game));
  if (!witnesses.length) return;
  const resident=witnesses[Math.floor(random()*witnesses.length)];
  game.pendingReaction={speakerId:resident.id,text:reactionLine(game,resident,kind,random)};
}

/** Begrenzt Reaktionen auf sichtbare, gerade nicht laufende Personen. @param {object} game Spiel. @param {object} resident Bewohner. */
function seesAction(game,resident) {
  if (resident.id==='keeper' && game.room.id==='village' && game.roomState.keeper && !game.flags.guildOpen) return false;
  return isResident(resident) && !resident.walking && Math.abs(resident.x-game.player.x)<=4 && Math.abs(resident.y-game.player.y)<=3 && residentSeesPlayer(game,resident);
}

/** Wählt passende Reaktionen ohne unmittelbare Wiederholung. @param {object} game Spiel. @param {object} resident Sprecher. @param {string} kind Anlass. @param {Function} random Zufallsquelle. */
function reactionLine(game,resident,kind,random) {
  const key=`reaction:${resident.id}:${kind}`,previous=game.residentHistory.get(key);
  const options=RESIDENT_REACTIONS[kind].filter(notPrevious.bind(null,previous));
  const text=options[Math.floor(random()*options.length)]; game.residentHistory.set(key,text); return text;
}
/** Schließt den vorherigen Spruch aus. @param {string} previous Letzter Spruch. @param {string} text Kandidat. */
function notPrevious(previous,text) { return previous!==text; }

/** Priorisiert beobachtete Suchaktionen und bemerkt längeres Herumstehen bei freier Sicht. @param {object} game Spiel. @param {number} dt Aktive Zeit. @param {Function} random Zufallsquelle. */
export function updateResidentReactions(game,dt,random=Math.random) {
  if (game.message || game.bagOpen || game.mapOpen || game.journalOpen) return;
  game.reactionWait=Math.max(0,game.reactionWait-dt);
  game.idleTime=game.move || game.held?0:game.idleTime+dt;
  if (game.ambientSpeech || game.locationNotice || game.tavernReply) return;
  if (game.pendingReaction) { showPending(game); return; }
  if (game.idleTime<14 || game.reactionWait>0) return;
  const witnesses=game.objects.filter(seesAction.bind(null,game));
  if (!witnesses.length) return;
  const resident=witnesses[Math.floor(random()*witnesses.length)];
  game.ambientSpeech=createResidentSpeech(resident,reactionLine(game,resident,'idle',random));
  game.idleTime=0; game.reactionWait=20;
}

/** Verwirft eine Reaktion, wenn der Beobachter den Spieler inzwischen nicht mehr sieht. @param {object} game Spiel. */
function showPending(game) {
  const pending=game.pendingReaction; game.pendingReaction=null;
  const resident=game.objects.find(sameResident.bind(null,pending.speakerId));
  if (!resident || !residentSeesPlayer(game,resident)) return;
  game.ambientSpeech=createResidentSpeech(resident,pending.text); game.reactionWait=12;
}
/** Findet die beobachtende Person. @param {string} id Kennung. @param {object} resident Figur. */
function sameResident(id,resident) { return resident.id===id; }
