import { shapeDungeon } from './dungeon-layouts.js';
import { furnishDungeon } from './dungeon-furniture.js';
import { prop } from './town.js';

export const QUELL_DUNGEON='quellgewoelbe';
export const DUNGEON_MESSAGE={id:'mara-lower-message',title:'Unter Maras Zeichen',text:'Unter den Spinnweben liegt eine Nachricht: "Den Ostpass nicht über die Straße erreichen. Der untere Wasserweg führt hinter die Sperre." Darunter steht Maras Kartografenzeichen. Die Tinte ist frisch. Zeige Mara den Fund im Gildenarchiv.'};

/** Baut fünf verbundene Gewölbe mit einem sicheren Einstieg und einem gesonderten Wellenraum. */
export function createQuellDungeon() {
  const rooms=[entry(),gallery(),sluice(),refuge(),nest()];
  for (const room of rooms) { shapeDungeon(room); furnishDungeon(room); }
  return rooms;
}

/** Legt Metadaten und Inhalte fest; die Raumkontur folgt zentral anhand des Raumstils. @param {string} id Raumkennung. @param {string} title Titel. @param {number} width Breite. @param {number} height Höhe. @param {object[]} objects Einrichtung. @param {object[]} enemies Gegner. */
function room(id,title,width,height,objects,enemies=[]) {
  return {id,title,width,height,spawn:[2,6],layout:[],objects,enemies,dungeon:QUELL_DUNGEON,revision:3,music:'quellgewoelbe'};
}

/** Verbindet tatsächliche Wanddurchgänge mit frei liegenden Ankunftsfeldern. @param {string} id Kennung. @param {number} x Spalte. @param {number} y Zeile. @param {string} to Zielraum. @param {number[]} spawn Ankunft. */
function door(id,x,y,to,spawn) { return prop(id,'Gewölbegang',x,y,'dungeon-passage','dungeon-door',{to,spawn}); }

/** Führt Angriff und Rückzug ohne sofortigen Gegnerkontakt ein. */
function entry() {
  const result=room('quell-entry','Unteres Quellgewölbe',14,12,[door('return',2,9,'mara-cave',[12,10]),door('east',12,6,'quell-gallery',[2,6]),prop('warning','Alte Wachtafel',5,2,'cave-plaque','inspect',{text:'Hier nisten Käfer, Schlangen und Spinnen. A schlägt in Blickrichtung, B öffnet den Rucksack und pausiert. Drei Herzen schützen dich. Neue Beute ist erst sicher, wenn du den Dungeon lebend verlässt. Bei einer Niederlage bleibt ein Beutel zurück: genau eine Rückholchance.'})],[enemy('entry-beetle','beetle',10,3)]);
  result.style='vestibule'; result.objects[0].kind='dungeon-stairs-up'; return result;
}

/** Verteilt die ersten Gegner mit Abstand zum Einstieg und einer optionalen Beutetruhe. */
function gallery() {
  const result=room('quell-gallery','Die feuchte Galerie',16,12,[door('west',1,6,'quell-entry',[11,6]),door('east',14,6,'quell-sluice',[2,6]),prop('cache','Alte Vorratstruhe',12,3,'chest','chest',{coins:3})],[enemy('beetle-a','beetle',7,3),enemy('beetle-b','beetle',11,8),enemy('snake-a','snake',12,7)]);
  result.style='gallery';
  return result;
}

/** Trennt das Schieberätsel durch eine echte Wand mit verriegeltem Durchlass. */
function sluice() {
  const result=room('quell-sluice','Die Gegengewichtskammer',14,12,[door('west',1,6,'quell-gallery',[13,6]),door('east',12,6,'quell-refuge',[2,6]),prop('grate','Fallgitter',8,6,'dungeon-grate','inspect',{hiddenBy:'quellGateOpen',text:'Das Gegengewicht muss auf die helle Druckplatte. Der Hebel am Eingang setzt die Kiste zurück.'}),prop('plate','Druckplatte',6,5,'dungeon-plate','inspect',{passable:true,text:'Eine eingelassene Druckplatte. Eine schwere Kiste würde sie unten halten.'}),prop('reset','Rückstellhebel',2,3,'lever','reset')],[enemy('sluice-beetle','beetle',11,3),enemy('sluice-snake','snake',11,8)]);
  result.style='mechanism'; result.blocks=[prop('weight','Gegengewicht',4,5,'crate','push',{w:1,h:1})]; return result;
}

/** Bietet vor dem angekündigten Nest eine kleine Vorbereitungsmöglichkeit. */
function refuge() {
  const result=room('quell-refuge','Der alte Wachposten',14,12,[door('west',1,6,'quell-sluice',[11,6]),door('east',12,6,'quell-nest',[2,10]),prop('aid','Verbandskiste',4,4,'chest','chest',{item:'Feldverband'}),prop('nest-warning','Verwebte Tafel',8,2,'cave-plaque','inspect',{text:'Im nächsten Raum liegt ein Spinnennest. Untersuche erst das Gespinst in der Mitte, wenn du bereit bist. Danach versperren die Spinnen den Rückweg. Drei Wellen bewachen eine alte Waffentruhe. Ein Feldverband heilt vier Lebenspunkte.'})],[enemy('watch-spider','spider',9,4),enemy('watch-beetle','beetle',9,8)]);
  result.style='guardpost'; return result;
}

/** Hält den Wellenbeginn bewusst bei A und gibt die Schwerttruhe erst nach dem letzten Gegner frei. */
function nest() {
  const result=room('quell-nest','Die Spinnenbrut',16,14,[door('west',2,10,'quell-refuge',[11,6]),prop('nest','Dichtes Gespinst',8,6,'dungeon-nest','start-nest',{hiddenBy:'quellNestCleared'}),prop('reward','Bewachte Waffentruhe',11,3,'chest','dungeon-reward',{revealedBy:'quellNestCleared',item:'Rostiges Schwert',coins:8}),{...door('shortcut',3,3,'mara-cave',[12,10]),name:'Wartungstreppe',revealedBy:'quellNestCleared'}]);
  result.boss=true; result.style='nest'; result.enemies=[enemy('nest-scout-a','spider',5,3),enemy('nest-scout-b','spider',12,8)]; result.objects[3].kind='dungeon-stairs-up'; return result;
}

/** Legt echte Awakening-Gegner mit unveränderten kleinen Grundflächen fest. @param {string} id Kennung. @param {string} species Art. @param {number} x Spalte. @param {number} y Zeile. */
export function enemy(id,species,x,y) { return {id,species,x,y,hp:species==='beetle'?3:2,maxHp:species==='beetle'?3:2,facing:'down',wait:0.8,windup:0,hurt:0}; }

