import { openForestPassages } from './forest-passages.js';
import { createForestSections } from './forest-sections.js';
import { prop } from './town.js';
import { furniture as f } from './house-furniture.js';
import { houseGeometry } from './house-shapes.js';

export const EAST_CLUES={
  ribbon:{id:'east-ribbon',title:'Ein grauer Faden',text:'An einem Dornenzweig hängt grauer Stoff. Er riecht nach Lampenöl. Die Kreide am Stamm wurde über ältere Flechten gerieben; das Zeichen ist frisch.'},
  tracks:{id:'east-tracks',title:'Spuren gegen den Pfeil',text:'Der Kreidepfeil zeigt zum Bach. Tiefe Stiefelabdrücke führen dagegen nach Norden. Jemand zog eine schwere Kiste über den trockenen Pfad. Zurück führen keine Schleifspuren.'},
  threshold:{id:'east-threshold',title:'Das Zeichen unter der Rinde',text:'Über einer alten Steintür liegen lebende Wurzeln. Unter abgeschnittener Rinde sitzt ein eingeritztes Zeichen: drei Kerben, eine davon durchgestrichen. Im Mörtel steckt derselbe graue Stoff wie am Waldsaum. Hinter der Tür klingt Metall gegen Stein.'},
};

/** Erstellt eine kleine Werkstation mit begehbaren Wartungskanälen und sichtbarer Torhydraulik. */
function pumpRoom() {
  const objects=[prop('return','Zurück nach Bruchstein',6,10,'door','travel',{to:'village',spawn:[29,11]}),f('tools','Werkzeugschrank',2,1,'cupboard','Die Fächer für Dichtungen sind leer. Auf dem Holz steht das Zeichen der Dorfwerkstatt.'),f('worktop','Wartungstisch',8,1,'workbench','Ein altes Rohrstück liegt neben einer Schablone.'),prop('pump-plaque','Wartungsplatte',2,3,'sign','east-pump-sign'),prop('pump-start','Druckhebel',10,6,'lever','east-pump-start'),prop('pipe-reset','Rückstellrad',2,7,'valve','east-pipe-reset'),prop('pump-source','Zulauf',3,3,'east-cylinder','inspect',{text:'Wasser aus dem Mühlkanal strömt unter dem Steinboden zum linken Anschluss.'}),prop('pressure-cylinder','Druckkolben',7,5,'east-cylinder','inspect',{w:3,text:'Die Kolbenstange führt zum Passriegel. Erst eine dichte Leitung baut genügend Druck auf.'})];
  for (let i=0;i<9;i++) objects.push(prop(`pipe-${i}`,'Rohrstück',4+i%3,3+Math.floor(i/3),'east-pipe','east-pipe',{index:i,walkThrough:true,hint:'drehen'}));
  return {id:'east-pump',title:'Ostpass-Werkstation',...houseGeometry('workshop'),style:'stone',furnished:true,rugs:[],music:'maras-quellplan',villageEntrance:[30,11],pipeBoard:{x:4,y:3},objects};
}

/** Baut einen bewachsenen Weg mit abgerundeten Pflanzflächen und offenen Laufkorridoren. @param {string} id Raumkennung. @param {string} title Ortsname. @param {number} width Breite. @param {number} height Höhe. @param {object[]} gardens Pflanzenflächen. @param {object[]} objects Begegnungen und Ausgänge. */
function forestRoom(id,title,width,height,gardens,objects) {
  const ground=[],trees=[];
  for (let y=0;y<height;y++) {
    let row='';
    for (let x=0;x<width;x++) row+=forestGround(x,y,width,height,gardens,id==='east-wood');
    ground.push(row);
  }
  for (let x=0;x<width;x+=2) { trees.push([x,0],[x,height-2]); }
  for (let y=2;y<height-2;y+=2) { trees.push([0,y],[width-2,y,'pine']); }
  trees.push([2,2],[4,2,'pine'],[6,2],[2,4],[4,4],[width-8,2],[width-6,2,'pine'],[width-4,2],[width-6,4],[2,height-6],[4,height-6,'pine'],[6,height-4],[width-6,height-6],[width-4,height-6,'pine']);
  return openForestPassages({id,title,width,height,spawn:[3,10],villageLandscape:true,ground,trees,gardens,buildings:[],birds:[],music:'forest-canopy',objects});
}

