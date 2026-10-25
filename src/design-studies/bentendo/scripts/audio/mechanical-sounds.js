const PROFILES={
  interact:{duration:.075,decay:.018,cut:3400,body:[640,1530,2870],level:.8},
  back:{duration:.072,decay:.017,cut:3200,body:[710,1690,3100],level:.76},
  start:{duration:.06,decay:.012,cut:650,body:[185,390,830],level:.75},
  select:{duration:.055,decay:.011,cut:580,body:[210,445,910],level:.7},
  dpad:{duration:.12,decay:.04,cut:2600,body:[850,1890,3210],level:.55},
};

/** Erzeugt gefiltertes Materialrauschen und gedämpfte Gehäuseresonanzen ohne Chiptune-Oszillator. @param {string} action Knopf. @param {boolean} released Loslassgeräusch. @param {number} rate Abtastrate. */
export function mechanicalSamples(action,released=false,rate=44100) {
  const profile=PROFILES[action]; if (!profile) return null;
  const length=Math.ceil(rate*profile.duration*(released ? .65 : 1)),samples=new Float32Array(length);
  const filter=1-Math.exp(-2*Math.PI*profile.cut/rate); let seed=action.length*8191+(released?991:1),low=0,slow=0;
  for (let i=0;i<length;i++) {
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const white=seed/2147483648-1,t=i/rate; low+=filter*(white-low); slow+=.035*(white-slow);
    const attack=Math.min(1,t/.0006),decay=Math.exp(-t/profile.decay),bounce=t>.012?Math.exp(-(t-.012)/.006)*.16:0;
    const noise=action==='dpad'?(low-slow)*(.55+.45*Math.sin(2*Math.PI*71*t+Math.sin(t*119))):low;
    const body=resonance(profile.body,t)*Math.exp(-t/(action==='dpad'?.018:profile.decay));
    const value=(noise*(decay+bounce)*.75+body*(action==='dpad'?.12:.3))*attack*profile.level*(released ? .45 : 1);
    samples[i]=Math.max(-.95,Math.min(.95,value));
  }
  return samples;
}

/** Mischt drei unharmonische Materialresonanzen statt einer gespielten Note. @param {number[]} frequencies Eigenfrequenzen. @param {number} time Zeit. */
function resonance(frequencies,time) {
  return Math.sin(2*Math.PI*frequencies[0]*time)*.6+Math.sin(2*Math.PI*frequencies[1]*time)*.25+Math.sin(2*Math.PI*frequencies[2]*time)*.15;
}

/** Hält kleine PCM-Puffer am vorhandenen SFX-Ausgang und räumt Quellen nach jedem Klick auf. */
export class MechanicalSounds {
  /** Verwendet den gemeinsamen AudioContext und dessen stummschaltbaren Ausgang. @param {object} effects Effektkanal. */
  constructor(effects) { this.effects=effects; this.buffers=new Map(); this.last=new Map(); }
  /** Spielt pro Betätigung einen kurzen Materialklang, unabhängig vom eingeschalteten LCD. @param {string} action Knopf. @param {boolean} released Loslassen. */
  play(action,released=false) {
    const {context,gain}=this.effects;if (!PROFILES[action] || context?.state!=='running') return;
    const key=`${action}:${released}`,at=context.currentTime;
    if (at-(this.last.get(key) ?? -1)<.025) return;
    this.last.set(key,at);
    if (!this.buffers.has(key)) {
      const samples=mechanicalSamples(action,released,context.sampleRate),buffer=context.createBuffer(1,samples.length,context.sampleRate);
      buffer.getChannelData(0).set(samples); this.buffers.set(key,buffer);
    }
    const source=context.createBufferSource(),level=context.createGain();level.gain.value=3.2;
    source.buffer=this.buffers.get(key);source.connect(level);level.connect(gain);
    source.addEventListener('ended',this.effects.disconnect.bind(this.effects,source,level),{once:true});source.start(at);
  }
}
