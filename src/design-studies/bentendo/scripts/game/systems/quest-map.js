import { residentLocation } from './daily-life.js';
import { DAILY_RESIDENTS } from '../data/daily-residents.js';
import { questEntries } from './quest-log.js';

const AREAS={
  'mill-area':[18,8],'moos-area':[29,25],'north-area':[15,2],'archive-area':[14,2],'workshop-area':[8,5],
};

/** Projiziert bekannte Hinweise auf Orte statt auf heimliche Item- oder Figurenkoordinaten. @param {object} game Spiel. @param {object} marker Hinweisort. @param {string} mapRoom Gezeichneter Raum. */
function projectMarker(game,marker,mapRoom) {
  const destination=residentLocation(game,marker.target);
  if (destination===null) return null;
  if (destination!==undefined) marker={...marker,room:destination};
  const room=game.rooms.get(marker.room);
  if (!room) return null;
  if (marker.room!==mapRoom) {
    if (mapRoom!=='village' || !room.villageEntrance) return null;
    return {...marker,x:room.villageEntrance[0],y:room.villageEntrance[1]};
  }
  const area=AREAS[marker.target];
  if (area) return {...marker,x:area[0],y:area[1]};
  const person=(game.room.id===mapRoom?game.objects:room.objects).find(matchesPerson.bind(null,marker.target)) || tavernMarkerPerson(game,marker);
  if (!person) return null;
  return {...marker,x:person.x,y:person.y};
}

/** Vergleicht die Kennung einer bereits bekannten Kontaktperson. @param {string} id Person. @param {object} object Raumobjekt. */
function matchesPerson(id,object) { return object.id===id; }

/** Liefert nur offene bekannte Hinweise, optional beschränkt auf die angeheftete Aufgabe. @param {object} game Spiel. @param {string} mapRoom Kartengebiet. */
export function questMapMarkers(game,mapRoom) {
  if (game.flags.questMarkersHidden) return [];
  const entries=questEntries(game),pinned=entries.find(matchesPinned.bind(null,game.flags.questPinned)),markers=[],seen=new Set();
  for (const entry of entries) {
    if (entry.status==='done' || pinned && pinned.status!=='done' && entry.id!==pinned.id) continue;
    for (const marker of entry.markers) {
      const point=projectMarker(game,marker,mapRoom);
      if (!point) continue;
      const key=`${point.x}:${point.y}:${point.symbol}`;
      if (!seen.has(key)) { markers.push(point); seen.add(key); }
    }
  }
  return markers;
}

/** Vergleicht die fest angeheftete Aufgabenkennung. @param {number} id Kennung. @param {object} entry Aufgabe. */
function matchesPinned(id,entry) { return entry.id===id; }

/** Schaltet bekannte Hinweissymbole auf der Karte über die vorhandene A-Taste um. @param {object} game Spiel. */
export function toggleQuestMarkers(game) {
  game.flags.questMarkersHidden=!game.flags.questMarkersHidden; game.sounds.push('ui-confirm');
}

/** Nennt Symbolbedeutung und Sichtbarkeit für die zugängliche Kartenausgabe. @param {object} game Spiel. */
export function questMapDescription(game) {
  const id=game.room.villageEntrance?'village':game.room.id,markers=questMapMarkers(game,id),labels=[];
  for (const marker of markers) labels.push(`${marker.symbol==='!'?'Neue Entwicklung bei':'Hinweisbereich'} ${game.rooms.get(marker.room).title}`);
  return `Hinweismarker ${game.flags.questMarkersHidden?'aus':'an'}. ${labels.join('. ')} A schaltet Marker um. Fragezeichen sind bekannte Suchbereiche, Ausrufezeichen bekannte Anlaufstellen mit neuen Entwicklungen.`;
}

/** Verwendet den bekannten Abendplatz auch bei einer von draußen geöffneten Ortskarte. @param {object} game Spiel. @param {object} marker Personenhinweis. */
function tavernMarkerPerson(game,marker) {
  if (marker.room!=='village-inn') return null;
  const plan=DAILY_RESIDENTS.find(matchesPerson.bind(null,marker.target));
  if (!plan) return null;
  const point=game.states.get('village-inn')?.dailyGuestPoints?.[plan.id] || plan.point;
  return {x:point[0],y:point[1]};
}
