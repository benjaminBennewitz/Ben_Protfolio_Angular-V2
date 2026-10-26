# CTRL//ROOM — Digital Culture, Different Frequencies

[← Study overview](../../../README.md#standalone-design-studies) · [View live study](https://b2folio.de/design-studies/ctrl-room/)

An audiovisual microsite connecting electronic music, Y2K interface design, and digital culture. A fictional cultural archive surrounds a functioning music player.

> [!NOTE]
> This is a non-commercial, experimental design and development study created for personal learning, exploring technologies, and combining visual and interaction techniques. It is not a production product or a commercial service. Accessibility and production readiness are not the primary evaluation goals; support varies, and no comprehensive accessibility audit or WCAG conformance is claimed.

> [!IMPORTANT]
> The source is published for inspection and evaluation only. Public visibility does not grant permission to clone, copy, run, modify, or reuse it. The [portfolio license](../../../LICENSE) applies to original project contributions; third-party components retain their own terms.

## Concept and visual direction

Dark surfaces, lime accents, blue outlines, technical labels, and window-like panels define the interface. Music, Visuals, People, and Places organize the content. The fictional artist KATZKII and the track “Midnight in the Lower Sector” connect the different areas.

Artists, events, archive entries, and network figures are labelled as fictional study content. There is no booking, ticket sale, or live community service.

## Interaction experiments

- A shared audio player with play/pause, seeking, volume, mute, loading, and error states.
- A player window that can be minimized or expanded into a dialog. The same player is moved, preserving playback position.
- An equalizer and waveform driven by actual Web Audio analysis during playback. An illustrative equalizer preview is used separately while audio is idle.
- An archive with 13 local records, combined category and text filters, an empty state, and a detail dialog. `/` focuses search outside input fields.
- Pointer reactions, finite click waves, and hover/focus transitions.

Audio begins after user interaction. Dialogs and the mobile menu include Escape handling and focus management. Reduced-motion preferences disable visual effects and running audio visualization while keeping audio controls available. Dynamic visualization is capped at 30 FPS and considers viewport and tab visibility.

## Technical approach

| Area | File / directory |
| --- | --- |
| Structure, player, and native dialogs | [index.html](index.html) |
| Design tokens, layout, and states | [styles.css](styles.css) |
| Web Audio, archive, navigation, and effects | [script.js](script.js) |
| Images, logos, textures, and MP3 | `assets/` |

HTML, CSS, SVG, and VanillaJS provide the runtime. Fonts, scripts, and media are bundled locally. The page uses document scrolling; the archive table can scroll horizontally within its own area on narrow screens.

The learning focus is coordinating audio state, real-time analysis, reusable player views, and a strongly styled interface without a component framework. Audio analysis is disabled under `file://` because of local media restrictions.

## Portfolio integration

The study is served at `/design-studies/ctrl-room/`. Its existing Angular asset integration publishes it as an independent page. It does not inherit the main portfolio's runtime services.

## Credits and source notes

Photographic motifs and the audio track are labelled as AI-generated. The album cover is supplied artwork. The interface, charts, lines, and color surfaces are implemented in code. Third-party rights remain separate from the portfolio license.
