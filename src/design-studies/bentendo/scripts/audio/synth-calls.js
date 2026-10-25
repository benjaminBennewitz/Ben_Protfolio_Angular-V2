/** Plant kurze Klangprofile auf dem vorhandenen Effektkanal. @param {object} effects Audioeffekte. @param {object} profile Klangprofil. @param {number} boost Verstärkung vor dem bestehenden Lautstärkeregler. */
export function playSynthCall(effects,profile,boost=1) {
  const ctx=effects.context;
  if (!profile || ctx?.state!=='running') return;
  for (let i=0;i<profile.count;i++) playCallNote(effects,profile,ctx.currentTime+(profile.delay || 0)+i*profile.gap,boost);
}

/** Plant einen weich begrenzten Klang mit Tonhöhenverlauf. @param {object} effects Effektkanal. @param {object} profile Klangprofil. @param {number} at Startzeit. @param {number} boost Verstärkung. */
function playCallNote(effects,profile,at,boost) {
  const ctx=effects.context,envelope=ctx.createGain();
  const source=profile.wave==='noise'?snuffle(ctx,profile.duration):ctx.createOscillator();
  if (profile.wave!=='noise') {
    source.type=profile.wave; source.frequency.setValueAtTime(profile.pitches[0],at);
    for (let i=1;i<profile.pitches.length;i++) source.frequency.exponentialRampToValueAtTime(profile.pitches[i],at+profile.duration*i/(profile.pitches.length-1));
  }
  envelope.gain.setValueAtTime(0.001,at); envelope.gain.linearRampToValueAtTime(profile.level*boost,at+0.008);
  envelope.gain.exponentialRampToValueAtTime(0.001,at+profile.duration);
  source.connect(envelope); envelope.connect(effects.gain);
  source.addEventListener('ended',effects.disconnect.bind(effects,source,envelope),{once:true});
  source.start(at); source.stop(at+profile.duration);
}

/** Erzeugt ein kurzes gedämpftes Rascheln für Igel und Schlange. @param {AudioContext} ctx Audiokontext. @param {number} duration Länge. */
function snuffle(ctx,duration) {
  const source=ctx.createBufferSource(),buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate);
  const data=buffer.getChannelData(0); let smooth=0;
  for (let i=0;i<data.length;i++) { smooth=smooth*0.88+(Math.random()*2-1)*0.12; data[i]=smooth*3; }
  source.buffer=buffer; return source;
}
