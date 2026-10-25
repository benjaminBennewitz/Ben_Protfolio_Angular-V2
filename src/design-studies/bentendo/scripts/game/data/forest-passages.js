/** Öffnet Waldpfade bis zum Kartenrand und entfernt überhängende Kronen. @param {object} room Waldraum. */
export function openForestPassages(room) {
  for (const exit of room.objects.filter(isTrail)) {
    exit.walkThrough=true;
    const area=passageArea(room,exit);
    room.trees=room.trees.filter(/** Prüft den freien Kronenraum. @param {Array} tree Baum. */ tree=>!overlapsPassage(tree,area));
    for (let y=area.y;y<area.y+area.h;y++) {
      const row=room.ground[y].split('');
      for (let x=area.x;x<area.x+area.w;x++) row[x]='.';
      room.ground[y]=row.join('');
    }
  }
  return room;
}

/** Erkennt ausschließlich begehbare Waldübergänge. @param {object} object Raumobjekt. */
function isTrail(object) { return object.kind==='trail' && object.action==='travel'; }

/** Öffnet am nächsten Rand einen dreifeldrigen Durchlass mit Anschluss an den bestehenden Pfad. @param {object} room Waldraum. @param {object} exit Übergang. */
export function passageArea(room,exit) {
  const distances=[exit.x,room.width-1-exit.x,exit.y,room.height-1-exit.y];
  const side=distances.indexOf(Math.min(...distances));
  if (side===0) return {x:0,y:exit.y-1,w:exit.x+1,h:3};
  if (side===1) return {x:exit.x,y:exit.y-1,w:room.width-exit.x,h:3};
  if (side===2) return {x:exit.x-1,y:0,w:3,h:exit.y+1};
  return {x:exit.x-1,y:exit.y,w:3,h:room.height-exit.y};
}

/** Prüft die vollständige zweifeldrige Baumkrone gegen die Wegöffnung. @param {Array} tree Baumstandort. @param {object} area Durchlass. */
function overlapsPassage(tree,area) {
  return tree[0]<area.x+area.w && tree[0]+2>area.x && tree[1]<area.y+area.h && tree[1]+2>area.y;
}
