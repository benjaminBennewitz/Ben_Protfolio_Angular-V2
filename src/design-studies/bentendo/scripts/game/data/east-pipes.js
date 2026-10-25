export const PIPE_START=[1,2,0,1,0,1,3,0,2];
export const PIPE_TYPES=['straight','elbow','elbow','elbow','elbow','elbow','straight','elbow','elbow'];
const PORTS={straight:[1,3],elbow:[0,1]};
export const PIPE_STEPS=[[0,-1],[1,0],[0,1],[-1,0]];

/** Liefert die beiden sichtbaren Öffnungen eines drehbaren Rohrstücks. @param {object} flags Dauerhafte Questwerte. @param {number} index Rohrindex. */
export function pipePorts(flags,index) {
  const turn=flags[`eastPipe${index}`] ?? PIPE_START[index];
  return PORTS[PIPE_TYPES[index]].map(rotatePort.bind(null,turn));
}

/** Dreht einen Anschluss im Uhrzeigersinn. @param {number} turn Vierteldrehungen. @param {number} port Öffnung. */
function rotatePort(turn,port) { return (port+turn)%4; }

/** Verfolgt nur dicht verbundene Rohre ab dem linken Zulauf; offene Enden verlieren Druck. @param {object} flags Questwerte. */
export function pipeFlow(flags) {
  const wet=new Set(),queue=pipePorts(flags,0).includes(3)?[0]:[]; let leak=false,outlet=false;
  while (queue.length) {
    const i=queue.shift(); if (wet.has(i)) continue;
    wet.add(i);
    if (i===4 && !flags.eastPipeRepaired) { leak=true; continue; }
    for (const port of pipePorts(flags,i)) {
      if (i===0 && port===3) continue;
      if (i===8 && port===1) { outlet=true; continue; }
      const [dx,dy]=PIPE_STEPS[port],x=i%3+dx,y=Math.floor(i/3)+dy,j=y*3+x;
      if (x<0 || x>2 || y<0 || y>2 || !pipePorts(flags,j).includes((port+2)%4)) leak=true;
      else queue.push(j);
    }
  }
  return {wet,leak,ready:outlet && !leak};
}
