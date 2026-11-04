import { prop } from './town.js';

export const MEADOW_BIRDS=[
  {x:7,y:7,side:-1},{x:9,y:5,side:1},{x:18,y:8,side:-1},
  {x:26,y:9,side:1},{x:30,y:8,side:1},{x:19,y:15,side:-1},
];

/** Verteilt Tiere entlang kurzer Routen zwischen Ufer, Baumsaum und Gras. */
export function meadowWildlife() {
  return [
    animal('frog-a','Wiesenfrosch','frog',13,11,'Der Frosch zieht winzige Kreise auf dem Wasser.',{spriteSet:'awakening',passable:true,walkThrough:true}),
    animal('frog-b','Teichfrosch','frog',10,16,'Am feuchten Rand sitzt ein kleiner Frosch.',{spriteSet:'awakening',passable:true,walkThrough:true}),
    animal('frog-c','Seefrosch','frog',26,8,'Der Frosch taucht zwischen den Halmen auf.',{spriteSet:'awakening',passable:true,walkThrough:true,habitat:'water-edge'}),
    animal('meadow-hedgehog','Igel','hedgehog',6,15,'Zwischen den Halmen raschelt ein kleiner Igel.'),
    animal('meadow-mouse','Feldmaus','mouse',17,15,'Eine Feldmaus sammelt Samen.'),
    animal('meadow-squirrel','Eichhörnchen','squirrel',4,3,'Vom Baum herab sucht es nach Samen.'),
    animal('deer-stag','Hirsch','deer',28,17,'Der Hirsch hebt kurz den Kopf und grast weiter.',{stag:true}),
    animal('deer-doe-a','Reh','deer',27,19,'Das Reh zupft junge Halme.'),
    animal('deer-doe-b','Reh','deer',30,19,'Mit einem Ohr lauscht es über die Wiese.'),
  ];
}

/** Setzt eine kleine, zusammenhängende Route auf vier Rasterfelder. @param {string} id Kennung. @param {string} name Name. @param {string} species Tierart. @param {number} x Spalte. @param {number} y Zeile. @param {string} text Beobachtung. @param {object} extra Zusätzliche Eigenschaften. */
function animal(id,name,species,x,y,text,extra={}) {
  return prop(id,name,x,y,'wildlife','inspect',{animal:species,route:[[x,y],[x+1,y],[x+1,y+1],[x,y+1]],text,...extra});
}

/** Setzt Felsen als Hindernisse und kleinere Steine in die Wasserfläche. */
export function meadowRocks() {
  return [
    rock(6,12,0),rock(16,12,1),rock(4,19,2),rock(24,16,3),rock(31,12,0),rock(14,4,2),
    rock(9,8,0,true),rock(13,14,1,true),{...rock(22,5,2,true),waterArt:'stones'},
    {...rock(28,6,3,true),waterArt:'stones'},{...rock(25,10,0,true),waterArt:'stones'},
    {...rock(25,5,0,true),waterArt:'rock'},
  ];
}

/** Erhält die Begehbarkeit um kleine Steine und sperrt nur große Felsen. @param {number} x Spalte. @param {number} y Zeile. @param {number} shape Silhouette. @param {boolean} small Kleiner Stein. */
function rock(x,y,shape,small=false) {
  return prop(`meadow-rock-${x}-${y}`,'Uferstein',x,y,'meadow-rock','inspect',{shape,small,passable:small,walkThrough:small,text:'Wasser und Wind haben den Stein rund geschliffen.'});
}
