# TELESHOP — Same Goods. New Rules.

[← Study overview](../../../README.md#standalone-design-studies) · [Open study](https://b2folio.de/design-studies/teleshop/)

A graphic-design and UI/UX study about the changing presentation of the same merchandise. The fictional mail-order retailer **telekauf.** now has a complete shop homepage: three manually selectable campaigns, promotional tiles, an abdominal-trainer spotlight, product recommendations, a new-arrival feature, service information and a newsletter demonstration.

The [portfolio license](../../../LICENSE) applies to original contributions.

## Graphic intent

The historical side uses **1998 as a plausible visual reference**, informed by the user's references to German mail-order catalogues and shopping television: Otto, Neckermann, bonprix and the general atmosphere of teleshopping channels. It captures an imagined period mood, not a specific dated website. No historical screenshots or brand marks are used. OTTO’s [official history of otto.de](https://www.otto.de/unternehmen/de/kundenfokus/von-modem-zu-mobile-drei-jahrzehnte-otto.de) dates its web launch to 1995 and describes product search and category navigation in 1997. The study keeps comparable euro prices in both views; it is not a period-perfect reconstruction of 1998 retail conditions.

Electric blue, acid yellow, cyan and magenta compete with catalogue red. Ridged borders, tiled backgrounds, compact category links, an order hotline, offer stamps and a decorative visitor counter simulate a crowded early-web catalogue. Chrome typography and Y2K club graphics remain outside the brief. Modern semantic HTML and CSS Grid simulate the old layout-table appearance; deliberately inaccessible layout tables, blinking text and flashing graphics are unnecessary.

The contemporary direction uses warm off-white surfaces, selective red actions, a quieter hierarchy, larger imagery and deliberate typography. Light/dark affects the study frame and contemporary colour system; the old palette remains a fixed historical exhibit. The shop is intentionally satirical. Advertising promises, displayed return conditions and product availability belong to this fictional demonstration.

The comparison examines hierarchy, information density, action clarity, trust, imagery and navigation. Modern presentation has trade-offs: more scrolling, fewer simultaneous offers and the possibility of confusing polished appearance with actual quality. Both versions retain shipping information, keyboard operation, visible focus and responsive behaviour.

## Product imagery and AI disclosure

Six original **AI-generated photographic interpretations** replace the SVG product illustrations:

| Product | Retro asset | Contemporary asset |
| --- | --- | --- |
| Red abdominal trainer | `assets/trainer-retro.webp` | `assets/trainer-modern.webp` |
| Stainless steel egg topper | `assets/egg-retro.webp` | `assets/egg-modern.webp` |
| Ivory pillar candles | `assets/candle-retro.webp` | `assets/candle-modern.webp` |

Every photographic frame carries a visible bilingual AI label. The modern egg photograph has been retouched with the same image-generation tool to remove black pepper specks only, preserving the existing product staging. The footer opens a fuller image disclosure. The files are fictional product imagery, not historical photographs or documentary evidence. The two interpretations may vary in individual product geometry; they represent the same fictional catalogue item rather than a verified identical physical specimen.

Images are delivered as 1200 × 800 WebP files, approximately 320 KB combined. Repeated placements share the same six URLs. Both era variants are prepared before a design transformation. The **Hierarchy** layer also changes the image direction. The portfolio preview is an original, self-contained comparison composition containing the generated egg photographs; it is explicitly not a browser screenshot.

### Generation record and prompt set

Generated using the built-in image-generation tool, one call per product and era. The shared prompt specifies `product-mockup`, a landscape 3:2 photographic product image, a three-quarter view, a complete central product with safe cropping margins, no people, branding, text, prices or watermark. The AI disclosure is rendered separately in HTML.

Subjects:

- **Trainer:** a fictional red padded abdominal exercise rocker, two curved tubular silver steel rails, black foam hand grips, black headrest and red vinyl rectangular seat.
- **Egg:** a mechanically plausible stainless steel egg topper, hemispherical bell, slender vertical rod and sliding ball, beside a soft-boiled brown egg in a plain white ceramic egg cup and a detached shell cap.
- **Candles:** three plain ivory pillar candles of different heights with tiny warm flames, beside a simple clear glass water tumbler suggesting the fictional tap-water scent.

Retro direction: authentic cheap late-1990s mail-order catalogue photograph; direct flash, harsh shadows, slightly yellow white balance, badly draped saturated royal-blue and lemon-yellow fabric, cramped low-budget staging, mild grain and inexpensive scanner texture. Kitsch and unpolished, with the product still identifiable.

Contemporary direction: premium ecommerce product photography; warm ivory seamless backdrop, soft studio lighting, refined material detail, subtle shadows, sculptural composition and clean photographic realism.

Local retouch prompt: remove only the small black pepper/seasoning specks from the yolk and white; keep the composition, tool, cup, shell, detached cap, background, light and shadows unchanged. The corrected `assets/egg-modern.webp` replaces its previous version.

## Interaction

- **Into the present / Back to 1998:** the only transformation control sits beside the study title. It switches the complete shop between the two presets; the separate action bar, layer controls and slow-motion control have been removed.
- **Motion:** the transformation assembles in overlapping mechanical stages. A shared delay table starts structure/navigation first, then images, text and actions. Each piece moves for 400 ms, with delays up to 480 ms (approximately 880 ms overall). Short holds and restrained overshoot create a segmented rhythm where supported; a cubic-bezier fallback retains the staged order. Image/text snapshots crossfade over 120 ms after their own delay. Reduced motion removes both duration and delays.
- **Campaign carousel:** previous/next buttons, numbered selectors and left/right keyboard navigation. It does not advance automatically. The chosen campaign survives redesign and language changes.
- **Search:** searches the existing product names and article text, presents matching products and moves focus to the selected result. Search terms never become HTML.
- **Demo basket:** quantities, removal, a single €4.90 shipping charge and integer-cent totals. Basket state survives design/language/theme changes, not reloads. No checkout exists.
- **Service dialogs:** explain demo shipping, returns, the fictional retailer and generated images. Native dialogs preserve ordinary Escape and focus behaviour. Their presentation follows the selected era: bevelled grey panels and navy title bars in the old shop, restrained surfaces and animated hover states in the contemporary shop.
- **Newsletter:** native email validation, local confirmation and immediate field reset. No submission, subscription, storage or email delivery occurs.
- **DE/EN:** controls, campaign copy, photo descriptions, article text, search feedback, footer, service dialogs, inspector and basket are translated.

## Anchored UX inspector

Analysis is a **nonmodal tracking overlay**, outside the document flow. Six numbered markers select hierarchy, purchasing, trust, density, imagery and navigation. A compact window contains the before/after interpretation and a counterargument. A highlight and SVG connector identify the chosen element. A separate, pointer-transparent SVG shade dims the rest of the viewport and cuts a clear rectangular opening around the visible selected target.

Scroll, resize and observed size changes schedule one animation-frame update rather than running a continuous animation loop. The panel is clamped to the viewport. On small screens it docks near the bottom, with only its own text body scrolling. Selection remains stable while scrolling; the connector hides when the selected target leaves the visible area. It also pauses during snapshot transformations and reconnects after completion. Escape or the close button returns focus to the opener. The inspector never blocks scrolling through a modal backdrop.

These observations are design hypotheses, not measured usability results or a claim that a newer design is universally better.

## Architecture

The existing three runtime source files remain:

- `index.html`: semantic homepage, both image variants, controls, inspector and native dialogs.
- `style.css`: the independent design layers, photograph switching, responsive layouts, transition styles and inspector presentation.
- `app.js`: shared design state, DE/EN copy, campaign selection, transitions, search, inspector positioning and demo interactions.

The six WebP assets join the existing favicon and archive preview. Inter and JetBrains Mono reuse the portfolio's local WOFF2 files. No framework, package, CDN, analytics or new build step is added.

One `DesignState` drives `data-layout`, `data-type` and `data-focus`. Product and campaign nodes survive transformation; changing a campaign updates its controlled content. The native same-document View Transition API animates uniquely named element snapshots. One delay table generates their CSS timings and supplies the same delays to the FLIP fallback, preventing drift between the two paths. A FLIP fallback records bounding boxes and uses Web Animations for position/scale interpolation. It cannot interpolate individual glyph outlines. If animation APIs are absent, the destination still applies. The shop is temporarily inert during the transformation to prevent clicks on visually moving targets. Controls unlock on completion, cancellation and failure.

The existing Angular asset glob copies this static study. The central archive entry remains `DS/013`. Deployment checks require all six photographs as well as HTML, CSS, JavaScript, favicon and preview.

## Anchors and interaction states

All shop anchors, including the egg and candle cards, share an 84 px top offset beneath the sticky study header. The old 20 px card margin could hide the selected card behind the former action bar and expose the following large egg feature instead. A target outline makes the selected product unambiguous when two cards share a row. Modern buttons, links and inputs transition their visual states smoothly, with shared focus and active tokens for both light and dark themes. The newsletter placeholder uses an Arcor address.

## Verification and limits

The production build, existing Angular tests and targeted DOM integration checks cover state preservation, both UI presets, internal design-state combinations, staged cancellation/fallback paths, translated campaigns, search, basket arithmetic, newsletter interception, service dialogs, six inspector topics and viewport clamping calculations. DOM checks do not verify actual rendered geometry, native snapshot animation quality or visual contrast across every mixed state. Visual browser acceptance remains a separate check. This is not a full WCAG audit or an exhaustive historical survey.

## Technical reference

[Chrome for Developers: same-document View Transitions](https://developer.chrome.com/docs/web-platform/view-transitions/same-document) documents named element snapshots, completion and graceful feature detection. This source informs implementation, not historical interpretation.

## Running

Open `/design-studies/teleshop/` through the existing Angular development server, or serve `src/` with a local HTTP server. Relative font URLs require the surrounding portfolio assets. Deploy through the existing portfolio build workflow.
