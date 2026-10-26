# RAW/FORM — Brutalist Festival Study

[← Study overview](../../../README.md#standalone-design-studies) · [View live study](https://b2folio.de/design-studies/brutalism/)

A fictional festival microsite connecting electronic music, architecture, art, and community. The study explores how a poster-like visual identity can carry an entire event website.

> [!NOTE]
> This is a non-commercial, experimental design and development study created for personal learning, exploring technologies, and combining visual and interaction techniques. It is not a production product or a commercial service. Accessibility and production readiness are not the primary evaluation goals; support varies, and no comprehensive accessibility audit or WCAG conformance is claimed.

> [!IMPORTANT]
> The source is published for inspection and evaluation only. Public visibility does not grant permission to clone, copy, run, modify, or reuse it. The [portfolio license](../../../LICENSE) applies to original project contributions; third-party components retain their own terms.

## Concept and visual direction

Large Anton headlines, technical information in IBM Plex Mono, hard grid lines, and orange accents establish the visual identity. Photography, SVG doodles, and contrasting content blocks combine the language of festival posters with editorial layouts.

The page moves from the oversized opening through the line-up, location, experience, and manifesto to ticket cards and a newsletter section. These are fictional content and interface demonstrations; the study does not process ticket purchases or newsletter subscriptions.

## Interaction experiments

- Chapter navigation and a mobile menu with state changes and Escape handling.
- Staggered text reveals and offset image reveals when content enters the viewport.
- Hover and focus reactions on links, buttons, and cards.
- A scroll-to-top control and an explicitly labelled demo cookie dialog. Its dismissed state is stored for the browser session in `sessionStorage`.
- Illustrative audio bars used as a graphic element rather than a functioning audio player.

## Technical approach

HTML, CSS, and VanillaJS share a single entry file. `IntersectionObserver` activates the reveals while the page follows normal document scrolling. The relevant motion is disabled under `prefers-reduced-motion`, leaving the content visible.

| Area | File / directory |
| --- | --- |
| Structure, styles, and interactions | [index.html](index.html) |
| Images and SVG graphics | `assets/` |
| Local fonts and license records | `assets/fonts/` |

The learning focus is the relationship between typographic scale, grid structure, visual contrast, and lightweight browser interactions. The implementation includes a skip link, focus styling, and semantic content areas; these are individual implementation choices, not a claim of complete accessibility coverage.

## Portfolio integration

The study is served at `/design-studies/brutalism/`. Angular's asset configuration publishes the standalone page alongside the main portfolio. Its visual rules and interaction code remain within the study directory.

## Credits and source notes

Design and implementation: Benjamin Bennewitz / B². Font license records remain with the local font directories and are not replaced by the portfolio license.
