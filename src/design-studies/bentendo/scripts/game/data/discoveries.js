import { prop } from './town.js';

export const DISCOVERY_NOTES={
  request:{id:'moos-request',title:'Die blaue Brosche',text:'Meine blaue Brosche ist fort. Jorin hat sie mir vor vielen Jahren geschenkt. Im alten Reisebericht im Marktlager steht etwas über unser Versteck. Wer sie findet: Ich wohne im Haus östlich des Flusses. — Frau Moos'},
  trail:{id:'moos-trail',title:'Ein gemeinsames Versteck',text:'Nach unseren Reisen legten wir Erinnerungen in eine kleine Truhe. Hinter unserem Haus ließen wir früher den Abend ausklingen. Das Gras stand uns bis zu den Knien. Lene sagt, dort würde niemand nach unseren Erinnerungen suchen. — Jorin'},
  letter:{id:'moos-letter',title:'Jorins Brief',text:'Für Lene. Falls du die Brosche wieder einmal sicher weglegen willst: Unsere kleine Reisekiste vergisst nichts. Und wenn du sie trägst, denk an den ersten Abend am Fluss. — Jorin'},
  archive:{id:'archive-margin',title:'Eine Randnotiz',text:'Der untere Archivgang fehlt in den neuen Plänen. Mara wollte nach der Mühlenreparatur hinunter. Ihre Karte zeigt einen zweiten Ausgang, den ich nie gesehen habe. — Aus dem Ablagebuch der Gilde'},
};

const FINDS={
  inn:{'table-a':{note:DISCOVERY_NOTES.request},'vase-1':{item:'Messingknopf',text:'Zwischen Staub und einem trockenen Blatt liegt ein Messingknopf. Vielleicht kann ihn der Handwerker gebrauchen.'}},
  market:{'shelf-a':{note:DISCOVERY_NOTES.trail}},
  'guild-upper':{'vase-2':{note:DISCOVERY_NOTES.archive,text:'Unter dem Rand der Vase steckt ein zusammengerolltes Blatt aus einem Ablagebuch.'}},
  home:{'vase-2':{item:'Glasperle',text:'Unter dem Vasenrand klemmt eine kleine Glasperle. Sie erinnert an den Schmuck am Schwimmer der Anglerin.'}},
  workshop:{parts:{coins:4,text:'Zwischen den losen Beschlägen liegen vier vergessene Gildenmünzen.'},'cabinet-a':{item:'Garnspule',text:'Zwischen Messwerkzeug und Klingen liegt eine feine Garnspule. Sie gehört offenbar in die Webstube.'}},
  mill:{'grain-a':{coins:2,text:'Im leeren Einsatz unter dem Deckel liegen zwei Gildenmünzen.'}},
};

/** Ergänzt Funde an bestehenden Möbeln statt zusätzliche Kollisionsobjekte daraufzustapeln. @param {string} id Hauskennung. @param {object[]} objects Raumobjekte. */
export function decorateDiscoveries(id,objects) {
  for (const object of objects) {
    const found=FINDS[id]?.[object.id],vase=object.art?.startsWith('vase');
    if (!found && !vase) continue;
    object.action='search'; object.hint=found?.note?'lesen':'durchsuchen';
    object.discovery=found?structuredClone(found):{text:'Nur ein wenig Staub. Die Vase ist leer.',empty:'Schon durchsucht. Die Vase ist leer.'};
    if (found?.note && object.art==='table') object.detail='note';
  }
}

/** Platziert eine kleine echte Truhe im südöstlichen Gras, außerhalb der Tierrouten. */
export function createVillageDiscoveries() {
  return [prop('moos-cache','Reisetruhe',30,28,'discovery-chest','search',{hint:'öffnen',discovery:{item:'Blaue Brosche',note:DISCOVERY_NOTES.letter,text:'Unter einem alten Tuch liegen eine blaue Brosche und ein gefalteter Brief.'}})];
}
