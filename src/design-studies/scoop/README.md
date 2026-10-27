# SCOOP! — Comic Ice Cream Shop

[← Study overview](../../../README.md#standalone-design-studies) · [View live study](https://b2folio.de/design-studies/scoop/)

An illustration- and animation-led design study built around doodles, expressive ice cream characters, and a playful visual identity. The fictional shop gives those characters a setting; character design and motion are the focus.

> [!NOTE]
> This is a non-commercial, experimental study in graphic design and web development, created for personal learning. It is not a production product or a commercial service. Its specific design and technical objectives are described below. Accessibility and production readiness are not the primary evaluation goals; support varies, and no comprehensive accessibility audit or WCAG conformance is claimed.

> [!IMPORTANT]
> The source is published for inspection and evaluation only. Public visibility does not grant permission to clone, copy, run, modify, or reuse it. The [portfolio license](../../../LICENSE) applies to original project contributions; third-party components retain their own terms.

## Intent and learning focus

**Primary focus: doodles, character design, and animation.**

SCOOP! starts with an illustrated visual world rather than a shop feature list. The central question is how characters, hand-drawn-looking marks, typography, color, and motion can work together as one expressive web identity.

Strawlarry, Brostacchio, and Jochen are the main actors. Their silhouettes, faces, gestures, and reactions make the flavors recognizable and give the products a personality. Doodles, ingredient marks, speech bubbles, and the drawn path extend that character language into the surrounding composition.

Animation is part of the graphic storytelling: the characters arrive, settle, look around, wave, and react to interaction. Timing, deformation, and contact with the scene are more important to this study than the number of shop features. Product selection, the mix box, and the demo cart provide situations in which the illustrated identity can act; implementing those states is a supporting challenge.

## Concept and visual direction

Strawlarry / strawberry, Brostacchio / pistachio, and Jochen / vanilla are individual SVG characters. Large Lilita One headlines, Nunito Sans body text, ingredient doodles, and a drawn path create the comic-inspired identity.

The hero, flavors, mix box, brand story, and Flavor Vote structure the page. Portraits are labelled as AI placeholders.

## Supporting shop interactions

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

The main learning focus is character-led visual storytelling: translating illustrated faces, doodles, gestures, and comic timing into responsive SVG animation. Browser-local shop state supports those situations.

## Interaction scope

The cart and mobile menu include Escape handling and focus management. Core shop actions support keyboard and touch input. Static product artwork and editorial content remain available without the interactive shop code. These implementation details do not imply production readiness or full accessibility coverage.

## Portfolio integration and sources

The study is served at `/design-studies/scoop/`. Angular publishes runtime files, WOFF fonts, and their license records. Illustrator masters, draft PNGs, original TTF files, and selected development material are excluded according to `angular.json`.

Original graphics and implementation remain subject to the portfolio license. The fonts retain their accompanying OFL records.

The founder portraits are AI-generated placeholders depicting fictional people, not authentic photographs of Nadin or Ben. They are labelled in the interface and documented in `assets/portrait-notes.md`. The SVG characters, doodles, and animated overlays are distinct parts of the illustrated visual system and should not be confused with those photographic-looking placeholders.
