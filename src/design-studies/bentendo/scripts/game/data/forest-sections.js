import { openForestPassages } from './forest-passages.js';
import { prop } from './town.js';

/** Baut einen Waldabschnitt aus zusammenhängenden Pfaden und geschlossenen Baumgruppen. @param {object} plan Abschnittsplan. */
function section(plan) {
  const ground=[],trees=[],seen=new Set();
  for (let y=0;y<plan.height;y++) {
    let row='';
    for (let x=0;x<plan.width;x++) row+=groundAt(plan,x,y);
    ground.push(row);
  }
  for (let x=0;x<plan.width;x+=2) { addTree(trees,seen,x,0); addTree(trees,seen,x,plan.height-2); }
  for (let y=2;y<plan.height-2;y+=2) { addTree(trees,seen,0,y); addTree(trees,seen,plan.width-2,y); }
  for (const grove of plan.groves) for (let y=grove.y;y<grove.y+grove.h;y+=2) for (let x=grove.x;x<grove.x+grove.w;x+=2) addTree(trees,seen,x,y);
  return openForestPassages({...plan,villageLandscape:true,ground,trees,buildings:[],birds:[],music:'forest-canopy',spawn:plan.spawn || [3,10]});
}

/** Vermeidet doppelte Baumstandorte und mischt runde und spitze Kronen sparsam. @param {Array} trees Bäume. @param {Set} seen Belegte Standorte. @param {number} x Spalte. @param {number} y Zeile. */
function addTree(trees,seen,x,y) {
  const key=`${x},${y}`;
  if (seen.has(key)) return;
  seen.add(key); trees.push((x+y)%6===0?[x,y,'pine']:[x,y]);
}

/** Hält Wege, Pflanzflächen und die zugänglichen Baumränder im gemeinsamen Geländeraster. @param {object} plan Abschnitt. @param {number} x Spalte. @param {number} y Zeile. */
function groundAt(plan,x,y) {
  for (const path of plan.paths) if (inside(path,x,y)) return '.';
  for (const garden of plan.gardens) if (inside(garden,x,y)) return garden.kind;
  return 'g';
}

/** Prüft die Rasterfläche eines Beets oder Wegstücks. @param {object} area Fläche. @param {number} x Spalte. @param {number} y Zeile. */
function inside(area,x,y) { return x>=area.x && x<area.x+area.w && y>=area.y && y<area.y+area.h; }

/** Erstellt eine lesbare Wegverbindung samt sicherem Gegenstück. @param {string} id Kennung. @param {string} name Wegname. @param {number} x Spalte. @param {number} y Zeile. @param {string} to Zielraum. @param {number[]} spawn Ankunft. */
function trail(id,name,x,y,to,spawn) { return prop(id,name,x,y,'trail','travel',{to,spawn,hint:'weitergehen'}); }

/** Verbindet Kreuzweg, Farnlabyrinth, Hohle Eiche und Dornenbogen zu einem Rundweg. */
export function createForestSections() {
  const rooms=[crossroads(),ferns(),oak(),thicket()];
  addWildlife(rooms);
  rooms[0].objects.push(prop('forest-traveller','Reisender Tamo',7,10,'resident','east-traveller',{appearance:[0,208],hint:'ansprechen'}));
  rooms[3].objects.push(prop('forest-shortcut','Verkeilte Zweige',18,18,'village-logs','east-shortcut',{w:2,hint:'lösen'}));
  return rooms;
}

/** Verteilt wenige vorhandene Waldtiere außerhalb von Übergängen und Hinweispunkten. @param {object[]} rooms Neue Waldabschnitte. */
function addWildlife(rooms) {
  rooms[0].birds=[{x:16,y:2,treeY:2,facing:'left'}];
  rooms[2].birds=[{x:4,y:13,treeY:13,facing:'right'}];
  rooms[1].objects.push(prop('fern-squirrel','Eichhörnchen',22,11,'wildlife','inspect',{animal:'squirrel',route:[[22,11],[23,11],[23,12],[22,12]],text:'Es huscht durch die Farne. Offenbar kennt es die Abkürzungen besser als du.'}));
  rooms[2].objects.push(prop('oak-squirrel','Eichhörnchen',7,14,'wildlife','inspect',{animal:'squirrel',route:[[7,14],[8,14],[8,15],[7,15]],text:'Unter der alten Eiche ist die nächste Nuss nie weit.'}));
  rooms[3].objects.push(prop('thicket-snake','Schlange',4,6,'wildlife','inspect',{animal:'snake',spriteSet:'awakening',route:[[4,6],[5,6],[5,7],[4,7]],text:'Eine kleine Schlange sonnt sich zwischen den Blättern. Sie lässt dir den Weg frei.'}));
}

