/**
 * @file Geometrisch gekoppelte Papierfaltung für FOLD / Kapitel 02.A.
 * Die Three.js-Bühne wird nur aktiviert, wenn WebGL und das Modul verfügbar sind.
 * Die HTML-Version bleibt eine zugängliche Alternative.
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const section = document.querySelector('#the-other-side');
const mount = document.querySelector('#fold-three-stage');
const stage = mount?.parentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

if (section && mount && stage && !reducedMotion.matches) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch {
    renderer = null;
  }
  if (renderer) {
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.append(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 100);
    camera.position.set(0, 1.3, 12.8);
    camera.lookAt(0, 0, 0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x666774, 2.25));
    const light = new THREE.DirectionalLight(0xffffff, 3.3);
    light.position.set(-3, 6, 8);
    light.castShadow = true;
    light.shadow.mapSize.set(1024, 1024);
    light.shadow.camera.left = -8;
    light.shadow.camera.right = 8;
    light.shadow.camera.top = 8;
    light.shadow.camera.bottom = -8;
    scene.add(light);

    const colors = { blue: '#2458f5', yellow: '#ffce45', coral: '#ff674a', paper: '#f0ede5' };
    const paperWidth = 2.2;
    const paperHeight = 3.05;
    const makeTexture = (background, title, index, details, color) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 720;
      const context = canvas.getContext('2d');
      context.fillStyle = background;
      context.fillRect(0, 0, 512, 720);
      context.fillStyle = color;
      context.font = 'bold 24px Arial';
      context.fillText(index, 28, 46);
      context.font = '900 75px Arial';
      const words = title.split(' ');
      words.forEach((word, i) => context.fillText(word, 28, 205 + i * 84, 455));
      context.font = 'bold 22px Arial';
      context.fillText(details, 28, 652, 455);
      context.globalAlpha = 0.18;
      context.fillRect(28, 665, 456, 3);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      return texture;
    };
    const planeGeometry = new THREE.PlaneGeometry(paperWidth, paperHeight);
    const backsideTexture = makeTexture(colors.paper, 'ANOTHER SIDE', 'FOLD / REVERSE', 'LOOK AGAIN.', '#17191f');
    function panel(parent, x, background, title, index, details, ink) {
      const geometry = planeGeometry;
      const frontTexture = makeTexture(background, title, index, details, ink);
      const front = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ map: frontTexture, side: THREE.FrontSide, roughness: .94, metalness: 0 }));
      front.position.x = x;
      front.position.z = .009;
      front.castShadow = true;
      front.receiveShadow = true;
      parent.add(front);
      const back = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ map: backsideTexture, side: THREE.FrontSide, roughness: .96, metalness: 0 }));
      back.position.x = x;
      back.position.z = -.009;
      back.rotation.y = Math.PI;
      back.castShadow = true;
      parent.add(back);
      return { front, back };
    }
    const main = new THREE.Group();
    scene.add(main);
    panel(main, 0, colors.yellow, 'TURN IT OVER', '02 / QUESTION', 'CHANGE THE ANGLE.', '#17191f');
    const leftHinge = new THREE.Group();
    leftHinge.position.x = -paperWidth / 2;
    main.add(leftHinge);
    panel(leftHinge, -paperWidth / 2, colors.blue, 'ONE THING', '01 / DISCOVER', 'THERE IS MORE.', '#ffffff');
    const rightHinge = new THREE.Group();
    rightHinge.position.x = paperWidth / 2;
    main.add(rightHinge);
    panel(rightHinge, paperWidth / 2, colors.coral, 'SEE MORE', '03 / REIMAGINE', 'LOOK AGAIN.', '#17191f');

    // Nach dem Schließen wird aus den drei Flügeln ein Paket. Seine sichtbaren
    // Flächen werden nun tatsächlich entlang drei Scharnierlinien halbiert.
    const packet = new THREE.Group();
    scene.add(packet);
    packet.visible = false;
    const hw = paperWidth / 2;
    const hh = paperHeight / 2;
    function sheet(parent, geometry, color, x, y, z = 0) {
      const material = new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, roughness: .94, metalness: 0 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x,y,z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    }
    // Unteres Rechteck als Ausgangsbasis; oberes Rechteck klappt um y=0 herab.
    const quarterGeometry = new THREE.PlaneGeometry(paperWidth, hh);
    sheet(packet, quarterGeometry, colors.yellow, 0, -hh / 2);
    const horizontalHinge = new THREE.Group();
    packet.add(horizontalHinge);
    sheet(horizontalHinge, quarterGeometry, colors.blue, 0, hh / 2, .014);
    // Nach der ersten Halbierung liegt nur die untere Hälfte sichtbar.
    // Die rechte Hälfte davon faltet um die Mittellinie nach links.
    const verticalHinge = new THREE.Group();
    verticalHinge.position.y = -hh / 2;
    packet.add(verticalHinge);
    const halfGeometry = new THREE.PlaneGeometry(hw, hh);
    sheet(verticalHinge, halfGeometry, colors.coral, hw / 2, 0, .028);
    // Finale diagonale Dreiecksfaltung auf dem Viertelpaket.
    const triangleShape = new THREE.Shape();
    triangleShape.moveTo(0, 0);
    triangleShape.lineTo(hw, 0);
    triangleShape.lineTo(0, -hh);
    triangleShape.closePath();
    const triangle = new THREE.ShapeGeometry(triangleShape);
    const diagonalHinge = new THREE.Group();
    diagonalHinge.position.set(-hw / 2, 0, .048);
    verticalHinge.add(diagonalHinge);
    sheet(diagonalHinge, triangle, colors.blue, 0, 0);

    const clamp = value => Math.max(0, Math.min(1, value));
    const smooth = (start, end, value) => {
      const t = clamp((value - start) / (end - start));
      return t * t * (3 - 2 * t);
    };
    function update() {
      const bounds = section.getBoundingClientRect();
      const range = Math.max(1, bounds.height - innerHeight);
      const scroll = clamp(-bounds.top / range);
      const open = smooth(.06, .48, scroll);
      const close = smooth(.59, .70, scroll);
      const exposed = open * (1 - close);
      leftHinge.rotation.y = -Math.PI * (1 - exposed) + .045 * (1 - exposed);
      rightHinge.rotation.y = Math.PI * (1 - exposed) - .045 * (1 - exposed);
      main.rotation.x = -.075;
      main.visible = scroll < .708;
      packet.visible = scroll >= .708;
      if (packet.visible) {
        const fold1 = smooth(.70, .80, scroll);
        const fold2 = smooth(.81, .90, scroll);
        const fold3 = smooth(.91, .995, scroll);
        horizontalHinge.rotation.x = -Math.PI * fold1 + .04 * fold1;
        verticalHinge.rotation.y = -Math.PI * fold2 + .05 * fold2;
        diagonalHinge.rotation.set(0, (Math.PI * .82) * fold3, -(Math.PI / 4) * fold3);
        packet.rotation.x = -.075;
      }
      renderer.render(scene, camera);
    }
    let raf = 0;
    function schedule() {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; update(); });
    }
    function resize() {
      const w = Math.max(1, mount.clientWidth);
      const h = Math.max(1, mount.clientHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.z = w < 650 ? 16.5 : 12.8;
      camera.updateProjectionMatrix();
      schedule();
    }
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    addEventListener('scroll', schedule, { passive: true });
    stage.classList.add('is-three-active');
    resize();
    schedule();
    addEventListener('pagehide', () => {
      observer.disconnect();
      removeEventListener('scroll', schedule);
      renderer.dispose();
    }, { once: true });
  }
}
