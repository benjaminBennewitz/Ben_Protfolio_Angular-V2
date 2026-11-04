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
- Three channel frequencies with staged unlocks: `normal` (87.6 MHz) is initially available, `interference` (91.3 MHz) becomes receivable after reading the message bottle, and `unknown` (103.7 MHz) after the radio mast starts signaling. Before an unlock, they report `NO CARRIER`.
- Fixed interference values of 15%, 60%, and 91% respectively; UNKNOWN darkens the camera image by ~30% relative to the previous implementation.
- CAM 01 uses the owner-corrected scene image without the original baked-in beam; a static, warmly feathered lighthouse glow is generated independently by CSS.
- Three independent, tightly masked photographic window passes on CAM 01 switch between the original warm-color glazing and a desaturated dark variant. The alpha-masked WebP crops align with the 1280×720 scene master; no artificial light dots or full-scene grayscale effects are used. Surrounding bloom in the concept image is still embedded and cannot be fully removed without a genuinely unlit master.
- CAM 01 has a static, softened CSS lighthouse beam and a CSS mast light. At the beginning the windows are dark and the mast light stays continuously on; only the later story stages enable Morse flashes and window flicker.
- Two selectable sources and the pause button share one compact receiver row under the frequency dial; the monitor gains back the former toolbar height. The video loads only when requested.
- `deadair:frequencychange` and `deadair:signalacquired` events on `window` provide `{ frequency, channel, reception, interference }` for future Web Audio and story triggers. The latter fires only upon acquiring a new named station. No sound is played or fetched yet.
- A ±0.35 MHz capture range makes manual station scanning manageable on touch displays, while the tuner still displays the actual frequency in 0.1 MHz steps.
- Pause / resume freezes CSS animations and playback, with reduced-motion enabled by default for visitors requesting it.
- Scrollfreie Broadcast-Oberfläche (`100dvh` einschließlich Header): Monitor, Quellensteuerung und Signaltelemetrie bleiben auch bei niedriger Fensterhöhe sichtbar.
- Auf schmalen oder besonders niedrigen Displays wird der Empfänger als eigene, tastaturbedienbare Bedienfläche geöffnet. Der Regler und beide Kameratasten bleiben im Dialog erreichbar; der Besucher schließt ihn bei Bedarf über SCHLIESSEN oder Escape.
- Dedicated, keyboard-accessible information dialog containing imprint, privacy and video source links instead of a permanent footer.
- Local station-mark SVG (broadcast tower with red/orange signal waveform) and simplified SVG favicon; the wordmark is typeset directly in the interface.
- Broadcast-specific user-facing copy; technical prototype notes are documented here rather than displayed in the interface.
- Nach 15 Sekunden aktiver Laufzeit materialisiert auf CAM 02 eine klickbare Flaschenpost als erstes echtes Story-Artefakt. Ein Dialog mit übersetzter Fundnotiz startet die spätere Frequenzkette um 91.3 MHz.
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


## Patch 13 – CSS Mast LED & Visible Lighthouse Beam

- `scene-poster.webp` durch die vom Nutzer korrigierte Motivversion ersetzt.
- Rotes Mastsignal als CSS-Licht an der Mastspitze umgesetzt.
- Neuer CSS-Beam direkt an der Leuchtturm-Laterne, ohne externes Beam-Asset.

## Patch 14 – Beacon Refinement

- Entfernte `lighthouse-dim.webp`-Referenz und zugehörige Fotomasken-/Keyframe-Regeln vollständig entfernt.
- Horizontalen Beacon von einer hart beschnittenen Polygonform auf einen weich maskierten CSS-Lichtgradienten umgestellt.
- Leuchtfeuer-Pivot auf die Laterne ausgerichtet und die bisherige 2D-Neigung durch horizontale Rotation (`rotateY`) ersetzt.
- Rotes Mastlicht bei unveränderter Höhe um 10 Pixel nach links verschoben.
- Zwei in Patch 13 beschädigte Selektoren für die dritte Fenstergruppe und den Anomalie-Layer wiederhergestellt.

## Patch 15 – Mast position and light cone

- Mastlicht um weitere 15 Originalbild-Pixel nach links und 5 Pixel nach oben versetzt (1280 × 720 als Bezug, proportional bei responsiver Skalierung).
- Den horizontalen Leuchtturm-Beam wieder als gerichteten, konischen Lichtkegel angelegt; weiche Blur-Kanten und Alpha-Auslauf bleiben erhalten.
- Empfangszustände, Blinkrhythmen, Pause und Reduced-Motion-Verhalten bleiben unverändert. CAM 02 schaltet alle stationsbezogenen Licht-Layer auch nach einem Zustandswechsel sicher ab.


