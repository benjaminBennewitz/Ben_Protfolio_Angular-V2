# DEAD//AIR — North Coast Broadcasting System

[← Design archive](https://b2folio.de/archive) · [Open study](https://b2folio.de/design-studies/dead-air/)

A fictional, analogue coastal broadcast interface. Photographic footage, an AI-generated art-direction still, weathered receiver controls and three experimental signal states establish the identity of **DEAD//AIR**. This is a first visual/technical prototype, not a completed interactive story.

> [!NOTE]
> Independent non-commercial design study by Benjamin Bennewitz (B²), 2026. It is an evolving experiment rather than a production broadcast system or a finished game. Accessibility has been considered, but no comprehensive WCAG audit is claimed.
>
> [!IMPORTANT]
> Original source code and artwork remain subject to the portfolio's [LICENSE](../../../LICENSE). The Pexels video remains subject to its creator's and the provider's applicable terms. Do not redistribute the footage under the portfolio's source-code license.

## Design question

Can a believable late-1980s/early-1990s regional broadcasting identity make a photographic coastal environment feel subtly supernatural through signal conditions and the language of an analogue receiver?

The fictional North Coast Broadcasting System (NCBS) is framed as a decommissioned, remote coastal radio and television station. The visual language combines weathered metal, phosphor-green frequency displays, heavy condensed typography, coarse film texture and a restrained red/orange interference accent. The title **DEAD//AIR** references both broadcast silence and the possibility of transmission after shutdown.

## Current prototype

- Native HTML, CSS and JavaScript ES module; no app framework, bundler or runtime dependencies.
- English and German translations of all control instructions and descriptions; broadcast branding remains in English.
- Three selectable signal states, `normal`, `interference`, `unknown`, that change atmosphere and readouts without imposing story mechanics.
- Two selectable sources: generated photographic art-direction still and original live-action coastline video (only loaded when requested).
- Interference-strength range input adjusts visible signal artefacts.
- Pause / resume freezes CSS animations and playback, with reduced-motion enabled by default for visitors requesting it.
- Scrollfreie Broadcast-Oberfläche (`100dvh` einschließlich Header): Monitor, Quellensteuerung und Signaltelemetrie bleiben auch bei niedriger Fensterhöhe sichtbar.
- Auf schmalen oder besonders niedrigen Displays wird der Empfänger als eigene, tastaturbedienbare Bedienfläche geöffnet. Die Kanalauswahl schließt sie automatisch und zeigt die aktualisierte Kameraansicht.
- Dedicated, keyboard-accessible information dialog containing imprint, privacy and video source links instead of a permanent footer.
- Local station-mark SVG (broadcast tower with red/orange signal waveform) and simplified SVG favicon; the wordmark is typeset directly in the interface.
- Broadcast-specific user-facing copy; technical prototype notes are documented here rather than displayed in the interface.
- Semantic control groups, visible keyboard focus and controls that work without pointing-device gestures.

The art-direction still is a flattened concept visualization. It is **not** a working parallax scene or a replacement for the upcoming separately isolated photographic assets. The ocean video is a moving visual reference; matching the concept still to the video perspective, tracking, compositing and loop continuity remain separate production tasks.

## Scene states

| State | Frequency | Current proof of concept | Later possibilities (not implemented) |
| --- | --- | --- | --- |
| NORMAL | 87.6 MHz | Soft fog, stable signal, beacon | Natural birds, calm station lights |
| INTERFERENCE | 91.3 MHz | Dense haze, muted colors, unstable readout | Unusual flashes, unpredictable lighthouse patterns |
| UNKNOWN | ???.? MHz | Red-tinted anomaly, degraded image | Additional structure at horizon, altered architecture |

These are visual placeholders. The visitor's objectives, event progression, frequency tuning mechanics, audio system and any ending will be designed in a later iteration.

## Technical architecture

```text
dead-air/
├── index.html              # Broadcast workstation and accessible information dialog
├── styles.css              # Design tokens, viewport layout, states, responsive, reduced motion
├── scripts/app.js          # Central UI, language, signal and dialog controls
├── assets/
│   ├── station-mark.svg    # Editable broadcast tower signet
│   ├── favicon.svg         # Reduced signet for browser tabs
│   ├── coast-loop.mp4      # Optimized short footage excerpt, video only
│   ├── scene-poster.webp   # AI-generated art-direction scene crop
│   └── preview.webp        # Archive card crop
└── README.md
```

Angular only lists the study via `src/app/core/data/design-studies.ts`; it does not render, bundle or manage the standalone experience. The repository's asset-copy rule publishes the folder at `/design-studies/dead-air/` without adding a dedicated router or web build process.

## Assets and credits

- **Video:** [Pexels — Sea Waves Crashing on Rocky Coast (#5161508)](https://www.pexels.com/video/sea-waves-crashing-on-rocky-coast-5161508/). Supplied by the project owner, cropped in time, downscaled to 1280×720, converted to 24 fps, stripped of audio, and H.264 encoded for the prototype. Source availability and licensing must be checked prior to any external reuse; see [Pexels License](https://www.pexels.com/license/).
- **Art direction:** AI-generated DEAD//AIR scene concept from the project's design phase. `scene-poster.webp` and `preview.webp` are crops of the concept board, not photographic evidence of a real station.
- **Typography:** Reuses `BarlowCondensed-Black.ttf` already shipped in the portfolio's existing `/assets/fonts/studies/` directory; falls back to system fonts. No new external font or third-party library is loaded.

## Follow-up work

1. Validate the scene's true location and scale against a stabilized video master.
2. Produce and isolate tower, station, aerials, mist and anomaly photo assets at matching light and perspective.
3. Replace the flattened still with controllable photographic layers and coordinate-tracked movement.
4. Design user intention, interaction rules, events, sound and potential endings before adding story code.
5. Audit keyboard and screen-reader paths, performance, reduced-motion and mobile readability as the concept matures.
