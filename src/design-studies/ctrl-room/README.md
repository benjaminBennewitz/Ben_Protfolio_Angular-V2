# CTRL//ROOM — Digital Culture, Different Frequencies

[← Study overview](../../../README.md#standalone-design-studies) · [View live study](https://b2folio.de/design-studies/ctrl-room/)

A graphic-design-led exploration of Y2K visual culture as an audiovisual website for electronic music. Liquid-chrome typography, translucent cobalt player surfaces, icy silver backgrounds, orbital imagery, and magenta accents translate turn-of-the-millennium digital optimism into an interactive web format.

> [!NOTE]
> This is a non-commercial, experimental study in graphic design and web development, created for personal learning. It is not a production product or a commercial service. Its specific design and technical objectives are described below. Accessibility and production readiness are not the primary evaluation goals; support varies, and no comprehensive accessibility audit or WCAG conformance is claimed.

> [!IMPORTANT]
> The source is published for inspection and evaluation only. Public visibility does not grant permission to clone, copy, run, modify, or reuse it. The [portfolio license](../../../LICENSE) applies to original project contributions; third-party components retain their own terms.

## Intent and learning focus

**Primary focus: graphic design — translating a Y2K visual concept into a web format.**

The intended starting point is Y2K visual culture: the optimistic, synthetic digital aesthetic associated with the turn of the millennium. The design question is how material effects, typography, symbols, image treatment, and spatial composition can create a recognizable visual identity for a fictional music and digital-culture platform.

Music, Visuals, People, and Places provide the editorial setting. The player, archive, and fictional artist profile are opportunities to apply one graphic language across different kinds of content. Their technical behavior is a supporting implementation challenge, not a substitute for a resolved art direction.

## Concept and visual direction

The graphic language draws on late-1990s and early-2000s digital culture: metallic display lettering, molded translucent plastic, elliptical orbits, synthetic image layering, and custom media-player skins. Pale icy blue and silver provide the ground; cobalt and magenta establish hierarchy and emphasis.

The hero is composed of independent layers: a CSS grid and noise backdrop, an AI-generated musician with transparent edges, CSS orbital rings, and a separately generated transparent chrome star. Pointer movement and scrolling move those layers at different depths through one event-driven animation frame; the text and player remain stable. The composition uses real HTML typography and controls. The music player is the central designed object: a chrome-framed blue shell with a shared waveform, seek control, volume, and playback state. Events follow in a separate strip. The material language continues through the four channel modules, artist profile, archive filters, native dialogs, and footer. Metal controls use vertical reflections; window and table headers use a softer brushed-metal surface. The archive header has one continuous background across its columns.

On narrow screens, the composition rearranges around a readable title and a full-width player. Text, links, filters, and controls remain native interface elements; the page is not a flattened image of the design proposal. Chrome lettering is a CSS text treatment and retains selectable text and a forced-colors fallback.

Artists, events, archive entries, and network figures are labelled as fictional study content. There is no booking, ticket sale, or live community service.

## Interaction experiments

- A shared audio player with play/pause, seeking, volume, mute, loading, and error states.
- A player window that can be minimized or expanded into a dialog. The same player is moved, preserving playback position.
- An equalizer and waveform driven by actual Web Audio analysis during playback. An illustrative equalizer preview is used separately while audio is idle.
- An archive with 13 local records, combined category and text filters, an empty state, and a detail dialog. `/` focuses search outside input fields.
- Pointer reactions, finite click waves, and hover/focus transitions.

Audio begins after user interaction. Dialogs and the mobile menu include Escape handling and focus management. Reduced-motion preferences disable visual effects and running audio visualization while keeping audio controls available. Dynamic audio visualization is capped at 30 FPS and considers viewport and tab visibility. Hero parallax schedules a frame only after pointer, scroll, resize, or visibility events; it pauses outside the viewport and in hidden tabs. Reduced Motion restores the static layer composition without parallax or continuous decorative animation.

## Technical approach

| Area | File / directory |
| --- | --- |
| Structure, player, and native dialogs | [index.html](index.html) |
| Design tokens, layout, and states | [styles.css](styles.css) |
| Web Audio, archive, navigation, and effects | [script.js](script.js) |
| Images, logos, textures, and MP3 | `assets/` |

HTML, CSS, SVG, and VanillaJS provide the runtime. Fonts, scripts, and media are bundled locally. The page uses document scrolling; the archive table can scroll horizontally within its own area on narrow screens.

The supporting technical learning focus is coordinating audio state, real-time analysis, and reusable player views without a component framework. Audio analysis is disabled under `file://` because of local media restrictions.

## Portfolio integration

The study is served at `/design-studies/ctrl-room/`. Its existing Angular asset integration publishes it as an independent page. It does not inherit the main portfolio's runtime services.

## Credits and source notes

The transparent musician in `assets/hero-musician.webp` was generated with OpenAI ImageGen from the approved hero composition. The People module and artist profile use a separately generated studio photograph, `assets/artist-studio.webp`, with a different pose and headphones around the artist’s neck. The separate chrome ornament in `assets/hero-chrome-star.webp` was generated with OpenAI ImageGen as a transparent layer. These images are labelled as AI-generated. The earlier composite hero remains as a source asset in `assets/y2k-hero.webp`; it is not used as the live hero backdrop. Venue imagery and the audio track retain their AI origin labels. The album cover remains the supplied artwork; it has not been replaced or reclassified.

The hero’s background structure and elliptical rings are CSS; the independently moving chrome star is a separate generated image. The code-rendered backdrop and rings remain distinct from the generated imagery. The interface, chrome headline, player frame, gradients, charts, and interaction effects are implemented in HTML, CSS, SVG, Canvas, and VanillaJS. Locally bundled [Space Grotesk](assets/OFL-Space-Grotesk.txt) and [DM Mono](assets/OFL-DM-Mono.txt) fonts are distributed under the SIL Open Font License 1.1; their notices are included with this study. The portfolio card uses `assets/preview.webp`, a screenshot of the implemented page. Third-party rights remain separate from the portfolio license.
