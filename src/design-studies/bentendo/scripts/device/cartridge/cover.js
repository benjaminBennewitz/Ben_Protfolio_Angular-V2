import * as THREE from 'three';
import { ASSETS } from '../../core/config.js';

/** Hält beide Modulcover für die Lebensdauer des Geräts vor. */
export class CartridgeCover {
  /** Übernimmt das ursprüngliche Cover als Standard. @param {THREE.Group} root Modulmodell. */
  constructor(root) {
    this.label=root.getObjectByName('CARTRIDGE_LABEL'); this.selection='male';
    this.original=this.label?.material.map; this.female=null;
  }
  /** Wechselt erst beim nächsten Gerätebeginn zur gespeicherten Heldenwahl. @param {string} avatar Gespeicherte Figur. */
  async select(avatar) {
    if (!this.label) return false;
    const selection=avatar==='female'?'female':'male'; this.selection=selection;
    try {
      const texture=selection==='female'?await this.loadFemale():this.original;
      if (this.selection!==selection) return false;
      this.label.material.map=texture; this.label.material.needsUpdate=true; return true;
    } catch { this.female=null; return false; }
  }
  /** Lädt die Heldin einmalig und behält die Farbverwaltung des Originalcovers bei. */
  loadFemale() {
    if (!this.female) this.female=new THREE.TextureLoader().loadAsync(ASSETS.coverFemale).then(prepareTexture);
    return this.female;
  }
}

/** Stimmt Farbraum und Filterung mit dem ursprünglichen Etikett ab. @param {THREE.Texture} texture Geladenes Cover. */
function prepareTexture(texture) {
  texture.colorSpace=THREE.SRGBColorSpace; texture.anisotropy=4; return texture;
}

/** Initialisiert die Coversteuerung auch bei einem noch älteren Modulcontroller. @param {object} cartridge Geladenes Modul. @param {string} avatar Gespeicherte Figur. */
export function selectCartridgeCover(cartridge,avatar) {
  if (!cartridge.cover) cartridge.cover=new CartridgeCover(cartridge.model);
  return cartridge.cover.select(avatar);
}
