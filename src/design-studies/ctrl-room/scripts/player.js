/** @file player.js — Gekapselter Bereich der CTRL//ROOM-Studie. */

/**
 * Kapselt gemeinsamen Audiozustand, Audiovisualisierung und die verschiebbaren Player-Ansichten.
 * @param {object} context - Explizite Abhängigkeiten beziehungsweise aktueller Dateneintrag.
 * @returns {object} Ergebnis der beschriebenen Operation.
 */
export function createPlayer({
  select,
  selectAll,
  audio,
  playButtons,
  muteButtons,
  volumeInputs,
  seekInputs,
  message,
  motionPreference,
  dialog,
  player,
  playerDialog,
  playerMinimize,
  playerMaximize,
}) {

  const playerHomeAnchor = document.createComment('Mini-player original position');  // DOM-Marke zur Wiederherstellung der ursprünglichen Player-Position.
  let playerWasMinimized = false;                                                    // Vor dem Vergrößern gespeicherter minimierter Zustand.
  let pendingPlay = false;                                                           // Eine Wiedergabeanforderung wartet noch auf ihren Abschluss.
  let audioContext = null;                                                           // Erst nach Benutzeraktion erstellter Web-Audio-Kontext.
  let analyser = null;                                                               // Gemeinsamer Frequenz- und Time-Domain-Analyser.
  let frequencyData = null;                                                          // Frequenzpuffer des Audio-Analysers.
  let timeData = null;                                                               // Time-Domain-Puffer des Audio-Analysers.
  let animationFrame = 0;                                                            // Kennung des ausstehenden Audioanimations-Frames.
  let lastFrameTime = 0;                                                             // Zeitstempel der letzten tatsächlichen Audioanzeige.

  player.after(playerHomeAnchor);

  /**
   * Hält Statusmeldungen der Player-Ansichten synchron.
   * @param {string} text - Anzuzeigender Status- oder Beschreibungstext.
   * @returns {void} Kein Rückgabewert.
   */
  function setPlayerMessage(text) {
    message.textContent = text;
    select('#expanded-player-message').textContent = text;
  }

  /**
   * Formatiert eine Wiedergabezeit mit erkennbarem Ersatz für fehlende Metadaten.
   * @param {number} seconds - Wiedergabezeit in Sekunden.
   * @returns {string} Ergebnis der beschriebenen Operation.
   */
  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return '--:--';

    const value = Math.max(0, Math.floor(seconds));  // Ganzzahliger Zeitwert beziehungsweise Textinhalt einer Archivzelle.

    return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
  }

  /**
   * Synchronisiert Füllstand und verständlichen ARIA-Wert eines Range-Inputs.
   * @param {HTMLInputElement} input - Zu synchronisierendes Range-Eingabefeld.
   * @param {string} valueText - Verständliche Beschreibung des aktuellen Reglerwerts.
   * @returns {void} Kein Rückgabewert.
   */
  function updateRange(input, valueText) {

    const percentage =
      ((Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min))) * 100;  // Normierter Füllstand des aktuellen Range-Inputs.

    input.style.setProperty('--fill', `${percentage}%`);
    input.setAttribute('aria-valuetext', valueText);
  }

  /**
   * Synchronisiert Lautstärkeregler und deren barrierefreie Wertbeschreibung.
   * @returns {void} Kein Rückgabewert.
   */
  function syncVolumeInputs() {
    volumeInputs.forEach(

      /**
       * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
       * @param {HTMLInputElement} input - Zu synchronisierendes Range-Eingabefeld.
       * @returns {void} Kein Rückgabewert.
       */
      input => {
        input.value = String(Math.round(audio.volume * 100));
        updateRange(input, `${input.value} percent`);
      },
    );
  }

  /**
   * Aktualisiert die freigegebenen Positionsregler bei gültiger Trackdauer.
   * @returns {void} Kein Rückgabewert.
   */
  function syncSeekInputs() {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      seekInputs.forEach(

        /**
         * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
         * @param {HTMLInputElement} input - Zu synchronisierendes Range-Eingabefeld.
         * @returns {void} Kein Rückgabewert.
         */
        input => {
          input.disabled = false;
          input.value = String((audio.currentTime / audio.duration) * 1000);
          updateRange(
            input,
            `${Math.floor(audio.currentTime / 60)} minutes ${Math.floor(audio.currentTime % 60)} seconds of ${formatTime(audio.duration)}`,
          );
        },
      );
    }
  }

  /**
   * Aktualisiert Wiedergabeicons, Beschriftungen und den ausstehenden Startzustand.
   * @param {boolean} playing - Der Track ist weder pausiert noch beendet.
   * @returns {void} Kein Rückgabewert.
   */
  function syncPlaybackButtons(playing) {
    playButtons.forEach(

      /**
       * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
       * @param {HTMLElement} button - Aktuell registrierte oder aktualisierte Schaltfläche.
       * @returns {void} Kein Rückgabewert.
       */
      button => {
        button.disabled = pendingPlay;
        button.setAttribute(
          'aria-label',
          `${playing ? 'Pause' : 'Play'} Midnight in the Lower Sector`,
        );
        select('[data-play-icon]', button).textContent = playing ? 'Ⅱ' : '▶';
      },
    );
  }

  /**
   * Aktualisiert Beschriftung und gedrückten Zustand aller Stummschalter.
   * @returns {void} Kein Rückgabewert.
   */
  function syncMuteButtons() {
    muteButtons.forEach(

      /**
       * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
       * @param {HTMLElement} button - Aktuell registrierte oder aktualisierte Schaltfläche.
       * @returns {void} Kein Rückgabewert.
       */
      button => {
        button.setAttribute('aria-pressed', String(audio.muted));
        button.setAttribute('aria-label', audio.muted ? 'Unmute audio' : 'Mute audio');
      },
    );
  }

  /**
   * Synchronisiert alle Player-Steuerelemente mit demselben Audiozustand.
   * @returns {void} Kein Rückgabewert.
   */
  function syncAudio() {

    const playing = !audio.paused && !audio.ended;    // Der Track ist weder pausiert noch beendet.
    const muted = audio.muted || audio.volume === 0;  // Die Wiedergabe ist stumm oder hat Lautstärke null.

    document.body.classList.toggle('is-playing', playing);
    document.body.classList.toggle('is-muted', muted);
    syncPlaybackButtons(playing);
    syncMuteButtons();
    selectAll('[data-audio-status]').forEach(

      /**
       * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
       * @param {object} label - Anzeige des aktuellen Audiozustands.
       * @returns {void} Kein Rückgabewert.
       */
      label => {
        label.textContent = muted ? 'MUTED' : playing ? 'PLAYING' : 'STANDBY';
      },
    );
    selectAll('[data-current-time]').forEach(

      /**
       * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
       * @param {object} label - Anzeige des aktuellen Audiozustands.
       * @returns {void} Kein Rückgabewert.
       */
      label => {
        label.textContent = formatTime(audio.currentTime);
      },
    );
    selectAll('[data-duration]').forEach(

      /**
       * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
       * @param {object} label - Anzeige des aktuellen Audiozustands.
       * @returns {void} Kein Rückgabewert.
       */
      label => {
        label.textContent = formatTime(audio.duration);
      },
    );
    syncSeekInputs();
    syncVolumeInputs();
  }

  /**
   * Verbindet den gemeinsamen Track erst nach einer Wiedergabeaktion mit dem Web-Audio-Analyser.
   * @returns {void} Kein Rückgabewert.
   */
  function connectAudioAnalysis() {

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;  // Verfügbare Web-Audio-Implementierung des Browsers.

    if (audioContext || !AudioContextClass || location.protocol === 'file:') return;
    try {
      audioContext = new AudioContextClass();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.78;
      frequencyData = new Uint8Array(analyser.frequencyBinCount);
      timeData = new Uint8Array(analyser.fftSize);

      const source = audioContext.createMediaElementSource(audio);  // Mit dem Audioelement verbundene Web-Audio-Quelle.

      source.connect(analyser);
      analyser.connect(audioContext.destination);
    } catch {
      analyser = null;
    }
  }

  /**
   * Startet oder pausiert den gemeinsamen Track mit abgesicherter Fehlerbehandlung.
   * @returns {Promise<void>} Ergebnis der beschriebenen Operation.
   */
  async function togglePlayback() {
    if (pendingPlay) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    pendingPlay = true;
    setPlayerMessage('CONNECTING TO TRANSMISSION…');
    syncAudio();
    try {
      connectAudioAnalysis();

      const resume =
        audioContext?.state === 'suspended' ? audioContext.resume() : Promise.resolve();  // Abschluss des gegebenenfalls fortzusetzenden Audio-Kontexts.

      if (audio.ended) audio.currentTime = 0;
      await Promise.all([resume, audio.play()]);
      setPlayerMessage('TRANSMISSION CONNECTED.');
    } catch {
      audio.pause();
      setPlayerMessage('PLAYBACK UNAVAILABLE. CHECK THE AUDIO FILE AND TRY AGAIN.');
    } finally {
      pendingPlay = false;
      syncAudio();
      startVisualization();
    }
  }

  const equalizer = select('[data-equalizer]');                                      // Container der Equalizer-Balken.

  equalizer.classList.add('is-in-view');

  const bars = Array.from(
    {
      length: 24,
    },

    /**
     * Synchronisiert die Seitendarstellung mit dem aktuellen Seitenzustand.
     * @param {object} _ - Eingabewert „_“.
     * @param {number} index - Index des aktuellen Balkens, Wellenpunkts oder Fokusziels.
     * @returns {unknown} Ergebnis der beschriebenen Operation.
     */
    (_, index) => {

      const bar = document.createElement('i');  // Einzelner Equalizer-Balken.

      bar.style.setProperty(
        '--height',
        `${12 + Math.abs(Math.sin(index * 0.72)) * 53 + Math.abs(Math.cos(index * 0.27)) * 18}%`,
      );
      bar.style.setProperty('--bar-duration', `${1.1 + (index % 7) * 0.13}s`);
      bar.style.setProperty('--bar-delay', `${-index * 0.17}s`);
      equalizer.append(bar);
      return bar;
    },
  );                                                                                 // Die 24 Balken des Equalizers.
  const canvas = select('[data-waveform]');                                          // Canvas der gemeinsamen Wellenformanzeige.
  const canvasContext = canvas.getContext('2d');                                     // 2D-Zeichenkontext der Wellenform.
  let canvasWidth = 280;                                                             // Tatsächliche Zeichenbreite der Wellenform.
  let canvasHeight = 48;                                                             // Tatsächliche Zeichenhöhe der Wellenform.
  let waveVisible = true;                                                            // Die Wellenform befindet sich im sichtbaren Bereich.
  let barsVisible = false;                                                           // Der Equalizer befindet sich im sichtbaren Bereich.

  /**
   * Zeichnet die ruhende Wellenform oder reale Time-Domain-Daten des Tracks.
   * @param {boolean} [realData] - Reale Analysedaten statt illustrativer Vorschau verwenden.
   * @returns {void} Kein Rückgabewert.
   */
  function drawWave(realData = false) {
    if (!canvasContext) return;
    canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
    canvasContext.strokeStyle = audio.muted ? '#8199bb' : '#91caff';
    canvasContext.lineWidth = 1;
    canvasContext.beginPath();

    const points = realData ? timeData.length : 120;  // Anzahl der Wellenform-Abtastpunkte.

    for (let index = 0; index < points; index++) {

      const x = (index / (points - 1)) * canvasWidth;             // Horizontale Pointer- oder Wellenformkoordinate.
      const signal = realData
        ? (timeData[index] - 128) / 128
        : Math.sin(index * 0.82) *
        Math.sin(index * 0.21) *
        Math.exp(-Math.pow((index - 54) / 25, 2)) *
        0.4;                                                    // Reales oder illustratives Amplitudensample der Wellenform.
      const y = canvasHeight / 2 + signal * canvasHeight * 0.42;  // Vertikale Pointer- oder Wellenformkoordinate.

      if (index === 0) canvasContext.moveTo(x, y);
      else canvasContext.lineTo(x, y);
    }
    canvasContext.stroke();
  }

  /**
   * Passt den Wellenformpuffer an die sichtbare Fläche und einen begrenzten DPR an.
   * @returns {void} Kein Rückgabewert.
   */
  function resizeCanvas() {

    const rect = canvas.getBoundingClientRect();              // Aktuelles Rechteck des betrachteten Canvas-, Hero- oder Dialogbereichs.

    canvasWidth = Math.max(1, rect.width);
    canvasHeight = Math.max(1, rect.height);

    const ratio = Math.min(window.devicePixelRatio || 1, 2);  // Auf zwei begrenzter Gerätepixelfaktor des Canvas.

    canvas.width = Math.round(canvasWidth * ratio);
    canvas.height = Math.round(canvasHeight * ratio);
    canvasContext?.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawWave();
  }

  /**
   * Verarbeitet sichtbare Audioanzeigen mit höchstens 30 Aktualisierungen pro Sekunde.
   * @param {number} timestamp - Zeitstempel des aktuellen Animationsframes.
   * @returns {void} Kein Rückgabewert.
   */
  function visualizationFrame(timestamp) {
    animationFrame = 0;
    if (
      !analyser ||
      audio.paused ||
      document.hidden ||
      motionPreference.matches ||
      (!waveVisible && !barsVisible)
    )
      return;
    if (timestamp - lastFrameTime >= 33) {
      lastFrameTime = timestamp;
      if (waveVisible) {
        analyser.getByteTimeDomainData(timeData);
        drawWave(true);
      }
      if (barsVisible) {
        equalizer.classList.add('is-audio-reactive');
        analyser.getByteFrequencyData(frequencyData);
        bars.forEach(

          /**
           * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
           * @param {object} bar - Einzelner Equalizer-Balken.
           * @param {number} index - Index des aktuellen Balkens, Wellenpunkts oder Fokusziels.
           * @returns {void} Kein Rückgabewert.
           */
          (bar, index) => {

            const frequencyIndex = Math.min(
              frequencyData.length - 1,
              Math.floor(Math.pow(index / (bars.length - 1), 1.7) * (frequencyData.length - 1)),
            );  // Nichtlinear zugeordneter Frequenzbereich des Equalizer-Balkens.

            bar.style.height = `${Math.max(3, (frequencyData[frequencyIndex] / 255) * 100)}%`;
          },
        );
      }
    }
    animationFrame = requestAnimationFrame(visualizationFrame);
  }

  /**
   * Startet Audiovisualisierung nur bei Wiedergabe, Sichtbarkeit und erlaubter Bewegung.
   * @returns {void} Kein Rückgabewert.
   */
  function startVisualization() {
    if (
      !animationFrame &&
      analyser &&
      !audio.paused &&
      !document.hidden &&
      !motionPreference.matches &&
      (waveVisible || barsVisible)
    ) {
      animationFrame = requestAnimationFrame(visualizationFrame);
    }
  }

  /**
   * Stoppt Audiovisualisierung und stellt die ruhenden Vorschauen wieder her.
   * @returns {void} Kein Rückgabewert.
   */
  function stopVisualization() {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    equalizer.classList.remove('is-audio-reactive');
    bars.forEach(

      /**
       * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
       * @param {object} bar - Einzelner Equalizer-Balken.
       * @returns {void} Kein Rückgabewert.
       */
      bar => {
        bar.style.removeProperty('height');
      },
    );
    drawWave();
  }
  playButtons.forEach(

    /**
     * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
     * @param {HTMLElement} button - Aktuell registrierte oder aktualisierte Schaltfläche.
     * @returns {unknown} Ergebnis der beschriebenen Operation.
     */
    button => button.addEventListener('click', togglePlayback),
  );
  muteButtons.forEach(

    /**
     * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
     * @param {HTMLElement} button - Aktuell registrierte oder aktualisierte Schaltfläche.
     * @returns {unknown} Ergebnis der beschriebenen Operation.
     */
    button =>
      button.addEventListener(
        'click',

        /**
         * Verarbeitet das Ereignis „click“ für die zugehörige Audio- oder Seiteninteraktion.
         * @returns {void} Kein Rückgabewert.
         */
        () => {
          audio.muted = !audio.muted;
          syncAudio();
          drawWave();
        },
      ),
  );
  volumeInputs.forEach(

    /**
     * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
     * @param {HTMLInputElement} input - Zu synchronisierendes Range-Eingabefeld.
     * @returns {unknown} Ergebnis der beschriebenen Operation.
     */
    input =>
      input.addEventListener(
        'input',

        /**
         * Verarbeitet das Ereignis „input“ für die zugehörige Audio- oder Seiteninteraktion.
         * @returns {void} Kein Rückgabewert.
         */
        () => {
          audio.volume = Number(input.value) / 100;
          audio.muted = false;
          syncAudio();
        },
      ),
  );
  seekInputs.forEach(

    /**
     * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
     * @param {HTMLInputElement} input - Zu synchronisierendes Range-Eingabefeld.
     * @returns {unknown} Ergebnis der beschriebenen Operation.
     */
    input =>
      input.addEventListener(
        'input',

        /**
         * Verarbeitet das Ereignis „input“ für die zugehörige Audio- oder Seiteninteraktion.
         * @returns {void} Kein Rückgabewert.
         */
        () => {
          if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
          audio.currentTime = (Number(input.value) / 1000) * audio.duration;
          syncAudio();
        },
      ),
  );
  ['loadedmetadata', 'durationchange', 'timeupdate', 'volumechange'].forEach(

    /**
     * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
     * @param {string} event - Eingabewert „event“.
     * @returns {unknown} Ergebnis der beschriebenen Operation.
     */
    event => audio.addEventListener(event, syncAudio),
  );
  audio.addEventListener(
    'playing',

    /**
     * Verarbeitet das Ereignis „playing“ für die zugehörige Audio- oder Seiteninteraktion.
     * @returns {void} Kein Rückgabewert.
     */
    () => {
      setPlayerMessage('TRANSMISSION CONNECTED.');
      syncAudio();
      startVisualization();
    },
  );
  audio.addEventListener(
    'waiting',

    /**
     * Verarbeitet das Ereignis „waiting“ für die zugehörige Audio- oder Seiteninteraktion.
     * @returns {void} Kein Rückgabewert.
     */
    () => {
      setPlayerMessage('BUFFERING TRANSMISSION…');
    },
  );
  audio.addEventListener(
    'pause',

    /**
     * Verarbeitet das Ereignis „pause“ für die zugehörige Audio- oder Seiteninteraktion.
     * @returns {void} Kein Rückgabewert.
     */
    () => {
      setPlayerMessage(audio.ended ? 'TRANSMISSION COMPLETE. PLAY AGAIN?' : 'TRANSMISSION PAUSED.');
      syncAudio();
      stopVisualization();
    },
  );
  audio.addEventListener(
    'ended',

    /**
     * Verarbeitet das Ereignis „ended“ für die zugehörige Audio- oder Seiteninteraktion.
     * @returns {void} Kein Rückgabewert.
     */
    () => {
      setPlayerMessage('TRANSMISSION COMPLETE. PLAY AGAIN?');
      syncAudio();
      stopVisualization();
    },
  );
  audio.addEventListener(
    'error',

    /**
     * Verarbeitet das Ereignis „error“ für die zugehörige Audio- oder Seiteninteraktion.
     * @returns {void} Kein Rückgabewert.
     */
    () => {
      setPlayerMessage('AUDIO FILE UNAVAILABLE. CHECK THE FILE PATH.');
      seekInputs.forEach(

        /**
         * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
         * @param {HTMLInputElement} input - Zu synchronisierendes Range-Eingabefeld.
         * @returns {void} Kein Rückgabewert.
         */
        input => {
          input.disabled = true;
        },
      );
      stopVisualization();
    },
  );

  /**
   * Blendet den Player-Inhalt ein oder aus und synchronisiert die Fensterschaltfläche.
   * @param {boolean} minimized - Gewünschter eingeklappter Player-Zustand.
   * @returns {void} Kein Rückgabewert.
   */
  function setPlayerMinimized(minimized) {
    select('#mini-player-content').hidden = minimized;
    player.classList.toggle('is-minimized', minimized);
    playerMinimize.setAttribute('aria-expanded', String(!minimized));
    playerMinimize.setAttribute(
      'aria-label',
      minimized ? 'Restore player content' : 'Minimize player',
    );
    playerMinimize.textContent = minimized ? '+' : '−';
  }

  /**
   * Verschiebt denselben Player in ein natives Modal und erhält die Wiedergabe.
   * @returns {void} Kein Rückgabewert.
   */
  function expandPlayer() {
    if (!playerDialog.showModal || playerDialog.open || dialog.open) return;
    playerWasMinimized = select('#mini-player-content').hidden;
    setPlayerMinimized(false);
    player.classList.add('player-expanded');
    playerDialog.append(player);
    playerMaximize.setAttribute('aria-expanded', 'true');
    playerMaximize.setAttribute('aria-label', 'Restore player size');
    playerMaximize.textContent = '⧉';
    document.body.classList.add('dialog-open');
    playerDialog.showModal();
    playerMaximize.focus();
    resizeCanvas();
    startVisualization();
  }

  /**
   * Stellt DOM-Position, Fenstergröße, minimierten Zustand und Fokus des Players wieder her.
   * @returns {void} Kein Rückgabewert.
   */
  function restorePlayer() {
    playerHomeAnchor.before(player);
    player.classList.remove('player-expanded');
    playerMaximize.setAttribute('aria-expanded', 'false');
    playerMaximize.setAttribute('aria-label', 'Expand player');
    playerMaximize.textContent = '□';
    setPlayerMinimized(playerWasMinimized);
    document.body.classList.toggle('dialog-open', dialog.open);
    playerMaximize.focus({
      preventScroll: true,
    });
    resizeCanvas();
    startVisualization();
  }
  playerMinimize.addEventListener(
    'click',

    /**
     * Verarbeitet das Ereignis „click“ für die zugehörige Audio- oder Seiteninteraktion.
     * @returns {void} Kein Rückgabewert.
     */
    () => {
      if (playerDialog.open) {
        playerWasMinimized = true;
        playerDialog.close();
      } else setPlayerMinimized(!select('#mini-player-content').hidden);
    },
  );
  playerMaximize.addEventListener(
    'click',

    /**
     * Verarbeitet das Ereignis „click“ für die zugehörige Audio- oder Seiteninteraktion.
     * @returns {void} Kein Rückgabewert.
     */
    () => {
      if (playerDialog.open) playerDialog.close();
      else expandPlayer();
    },
  );
  playerDialog.addEventListener('close', restorePlayer);
  playerDialog.addEventListener(
    'click',

    /**
     * Verarbeitet das Ereignis „click“ für die zugehörige Audio- oder Seiteninteraktion.
     * @param {Event} event - Eingabewert „event“.
     * @returns {void} Kein Rückgabewert.
     */
    event => {

      const rect = playerDialog.getBoundingClientRect();  // Aktuelles Rechteck des betrachteten Canvas-, Hero- oder Dialogbereichs.

      if (
        event.target === playerDialog &&
        (event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom)
      )
        playerDialog.close();
    },
  );
  playerMaximize.disabled = !playerDialog.showModal;
  select('.window-actions', player).hidden = false;
  if ('IntersectionObserver' in window) {

    const visibilityObserver = new IntersectionObserver(

      /**
       * Führt die Scroll-Interpolation aus und meldet ihren Abschluss.
       * @param {Array} entries - Eingabewert „entries“.
       * @returns {void} Kein Rückgabewert.
       */
      entries => {
        entries.forEach(

          /**
           * Synchronisiert die Darstellung oder Interaktionsfreigabe des aktuellen Eintrags.
           * @param {object} entry - Einzelne Sichtbarkeitsmeldung des Beobachters.
           * @returns {void} Kein Rückgabewert.
           */
          entry => {
            if (entry.target === canvas) waveVisible = entry.isIntersecting;
            if (entry.target === equalizer) {
              barsVisible = entry.isIntersecting;
              equalizer.classList.toggle('is-in-view', barsVisible);
            }
          },
        );
        startVisualization();
      },
    );  // Beobachter der tatsächlich sichtbaren Audioanzeigen.

    visibilityObserver.observe(canvas);
    visibilityObserver.observe(equalizer);
  }
  if ('ResizeObserver' in window) new ResizeObserver(resizeCanvas).observe(canvas);
  else window.addEventListener('resize', resizeCanvas);
  return {
    togglePlayback,
    syncAudio,
    drawWave,
    resizeCanvas,
    startVisualization,
    stopVisualization,
  };
}
