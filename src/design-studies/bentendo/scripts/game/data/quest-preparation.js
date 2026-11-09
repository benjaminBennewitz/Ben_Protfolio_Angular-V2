import { questRecord,questMarker } from './quest-helpers.js';

/** Leitet die Vorbereitung aus Rückkehr, Gesprächen und tatsächlich getragenen Materialien ab. @param {object} game Spiel. */
export function preparationQuests(game) {
  if (!game.flags.rootSpringFlowing) return [];
  const f=game.flags,quests=[];
  quests.push(questRecord({id:12,title:'Heimkehr aus Wurzelgrund',people:['Mara'],places:['Bruchstein'],clues:[f.returnReported?'Mara erkennt die Quellscherbe. Vor dem verschneiten Westweg helfen Gesellin, Näherin und Wirt.':'Die Quelle fließt. Mara könnte die Quellscherbe kennen.'],done:Boolean(f.returnReported),markers:[questMarker('village-guild-upper','mara','!')]}));
  if (f.temperKnown || f.quarryKnown) {
    const ready=game.inventory.includes('Feiner Schleifstein') || f.temperRested;
    quests.push(questRecord({id:13,title:'Eine feinere Schneide',people:['Gesellin'],places:['Werkstatt','Alter Wachposten'],clues:[f.temperDone?'Die Gesellin hat das Schwert veredelt. Angriff 4.':f.temperDue?'Die Klinge liegt in der Werkstatt. Nach einer Nacht im Bett kann sie abgeholt werden.':ready?'Der feine Schleifstein ist geborgen. Die Gesellin wartet in Bruchstein.':'Neben dem alten Wachposten liegt die Schleifkammer. Dort wurde ein großer Panzerkäfer gesehen.'],ready,done:Boolean(f.temperDone),markers:[questMarker(ready || f.temperDue?'village-workshop':'quell-refuge',ready || f.temperDue?'workshop-helper':'quarry',ready?'!':'?')]}));
  }
  if (f.mantleKnown) {
    const ready=game.inventory.includes('Wollballen') && game.inventory.includes('Bronzeverschluss');
    quests.push(questRecord({id:14,title:'Ein Mantel für den Westweg',people:['Näherin','Wirt'],places:['Webstube','Schenke','Quellgewölbe'],clues:[f.mantleMade?'Der gefütterte Mantel ist angelegt. Gewöhnlicher Kontaktschaden wird um ein Viertelherz verringert.':'Die Näherin braucht einen Wollballen vom Reisebedarf und einen alten Bronzeverschluss aus dem Quellgewölbe.'],ready,done:Boolean(f.mantleMade),markers:[questMarker('village-weaver','tailor',ready?'!':'?'),...(!game.inventory.includes('Wollballen')?[questMarker('village-inn','bar-d')]:[])]}));
  }
  return quests;
}
