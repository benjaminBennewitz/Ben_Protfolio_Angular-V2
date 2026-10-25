import { prop } from './town.js';

export const FURNITURE_ART={
  vase:{sheet:'dungeon',source:[64,0,16,16],w:1,h:1},
  'vase-small':{sheet:'dungeon',source:[0,416,16,16],w:1,h:1},
  bed:{sheet:'cottage',source:[64,96,24,32],w:2,h:2},
  table:{sheet:'cottage',source:[8,64,32,16],w:2,h:1},
  desk:{sheet:'cottage',source:[8,64,32,16],w:2,h:1},
  chair:{sheet:'cottage',source:[64,80,16,16],w:1,h:1},
  sideboard:{sheet:'cottage',source:[104,80,16,16],w:1,h:1},
  counter:{w:1,h:1},
  workbench:{sheet:'cottage',source:[8,64,32,16],w:2,h:1},
  tools:{sheet:'tool',source:[0,0,16,16],w:1,h:1},
  'bottle-shelf':{source:[0,40,16,32],w:1,h:2},
  cupboard:{source:[48,48,16,24],w:1,h:2},
  dresser:{source:[0,40,16,32],w:1,h:2},
  hearth:{source:[0,16,32,24],w:2,h:2},
  chest:{source:[0,80,16,16],w:1,h:1},
  barrel:{sheet:'barrel',source:[0,0,16,16],w:1,h:1},
  bookcase:{w:1,h:2},
};

/** Erstellt ein geprüftes Möbelbild mit passender Grundfläche. @param {string} id Kennung. @param {string} name Gegenstandsname. @param {number} x Spalte. @param {number} y Zeile. @param {string} art Bildtyp. @param {string} text Untersuchungstext. */
export function furniture(id,name,x,y,art,text) {
  const {w,h}=FURNITURE_ART[art];
  return prop(id,name,x,y,'interior-prop','inspect',{art,w,h,text,detail:art==='desk'?'book':null});
}
