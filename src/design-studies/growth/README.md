# GROWTH. — A Living World

[← Study overview](../../../README.md#standalone-design-studies) · [View live study](https://b2folio.de/design-studies/growth/)

A procedural tree experience with a camera ascent from underground roots through the trunk to the canopy and beyond. Upward scrolling becomes a journey through a connected habitat.

> [!NOTE]
> This is a non-commercial, experimental design and development study created for personal learning, exploring technologies, and combining visual and interaction techniques. It is not a production product or a commercial service. Accessibility and production readiness are not the primary evaluation goals; support varies, and no comprehensive accessibility audit or WCAG conformance is claimed.

> [!IMPORTANT]
> The source is published for inspection and evaluation only. Public visibility does not grant permission to clone, copy, run, modify, or reuse it. The [portfolio license](../../../LICENSE) applies to original project contributions; third-party components retain their own terms.

## Concept and visual direction

The opening sits at the bottom of the document. Scrolling upward moves through roots, forest floor, trunk, epiphytes, hidden habitats, canopy, and the view above it.

Dark forest colors, light accents, large Barlow Condensed typography, and a technical HUD combine natural imagery with an expedition interface. An altitude display follows the camera. Fog, atmospheric layers, and animated water give the scene depth.

## Interaction experiments

- Camera height and orientation follow document scrolling, with chapter text rendered as HTML above the scene.
- Chapter navigation links to height sections. “Begin Ascent” moves from the opening toward the forest floor.
- Discovery points explain fungi, moss, bromeliads, and canopy functions through small connected popovers.
- Most markers follow 3D positions and visibility checks. The atmospheric marker on the left of the canopy is intentionally placed in screen space.
- The sound control is explicitly disabled; audio functionality is not implemented.

## Technical approach

Three.js and WebGL generate the scene, with VanillaJS coordinating document state and interaction. The tree, roots, vegetation, and environment are procedural; this version does not require an external tree mesh. Some textures are generated with Canvas.

| Area | File |
| --- | --- |
| Chapters, HUD, and popovers | [index.html](index.html) |
| Rendering, camera, and interaction | [src/main.js](src/main.js) |
| Geometry generators and layers | [src/world.js](src/world.js) |
| Validated seeds and parameters | [src/config.js](src/config.js) |
| Deterministic random streams | [src/random.js](src/random.js) |
| Authoring controls and presets | [src/debug.js](src/debug.js) |
| Styling and local font references | [src/styles.css](src/styles.css) |
| Portfolio card screenshot | [assets/preview.webp](assets/preview.webp) |

Generator areas use separate random streams. Ground changes therefore do not automatically reseed the branches. Presets capture seeds and parameters; reproducibility depends on the same generator version. They are not frozen geometry or GLB snapshots.

The authoring interface includes layer toggles and JSON import/export. Applying a configuration reloads the scene; the URL can carry its parameters. Individual generators are not hot-swapped.

The learning focus is procedural geometry, deterministic authoring, scroll-driven camera composition, and coordinating DOM annotations with a 3D scene.

## Motion and limitations

Reduced-motion preferences skip camera interpolation and freeze water and atmospheric time. A WebGL-capable browser remains necessary. Syntax checks do not validate shaders or visual output, and the study has not been presented as a complete accessible alternative to a 3D experience.

## Portfolio integration and sources

The study is served at `/design-studies/growth/`. Angular publishes the standalone files. Three.js is loaded from a CDN; Barlow Condensed, DM Sans, and DM Mono are shared local portfolio fonts under `/assets/fonts/studies/`. There is no Google Fonts request.

Original generators, design, and content are covered by the portfolio license. Three.js and the fonts retain their own terms.
