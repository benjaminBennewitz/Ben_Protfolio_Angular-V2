/** Prüft einen mehrzelligen Fußabdruck. @param {object} object Gegenstand. @param {number} x Spalte. @param {number} y Zeile. */
export function contains(object, x, y) {
  return x >= object.x && x < object.x + (object.w || 1) && y >= object.y && y < object.y + (object.h || 1);
}

/** Prüft das Wasser einschließlich Holzbrücke. @param {object} room Raumdaten. @param {number} x Spalte. @param {number} y Zeile. */
export function water(room, x, y) {
  return room.id === 'city' && x >= 26 && x <= 30 && y >= 8 && y <= 17 && y !== 12 && y !== 13;
}

/** Prüft feste und zustandsabhängige Wände. @param {object} game Spiel. @param {number} x Spalte. @param {number} y Zeile. */
export function wall(game, x, y) {
  const room = game.room;
  if (x < 0 || y < 0 || x >= room.width || y >= room.height) return true;
  if (room.id === 'village' || room.villageLandscape) return villageWall(room,x,y);
  if (room.layout) return room.layout[y]?.[x]!=='.' && !(room.id==='mara-cave' && game.flags.sourceDrained && room.layout[y]?.[x]==='w');
  if (room.id === 'city') return townWall(room, x, y);
  if (x === 0 || y === 0 || x === room.width - 1 || y === room.height - 1) return true;
  if (room.trees) return room.trees.some(treeAt.bind(null, x, y));
  if (room.id === 'hall') return y === 4 && x !== 6;
  if (room.id === 'storage') return x === 7 && (y !== 5 || !game.flags.storageOpen);
  if (room.id === 'steam') return x >= 10 && x <= 12 && y !== 5 && y !== 12;
  if (room.id === 'archive' || room.puzzle==='archive') return archiveWall(x, y);
  return false;
}

/** Vergleicht einen Baumstandort. @param {number} x Spalte. @param {number} y Zeile. @param {number[]} tree Baum. */
function treeAt(x, y, tree) { return tree[0] === x && tree[1] === y; }

/** Prüft die Gebäude- und Naturflächen. @param {object} room Stadtkarte. @param {number} x Spalte. @param {number} y Zeile. */
function townWall(room, x, y) {
  if (water(room, x, y) || room.trees.some(treeAt.bind(null, x, y))) return true;
  for (const house of room.houses) if (contains({ ...house, w:5, h:5 }, x, y)) return true;
  return false;
}

/** Prüft Gelände und Gebäude des neuen Dorfabschnitts. @param {object} room Dorfkarte. @param {number} x Spalte. @param {number} y Zeile. */
function villageWall(room,x,y) {
  if (room.id==='village' && x===room.width-1 && [12,13].includes(y)) return false;
  if (x === 0 || y === 0 || x === room.width-1 || y === room.height-1) return true;
  if (['w','r'].includes(room.ground[y][x])) return true;
  for (const house of room.buildings) if (contains(house,x,y)) return true;
  for (const [tx,ty] of room.trees) if (y === ty+1 && x >= tx && x <= tx+1) return true;
  return false;
}

/** Bewahrt die Engstellen des Regalrätsels. @param {number} x Spalte. @param {number} y Zeile. */
function archiveWall(x, y) {
  return (x === 6 && y !== 10 && y !== 11) || (x === 12 && y !== 5 && y !== 6)
    || (y === 8 && x >= 7 && x <= 11 && x !== 9) || (y === 3 && x >= 13 && x <= 16 && x !== 15);
}

/** Prüft gefährliche Dampfphasen. @param {object} game Spiel. @param {number} x Spalte. @param {number} y Zeile. */
export function steamHot(game, x, y) {
  return game.room.id === 'steam' && !game.flags.steamSafe && x === 11 && [5,12].includes(y) && (game.time + (y === 5 ? 2 : 0)) % 4 < 2.2;
}
