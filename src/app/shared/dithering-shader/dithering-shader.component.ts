/* src/app/shared/dithering-shader/dithering-shader.component.ts */

/**
 * @file Animierter Dithering-Shader als wiederverwendbare WebGL2-Komponente.
 * @description Rendert pixelige Swirl- und Wave-Muster GPU-beschleunigt, übernimmt CSS-Design-Tokens und pausiert außerhalb des Viewports.
 */

import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, NgZone, OnDestroy, ViewChild, inject } from '@angular/core';

/** Unterstützte Dithering-Matrizen. */
type DitheringMatrixType = '2x2' | '4x4' | '8x8';

/** Unterstützte prozedurale Shader-Muster. */
type DitheringShape = 'swirl' | 'wave';

/** RGBA-Farbwert mit normalisierten Kanälen von 0 bis 1. */
type RgbaColor = readonly [number, number, number, number];

/** Uniform-Locations des Fragment-Shaders. */
interface ShaderUniforms {
  readonly resolution: WebGLUniformLocation;
  readonly time: WebGLUniformLocation;
  readonly speed: WebGLUniformLocation;
  readonly intensity: WebGLUniformLocation;
  readonly zoom: WebGLUniformLocation;
  readonly frontColor: WebGLUniformLocation;
  readonly backColor: WebGLUniformLocation;
  readonly ditherSize: WebGLUniformLocation;
  readonly shape: WebGLUniformLocation;
}

