import { openForestPassages } from './forest-passages.js';
import { prop } from './town.js';

export const MEADOW_CHANNEL=[[28,9],[28,10],[29,10],[29,11],[29,12],[30,12],[31,12],[32,12],[33,12]];
export const LOWER_CHANNEL=[[0,12],[1,12],[2,12],[3,12],[4,12],[5,12],[6,12],[7,12],[7,13],[7,14],[7,15]];
export const MEADOW_WEIR=[28,9];
export const MEADOW_BRIDGE=[30,12];

/** Gibt den Ostwiesen zwei reguläre Pfade mit begehbaren Gegenstücken. */
export function meadowPaths() {
  return [
    prop('stream-east','Weg zur Bachniederung',32,9,'trail','travel',{to:'east-lowland',spawn:[2,9],trailFacing:'right',requiresFlag:'eastStreamOpen'}),
    prop('meadow-south','Pfad zur Südwiese',20,22,'trail','travel',{to:'east-south-meadow',spawn:[9,2],trailFacing:'down'}),
  ];
}

/** Legt Wehr, Bedienstein und Hinweise an den tatsächlichen Wasserlauf. */
export function meadowStreamObjects() {
  return [
    prop('stream-weir','Altes Wehr',...MEADOW_WEIR,'meadow-weir','meadow-stream-look',{hint:'prüfen'}),
    prop('stream-stone','Stein am Wehr',26,9,'meadow-lever-stone','meadow-stream-stone',{hint:'untersuchen'}),
    prop('stream-bridge','Schwimmbrücke',...MEADOW_BRIDGE,'meadow-pontoon','meadow-stream-look',{walkThrough:true,hint:'ansehen'}),
    prop('stream-resident','Wiesenhüterin Lene',22,13,'resident','meadow-stream-talk',{appearance:[156,208]}),
  ];
}

/** Schließt den Bach an die nächste Karte an und gibt dem Südpfad ein eigenes kleines Ziel. */
export function meadowNeighbourRooms() { return [southMeadow(),lowland()]; }

/** Baut einen kurzen, frei erreichbaren Abstecher mit einer alten Wegkiste. */
function southMeadow() {
  const note={id:'east-fall-note',title:'Hohler Stein',text:'Unter dem Fall klingt der Fels anders. Hinter dem Vorhang aus Wasser muss Luft sein. Vom See aus ist die Stelle nicht zu erreichen.'};
  const objects=[
    prop('south-return','Zurück zu den Ostwiesen',9,1,'trail','travel',{to:'east-meadow',spawn:[20,21],trailFacing:'up'}),
    prop('south-cache','Verwachsene Wegkiste',13,10,'discovery-chest','search',{discovery:{coins:4,note,text:'Unter dem Deckel steckt eine gefaltete Notiz.'}}),
  ];
  const trees=[[1,1],[4,2,'pine'],[12,2],[15,1],[1,10,'pine'],[4,11],[15,10,'pine']];
  return openForestPassages(outskirts('east-south-meadow','Die Südwiese',14,[9,2],trees,objects));
}

/** Zeigt den weiterfließenden Bach und die Frachtspur am anderen Ufer. */
function lowland() {
  const objects=[
    prop('lowland-return','Zurück zu den Ostwiesen',1,9,'trail','travel',{to:'east-meadow',spawn:[31,9],trailFacing:'left'}),
    prop('lowland-gate','Verschnürtes Weggitter',16,9,'lowland-gate','lowland-gate',{hint:'Seil prüfen',hiddenBy:'eastLowlandGateOpen'}),
    prop('lowland-tracks','Alter Landesteg',13,10,'sign','inspect',{text:'Eine Schleifspur endet an einem losen Tau. Auf dem Holz liegt derselbe helle Staub wie auf den Pfählen der Wiese.'}),
  ];
  const trees=[[2,2],[6,2,'pine'],[12,2],[15,3],[2,14],[14,12,'pine']];
  const room=outskirts('east-lowland','An der Bachniederung',16,[2,9],trees,objects,LOWER_CHANNEL);
  room.meadowChannel={points:LOWER_CHANNEL};
  return openForestPassages(room);
}

/** Baut die anschließenden Landschaftsausschnitte mit der vorhandenen Wiesenpalette. @param {string} id Kennung. @param {string} title Ortsname. @param {number} height Höhe. @param {number[]} spawn Einstieg. @param {Array} trees Baumstandorte. @param {object[]} objects Requisiten. @param {Array} channel Bachlauf. */
function outskirts(id,title,height,spawn,trees,objects,channel=[]) {
  const width=18,ground=[];
  const gardens=[{x:3,y:5,w:5,h:4,kind:'f'},{x:11,y:5,w:5,h:3,kind:'t'},{x:10,y:9,w:6,h:4,kind:'t'}];
  if (channel.length) gardens.push(
    {x:2,y:10,w:4,h:2,kind:'f'},{x:1,y:13,w:5,h:3,kind:'t'},
    {x:8,y:11,w:4,h:3,kind:'t'},{x:8,y:13,w:3,h:3,kind:'f'},
  );
  for (let y=0;y<height;y++) {
    let row='';
    for (let x=0;x<width;x++) row+=outskirtsCell(x,y,id,gardens,channel);
    ground.push(row);
  }
  return {id,title,width,height,ground,spawn,trees,gardens,objects,villageLandscape:true,buildings:[],birds:[],music:'east-meadow-day'};
}

/** Legt zusammenhängende Grasflächen und Fußwege zwischen den Zugängen. @param {number} x Spalte. @param {number} y Zeile. @param {string} id Gebiet. @param {object[]} gardens Wiesenflächen. @param {Array} channel Bachlauf. */
function outskirtsCell(x,y,id,gardens,channel) {
  for (const [cx,cy] of channel) if (x===cx && y===cy) return 'k';
  if (id==='east-lowland' && x===16 && y!==9) return 'r';
  if (id==='east-lowland' && y===9 || id==='east-south-meadow' && (x===9 && y<=7 || y===7 && x>=9 && x<=11)) return '.';
  for (const g of gardens) if (((x-g.x+0.5)/g.w-0.5)**2+((y-g.y+0.5)/g.h-0.5)**2<0.23) return g.kind;
  return 'g';
}
