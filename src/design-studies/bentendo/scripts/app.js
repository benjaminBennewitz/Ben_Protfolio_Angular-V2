import { worldMusic } from './game/systems/world-music.js';
import { worldMovement } from './game/systems/player-movement.js';
import { selectCartridgeCover } from './device/cartridge/cover.js';
import { NativeButtons } from './device/input/native-buttons.js';
import { buttonAction } from './device/button-motion.js';
import { SaveManager,gameStorage } from './game/systems/save-manager.js';
import { element, clamp } from './core/dom.js';
import { FrameLoop } from './core/frame-loop.js';
import { UI } from './core/ui.js';
import { AudioManager } from './audio/audio-manager.js';
import { Handheld } from './device/handheld.js';
import { CartridgeController } from './device/cartridge/controller.js';
import { ViewControls } from './device/input/views.js';
import { GameInput } from './device/input/game-input.js';
import { updateHotspots } from './device/hotspots.js';
import { Display } from './display/display.js';
import { loadFont } from './display/font.js';
import { loadDisplayAssets } from './display/assets.js';
import { loadRooms } from './game/data/rooms.js';
import { Game } from './game/game.js';

/** Koordiniert Geräte- und Spielzustand über kleine öffentliche Schnittstellen. */
export class App {
  /** Erstellt voneinander getrennte Teilsysteme. */
  constructor() {
    this.audio = new AudioManager(); this.display = new Display();
    this.device = new Handheld(element('viewport'));
    this.cartridge = new CartridgeController(this);
    this.loop = new FrameLoop(this.frame.bind(this));
    this.request = this.loop.request;
    this.trophyRearSeen = false; this.trophyAdventureStarted = false;
    this.phase = 'off'; this.helpOpen = false; this.time = 0; this.bootTime = 0;
    this.bootSoundStarted = false; this.bootFinishedAt = null; this.bootRun = 0;
    this.idleTimer = 0;
    document.addEventListener('visibilitychange',this.visibility.bind(this));
    this.resizeObserver = new ResizeObserver(this.request);
    this.resizeObserver.observe(this.device.viewport);
  }
  /** Lädt lokale Ressourcen und aktiviert danach die Bedienung. */
  async init() {
    await loadFont();
    const [rooms, assets] = await Promise.all([loadRooms(),loadDisplayAssets(),this.device.load(this.display.surface)]);
    this.game = new Game(rooms); this.saves=new SaveManager(this.game,gameStorage()); this.display.assets = assets;
    await selectCartridgeCover(this.device.cartridge,this.game.resumeData?.avatar);
    this.device.setValue('volume',this.audio.volume);
    this.ui = new UI(this); this.views = new ViewControls(this); this.input = new GameInput(this);
    this.nativeButtons=new NativeButtons(this,this.views.modelButtons);
    element('loading').hidden = true;
    this.ui.sync(); this.request();
  }
  /** Gibt eine zugängliche Zustandsmeldung aus. @param {string} message Meldung. */
  announce(message) { element('status').textContent = message; }
  /** Wechselt die Ansicht und löst eine neue Zeichnung aus. @param {string} view Ansichtsname. */
  setView(view) {
    if (!this.device.ready || this.phase === 'boot') return;
    if (this.cartridge.open && view !== 'rear') return this.cartridge.leave(view);
    this.device.setView(view);
    if (view === 'rear' && this.game.mode !== 'world') this.trophyRearSeen = true;
    this.request();
  }
  /** Übernimmt einen gültigen Stellradwert. @param {string} key Regler. @param {number} value Zahlenwert. */
  setValue(key,value) {
    if (!this.device.ready) return;
    this.device.setValue(key,clamp(value));
    if (key === 'volume') { this.audio.volume = this.device.volume; this.audio.applyVolume(); this.audio.saveSettings(); }
    this.ui.sync(); this.request();
  }
  /** Schaltet den Handheld mit konsistentem Audio- und Spielreset. @param {boolean} on Einschaltzustand. */
  setPower(on) {
    if (!this.device.ready) return;
    this.display.powerChange(on,this.device.power,this.device.reduced.matches);
    this.bootRun++; this.audio.stop(); this.game.reset(); this.saves.load();
    if (on) selectCartridgeCover(this.device.cartridge,this.game.resumeData?.avatar).then(this.request);
    this.device.setPower(on); this.bootTime = 0; this.bootSoundStarted = false; this.bootFinishedAt = null;
    this.phase = on ? 'boot' : 'off';
    if (on && !this.device.cartridge.state.checkBoot(Math.random())) this.phase = 'fault';
    if (on) { this.cartridge.open = false; this.device.setView('front'); }
    this.announce(on ? this.phase === 'fault' ? 'Modul prüfen: Cartridge einrasten oder Kontakte durchpusten.' : 'BENTENDO wird eingeschaltet.' : 'BENTENDO ausgeschaltet.');
    this.ui.sync(); this.request();
  }
  /** Verarbeitet Bootfortschritt und den vollständigen Startklang. @param {number} dt Zeitschritt. */
  updateBoot(dt) {
    if (this.phase !== 'boot') return;
    this.bootTime += dt;
    if (!this.bootSoundStarted && (this.device.reduced.matches || this.bootTime >= 1.15)) {
      this.bootSoundStarted = true;
      this.audio.playBoot(this.finishBoot.bind(this,this.bootRun));
    }
    if (this.bootFinishedAt !== null && this.bootTime >= this.bootFinishedAt + 0.5) {
      this.phase = 'on'; this.device.cartridge.state.successfulBoots++;
      this.announce(this.game.description);
    }
  }
  /** Übernimmt nur den noch gültigen Bootabschluss. @param {number} run Startkennung. */
  finishBoot(run) { if (run === this.bootRun && this.phase === 'boot') { this.bootFinishedAt = this.bootTime; this.request(); } }
  /** Synchronisiert die passende vorhandene Musikdatei. */
  updateAudio() {
    if (this.trophyRearSeen && !this.trophyAdventureStarted && this.phase === 'on' && this.game.mode === 'world' && !this.game.debugging) {
      this.trophyAdventureStarted = true;
      document.dispatchEvent(new CustomEvent('bp:study-achievement', { detail: 'study-bentendo-turn' }));
    }
    const track = this.phase === 'on' && !document.hidden ? ['title','character'].includes(this.game.mode) ? 'title-screen' : worldMusic(this.game) : '';
    this.audio.playMusic(track);
    for (const cue of this.game.sounds.splice(0)) this.playCue(cue);
  }
  /** Übergibt aktive Spielgeräusche an den gemeinsamen Audiokanal. @param {string} cue Klangkennung. */
  playCue(cue) {
    if (this.phase !== 'on') return;
    this.audio.playCue(cue);
  }
  /** Aktualisiert und zeichnet einen Frame. @param {number} dt Zeitschritt. */
  frame(dt) {
    if (!this.device.ready || !this.game) return false;
    this.time += dt; this.updateBoot(dt); this.display.update(dt);
    const playable = this.phase === 'on' && !this.helpOpen && !this.cartridge.open;
    if (playable) { this.game.update(dt,this.device.reduced.matches); this.saves.update(dt); }
    this.updateAudio(); this.display.draw(this);
    const moving = this.device.render(dt);
    this.views.update();
    updateHotspots(this); this.ui.sync();
    this.scheduleIdle(playable);
    return (playable && this.game.saveNotice?.remaining>0) || moving || this.display.fading || this.phase === 'boot' || (playable && !this.game.systemMenu && (this.game.move || this.game.slide || this.game.held || this.game.animating));
  }
  /** Aktualisiert ruhende Titel und Dampfphasen mit geringer Frequenz. @param {boolean} playable Aktive Spielansicht. */
  scheduleIdle(playable) {
    clearTimeout(this.idleTimer);
    const ambient = playable && this.game.mode==='world' && !this.game.message && !this.game.bagOpen && !this.game.journalOpen && !this.game.mapOpen && !this.game.systemMenu;
    if (this.phase === 'fault' || ambient || (playable && (this.game.mode === 'title' || this.game.room.id === 'steam'))) this.idleTimer = setTimeout(this.request,100);
  }
  /** Pausiert Ton und gehaltene Tasten im Hintergrund. */
  visibility() {
    if (!this.game) return;
    this.game.held = null;
    if (document.hidden) this.audio.playMusic('');
    this.request();
  }
  /** Verarbeitet einen tatsächlichen Klick auf das 3D-Modell. @param {PointerEvent} event Ereignis. */
  pressModel(event) {
    if (!this.device.ready) return;
    const hit = this.device.hit(event);
    if (this.device.isCartridge(hit) && ['top','rear'].includes(this.device.view)) return this.cartridge.inspect();
    if (!['front','bottom'].includes(this.device.view) || this.phase !== 'on') return;
    let object = hit;
    while (object) {
      const name = object.name;
      if (name === 'BUTTON_A') return this.input.action('interact');
      if (name === 'BUTTON_START') return this.input.action('start');
      if (name === 'BUTTON_B') return this.input.action('back');
      if (name === 'BUTTON_SELECT') return this.input.action('select');
      if (name === 'DPAD' || name.startsWith('Dpad_')) return this.pressDpad(event);
      object = object.parent;
    }
  }
  /** Drückt beim Zeigerkontakt nur das Modell ein; die Spielaktion bleibt beim bestätigten Klick. @param {PointerEvent} event Zeigerkontakt. */
  pressVisual(event) {
    if (!this.device.ready || !['front','bottom'].includes(this.device.view)) return;
    const action=buttonAction(this.device.hit(event));
    if (action==='dpad') this.device.buttons.hold('dpad',this.dpadDirection(event));
    else if (action) this.device.buttons.hold(action);
    this.request();
  }
  /** Liefert die angeklickte Steuerkreuzrichtung. @param {PointerEvent} event Zeigerereignis. */
  dpadDirection(event) {
    const center=this.device.project(this.device.root.getObjectByName('DPAD')),bounds=this.device.viewport.getBoundingClientRect();
    const dx=event.clientX-bounds.left-center.x,dy=event.clientY-bounds.top-center.y;
    if (this.phase==='on' && worldMovement(this.game) && Math.min(Math.abs(dx),Math.abs(dy))>Math.max(Math.abs(dx),Math.abs(dy))*0.45) return `${dy>0?'down':'up'}-${dx>0?'right':'left'}`;
    return Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up';
  }
  /** Bestimmt die angeklickte Steuerkreuzhälfte. @param {PointerEvent} event Ereignis. */
  pressDpad(event) {
    this.input.direction(this.dpadDirection(event));
  }
  /** Öffnet einen wiederholbaren Debugraum mit benötigten Vorbedingungen. @param {string} id Raumkennung. */
  debug(id) {
    this.audio.unlock(); this.audio.stop(); this.bootRun++; this.display.cancelFade();
    this.device.cartridge.state.slot = 'seated'; this.device.cartridge.state.contactsFault = false;
    this.device.setPower(true); this.phase = 'on'; this.cartridge.open = false; this.device.setView('front');
    if (id === 'lcd-noise') return this.debugNoise();
    this.game.reset(); this.game.mode = 'world'; this.game.debugging=true;
    if (id === 'steam') this.game.inventory.push('Runenkupplung');
    if (id === 'storage') this.game.flags.hallPowered = true;
    if (id.startsWith('quell-')) { this.game.inventory.push('Ast'); this.game.flags.sourceDrained=true; }
    this.game.travel(id); this.ui.sync(); this.request();
  }
  /** Erzwingt den Kontaktfehler unabhängig vom Zufallsstart. */
  debugNoise() {
    this.device.cartridge.state.contactsFault = true;
    this.phase = 'fault';
    this.announce('Debug: LCD-Rauschen aktiv. Ausschalten oder Cartridge-Kontakte durchpusten.');
    this.ui.sync(); this.request();
  }
}
