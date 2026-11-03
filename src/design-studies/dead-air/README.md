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
- Manual FM tuning from 87.5 to 108.0 MHz in 0.1 MHz increments; no developer-only channel presets or interference-strength control.
- Three automatically detected signal states, `normal` (87.6 MHz), `interference` (91.3 MHz), and `unknown` (103.7 MHz). Other frequencies report `NO CARRIER` rather than triggering story events.
- Fixed interference values of 15%, 60%, and 91% respectively; UNKNOWN darkens the camera image by ~30% relative to the previous implementation.
- The inaccurate artificial lighthouse beam has been removed. CAM 01 now uses the owner-corrected scene image without the original baked-in beam.
- Three independent, tightly masked photographic window passes on CAM 01 switch between the original warm-color glazing and a desaturated dark variant. The alpha-masked WebP crops align with the 1280×720 scene master; no artificial light dots or full-scene grayscale effects are used. Surrounding bloom in the concept image is still embedded and cannot be fully removed without a genuinely unlit master.
- CAM 01 also includes a muted lantern lens pass (subtle, slow breathing in NORMAL; short outages in INTERFERENCE/UNKNOWN) and a separate obstacle-light mask on the radio mast (regular red flash, then irregular or interrupted flashes by signal state). Both use exactly aligned photographic crops rather than artificial dots or light beams. The owner-corrected image no longer contains the original beam. A physically convincing rotating light could be developed later from this cleaner master.
- Two selectable sources and the pause button share one compact receiver row under the frequency dial; the monitor gains back the former toolbar height. The video loads only when requested.
- `deadair:frequencychange` and `deadair:signalacquired` events on `window` provide `{ frequency, channel, reception, interference }` for future Web Audio and story triggers. The latter fires only upon acquiring a new named station. No sound is played or fetched yet.
- A ±0.35 MHz capture range makes manual station scanning manageable on touch displays, while the tuner still displays the actual frequency in 0.1 MHz steps.
- Pause / resume freezes CSS animations and playback, with reduced-motion enabled by default for visitors requesting it.
- Scrollfreie Broadcast-Oberfläche (`100dvh` einschließlich Header): Monitor, Quellensteuerung und Signaltelemetrie bleiben auch bei niedriger Fensterhöhe sichtbar.
- Auf schmalen oder besonders niedrigen Displays wird der Empfänger als eigene, tastaturbedienbare Bedienfläche geöffnet. Der Regler und beide Kameratasten bleiben im Dialog erreichbar; der Besucher schließt ihn bei Bedarf über SCHLIESSEN oder Escape.
- Dedicated, keyboard-accessible information dialog containing imprint, privacy and video source links instead of a permanent footer.
- Local station-mark SVG (broadcast tower with red/orange signal waveform) and simplified SVG favicon; the wordmark is typeset directly in the interface.
- Broadcast-specific user-facing copy; technical prototype notes are documented here rather than displayed in the interface.
- Semantic control groups, visible keyboard focus and controls that work without pointing-device gestures.

The art-direction still is a flattened concept visualization. It is **not** a working parallax scene or a replacement for the upcoming separately isolated photographic assets. The ocean video is a moving visual reference; matching the concept still to the video perspective, tracking, compositing and loop continuity remain separate production tasks.

## Scene states

| State | Frequency | Current proof of concept | Later possibilities (not implemented) |
| --- | --- | --- | --- |
| NORMAL | 87.6 MHz | 15% signal disturbance; original lighthouse and subtle independent window changes | Natural birds, calm station lights |
| INTERFERENCE | 91.3 MHz | 60% signal disturbance; dense haze and faster window fluctuations | Unusual flashes, unpredictable lamp patterns |
| UNKNOWN | 103.7 MHz | 91% signal disturbance; darker image, red anomaly and unsteady windows | Additional structure at horizon, altered architecture |

These remain visual states. The three frequencies are initial gameplay candidates, not a final puzzle design. The visitor's objectives, event progression, clickable clues, recorded voices, unlock conditions and any ending will be defined in a later iteration. An untuned frequency is a technical `offair` state, not a fourth story chapter.

## Technical architecture

```text
dead-air/
├── index.html              # Broadcast workstation and accessible information dialog
├── styles.css              # Design tokens, viewport layout, states, responsive, reduced motion
├── scripts/app.js          # FM tuning, automatic states, language, audio-event hook and dialog controls
├── assets/
│   ├── station-mark.svg    # Editable broadcast tower signet
│   ├── favicon.svg         # Reduced signet for browser tabs
│   ├── coast-loop.mp4      # Optimized short footage excerpt, video only
│   ├── scene-poster.webp   # Owner-corrected scene without the original beam
│   ├── window-off-a.webp   # Precisely masked desaturated left window
│   ├── window-off-b.webp   # Precisely masked desaturated centre window
│   ├── window-off-c.webp   # Precisely masked desaturated right window
│   ├── lighthouse-dim.webp # Dimmed photographic lantern glazing
│   ├── mast-light-off.webp # Red mast beacon removed by local image retouch
│   └── preview.webp        # Archive card crop
└── README.md
```

Angular only lists the study via `src/app/core/data/design-studies.ts`; it does not render, bundle or manage the standalone experience. The repository's asset-copy rule publishes the folder at `/design-studies/dead-air/` without adding a dedicated router or web build process.

## Assets and credits

- **Video:** [Pexels — Sea Waves Crashing on Rocky Coast (#5161508)](https://www.pexels.com/video/sea-waves-crashing-on-rocky-coast-5161508/). Supplied by the project owner, cropped in time, downscaled to 1280×720, converted to 24 fps, stripped of audio, and H.264 encoded for the prototype. Source availability and licensing must be checked prior to any external reuse; see [Pexels License](https://www.pexels.com/license/).
- **Art direction:** AI-generated DEAD//AIR scene concept from the project's design phase. `scene-poster.webp` is the owner-corrected master without the baked-in lighthouse beam; `preview.webp` is the existing archive crop. Neither depicts a real station.
- **Typography:** Reuses `BarlowCondensed-Black.ttf` already shipped in the portfolio's existing `/assets/fonts/studies/` directory; falls back to system fonts. No new external font or third-party library is loaded.

## Follow-up work

1. Validate the scene's true location and scale against a stabilized video master.
2. Produce and isolate tower, station, aerials, mist and anomaly photo assets at matching light and perspective.
3. Replace the flattened still with controllable photographic layers and coordinate-tracked movement.
4. Define the discoverable frequencies and their prerequisites (clues, cameras, interaction), then bind player events to the existing receiver instead of creating UI-only state buttons.
5. Record original voice lines and add an opt-in Web Audio signal chain (band-pass filtering, noise, mild distortion). No audio autoplay or microphone permissions required.
6. Audit keyboard and screen-reader paths, performance, reduced-motion and mobile readability as the concept matures.
