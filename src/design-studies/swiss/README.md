# [WHATWESEE] — A Photography Journal

[← Study overview](../../../README.md#standalone-design-studies) · [View live study](https://b2folio.de/design-studies/swiss/)

A photography journal inspired by the Swiss / International Typographic Style. Benjamin Bennewitz's photographs are presented through a restrained editorial system.

> [!NOTE]
> This is a non-commercial, experimental design and development study created for personal learning, exploring technologies, and combining visual and interaction techniques. It is not a production product or a commercial service. Accessibility and production readiness are not the primary evaluation goals; support varies, and no comprehensive accessibility audit or WCAG conformance is claimed.

> [!IMPORTANT]
> The source is published for inspection and evaluation only. Public visibility does not grant permission to clone, copy, run, modify, or reuse it. The [portfolio license](../../../LICENSE) applies to original project contributions; third-party components retain their own terms.

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

The photographs are by Benjamin Bennewitz. Visible captions use `© Benjamin Bennewitz`. Original design, code, and content remain subject to the portfolio license.
