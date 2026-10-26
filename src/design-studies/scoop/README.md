# SCOOP! — Comic Ice Cream Shop

[← Study overview](../../../README.md#standalone-design-studies) · [View live study](https://b2folio.de/design-studies/scoop/)

An illustrative demo shop that brings ice cream characters, product selection, and scrolling into one visual identity. The study combines playful product presentation with explicit shop states.

> [!NOTE]
> This is a non-commercial, experimental design and development study created for personal learning, exploring technologies, and combining visual and interaction techniques. It is not a production product or a commercial service. Accessibility and production readiness are not the primary evaluation goals; support varies, and no comprehensive accessibility audit or WCAG conformance is claimed.

> [!IMPORTANT]
> The source is published for inspection and evaluation only. Public visibility does not grant permission to clone, copy, run, modify, or reuse it. The [portfolio license](../../../LICENSE) applies to original project contributions; third-party components retain their own terms.

## Concept and visual direction

Strawlarry / strawberry, Brostacchio / pistachio, and Jochen / vanilla are individual SVG characters. Large Lilita One headlines, Nunito Sans body text, ingredient doodles, and a drawn path create the comic-inspired identity.

The hero, flavors, mix box, brand story, and Flavor Vote structure the page. Portraits are labelled as AI placeholders.

## Shop interaction experiments

- Individual 500 ml cups with a demo price of €6.90.
- A three-cup mix box at €20.70, including repeated flavors.
- Keyboard-operable mix selection and a cart with quantity changes, removal, and totals.
- Browser-local state for the cart and Flavor Vote.
- A demo checkout that clears the cart and explicitly confirms that no order or payment was processed.
- A voting popup with an explicitly fictional interim result rather than server-side poll data.

There is no order backend, payment processing, or shipping service. Product names, prices, and shop controls support the design experiment.

## Animation and technical approach

The hero drops characters onto a waffle with staggered timing and settling motion. Contact shadows appear on impact. Clip paths constrain pupil movement; arms deform along Bézier segments. Product interactions trigger speech bubbles and mouth states.

The mix box animates selected cups independently. A drawn background path follows the actual section heights and has a separate mobile layout. `ResizeObserver` accounts for layout changes.

| Area | File / directory |
| --- | --- |
| Shop structure and dialogs | [index.html](index.html) |
| Layout, typography, and animation | [styles.css](styles.css) |
| Shop state and interactions | [script.js](script.js) |
| Templates derived from original SVG artwork | [artwork.js](artwork.js) |
| Original graphics and WebP previews | `assets/` |
| Local webfonts and license records | `fonts/` |

HTML, CSS, SVG, and VanillaJS provide the runtime. SVG instances receive unique IDs for masks and clips. The loader considers font and image readiness plus a minimum display time. Animation work accounts for viewport and tab visibility. Reduced-motion preferences display the completed hero and disable the associated movements.

The learning focus is SVG character animation, geometric deformation, responsive visual storytelling, and a consistent browser-local shop state.

## Interaction scope

The cart and mobile menu include Escape handling and focus management. Core shop actions support keyboard and touch input. Static product artwork and editorial content remain available without the interactive shop code. These implementation details do not imply production readiness or full accessibility coverage.

## Portfolio integration and sources

The study is served at `/design-studies/scoop/`. Angular publishes runtime files, WOFF fonts, and their license records. Illustrator masters, draft PNGs, original TTF files, and selected development material are excluded according to `angular.json`.

Original graphics and implementation remain subject to the portfolio license. The fonts retain their accompanying OFL records.