/** Dekorativer GPU-Shader für animierte Dithering-Hintergründe. */
@Component({
  selector: 'bp-dithering-shader',
  standalone: true,
  templateUrl: './dithering-shader.component.html',
  styleUrl: './dithering-shader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DitheringShaderComponent implements AfterViewInit, OnDestroy {
  /** Canvas-Element für das WebGL-Rendering. */
  @ViewChild('canvasRef')
  private readonly canvasRef?: ElementRef<HTMLCanvasElement>;

  /** Host-Element für Größe und CSS-Farbauflösung. */
  private readonly hostRef = inject(ElementRef<HTMLElement>);

  /** Führt den Animationsloop außerhalb der Angular-Zone aus. */
  private readonly ngZone = inject(NgZone);

  /** WebGL2-Kontext des Canvas. */
  private gl?: WebGL2RenderingContext;

  /** Kompiliertes GPU-Programm für den Swirl. */
  private program?: WebGLProgram;

  /** Uniform-Locations für alle pro Frame benötigten Werte. */
  private uniforms?: ShaderUniforms;

  /** Beobachtet Größenänderungen des Hosts. */
  private resizeObserver?: ResizeObserver;

  /** Beobachtet Theme-, Kontrast- und Motion-Änderungen. */
  private rootObserver?: MutationObserver;

  /** Pausiert Rendering außerhalb des sichtbaren Viewports. */
  private visibilityObserver?: IntersectionObserver;

  /** ID des laufenden Animationsframes. */
  private animationFrameId = 0;

  /** Startzeit der aktuellen Animationssequenz. */
  private animationStart = 0;

  /** Sichtbarkeitsstatus des Hosts. */
  private isVisible = true;

  /** Verhindert wiederholte Starts nach einem fehlgeschlagenen WebGL-Setup. */
  private isWebGlAvailable = false;

  /** Vordergrundfarbe als normalisierte RGBA-Kanäle. */
  private frontColor: RgbaColor = [167 / 255, 1, 25 / 255, 1];

  /** Hintergrundfarbe als normalisierte RGBA-Kanäle. */
  private backColor: RgbaColor = [0, 0, 0, 0];

  /** CSS-Farbe für die transparenten bzw. dunklen Shader-Flächen. */
  @Input() colorBack = 'transparent';

  /** CSS-Farbe für die sichtbaren Dither-Pixel. */
  @Input() colorFront = 'var(--bp-color-accent)';

  /** Prozedurale Form des Dithering-Musters. */
  @Input() shape: DitheringShape = 'swirl';

  /** Bayer-Matrix für das Dithering. */
  @Input() type: DitheringMatrixType = '4x4';

  /** Größe eines Shader-Pixels in CSS-Pixeln. */
  @Input() pxSize = 4;

  /** Geschwindigkeit des Swirls. */
  @Input() speed = 0.9;

  /** Dichte und Stärke des Musters. */
  @Input() intensity = 1;

  /**
   * Sichtbarer Ausschnitt des mathematischen Swirls.
   * 0.4 entspricht dem bisherigen 250-vw-Zoom, ohne eine 2.5-fach größere Renderfläche zu erzeugen.
   */
  @Input() zoom = 1;

  /** Dekorativer Hintergrund wird von Screenreadern ignoriert. */
  @HostBinding('attr.aria-hidden')
  protected readonly ariaHidden = 'true';

  /** Initialisiert WebGL, Observer und Animation. */
  ngAfterViewInit(): void {
    const canvas = this.canvasRef?.nativeElement;

    if (!canvas) {
      return;
    }

    this.refreshColors();
    this.resizeCanvas();
    this.isWebGlAvailable = this.initializeWebGl(canvas);
    this.bindObservers();

    if (!this.isWebGlAvailable) {
      this.renderStaticFallback(canvas);
      return;
    }

    this.updateAnimationState();
  }

  /** Räumt Browser-Observer, GPU-Ressourcen und Animationsframes auf. */
  ngOnDestroy(): void {
    window.cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = 0;
    this.resizeObserver?.disconnect();
    this.rootObserver?.disconnect();
    this.visibilityObserver?.disconnect();

    if (this.gl && this.program) {
      this.gl.deleteProgram(this.program);
    }
  }

  /** Registriert Resize-, Sichtbarkeits- und Theme-Beobachter. */
  private bindObservers(): void {
    const host = this.hostRef.nativeElement;

    this.resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas();

      if (this.isWebGlAvailable) {
        this.renderCurrentFrame();
        return;
      }

      const canvas = this.canvasRef?.nativeElement;
      canvas && this.renderStaticFallback(canvas);
    });
    this.resizeObserver.observe(host);

    this.visibilityObserver = new IntersectionObserver(([entry]) => {
      this.isVisible = entry?.isIntersecting ?? false;
      this.updateAnimationState();
    }, { threshold: 0.05 });
    this.visibilityObserver.observe(host);

    this.rootObserver = new MutationObserver(() => {
      this.refreshColors();

      if (this.isWebGlAvailable) {
        this.updateAnimationState();
        return;
      }

      const canvas = this.canvasRef?.nativeElement;
      canvas && this.renderStaticFallback(canvas);
    });
    this.rootObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'data-contrast', 'data-color-vision', 'data-motion'],
    });
  }

  /** Initialisiert WebGL2 und kompiliert das GPU-Programm. */
  private initializeWebGl(canvas: HTMLCanvasElement): boolean {
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      depth: false,
      desynchronized: true,
      failIfMajorPerformanceCaveat: true,
      powerPreference: 'high-performance',
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      stencil: false,
    });

    if (!gl) {
      return false;
    }

    const vertexShader = this.compileShader(gl, gl.VERTEX_SHADER, this.vertexShaderSource);
    const fragmentShader = this.compileShader(gl, gl.FRAGMENT_SHADER, this.fragmentShaderSource);

    if (!vertexShader || !fragmentShader) {
      vertexShader && gl.deleteShader(vertexShader);
      fragmentShader && gl.deleteShader(fragmentShader);
      return false;
    }

    const program = gl.createProgram();

    if (!program) {
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return false;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('Dithering-Shader konnte nicht verlinkt werden.', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return false;
    }

    const uniforms = this.resolveUniforms(gl, program);

    if (!uniforms) {
      gl.deleteProgram(program);
      return false;
    }

    this.gl = gl;
    this.program = program;
    this.uniforms = uniforms;

    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.useProgram(program);
    this.resizeViewport();

    return true;
  }

  /** Kompiliert einen einzelnen GLSL-Shader und liefert bei Fehlern keinen Shader zurück. */
  private compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | undefined {
    const shader = gl.createShader(type);

    if (!shader) {
      return undefined;
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('Dithering-Shader konnte nicht kompiliert werden.', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return undefined;
    }

    return shader;
  }

  /** Löst alle benötigten Uniform-Locations einmalig auf. */
  private resolveUniforms(gl: WebGL2RenderingContext, program: WebGLProgram): ShaderUniforms | undefined {
    const resolution = gl.getUniformLocation(program, 'u_resolution');
    const time = gl.getUniformLocation(program, 'u_time');
    const speed = gl.getUniformLocation(program, 'u_speed');
    const intensity = gl.getUniformLocation(program, 'u_intensity');
    const zoom = gl.getUniformLocation(program, 'u_zoom');
    const frontColor = gl.getUniformLocation(program, 'u_front_color');
    const backColor = gl.getUniformLocation(program, 'u_back_color');
    const ditherSize = gl.getUniformLocation(program, 'u_dither_size');
    const shape = gl.getUniformLocation(program, 'u_shape');

    if (!resolution || !time || !speed || !intensity || !zoom || !frontColor || !backColor || !ditherSize || !shape) {
      return undefined;
    }

    return { resolution, time, speed, intensity, zoom, frontColor, backColor, ditherSize, shape };
  }

  /** Skaliert die interne Renderauflösung passend zur gewünschten Pixelgröße. */
  private resizeCanvas(): void {
    const canvas = this.canvasRef?.nativeElement;

    if (!canvas) {
      return;
    }

    const pixelSize = Math.max(1, Math.round(this.pxSize));
    const width = Math.max(1, Math.ceil(this.hostRef.nativeElement.clientWidth / pixelSize));
    const height = Math.max(1, Math.ceil(this.hostRef.nativeElement.clientHeight / pixelSize));

    if (canvas.width === width && canvas.height === height) {
      return;
    }

    canvas.width = width;
    canvas.height = height;
    this.resizeViewport();
  }

  /** Synchronisiert den WebGL-Viewport mit der internen Canvas-Auflösung. */
  private resizeViewport(): void {
    const canvas = this.canvasRef?.nativeElement;

    if (!canvas || !this.gl) {
      return;
    }

    this.gl.viewport(0, 0, canvas.width, canvas.height);
  }

  /** Startet, pausiert oder statisiert die Animation abhängig von Sichtbarkeit und Motion-Präferenz. */
  private updateAnimationState(): void {
    window.cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = 0;

    if (!this.isWebGlAvailable) {
      return;
    }

    if (!this.shouldAnimate()) {
      this.animationStart = 0;
      this.renderFrame(0);
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.animationFrameId = window.requestAnimationFrame(this.animate);
    });
  }

  /** requestAnimationFrame-Loop; die eigentliche Pixelarbeit findet vollständig auf der GPU statt. */
  private readonly animate = (timestamp: number): void => {
    this.renderFrame(this.getElapsedSeconds(timestamp));

    if (this.shouldAnimate()) {
      this.animationFrameId = window.requestAnimationFrame(this.animate);
    } else {
      this.animationFrameId = 0;
    }
  };

  /** Zeichnet nach Resize oder Theme-Wechsel unmittelbar den aktuellen Zustand. */
  private renderCurrentFrame(): void {
    if (!this.isWebGlAvailable) {
      return;
    }

    const elapsedSeconds = this.shouldAnimate() ? this.getElapsedSeconds(performance.now()) : 0;
    this.renderFrame(elapsedSeconds);
  }

  /** Liefert die seit Animationsstart verstrichene Zeit in Sekunden. */
  private getElapsedSeconds(timestamp: number): number {
    this.animationStart ||= timestamp;
    return (timestamp - this.animationStart) / 1000;
  }

  /** Übergibt nur Uniforms an die GPU und zeichnet ein bildschirmfüllendes Dreieck. */
  private renderFrame(elapsedSeconds: number): void {
    const canvas = this.canvasRef?.nativeElement;
    const gl = this.gl;
    const program = this.program;
    const uniforms = this.uniforms;

    if (!canvas || !gl || !program || !uniforms) {
      return;
    }

    gl.useProgram(program);
    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl.uniform1f(uniforms.time, elapsedSeconds);
    gl.uniform1f(uniforms.speed, Math.max(0.05, this.speed));
    gl.uniform1f(uniforms.intensity, Math.min(1.6, Math.max(0.2, this.intensity)));
    gl.uniform1f(uniforms.zoom, Math.min(2, Math.max(0.05, this.zoom)));
    gl.uniform4f(uniforms.frontColor, ...this.frontColor);
    gl.uniform4f(uniforms.backColor, ...this.backColor);
    gl.uniform1i(uniforms.ditherSize, this.getDitherSize());
    gl.uniform1i(uniforms.shape, this.shape === 'wave' ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /** Liefert die numerische Größe der konfigurierten Bayer-Matrix. */
  private getDitherSize(): number {
    switch (this.type) {
      case '2x2':
        return 2;
      case '8x8':
        return 8;
      case '4x4':
      default:
        return 4;
    }
  }

  /** Aktualisiert die GPU-Farben aus CSS-Variablen und Theme-Tokens. */
  private refreshColors(): void {
    this.frontColor = this.resolveCssColor(this.colorFront);
    this.backColor = this.resolveCssColor(this.colorBack);
  }

  /** Löst einen CSS-Farbwert über den Browser in normalisierte RGBA-Kanäle auf. */
  private resolveCssColor(value: string): RgbaColor {
    const probe = document.createElement('span');
    probe.style.color = value;
    this.hostRef.nativeElement.appendChild(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();

    if (resolved === 'transparent') {
      return [0, 0, 0, 0];
    }

    const match = resolved.match(/rgba?\(([^)]+)\)/i);

    if (!match) {
      return [0, 0, 0, 0];
    }

    const channels = match[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    const alpha = channels.length > 3 ? channels[3] : 1;

    return [
      Math.min(1, Math.max(0, (channels[0] ?? 0) / 255)),
      Math.min(1, Math.max(0, (channels[1] ?? 0) / 255)),
      Math.min(1, Math.max(0, (channels[2] ?? 0) / 255)),
      Math.min(1, Math.max(0, alpha ?? 1)),
    ];
  }

  /** Prüft Sichtbarkeit und globale Motion-Präferenz. */
  private shouldAnimate(): boolean {
    const motion = document.documentElement.dataset['motion'];
    return this.isVisible && motion !== 'reduced' && motion !== 'off';
  }

  /** Zeichnet bei fehlendem WebGL2 einen einzigen statischen Frame mit Canvas2D. */
  private renderStaticFallback(canvas: HTMLCanvasElement): void {
    const context = canvas.getContext('2d', { alpha: true });

    if (!context) {
      return;
    }

    const width = canvas.width;
    const height = canvas.height;
    const imageData = context.createImageData(width, height);
    const pixels = imageData.data;
    const radiusBase = Math.max(1, Math.min(width, height) * 0.5);
    const front = this.frontColor.map((channel, index) => Math.round(channel * (index === 3 ? 255 : 255)));
    const back = this.backColor.map((channel) => Math.round(channel * 255));
    const zoom = Math.min(2, Math.max(0.05, this.zoom));

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const nx = ((x + 0.5 - width / 2) / radiusBase) * zoom;
        const ny = ((y + 0.5 - height / 2) / radiusBase) * zoom;
        let energy = 0;

        if (this.shape === 'wave') {
          const uvX = x / Math.max(1, width);
          const uvY = 1 - y / Math.max(1, height);
          const waveX = uvX * 8 - 4;
          const wave = Math.cos(0.5 * waveX) * Math.sin(1.5 * waveX) * 0.88;
          energy = 1 - this.smoothStep(-0.95, 0.95, (uvY - 0.48) * 4.2 + wave);
        } else {
          const distance = Math.hypot(nx, ny);
          const angle = Math.atan2(ny, nx);
          const spiral = Math.sin(distance * 17.5 - angle * 5.8);
          const ring = Math.sin(distance * 23.5);
          const arm = Math.cos(angle * 2.6 + distance * 8.2);
          energy = (spiral * 0.58 + ring * 0.24 + arm * 0.18) * 0.5 + 0.5;
        }

        const threshold = ((y & 3) * 4 + (x & 3)) / 16;
        const color = energy > threshold ? front : back;
        const offset = (y * width + x) * 4;

        pixels[offset] = color[0] ?? 0;
        pixels[offset + 1] = color[1] ?? 0;
        pixels[offset + 2] = color[2] ?? 0;
        pixels[offset + 3] = color[3] ?? 0;
      }
    }

    context.putImageData(imageData, 0, 0);
  }

  /** Interpoliert weich zwischen zwei Grenzwerten für den statischen Canvas-Fallback. */
  private smoothStep(edge0: number, edge1: number, value: number): number {
    const t = Math.min(1, Math.max(0, (value - edge0) / Math.max(0.0001, edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  /** Vertex-Shader für ein einzelnes bildschirmfüllendes Dreieck ohne Vertex-Buffer. */
  private readonly vertexShaderSource = `#version 300 es
    precision highp float;

    const vec2 POSITIONS[3] = vec2[3](
      vec2(-1.0, -1.0),
      vec2(3.0, -1.0),
      vec2(-1.0, 3.0)
    );

    void main() {
      gl_Position = vec4(POSITIONS[gl_VertexID], 0.0, 1.0);
    }
  `;

  /** Fragment-Shader mit Swirl-Feld und Bayer-Dithering. */
  private readonly fragmentShaderSource = `#version 300 es
    precision highp float;
    precision highp int;

    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_speed;
    uniform float u_intensity;
    uniform float u_zoom;
    uniform vec4 u_front_color;
    uniform vec4 u_back_color;
    uniform int u_dither_size;
    uniform int u_shape;

    out vec4 out_color;

    float smooth_step(float edge0, float edge1, float value) {
      float t = clamp((value - edge0) / (edge1 - edge0), 0.0, 1.0);
      return t * t * (3.0 - 2.0 * t);
    }

    float bayer2(ivec2 point) {
      const float matrix[4] = float[4](0.0, 2.0, 3.0, 1.0);
      int index = (point.y & 1) * 2 + (point.x & 1);
      return (matrix[index] + 0.5) / 4.0;
    }

    float bayer4(ivec2 point) {
      const float matrix[16] = float[16](
        0.0, 8.0, 2.0, 10.0,
        12.0, 4.0, 14.0, 6.0,
        3.0, 11.0, 1.0, 9.0,
        15.0, 7.0, 13.0, 5.0
      );
      int index = (point.y & 3) * 4 + (point.x & 3);
      return (matrix[index] + 0.5) / 16.0;
    }

    float bayer8(ivec2 point) {
      const float matrix[64] = float[64](
        0.0, 48.0, 12.0, 60.0, 3.0, 51.0, 15.0, 63.0,
        32.0, 16.0, 44.0, 28.0, 35.0, 19.0, 47.0, 31.0,
        8.0, 56.0, 4.0, 52.0, 11.0, 59.0, 7.0, 55.0,
        40.0, 24.0, 36.0, 20.0, 43.0, 27.0, 39.0, 23.0,
        2.0, 50.0, 14.0, 62.0, 1.0, 49.0, 13.0, 61.0,
        34.0, 18.0, 46.0, 30.0, 33.0, 17.0, 45.0, 29.0,
        10.0, 58.0, 6.0, 54.0, 9.0, 57.0, 5.0, 53.0,
        42.0, 26.0, 38.0, 22.0, 41.0, 25.0, 37.0, 21.0
      );
      int index = (point.y & 7) * 8 + (point.x & 7);
      return (matrix[index] + 0.5) / 64.0;
    }

    float dither_threshold(ivec2 point) {
      if (u_dither_size == 2) {
        return bayer2(point);
      }

      if (u_dither_size == 8) {
        return bayer8(point);
      }

      return bayer4(point);
    }

    void main() {
      float radius_base = max(1.0, min(u_resolution.x, u_resolution.y) * 0.5);
      vec2 top_left_space = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);
      vec2 normalized = ((top_left_space - u_resolution * 0.5) / radius_base) * u_zoom;
      float time = u_time * u_speed;
      float field = 0.0;

      if (u_shape == 1) {
        // Sine-Wave nach dem Dithering-Prinzip der Referenzkomponente.
        vec2 uv = gl_FragCoord.xy / max(u_resolution, vec2(1.0));
        float aspect = u_resolution.x / max(1.0, u_resolution.y);
        float wave_x = (uv.x - 0.5) * 8.0 * max(1.0, aspect * 0.62);
        float wave = cos(0.5 * wave_x - 2.0 * time)
          * sin(1.5 * wave_x + time)
          * (0.75 + 0.25 * cos(3.0 * time));
        float wave_y = (uv.y - 0.48) * 4.2;
        field = 1.0 - smooth_step(-0.95, 0.95, wave_y + wave);
        field = clamp((field - 0.08) * (0.94 + u_intensity * 0.28), 0.0, 1.0);
      } else {
        float distance_from_center = length(normalized);
        float angle = atan(normalized.y, normalized.x);
        float spiral = sin(distance_from_center * 17.5 - angle * 5.8 + time * 2.15);
        float ring = sin(distance_from_center * 23.5 - time * 1.05);
        float arm = cos(angle * 2.6 + distance_from_center * 8.2 - time * 1.55);
        float outer_fade = 1.0 - smooth_step(0.82, 1.72, distance_from_center);
        float center_hole = smooth_step(0.16, 0.34, distance_from_center);
        float energy = (spiral * 0.58 + ring * 0.24 + arm * 0.18) * 0.5 + 0.5;
        field = clamp((energy - 0.14) * (0.96 + u_intensity * 0.34) * outer_fade * center_hole, 0.0, 1.0);
      }

      ivec2 dither_point = ivec2(floor(top_left_space));
      float threshold = dither_threshold(dither_point);
      out_color = field > threshold ? u_front_color : u_back_color;
    }
  `;
}
