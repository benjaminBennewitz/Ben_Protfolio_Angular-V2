# DEAD//AIR — North Coast Broadcasting System

[← Design archive](https://b2folio.de/archive) · [Open study](https://b2folio.de/design-studies/dead-air/)

A fictional analogue coastal broadcast mystery. **DEAD//AIR** combines camera observation, radio exploration, coded light signals, recorded evidence and relay identification. An unverified distress call draws the investigator toward two different supernatural endings.

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
- German-only game interface and recordings; a shared mute switch and master volume control cover speech, effects and atmosphere.
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
- Desktop: scrollfreie Broadcast-Oberfläche (`100dvh` einschließlich Header). Mobil und bei geringer Fensterhöhe: Monitor und Radio dauerhaft untereinander im normalen Dokumentfluss.
- Auf schmalen oder besonders niedrigen Displays stehen Monitor und Empfänger dauerhaft untereinander. Die Einleitung erscheint dort einmal beim Start als nativer Dialog.
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
├── scripts/app.js          # FM tuning, automatic states, audio-event hook and dialog controls
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
5. Replace the synthetic demo recordings with original, naturally spoken German shift-worker voices and professionally designed radio interference. The current audio plays automatically when permitted by the browser; no microphone permissions are used.
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
- Der blockierte Wechsel wird für Screenreader auf Deutsch angesagt.


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
- Das Archiv (`AUDIO / 001`) öffnet das Transkript und erlaubt die erneute Wiedergabe über einen nativen, barrierefreien Audio-Player. Die MP3-Dateien sind lokal unter `assets/transmission-001-de.mp3` abgelegt.
- Tonfassungen sind **vorläufige synthetische Funk-Demos** (eSpeak und analoger Bandpass/Rauschen), damit Story und Audio technisch bereits vollständig funktionieren. Für das finale Erlebnis sollen sie durch glaubwürdig eingesprochene, professionell bearbeitete Aufnahmen mit gleichem Namen ersetzt werden.
- Ist das automatische Abspielen durch Browser-Autoplay-Regeln blockiert, wird der Archivbutton zur klar sichtbaren manuellen Startaktion. Keine Falschanzeige einer laufenden Wiedergabe.
- Pause und unsichtbare Browser-Tabs halten die Aufnahme an. Die gemeinsame Lautstärkeregelung wirkt auf Aufnahmen, Effekte und Atmosphäre.

### Erzähl- und Rätselkonzept: vermeintliche Rettungspeilung

Diese folgenden Schritte sind **geplant, nicht implementiert**. Sie geben jeder späteren Spieleraktion einen plausiblen technischen Grund, bevor die Dimensionstor-Auflösung erfolgt.

1. **Drei Relaisbojen auffinden:** Nach AUDIO 001 tauchen nach und nach drei unterschiedliche Peilsignale auf CAM 02 auf; ihre Kennungen müssen über Kamera- und Funkhinweise entschlüsselt werden. Die Nachtwache stellt sie als ausgefallene Küstenpeilung dar. Die drei Punkte bilden in Wahrheit die Ecken des späteren Meer-Dreiecks.
2. **Rücklauf/Phasenabgleich:** Die drei empfangenen Signale müssen anhand unterschiedlicher Hinweise aufeinander synchronisiert werden (kein bloßes dreimaliges Frequenzraten). Die Nachtwache behauptet, nur so könne die Küstenwache ein Ortungssignal erhalten. Tatsächlich stabilisiert der Spieler die räumliche Resonanz zwischen den Ecken.
3. **Rückkanal freigeben:** Erst nach bestätigter Peilung und Synchronisation erscheint die Aufforderung, einen einmaligen **Ortungsimpuls** über den Stationssender zu schicken. Der angebliche Rettungsruf schließt den Stromkreis des dreieckigen Resonanzsystems; das Dimensionstor öffnet sich als Bermuda-Dreieck-Erscheinung im Meer.

**Dramaturgie:** Jede Bedingung verdient eine eigene beobachtbare Veränderung auf CAM 01/02 und optional eine zunehmende Täuschung in den Funkaufzeichnungen. Es gibt keinen vorzeitigen Tor-Trigger und keine sofortige Erklärung der Wesen.


## Patch 35 – Unknown Warning / Decision Point

- Nach PHASE 05 muss der Spieler das zweite Mastsignal auf CAM 01 selbst untersuchen. Die Station schaltet darauf die weibliche Warnaufnahme AUDIO / 003 frei.
- Die Aufnahme ist auf Deutsch verfügbar, wird automatisch empfangen und anschließend archiviert. Wie bei den übrigen Aufnahmen gelten die bestehenden Pause-, Sichtbarkeits- und Autoplay-Schutzmaßnahmen.
- Nach der erstmaligen Wiedergabe öffnet sich der native Entscheidungsdialog. Bei Autoplay-Sperren ist die Entscheidung über das Archiv erreichbar.
- Zwei vorläufige Wege: **Alex folgen / Rettung vorbereiten** oder **Warnung folgen / Sender isolieren**. Es wird dabei noch kein Signal gesendet. Der finale Rückkanal bleibt PHASE 06 vorbehalten.
- Der gewählte Weg wird im Story-State geführt und über `deadair:routechosen` veröffentlicht. Die Entscheidung darf vor dem finalen Senden noch geändert werden; ein alternatives Ende ist noch nicht festgelegt.
- Die Mast-Lichtreaktion bleibt erhalten: Nach dem Fund verstummt das Morsezeichen; der Leuchtturmstrahl bleibt aus.


## Patch 36 – Versteckte Warnfrequenz und irreversible Entscheidung

- Nach erfolgreicher Synchronisation morst der Mast **1024** statt „NO“: 102.4 MHz.
- Die beschädigte weibliche Aufnahme (AUDIO / 003) ist ausschließlich auf **CAM 01 bei 102.4 MHz** und erst nach der Synchronisation empfangbar.
- Keine Mast-Hotspot-Aktion, kein archivierter Wiederabspielbutton, kein jederzeit öffnender Entscheidungsbutton. Bei erneutem Abstimmen auf 102.4 MHz (CAM 01) spielt die Übertragung erneut.
- Das Umschalten der Kamera oder der Frequenz beendet den Warnmitschnitt. Bei blockiertem Browser-Autoplay erscheint nur am aktiven Träger ein manueller Startknopf.
- Der Dialog **„WAS SOLL ICH TUN?“** erscheint nur nach dem `ended`-Ereignis der vollständig gehörten Übertragung, nie allein durch deren Entdeckung.
- Genau eine unwiderrufliche Entscheidung pro Sitzung; kein erneut aufrufbarer Entscheidungsdialog und keine Möglichkeit zum Abbrechen via Escape.
- Wer die Warnfrequenz nicht findet, kann später nur dem voreingestellten Weg zum schlechten Finale folgen; der alternative Weg wird ausschließlich durch vollständig gehörtes Signal + Entscheidung freigeschaltet.
- Die Verzweigung zum tatsächlichen Finale ist weiterhin Phase 06 und nicht Bestandteil dieses Patches. Ein Neuladen beginnt eine neue Spielsitzung (wie bisher ohne Persistenz).

- Die fragmentierte Mitschrift ist für barrierearmen Zugriff nur auf der eingestellten Live-Frequenz abrufbar; das allein löst die Entscheidung nicht aus.


## Patch 37 – Phase 06 / The Triangle

- Nach Phase 05 wird der manuelle Rettungsimpuls im linken Steuerpanel freigegeben.
- Die Warnung auf 102.4 MHz bleibt optional. Sobald sie gefunden wird, sperrt sie den
  Rettungsimpuls bis zum vollständig gehörten Audio / 003 und der endgültigen Wahl.
- Ohne Warnfund oder nach „Dem Signal weiter folgen“: Einmaliger Rettungsimpuls startet
  die irreversible schlechte Finalsequenz (CAM 02 → triangulation → freeze → opening).
- CAM 02 wird im Finale erzwungen. Der Wechsel zu CAM 01 führt nur noch zu einem harten
  kurzen Schwarzbild; es werden keine Bildquellen durch Überblenden umgeschaltet.
- Bei Beginn der Dreiecksbildung wird der reale Küstenclip pausiert. Die `gate-visual.js`
  zeichnet nur die prozedurale Öffnung über diesem eingefrorenen Frame.
- Blutorange Lichtstimmung, starke, aber kontrollierte Signalstörungen und
  Anomalie-Indikator mit Übersteuerung sind nur während dieses Finales aktiv.
- Bei vollständigem Warnempfang und Wahl „Rückkanal isolieren“: irreversible
  alternative Finalsequenz ohne Portalfreigabe; die Relais verlöschen, der Feed fällt aus.
- Pause, Tab-Sichtbarkeit und `prefers-reduced-motion` steuern die eigentliche
  Finalanimation; keine eigenen Hintergrundtimer pro Canvas-Effekt.
- Der Zustand wird wie bisher nur in der aktuellen Spielsitzung gehalten;
  eine Neuladung beginnt absichtlich eine neue Sitzung.

## Patch 38 – Receiver Layout & Living Gate

- Der große DEAD//AIR-Titel wurde aus der sichtbaren linken Steuerspalte entfernt; die semantische H1 bleibt für Suchmaschinen und Screenreader erhalten. Das Logo im Masthead bleibt unverändert.
- Die Statuszeile des Receivers reserviert dauerhaft 30 px Höhe, damit `VERBINDEN` bzw. die Live-Audio-Aktionen das Panel nicht kurzzeitig vergrößern. Der Verbindungsbutton hält mindestens 10 px Abstand zum Statuspunkt.
- Archiv- und Rückkanalbereich wurden kompakter gestaltet. Bei eingeblendetem Rettungsimpuls werden zusätzliche, rein dekorative Abstände reduziert, damit sämtliche linken Bedienelemente auch bei kleineren Desktop-Viewports innerhalb von `100dvh` bleiben. Das mobile Receiver-Overlay behält seinen eigenen Scrollbereich.
- Im schlechten Finale wird das Video nicht mehr hart bei der Dreiecksbildung angehalten. Seine tatsächliche `playbackRate` sinkt während der ersten 2,2 Sekunden anhand eines sanften Ease-Verlaufs von 1 auf mindestens 0,08; erst beim Abschluss der Abbremsung erfolgt `pause()`.
- Die vorhandene Portalform wird durch ungleichmäßige Wachstumsimpulse, unterschiedlich pulsierende Relaispunkte, leicht gekrümmte Peillinien, elektrische Randentladungen, eigene Levitations-/Neigungs-/Rotationsbewegungen und einen vom Portal getrennten Schatten auf der Meeresoberfläche ergänzt.
- Die Bewegung bleibt in der bestehenden Final-Renderloop auf maximal 30 fps, ist pausierbar und berücksichtigt `prefers-reduced-motion`.
- Sonstige Story-Trigger, Morse-Frequenzen, Tonaufnahmen, Kamerasperren und Endbedingungen bleiben unverändert.


## Patch 40 – Relay Echo Ping

- Der bisher automatisch eingeblendete VERBINDEN-Button verrät die Relaisfrequenz nicht mehr beim Schieben des Reglers.
- Aktives `SENDEN` unterhalb des Frequenzreglers; die Antwortzeit zeigt die Nähe zum noch nicht verbundenen Relais an.
- Erst ein erfolgreicher Ping auf der präzisen Trägerfrequenz verwandelt die Aktion in `VERBINDEN / A|B|C`.
- Die passiven Kanalnamen/Signalbalken verraten noch nicht verbundene Relais vorher nicht mehr.
- Laufende Pings werden beim Abstimmen, Kameratausch, Pausieren oder Tabwechsel abgebrochen; keine veralteten Treffer.
- Die obere Taste `EMPFANG` war die mobile Öffnung der Steuerung. Sie heißt jetzt `STEUERUNG` bzw. `CONTROLS`; auf dem Desktop bleibt sie unsichtbar.


## Patch 41 – Lighthouse Prelude & Unseen Watchers

- Nach dem Sendeimpuls bleibt CAM 01 für 2,5 Sekunden sichtbar. Nach 0,65 Sekunden erlöschen die Lichtquellen, ein kurzer harter Signalabbruch kaschiert den Wechsel auf das leuchtturmfreie Stationsbild; CAM 02 übernimmt erst nach dem Schlussbild.
- Neues Fotostandbild `assets/scene-poster-no-lighthouse.webp`, deckungsgleich mit der ursprünglichen Station (lokale Bildretusche; keine CSS-Maske und kein Kanal-Crossfade).
- In der vollständig geöffneten Portalöffnung werden drei unscharfe Schattenkonturen mit seltenen, asynchronen Augenreflexen sichtbar. Keine neue Rastergrafik, ausschließlich Canvas.
- Die Sequenz hängt an der aktiven Story-Uhr. Pause und inaktive Browser-Tabs unterbrechen sie ohne Zeitverlust; das alternative isolierte Ende bleibt unverändert.


## Patch 42 – The Storm Inside

- Die Schattenwesen im Portal bestehen aus asymmetrischen, vollständig schwarzen Konturen statt ovalen Köpfen mit eigener Aura. Seltene, schmale Lichtreflexe ersetzen die runden, leuchtenden Augen.
- Zwei einmalig generierte und wiederverwendete Wolkentexturen erzeugen langsame, unterschiedlich driftende Sturm- und Nebelschichten im geöffneten Dreieck; sie bleiben auf die Öffnung begrenzt.
- Seltene interne elektrische Entladungen beleuchten die Gewittermasse hinter den Silhouetten.
- Torbewegung, Schlagschatten, Küstenvideo, Audio- und Story-Zustände bleiben unverändert. `prefers-reduced-motion` reduziert Bewegungen und unterdrückt interne Blitze.


## Patch 43 – Original Soundscape

- 14 eigenständig mit Python/NumPy/SciPy generierte MP3-Effekte in `assets/sfx-*.mp3`, keine externen Lizenzen oder Soundbibliotheken.
- Das Modul `scripts/soundscape.js` bündelt AudioContext, Puffer-Cache, FM-Rauschbett, kurze Effekte und Mix-Steuerung.
- Relais-Pings senden einen Ton beim Tastendruck. Das Echo kommt **erst** nach der in `sendRelayPing()` berechneten Laufzeit; bei Nichterreichbarkeit erklingt ein kurzes Squelch.
- Die bestehende Sprachaufnahme hat Vorrang: das analoge Rauschen wird bei aktiver Stimme automatisch abgesenkt.
- Tuning, Auto-Suchlauf, Relaisverbindung, Synchronisation, Kamerasignalfehler, Anomalie und Finalsequenz erhalten passende Geräusche.
- Ein kompakter, tastaturbedienbarer Ton-Schalter neben Pause schaltet Soundeffekte **und** HTML-Sprachnachrichten gemeinsam stumm (DE).
- `PAUSE` und inaktive Tabs unterbrechen die Audiowiedergabe; der Audiokontext wird erst nach einer echten Nutzereingabe freigeschaltet.
- Das originale Story-Timing, Relaisrätsel, Videos und die vorhandenen Sprachdateien bleiben unverändert.


## Patch 44 – Dimensional Storm & Dev Events

- Portal: größerer, von innen leuchtender orange-schwarzer Wolkenhintergrund, langsam ziehende Gewitterzellen und vorgelagerter Dunst. Die Silhouetten werden nur vom Wetter hinter ihnen erkennbar, ohne Glow.
- Über die Finalzustände `lock`, `triangulation`, `opening` und `open` beeinflusst blutoranges Streulicht subtil die gesamte Oberfläche. Die UI bleibt bedienbar; reduzierte Bewegung wird berücksichtigt.
- Entwicklerkonsole per URL `?debug=1` aktivieren. Sie enthält `TOR / START`, `TOR / OFFEN` und `ISOLATION`. Die Optionen umgehen bewusst die Rätsel und sind im normalen Spielerlebnis ausgeblendet.
- `TOR / START` spielt die gesamte Sequenz ab, `TOR / OFFEN` springt direkt ins geöffnete Tor. Für einen anderen Ausgang die Seite neu laden.
- Keine zusätzlichen Assets oder Laufzeit-Abhängigkeiten.


## Patch 45 – Shadow Presence Refinement

- Der Hintergrund des Dimensionstors bleibt überwiegend rußschwarz; orangefarbene Glut tritt nur noch in einzelnen Wolkenfalten und bei Entladungen hervor.
- Drei unterschiedlich entfernte Wesen sind deutlich schlanker, höher und asymmetrischer. Ihre unteren Konturen verschwinden in der Dunkelheit.
- Kleine, zeitversetzt aufleuchtende Augenschlitze sitzen in den Figuren, ohne Glow oder Aura.
- Die doppelt aufgetragene Sturmtextur wird nicht mehr über interne Blitze und die Tiefenstaffelung gezeichnet.
- Keine Änderungen an Story, UI, Audio oder der Bewegung und Schattenprojektion des Tores.


## Patch 46 – Illustrierte Schatten im Portalkern

- Die erste Illustration mit frei schwebenden, an Nabelschnüren hängenden Figuren ist als lokales WebP-Asset `assets/portal-hanging-shadows.webp` in den Torhintergrund integriert.
- Die bisherigen prozeduralen Figuren und ihre Augen wurden entfernt.
- Die vorhandenen Canvas-Gewitter- und Nebelschichten ziehen vor dem Bild vorbei; Dreiecksform, Schweben, Schatten, Lichtbögen und Story bleiben erhalten.
- Der Bildausschnitt wird proportional skaliert und bleibt auf den unregelmäßigen Portalriss begrenzt.


## Patch 47 – Fester Portalhintergrund und dichtere Wolken

- Die Illustration wird in einem weltfesten Ausschnitt mit konstanter Position und Größe gezeichnet. Das wachsende Tor fungiert nur als animierte Maske; die Figuren werden nicht mehr herangezoomt.
- Zwei zusätzliche, einmalig generierte dunkle Wolkenmasken ziehen deutlich sichtbar gegenläufig vor dem Motiv. Sie verdecken große Teile des Bildes und geben einzelne Bereiche nur zeitweise frei.
- Der bestehende Nebel und die internen Blitze bleiben erhalten; Torform, Schwebebewegung, Schatten, Sound und Story wurden nicht geändert.
- Beide Wolkentexturen sind mit reduzierter Auflösung gecacht. `prefers-reduced-motion` hält ihre Bewegung an.


## Patch 48 – Distant Portal Artwork

- Das bestehende Asset `assets/portal-hanging-shadows.webp` ist durch die freigegebene neue Illustration ersetzt.
- Die Nabelschnüre setzen an den Bäuchen an, die hängenden Körper sind entsprechend nach hinten durchgebogen.
- Das Motiv ist innerhalb des Assets auf 80 % verkleinert und mit einer weichen atmosphärischen Randzone versehen, damit es räumlich weiter entfernt wirkt.
- Das Canvas und die dichten bewegten Wolken aus Patch 47 bleiben unverändert, ebenso das feste Bildframing während des Öffnens.


## Patch 49 – Portal Motion, Soft Light & Sea Timing

- Die Hintergrundillustration schaukelt unabhängig und sehr leicht im bestehenden Bildraum, ohne beim Öffnen zu wachsen. Die dichten Wolkenschichten und das freigegebene Motiv bleiben erhalten.
- Das Tor neigt sich etwas stärker und schwebt mit sanft vergrößerter Amplitude. Sein diffuser Schatten folgt weiterhin derselben Geometrie und ist deutlicher sichtbar.
- Lichtkanten und Entladungen sind transparenter; ein weicher, an die Bildschirmgröße angepasster Saum ersetzt die starke Kontur. Die Peillinien treten beim Öffnen zurück.
- Das Küstenvideo bremst über sechs statt 2,2 Sekunden ab und pausiert erst zum Beginn der eigentlichen Öffnung, nicht schon beim Aufbau der Dreiecksseiten.
- Video-Farbfilter, Szenentönung und UI-Streulicht steigen kontinuierlich anhand der aktiven Finaluhr an. Sprunghafte Phasenfilter und der abrupte orangefarbene Vignettenwechsel entfallen.
- Ein langsam wachsender Reflex an den inneren Glaskanten und ein äußerer Schein auf der Bildschirmfassung binden das geöffnete Tor in den Monitor ein.
- Bestehende Pause-/Tab-Steuerung und Reduced Motion bleiben berücksichtigt; keine zusätzlichen Assets oder Abhängigkeiten.


## Patch 50 – Distant Presence & Delayed Cloud Reveal

- Das freigegebene Motiv wird in einer einmalig gecachten Canvas-Textur um weitere 14 % verkleinert und weich in dunkle Randtiefe eingebettet. Der Maßstab bleibt während der Öffnung konstant; das leichte Schaukeln bleibt erhalten.
- Während des gesamten Torwachstums verdeckt eine dichte, bewegte Sturmdecke die Illustration. Die Wolkenschichten sind schon beim ersten sichtbaren Riss aktiv.
- Erst 0,8 Sekunden nach der vollständigen Öffnung beginnt die Sturmdecke, sich über zehn Sekunden weich zu lichten. Bewegte Wolkenreste bleiben vor dem enthüllten Motiv erhalten.
- Die Enthüllung folgt der vorhandenen aktiven Finaluhr; Pause und Hintergrund-Tabs halten sie an. Bei reduzierter Bewegung lichten sich die ruhenden Wolken ebenfalls zeitgesteuert.
- Torbewegung, Lichtkanten, Schatten, Videotiming, Audio und Story aus Patch 49 bleiben erhalten. Keine neuen Assets oder Abhängigkeiten.


## Patch 51 – Organic Returning Clouds

- Die erste Enthüllung bleibt ein kurzes Sichtfenster: Auch an der lichtesten Stelle bleibt eine dünne Wolkendecke vor dem Motiv.
- Nach etwa 1,5 Sekunden ziehen über sieben Sekunden erneut dichte Wolken auf. Zwei langsame, unterschiedlich schnelle Wetterwellen variieren anschließend die Dichte fortlaufend; die bestehenden gegenläufigen Wolkenbewegungen bleiben erhalten.
- Die Gestalten werden dadurch wiederholt verdeckt und sichtbar, statt dauerhaft freizustehen. Die reduzierte Bewegungsdarstellung hält nach der ersten Enthüllung eine ruhige Restbewölkung.
- Keine Änderungen an Portalgeometrie, Hintergrundmaßstab, Licht, Schatten, Story oder Audio.


## Patch 52 – Always Visible Mobile Monitor & Radio

- Auf schmalen Bildschirmen und bei sehr geringer Viewporthöhe stehen Monitor und Radio dauerhaft untereinander, der Monitor zuerst. Die HTML-Reihenfolge entspricht dem mobilen Lesefluss; benannte Grid-Bereiche erhalten die Desktopanordnung mit Radio links und Monitor rechts.
- Der Bildschirm nutzt die verfügbare Breite ohne die frühere Höhenbegrenzung. Die Seite wächst mit Archiv, Relais und Rückkanal und scrollt über den normalen Dokumentfluss.
- Steuerungs- und Schließen-Button sowie die zugehörige Overlay-, Inert- und Fokusfallenlogik sind entfernt. Native Dialoge für Hinweise und Rätsel bleiben erhalten.
- Kamera-, Pause- und Tonbedienung erhalten im kompakten Layout mindestens 44 px hohe Berührungsflächen.
- Portal, Wolken, Story- und Audiologik bleiben unverändert.


## Patch 54 – Compact Startup Briefing

- Bei gestapeltem Layout (`max-width: 750px` oder `max-height: 520px`) erscheint die Einleitung direkt beim Seitenstart in einem nativen Dialog. Die Desktop-Einleitung bleibt erhalten.
- Der Dialog nutzt bestehende Gestaltung und Übersetzungen, bietet einen Startbutton sowie Escape und erscheint einmal pro Seitenaufruf, ohne Wiederöffnung beim Drehen oder Vergrößern.
- Die Story-Uhr wartet bis zum Schließen, damit während des Lesens kein Spielereignis vorgezogen wird. Kein zusätzlicher Speicher oder Abhängigkeiten.


## Patch 55 – Radio Investigation & Local Camera Ending

### Ermittlungsbogen

- Ein schmaler, zunächst verfügbarer Fremdträger auf **90.2 MHz** spielt einmalig etwa sechs Sekunden Atem-, Stöhn- und Klickgeräusche. Nach dem Abriss oder vorzeitigem Verlassen ist er für diese Sitzung dauerhaft verstummt. Der manuelle Regler bleibt erreichbar; der automatische Suchlauf überspringt den verlorenen Träger.
- Das Klickmotiv liegt jetzt leise unter den unveränderten gesprochenen Inhalten von AUDIO 001 (DE). Das erste verbundene Relais gibt es ebenfalls zurück.
- Die Flaschenpost verweist auf das absichtliche Mastblinken. Eine am Empfänger verfügbare NCBS-Wartungskarte zeigt die zehn Morseziffern. Licht und 720-Hz-Ton folgen derselben Impulsliste und aktiven Spieluhr; die früheren unabhängigen CSS-Morsekeyframes entfallen.
- NOTIZEN sichert nur bereits entdeckte Beobachtungen. Die beiden gespeicherten Klickspuren lassen sich akustisch und als Rhythmusnotation vergleichen; die Verbindung muss der Spieler selbst bestätigen. Die verlorene Stimme selbst wird nicht archiviert oder wiederholt.
- Nach der ersten Relaisverbindung kehrt das Klickmotiv zurück. Nach der zweiten wartet eine sechssekündige Fensterreaktion auf den nächsten CAM-01-Aufruf. Nach der dritten reagiert Alex unmittelbar, obwohl der lokale Rückkanal noch keine Bestätigung gesendet hat. Die Reihenfolge A/B/C bleibt frei.

### Signalabgleich

- Der SYNC-Dialog zeigt aufgezeichnete Dreierkennungen und ähnlich aussehende Störgruppen. Die gespeicherten Kennungen lassen sich im Relaisprotokoll und direkt beim Abgleich erneut hören und visuell lesen.
- A bleibt die Referenz. Der Beginn der echten Gruppe von B und C muss mit dem Beginn von A übereinstimmen. **Lösung für Entwickler: B −64 ms, C +46 ms, Toleranz jeweils ±3 ms.** Regler auf Null oder Überlagerung einer Störgruppe reicht nicht.
- Die Oberflächentexte und die zugängliche Beschreibung erklären die Aufgabe und nennen die gespeicherten Pulsabstände, ohne die Zielversätze vorzugeben.
- Morse und Signalberechnungen liegen in `scripts/signal-patterns.js`; Hinweise und Ermittlungswerkzeuge in `scripts/investigation.js`. Fortschritt, Kamera- und Endbedingungen bleiben im vorhandenen `app.js`.

### Beide Entscheidungen führen zu einer Bedrohung

- Der manuelle Rettungsimpuls führt weiterhin zum freigegebenen Tor-Finale mit unveränderter Portalgeometrie, Bewegung, Licht und organischen Wolken.
- Nach Entdeckung der Warnung verschwindet der Rettungsimpuls jetzt auch sichtbar bis zur verbindlichen Entscheidung. Die bestehende technische Sperre bleibt bestehen.
- Isolation schaltet beide bekannten Kameras offline. Nach den 6.8 Sekunden Abschaltung folgen 2.7 Sekunden Stille; dann meldet sich **CAM 03 / LOCAL**.
- Der neue Eingang muss manuell ausgewählt werden. Er zeigt einen leeren Stationshof mit einer erwachsenen Frau auf einer langsam schaukelnden Schaukel. Nach 4.2 Sekunden aktiver Betrachtung lacht sie; im Klang kehrt das Klickmotiv zurück. Die Warnstimme wird dadurch als mögliche zweite Falle lesbar, ohne ihre Identität ausdrücklich zu erklären.
- Hintergrund und Frau/Schaukel sind getrennte, lokal eingebundene WebP-Ebenen. Die Bewegung ist eine ruhige CSS-Perspektivbewegung, kein Video. Bei Reduced Motion ruht die Schaukel; die zeitliche Enthüllung bleibt erhalten.

### Zeit, Ton und Bedienung

- Fenster bis 680 px Höhe sowie schmale Desktopfenster bis 1050 px Breite und 750 px Höhe verwenden ebenfalls den gestapelten Aufbau inklusive Starteinleitung, damit Notizen und Rückkanal erreichbar bleiben. CSS und Startdialog verwenden dieselbe Abfrage.
- Die vorhandene Hauptuhr pausiert bei geöffneten nativen Dialogen, Spielpause und verborgenem Tab. Ein laufender Fremdträger wird beim Lesen angehalten und ab seiner aktiven Position fortgesetzt; Stummschaltung lässt den Spielablauf weiterlaufen.
- Die Pulsanzeige benötigt maximal etwa 30 Aktualisierungen pro Sekunde. Hörbare Morseimpulse entstehen aus einem einzelnen Oszillator. Neue nichtsprachliche Geräusche sind lokal synthetisiert; die gesprochenen Alex-Aufnahmen behalten ihren Text.
- Die Bilder für CAM 03 werden erst beim Start der Isolation geladen. Es gibt keine zusätzlichen Bibliotheken oder externen Laufzeitdienste; sämtliche Bild- und Audiodateien bleiben lokal eingebunden.
- Die Soundbeschreibungen stehen unterhalb des Monitors und verdecken das Bild nicht. Hinweise, Kennungen und Dialoge sind deutsch/englisch vorbereitet und per Tastatur bedienbar.
- Der Debug-Zugang `?debug=1` bietet zusätzlich **SPUREN / SYNC** als Einstieg in das neue Abgleichrätsel. Der reguläre Ablauf erhält dadurch keine Abkürzung.
- Ziel sind ungefähr 8–10 Minuten beobachtendes Spielen, ohne künstliche Wartezeit. Diese Spielzeit ist ein gestalterisches Ziel und noch durch einen unvorbereiteten menschlichen Durchlauf zu bewerten.

### Bild- und Tonherkunft

- CAM-03-Motiv mit dem integrierten Bildgenerator erstellt: „Photorealistic fixed 1993 coastal-station CCTV view of a damp foggy courtyard at night. Centered adult woman, about 35, smiling on an old swing, full body, faded light dress and cardigan, muted grey-green palette, natural grit; no UI, text, timestamps, gore or glowing eyes.“
- Zwei gezielte Folge-Edits: gleicher Hof ohne Frau, Sitz und Ketten; transparente Extraktion derselben Frau samt Sitz und Ketten mit gleichem Bildausschnitt. Enddateien: `assets/local-courtyard.webp`, `assets/local-swing.webp`.
- Neue lokale Audiodateien: `sfx-stranger.mp3`, `sfx-source-clicks.mp3`, `sfx-signature-a.mp3`, `sfx-signature-b.mp3`, `sfx-signature-c.mp3`, `sfx-swing-creak.mp3`, `sfx-local-laugh.mp3`. Nichtsprachliche Stimme und Lachen sind synthetische Formantklänge; Feintuning nach Hörtest ist möglich.

### Validierung dieses Patches

- Vollständiger Browserdurchlauf: einmaliger Fremdträger, Flaschenpost, beide Morseziele, Relais in abweichender Reihenfolge, Fensterreaktion, echter Signalabgleich, manueller Spurenvergleich, Warnsperre und Isolation bis zur lachenden Frau.
- Beide Torwege separat geprüft: ohne Warnfund und nach ausdrücklicher Entscheidung für das Signal. In beiden Fällen bleibt der manuelle Rettungsimpuls erforderlich.
- Dialoge und Layout bei 320/390/750 px sowie Querformat; zusätzliche kleine Desktopfenster und Reduced Motion geprüft. Kein horizontaler Seitenüberlauf; Rückkanal bleibt erreichbar.
- Reine Berechnungen für Morse-Pulsgrenzen, Pausen und Wiederholung sowie richtige/falsche Kennungsabgleiche geprüft. JavaScript-/CSS-Syntax, lokale Imports, Assetpfade und CRLF geprüft.
- Eine unvorbereitete menschliche Spielrunde zur tatsächlichen Spielzeit und ein subjektiver Hörtest im Zielgerät stehen noch aus.


## Patch 56 – Beyond the Receiver / Ronnie

- Der Geräteaufkleber nennt den Ermittler nun beiläufig **RONNIE / FIELD INVESTIGATION**. Nach dem Signalabgleich erscheint auf dem Empfänger ein Textträger: „Danke, Ronnie.“ Die Beobachtung wird im Protokoll gesichert. Die bestehenden gesprochenen Alex-Aufnahmen werden nicht verändert; eine neue gesprochene Namenszeile ist in diesem Patch nicht enthalten.
- Eine gemeinsame, einmalige Lichtblende löst nach beiden bisherigen Enden die Geräteansicht ab. Dichte dunkle Wolken und warmes oranges Gegenlicht übernehmen den gesamten Browser-Viewport. Ein nativer Dialog hält Fokus und Eingaben in der Schlusssequenz.
- **Torweg:** 38 Sekunden nach dem Rettungsimpuls, nach Öffnung und erster Wolkenenthüllung, beginnt der Übergang. Das vorhandene Dimensionsmotiv wird ohne Monitorfassung sichtbar. Maus oder Touch-Ziehen verschieben den Blick; W/↑, S/↓, Mausrad und ein Touchbutton steuern eine begrenzte Vorwärts-/Rückwärtsbewegung durch Tiefenebenen. Das ist eine atmosphärische 2.5D-Szene, keine frei begehbare 3D-Welt.
- Am Ende des Weges ertönt das bekannte Klicken nah auf der linken Stereoseite, bevor das Bild schwarz wird und der Status erscheint. Ohne Bewegung schließt dieselbe Sequenz nach etwa 42 Sekunden Erkundungszeit ab. „Zum Status“ und Escape erlauben ein direktes Überspringen.
- **Schaukelweg:** Das CAM-03-Bild und das Lachen aus Patch 55 bleiben zunächst erhalten. Zehn Sekunden nach dem Öffnen von CAM 03 startet dieselbe Lichtblende. Danach zeigt der bildschirmfüllende Stationshof zuerst eine leere Schaukel. Beim erneuten Verdichten des Nebels wird sie unbemerkt durch Ronnie mit unkenntlichem Gesicht ersetzt. Die beiden Ebenen teilen dieselbe Schwingbewegung; der Nebel gibt Ronnie anschließend frei. Nach 19 Sekunden Schlusssequenz erscheint der Status.
- Der Endscreen zeigt **NCBS / VERBINDUNG BEENDET**, **Ermittler: RONNIE**, **Status: NICHT ERREICHBAR** sowie „Erneut empfangen“ und „Zurück zum Archiv“. Die gewählte Schlusskulisse bleibt dahinter schwach bewegt sichtbar.
- `scripts/ending.js` kapselt den Viewport-Übergang, die Erkundung, Wolkentexturen und Schlusssteuerung. Ereigniszeiten kommen weiterhin aus der vorhandenen Hauptuhr; Pause und Hintergrund-Tabs halten die Sequenz an. Der Schlussdialog ist gezielt von der normalen Dialogpause ausgenommen, damit seine eigene Handlung läuft.
- Bilddateien werden beim Start des jeweiligen bisherigen Finales vorab geladen. Wolken werden einmal in eine Textur gezeichnet und danach gecacht verschoben. Canvas-Auflösung ist auf DPR 1.5 und die reguläre Darstellung auf ungefähr 30 fps begrenzt. Reduced Motion reduziert die Überbelichtung und hält die automatische Schaukelbewegung ruhig.
- Deutsch/Englisch, Pause, Stummschaltung, Tastaturbedienung, Touch, kleine Viewports und Querformat sind berücksichtigt. Browser-Zoom über Strg+Mausrad wird nicht abgefangen. Es gibt keine neuen Laufzeitabhängigkeiten oder externen Dienste.
- Zwei zusätzliche Debugtasten (`?debug=1`): **ENDE / DIMENSION** und **ENDE / RONNIE**. Reguläre Spielwege bleiben an ihre vorhandenen Voraussetzungen gebunden.

### Neue Bilddateien

Mit dem integrierten Bildgenerator aus der vorhandenen transparenten Schaukel-Figur abgeleitet und als WebP eingebunden:

- `assets/ending-empty-swing.webp`: Frau vollständig entfernt; leerer Sitz und Ketten bleiben am ursprünglichen Platz, transparenter Hintergrund.
- `assets/ending-ronnie.webp`: gleiche Pose und Ketten, erwachsener Ermittler in olivfarbener Feldjacke mit kleinem orangefarbenem Namensstreifen RONNIE, dunkler Hose und Stiefeln; Gesicht als glatte fotografische Verzerrung ohne erkennbare Merkmale. Keine Verletzungen, kein Gore, keine leuchtenden Augen. Transparenter Hintergrund und gleicher Bildausschnitt.

Der bestehende Hof und das freigegebene Portalbild werden wiederverwendet. `gate-visual.js` und `portal-hanging-shadows.webp` bleiben bytegleich zu Patch 55.

### Validierung Patch 56

- Die vorhandene Portalenthüllung läuft vor dem automatischen Übergang vollständig an; der Schlussdialog startet erst nach der festgelegten Wartezeit.
- Isolation, manuelle CAM-03-Auswahl und erstes Lachen laufen vor dem Übergang zum leeren beziehungsweise besetzten Schaukelbild.
- Browserprüfungen: Umsehen, Weitergehen bis zur Schwarzblende, Pause/Fortsetzen, Deutsch/Englisch, gedämpfte Blende bei Reduced Motion, Escape/Zum Status und Neustart in eine saubere Sitzung.
- Statusdialog bei 320 × 740, 390 × 844 und 844 × 390 geprüft. Keine horizontale Seitenüberbreite; im flachen Querformat kann der Statusinhalt innerhalb seiner Karte gescrollt werden.
- JavaScript-/CSS-Syntax, lokale Imports und Bildpfade sowie CRLF geprüft. Keine Änderung am freigegebenen Portal-Renderer oder Portalbild.


## Patch 57 – Visible Morse & Unread Investigation Notes

- Eine spezifischere, ältere CSS-Regel zwang das Mastlicht nach erfolgreichem SYNC dauerhaft auf volle Deckkraft. Diese konkurrierende Zustandsregel entfällt; Licht und Ton folgen wieder gemeinsam der vorhandenen Morseuhr für 1024.
- Neue Notizen erhalten einen klaren, persistenten NEU-Zähler am Notizbutton. Ein sechs Sekunden sichtbarer, klickbarer Empfangshinweis meldet die ungelesene Anzahl auch dann, wenn das Radio außerhalb des sichtbaren Bereichs steht.
- Während eines geöffneten Dialogs wird der kurze Hinweis zurückgehalten und erst danach angezeigt. Sein Ablauf bestätigt keine Einträge; nur das bewusste Öffnen des Protokolls setzt den Ungelesen-Zähler zurück.
- Beim Öffnen sind die neuen Einträge markiert; der erste wird direkt in den sichtbaren Dialogbereich geholt. Bereits geöffnete Notizen markieren neu hinzukommende Einträge sofort, ohne sie zusätzlich als ungelesen zu zählen.
- Deutsch/Englisch, Screenreader-Ankündigung, Tastaturbedienung und Reduced Motion berücksichtigt. Kein zusätzlicher Sound und keine Änderung an Story, Frequenzen oder Enden.

### Validierung Patch 57

- Fehler vor der Korrektur im Browser reproduziert: Morsezustand „off“, aber berechnete Deckkraft weiterhin 1. Danach zeigen beide Codes tatsächlich Deckkraft 1 beziehungsweise 0.045, passend zum Audio-Gate. Pause und Wiederaufnahme sowie das Ende des Codes nach Empfang der Warnung geprüft.
- Hinweisablauf nach sechs Sekunden, persistenter Ungelesen-Zähler, wiederholte bereits bekannte Hinweise, Zurückhalten während SYNC, Klick auf den Hinweis, Markierung beim Öffnen und neue Einträge im bereits geöffneten Protokoll geprüft.
- Deutsch/Englisch und zugängliche Zählerbeschriftung sowie 320/390/1280 px Breite und Reduced Motion geprüft. JavaScript-/CSS-Syntax und CRLF geprüft.

## Audio und Sprache – aktueller Stand

DEAD//AIR verwendet ausschließlich deutsche Texte und Funkaufnahmen. Sprachschalter und englische Texttabellen sind entfernt. Der gemeinsame Lautstärkeregler (0–100 %) und die separate Stummschaltung gelten für alle Funkaufnahmen, Effekte und Atmosphären und bleiben beim Wechsel in die Endsequenzen synchron. Stummschalten behält den eingestellten Pegel.
