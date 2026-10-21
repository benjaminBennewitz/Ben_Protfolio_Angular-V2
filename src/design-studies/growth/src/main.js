/**
 * GROWTH — First camera-flight prototype.
 * Static procedural tree, natural document scrolling, cinematic 3D camera.
 * Three.js is loaded as an ES module from a CDN (requires internet).
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { DEFAULT_CONFIG, readConfig } from './config.js';
import { createGrowthWorld } from './world.js';
import { mountDebug } from './debug.js';

const root = document.querySelector('#scene');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.32;
root.append(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#14261c');
scene.fog = new THREE.FogExp2('#152b20', 0.014);
const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.15, 380);
const ambient = new THREE.HemisphereLight('#d9f0b9', '#332a20', 2.3);
scene.add(ambient);
const sun = new THREE.DirectionalLight('#f8eac1', 3.4);
sun.position.set(-26, 65, 35);
scene.add(sun);
const fill = new THREE.DirectionalLight('#6abf86', 1.4);
fill.position.set(25, 20, -20);
scene.add(fill);

const config = readConfig();
const world = createGrowthWorld(scene, renderer, config);
const { mistMat, mistGroups, earthCeilingMaterial, ceilingStrata, foregroundRoot, swampWaterState, floatingWaterLeaves } = world;
mountDebug({ world, config, defaults: DEFAULT_CONFIG });

const sections = [...document.querySelectorAll('.chapter')];
function cameraHeightForProgress(progress) {
  const scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const scrollY = (1 - progress) * scrollRange;
  const anchors = sections.map(section => ({
    scroll: Math.min(scrollRange, Math.max(0, section.offsetTop + (section.offsetHeight - window.innerHeight) / 2)),
    height: Number(section.dataset.height)
  })).sort((a, b) => a.scroll - b.scroll);
  if (scrollY <= anchors[0].scroll) return anchors[0].height;
  for (let i = 1; i < anchors.length; i++) {
    if (scrollY <= anchors[i].scroll) {
      const a = anchors[i - 1], b = anchors[i];
      // Linear interpolation avoids a zero-speed restart at every chapter boundary.
      const t = THREE.MathUtils.clamp((scrollY - a.scroll) / Math.max(1, b.scroll - a.scroll), 0, 1);
      return THREE.MathUtils.lerp(a.height, b.height, t);
    }
  }
  return anchors[anchors.length - 1].height;
}

// Spatial markers are visible only on the front-facing side and after raycast occlusion.
const markerRoot = document.querySelector('#discovery-markers');
const popup = document.querySelector('#discovery-popover');
const popupLine = document.querySelector('#discovery-line');
let selectedMarker = null;
const markerButtons = world.infoPoints.map(point => {
  const button = document.createElement('button');
  button.type='button';button.className='discovery-point';button.dataset.species=point.type;
  button.setAttribute('aria-label',point.label+' entdecken');button.title=point.label;
  button.innerHTML='<span aria-hidden="true"></span>';
  markerRoot.append(button);
  button.addEventListener('click', () => toggleDiscovery({point,button}));
  return {point,button};
});
const markerRay = new THREE.Raycaster();
const markerProjected = new THREE.Vector3();
const markerVector = new THREE.Vector3();
const markerOccluders = [...(world.layers.trunk || []), ...(world.layers.buttress || [])]
  .filter(object => object.isMesh && !object.isInstancedMesh);
function closeDiscovery() { selectedMarker=null;popup.hidden=true;popupLine.hidden=true; }
function toggleDiscovery(entry) {
  if(selectedMarker?.point===entry.point){closeDiscovery();return;}
  selectedMarker=entry;
  const data=speciesInfo[entry.point.type];
  popup.querySelector('[data-bubble-label]').textContent=data.label;
  popup.querySelector('[data-bubble-title]').textContent=data.title;
  popup.querySelector('[data-bubble-copy]').textContent=data.copy;
  popup.hidden=false;popupLine.hidden=false;
  positionDiscoveryBubble(entry.button);
}
function positionDiscoveryBubble(button) {
  const x=parseFloat(button.style.left)*innerWidth/100;
  const y=parseFloat(button.style.top)*innerHeight/100;
  const bubbleWidth=Math.min(330,innerWidth-24);
  const bubbleHeight=230;
  const side=selectedMarker?.point?.bubbleSide || (x < innerWidth * .56 ? 'right' : 'left');
  const vertical=selectedMarker?.point?.bubbleVertical || (y < innerHeight * .45 ? 'down' : 'up');
  const desiredX = x + (side === 'right' ? 64 : -bubbleWidth - 64);
  const desiredY = y + (vertical === 'down' ? 36 : -bubbleHeight + 22);
  const px=Math.max(12,Math.min(innerWidth-bubbleWidth-12,desiredX));
  const py=Math.max(80,Math.min(innerHeight-bubbleHeight-18,desiredY));
  popup.style.left=px+'px';popup.style.top=py+'px';
  const bx = side === 'right' ? px : px + bubbleWidth;
  const by = py + (vertical === 'down' ? 28 : bubbleHeight - 38);
  const length=Math.hypot(bx-x,by-y);
  popupLine.style.left=x+'px';popupLine.style.top=y+'px';
  popupLine.style.width=length+'px';popupLine.style.transform=`rotate(${Math.atan2(by-y,bx-x)}rad)`;
}
function updateDiscoveryMarkers(height) {
  for (const entry of markerButtons) {
    const {point,button}=entry;
    const active=height>=point.chapterMin && height<=point.chapterMax;
    // Intentional editorial marker: fixed over the left-hand crown, not a 3D specimen.
    if (point.screenAnchor) {
      button.hidden=!active;
      if (active) {
        button.style.left=(point.screenAnchor.x*100)+'%';
        button.style.top=(point.screenAnchor.y*100)+'%';
      } else if (selectedMarker?.point===point) closeDiscovery();
      continue;
    }
    markerProjected.copy(point.position).project(camera);
    const toCamera=markerVector.copy(camera.position).sub(point.position);
    const front=point.normal.dot(toCamera)>0.15;
    let visible=active && front && markerProjected.z>-1 && markerProjected.z<1 &&
      Math.abs(markerProjected.x)<.89 && Math.abs(markerProjected.y)<.86;
    if(visible){
      const direction=point.position.clone().sub(camera.position);
      const distance=direction.length();
      markerRay.set(camera.position,direction.normalize());
      markerRay.far=Math.max(0,distance-.22);
      visible=point.skipOcclusion || markerRay.intersectObjects(markerOccluders,false).length===0;
    }
    button.hidden=!visible;
    if(visible){
      button.style.left=((markerProjected.x+1)*50)+'%';
      button.style.top=((1-markerProjected.y)*50)+'%';
    }
    if(!visible && selectedMarker?.point===point)closeDiscovery();
  }
  if(selectedMarker)positionDiscoveryBubble(selectedMarker.button);
}
const altimeterValue = document.querySelector('#height-value');
const altimeterFill = document.querySelector('#altimeter-fill');
const navLinks = [...document.querySelectorAll('.chapter-nav a')];
const orientation = document.querySelector('#orientation');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let positionProgress = 0;
let desiredProgress = 0;
let scrollTicking = false;
let lastTime = 0;
let frame = 0;

function updateScroll() {
  const maximum = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  desiredProgress = THREE.MathUtils.clamp(1 - window.scrollY / maximum, 0, 1);
  const center = window.scrollY + window.innerHeight * .5;
  let active = sections[sections.length - 1];
  for (const section of sections) {
    if (center >= section.offsetTop && center < section.offsetTop + section.offsetHeight) {
      active = section;
      break;
    }
  }
  sections.forEach(section => section.classList.toggle('is-active', section === active));
  navLinks.forEach(link => {
    const enabled = link.getAttribute('href') === `#${active.id}`;
    link.classList.toggle('active', enabled);
    if (enabled) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  orientation.style.opacity = desiredProgress > .09 ? '0' : '1';
  scrollTicking = false;
}
window.addEventListener('scroll', () => {
  if (!scrollTicking) { scrollTicking = true; requestAnimationFrame(updateScroll); }
}, { passive: true });
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  updateScroll();
});

function animate(ms) {
  const delta = Math.min((ms - lastTime) / 1000 || .016, .05);
  lastTime = ms;
  frame += delta;
  if (swampWaterState) {
    // Multi-frequency wind ripples combine with circular waves emanating from
    // the tree-side bank. The final outer ring stays nearly level at the shore.
    const { mesh, basePositions, positions } = swampWaterState;
    const array = positions.array;
    const waterTime = reducedMotion.matches ? 0 : frame;
    for (let i = 0; i < array.length; i += 3) {
      const x = basePositions[i];
      const y = basePositions[i + 1];
      const radial = Math.hypot(x, y);
      const edgeFade = 1 - THREE.MathUtils.smoothstep(radial, 4.6, 5.9);
      const bankFade = 0.22 + 0.78 * edgeFade;
      const stemDistance = Math.hypot((x + 4.0) * 1.38, y + 0.2);
      const shoreDistance = Math.hypot(x - 1.8, y + 3.2);
      const stemRings = Math.sin(stemDistance * 3.5 - waterTime * 3.0) * 0.095
        * Math.exp(-stemDistance * 0.24);
      const shoreRings = Math.sin(shoreDistance * 3.0 - waterTime * 2.4) * 0.058
        * Math.exp(-shoreDistance * 0.3);
      const wind = Math.sin(x * 2.5 + y * 0.8 + waterTime * 1.9) * 0.060
        + Math.sin(y * 3.9 - x * 0.5 - waterTime * 2.3) * 0.038;
      array[i + 2] = (stemRings + shoreRings + wind) * bankFade;
    }
    positions.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
  }
  if (floatingWaterLeaves?.length) {
    for (const leaf of floatingWaterLeaves) {
      leaf.position.y = leaf.userData.baseY + Math.sin(frame * leaf.userData.speed + leaf.userData.phase) * 0.035;
      leaf.rotation.z = leaf.userData.baseRot + Math.sin(frame * (leaf.userData.speed * .6) + leaf.userData.phase) * 0.22;
      leaf.position.x = leaf.userData.baseX + Math.cos(frame * (leaf.userData.speed * .4) + leaf.userData.phase) * 0.16;
      leaf.position.z = leaf.userData.baseZ + Math.sin(frame * (leaf.userData.speed * .33) + leaf.userData.phase * 1.4) * 0.06;
    }
  }
  positionProgress = reducedMotion.matches ? desiredProgress : THREE.MathUtils.damp(positionProgress, desiredProgress, 3.2, delta);
  const height = cameraHeightForProgress(positionProgress);
  const orbit = 1.8 + Math.min((height + 3) / 59, 1) * Math.PI * 2.45;
  const radius = height > 54 ? THREE.MathUtils.lerp(23, 29, THREE.MathUtils.clamp((height - 54) / 9, 0, 1)) : height > 34 ? THREE.MathUtils.lerp(11, 23, (height - 34) / 22) : 11;
  const entryPullback = 2.8 * THREE.MathUtils.smoothstep(height, -1, 1.5) * (1 - THREE.MathUtils.smoothstep(height, 7, 11));
  const cameraRadius = radius + entryPullback;
  camera.position.set(Math.cos(orbit) * cameraRadius, height, Math.sin(orbit) * cameraRadius);
  // The original hard switch at 2 m caused a visible camera flip.
  // At ORIGIN we look down towards the buttress roots and gradually lift our gaze.
  const lowerLook = THREE.MathUtils.lerp(-1.5, height + 2.7, THREE.MathUtils.smoothstep(height, .6, 7));
  const upperLook = THREE.MathUtils.lerp(height + 2.7, height - 7, THREE.MathUtils.smoothstep(height, 44, 52));
  const lookHeight = height <= 44 ? lowerLook : height <= 52 ? upperLook : THREE.MathUtils.lerp(height - 7, 44, THREE.MathUtils.smoothstep(height, 52, 58));
  camera.lookAt(Math.sin(height * .075) * .7, lookHeight, Math.cos(height * .064) * .46);
  const sky = new THREE.Color('#718f85');
  const forest = new THREE.Color('#193324');
  const soilColor = new THREE.Color('#100d09');
  let background;
  if (height < 1) background = soilColor.clone().lerp(forest, THREE.MathUtils.smoothstep(height, -3, 1));
  else background = forest.clone().lerp(sky, THREE.MathUtils.smoothstep(height, 39, 63));
  scene.background.copy(background);
  scene.fog.color.copy(background);
  scene.fog.density = height < 2 ? .014 : height > 40 ? .009 : .014;
  sun.intensity = THREE.MathUtils.lerp(1.7, 4, THREE.MathUtils.smoothstep(height, 0, 63));
  // A subtle spatial drift gives both atmospheric layers independent movement.
  // Keep the original anchor positions to avoid accumulated floating-point drift.
  const atmosphericTime = reducedMotion.matches ? 0 : frame;
  mistMat.uniforms.uTime.value = atmosphericTime;
  // Below grade the mist is visible through the roots; above ground it thins out
  // rather than becoming a bright horizontal sheet across the forest-floor chapter.
  // Above the ground the damp mist regains visibility; under the ceiling it
  // stays subtle so the chamber reads as soil rather than an open forest.
  const surfaceFog = THREE.MathUtils.smoothstep(height, -1.1, .6);
  mistMat.uniforms.uOpacity.value = THREE.MathUtils.lerp(.045, .29, surfaceFog)
    * (1 - THREE.MathUtils.smoothstep(height, 2.0, 8.0) * .72);
  // Hide the underground-only props smoothly when approaching the surface.
  const undergroundVisibility = 1 - THREE.MathUtils.smoothstep(height, -1.0, .5);
  earthCeilingMaterial.opacity = Math.max(.001, undergroundVisibility);
  earthCeilingMaterial.depthWrite = undergroundVisibility > .98;
  ceilingStrata.visible = undergroundVisibility > .5;
  foregroundRoot.visible = undergroundVisibility > .35;
  for (const layer of mistGroups) {
    const phase = atmosphericTime * layer.velocity + layer.phase;
    layer.blob.position.x = layer.originX + Math.sin(phase) * layer.range;
    layer.blob.position.z = layer.originZ + Math.cos(phase * .63) * layer.range * .46;
    layer.blob.position.y = layer.originY + Math.sin(phase * .42) * (layer.type === 'cloud' ? .45 : .08);

  }
  altimeterValue.textContent = `${height < 0 ? '−' : ''}${Math.abs(height).toFixed(1).padStart(4, '0')}`;
  altimeterFill.style.height = `${positionProgress * 100}%`;
  world.restoreLayerVisibility();
  updateDiscoveryMarkers(height);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// Entry is at the bottom of the real document. Browser history / anchor links still work.
const hasAnchor = Boolean(window.location.hash && document.querySelector(window.location.hash));
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.addEventListener('load', () => {
  if (!hasAnchor) window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
  updateScroll();
  positionProgress = desiredProgress;
  document.querySelector('#loading').classList.add('is-hidden');
});
requestAnimationFrame(animate);
document.querySelector('#begin-button').addEventListener('click', () => {
  document.querySelector('#origin').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' });
});

// The spatial discovery popover uses the existing educational content without modal overlays.
const speciesInfo = {
  bromeliad: {label:'KAPITEL 03 / BROMELIEN',title:'Ein Teich zwischen Ästen.',type:'EPIPHYT',role:'WASSERSPEICHER',copy:'Epiphytische Bromelien sammeln Regenwasser in ihren Blattrosetten. So entstehen kleine Wasserreservoire, in denen winzige Ökosysteme leben können.'},
  moss: {label:'KAPITEL 01 / MOOSE',title:'Ein lebender Teppich.',type:'BRYOPhYT',role:'FEUCHTESPEICHER',copy:'Moose speichern Feuchtigkeit, schützen die Rinde vor Austrocknung und schaffen Mikrohabitate für Insekten und Pilze.'},
  leaves: {label:'KAPITEL 02 / AUFSITZER',title:'Leben über dem Boden.',type:'EPIPHYT',role:'LICHTSUCHER',copy:'Aufsitzerpflanzen nutzen den Baum als Lebensraum, ohne ihm direkt Nährstoffe zu entziehen. So erreichen sie mehr Licht als am Boden.'},
  fungi: {label:'KAPITEL 01 / PILZE',title:'Aus Ende wird Anfang.',type:'FUNGI',role:'ZERSETZER',copy:'Baumpilze und andere Zersetzer bauen organisches Material ab und führen Nährstoffe in den Kreislauf des Waldbodens zurück.'},
  symbiosis: {label:'KAPITEL 04 / VERFLECHTUNGEN',title:'Eine Stadt aus Lebensformen.',type:'GEMEINSCHAFT',role:'ZUSAMMENLEBEN',copy:'Moose, Flechten, Pilze und Aufsitzerpflanzen nutzen unterschiedliche Nischen am Baum. Gemeinsam bilden sie ein komplexes Mosaik aus Lebensräumen.'},
  air: {label:'KAPITEL 07 / ATMOSPHÄRE',title:'Die Krone atmet mit.',type:'ÖKOSYSTEMLEISTUNG',role:'LUFTREINIGUNG',copy:'Die Krone bindet Kohlenstoff, gibt Sauerstoff ab und beeinflusst durch Verdunstung das lokale Klima. Ein einzelner Baum wirkt weit über seine Äste hinaus.'}
};
document.querySelector('#discovery-close').addEventListener('click',closeDiscovery);
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeDiscovery();});