/** Hält Wege breit und lässt Bäume und Pflanzen gemeinsame Konturen verwenden. @param {number} x Spalte. @param {number} y Zeile. @param {number} width Breite. @param {number} height Höhe. @param {object[]} gardens Pflanzflächen. @param {boolean} through Durchgehender Ostpfad. */
function forestGround(x,y,width,height,gardens,through) {
  if (!through && x>=9 && x<=14 && y>=2 && y<=4) return 'r';
  if ((y>=9 && y<=10 && x>=2 && x<=(through?width-3:12)) || (x>=11 && x<=12 && y>=3 && y<=(through?height-3:10))) return '.';
  for (const g of gardens) if (x>=g.x && x<g.x+g.w && y>=g.y && y<g.y+g.h) return g.kind;
  return 'g';
}

/** Verbindet Dorf, Waldsaum und die alte Wurzelpforte mit verlässlichen Rückwegen. */
export function createEastRooms() {
  const edge=forestRoom('east-wood','Östlicher Waldsaum',24,20,[{x:3,y:5,w:6,h:3,kind:'t'},{x:15,y:4,w:6,h:4,kind:'h'},{x:5,y:13,w:5,h:3,kind:'f'},{x:14,y:13,w:5,h:3,kind:'t'}],[prop('return','Weg nach Bruchstein',2,10,'trail','travel',{to:'village',spawn:[31,12]}),prop('eda','Waldläuferin Eda',9,11,'resident','east-eda',{appearance:[156,208],route:[[9,11],[10,11],[10,12],[9,12]],text:'Der Wald hört zu.'}),prop('ribbon','Grauer Stoffrest',17,6,'note','east-clue',{clue:'ribbon'}),prop('canteen','Verlorene Feldflasche',6,6,'east-canteen','take',{item:'Feldflasche'}),prop('to-clearing','Alter Forstpfad',21,10,'trail','travel',{to:'east-crossroads',spawn:[3,10]})]);
  const clearing=forestRoom('east-clearing','Die Wurzelpforte',22,18,[{x:4,y:5,w:5,h:3,kind:'h'},{x:14,y:4,w:5,h:4,kind:'t'},{x:4,y:12,w:5,h:3,kind:'t'},{x:14,y:12,w:4,h:3,kind:'f'}],[prop('return','Zurück zum Dornenbogen',2,10,'trail','travel',{to:'east-thicket',spawn:[22,10]}),prop('tracks','Schleifspuren',8,8,'note','east-clue',{clue:'tracks'}),prop('root-door','Verwurzelte Steintür',11,3,'east-root-door','east-clue',{clue:'threshold',w:2,h:2}),prop('cache','Alte Wegkiste',16,13,'discovery-chest','search',{discovery:{coins:4,text:'Zwischen morschen Wegpfählen liegt ein Beutel mit vier Gildenmünzen.'}})]);
  edge.objects.push(prop('old-sign','Alter Forstpfahl',11,3,'sign','inspect',{text:'Dieser Pfahl stand einmal am Forstkreuzweg. Das alte Kerbzeichen ist tiefer als die frische Kreide. Darunter bleibt grauer Staub hängen.'}));
  edge.birds=[{x:6,y:2,treeY:2,facing:'left'}];
  edge.objects.push(prop('rest-bench','Alte Rastbank',7,12,'village-bench','inspect',{w:2,text:'Unter der Lehne steht ein eingeritztes E. Am Holz klebt noch ein grauer Faden.'}));
  edge.objects.push(prop('forest-squirrel','Eichhörnchen',15,15,'wildlife','inspect',{animal:'squirrel',route:[[15,15],[16,15],[16,16],[15,16]],text:'Es versteckt eine Nuss und tut so, als hättest du nichts gesehen.'}));
  return [pumpRoom(),edge,...createForestSections(),clearing];
}