## Patch 16 – Diffuse Beacon Beam

- Mastlicht weitere 5 Bildpixel nach links verschoben.
- Beam-Startpunkt 5 Bildpixel nach oben verlagert und farblich gelber abgestimmt.
- Der Leuchtturm-Beam rotiert nicht mehr, sondern wächst diffuser in die neblige Distanz.
- Breitere Streuung und weichere Alpha-Kanten für glaubwürdigeren Dunst im Himmel.


## Patch 17 – Static Diffuse Beam

- Mastlicht 2 Bildpixel nach rechts verschoben.
- Beam nicht mehr animiert, sondern als statischer Lichtkegel belassen.
- Beam-Startpunkt abgesenkt und schmaler gesetzt.
- Wärmerer, gelblicher Farbton und weichere, diffusere Kanten im Nebel.


## Patch 18 – Denser Warm Beam

- Beam deutlich dichter und sichtbarer gemacht.
- Größerer gelber Lichtschein direkt um die Laterne.
- Wärmerer Farbton mit weniger Weißanteil.
- Weichere Maskierung und breiteres Blur für diffusere Kanten im Nebel.


## Patch 19 – Softer Fog Scatter

- Beam-Kanten weiter aufgeweicht.
- Größere Streuung im bewölkten, nebligen Himmel.
- Laternen-Glow vergrößert, ohne den Startpunkt zu verändern.
- Leicht größere Beam-Fläche für ein diffuseres Auslaufen.


## Patch 20 – Bewegter Küstennebel

- Zwei unabhängig driftende, weich maskierte Nebelbänke über CAM 01.
- Eine gemeinsam genutzte, komprimierte `assets/coastal-fog.webp`-Textur (~52 KB), ohne JavaScript oder Bibliotheken.
- Sichtbarkeit abhängig von NORMAL, INTERFERENCE, UNKNOWN und OFF AIR; CAM 02 zeigt nur die natürliche Videoatmosphäre.
- PAUSE und `prefers-reduced-motion` stoppen beide Nebelbewegungen; Leuchtturm, Mastlicht und Fenster bleiben unverändert.

## Patch 21 – Dense Animated Coastal Fog

- Ursache für den kaum sichtbaren Nebel behoben: Die frühere Textur war im Durchschnitt zu transparent und wurde mehrfach zusätzlich maskiert.
- Dichte, fotografisch weiche `coastal-fog.webp` mit deutlicher sichtbaren Nebelbänken und organischen Intensitätsunterschieden.
- Zwei unterschiedlich schnelle, überlappende Ebenen ziehen am Horizont und über den Felsen; ein dezenter Grunddunst verbindet beide.
- Vorhandene Signalzustände, Kameras, Pause und Reduced Motion bleiben erhalten.


## Patch 22 – First Story Artifact: Message Bottle

- Neue freigestellte Flaschenpost (`message-bottle.webp`) und ein separater Glitch-Zustand (`message-bottle-glitch.webp`) als CAM-02-Asset ergänzt.
- Die Flaschenpost erscheint nach 15 Sekunden aktiver Laufzeit automatisch auf CAM 02, ohne permanente UI-Hinweise oder zusätzliche Debug-Steuerung.
- Erscheinen erfolgt mit kurzer dimensionaler Materialisierungsanimation; danach bleibt das Objekt als klickbares Fundstück im Bild.
- Klick auf das Artefakt öffnet einen neuen Dialog mit der ersten erzählerischen Nachricht und dem Hinweis auf 91.3 MHz sowie die Stationskamera.
- `deadair:bottleappeared` und `deadair:bottleopened` stehen auf `window` als Hook für die spätere Ereigniskette bereit.


## Patch 23 – Investigation Intro & Stabilized CAM 02

- **ROUTINE:** Die Fenster werden bereits ab Beginn vollständig durch die vorhandenen Off-Masken abgedunkelt; das rote Mastlicht leuchtet ohne Blinken. Frühe Frequenzsuche triggert keine Story-Effekte.
- Funkfrequenzen werden schrittweise freigeschaltet: Erst nach der Flaschenpost kann 91.3 MHz empfangen werden. Erst CAM 01 + 91.3 MHz startet das Morse-Lichtsignal `1037`; erst anschließend kann 103.7 MHz das Fensterereignis auslösen.
- Die Flaschenpost enthält nun eine glaubwürdigere, scheinbar menschliche Spur zu einem fehlenden Teil der letzten Übertragung. Die Wesen geben sich nicht zu erkennen, die Kennung `91 / 3` muss interpretiert werden.
- Die Flasche materialisiert erst, wenn CAM 02 nach Ablauf von 15 Sekunden aktiver Laufzeit tatsächlich sichtbar ist. Kein übertriebener Zoom, kein dauerhaftes Schweben nach dem Reveal.
- `coast-loop.mp4` wurde mit FFmpeg `vidstabdetect` / `vidstabtransform` im Tripod-Modus stabilisiert und als H.264 erneut gespeichert. Der Felsbereich bleibt nun über die 12 Sekunden weitgehend ortsfest (in einer Stichprobe verringerte sich die horizontale Abweichung von 22 auf 3 Pixel); die Brandung bewegt sich weiterhin. Die Stabilisierung kann den Bildrand geringfügig beschneiden.
- `scene` verwendet `role=group` statt `role=img`, damit die interaktive Flaschenpost für Screenreader nicht als dekorativer Bildinhalt versteckt wird.


