/* ctrl-room/script.js */
"use strict";

(() => {
  const select = (selector, parent = document) => parent.querySelector(selector);
  const selectAll = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const audio = select("#audio");
  const playButtons = selectAll("[data-play]");
  const muteButtons = selectAll("[data-mute]");
  const volumeInputs = selectAll("[data-volume]");
  const seekInputs = selectAll("[data-seek]");
  const message = select("#player-message");
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const menuButton = select(".menu-toggle");
  const menu = select("#mobile-menu");
  const main = select("main");
  const footer = select("footer");
  const dialog = select("#detail-dialog");
  const player = select("#mini-player");
  const playerDialog = select("#player-dialog");
  const playerMinimize = select("#player-minimize");
  const playerMaximize = select("#player-maximize");
  const playerHomeAnchor = document.createComment("Mini-player original position");
  player.after(playerHomeAnchor);
  let playerWasMinimized = false;
  let activeFilter = "all";
  let pendingPlay = false;
  let audioContext = null;
  let analyser = null;
  let frequencyData = null;
  let timeData = null;
  let animationFrame = 0;
  let lastFrameTime = 0;
  let dialogTrigger = null;

  const records = [
    { id: "CR-001", type: "music", title: "Midnight in the Lower Sector", creator: "KATZKII", location: "BERLIN", date: "2026-10-13", description: ["The first transmission from the CTRL//ROOM universe. A descent into nocturnal electronic textures, low-end pressure and the space between the beats.", "The audio track “Midnight in the Lower Sector” is AI-generated. Listen to the supplied full-length audio track through the shared player. All play controls on this page address the same recording."], playable: true },
    { id: "CR-002", type: "visuals", title: "Signal / Noise", creator: "VOID COLLECTIVE", location: "HAMBURG", date: "2026-10-08", description: ["An imagined installation that translates a room’s sonic energy into a field of moving lines. Signal and interference occupy the same surface.", "Concept record: generative projection, monochrome geometry and an electric-blue response layer."] },
    { id: "CR-003", type: "people", title: "KATZKII / Artist file 001", creator: "KATZKII", location: "BERLIN", date: "2026-10-05", description: ["KATZKII is the fictional featured artist of this design study. The project imagines a practice spanning electronic sound, visual systems and site-specific installations.", "The concept: treat a performance as one environment. Sound determines the rhythm; typography, light and image reveal the structure.", "The portraits are AI-generated. This profile is creative demo content, rather than an interview or biography of a real person."], playable: true },
    { id: "CR-004", type: "places", title: "Lower Sector / Venue file", creator: "CTRL//ROOM", location: "BERLIN", date: "2026-10-03", description: ["An imagined industrial space for listening, gathering and audiovisual experimentation. Concrete surfaces, a low ceiling and a room built around the sound.", "This is a fictional venue record. The crowd photograph is AI-generated; no address, opening hours or booking service is implied."] },
    { id: "CR-005", type: "visuals", title: "Optical Feedback / 02", creator: "MIRA ZERO", location: "COLOGNE", date: "2026-09-29", description: ["A concept study of wireframes and visual feedback loops. Simple lines describe complex volumes; small changes in input reshape the entire image.", "Medium: procedural geometry, screen-based motion and a tightly controlled color palette."] },
    { id: "CR-006", type: "people", title: "VOID COLLECTIVE / Network", creator: "VOID COLLECTIVE", location: "HAMBURG", date: "2026-09-22", description: ["A fictional collective connecting musicians, visual artists and installation designers. The shared idea is to make the room an instrument.", "This demo network record explores how a culture platform could document creative collaboration."] },
    { id: "CR-007", type: "places", title: "Node 02 / Warehouse", creator: "CTRL//ROOM", location: "HAMBURG", date: "2026-09-18", description: ["A fictional warehouse node in the CTRL//ROOM network. An open floor, adaptable projection surfaces and room for experiments.", "The city coordinates shown on the page identify Hamburg as a city, not the location of a real venue."] },
    { id: "CR-008", type: "visuals", title: "Afterimage / Motion study", creator: "KATZKII", location: "BERLIN", date: "2026-09-14", description: ["An imagined series of moving images inspired by the moment after a bright light disappears. Residual shapes, hard cuts and fragmented rhythm.", "The concept combines digital textures with code-driven layers. This record is descriptive demo content; no separate film is attached."] },
    { id: "CR-009", type: "people", title: "MIRA ZERO / Visual practice", creator: "MIRA ZERO", location: "COLOGNE", date: "2026-09-09", description: ["A fictional visual artist working with procedural geometry and spatial perception. The imagined practice moves between screen, projection and physical space.", "The profile represents the People channel of this design study’s archive."] },
    { id: "CR-010", type: "places", title: "Frequency Lab / Node 03", creator: "CTRL//ROOM", location: "COLOGNE", date: "2026-09-02", description: ["An imagined meeting point for sound workshops, visual experiments and small listening sessions.", "This is a concept location, with no real-world bookings or event attendance offered."] },
    { id: "CR-011", type: "events", title: "KATZKII / A/V Live", creator: "KATZKII", location: "BERLIN", date: "2026-11-14", description: ["An illustrative audiovisual live session in the fictional Lower Sector venue. Sound, wireframe projections and a room-wide light system form one performance.", "Demo timetable: doors 21:00, transmission 22:30. This is not a real event; no tickets or reservations are available."], playable: true },
    { id: "CR-012", type: "events", title: "VOID COLLECTIVE / Open Circuit", creator: "VOID COLLECTIVE", location: "HAMBURG", date: "2026-11-22", description: ["An imagined night of collaborative sets and responsive visual systems, curated by the fictional VOID COLLECTIVE.", "This event illustrates the archive’s category and search behavior. It is not an announcement for an actual show."] },
    { id: "CR-013", type: "events", title: "Signals / 004", creator: "MIRA ZERO", location: "COLOGNE", date: "2026-12-06", description: ["A fictional encounter between experimental electronic music and generative visual art.", "An illustrative event record for the Cologne network node, without real tickets, attendance or booking functionality."] }
  ];

  /** Meldet Lade- und Wiedergabezustände auch im vergrößerten Player. */
  function setPlayerMessage(text) {
    message.textContent = text;
    select("#expanded-player-message").textContent = text;
  }

  /** Formatiert eine Wiedergabezeit; ungültige Metadaten bleiben erkennbar. */
  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "--:--";
    const value = Math.max(0, Math.floor(seconds));
    return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
  }

  /** Synchronisiert Füllstand und barrierefreien Wert eines Range-Inputs. */
  function updateRange(input, valueText) {
    const percentage = (Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min)) * 100;
    input.style.setProperty("--fill", `${percentage}%`);
    input.setAttribute("aria-valuetext", valueText);
  }

  /** Hält alle Player-Steuerelemente am selben Audiozustand. */
  function syncAudio() {
    const playing = !audio.paused && !audio.ended;
    const muted = audio.muted || audio.volume === 0;
    document.body.classList.toggle("is-playing", playing);
    document.body.classList.toggle("is-muted", muted);
    playButtons.forEach(button => {
      button.disabled = pendingPlay;
      button.setAttribute("aria-label", `${playing ? "Pause" : "Play"} Midnight in the Lower Sector`);
      select("[data-play-icon]", button).textContent = playing ? "Ⅱ" : "▶";
    });
    muteButtons.forEach(button => {
      button.setAttribute("aria-pressed", String(audio.muted));
      button.setAttribute("aria-label", audio.muted ? "Unmute audio" : "Mute audio");
    });
    selectAll("[data-audio-status]").forEach(label => { label.textContent = muted ? "MUTED" : playing ? "PLAYING" : "STANDBY"; });
    selectAll("[data-current-time]").forEach(label => { label.textContent = formatTime(audio.currentTime); });
    selectAll("[data-duration]").forEach(label => { label.textContent = formatTime(audio.duration); });
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      seekInputs.forEach(input => {
        input.disabled = false;
        input.value = String(audio.currentTime / audio.duration * 1000);
        updateRange(input, `${Math.floor(audio.currentTime / 60)} minutes ${Math.floor(audio.currentTime % 60)} seconds of ${formatTime(audio.duration)}`);
      });
    }
    volumeInputs.forEach(input => {
      input.value = String(Math.round(audio.volume * 100));
      updateRange(input, `${input.value} percent`);
    });
  }

  /** Erstellt den Analyser erst nach einer ausdrücklichen Wiedergabeaktion. */
  function connectAudioAnalysis() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (audioContext || !AudioContextClass || location.protocol === "file:") return;
    try {
      audioContext = new AudioContextClass();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = .78;
      frequencyData = new Uint8Array(analyser.frequencyBinCount);
      timeData = new Uint8Array(analyser.fftSize);
      const source = audioContext.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
    } catch {
      analyser = null;
    }
  }

  /** Startet oder pausiert den zentralen Track und fängt Medienfehler ab. */
  async function togglePlayback() {
    if (pendingPlay) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    pendingPlay = true;
    setPlayerMessage("CONNECTING TO TRANSMISSION…");
    syncAudio();
    try {
      connectAudioAnalysis();
      const resume = audioContext?.state === "suspended" ? audioContext.resume() : Promise.resolve();
      if (audio.ended) audio.currentTime = 0;
      await Promise.all([resume, audio.play()]);
      setPlayerMessage("TRANSMISSION CONNECTED.");
    } catch {
      audio.pause();
      setPlayerMessage("PLAYBACK UNAVAILABLE. CHECK THE AUDIO FILE AND TRY AGAIN.");
    } finally {
      pendingPlay = false;
      syncAudio();
      startVisualization();
    }
  }

  const equalizer = select("[data-equalizer]");
  equalizer.classList.add("is-in-view");
  const bars = Array.from({ length: 24 }, (_, index) => {
    const bar = document.createElement("i");
    bar.style.setProperty("--height", `${12 + Math.abs(Math.sin(index * .72)) * 53 + Math.abs(Math.cos(index * .27)) * 18}%`);
    bar.style.setProperty("--bar-duration", `${1.1 + (index % 7) * .13}s`);
    bar.style.setProperty("--bar-delay", `${-index * .17}s`);
    equalizer.append(bar);
    return bar;
  });
  const canvas = select("[data-waveform]");
  const canvasContext = canvas.getContext("2d");
  let canvasWidth = 280;
  let canvasHeight = 48;
  let waveVisible = true;
  let barsVisible = false;

  /** Zeichnet eine ruhende Vorschau oder echte Time-Domain-Daten. */
  function drawWave(realData = false) {
    if (!canvasContext) return;
    canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
    canvasContext.strokeStyle = audio.muted ? "#8b9589" : "#d2ff3b";
    canvasContext.lineWidth = 1;
    canvasContext.beginPath();
    const points = realData ? timeData.length : 120;
    for (let index = 0; index < points; index++) {
      const x = index / (points - 1) * canvasWidth;
      const signal = realData ? (timeData[index] - 128) / 128 : Math.sin(index * .82) * Math.sin(index * .21) * Math.exp(-Math.pow((index - 54) / 25, 2)) * .4;
      const y = canvasHeight / 2 + signal * canvasHeight * .42;
      if (index === 0) canvasContext.moveTo(x, y);
      else canvasContext.lineTo(x, y);
    }
    canvasContext.stroke();
  }

  /** Skaliert Canvas anhand der tatsächlichen Fläche und begrenzt den DPR. */
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvasWidth = Math.max(1, rect.width);
    canvasHeight = Math.max(1, rect.height);
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvasWidth * ratio);
    canvas.height = Math.round(canvasHeight * ratio);
    canvasContext?.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawWave();
  }

  /** Begrenzt die Audiovisualisierung auf 30 FPS und sichtbare Komponenten. */
  function visualizationFrame(timestamp) {
    animationFrame = 0;
    if (!analyser || audio.paused || document.hidden || motionPreference.matches || (!waveVisible && !barsVisible)) return;
    if (timestamp - lastFrameTime >= 33) {
      lastFrameTime = timestamp;
      if (waveVisible) {
        analyser.getByteTimeDomainData(timeData);
        drawWave(true);
      }
      if (barsVisible) {
        equalizer.classList.add("is-audio-reactive");
        analyser.getByteFrequencyData(frequencyData);
        bars.forEach((bar, index) => {
          const frequencyIndex = Math.min(frequencyData.length - 1, Math.floor(Math.pow(index / (bars.length - 1), 1.7) * (frequencyData.length - 1)));
          bar.style.height = `${Math.max(3, frequencyData[frequencyIndex] / 255 * 100)}%`;
        });
      }
    }
    animationFrame = requestAnimationFrame(visualizationFrame);
  }

  /** Startet keine Animation im Hintergrund oder bei Reduced Motion. */
  function startVisualization() {
    if (!animationFrame && analyser && !audio.paused && !document.hidden && !motionPreference.matches && (waveVisible || barsVisible)) {
      animationFrame = requestAnimationFrame(visualizationFrame);
    }
  }

  /** Setzt Visuals in den ruhenden Zustand zurück. */
  function stopVisualization() {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    equalizer.classList.remove("is-audio-reactive");
    bars.forEach(bar => { bar.style.removeProperty("height"); });
    drawWave();
  }

  /** Verknüpft die mobilen Navigationszustände, Scroll-Lock und Fokus. */
  function setMenu(open, restoreFocus = true) {
    menu.hidden = !open;
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    document.body.classList.toggle("menu-open", open);
    main.inert = open;
    footer.inert = open;
    if (open) select("a", menu).focus();
    else if (restoreFocus) menuButton.focus();
  }

  /** Verschiebt den Fokus nach einer mobilen Ankernavigation zum Inhalt. */
  function focusSection(anchor) {
    const target = select(anchor);
    if (!target) return;
    const heading = select("h1, h2", target) || target;
    heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
    heading.addEventListener("blur", () => heading.removeAttribute("tabindex"), { once: true });
  }

  const search = select("#archive-search");
  const archiveBody = select("#archive-body");
  const results = select("#archive-results");

  /** Rendert nur lokale Demo-Datensätze und verwendet ausschließlich Textknoten. */
  function renderArchive() {
    const term = search.value.trim().toLocaleLowerCase();
    const matching = records.filter(record => (activeFilter === "all" || record.type === activeFilter) && `${record.title} ${record.creator} ${record.location} ${record.type} ${record.date}`.toLocaleLowerCase().includes(term));
    archiveBody.replaceChildren();
    const fragment = document.createDocumentFragment();
    matching.forEach(record => {
      const row = document.createElement("tr");
      const typeCell = document.createElement("td");
      const tag = document.createElement("span");
      tag.className = "type-tag";
      tag.dataset.type = record.type;
      tag.textContent = record.type.toUpperCase();
      typeCell.append(tag);
      row.append(typeCell);
      [record.title, record.creator, record.location, record.date.split("-").reverse().join(".")].forEach(value => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.append(cell);
      });
      const actionCell = document.createElement("td");
      const action = document.createElement("button");
      action.className = "record-button";
      action.dataset.record = record.id;
      action.setAttribute("aria-label", `Explore ${record.title}`);
      action.textContent = "↗";
      actionCell.append(action);
      row.append(actionCell);
      fragment.append(row);
    });
    if (!matching.length) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 6;
      cell.className = "empty-state";
      cell.textContent = "NO SIGNAL FOUND. TRY ANOTHER SEARCH OR FILTER.";
      row.append(cell);
      fragment.append(row);
    }
    archiveBody.append(fragment);
    results.textContent = `${String(matching.length).padStart(2, "0")} OF ${records.length} RECORDS / ${activeFilter.toUpperCase()} / DEMO COLLECTION`;
  }

  /** Gemeinsamer Filterpfad für Modul-Links, Events und Archivbuttons. */
  function setFilter(filter, resetSearch = false) {
    const allowedFilters = ["all", "music", "visuals", "people", "places", "events"];
    activeFilter = allowedFilters.includes(filter) ? filter : "all";
    if (resetSearch) search.value = "";
    selectAll("[data-filter]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.filter === activeFilter)));
    renderArchive();
  }

  /** Öffnet ein natives Dialogfenster mit gekennzeichnetem Demo-Inhalt. */
  function openRecord(record, trigger) {
    if (!record || !dialog.showModal) return;
    dialogTrigger = trigger;
    select("#dialog-type").textContent = `${record.id} / ${record.type.toUpperCase()}`;
    select("#dialog-title").textContent = record.title;
    select("#dialog-meta").textContent = `${record.creator} / ${record.location} / ${record.date}`;
    const description = select("#dialog-description");
    description.replaceChildren();
    record.description.forEach(text => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      description.append(paragraph);
    });
    select("#dialog-play").hidden = !record.playable;
    document.body.classList.add("dialog-open");
    dialog.showModal();
    if (!audio.paused && !audio.ended && audio.readyState >= 2) document.dispatchEvent(new CustomEvent('bp:study-achievement', { detail: 'study-ctrl-reception' }));
    select(".dialog-close", dialog).focus();
  }

  playButtons.forEach(button => button.addEventListener("click", togglePlayback));
  muteButtons.forEach(button => button.addEventListener("click", () => { audio.muted = !audio.muted; syncAudio(); drawWave(); }));
  volumeInputs.forEach(input => input.addEventListener("input", () => { audio.volume = Number(input.value) / 100; audio.muted = false; syncAudio(); }));
  seekInputs.forEach(input => input.addEventListener("input", () => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
    audio.currentTime = Number(input.value) / 1000 * audio.duration;
    syncAudio();
  }));
  ["loadedmetadata", "durationchange", "timeupdate", "volumechange"].forEach(event => audio.addEventListener(event, syncAudio));
  audio.addEventListener("playing", () => { setPlayerMessage("TRANSMISSION CONNECTED."); syncAudio(); startVisualization(); });
  audio.addEventListener("waiting", () => { setPlayerMessage("BUFFERING TRANSMISSION…"); });
  audio.addEventListener("pause", () => { setPlayerMessage(audio.ended ? "TRANSMISSION COMPLETE. PLAY AGAIN?" : "TRANSMISSION PAUSED."); syncAudio(); stopVisualization(); });
  audio.addEventListener("ended", () => { setPlayerMessage("TRANSMISSION COMPLETE. PLAY AGAIN?"); syncAudio(); stopVisualization(); });
  audio.addEventListener("error", () => { setPlayerMessage("AUDIO FILE UNAVAILABLE. CHECK THE FILE PATH."); seekInputs.forEach(input => { input.disabled = true; }); stopVisualization(); });

  menuButton.addEventListener("click", () => setMenu(menu.hidden));
  selectAll("a", menu).forEach(link => link.addEventListener("click", () => { setMenu(false, false); focusSection(link.getAttribute("href")); }));
  window.matchMedia("(min-width: 901px)").addEventListener("change", event => { if (event.matches && !menu.hidden) setMenu(false, false); });
  document.addEventListener("keydown", event => {
    if (!menu.hidden) {
      if (event.key === "Escape") { event.preventDefault(); setMenu(false); }
      if (event.key === "Tab") {
        const elements = [...selectAll("button:not(:disabled), input:not(:disabled)", select(".site-header")), ...selectAll("a", menu)];
        const index = elements.indexOf(document.activeElement);
        if (event.shiftKey && index === 0) { event.preventDefault(); elements.at(-1).focus(); }
        else if (!event.shiftKey && index === elements.length - 1) { event.preventDefault(); elements[0].focus(); }
      }
    } else if (event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey && !dialog.open && !playerDialog.open && !event.target.closest("input, textarea, select, [contenteditable]")) {
      event.preventDefault();
      search.focus();
      search.scrollIntoView({ block: "center", behavior: motionPreference.matches ? "instant" : "smooth" });
    }
  });

  selectAll("[data-filter]").forEach(button => button.addEventListener("click", () => setFilter(button.dataset.filter)));
  selectAll("[data-filter-link]").forEach(link => link.addEventListener("click", () => setFilter(link.dataset.filterLink, true)));
  search.addEventListener("input", renderArchive);
  archiveBody.addEventListener("click", event => {
    const trigger = event.target.closest("[data-record]");
    if (trigger) openRecord(records.find(record => record.id === trigger.dataset.record), trigger);
  });
  select("#interview-button").addEventListener("click", event => openRecord(records.find(record => record.id === "CR-003"), event.currentTarget));
  select(".dialog-close", dialog).addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener("close", () => { document.body.classList.remove("dialog-open"); dialogTrigger?.focus(); });
  select("#dialog-play").addEventListener("click", () => {
    dialog.close();
    if (audio.paused) togglePlayback();
    select("#artist").scrollIntoView({ behavior: motionPreference.matches ? "instant" : "smooth" });
  });

  /** Klappt nur den Inhalt ein; Track und Audiosteuerung bleiben unverändert. */
  function setPlayerMinimized(minimized) {
    select("#mini-player-content").hidden = minimized;
    player.classList.toggle("is-minimized", minimized);
    playerMinimize.setAttribute("aria-expanded", String(!minimized));
    playerMinimize.setAttribute("aria-label", minimized ? "Restore player content" : "Minimize player");
    playerMinimize.textContent = minimized ? "+" : "−";
  }

  /** Verschiebt denselben Player ins native Modal, ohne Audio neu zu laden. */
  function expandPlayer() {
    if (!playerDialog.showModal || playerDialog.open || dialog.open) return;
    playerWasMinimized = select("#mini-player-content").hidden;
    setPlayerMinimized(false);
    player.classList.add("player-expanded");
    playerDialog.append(player);
    playerMaximize.setAttribute("aria-expanded", "true");
    playerMaximize.setAttribute("aria-label", "Restore player size");
    playerMaximize.textContent = "⧉";
    document.body.classList.add("dialog-open");
    playerDialog.showModal();
    playerMaximize.focus();
    resizeCanvas();
    startVisualization();
  }

  /** Stellt Position, Größe, eingeklappten Zustand und Fokus wieder her. */
  function restorePlayer() {
    playerHomeAnchor.before(player);
    player.classList.remove("player-expanded");
    playerMaximize.setAttribute("aria-expanded", "false");
    playerMaximize.setAttribute("aria-label", "Expand player");
    playerMaximize.textContent = "□";
    setPlayerMinimized(playerWasMinimized);
    document.body.classList.toggle("dialog-open", dialog.open);
    playerMaximize.focus({ preventScroll: true });
    resizeCanvas();
    startVisualization();
  }

  playerMinimize.addEventListener("click", () => {
    if (playerDialog.open) {
      playerWasMinimized = true;
      playerDialog.close();
    } else setPlayerMinimized(!select("#mini-player-content").hidden);
  });
  playerMaximize.addEventListener("click", () => {
    if (playerDialog.open) playerDialog.close();
    else expandPlayer();
  });
  playerDialog.addEventListener("close", restorePlayer);
  playerDialog.addEventListener("click", event => {
    const rect = playerDialog.getBoundingClientRect();
    if (event.target === playerDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) playerDialog.close();
  });
  playerMaximize.disabled = !playerDialog.showModal;
  select(".window-actions", player).hidden = false;

  const interactionLayer = select("#interaction-layer");
  let lastRippleTime = 0;

  /** Lässt drei endliche Ringe nur auf nicht bedienbaren Flächen entstehen. */
  function createSignalRipple(event) {
    if (motionPreference.matches || document.hidden || dialog.open || playerDialog.open || !menu.hidden || event.detail === 0) return;
    if (event.target.closest("a, button, input, select, textarea, label, summary, [role='button'], [contenteditable], [tabindex]")) return;
    if (window.getSelection()?.isCollapsed === false) return;
    const now = performance.now();
    if (now - lastRippleTime < 120) return;
    lastRippleTime = now;
    while (interactionLayer.children.length >= 4) interactionLayer.firstElementChild.remove();
    const ripple = document.createElement("span");
    ripple.className = "signal-ripple";
    ripple.style.left = `${event.clientX}px`;
    ripple.style.top = `${event.clientY}px`;
    for (let index = 0; index < 3; index++) ripple.append(document.createElement("i"));
    ripple.lastElementChild.addEventListener("animationend", () => ripple.remove(), { once: true });
    interactionLayer.append(ripple);
  }
  document.addEventListener("click", createSignalRipple);

  const hero = select(".hero");
  const portrait = select(".hero-portrait");
  let portraitFrame = 0;
  let portraitPointer = null;

  /** Aktualisiert die Bildreaktion maximal einmal pro Renderframe. */
  function updatePortraitHover() {
    portraitFrame = 0;
    if (!portraitPointer || motionPreference.matches) return;
    const rect = portrait.getBoundingClientRect();
    const { x, y, interactive } = portraitPointer;
    const overPortrait = !interactive && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    portrait.classList.toggle("is-hovered", overPortrait);
    if (overPortrait) {
      portrait.style.setProperty("--portrait-x", `${(x - rect.left) / rect.width * 8 - 4}px`);
      portrait.style.setProperty("--portrait-y", `${(y - rect.top) / rect.height * 8 - 4}px`);
    }
  }

  /** Entfernt offene Bildreaktionen und ausstehende Pointer-Frames. */
  function resetPortraitHover() {
    cancelAnimationFrame(portraitFrame);
    portraitFrame = 0;
    portraitPointer = null;
    portrait.classList.remove("is-hovered");
    portrait.style.removeProperty("--portrait-x");
    portrait.style.removeProperty("--portrait-y");
  }
  hero.addEventListener("pointermove", event => {
    if (event.pointerType !== "mouse" || motionPreference.matches) return;
    portraitPointer = { x: event.clientX, y: event.clientY, interactive: Boolean(event.target.closest("a, button, input")) };
    if (!portraitFrame) portraitFrame = requestAnimationFrame(updatePortraitHover);
  });
  hero.addEventListener("pointerleave", resetPortraitHover);

  if ("IntersectionObserver" in window) {
    const visibilityObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.target === canvas) waveVisible = entry.isIntersecting;
        if (entry.target === equalizer) {
          barsVisible = entry.isIntersecting;
          equalizer.classList.toggle("is-in-view", barsVisible);
        }
      });
      startVisualization();
    });
    visibilityObserver.observe(canvas);
    visibilityObserver.observe(equalizer);

    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          entry.target.classList.remove("is-pending");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    selectAll(".reveal").forEach(element => {
      if (!motionPreference.matches) element.classList.add("is-pending");
      revealObserver.observe(element);
    });

    const navigationObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (!visible.length) return;
      selectAll(".desktop-nav a").forEach(link => {
        if (link.getAttribute("href") === `#${visible[0].target.id}`) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-15% 0px -45% 0px", threshold: [0, .2, .5] });
    selectAll("main > section").forEach(section => navigationObserver.observe(section));
  }
  if ("ResizeObserver" in window) new ResizeObserver(resizeCanvas).observe(canvas);
  else window.addEventListener("resize", resizeCanvas);
  document.addEventListener("visibilitychange", () => {
    document.body.classList.toggle("page-hidden", document.hidden);
    if (document.hidden) {
      stopVisualization();
      resetPortraitHover();
      interactionLayer.replaceChildren();
    }
    else startVisualization();
  });
  motionPreference.addEventListener("change", () => {
    if (motionPreference.matches) {
      stopVisualization();
      resetPortraitHover();
      interactionLayer.replaceChildren();
      selectAll(".reveal.is-pending").forEach(element => element.classList.remove("is-pending"));
    } else startVisualization();
  });

  audio.volume = .55;
  audio.removeAttribute("controls");
  volumeInputs.forEach(input => { input.disabled = false; });
  muteButtons.forEach(button => { button.disabled = false; });
  search.disabled = false;
  select("#interview-button").disabled = !dialog.showModal;
  menuButton.hidden = false;
  document.body.classList.add("js-ready");
  select("#copyright-year").textContent = String(new Date().getFullYear());
  syncAudio();
  renderArchive();
  resizeCanvas();
})();
