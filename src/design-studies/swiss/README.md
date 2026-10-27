# [WHATWESEE] — A Photography Journal

[← Study overview](../../../README.md#standalone-design-studies) · [View live study](https://b2folio.de/design-studies/swiss/)

A graphic-design-led study translating Swiss / International Typographic Style into a responsive photographic journal. Benjamin Bennewitz's own photographs supply the content; the central experiment is the editorial system that presents them.

> [!NOTE]
> This is a non-commercial, experimental study in graphic design and web development, created for personal learning. It is not a production product or a commercial service. Its specific design and technical objectives are described below. Accessibility and production readiness are not the primary evaluation goals; support varies, and no comprehensive accessibility audit or WCAG conformance is claimed.

> [!IMPORTANT]
> The source is published for inspection and evaluation only. Public visibility does not grant permission to clone, copy, run, modify, or reuse it. The [portfolio license](../../../LICENSE) applies to original project contributions; third-party components retain their own terms.

## Intent and learning focus

**Primary focus: graphic design — translating Swiss design principles into a web format.**

The starting point is the Swiss / International Typographic Style: a clear grid, deliberate typographic hierarchy, sans-serif typography, asymmetrical balance, and controlled use of empty space. The question is how these principles can organize a contemporary photographic website while preserving the clarity of an editorial composition.

The photographs are not interchangeable interface decoration. Their framing, scale, sequence, and relationship to captions and text are part of the design work. A consistent grid connects landscape, architecture, animals, and flowers without flattening their individual character. Restrained color and typography give the images room to lead.

The implementation is a supporting challenge. Responsive layouts and a small amount of motion translate the editorial system across viewports; the slider is a presentation tool, not the reason for the study. This is an interpretation of Swiss design principles for the web rather than a historical reproduction of a printed layout.

## Concept and visual direction

A precise grid, system typography, generous image areas, and numbered archive sections establish the visual order. Landscape, architecture, animals, and flowers represent different ways of observing the world.

The hero slider introduces the imagery. A project statement, photographic archive, journal article, and closing section develop the editorial structure. Photography remains the main content; movement supports its presentation.

## Interaction experiments

- A hero slider with automatic progression, previous/next controls, and updated category and index labels.
- Autoplay pauses while the slider is hovered or contains focus. Reduced-motion preferences prevent automatic progression.
- One-time reveals through `IntersectionObserver`; archive sections enter alternately from the left and right.
- Mobile navigation and regular anchor links between page sections.

## Technical approach

HTML, CSS, and VanillaJS form a standalone page with responsive grids and a maximum layout width of 1920 pixels. Photographs are local WebP assets. `<figure>` and `<figcaption>` associate images and credits within the document structure.

| Area | File / directory |
| --- | --- |
| Page structure and image credits | [index.html](index.html) |
| Grid, typography, and responsive rules | [styles.css](styles.css) |
| Slider, menu, and reveals | [script.js](script.js) |
| Photographs | `assets/images/` |

Existing archive images also provide additional hero slides. `hero-landscape.webp`, `archive-landscape.webp`, `archive-architecture.webp`, `archive-animals.webp`, `archive-flowers.webp`, `article-landscape.webp`, and `cta-landscape.webp` supply the respective editorial image roles.

The learning focus is composition, photographic hierarchy, responsive image presentation, and restrained motion rather than a feature-heavy application.

## Portfolio integration

The study is served at `/design-studies/swiss/`. Angular publishes the standalone files through its asset configuration. The portfolio card and quicklink point to the same page; the study retains its own layout and interaction code.

## Credits and source notes

All photographs in this study are original photographs by Benjamin Bennewitz; they are not AI-generated images. Image captions and the footer already identify their authorship. **Photography © Benjamin Bennewitz. All rights reserved.** The portfolio license applies to these original photographs as well as the original design and code; public display does not grant a reuse licence.
