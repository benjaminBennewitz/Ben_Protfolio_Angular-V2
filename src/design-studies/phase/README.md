# PHASE. — A Living Microcosm

[← Study overview](../../../README.md#standalone-design-studies) · [View live study](https://b2folio.de/design-studies/phase/)

A generative-art study in organic motion, point-cloud composition, and coordinated wave patterns. Twelve biologically inspired creatures share one restrained visual language while retaining distinct mathematical forms and movement.

> [!NOTE]
> This is a non-commercial, experimental study in graphic design and web development, created for personal learning. It is not a production product or a commercial service. Accessibility and production readiness are not the primary evaluation goals; support varies, and no comprehensive accessibility audit or WCAG conformance is claimed. The creatures are artistic abstractions, not scientifically accurate biological simulations.

> [!IMPORTANT]
> The source is published for inspection and evaluation only. Public visibility does not grant permission to clone, copy, run, modify, or reuse original contributions. The [portfolio license](../../../LICENSE) applies to original project contributions; third-party components retain their own terms, including the bundled p5.js library.

## Intent and learning focus

**Primary focus: creative coding — making mathematical motion feel alive.**

The starting point is a visual experiment with a worm-like form, lateral ribs, and phase-shifted oscillation. The learning question is how point placement, deformation, timing, and selective red accents can suggest a living organism without relying on a pre-rendered video or a modeled asset.

The same question is explored through twelve different bodies. A worm carries an undulating wave, a medusa contracts its bell, and a colony passes impulses between cells. Each form uses its own geometry while sharing projection, rendering, controls, and lifecycle behavior.

## Concept and visual direction

A near-black background, fine pale points, restrained red impulses, and a specimen archive create an abstract microscopic observatory. Light mode reverses the figure-ground relationship. German and English labels include creature descriptions, accessible canvas names, controls, and the compact footer.

The archive presents numbered silhouettes. The selected creature receives the central stage, a short description, and three native range controls. The footer returns to the portfolio and links to the legal pages and the p5.js license.

## Interaction experiments

| Specimen | Movement | Third control |
| --- | --- | --- |
| Bristle worm | Travelling body wave and phase-shifted lateral bristles | Wave frequency |
| Medusa | Elastic bell, pulsing light core, radial channels, veils, trailing tentacles | Bell contraction |
| Paramecium | Fine beating cilia around a compact cell | Beat frequency |
| Sun animalcule | Radial rays and outward-travelling impulses | Pulse frequency |
| Spirillum | Rotating helical body and trailing flagella | Coiling |
| Amoeba | Deforming pseudopods, flowing cytoplasm, softly pulsing nucleus | Morphing |
| Cell colony | Nine connected cells with coordinated pulses | Pulse offset |
| Rotifer | Two phase-shifted ciliary crowns around a teardrop body | Ciliary beat |
| Comb jelly | Eight travelling comb bands around a transparent body | Comb frequency |
| Euglena | A spindle-shaped cell with an eyespot and long flagellum | Flagellar beat |
| Diatom | A slowly rotating porous double shell | Shell rotation |
| Brittle star larva | A small body with six gently swaying ciliated arms | Arm wave |

Speed and movement strength are shared. Switching specimens preserves the control values, theme, language, and pause state; the new specimen starts at time zero. Reset preserves the selected specimen and pause state. Native buttons and sliders support keyboard interaction.

## Current technical approach

p5.js 1.11.11 runs in **instance mode**. The organisms are computed in JavaScript and projected onto a 2D Canvas. Points are collected into eight reusable brightness buffers and drawn in batches. No 3D model, WebGL dependency, generated video, or image sequence drives the animation.

| Area | File / directory |
| --- | --- |
| Entry, metadata, archive mount, and footer | [index.html](index.html) |
| Tokens, controls, responsive layout, footer | [styles.css](styles.css) |
| Application state and input events | [scripts/app.js](scripts/app.js) |
| Archive buttons and local SVG silhouettes | [scripts/archive.js](scripts/archive.js) |
| Localized UI text and visual updates | [scripts/content.js](scripts/content.js), [scripts/view.js](scripts/view.js) |
| p5 instance and public lifecycle API | [scripts/phase-study.js](scripts/phase-study.js) |
| Shared projection and point batching | [scripts/canvas-renderer.js](scripts/canvas-renderer.js) |
| Resize, visibility, and reduced-motion observers | [scripts/study-observers.js](scripts/study-observers.js) |
| Central specimen metadata and defaults | [scripts/organisms.js](scripts/organisms.js) |
| One mathematical renderer per creature | `scripts/organisms/` |
| Generated portfolio-card artwork | `assets/preview.webp` |
| Unmodified third-party distribution and license | `vendor/` |

The renderer modules contain small geometry tasks rather than one large sketch. Original application scripts stay below 400 lines including comments; functions target approximately 20 lines including JSDoc. The unmodified third-party p5.js distribution follows its upstream formatting and documentation. CSS has a developer header and a numbered table of contents.

## Performance and limitations

Device pixel density is capped at 1.75. Narrow stages use fewer points. Animation pauses outside the viewport or while the tab is hidden. Reduced-motion preferences start with a still image; visitors can explicitly resume motion. Enabling reduced motion while the page is open also pauses the drawing.

The simulation is time-based and deterministic. It uses no physics solver, biological data, analytics, external API, or server-side state. Its appearance depends on browser Canvas rendering and device performance. There is no claim of comprehensive accessibility equivalence or cross-browser validation.

## Portfolio integration and sources

Angular publishes the study unchanged at `/design-studies/phase/` using the existing static asset rules. Its overview card and German translation are declared in `src/app/core/data/design-studies.ts`. The sitemap includes the study URL. No new Angular route, component, or application dependency is needed. Theme and language remain local to this standalone study, consistent with the existing study architecture.

Original design and implementation: Benjamin Bennewitz / B². The initial visual reference was supplied by the author as an animated GIF and an [Instagram reel](https://www.instagram.com/reel/DcV9iXMt-jV/). The mathematical renderers are independent interpretations; no original source formula is claimed.

p5.js 1.11.11 is bundled locally and unmodified. Its [LGPL-2.1 license](vendor/p5-LICENSE.txt) remains applicable. [Upstream source](https://github.com/processing/p5.js/tree/v1.11.11) and [p5.js](https://p5js.org/) document the library. The portfolio's restrictive original-work license does not replace these terms.

The preview is rendered from the actual procedural medusa geometry and composed as a portfolio card. It is not AI-generated imagery or a frame from the reference video.

## Verification

The integration checks the Angular production build, module paths, source syntax, documentation coverage, and script/function sizes. Deterministic point output is compared with the uploaded prototype across the original seven specimens, multiple times, quality profiles, and parameter values. Browser checks cover the integrated study, archive, controls, translations, themes, and footer links. These checks do not constitute a complete WCAG audit or a real-device mobile test.

### Integration check results

- `npm run build:production`: passed.
- Existing `portfolio-page.component.spec.ts`: both tests passed, including dynamic last-card selection.
- All 152 application functions have JSDoc and remain at or below 20 lines including their attached documentation; the largest application script has 232 lines.
- 560,520 point records match the uploaded prototype exactly across seven specimens, three sample times, both quality profiles, and two movement-strength values.
- The integrated Angular overview exposes PHASE as its ninth study and quicklink. Browser checks cover the new card, the static study, medusa selection, theme/language/pause states, and the translated footer.
- The existing Apache SPA fallback remains responsible for direct requests to Angular routes. The static QA server does not implement that fallback; portfolio navigation was checked from the running Angular application.

### Expanded specimen archive

The archive contains twelve specimens. The five retained additions—rotifer, ctenophore, euglena, diatom, and brittle-star larva—share small pose, ellipsoid, and ring helpers in `scripts/organisms/geometry.js`. The seven original renderer files remain unchanged. Each creature has German and English descriptions, its own local silhouette, and an appropriate third parameter. The warm light theme and corrected control-panel spacing remain in place.

The retained additions were inspected in the desktop browser during expansion. Archive selection, English labels, warm light mode, pause, and a parameter change while paused were checked. Sampled geometry checks covered both quality profiles, multiple times, and parameter extremes; positions were finite and fitted the viewport. The rigid diatom shell additionally rocks according to movement strength. Vorticella and tardigrade were subsequently removed from the archive, renderer imports, and documentation. Real-device mobile testing and a comprehensive accessibility audit are outside these checks.
