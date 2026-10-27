# TYPE破BREAK — Nothing New Without Breaking

[← Study overview](../../../README.md#standalone-design-studies) · [View live study](https://b2folio.de/design-studies/type-break/)

An interactive typographic manifesto about pressure, destruction, and creative transformation. Scale, movement, and simulated physical reactions make type part of the narrative.

> [!NOTE]
> This is a non-commercial, experimental study in graphic design and web development, created for personal learning. It is not a production product or a commercial service. Its specific design and technical objectives are described below. Accessibility and production readiness are not the primary evaluation goals; support varies, and no comprehensive accessibility audit or WCAG conformance is claimed.

> [!IMPORTANT]
> The source is published for inspection and evaluation only. Public visibility does not grant permission to clone, copy, run, modify, or reuse it. The [portfolio license](../../../LICENSE) applies to original project contributions; third-party components retain their own terms.

## Intent and learning focus

**Focus: expressive typography and its translation into an interactive experience.**

Type is the visual material of the study, rather than a neutral container for text. Scale, compression, rhythm, fragmentation, and reformation express the theme of creative change. Interaction lets visitors act on that material; Canvas simulation and poster export make the typographic idea tangible in the browser.

The study connects graphic composition with motion and direct manipulation. Its technical mechanisms serve that relationship rather than define a separate application feature list.

## Concept and visual direction

**THE SYSTEM → THE PRESSURE → THE BREAK → THE NEW.**

Anton represents a rigid typographic system. Signal red, off-white, and locally bundled Japanese key glyphs provide contrast. Compression and displacement connect the visual language to the subject. Japanese characters carry meaning rather than serving as random decoration.

## Chapters and interaction experiments

| Station | Behavior |
| --- | --- |
| The System | Individual hero glyphs respond to pointer or touch input; scrolling changes the composition. |
| The Pressure | Scroll-driven compression, skew, and rotation lead to a typographic breaking point. |
| Intervention | Fragmented words and calls to action reform on hover, focus, or activation. |
| The Break | A Canvas simulation provides PUSH, PULL, BREAK, and REFORM tools. |
| The New | A statement becomes a typographic poster with browser-local PNG export. |
| Manifesto | An editorial publication preview links to a four-page PDF. |

Three oversized interludes connect the chapters. The footer continues the typography and provides chapter, download, and portfolio links. Poster creation produces a new statement; the existing simulated fragments do not geometrically morph into the new text.

## Technical approach

| Area | File / directory |
| --- | --- |
| Chapters, form, and navigation | [index.html](index.html) |
| Visual system and responsive presentation | [styles.css](styles.css) |
| Scroll mechanics, glyphs, and poster export | [script.js](script.js) |
| Fragment and reformation simulation | [physics.js](physics.js) |
| Editorial source | [docs/MANIFESTO.md](docs/MANIFESTO.md) |
| Print edition | [assets/type-break-manifesto.pdf](assets/type-break-manifesto.pdf) |

The runtime combines HTML, CSS, Canvas, and VanillaJS. Scroll effects use `requestAnimationFrame` and CSS transforms; chapter reveals use `IntersectionObserver`. The physics simulation pauses outside the viewport and limits pixel density.

The learning focus is combining typographic storytelling, direct manipulation, Canvas simulation, and image export in one browser experience.

## Interaction limits and local data

The implementation includes labelled tools, focus styling, touch input, a motion toggle, and support for reduced-motion preferences. These features do not amount to a comprehensive accessibility audit. The page uses normal document scrolling.

Poster text and image export are processed locally in the browser. Entered statements are not sent to an application backend.

## Portfolio integration and sources

The study is served at `/design-studies/type-break/` through Angular's asset configuration. Anton and the Noto Serif CJK JP Bold subset are bundled locally. Their notices are in [assets/OFL.txt](assets/OFL.txt) and [assets/OFL-NOTO.txt](assets/OFL-NOTO.txt).
