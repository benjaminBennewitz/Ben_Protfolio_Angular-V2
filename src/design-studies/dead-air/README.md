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
- `deadair:frequencychange` and `deadair:signalacquired` events on `window` provide `{ frequency, channel, reception, interference }` for story and audio triggers. The latter fires only upon acquiring a new named station. Since Patch 32, the first received transmission plays from a locally bundled MP3.
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
5. Replace the synthetic demo recordings with original, naturally spoken DE/EN shift-worker voices and professionally designed radio interference. The current audio plays automatically when permitted by the browser; no microphone permissions are used.
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


## Patch 29 – Kamera-Sperre während des Morsecodes

- Während `morse-active` auf CAM 01 und 91.3 MHz blockiert ein CAM-02-Klick die Umschaltung.
- Statt eines Kamerabildes erscheint für 320 ms ein abruptes, vollständig schwarzes Signalbild; danach ist CAM 01 unverändert sichtbar.
- Video, Flaschenpost, Morsecode und ausgewählter Kamerabutton bleiben in diesem Fall unverändert.
- Sobald 91.3 MHz verlassen oder die nächste Story-Phase erreicht wird, funktionieren reguläre harte Kamerawechsel wieder.
- Der blockierte Wechsel wird für Screenreader auf Deutsch und Englisch angesagt.


## Patch 29 – Anomalieindikator im Receiver-Readout

- Die Balken unter dem Monitor werden nicht mehr permanent und zufällig animiert, sondern folgen dem tatsächlichen Story-Fortschritt.
- **ROUTINE / CAM 01:** niedrige, statische Balken ohne Bewegung. **ROUTINE / CAM 02:** kaum wahrnehmbare Anfangsbewegung, die über 15 Sekunden bis zum Flaschenpost-Reveal kontinuierlich zunimmt.
- Nach dem Einsammeln der Flaschenpost steigt die Aktivität mit den Stufen **message-found → morse-active → windows-event** und bleibt als Fortschrittssignal erhalten – unabhängig von der gerade eingestellten Frequenz.
- Der Anomalie-Indikator ist von der Empfangsqualität (`RX`) getrennt. Er wird bei PAUSE oder einem inaktiven Tab eingefroren und besitzt eine übersetzte, nicht permanent vorlesende Meter-Beschreibung für Assistenztechnologien.
- Kein neues Framework, keine Assets, kein zusätzlicher Animationsloop: Die Anzeige verwendet den bereits vorhandenen Story-Takt.


## Patch 30 – Screen-local anomaly presence

- Die Monitorbalken zeigen nicht mehr den Spielfortschritt, sondern ausschließlich aktuelle Anomalien in der ausgewählten Kamera.
- CAM 01 startet und bleibt außerhalb aktivierter Signale vollständig ruhig.
- CAM 02 baut vor der Flaschenpost über 15 Sekunden langsam Aktivität auf, erreicht bei der Erscheinung einen Peak und fällt danach wieder ab. Nach dem Einsammeln bleibt die Küste ruhig.
- Während des Morsecodes zeigt CAM 01 Aktivität nur auf 91.3 MHz; beim Verlassen der Frequenz beruhigt sich die Anzeige sofort.
- Das Fensterereignis auf CAM 01 / 103.7 MHz verursacht einen starken Ausschlag, der langsam abklingt. Bei CAM 02 bleibt sie null; auf CAM 01 zeigt sie das weiterhin sichtbare Fensterflackern an, auch wenn die Frequenz gewechselt wird.
- Die visuelle Farbcodierung richtet sich ebenfalls nach der momentanen Intensität und nicht nach der erreichten Story-Stufe.
- Phase 03 (neuer Fund nach der Fensteranomalie) ist noch nicht implementiert und muss erzählerisch/visuell ausgearbeitet werden.


## Patch 31 – Autonomous Tuning / First Voice Transmission

