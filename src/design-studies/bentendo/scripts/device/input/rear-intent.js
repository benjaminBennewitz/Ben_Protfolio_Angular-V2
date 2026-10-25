import { insideRect } from '../../core/geometry.js';

/** Trennt einen alten Aktivierungspunkt von einer bewussten neuen Mausbewegung. */
export class RearIntent {
  /** Bereitet die Hover-Erkennung vor. */
  constructor() { this.origin=null; this.armed=false; }
  /** Beginnt eine neue Rückansicht ohne unbeabsichtigten Sofortausstieg. @param {object} origin Aktivierungspunkt. */
  reset(origin) { this.origin=origin?{...origin}:null; this.armed=false; }
  /** Erkennt Gehäuse, Bedienfeld und den sicheren Verbindungsbereich. @param {object} point Zeiger. @param {object} body Gehäusegrenzen. @param {object} panel Bedienfeldgrenzen. */
  overInteraction(point,body,panel) {
    if (insideRect(body,point,8) || insideRect(panel,point,8)) return true;
    const bridge={left:body.right,right:panel.left,top:panel.top-64,bottom:panel.bottom+8};
    return bridge.right>=bridge.left && insideRect(bridge,point);
  }
  /** Erlaubt den Ausstieg erst nach Eintritt oder einer deutlichen Bewegung. @param {object} point Zeiger. @param {object} body Gehäusegrenzen. @param {object} panel Bedienfeldgrenzen. */
  mayLeave(point,body,panel) {
    if (this.overInteraction(point,body,panel)) { this.armed=true; return false; }
    if (this.armed) return true;
    return Boolean(this.origin && Math.hypot(point.x-this.origin.x,point.y-this.origin.y)>=120);
  }
}
