import { prop } from './town.js';

export const AWAKENING_ANIMALS={
  frog:{frames:[[128,0],[128,16]],walking:[[144,0],[144,16]]},
  snake:{frames:[[528,0],[528,16]]},
  bird:{frames:[[592,0],[608,0],[608,16]]},
};

/** Belebt die Ufer und Buschgruppen mit den bereits vorhandenen Awakening-Tieren. */
export function createRiverWildlife() {
  return [
    animal('frog-north','Frosch',16,5,'frog',[[16,5],[17,5],[17,6],[16,6]],'Er sitzt zwischen den Uferhalmen und springt gelegentlich ins Wasser.'),
    animal('frog-fisher','Frosch',19,18,'frog',[[19,18],[18,18],[18,19],[19,19]],'Ein zufriedenes Quaken vom Ufer. Der Anglerin scheint das Publikum zu gefallen.'),
    animal('frog-south','Frosch',16,24,'frog',[[16,24],[17,24],[17,25],[16,25]],'Ein kleiner Frosch pendelt zwischen Wasser und Ufergras.'),
    animal('snake-north','Schlange',24,5,'snake',[[24,5],[23,5],[23,6],[24,6]],'Sie schlängelt sich ruhig durchs Strauchwerk und lässt dich vorüber.'),
    animal('snake-south','Schlange',14,18,'snake',[[14,18],[15,18],[15,17],[14,17]],'Ein leises Rascheln zwischen den Blättern. Sie sucht offenbar nur ein sonniges Plätzchen.'),
  ];
}

/** Kennzeichnet amphibische Routen ausdrücklich, ohne die Spielerkollision zu verändern. @param {string} id Kennung. @param {string} name Tiername. @param {number} x Start-X. @param {number} y Start-Y. @param {string} species Tierart. @param {number[][]} route Route. @param {string} text Dialog. */
function animal(id,name,x,y,species,route,text) {
  return prop(id,name,x,y,'wildlife','inspect',{animal:species,spriteSet:'awakening',habitat:species==='frog'?'water-edge':'land',route,text});
}

/** Setzt zwei kleine Vögel in Baumkronen, unabhängig von begehbaren Kollisionsfeldern. */
export function createPerchedBirds() {
  return [{x:6,y:2,treeY:2,facing:'left'},{x:28,y:28,treeY:28,facing:'right'}];
}