- **Nächster Abschnitt nach 103.7 MHz:** Nach 2,8 Sekunden Fensterflackern auf CAM 01 übernimmt die Frequenzsteuerung automatisch den Regler.
- Der Regler läuft ca. 4,8 Sekunden über 103.7 → 93.8 → 102.6 → 89.9 → **96.4 MHz**; das sind drei Richtungswechsel.
- Manuelles Tuning und CAM 02 sind während des automatischen Suchlaufs gesperrt. Die Story-Uhr hält beim Pausieren, bei inaktiven Tabs und geöffneten Dialogen an.
- Nach Empfang erscheint **AUDIO / 001**. Der Dialog zeigt das erste harmlose, scheinbar hilfsbereite Funkfragment mit zunächst unbekanntem Absender. Die Stimme stammt erzählerisch von den dimensionsfremden Wesen; das bleibt dem Spieler verborgen.
- **Stand Patch 31:** Es lag zunächst nur ein Transkript vor. **Seit Patch 32** sind lokal erzeugte Audio-Demos enthalten, die beim Empfang automatisch abgespielt werden.
- Neue Hooks: `deadair:autoscanstarted` und `deadair:transmissionreceived`.
- Fenster-, Morse-, Flaschen- und CAM-Cut-Mechaniken bleiben unverändert; nur die neuen Story-Stufen und dazugehörige Empfangsanzeige wurden ergänzt.


## Patch 32 – Automatischer Funkempfang und Portal-Mechanik (Konzept)

### Erste Funkaufnahme / AUDIO 001

- Bei erfolgreichem automatischem Tuning auf **96.4 MHz** beginnt die erste Nachricht ohne weiteren Klick zu spielen; ein Dialog wird dabei **nicht automatisch geöffnet**.
- Aus dem Off meldet sich angeblich **Alex von der verschwundenen NCBS-Nachtschicht**. Sie bittet um Unterstützung bei einer vermeintlich defekten Küstenpeilung. Der tatsächliche Absender sind die dimensionsfremden Wesen.
- Das Archiv (`AUDIO / 001`) öffnet das Transkript und erlaubt die erneute Wiedergabe über einen nativen, barrierefreien Audio-Player. Die MP3-Dateien sind lokal unter `assets/transmission-001-de.mp3` und `assets/transmission-001-en.mp3` abgelegt.
- Tonfassungen sind **vorläufige synthetische Funk-Demos** (eSpeak und analoger Bandpass/Rauschen), damit Story und Audio technisch bereits vollständig funktionieren. Für das finale Erlebnis sollen sie durch glaubwürdig eingesprochene, professionell bearbeitete Aufnahmen mit gleichem Namen ersetzt werden.
- Ist das automatische Abspielen durch Browser-Autoplay-Regeln blockiert, wird der Archivbutton zur klar sichtbaren manuellen Startaktion. Keine Falschanzeige einer laufenden Wiedergabe.
- Pause und unsichtbare Browser-Tabs halten die Aufnahme an. Ein Sprachwechsel während der Wiedergabe startet die Aufnahme in der gewählten Sprache neu.

### Erzähl- und Rätselkonzept: vermeintliche Rettungspeilung

Diese folgenden Schritte sind **geplant, nicht implementiert**. Sie geben jeder späteren Spieleraktion einen plausiblen technischen Grund, bevor die Dimensionstor-Auflösung erfolgt.

1. **Drei Relaisbojen auffinden:** Nach AUDIO 001 tauchen nach und nach drei unterschiedliche Peilsignale auf CAM 02 auf; ihre Kennungen müssen über Kamera- und Funkhinweise entschlüsselt werden. Die Nachtwache stellt sie als ausgefallene Küstenpeilung dar. Die drei Punkte bilden in Wahrheit die Ecken des späteren Meer-Dreiecks.
2. **Rücklauf/Phasenabgleich:** Die drei empfangenen Signale müssen anhand unterschiedlicher Hinweise aufeinander synchronisiert werden (kein bloßes dreimaliges Frequenzraten). Die Nachtwache behauptet, nur so könne die Küstenwache ein Ortungssignal erhalten. Tatsächlich stabilisiert der Spieler die räumliche Resonanz zwischen den Ecken.
3. **Rückkanal freigeben:** Erst nach bestätigter Peilung und Synchronisation erscheint die Aufforderung, einen einmaligen **Ortungsimpuls** über den Stationssender zu schicken. Der angebliche Rettungsruf schließt den Stromkreis des dreieckigen Resonanzsystems; das Dimensionstor öffnet sich als Bermuda-Dreieck-Erscheinung im Meer.