/** Verzweigt den alten Forstweg an einem bewachsenen Wegmacherstein nach Norden und Osten. */
function crossroads() {
  return section({id:'east-crossroads',title:'Alter Forstkreuzweg',width:26,height:22,
    paths:[{x:2,y:9,w:22,h:2},{x:11,y:2,w:2,h:9},{x:17,y:10,w:2,h:8}],
    groves:[{x:2,y:2,w:8,h:6},{x:16,y:2,w:8,h:6},{x:2,y:14,w:12,h:6},{x:20,y:14,w:4,h:6}],
    gardens:[{x:3,y:11,w:6,h:2,kind:'h'},{x:15,y:11,w:2,h:8,kind:'t'},{x:19,y:12,w:4,h:2,kind:'f'}],
    objects:[trail('return','Zurück zum Waldsaum',2,10,'east-wood',[20,10]),trail('north','Zwischen den Farnen',11,2,'east-ferns',[11,20]),trail('east','Zur hohlen Eiche',23,10,'east-oak',[3,10]),prop('waystone','Alter Wegstein',14,7,'sign','inspect',{text:'Der Stein ist älter als die Kreide. Unter dem Moos zeigt ein Kerbzeichen nordwärts. Aus dem östlichen Weg hört man einen Specht.'}),prop('dead-end','Verlassene Raststelle',18,18,'village-logs','inspect',{w:2,text:'Ein längst kaltes Lager. Jemand hat kleine Holzspäne zu einem Pfeil gelegt. Hier endet die Spur im Laub.'})]});
}

/** Führt um dichte Baumriegel und verbindet die nördliche Schleife mit dem Dornenbogen. */
function ferns() {
  return section({id:'east-ferns',title:'Das Farnlabyrinth',width:28,height:24,spawn:[11,20],
    paths:[{x:11,y:17,w:2,h:5},{x:5,y:17,w:8,h:2},{x:5,y:9,w:2,h:10},{x:5,y:9,w:17,h:2},{x:20,y:9,w:2,h:7},{x:20,y:14,w:6,h:2}],
    groves:[{x:2,y:2,w:24,h:6},{x:8,y:12,w:10,h:4},{x:14,y:18,w:12,h:4},{x:2,y:12,w:2,h:10}],
    gardens:[{x:8,y:16,w:10,h:1,kind:'h'},{x:7,y:10,w:12,h:2,kind:'t'},{x:22,y:9,w:3,h:4,kind:'f'}],
    objects:[trail('return','Zurück zum Forstkreuzweg',11,21,'east-crossroads',[11,3]),trail('east','Lichter Forstpfad',25,15,'east-thicket',[3,10]),prop('fern-note','Verwitterter Pfahl',19,8,'sign','inspect',{text:'Am Pfahl sitzt dieselbe alte Kerbe wie am Kreuzweg. Wer die feuchten Senken meidet, findet zwischen den Bäumen wieder festeren Boden.'}),prop('fern-cache','Laubversteck',24,11,'discovery-chest','search',{discovery:{coins:3,text:'Unter einer alten Decke liegen drei angelaufene Münzen. Ein vergessener Rastplatz.'}})]});
}

/** Gibt der südlichen Schleife mit einer alten Eiche und einem vergessenen Waldbrief einen eigenen Anker. */
function oak() {
  return section({id:'east-oak',title:'Die hohle Eiche',width:24,height:22,
    paths:[{x:2,y:9,w:10,h:2},{x:10,y:9,w:2,h:9},{x:10,y:16,w:9,h:2},{x:17,y:2,w:2,h:16}],
    groves:[{x:2,y:2,w:14,h:6},{x:20,y:2,w:2,h:16},{x:12,y:10,w:4,h:6},{x:2,y:18,w:14,h:2},{x:4,y:13,w:2,h:2}],
    gardens:[{x:3,y:12,w:6,h:4,kind:'t'},{x:12,y:8,w:4,h:2,kind:'h'},{x:12,y:18,w:7,h:1,kind:'f'}],
    objects:[trail('return','Zurück zum Forstkreuzweg',2,10,'east-crossroads',[22,10]),trail('north','Unter dem Dornenbogen',17,2,'east-thicket',[13,18]),prop('oak-letter','Brief im hohlen Stamm',5,15,'note','note',{persistent:true,note:{id:'forest-oak-letter',title:'Unter der alten Eiche',text:'Wenn der Weg verloren scheint, halte dich an die alten Kerben. Die Kreide wäscht der nächste Regen fort. Was wir in die Pfähle schnitten, blieb. Hinter dem Dornenbogen liegt unser ältestes Tor. — Aus einem Brief der Wegmacher'}})]});
}

/** Schließt beide Schleifen zusammen und lässt den Pfad um einen dichten Dornenwald zur Pforte führen. */
function thicket() {
  return section({id:'east-thicket',title:'Der Dornenbogen',width:26,height:22,
    paths:[{x:2,y:9,w:8,h:2},{x:8,y:5,w:2,h:6},{x:8,y:5,w:10,h:2},{x:16,y:5,w:2,h:14},{x:16,y:9,w:8,h:2},{x:12,y:17,w:6,h:2},{x:12,y:17,w:2,h:3}],
    groves:[{x:2,y:2,w:20,h:2},{x:10,y:8,w:6,h:8},{x:2,y:12,w:8,h:8},{x:20,y:12,w:4,h:8}],
    gardens:[{x:3,y:5,w:5,h:3,kind:'h'},{x:18,y:5,w:5,h:3,kind:'t'},{x:10,y:16,w:6,h:1,kind:'f'}],
    objects:[trail('return','Zurück zu den Farnen',2,10,'east-ferns',[24,15]),trail('south','Zur hohlen Eiche',13,19,'east-oak',[17,3]),trail('east','Zur Wurzelpforte',23,10,'east-clearing',[3,10]),prop('bark','Abgeschabte Rinde',19,8,'sign','inspect',{text:'An den trockenen Zweigen fehlt frische Rinde. Tiefe Rillen im Boden ziehen weiter nach Osten. Hier wurde nichts zum Bach getragen.'})]});
}
