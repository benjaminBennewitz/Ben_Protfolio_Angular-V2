/** @file world/atmosphere.js — Prozeduraler Aufbau des zugehörigen Weltbereichs. */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

/**
 * Erzeugt Nebel, Wolken und Partikel im Atmosphären-Layer.
 * @param {object} context - Explizite Abhängigkeiten beziehungsweise aktueller Dateneintrag.
 * @returns {object} Ergebnis der beschriebenen Operation.
 */
export function buildAtmosphere({ useLayer, scene, between, random }) {
  useLayer('atmosphere');

  /**
   * Zeichnet mehrstufiges Rauschen für weiche, unregelmäßige Wolkenkonturen.
   * @returns {THREE.CanvasTexture} Ergebnis der beschriebenen Operation.
   */
  function makeCloudTexture() {

    const size = 256;                                 // Texturgröße beziehungsweise lokale Instanzgröße.
    const canvas = document.createElement('canvas');  // Canvas für eine lokal erzeugte Textur.

    canvas.width = canvas.height = size;

    const ctx = canvas.getContext('2d');              // 2D-Zeichenkontext der Wolkentextur.
    const image = ctx.createImageData(size, size);    // RGBA-Bilddaten der prozeduralen Wolkentextur.
    const noiseSeed = 10991;                          // Fester Seed des lokalen Oberflächenrauschens.

    /**
     * Berechnet einen deterministischen Gitterwert für das prozedurale Rauschen.
     * @param {number} x - Horizontale X-Koordinate des aktuellen Punkts.
     * @param {number} y - Lokale Höhen- beziehungsweise zweite Flächenkoordinate.
     * @returns {number} Berechneter Zahlenwert.
     */
    const hash = (x, y) => {

      let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + noiseSeed;  // Lokale Höhe der aktuellen Teilgeometrie.

      h = Math.imul(h ^ (h >>> 13), 1274126177);
      return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
    };

    /**
     * Glättet den Übergang zwischen benachbarten Rauschwerten.
     * @param {number} t - Normierter Fortschritt entlang des aktuellen Abschnitts.
     * @returns {number} Berechneter Zahlenwert.
     */
    const fade = t => t * t * (3 - 2 * t);

    /**
     * Interpoliert geglättete Gitterwerte zu zweidimensionalem Rauschen.
     * @param {number} x - Horizontale X-Koordinate des aktuellen Punkts.
     * @param {number} y - Lokale Höhen- beziehungsweise zweite Flächenkoordinate.
     * @returns {number} Berechneter Zahlenwert.
     */
    function valueNoise(x, y) {

      const ix = Math.floor(x);                                           // Horizontaler Index im Rauschgitter.
      const iy = Math.floor(y);                                           // Vertikaler Index im Rauschgitter.
      const fx = fade(x - ix);                                            // Geglätteter horizontaler Rauschanteil.
      const fy = fade(y - iy);                                            // Geglätteter vertikaler Rauschanteil.
      const a = hash(ix, iy) * (1 - fx) + hash(ix + 1, iy) * fx;          // Erster Vergleichs- oder Interpolationswert.
      const b = hash(ix, iy + 1) * (1 - fx) + hash(ix + 1, iy + 1) * fx;  // Zweiter Vergleichs- oder Interpolationswert.

      return a * (1 - fy) + b * fy;
    }
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {

        const u = ((x + 0.5) / size) * 2 - 1;                                 // Normierte horizontale Textur- oder Flächenkoordinate.
        const v = ((y + 0.5) / size) * 2 - 1;                                 // Normierte vertikale Textur- oder Flächenkoordinate.
        const shape = Math.exp(
          -Math.pow(Math.abs(u) / 0.86, 4) * 1.8 - Math.pow(Math.abs(v) / 0.68, 4) * 1.6,
        );                                                                    // Grundkontur der aktuellen Blatt- oder Texturform.
        const noise =
          0.53 * valueNoise(u * 3 + 8, v * 3 + 8) +
          0.3 * valueNoise(u * 8 + 21, v * 8 + 21) +
          0.17 * valueNoise(u * 19 + 35, v * 19 + 35);                        // Mehrstufiger Rauschwert der aktuellen Texturposition.
        const wisps = THREE.MathUtils.smoothstep(noise * shape, 0.18, 0.49);  // Geglätteter Dichtewert der Wolkentextur.
        const alpha = Math.min(1, wisps * shape * 0.77);                      // Deckkraft der aktuellen Texturposition.
        const i = (y * size + x) * 4;                                         // Laufender Index der äußeren Geometrieschleife.

        image.data[i] = 250;
        image.data[i + 1] = 253;
        image.data[i + 2] = 244;
        image.data[i + 3] = Math.round(alpha * 255);
      }
    ctx.putImageData(image, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);  // Aus dem Canvas erzeugte Three.js-Textur.

    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  const cloudTexture = makeCloudTexture();                                        // Lokal erzeugte Wolken-Alpha-Textur.
  const mistMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: {
        value: 0,
      },
      uOpacity: {
        value: 0.33,
      },
    },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
    uniform float uTime;
    uniform float uOpacity;
    varying vec2 vUv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),
                 mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);
    }
    float fbm(vec2 p) {
      float n=0., a=.5;
      for(int i=0;i<4;i++){ n += a*noise(p); p=p*2.07+vec2(13.7,5.1); a*=.5; }
      return n;
    }
    void main() {
      vec2 uv = vUv * 5.0;
      float time = uTime;
      vec2 warp = vec2(fbm(uv*.48+vec2(time*.045,0.)),fbm(uv*.48+vec2(0.,-time*.035)));
      float density = fbm(uv+warp*1.45+vec2(time*.065,time*.025));
      float billow = smoothstep(.19,.75,density);
      float edge = smoothstep(0.,.18,vUv.x)*smoothstep(0.,.18,vUv.y)
                 *smoothstep(0.,.18,1.-vUv.x)*smoothstep(0.,.18,1.-vUv.y);
      float alpha = (0.50 + billow*.5) * edge * uOpacity;
      gl_FragColor = vec4(vec3(.68,.80,.70), alpha);
    }`,
  });                                                                             // Shader-Material des kontinuierlichen Bodennebels.
  const cloudMat = new THREE.SpriteMaterial({
    map: cloudTexture,
    transparent: true,
    opacity: 0.52,
    depthWrite: false,
    fog: false,
    color: '#f5f7e9',
  });                                                                             // Transparentes Material der Wolkenkarten.
  const mistGroups = [];                                                          // Wolkenobjekte mit stabilen Bewegungsankern.
  const fogSurface = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), mistMat);  // Kontinuierliche Nebelfläche über dem Waldboden.

  fogSurface.rotation.x = -Math.PI / 2;
  fogSurface.position.y = 0.13;
  scene.add(fogSurface);
  for (let i = 0; i < 46; i++) {

    const sprite = new THREE.Sprite(cloudMat);  // Einzelne transparente Wolkenkarte.

    sprite.position.set(between(-44, 44), between(51, 67), between(-44, 44));
    sprite.scale.set(between(17, 39), between(7, 16), 1);
    scene.add(sprite);
    mistGroups.push({
      blob: sprite,
      originX: sprite.position.x,
      originZ: sprite.position.z,
      originY: sprite.position.y,
      phase: random() * Math.PI * 2,
      velocity: between(0.08, 0.19),
      drift: between(0.12, 0.3),
      range: between(2, 4.5),
      type: 'cloud',
    });
  }

  const particlesCount = 400;                                                     // Anzahl der atmosphärischen Partikel.
  const particlePositions = new Float32Array(particlesCount * 3);                 // Positionspuffer der atmosphärischen Partikel.

  for (let i = 0; i < particlesCount; i++) {
    particlePositions[i * 3] = between(-30, 30);
    particlePositions[i * 3 + 1] = between(-6, 55);
    particlePositions[i * 3 + 2] = between(-30, 30);
  }

  const particleGeo = new THREE.BufferGeometry();                                 // Punktgeometrie der atmosphärischen Partikel.

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

  const particles = new THREE.Points(
    particleGeo,
    new THREE.PointsMaterial({
      color: '#e0ecc1',
      size: 0.08,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
    }),
  );                                                                              // Renderbare atmosphärische Punktwolke.

  scene.add(particles);
  return {
    mistMat,
    mistGroups,
  };
}
