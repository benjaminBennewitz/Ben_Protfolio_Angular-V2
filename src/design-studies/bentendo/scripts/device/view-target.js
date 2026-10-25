import { VIEWS } from '../core/config.js';

/** Zeigt auf kompakten Geräten in der Frontansicht das ganze Gehäuse mit Sicherheitsabstand. @param {object} device Gerät. */
export function sceneTarget(device) {
  const target=VIEWS[device.view],bounds=device.refs?.bounds;
  if (device.view!=='front' || !device.compact?.matches || !bounds) return target;
  return {...target,center:(bounds.min.y+bounds.max.y)/2,span:(bounds.max.y-bounds.min.y)*1.16,width:(bounds.max.x-bounds.min.x)*1.14};
}
