import { MOVE_DIRECTIONS } from '../game/systems/player-movement.js';
const BUTTONS={interact:'BUTTON_A',back:'BUTTON_B',start:'BUTTON_START',select:'BUTTON_SELECT',dpad:'DPAD'};

/** Erkennt Knöpfe auch über ihre getroffenen Kindmeshes. @param {object} object Getroffenes Modellteil. */
export function buttonAction(object) {
  while (object) {
    for (const [action,name] of Object.entries(BUTTONS)) if (object.name===name || (action==='dpad' && object.name.startsWith('Dpad_'))) return action;
    object=object.parent;
  }
  return null;
}

/** Animiert ausschließlich die Originaltransformationen der Knöpfe und des Steuerkreuzes. */
export class ButtonMotion {
  /** Merkt Ausgangswerte ohne Modellgeometrie zu verändern. @param {object} root Modellwurzel. */
  constructor(root) {
    this.parts=new Map(); this.held=null;
    for (const [key,name] of Object.entries(BUTTONS)) {
      const node=root.getObjectByName(name);
      if (node) this.parts.set(key,{node,z:node.position.z,x:node.rotation.x,y:node.rotation.y,value:0,pulse:0,direction:'up'});
    }
  }
  /** Zeigt einen kurzen Druck über jede Eingabeart. @param {string} action Taste. */
  pulse(action) { const part=this.parts.get(action); if (part) part.pulse=0.12; }
  /** Hält eine Modell- oder Richtungstaste bis zur Freigabe gedrückt. @param {string} action Taste. @param {string} direction Optionale Steuerkreuzrichtung. */
  hold(action,direction) { this.held=action; if (direction && this.parts.has('dpad')) this.parts.get('dpad').direction=direction; }
  /** Verbindet das Steuerkreuz mit der tatsächlich gewählten Bewegungsrichtung. @param {string} direction Richtung. @param {boolean} held Gehaltene Eingabe. */
  direction(direction,held) {
    const part=this.parts.get('dpad'); if (!part) return;
    part.direction=direction; if (held) this.hold('dpad',direction); else this.pulse('dpad');
  }
  /** Verhindert klemmende Tasten nach Loslassen, Fokusverlust und abgebrochener Geste. */
  release() { this.held=null; }
  /** Federt von den gespeicherten Ausgangswerten statt Positionsänderungen aufzusummieren. @param {number} dt Zeitschritt. @param {boolean} reduced Reduzierte Bewegung. */
  update(dt,reduced) {
    let moving=false;
    for (const [key,part] of this.parts) {
      part.pulse=Math.max(0,part.pulse-dt);
      const target=this.held===key || part.pulse>0?1:0;
      part.value=reduced?target:part.value+(target-part.value)*(1-Math.exp(-dt*35));
      if (Math.abs(part.value-target)<0.001) part.value=target;
      part.node.position.z=part.z-part.value*(key==='dpad'?0.00035:key==='start'||key==='select'?0.0007:0.0012);
      if (key==='dpad') {
        const [dx,dy]=MOVE_DIRECTIONS[part.direction]; part.node.rotation.x=part.x+dy*0.035*part.value; part.node.rotation.y=part.y+dx*0.035*part.value;
      }
      moving ||= part.value!==target || part.pulse>0;
    }
    return moving;
  }
}