**Dramaturgie:** Jede Bedingung verdient eine eigene beobachtbare Veränderung auf CAM 01/02 und optional eine zunehmende Täuschung in den Funkaufzeichnungen. Es gibt keinen vorzeitigen Tor-Trigger und keine sofortige Erklärung der Wesen.


## Patch 33 – Relay Recovery / Phase 04 (implementiert)

- **Freischaltung:** Sobald der automatische Suchlauf bei 96.4 MHz endet, wird das NCBS-Relaisprotokoll (RELAIS / 0/3) freigeschaltet. Vor AUDIO / 001 sind keine Relais sichtbar oder abstimmbar.
- **CAM 02:** Drei sehr dezente Positionslichter liegen fest auf der Küstenkamera. Über Klick, Tippen oder Tastatur öffnen sie das Relaisprotokoll mit drei groben Suchbereichen: A 88–90 MHz, B 98–100 MHz und C 105–107 MHz.
- **Frequenzrätsel:** Die tatsächlichen Träger liegen auf **88.9, 99.1 und 106.2 MHz**. Bei einer Übereinstimmung mit dem FM-Regler erscheint in CAM 02 die Aktion **VERBINDEN / A/B/C** direkt am bestehenden Empfangsdisplay. Jeder Träger kann nur einmal verbunden werden.
- **Anomalieanzeige:** Nur während einer Suche in der Nähe eines noch offenen Signals und nur in CAM 02 steigen die Balken. Der Ausschlag hängt von der Annäherung an die korrekte Frequenz ab; dauerhaft verbundene Bojen verursachen keine Anomalie mehr. Kein künstlicher Fortschrittsanzeiger.
- **Story-Ende des Patches:** Bei **RELAIS / 3/3** meldet das Protokoll, dass die Peilung noch nicht synchron ist (`relays-linked`). Die folgende Phasenabgleich-Mechanik und AUDIO / 002 sind **noch nicht implementiert**.
- Die bekannten Stufen (Flaschenpost, Morsecode, Fensterflackern, automatischer Suchlauf, AUDIO / 001) bleiben unverändert; das Audioarchiv funktioniert auch nach 3/3. Dialog, Status und Aktionen besitzen DE/EN-Texte. Neue Ereignis-Hooks: `deadair:relaylinked`, `deadair:relaysrestored`.
- **Testumfang:** Isolierter Chromium-Test der vollständigen Kette, drei Verbindungen, Dialog, Sprachwechsel, responsive Ansichten 375/390/1024 px und fehlender JS-Laufzeitfehler. Der vollständige Integrationstest mit dem echten B2FOLIO-Repository steht aus.


## Patch 34 – Signal Alignment & Camera 01 Reaction

- Gesicherte Akten, AUDIO / 001, AUDIO / 002, RELAIS und SYNC werden im linken Empfangs-/Steuerpanel statt im Monitorkopf bedient.
- DEAD//AIR-Headlines mit mehr Letterspacing; responsive Fontgrößen angepasst.
- Nach allen drei Relais erscheint AUDIO / 002 und wird automatisch als lokale DE/EN-Funkaufnahme wiedergegeben; beide Aufnahmen bleiben im Archiv verfügbar.
- SYNC / 3 erlaubt die Phasenabgleichung der zwei verschobenen Signalwellen B/C mit A als Referenz. Abschluss erst nach bewusster Bestätigung, nur nach RELAIS / 3/3.
- Nach erfolgreicher Synchronisation werden beide Regler gesperrt und der Story-State `synchronized` ausgelöst. Dies ist noch **nicht** das Finale / der Rettungsimpuls.
- CAM 01: Der Leuchtturm-Kegel erlischt erst nach der Synchronisation, das rote Mastlicht sendet dann eine rätselhafte Morsefolge. Der eigentliche Leuchtturm bleibt vorerst unverändert.
- Native Dialoge, DE/EN, tastaturbedienbare Range-Inputs, Pause und reduzierte Bewegung berücksichtigt.
