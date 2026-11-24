# Casa al Detewitz — Bauhaus Restaurant Editorial

[← Study overview](../../../README.md#standalone-design-studies) · [Open study](https://b2folio.de/design-studies/casa-al-detewitz/)

A fictional Italian–German fine-dining restaurant led by Julius Benenwitz and Paula Detering. The study applies a shared geometric language to the restaurant identity, the architecture, the tasting menu and the website.

## Design and interaction

- Brick red, cobalt, mustard and warm paper accompany architectural and culinary photography. Circles, triangles and grids shape the brand mark, the editorial layout and the printed menu.
- Three hero images can be selected manually. Four staggered geometric shapes cover the image before each change and retract afterwards. The image is decoded before the transition.
- The chefs each have a fictional biography. A nine-image masonry gallery shows the room, bar, open kitchen and plated courses.
- The menu occupies one viewport on desktop and the space under the sticky header on mobile. Its three chapters have direct selection, previous/next controls, and notes on bookings and allergens. On mobile, the notes open in a native popover. Short portrait viewports can scroll inside the menu sheet. The full menu remains visible without JavaScript.
- German is the default. Language and light/dark choices inherit the portfolio preferences until changed locally. Motion respects the system preference.
- The images are generated concepts. The chefs' portrait is labelled on the page. Prices, hours and location are fictional details.

## Structure

| Area | File |
| --- | --- |
| Semantic German content and metadata | [index.html](index.html) |
| Tokens, layouts and animation | [style.css](style.css) |
| English copy, preferences and interaction | [app.js](app.js) |
| Photography, archive preview, favicon and Manrope | `assets/` |

Serve `src/` over HTTP to preview the page at `/design-studies/casa-al-detewitz/`. The portfolio build copies the study as static files. Manrope is distributed under the [SIL Open Font License](assets/fonts/OFL-Manrope.txt).

[Design reference: Kittl — Bauhaus in graphic design](https://www.kittl.com/blogs/bauhaus-design-principles-adv/)

The [portfolio license](../../../LICENSE) applies to original project contributions.