## Patch 24 – Window Layer Depth Fix

- Die dunkle Fenster-Ebene (`scene__window-lights`) wurde von `z-index: 4` auf `z-index: 1` verschoben.
- Dadurch liegen die gedimmten Fenster wieder hinter dem atmosphärischen Nebel und nicht mehr fälschlich darüber.
- Keine Änderung an Story-Logik, Video oder Flaschenpost-Ablauf.


## Patch 25 – Hard Camera Cuts

- Die weiche Überblendung zwischen CAM 01 und CAM 02 wurde entfernt.
- Artwork, Video und Quell-nebel schalten jetzt ohne Crossfade um.
- Beim Kamerawechsel liegt kurz ein harter Schwarzbild-/Signalglitch über dem Monitor, angelehnt an alte portable TV-Geräte der 80er/90er.
- Das Küstenvideo wird beim Start einmal vorgeladen, damit der erste Wechsel robuster ist.

## Patch 27 – Synchronous Camera Cut

- CAM 01 und CAM 02 wechseln unmittelbar im selben Event-Handler; sämtliche 72/168-ms-Umschalt-Timer und der dauerhafte Schwarzbild-Glitch entfallen.
- Die inaktive Bildquelle wird mit `display: none` vollständig aus dem Rendering entfernt, statt über die Opacity zu überblenden.
- Die Flaschenpost und ihre laufende Materialisierungsanimation verschwinden beim Wechsel zu CAM 01 ebenfalls sofort, ohne 420-ms-Opacity-Transition.
- Die stationsbezogenen Licht- und Nebel-Layer werden auf CAM 02 ebenso hart ausgeblendet.
- CAM 02 erhält ein eigenes Standbild `assets/coast-poster.webp` aus dem stabilisierten Küstenvideo, damit auch vor dem ersten dekodierten Videoframe kein CAM-01-Bild erscheint.
- Der Flaschenpost-Reveal selbst bleibt erhalten; es gibt lediglich keine Animation beim Kamerawechsel.


## Patch 28 – Fundstück sichern und Signalphase

- Nach dem ersten Schließen der Flaschenpost-Nachricht wird das Objekt vollständig aus CAM 02 entfernt. Der Fund gilt dann als eingesammelt; er erscheint auch nach Kamerawechseln nicht erneut.
- Der kleine Button `AKTE / 01` erscheint erst nach der Aufnahme und öffnet die Nachricht jederzeit erneut. Er benötigt keinen neuen Dialog oder eine weitere Asset-Kopie.
- Der bestehende Morsecode `1037` leuchtet nur bei `91.3 MHz` in CAM 01; beim Wegstimmen erlischt die Sequenz und die rote Mastlampe leuchtet konstant.
- Die vorhandene Story-Gate-Kette bleibt bestehen: ROUTINE → Fund öffnen und schließen → 91.3 MHz auf CAM 01 → Morse → 103.7 MHz auf CAM 01 → Fensterflackern.

### Ausarbeitung der nächsten Phase

**Phase 02 / THE SIGNAL:** Der Spieler findet die Kennung `91 / 3` auf dem Fundstück und stimmt 91.3 MHz ab. Auf CAM 01 sendet das rote Mastlicht wiederholt `1037` als korrekten Morse-Zahlencode (`.---- / ----- / ...-- / --...`). Der Empfänger selbst verrät die nächste Frequenz nicht. Sobald 103.7 MHz auf CAM 01 abgestimmt wird, beginnen die zuvor dunklen Fenster getrennt voneinander zu flackern und die Atmosphäre der Station wird unnatürlicher. Das Fensterereignis bildet den Übergang zum nächsten, noch auszuarbeitenden Fundstück.

**Designprinzip:** Keine automatische Kamerawahl, keine Popup-Hinweise und keine Überspringbarkeit per zufällig früh eingestellten Frequenzen. Die ursprüngliche Geschichte der verschwundenen Schicht bleibt bis zum Finale verborgen.
