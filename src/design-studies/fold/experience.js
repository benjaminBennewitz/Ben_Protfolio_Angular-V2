/** FOLD. V5 — single CSS3D scene, shared panels and hinges for cube and net.
 * No duplicated finale and no oversized panels intersecting neighboring faces.
 */
const journey=document.querySelector('#journey');
const sceneNode=document.querySelector('#scene');
const counter=document.querySelector('#counter');
const instruction=document.querySelector('#instruction');
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=v=>{const t=clamp(v);return t*t*(3-2*t)};
const mix=(a,b,t)=>a+(b-a)*t;
const visitedPerspectives=new Set();
let perspectivesCompleted=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
try{
 const THREE=await import('three');
 const {CSS3DRenderer,CSS3DObject}=await import('three/addons/renderers/CSS3DRenderer.js');
 const renderer=new CSS3DRenderer();renderer.domElement.style.position='absolute';renderer.domElement.style.inset='0';renderer.domElement.style.pointerEvents='auto';sceneNode.append(renderer.domElement);
 const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(40,1,.1,100);
 const root=new THREE.Group();scene.add(root);const stage=sceneNode.closest('.stage');const shadow=document.createElement('div');shadow.className='unfold-ground-shadow';shadow.setAttribute('aria-hidden','true');stage.insertBefore(shadow,sceneNode);
 const mobileQuery=matchMedia('(max-width: 800px) and (pointer: coarse)');
 const guide=document.querySelector('#touch-guide');
 const guideFill=document.querySelector('#touch-guide-fill');
 const guideLabel=document.querySelector('#touch-guide-label');
 const guidePercent=document.querySelector('#touch-guide-percent');
 const guideStep=document.querySelector('#touch-guide-step');
 const guideNext=document.querySelector('#touch-guide-next');
 const mobile={index:0,active:false,dragging:false,preview:null,animating:false,progress:0};
 const S=4,PIX=1000,scale=S/PIX;
 const info=[
  {id:3,name:'FRONT',bg:'#2458f5',fg:'#fff',accent:'#ffce45',title:'TURN THE<br><em>WORLD.</em>',copy:'Manchmal verändert sich nicht die Welt. Sondern nur der Blick, mit dem wir sie betrachten.'},
  {id:2,name:'LEFT',bg:'#f0ede5',fg:'#17191f',accent:'#2458f5',title:'CHANGE THE<br><em>ANGLE.</em>',copy:'Ein anderer Winkel. Ein neuer Zusammenhang. Was eben noch eindeutig schien, bekommt eine zweite Bedeutung.'},
  {id:4,name:'RIGHT',bg:'#ff674a',fg:'#17191f',accent:'#2458f5',title:'SAME PAGE.<br><em>NEW WORLD.</em>',copy:'Nichts am Objekt hat sich verändert. Nur deine Perspektive. Und plötzlich siehst du mehr.'},
  {id:5,name:'BACK',bg:'#f0ede5',fg:'#17191f',accent:'#ff674a',title:'THE WHOLE<br><em>PICTURE.</em>',copy:'Sechs Seiten. Ein Objekt. Erst wenn sich alles entfaltet, wird sichtbar, wie die Perspektiven zusammengehören.'},
  {id:0,name:'TOP',bg:'#ffce45',fg:'#17191f',accent:'#2458f5',title:'F<span class="hero-o">O</span>LD<span class="dot">.</span><br><em>THERE IS ALWAYS<br>ANOTHER SIDE.</em>',copy:'Was du siehst, ist nur eine Seite. Dreh weiter. Es gibt mehr zu entdecken.'},
  {id:1,name:'BOTTOM',bg:'#2458f5',fg:'#fff',accent:'#ffce45',title:'LOOK<br><em>CLOSER.</em>',copy:'Eine Oberfläche zeigt nie das ganze Bild. Was dahinterliegt, erkennst du erst, wenn du die Perspektive wechselst.'}
 ];
 const faces=info.map(data=>{
  const holder=new THREE.Group();
  const el=document.createElement('section');el.className=`paper paper--${data.name.toLowerCase()}`;el.style.setProperty('--bg',data.bg);el.style.setProperty('--fg',data.fg);el.style.setProperty('--accent',data.accent);
  el.setAttribute('aria-label',`${data.id+1} / ${data.name}`);
  el.innerHTML=`<div class="inner"><span class="eyebrow">${String(data.id+1).padStart(2,'0')} / ${data.name}</span><h${data.id===0?'1':'2'}>${data.title}</h${data.id===0?'1':'2'}><p class="copy">${data.copy}</p><button type="button" data-next="${data.id===5?6:data.id+1}">${data.id===5?'UNFOLD THE WHOLE PICTURE ↗':'NEXT SIDE ↗'}</button></div><span class="footnote">FOLD. / THERE IS ALWAYS ANOTHER SIDE.</span><span class="art-orbit" aria-hidden="true"></span><span class="art-stamp" aria-hidden="true">FOLD / 00${data.id+1}<br>↗ REFRAME<br>THE ORDINARY</span><span class="art-rule" aria-hidden="true"></span><span class="editorial-meta" aria-hidden="true">STUDY NO. 007 <b>↗</b> THE ART OF ANOTHER SIDE</span>${data.id===4?`<span class="marquee" aria-hidden="true"><span>SAME OBJECT / DIFFERENT ANGLE / NEW MEANING / REPEAT /&nbsp;</span><span>SAME OBJECT / DIFFERENT ANGLE / NEW MEANING / REPEAT /&nbsp;</span></span>`:""}`;
  // Editorial geometric marks are part of each physical paper face.
  // They remain attached during flips and the unfolded finale.
  el.insertAdjacentHTML('beforeend', `
    <span class="fold-geometry fold-geometry--ring" aria-hidden="true"></span>
    <span class="fold-geometry fold-geometry--cross" aria-hidden="true"></span>
    <span class="fold-geometry fold-geometry--index" aria-hidden="true">0${data.id+1} / 06</span>
  `);
  const obj=new CSS3DObject(el);obj.scale.setScalar(scale);holder.add(obj);return {holder,el,data};
 });
 root.add(faces[0].holder);
 /** The five hinges have exactly one panel each; all six panels survive unfolding. */
 function hinge(parent,child,axis,dir){const pivot=new THREE.Group();pivot.position[axis==='y'?'x':'y']=dir*S/2;child.position[axis==='y'?'x':'y']=dir*S/2;pivot.add(child);parent.add(pivot);return pivot}
 const joints={left:hinge(faces[0].holder,faces[1].holder,'y',-1),right:hinge(faces[0].holder,faces[2].holder,'y',1),outer:hinge(faces[2].holder,faces[3].holder,'y',1),top:hinge(faces[0].holder,faces[4].holder,'x',1),bottom:hinge(faces[0].holder,faces[5].holder,'x',-1)};
 function fold(amount){const a=amount*Math.PI/2;joints.left.rotation.y=-a;joints.right.rotation.y=a;joints.outer.rotation.y=a;joints.top.rotation.x=-a;joints.bottom.rotation.x=a}
 fold(1);root.updateMatrixWorld(true);
 // A stable camera pose for each face, computed from its actual closed-cube matrix.
 const sequence=[4,5,1,0,2,3];
 const poses=sequence.map(index=>{
  const holder=faces[index].holder;
  const center=holder.getWorldPosition(new THREE.Vector3());
  const quat=holder.getWorldQuaternion(new THREE.Quaternion());
  const normal=new THREE.Vector3(0,0,1).applyQuaternion(quat);
  const up=new THREE.Vector3(0,1,0).applyQuaternion(quat);
  const pos=center.clone().addScaledVector(normal,5);
  const mat=new THREE.Matrix4().lookAt(pos,center,up);
  return {center,quat:new THREE.Quaternion().setFromRotationMatrix(mat)};
 });
 // Explicit intermediate quarter-turn for the opposite-face transition.
 // TOP → BOTTOM: rotate around the camera's *local* horizontal axis.
 // World-space premultiplication previously twisted the camera through the cube.
 const halfTurn=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),Math.PI);
 const midpoint=poses[0].quat.clone().multiply(
   new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),Math.PI/2)
 );
 // Force the bottom camera to use the same continuous 180° turn path.
 // Both views face outward, never into the cube.
 poses[1].quat.copy(poses[0].quat).multiply(halfTurn);
 /** Shows touch confirmation immediately, independently of the 3D transition. */
 function touchFeedback(progress,label){
   if(!mobileQuery.matches)return;
   const p=clamp(progress);
   mobile.progress=p;
   guideFill.style.transform=`scaleX(${p})`;
   guidePercent.textContent=p>0?`${Math.round(p*100)}%`:'READY';
   guideLabel.textContent=label;
   guide.classList.toggle('touch-guide--engaged',p>.02);
   guideStep.textContent=mobile.index>=6?'07 / UNFOLDED':`${String(mobile.index+1).padStart(2,'0')} / 06`;
   guideNext.textContent=mobile.index===6?'SWIPE FOR FOOTER ↓':'NEXT PERSPECTIVE ↓';
 }
 function update(t){
  if(!perspectivesCompleted && t>=.997 && visitedPerspectives.size===6){perspectivesCompleted=true;document.dispatchEvent(new CustomEvent('bp:study-achievement', { detail: 'study-fold-perspectives' }));}
  const phase=t*9.75;shadow.style.opacity=phase>9?String(ease((phase-9.53)/.17)*.38):'0';
  if(phase<9){
   fold(1);root.quaternion.identity();
   const section=Math.min(5,Math.floor(phase/1.5)),part=(phase-section*1.5)/1.5;
   const spin=ease((part-.66)/.28),next=Math.min(5,section+1);
   const q=new THREE.Quaternion();
   if(section===0){if(spin<.5)q.copy(poses[0].quat).slerp(midpoint,ease(spin*2));else q.copy(midpoint).slerp(poses[1].quat,ease((spin-.5)*2))}
   else q.copy(poses[section].quat).slerp(poses[next].quat,spin);
   const center=poses[section].center.clone().lerp(poses[next].center,spin);
   // Square faces cover the full viewport at rest. They are never stretched.
   const vFov=THREE.MathUtils.degToRad(camera.fov),hFov=2*Math.atan(Math.tan(vFov/2)*camera.aspect);
   const close=(S/2)/Math.tan(hFov/2)*.93;
   const pull=1.7*Math.sin(Math.PI*spin);
   camera.quaternion.copy(q);
   // Orbit the CLOSED cube from the outside. Interpolating the opposite
   // face centers sends the camera straight through its hollow interior.
   // All six closed face centers share this geometric cube center.
   const cubeCenter=new THREE.Vector3(0,0,-S/2);
   const outward=new THREE.Vector3(0,0,1).applyQuaternion(q);
   camera.position.copy(cubeCenter).addScaledVector(outward,S/2+close+pull);
   const selected=spin<.5?section:next;
   if(spin<.015)visitedPerspectives.add(selected);
   faces.forEach(f=>{const on=f.data.id===selected;f.el.classList.toggle('is-current',on);f.el.style.zIndex=on?'20':'0';f.el.classList.remove('net');f.el.inert=!on;f.el.style.visibility=(!on && spin<.015)?'hidden':'visible';f.el.setAttribute('aria-hidden',String(!on))});
   counter.textContent=`${String(selected+1).padStart(2,'0')} / 06`;
   instruction.textContent='SCROLL TO FLIP ↓';
  }else{
   // One continuous object: first retreat from face 06, then orient the whole
   // folded cube towards the camera, and only then unfold its own five hinges.
   const p=clamp((phase-9)/.75);
   const retreat=ease(p/.27);
   const turn=ease((p-.24)/.34);
   const opening=ease((p-.56)/.44);
   fold(1-opening);
   const tilt=new THREE.Quaternion().setFromEuler(new THREE.Euler(-.23,0,-.12));
   const finalCenter=new THREE.Vector3(S*.5,0,0);
   const netDistance=Math.max(23,14/camera.aspect);
   const endPos=new THREE.Vector3(S*.5,0,netDistance);
   // Face 06 camera pose, derived from the same face matrix used in chapters.
   const facePos=poses[5].center.clone().add(new THREE.Vector3(0,0,5).applyQuaternion(poses[5].quat));
   const faceQuat=poses[5].quat;
   const aligned=facePos.clone().add(new THREE.Vector3(0,0,7).applyQuaternion(faceQuat));
   camera.position.copy(facePos).lerp(aligned,retreat).lerp(endPos,turn);
   const lookQuat=new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().lookAt(endPos,finalCenter,new THREE.Vector3(0,1,0)));
   camera.quaternion.copy(faceQuat).slerp(lookQuat,turn);
   root.quaternion.copy(tilt.clone().slerp(new THREE.Quaternion(),1-turn));
   // The same physical HTML panels are clickable when the net is visible.
   faces.forEach(item=>{
     item.el.classList.toggle('net',opening>.75);item.el.style.zIndex='0';
     item.el.classList.toggle('is-current',opening>.75);
     item.el.inert=opening<=.75;item.el.style.visibility='visible';
     item.el.setAttribute('aria-hidden',String(opening<=.75));
     item.el.dataset.go=String(item.data.id);
   });
   counter.textContent='07 / UNFOLDED';
   instruction.textContent=opening>.98?'CHOOSE A FACE TO RETURN ↑':'SCROLL TO UNFOLD ↓';

  }
 }
 function resize(){const w=sceneNode.clientWidth,h=sceneNode.clientHeight;camera.aspect=w/h;camera.fov=w<700?55:40;camera.updateProjectionMatrix();renderer.setSize(w,h)}
 addEventListener('resize',resize,{passive:true});resize();
 let current=0;
 let lastRender=-1;
 let lastFloat=0;
 function measure(){
   const r=journey.getBoundingClientRect();
   return clamp(-r.top/Math.max(1,journey.offsetHeight-innerHeight));
 }
 function frame(now){
   requestAnimationFrame(frame);
   if(document.hidden)return;
   const desired=mobile.preview??measure();
   const delta=Math.abs(current-desired);
   if(delta>.00006)current=reduced?desired:mix(current,desired,mobileQuery.matches?.29:.17);
   else current=desired;
   const hoveringNet=current>.997&&!reduced;
   // The expensive CSS3D matrix updates are skipped entirely on resting chapters.
   const netTick=hoveringNet && (!mobileQuery.matches || now-lastFloat>=34);
   if(netTick)lastFloat=now;
   const changed=Math.abs(current-lastRender)>.000015 || netTick;
   if(!changed)return;
   update(current);
   if(netTick){const t=now*.001;camera.position.y+=Math.sin(t*.62)*.105;camera.position.x+=Math.cos(t*.45)*.055;}
   renderer.render(scene,camera);
   lastRender=current;
 }
 requestAnimationFrame(frame);
 /** Scroll positions preserve the existing six-section motion and unfolded finale. */
 function stopFraction(index){return index===6?1:(index*1.5+.22)/9.75}
 function stopY(index){return journey.getBoundingClientRect().top+scrollY+(journey.offsetHeight-innerHeight)*stopFraction(index)}
 function chapterAt(t){const phase=t*9.75;return phase>=9?6:Math.min(5,Math.floor(phase/1.5))}
  /** Move from one position to another without changing the chapter state.
   * Kept separate so the unfolding animation can have its own duration. */
  function tweenScroll(from,to,duration){
    return new Promise(resolve=>{
      if(reduced || duration<=0){scrollTo(0,to);resolve();return}
      const start=performance.now();
      function step(now){
        const progress=clamp((now-start)/duration);
        // Smooth at the endpoints, without the hard acceleration of easeOutCubic.
        const eased=ease(progress);
        scrollTo(0,from+(to-from)*eased);
        if(progress<1)requestAnimationFrame(step);
        else {scrollTo(0,to);resolve()}
      }
      requestAnimationFrame(step);
    });
  }
  /** Mobile 01–06 retain their responsive 850ms flips.
   * 06 → unfolded gets a separate ~2.4 second reveal and then an exit to footer. */
  async function animateMobileStop(index){
    const target=clamp(index,0,7);
    if(mobile.animating || target===mobile.index)return;
    mobile.animating=true;
    mobile.preview=null;
    const fromIndex=mobile.index;
    const oldBehavior=document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior='auto';
    try{
      if(target===7){
        // Finish the sticky journey, then allow the browser to scroll normally.
        touchFeedback(1,'TO THE FOOTER ↓');
        const footer=document.querySelector('footer#end');
        const footerY=footer?footer.getBoundingClientRect().top+scrollY:stopY(6)+innerHeight;
        await tweenScroll(scrollY,footerY,900);
        mobile.index=7;
      }else if(target===6 && fromIndex===5){
        // The final flip is finished: phase 9–9.75 is ONLY the unfold.
        // Never run that final 3D movement inside an 850ms chapter flip.
        mobile.index=6;
        touchFeedback(.35,'PREPARING THE UNFOLD…');
        const revealStart=journey.getBoundingClientRect().top+scrollY+
          (journey.offsetHeight-innerHeight)*(9/9.75);
        await tweenScroll(scrollY,revealStart,550);
        touchFeedback(.65,'UNFOLDING…');
        await tweenScroll(scrollY,stopY(6),2400);
      }else{
        mobile.index=target;
        touchFeedback(1,target===6?'FOLDING BACK…':'FLIPPING…');
        await tweenScroll(scrollY,stopY(target),target===5&&fromIndex===6?1100:850);
      }
    }finally{
      document.documentElement.style.scrollBehavior=oldBehavior;
      mobile.animating=false;
      touchFeedback(0,mobile.index===6?'SWIPE FOR FOOTER ↓':'SWIPE TO FLIP');
    }
  }
  function go(index){
    if(mobileQuery.matches){
      animateMobileStop(index);
    }else{
      scrollTo({top:stopY(index),behavior:reduced?'instant':'smooth'});
    }
  }
 /** Touch gestures only take over inside the sticky experience, not on the footer. */
 let gesture=null;
 function withinJourney(){
   const rect=journey.getBoundingClientRect();
   return rect.top<=1 && rect.bottom>=innerHeight-1;
 }
 document.addEventListener('touchstart',event=>{
   if(!mobileQuery.matches||!withinJourney()||mobile.animating||event.touches.length!==1)return;
   if(event.target.closest('header,footer,#touch-guide,a,button'))return;
   const touch=event.touches[0];
   gesture={y:touch.clientY,x:touch.clientX,dy:0,startedAt:performance.now(),captured:false};
   mobile.dragging=true;
 },{passive:true,capture:true});
 document.addEventListener('touchmove',event=>{
   if(!gesture||!mobileQuery.matches)return;
   if(event.touches.length!==1){gesture=null;mobile.dragging=false;return;}
   const touch=event.touches[0],dy=touch.clientY-gesture.y,dx=touch.clientX-gesture.x;
   if(!gesture.captured && Math.abs(dy)<9)return;
   if(!gesture.captured && Math.abs(dx)>Math.abs(dy)*1.4){gesture=null;mobile.dragging=false;return;}
   gesture.captured=true;
   // Browser scrolling is disabled only after a real vertical swipe is recognized.
   event.preventDefault();
   gesture.dy=dy;
   const dir=dy<0?1:-1;
   const canMove=mobile.index+dir>=0 && mobile.index+dir<=7;
   const progress=canMove?clamp(Math.abs(dy)/Math.max(100,innerHeight*.22)):0;
   touchFeedback(progress,canMove?(mobile.index===6&&dir>0?'TO THE FOOTER ↓':dir>0?'REVEALING NEXT SIDE':'RETURNING TO PREVIOUS SIDE'):'END OF EXPERIENCE');
 },{passive:false,capture:true});
 function finishGesture(event){
   if(!gesture)return;
   const dy=gesture.dy,captured=gesture.captured;
   gesture=null;mobile.dragging=false;
   if(!captured){touchFeedback(0,'SWIPE TO FLIP');return;}
   const dir=dy<0?1:-1;
   // A deliberate 42px swipe advances exactly one chapter, no matter its speed.
   if(Math.abs(dy)>=42 && mobile.index+dir>=0 && mobile.index+dir<=7){
     animateMobileStop(mobile.index+dir);
   }else{
     touchFeedback(0,'SWIPE TO FLIP');
   }
 }
 document.addEventListener('touchend',finishGesture,{passive:true,capture:true});
 document.addEventListener('touchcancel',()=>{gesture=null;mobile.dragging=false;touchFeedback(0,'SWIPE TO FLIP')},{passive:true,capture:true});
 // Keep touch chapter state synchronized when arriving through browser links/history.
 let lastScrollSync=0;
 addEventListener('scroll',()=>{
   if(!mobileQuery.matches||mobile.animating||mobile.dragging)return;
   const now=performance.now();if(now-lastScrollSync<80)return;lastScrollSync=now;
   mobile.index=withinJourney()?chapterAt(measure()):mobile.index;
   touchFeedback(0,mobile.index===6?'SWIPE FOR FOOTER ↓':'SWIPE TO FLIP');
 },{passive:true});
 touchFeedback(0,'SWIPE TO FLIP');
 document.addEventListener('click',event=>{
   const button=event.target.closest('[data-next],[data-go]');
   if(!button)return;
   // Text selection must remain native, even on a clickable unfolded panel.
   if(!event.target.closest('button,a') && String(getSelection()?.toString()||'').trim())return;
   event.preventDefault();go(Number(button.dataset.next??button.dataset.go));
 });
}catch(error){console.error('FOLD. Engine:',error);document.querySelector('#fallback').hidden=false}
