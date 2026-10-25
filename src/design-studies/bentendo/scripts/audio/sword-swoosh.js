/** Erzeugt ein kurzes, abwärts gefärbtes Luftgeräusch ohne tonalen Pitch-Effekt. @param {AudioContext} context Gemeinsamer Kontext. */
export function swordAirBuffer(context) {
  const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*.11),context.sampleRate),data=buffer.getChannelData(0);
  let smooth=0;
  for (let i=0;i<data.length;i++) {
    const progress=i/data.length,white=Math.random()*2-1;
    smooth+=(.7-.55*progress)*(white-smooth); data[i]=smooth;
  }
  return buffer;
}

/** Synchronisiert einen kräftigen Luftzug mit dem aktiven Schwertschwung am vorhandenen SFX-Ausgang. @param {object} effects Gemeinsamer Effektkanal. */
export function playSwordSwoosh(effects) {
  const context=effects.context;
  if (context?.state!=='running') return;
  const source=context.createBufferSource(),envelope=context.createGain(),at=context.currentTime;
  source.buffer=swordAirBuffer(context);
  envelope.gain.setValueAtTime(.001,at); envelope.gain.linearRampToValueAtTime(4,at+.012);
  envelope.gain.exponentialRampToValueAtTime(.001,at+.11);
  source.connect(envelope); envelope.connect(effects.gain);
  source.addEventListener('ended',effects.disconnect.bind(effects,source,envelope),{once:true});
  source.start(at); source.stop(at+.11);
}
