/* src/design-studies/terra/scripts/glass.js */

/**
 * @file Tiefenabhängige Mattglas-Komposition.
 * @description Verbindet stabile Tiefenebenen, Froschkontaktflächen, Mikrorelief und ein festes Drahtgitter.
 * @author Benjamin Bennewitz
 */

import * as THREE from '../../bentendo/vendor/three/three.module.js';

/** Gemeinsamer Vertex-Shader der bildschirmfüllenden Materialebene. */
const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/**
 * Materialnäherung mit begrenztem Samplebudget statt physikalischem Pathtracing.
 * Farbe und Deckung werden je Tiefenebene gemeinsam vorgefiltert und erst danach komponiert.
 * Feste Abstände je Ebene vermeiden sprunghafte Filterradien an bewegten Silhouetten.
 * Nur die Kontaktmaske des separat gerenderten Frosches verwendet die Pixeltiefe.
 * Ein langsamer Nebelschleier liegt zwischen den Vegetationsebenen; Beschlag und Tropfen bleiben am Glas.
 * Dadurch werden helle Hintergrundpixel nicht vorzeitig in Vordergrundkonturen eingemischt.
 */
const FRAGMENT_SHADER = `
  uniform sampler2D uBackground;
  uniform sampler2D uCanopy;
  uniform sampler2D uMiddle;
  uniform sampler2D uForeground;
  uniform sampler2D uFrog;
  uniform sampler2D uFrogDepth;
  uniform vec2 uResolution;
  uniform vec2 uSourceUv;
  uniform float uPixelRatio;
  uniform float uFrost;
  uniform float uMoisture;
  uniform float uTime;
  uniform float uGrid;
  uniform float uLight;
  uniform float uDark;
  uniform float uCameraNear;
  uniform float uCameraFar;
  uniform float uGlassDistance;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), f.x), f.y);
  }

  vec4 condensation(vec2 pixel) {
    vec2 cell = floor(pixel / 92.0);
    vec2 center = (vec2(hash(cell + 19.0), hash(cell + 73.0)) * 0.64 + 0.18) * 92.0;
    float size = mix(2.4, 5.5, hash(cell + 107.0));
    vec2 local = (mod(pixel, 92.0) - center) / vec2(size * 0.8, size * 1.3);
    float distance = length(local);
    float aa = max(fwidth(distance), 0.06);
    float coverage = (1.0 - smoothstep(0.9 - aa, 1.0 + aa, distance)) * step(0.72, hash(cell + 43.0));
    float rim = exp(-pow((distance - 0.74) * 7.0, 2.0)) * coverage;
    return vec4(local * coverage, coverage, rim * max(0.0, dot(-local, normalize(vec2(-0.7, 1.0)))));
  }

  float viewDistance(float depth) {
    return uCameraNear * uCameraFar / (uCameraFar - depth * (uCameraFar - uCameraNear));
  }

  float blurRadius(float distanceToGlass) {
    return (0.35 + 5.0 * (1.0 - exp(-distanceToGlass * 4.0))
      + 34.0 * (1.0 - exp(-distanceToGlass * 0.19)) + min(distanceToGlass, 18.0) * 0.65) * uFrost;
  }

  vec4 blurLayer(sampler2D colors, float gap, vec2 reliefNormal) {
    float radius = blurRadius(gap);
    float scale = float(textureSize(colors, 0).x) / uResolution.x;
    float mipLevel = log2(max(1.0, radius * 0.65 * uPixelRatio * scale));
    vec2 distortion = reliefNormal * (0.6 + gap * 0.35) * uFrost * uPixelRatio / uResolution;
    vec2 center = clamp(vUv + distortion, vec2(0.002), vec2(0.998));
    vec4 color = textureLod(colors, center, mipLevel) * 2.0;
    for (int i = 0; i < 4; i++) {
      float angle = (float(i) + 0.5) * 1.57079633;
      vec2 offset = vec2(cos(angle), sin(angle)) * radius * 0.58 * uPixelRatio / uResolution;
      color += textureLod(colors, clamp(center + offset, vec2(0.002), vec2(0.998)), mipLevel);
    }
    return color / 6.0;
  }

  void main() {
    vec2 pixel = vUv * uResolution / uPixelRatio;
    float relief = noise(pixel * 0.44) * 0.64 + noise(pixel * 1.1) * 0.36;
    vec2 reliefNormal = vec2(noise(pixel * 0.43 + 17.0), noise(pixel * 0.43 + 71.0)) - 0.5;
    vec4 drops = uMoisture > 0.0 ? condensation(pixel) : vec4(0.0);
    vec2 refractionNormal = reliefNormal + drops.xy * uMoisture * 1.6;
    vec3 color = blurLayer(uBackground, 16.0, refractionNormal).rgb;
    vec4 canopy = blurLayer(uCanopy, 14.0, refractionNormal);
    vec4 middle = blurLayer(uMiddle, 8.0, refractionNormal);
    vec4 foreground = blurLayer(uForeground, 2.5, refractionNormal);
    color = canopy.rgb + color * (1.0 - canopy.a);
    if (uMoisture > 0.0) {
      vec2 mistUv = vUv * vec2(uResolution.x / uResolution.y, 1.0) * 3.0;
      float mist = noise(mistUv + vec2(uTime * 0.018, -uTime * 0.008));
      mist = mist * 0.7 + noise(mistUv * 1.9 + vec2(-uTime * 0.01, 7.0)) * 0.3;
      float veil = (0.025 + mist * 0.15) * uMoisture;
      color = mix(color, mix(vec3(0.57, 0.64, 0.43), vec3(0.095, 0.15, 0.063), uDark), veil);
    }
    color = middle.rgb + color * (1.0 - middle.a);
    color = foreground.rgb + color * (1.0 - foreground.a);

    vec4 contactColor = textureLod(uFrog, vUv, 0.0);
    float frogDepth = texture2D(uFrogDepth, vUv).r;
    float contact = frogDepth < 0.99999 ? (1.0 - smoothstep(0.015, 0.075,
      max(0.0, viewDistance(frogDepth) - uGlassDistance))) * contactColor.a : 0.0;
    vec4 frog = blurLayer(uFrog, 0.55, refractionNormal);
    frog = mix(frog, contactColor, contact);
    color = frog.rgb + color * (1.0 - frog.a);

    vec2 sourceOffset = (vUv - uSourceUv) * vec2(uResolution.x / uResolution.y, 1.0);
    float illumination = exp(-length(sourceOffset * vec2(0.8, 1.25)) * 2.5);
    vec3 sourceTint = mix(vec3(1.0, 0.9, 0.66), vec3(0.62, 0.73, 0.43), uDark);
    float frosting = uFrost * (0.035 + illumination * 0.16) * (1.0 - contact * 0.8);
    color = mix(color, mix(vec3(0.84, 0.87, 0.74), vec3(0.07, 0.13, 0.045), uDark), frosting);
    float glint = pow(max(0.0, reliefNormal.x * 0.6 + reliefNormal.y * 0.8 + 0.48), 5.0);
    color += (relief - 0.5) * (0.035 + illumination * 0.07) * uFrost * mix(1.0, 0.5, uDark);
    color += sourceTint * glint * illumination * 0.26 * uFrost * uLight;

    if (uMoisture > 0.0) {
      float film = smoothstep(0.38, 0.8, noise(pixel * 0.006) * 0.7 + noise(pixel * 0.014 + 41.0) * 0.3);
      float coating = film * uMoisture * 0.1 * (1.0 - contact);
      color = mix(color, mix(vec3(0.73, 0.77, 0.64), vec3(0.11, 0.16, 0.07), uDark), coating);
      color *= 1.0 - drops.z * uMoisture * 0.11 * (1.0 - contact);
      color += drops.w * sourceTint * uMoisture * mix(0.055, 0.024, uDark) * (1.0 - contact);
    }

    vec2 cell = pixel / 13.0 + reliefNormal * 0.025;
    vec2 lineDistance = abs(fract(cell - 0.5) - 0.5);
    vec2 lineWidth = max(fwidth(cell) * 0.55, vec2(0.014));
    vec2 line = 1.0 - smoothstep(vec2(0.0), lineWidth, lineDistance);
    float wire = max(line.x, line.y) * uGrid;
    color = mix(color, color * 0.68 + mix(vec3(0.1, 0.12, 0.08), vec3(0.025, 0.04, 0.018), uDark), wire * 0.44);
    vec2 highlightDistance = abs(fract(cell - 0.47) - 0.5);
    vec2 highlight = 1.0 - smoothstep(vec2(0.0), lineWidth, highlightDistance);
    color += max(highlight.x, highlight.y) * uGrid * mix(0.055, 0.018, uDark);
    float vignette = (1.0 - smoothstep(0.25, 0.95, length((vUv - 0.5) * vec2(0.85, 0.75))));
    color *= 0.9 + vignette * 0.1;
    gl_FragColor = vec4(max(color, vec3(0.0)), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/**
 * Erstellt die Glasscheibe als einmaligen bildschirmfüllenden Renderpass.
 * @param {Record<string, THREE.WebGLRenderTarget>} targets Isolierte Farbebenen; nur der Frosch benötigt eine Kontakttiefe.
 * @returns {{scene: THREE.Scene, camera: THREE.Camera, material: THREE.ShaderMaterial, dispose: function(): void}}
 */
export function createGlass(targets) {
  const scene = new THREE.Scene();
  const camera = new THREE.Camera();
  const geometry = new THREE.PlaneGeometry(2, 2);
  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uBackground: { value: targets.background.texture },
      uCanopy: { value: targets.canopy.texture },
      uMiddle: { value: targets.middle.texture },
      uForeground: { value: targets.foreground.texture },
      uFrog: { value: targets.frog.texture }, uFrogDepth: { value: targets.frog.depthTexture },
      uSourceUv: { value: new THREE.Vector2(0.15, 0.9) },
      uResolution: { value: new THREE.Vector2(1, 1) }, uPixelRatio: { value: 1 },
      uCameraNear: { value: 0.1 }, uCameraFar: { value: 50 }, uGlassDistance: { value: 12 },
      uMoisture: { value: 0.4 }, uTime: { value: 0 },
      uFrost: { value: 0.75 }, uGrid: { value: 1 }, uLight: { value: 1 }, uDark: { value: 0 },
    },
  });
  scene.add(new THREE.Mesh(geometry, material));
  return {
    scene, camera, material,
    /** Entfernt die ausschließlich für den Glaspass angelegten GPU-Ressourcen. */
    dispose() {
      geometry.dispose();
      material.dispose();
      scene.clear();
    },
  };
}
