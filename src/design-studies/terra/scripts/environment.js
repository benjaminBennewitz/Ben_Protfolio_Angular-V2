/* src/design-studies/terra/scripts/environment.js */

/**
 * @file Räumlicher Gewächshaus-Hintergrund und sichtbare Lichtquelle.
 * @description Kapselt Rückwand, Streben, Boden und abgestimmte Licht-/Farbzustände.
 * @author Benjamin Bennewitz
 */

import * as THREE from '../../bentendo/vendor/three/three.module.js';

/** Farb- und Lichtparameter der beiden Gewächshausstimmungen. */
const PALETTES = Object.freeze({
  light: { fog: '#6e8258', frame: '#65715a', floor: '#475139', sun: '#e9e6bb', sky: '#dce5bc', ground: '#35472b', fill: 1.05, direct: 2.0, source: 38 },
  dark: { fog: '#24371e', frame: '#263522', floor: '#172315', sun: '#c9d2a1', sky: '#93a777', ground: '#172612', fill: 0.64, direct: 1.15, source: 22 },
});

/**
 * Baut einen tief hinter den Pflanzen liegenden, wiederverwendbaren Raum.
 * @returns {{group: THREE.Group, surfaces: THREE.Group, fog: THREE.FogExp2, sourcePosition: THREE.Vector3, setTheme: function(string, number): void, dispose: function(): void}}
 */
export function createEnvironment() {
  const group = new THREE.Group();
  const surfaces = new THREE.Group();
  group.add(surfaces);
  const wallGeometry = new THREE.PlaneGeometry(72, 44);
  const wallMaterial = new THREE.ShaderMaterial({
    uniforms: { uDark: { value: 0 }, uLight: { value: 1 } },
    vertexShader: `
      varying vec2 vPosition;
      void main() {
        vPosition = position.xy;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vPosition;
      uniform float uDark;
      uniform float uLight;
      void main() {
        float daylight = 1.0 - smoothstep(-9.0, 8.0, vPosition.x);
        vec3 day = mix(vec3(0.06, 0.13, 0.04), vec3(0.39, 0.48, 0.27), daylight);
        vec3 night = mix(vec3(0.013, 0.028, 0.008), vec3(0.055, 0.09, 0.029), daylight);
        vec2 windowLight = (vPosition - vec2(-12.0, 9.5)) / vec2(9.5, 6.5);
        float diffuseWindow = exp(-dot(windowLight, windowLight) * 0.85);
        vec3 source = mix(vec3(0.93, 0.9, 0.67), vec3(0.43, 0.53, 0.27), uDark);
        vec3 color = mix(day, night, uDark);
        color += source * diffuseWindow * mix(0.85, 0.34, uDark);
        float panes = 0.94 + sin(vPosition.x * 1.2 + vPosition.y * 0.3) * 0.025;
        gl_FragColor = vec4(color * panes * uLight, 1.0);
      }
    `,
  });
  const wall = new THREE.Mesh(wallGeometry, wallMaterial);
  wall.position.z = -16.5;
  surfaces.add(wall);

  const frameMaterial = new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.25 });
  const verticalGeometry = new THREE.BoxGeometry(0.075, 15, 0.08);
  const horizontalGeometry = new THREE.BoxGeometry(28, 0.06, 0.08);
  for (let x = -12; x <= 12; x += 4) {
    const support = new THREE.Mesh(verticalGeometry, frameMaterial);
    support.position.set(x, 0, -15.8);
    surfaces.add(support);
  }
  for (const y of [-3.8, 2.8, 6.2]) {
    const support = new THREE.Mesh(horizontalGeometry, frameMaterial);
    support.position.set(0, y, -15.8);
    surfaces.add(support);
  }
  const floorGeometry = new THREE.PlaneGeometry(40, 24);
  const floorMaterial = new THREE.MeshStandardMaterial({ roughness: 0.95 });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -5.9, -6);
  surfaces.add(floor);

  const sourcePosition = new THREE.Vector3(-12, 9.5, -16.5);
  const source = new THREE.PointLight('#e9e6bb', 38, 38, 2);
  source.position.set(-8, 8, -8);
  const direct = new THREE.DirectionalLight('#fff2cc', 2.6);
  direct.position.set(-5.4, 7, 4);
  const fill = new THREE.HemisphereLight('#e8efcf', '#42523a', 1.35);
  group.add(source, direct, fill);
  const fog = new THREE.FogExp2('#879b7b', 0.022);

  return {
    group, surfaces, fog, sourcePosition,
    /** Synchronisiert Raum, atmosphärische Tiefe und reale Lichtquellen mit Theme und Szene. */
    setTheme(theme, intensity = 1) {
      const palette = PALETTES[theme] ?? PALETTES.light;
      const dark = theme === 'dark';
      wallMaterial.uniforms.uDark.value = Number(dark);
      wallMaterial.uniforms.uLight.value = intensity;
      frameMaterial.color.set(palette.frame);
      floorMaterial.color.set(palette.floor);
      fog.color.set(palette.fog);
      fog.density = dark ? 0.016 : 0.018;
      source.color.set(palette.sun);
      source.intensity = palette.source * intensity;
      direct.color.set(palette.sun);
      direct.intensity = palette.direct * intensity;
      fill.color.set(palette.sky);
      fill.groundColor.set(palette.ground);
      fill.intensity = palette.fill * intensity;
    },
    /** Entfernt alle raumeigenen Materialien und geteilten Geometrien genau einmal. */
    dispose() {
      for (const geometry of [wallGeometry, verticalGeometry, horizontalGeometry, floorGeometry]) geometry.dispose();
      for (const material of [wallMaterial, frameMaterial, floorMaterial]) material.dispose();
      group.clear();
    },
  };
}
