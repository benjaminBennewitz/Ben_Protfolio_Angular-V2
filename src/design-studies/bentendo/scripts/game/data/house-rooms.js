import { prop } from './town.js';
import { HOUSE_LAYOUTS } from './house-layouts.js';
import { HOUSE_PLANS, houseGeometry } from './house-shapes.js';
import { decorateDiscoveries } from './discoveries.js';
import { HOUSE_PATROLS } from './house-patrols.js';

export const HOUSE_INFO={
  inn:{title:'Zum schiefen Kessel',entrance:[4,12],style:'wood',rugs:[{x:2,y:7,w:4,h:4},{x:8,y:6,w:4,h:4}]},
  'inn-upper':{title:'Gästezimmer',entrance:[4,12],style:'wood',rugs:[{x:3,y:3,w:3,h:2},{x:10,y:3,w:4,h:2}]},
  guild:{title:'Die verlassene Gilde',entrance:[12,6],style:'wood',rugs:[{x:8,y:5,w:4,h:4}]},
  'guild-upper':{title:'Gildenarchiv und Schreibzimmer',entrance:[12,6],style:'wood',rugs:[{x:10,y:2,w:4,h:3}]},
  mill:{title:'Mühlenhaus',entrance:[20,8],style:'stone',assetGaps:['vollständiges Mahlwerk']},
  weaver:{title:'Webstube',entrance:[28,8],style:'wood',rugs:[{x:4,y:3,w:6,h:4}],assetGaps:['Webstuhl']},
  home:{title:'Haus der Familie Moos',entrance:[28,22],style:'wood',rugs:[{x:2,y:6,w:5,h:4},{x:10,y:3,w:4,h:2}]},
  workshop:{title:'Werkstatt',entrance:[5,25],style:'stone'},
  market:{title:'Marktlager',entrance:[21,25],style:'wood'},
};

/** Erstellt individuelle Raumformen, Nutzungszonen und passende Rückwege. @param {string} id Hauskennung. */
export function createHouseRoom(id) {
  const info=HOUSE_INFO[id],objects=structuredClone(HOUSE_LAYOUTS[id]),geometry=houseGeometry(id);
  const upper=id.endsWith('-upper'),base=upper?id.slice(0,-6):null,exit=HOUSE_PLANS[id].exit;
  const landing=base==='inn'?[15,7]:[13,7];
  objects.push(prop('exit',upper?'Treppe hinunter':'Haustür',exit[0],exit[1],upper?'stairs':'door','travel',{to:upper?`village-${base}`:'village',spawn:upper?landing:[info.entrance[0],info.entrance[1]+1]}));
  addHousePeople(id,objects); addHouseLinks(id,objects);
  if (id==='inn-upper') for (const object of objects) if (object.id==='bed-west') Object.assign(object,{name:'Dein Bett',action:'sleep',hint:'schlafen und heilen'});
  if (id==='inn') for (const object of objects) if (object.art==='chair') {
    object.hint='hinsetzen'; object.barService=object.id.startsWith('bar-stool-');
  }
  if (id==='workshop') objects.push(prop('pipe-case','Ersatzteilkiste',12,8,'chest','east-spares',{text:'Rohrbögen und Dichtungen für die alten Leitungen.'}));
  decorateDiscoveries(id,objects);
  return {id:`village-${id}`,title:info.title,...geometry,music:id.startsWith('guild')?'rune-archive':'town-square',interior:true,furnished:true,style:info.style,rugs:info.rugs || [],assetGaps:info.assetGaps || [],villageEntrance:info.entrance,objects};
}

/** Platziert Menschen an ihren Arbeitsplätzen statt in Verkehrswegen. @param {string} id Hauskennung. @param {object[]} objects Raumobjekte. */
function addHousePeople(id,objects) {
  if (id==='inn') objects.push(prop('innkeeper','Wirt',9,3,'resident','talk',{appearance:[0,80],text:'Such dir einen Platz. Die Küche liegt hinter der Trennwand, die Zimmer sind oben.'}));
  if (id==='guild-upper') objects.push(prop('mara','Mara',11,5,'resident','talk',{appearance:[312,64],text:'Ein alter Gang fehlt auf den neuen Plänen. Ich versuche herauszufinden, warum.'}));
  if (id==='mill') objects.push(prop('miller','Müller',12,7,'resident','talk',{appearance:[0,144],text:'Das Mahlwerk liegt hinter der Schutztür. Draußen steckt ein Ast im Wasserrad.',flowText:'Das Rad läuft wieder. Jetzt kann ich im Mahlraum weiterarbeiten.'}));
  if (id==='guild') objects.push(prop('keeper','Hausmeister',9,2,'npc','talk',{text:'Schau dich ruhig um. Oben liegen die alten Reiseunterlagen. Vielleicht findest du etwas über den fehlenden Archivgang.'}));
  if (id==='home') objects.push(prop('grandmother','Frau Moos',7,7,'resident','talk',{appearance:[156,432],text:'Schön, dass wieder jemand Neues ins Dorf kommt. Setz dich ruhig, ich habe gerade Tee gekocht.'}));
  if (id==='weaver') objects.push(prop('weaver-helper','Weberlehrling',10,3,'resident','talk',{appearance:[312,144],text:'Ich lege gerade die Stoffe zurecht. Die langen Bahnen gehören auf den Arbeitstisch.'}));
  if (id==='workshop') objects.push(prop('workshop-helper','Gesellin',7,4,'resident','talk',{appearance:[0,432],text:'Die Werkzeuge kommen nach der Arbeit zurück an ihren Platz. Meistens jedenfalls.'}));
  if (id==='market') objects.push(prop('storekeeper','Lagerwartin',7,3,'resident','talk',{appearance:[156,320],text:'Ich zähle die Vorräte. Falls du etwas suchst: Im Regal liegen auch alte Reiseberichte.'}));
  for (const object of objects) if (HOUSE_PATROLS[object.id]) object.route=HOUSE_PATROLS[object.id];
}

/** Verbindet Etagen und kennzeichnet noch nicht ausgestaltete Fachräume ehrlich. @param {string} id Hauskennung. @param {object[]} objects Raumobjekte. */
function addHouseLinks(id,objects) {
  if (id==='inn') objects.push(prop('stairs','Treppe hinauf',15,8,'stairs','travel',{to:'village-inn-upper',spawn:[7,10]}));
  if (id==='guild') {
    objects.push(prop('stairs','Treppe hinauf',13,8,'stairs','travel',{to:'village-guild-upper',spawn:[7,10]}));
    objects.push(prop('archive-door','Unterer Archivgang',15,2,'door','mara-archive',{text:'Unter dem Staub sind frische Spuren. Der untere Archivgang bleibt vorerst verschlossen.'}));
  }
  if (id==='mill') objects.push(prop('machine-door','Mahlraum',7,3,'door','inspect',{text:'Der Zugang zum Mahlwerk bleibt aus Sicherheitsgründen geschlossen. Vom Arbeitsraum aus führt keine offene Laufspur zwischen die beweglichen Teile.'}));
}

/** Erstellt die übrigen Dorfhäuser und beide zusätzlichen Obergeschosse. */
export function createVillageInteriors() {
  const rooms=[];
  for (const id of Object.keys(HOUSE_INFO)) if (id!=='guild') rooms.push(createHouseRoom(id));
  return rooms;
}
