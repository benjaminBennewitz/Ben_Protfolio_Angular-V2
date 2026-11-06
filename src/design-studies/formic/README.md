# FORMIC — A Living Canvas

[← Design archive](https://b2folio.de/archive) · [Open study](https://b2folio.de/design-studies/formic/)

A generative behavioural-art study about movement becoming image. **FORMIC** simulates one or more ants on a digital sheet of paper while a virtual pen follows each path with a short delay. The result is neither a prerecorded animation nor a fixed illustration: every run produces a different drawing.

> [!NOTE]
> Independent non-commercial design study by Benjamin Bennewitz (B²), 2026. It is an experimental creative-coding prototype rather than a scientific ant simulation or production drawing application. Accessibility has been considered, but no comprehensive WCAG audit is claimed.
>
> [!IMPORTANT]
> The study is conceptually inspired by Yukinori Yanagi's *Wandering Position*. FORMIC is an independent digital interpretation and is not affiliated with or endorsed by the artist. Original portfolio code remains subject to the repository [LICENSE](../../../LICENSE).

## Design question

How can autonomous movement, small behavioural rules and limited human control become a visual composition rather than a conventional drawing tool?

The visitor controls line colour, smoothness, ant count, speed, stroke width, paper format and export resolution. The ants decide how the image develops. Their simulated paths include wandering, edge exploration and mutual avoidance; the virtual pen follows the travelled route instead of being attached directly to the body.

## Current prototype

- Native HTML, CSS and JavaScript ES module; no framework or external runtime dependency.
- Separate Canvas layers for persistent line work and animated ants.
- One to twenty simulated ants with collision avoidance and a conservative body clearance.
- Alternating tripod-like leg animation with feet anchored during the stance phase.
- Delayed pen tracking so the line follows behind the animal instead of replacing its path directly.
- Adjustable line smoothness from trembling, noisy movement to a close copy of the simulated route.
- A4, A3 and A5 portrait/landscape formats with 150 or 300 DPI PNG export.
- German and English interface copy.
- A local Web Worker provides the simulation clock independently of `requestAnimationFrame`; a timer fallback remains available if workers fail.
- No network API, analytics, external font service or remote JavaScript dependency is required for the experience.

## Technical architecture

```text
formic/
├── index.html          # Metadata, bilingual controls, canvas stage and credits
├── style.css           # Developer header, design tokens, layout and responsive states
├── app.js              # Behaviour, avoidance, drawing, localization and export
├── clock-worker.js     # Independent fixed-step timing source
├── assets/
│   └── preview.webp    # Archive-card preview rendered from the actual study
└── README.md
```

`app.js` keeps simulation and rendering in one shared coordinate system. The visible ant Canvas can redraw every animation frame without destroying the persistent ink Canvas. The export does not upscale the browser bitmap; it replays the stored line segments into a new Canvas at the requested physical resolution.

## Behaviour model

Each ant alternates between free roaming and short edge-search phases. Steering combines a target vector with local avoidance. Before a step is accepted, a final distance check prevents animals from moving closer when they are already inside the configured clearance radius. This keeps multiple ants from visibly walking through one another without introducing a full physics engine.

The line is generated from the accumulated travelled path. A target point is sampled a fixed distance behind the current position. Spatially anchored deterministic noise offsets only the virtual pen tip, which means changing the simulation frame rate does not change the basic character of the tremor.

## Accessibility and performance

Native buttons, sliders, selects and the color input remain keyboard-operable and use visible focus outlines. Canvas layers expose concise labels. The simulation uses a fixed time step while rendering remains tied to the browser frame loop. Long background-tab interruptions are capped instead of being replayed as an uncontrolled catch-up loop.

The prototype intentionally keeps the implementation small. There is no external physics library, Canvas framework, font CDN, Google API or telemetry layer.

## Portfolio integration

Angular publishes the complete folder through the existing static `src/design-studies` asset rule. The archive card and German translation are declared in `src/app/core/data/design-studies.ts`. Both deployment scripts explicitly verify the FORMIC entry point and runtime files before publishing, and `src/sitemap.xml` contains the public study URL.

The archive preview is rendered from the running study rather than produced as unrelated promotional artwork.

## Inspiration and credits

Conceptual inspiration: **Yukinori Yanagi — *Wandering Position***. A short contextual reference is linked from the study itself via Ann Shafer's article *Can an Ant Be an Artist?*. FORMIC translates the underlying idea into a browser-based interactive system; it does not reproduce Yanagi's physical artwork, documentation image or installation.

Design and implementation: **Benjamin Bennewitz / B²**.
