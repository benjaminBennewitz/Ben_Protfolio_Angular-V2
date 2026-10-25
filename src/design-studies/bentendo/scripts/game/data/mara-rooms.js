import { prop } from './town.js';

export const QUELLPLAN={id:'mara-old-plan',title:'Der alte Quellplan',text:'Der Mühlkanal entspringt im Quellstollen nördlich von Bruchstein. Ein inzwischen eingestürzter Wartungsgang verband Quelle und unteres Archiv. Auf dem Plan trägt das alte Fluttor drei Kerben. Daneben steht: Nur bei ruhigem Wasser betreten.'};
export const SOURCE_REPORT={id:'mara-source-report',title:'Frische Spuren am Fluttor',text:'Am alten Fluttor im Quellstollen ist die getrocknete Schlammkruste frisch verwischt. Jemand hat die drei Kerben mit Kreide nachgezogen und einen Pfeil nach Osten gesetzt. Das Wasser läuft ruhig; die Markierung ist neuer als der Quellplan. Mara muss davon erfahren.'};

/** Bindet das bewährte Regalrätsel als eigenständigen Dorfraum ein, ohne den bisherigen Debugraum zu verändern. @param {object} source Originalarchiv. */
export function createMaraArchive(source) {
  const room=structuredClone(source); Object.assign(room,{id:'mara-archive',title:'Unteres Gildenarchiv',puzzle:'archive',villageEntrance:[12,6]});
  for (const object of room.objects) {
    if (object.id==='return') Object.assign(object,{to:'village-guild',spawn:[14,2],name:'Treppe zur Gilde'});
    if (object.id==='exit') Object.assign(object,{action:'inspect',name:'Eingestürzter Wartungsgang',text:'Hinter der Tür ist der alte Verbindungsgang eingestürzt. Zur Staukammer gelangst du heute nur durch den Höhleneingang im Norden des Dorfes. Zurück zur Gilde führt die Treppe beim Archiv-Eingang.'});
    if (object.id==='note') Object.assign(object,{name:'Alter Quellplan',note:{...QUELLPLAN}});
    if (object.id==='npc') Object.assign(object,{kind:'sign',action:'inspect',name:'Archivtafel',text:'Die schweren Regale laufen auf Rollen. Stell dich davor und schiebe mit A. Der Rückstellhebel am Eingang ordnet nur die Möbel neu; eingepackte Dokumente bleiben im Journal.'});
  }
  return room;
}

/** Baut die teilentleerte Süßwasser-Staukammer mit sicherem Wartungsumlauf. */
export function createSourceCave() {
  const layout=[];
  for (let y=0;y<16;y++) {
    let row='';
    for (let x=0;x<22;x++) {
      const floor=x>=2 && x<=19 && y>=3 && y<=14;
      const pool=(x>=8 && x<=16 && y>=6 && y<=10)||(x>=14 && x<=16 && y===5);
      row+=pool?'w':floor?'.':'#';
    }
    layout.push(row);
  }
  const objects=[prop('return','Höhlenausgang',3,14,'cave-exit','travel',{to:'village',spawn:[15,2]}),prop('source-gate','Altes Fluttor',14,2,'source-gate','mara-source',{w:3,h:2}),prop('source-sign','Pegelplatte',5,2,'cave-plaque','inspect',{w:2,h:2,text:'Alte Staukammer des Mühlkanals. Die dunkle Linie zeigt den früheren Wasserstand. Heute ist das Becken teilweise abgelassen. Auf dem trockenen Wartungsweg gelangt man zum Fluttor. Das Tor sitzt in der nördlichen Staumauer.'}),prop('source-winch','Handwinde',18,4,'cave-winch','source-mechanism',{w:2,text:'Eine rostige Handwinde ist fest an der Mauer verankert. Kette und Führung führen zum Fluttor. Zuerst Zulauf schließen, dann Ablauf öffnen, zuletzt die Handwinde lösen. Mara muss zuvor die frischen Spuren prüfen.'})];
  objects.push(prop('source-inlet','Zulauf',6,4,'valve','source-mechanism'),prop('source-outlet','Ablauf',6,11,'valve','source-mechanism'),prop('lower-stairs','Treppe ins Quellgewölbe',12,9,'dungeon-stairs-down','dungeon-door',{to:'quell-entry',spawn:[3,8],revealedBy:'sourceDrained'}));
  return {id:'mara-cave',title:'Alte Staukammer',width:22,height:16,spawn:[3,13],music:'maras-quellplan',revision:2,layout,cavern:true,objects};
}
