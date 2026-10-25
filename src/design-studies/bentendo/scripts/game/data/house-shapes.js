const UPPER=[{x:1,y:1,w:6,h:5},{x:9,y:1,w:6,h:5},{x:3,y:6,w:2,h:1},{x:11,y:6,w:2,h:1},{x:1,y:7,w:14,h:2},{x:4,y:9,w:8,h:2}];
export const HOUSE_PLANS={
  inn:{areas:[{x:1,y:1,w:16,h:9},{x:1,y:10,w:12,h:3}],walls:[{x:11,y:1,w:1,h:3}],exit:[6,13]},
  'inn-upper':{areas:UPPER,exit:[7,11]},
  guild:{areas:[{x:1,y:1,w:14,h:9},{x:5,y:10,w:6,h:3}],walls:[{x:5,y:1,w:1,h:3}],exit:[7,13]},
  'guild-upper':{areas:UPPER,exit:[7,11]},
  mill:{areas:[{x:8,y:1,w:9,h:5},{x:1,y:6,w:16,h:6}],exit:[8,12]},
  weaver:{areas:[{x:1,y:1,w:14,h:8},{x:6,y:9,w:4,h:2}],exit:[7,11]},
  home:{areas:[{x:1,y:1,w:14,h:8},{x:1,y:9,w:10,h:4}],walls:[{x:7,y:1,w:1,h:4}],exit:[5,13]},
  workshop:{areas:[{x:1,y:1,w:10,h:4},{x:1,y:5,w:13,h:5}],exit:[6,10]},
  market:{areas:[{x:1,y:1,w:15,h:7},{x:1,y:8,w:12,h:4}],exit:[7,12]},
};

/** Erzeugt tatsächliche Raumkonturen aus verbundenen Nutzungsflächen. @param {string} id Hauskennung. */
export function houseGeometry(id) {
  const plan=HOUSE_PLANS[id]; let width=0,height=0;
  for (const area of plan.areas) { width=Math.max(width,area.x+area.w+1); height=Math.max(height,area.y+area.h+1); }
  const cells=[];
  for (let y=0;y<height;y++) cells.push(Array(width).fill(' '));
  for (const area of plan.areas) paint(cells,area,'.');
  enclose(cells,width,height);
  for (const area of plan.walls || []) paint(cells,area,'#');
  const layout=[];
  for (const row of cells) layout.push(row.join(''));
  return {width,height,layout,spawn:[plan.exit[0],plan.exit[1]-1]};
}

/** Füllt einen Grundrissbereich ohne seitliche Render-Sonderfälle. @param {string[][]} cells Raster. @param {object} area Rechteck. @param {string} value Feldtyp. */
function paint(cells,area,value) {
  for (let y=area.y;y<area.y+area.h;y++) for (let x=area.x;x<area.x+area.w;x++) cells[y][x]=value;
}

/** Schließt ausschließlich die realen Außenkonturen mit Wänden ab. @param {string[][]} cells Raster. @param {number} width Breite. @param {number} height Höhe. */
function enclose(cells,width,height) {
  for (let y=0;y<height;y++) for (let x=0;x<width;x++) {
    if (cells[y][x]!== ' ') continue;
    for (const [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0],[-1,-1],[1,-1],[-1,1],[1,1]]) if (cells[y+dy]?.[x+dx]==='.') { cells[y][x]='#'; break; }
  }
}
