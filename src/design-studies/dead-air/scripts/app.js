/**
 * @file Interaktive Rundfunkkonsole für DEAD//AIR.
 * @description Steuert die fotografische Szene, den analogen FM-Frequenzregler,
 * Kamera, Wiedergabe, Licht und ereignisgesteuerte Story-Artefakte.
 * @author Benjamin Bennewitz
 */

import { drawGate, PORTAL_REVEAL_END_MS } from './gate-visual.js';
import { soundscape } from './soundscape.js';
import { Investigation } from './investigation.js';
import { Ending } from './ending.js';
import { sampleRelayWave, isSignalAligned } from './signal-patterns.js';

/** @typedef {'normal' | 'interference' | 'unknown' | 'voice' | 'relayA' | 'relayB' | 'relayC' | 'warning' | 'stranger'} SignalState */
/** @typedef {'artwork' | 'video' | 'local'} SceneSource */
/** @typedef {'routine' | 'message-found' | 'morse-active' | 'windows-event' | 'frequency-scan' | 'transmission-ready' | 'relays-linked' | 'synchronized' | 'warning-received' | 'rescue-standby' | 'signal-isolated' | 'final-lock' | 'final-triangulation' | 'final-opening' | 'final-open' | 'final-isolated'} StoryStage */

/** Fest definierte Frequenzen und ihre Bildstörung. */
const CHANNELS = Object.freeze({
  stranger: { frequency: 90.2, channel: '00', reception: 17, interference: 48, label: 'UNIDENTIFIED CARRIER' },
  normal: { frequency: 87.6, channel: '01', reception: 76, interference: 15, label: 'STABLE FEED' },
  interference: { frequency: 91.3, channel: '02', reception: 38, interference: 60, label: 'SIGNAL DRIFT' },
  unknown: { frequency: 103.7, channel: '03', reception: 8, interference: 91, label: 'SOURCE UNKNOWN' },
  voice: { frequency: 96.4, channel: '04', reception: 24, interference: 63, label: 'VOICE CARRIER' },
  relayA: { frequency: 88.9, channel: '05', reception: 64, interference: 24, label: 'RELAY / A' },
  relayB: { frequency: 99.1, channel: '06', reception: 71, interference: 29, label: 'RELAY / B' },
  relayC: { frequency: 106.2, channel: '07', reception: 58, interference: 33, label: 'RELAY / C' },
  warning: { frequency: 102.4, channel: '08', reception: 12, interference: 82, label: 'WEAK CARRIER' },
});

/** Relaiskennungen mit absichtlich nur grob angegebenen Suchbereichen. */
const RELAYS = Object.freeze([
  { id: 'A', channel: 'relayA', frequency: CHANNELS.relayA.frequency, band: '88–90 MHz' },
  { id: 'B', channel: 'relayB', frequency: CHANNELS.relayB.frequency, band: '98–100 MHz' },
  { id: 'C', channel: 'relayC', frequency: CHANNELS.relayC.frequency, band: '105–107 MHz' },
]);
const RELAY_LINK_TOLERANCE = 0.11;
const RELAY_PING_RANGE_MHZ = 2;
const RELAY_PING_MIN_MS = 180;
const RELAY_PING_MAX_MS = 1850;
const WARNING_TUNING_TOLERANCE = 0.11;


const FM_MIN = 87.5;
const FM_MAX = 108;
const TUNING_TOLERANCE = 0.35;
const BOTTLE_APPEAR_AFTER_MS = 15_000;
const BOTTLE_GLITCH_MS = 2_000;
const CAMERA_BLACKOUT_MS = 320;
const WINDOWS_TO_SCAN_MS = 2_800;
const AUTO_SCAN_DURATION_MS = 4_800;
const FINAL_LIGHTHOUSE_PRELUDE_MS = 2_500;
const FINAL_LIGHTHOUSE_DARK_MS = 650;
const FINAL_LIGHTHOUSE_BLACKOUT_MS = 1_180;
const FINAL_LIGHTHOUSE_MISSING_MS = 1_400;
const FINAL_LIGHTHOUSE_BLACKOUT_END_MS = 1_800;
const FINAL_TRIANGULATION_MS = 2_200;
const FINAL_OPENING_MS = 6_000;
const FINAL_OPEN_END_MS = 13_000;
const FINAL_ISOLATED_MS = 6_800;
const AUTO_SCAN_POINTS = Object.freeze([
  { time: 0, frequency: 103.7 },
  { time: .24, frequency: 93.8 },
  { time: .47, frequency: 102.6 },
  { time: .76, frequency: 89.9 },
  { time: 1, frequency: CHANNELS.voice.frequency },
]);

/** Sämtliche sichtbaren UI- und Status-Texte der Microsite. */
const TRANSLATIONS = Object.freeze({
  de: {
    skip: 'Zum Empfangsbereich springen',
    back: 'ZURÜCK ZUM ARCHIV',
    eyebrow: 'NCBS / EMPFANGSSTATION 01',
    introTitle: 'LETZTE SCHICHT',
    introStart: 'EMPFANG STARTEN',
    intro: 'Die letzte Schicht verschwand nach einem Hilferuf. Das Kamerasystem ist noch aktiv.',
    tune: 'FREQUENZ EINSTELLEN',
    offAir: 'KEIN EMPFANG',
    offAirDescription: 'Nur Rauschen. Auf dieser Frequenz antwortet niemand.',
    transmitting: 'ÜBERTRAGUNG AKTIV',
    artwork: 'STATION / CAM 01',
    footage: 'KÜSTE / CAM 02',
    pause: 'PAUSE',
    resume: 'FORTSETZEN',
    soundOn: 'TON AN',
    soundOff: 'TON AUS',
    soundDisable: 'Ton ausschalten',
    soundEnable: 'Ton einschalten',
    sceneStatus: 'AKTUELLER SIGNALZUSTAND',
    imprint: 'Impressum',
    privacy: 'Datenschutz',
    credits: 'Video: Pexels ↗',
    sourceAria: 'Kamera wählen',
    topNavAria: 'Informationen, Sprache und Archiv',
    info: 'INFO',
    close: 'Schließen',
    legalNav: 'Rechtliches und Bildnachweise',
    infoDescription: 'North Coast Broadcasting System. Die Küste sendet noch immer.',
    sceneArtworkAria: 'Küstenkamera mit Leuchtturm, Sendestation, Nebel und Signalstörungen',
    sceneVideoAria: 'Küstenkamera mit felsigem Ufer, Brandung und Signalstörungen',
    examineBottle: 'Flaschenpost untersuchen',
    cameraBlocked: 'Signal unterbrochen. Kamera 01 bleibt aktiv.',
    anomalyMeter: 'Anomalieaktivität in der aktuellen Kamera',
    evidenceLog: 'AKTE / 01',
    evidenceLogAria: 'Gesicherte Flaschenpost erneut lesen',
    scanStatus: 'FREMDSTEUERUNG / SUCHLAUF',
    scanDescription: 'Der Empfänger verändert die Frequenz ohne Eingabe.',
    transmissionStatus: 'AUDIO-SIGNAL ERKANNT',
    transmissionDescription: 'Eine fremde Übertragung wurde auf 96.4 MHz empfangen.',
    transmissionButton: 'AUDIO / 001',
    transmissionButtonAria: 'Empfangene Tonübertragung 001 untersuchen',
    transmissionMeta: 'NCBS / NOTFUNK · NACHTSCHICHT',
    transmissionTitle: 'WIR SIND NOCH HIER.',
    transmissionFrequency: '96.4 MHz / AUFZEICHNUNG 001',
    transmissionTranscriptLabel: 'MITSCHRIFT / NOTFUNK 001',
    transmissionLine1: 'Hallo? Hört mich jemand? Hier ist Alex, Nachtschicht der Küstenstation. Wir sind noch hier.',
    transmissionLine2: 'Unser Notruf ist raus, aber niemand antwortet. Das Peilsystem ist ausgefallen.',
    transmissionLine3: 'Vor der Küste liegen drei Relaisbojen. Wenn ihre Signale wieder verbunden sind, kann uns die Küstenwache finden. Bitte versucht das. Wir bleiben auf Empfang.',
    transmissionFooter: 'SENDERKENNUNG: NCBS · NICHT VERIFIZIERT',
    transmissionReceivedAnnouncement: 'Neue Tonübertragung auf 96.4 Megahertz empfangen.',
    transmissionPlayingAnnouncement: 'Tonübertragung 001 wird abgespielt.',
    transmissionBlockedAnnouncement: 'Wiedergabe blockiert. AUDIO / 001 auswählen, um die Aufnahme zu starten.',
    transmissionErrorAnnouncement: 'Tonübertragung konnte nicht geladen werden. Bitte erneut versuchen.',
    transmissionFinishedAnnouncement: 'Ende der Tonübertragung 001.',
    transmissionPlayAction: 'AUDIO / 001 · STARTEN',
    transmissionAudioAria: 'Empfangene Funkaufnahme 001 abspielen und pausieren',
    relayButton: 'RELAIS / {count}/3',
    relayButtonAria: 'Status der drei Küstenrelais öffnen',
    relayLogMeta: 'NCBS / PEILSYSTEM · STATUS',
    relayLogTitle: 'RELAISPROTOKOLL',
    relayLogDescription: 'Drei Signale außerhalb der Station. Die Trägerfrequenzen sind nicht mehr gespeichert. Nur die Suchbereiche sind noch lesbar.',
    relayColumn: 'RELAIS',
    relayBand: 'SUCHBEREICH',
    relayMissing: 'KEIN LINK',
    relayConnected: 'VERBUNDEN',
    relayLinkAction: 'VERBINDEN',
    relayPingAction: 'SENDEN',
    relayPingReady: 'BEREIT / CAM 02',
    relayPingCamera: 'CAM 02 WÄHLEN',
    relayPingSending: 'PING LÄUFT …',
    relayPingNone: 'KEIN ECHO',
    relayPingEcho: 'ECHO NACH {seconds} s',
    relayPingCarrier: 'TRÄGER / {id} · {seconds} s',
    relayCameraRequired: 'CAM 02',
    relayFinished: 'ALLE DREI RELAIS VERBUNDEN. PEILUNG NOCH NICHT SYNCHRON.',
    relayUnfinished: 'PEILUNG UNVOLLSTÄNDIG',
    relayLinkAnnouncement: 'Relais {id} verbunden. {count} von 3 Signalen wiederhergestellt.',
    relayDiscovered: 'Relais {id}: Trägersignal empfangen. CAM 02 zum Verbinden wählen.',
    relayBeaconAria: 'Relaisboje {id} in der Küstenkamera untersuchen',
    relaySelectedAnnouncement: 'Relais {id}. Protokoll geöffnet.',
    archiveLabel: 'EMPFANGENE DATEN / ARCHIV',
    transmission2Button: 'AUDIO / 002',
    transmission2ButtonAria: 'Neue Funkaufnahme 002 erneut hören',
    transmission2Meta: 'NCBS / NOTFUNK · NACHTSCHICHT',
    transmission2Title: 'DIE PEILUNG IST NOCH NICHT STABIL.',
    transmission2Frequency: '96.4 MHz / AUFZEICHNUNG 002',
    transmission2TranscriptLabel: 'MITSCHRIFT / NOTFUNK 002',
    transmission2Line1: '…Alex hier. Ich sehe die drei Bojen wieder. Gut. Wirklich gut.',
    transmission2Line2: 'Aber wir bekommen noch keinen Standort. Die Zeitstempel laufen auseinander. Relais A ist die Referenz.',
    transmission2Line3: 'Legt die anderen beiden Spuren auf denselben Takt. Dann kann die Peilung greifen. Ich bleibe auf Empfang.',
    transmission2Footer: 'SENDERKENNUNG: NCBS · QUELLE NICHT BESTÄTIGT',
    transmission2Announcement: 'Neue Funkaufnahme 002 empfangen. Signalabgleich jetzt verfügbar.',
    syncButton: 'SYNC / 3',
    syncButtonAria: 'Synchronisation der drei Relais öffnen',
    syncMeta: 'NCBS / PEILUNG · PHASENABGLEICH',
    syncTitle: 'SIGNALABGLEICH',
    syncDescription: 'Richte den ersten Klick jeder gespeicherten Dreierkennung am ersten Klick von A aus. Die Abstände innerhalb der Gruppe unterscheiden echte Kennungen von Störimpulsen. A bleibt die Referenz.',
    syncLabelB: 'RELAIS B / ZEITVERSATZ',
    syncLabelC: 'RELAIS C / ZEITVERSATZ',
    syncGraphAria: 'Drei Klickspuren mit Störgruppen. Gespeicherte Pausen: A 140 und 290, B 430 und 140, C 290 und 430 Millisekunden. Identifiziere die echte Gruppe und richte ihren Beginn an A aus.',
    syncPending: 'KENNUNGEN VERSETZT · ECHOPAUSEN VERGLEICHEN',
    syncAligned: 'KENNUNGEN AUSGERICHTET · KALIBRIERUNG MÖGLICH',
    syncComplete: 'PEILUNG SYNCHRONISIERT · RÜCKKANAL BEREIT',
    syncAction: 'PEILUNG KALIBRIEREN',
    syncActionDone: 'SYNCHRONISIERT',
    syncAnnouncement: 'Alle drei Relais synchronisiert. Der Rückkanal kann vorbereitet werden.',

    warningRecordingButton: 'AUDIO / 003 · STARTEN',
    warningRecordingAria: 'Gestörte Tonübertragung auf 102.4 MHz auf CAM 01 starten',
    warningTranscriptButton: 'MITSCHRIFT / 003',
    warningTranscriptAria: 'Unvollständige Mitschrift des empfangenen Signals öffnen',
    warningMeta: 'NCBS / EMPFANG UNBEKANNT',
    warningTitle: 'UNVOLLSTÄNDIGE ÜBERTRAGUNG',
    warningFrequency: '102.4 MHz / SIGNALFRAGMENT 003',
    warningTranscriptLabel: 'MITSCHRIFT / NUR BRUCHSTÜCKE LESBAR',
    warningLine1: '…[RAUSCHEN] …ein… Fal— …[SIGNALABBRUCH]…',
    warningLine2: '…wir… versuch— …rauszukommen… [STÖRUNG]…',
    warningLine3: '…nich— …[ÜBERLAGERT]… akti— …[VERBINDUNG ABGERISSEN]…',
    warningFooter: 'QUELLE UNBEKANNT · MITSCHRIFT UNVOLLSTÄNDIG',
    warningReceived: 'Schwaches Sprachsignal auf 102.4 MHz empfangen.',
    warningPlaying: 'Fragmentierte Übertragung auf 102.4 MHz wird empfangen.',
    warningFinished: 'Signalfragment vollständig empfangen.',
    warningBlocked: 'Wiedergabe blockiert. Signal erneut auf 102.4 MHz starten.',
    decisionMeta: 'NCBS / VERBINDUNGSPROTOKOLL',
    decisionEyebrow: 'RÜCKKANAL / MANUELLE FREIGABE',
    decisionTitle: 'WAS SOLL ICH TUN?',
    decisionDescription: 'Die gestörte Übertragung ist abgebrochen. Alex wartet weiterhin auf das Rücksignal.',
    decisionRescueTitle: 'DEM SIGNAL WEITER FOLGEN',
    decisionRescueDescription: 'Den Rückkanal für Alex und die vermisste Schicht öffnen.',
    decisionIsolateTitle: 'RÜCKKANAL ISOLIEREN',
    decisionIsolateDescription: 'Den Sender abschalten und keine Verbindung herstellen.',
    decisionNote: 'DIESE ENTSCHEIDUNG KANN NICHT RÜCKGÄNGIG GEMACHT WERDEN.',
    decisionRescueStatus: 'RÜCKKANAL FREIGEGEBEN · SENDEIMPULS NOCH AUSSTEHEND',
    decisionIsolateStatus: 'RÜCKKANAL ISOLIERT · KEINE SENDUNG',
    decisionRouteAnnouncement: 'Entscheidung endgültig gespeichert.',
    uplinkMeta: 'NCBS / NOTFUNK · RÜCKKANAL',
    uplinkDescription: 'Drei Peilpunkte verbunden. Phasenlage stabil. Ortungsimpuls kann gesendet werden.',
    uplinkAction: 'RETTUNGSIMPULS SENDEN',
    uplinkAria: 'Einmaligen Ortungsimpuls an die Küstenwache senden und die Finalsequenz auslösen',
    uplinkPending: 'SENDEKANAL BEREIT · FREIGABE AUSSTEHEND',
    finalLock: 'RÜCKKANAL AKTIV · VERBINDUNG WIRD AUFGEBAUT',
    finalTriangle: 'DREI PEILPUNKTE AKTIV · UNBEKANNTE GEOMETRIE',
    finalOpening: 'QUELLE UNBEKANNT · SIGNALSTÄRKE AUSSERHALB DES MESSBEREICHS',
    finalOpen: 'VERBINDUNG OFFEN · HERKUNFT UNBEKANNT',
    finalIsolating: 'RÜCKKANAL GETRENNT · RELAIS WERDEN ABGESCHALTET',
    finalSealed: 'SENDER STUMM · KEIN RÜCKSIGNAL',
    finalLockedCamera: 'Kamerawechsel fehlgeschlagen. Küstenfeed bleibt erzwungen.',
    finalOpenCaption: 'VERBINDUNG OFFEN',
    finalSealedCaption: 'KEIN TRÄGER',
    finalMonitorLock: 'NOTSIGNAL AKTIV',
    finalMonitorOpen: 'FREMDES SIGNAL',
    finalMonitorSealed: 'ÜBERTRAGUNG BEENDET',
    finalReceiverOpen: 'INTERFERENZ / MAX',
    finalReceiverSealed: 'KEIN TRÄGER',
    finalStartAnnouncement: 'Rettungsimpuls gesendet. Kamera zwei übernimmt die Übertragung.',
    finalEndAnnouncement: 'Signalquelle unbekannt. Verbindung bleibt geöffnet.',
    finalSealedAnnouncement: 'Rückkanal isoliert. Der Sender ist verstummt.',
    messageMeta: 'FUNDSTÜCK / 001',
    messageSubtitle: 'FUNDSTÜCK / FLASCHENPOST',
    messageTitle: 'EINE MINUTE FEHLT.',
    messageBody1: 'Der Mitschnitt endet zu früh. Nach dem Hilferuf lief das Band noch weiter.',
    messageBody2: 'Ich habe den Rest nur einmal gehört. Am Rand des Protokolls steht eine Kennung: 91 / 3.',
    messageBody3: 'Das Licht am Mast blinkt nicht wegen einer Störung. Vielleicht findet sich dort eine Antwort darauf, wohin sie verschwunden sind.',
    messageFooter: 'KEIN DATUM · KEINE UNTERSCHRIFT',
    stateDescriptions: {
      stranger: 'Ein schmaler Fremdträger. Atem und mechanische Klicks dringen durch das Rauschen.',
      normal: 'Ein gewöhnlicher Küstenfeed. Leuchtfeuer und Wetter bleiben stabil.',
      interference: 'Die Übertragung verliert an Klarheit. Nebel und Störungen nehmen zu.',
      unknown: 'Eine fremde Frequenz greift in die Übertragung ein. Der Ursprung ist unbekannt.',
      voice: 'Eine unbekannte Stimme wurde auf dieser Frequenz aufgezeichnet.',
      relayA: 'Ein schwacher Relaisträger. Die Positionsdaten sind noch nicht verifiziert.',
      relayB: 'Ein schwacher Relaisträger. Die Positionsdaten sind noch nicht verifiziert.',
      relayC: 'Ein schwacher Relaisträger. Die Positionsdaten sind noch nicht verifiziert.',
      warning: 'Ein schwaches Sprachsignal überlagert die Station.',
    },
  },
  en: {
    skip: 'Skip to receiver',
    back: 'BACK TO ARCHIVE',
    eyebrow: 'NCBS / RECEIVER STATION 01',
    introTitle: 'LAST SHIFT',
    introStart: 'START RECEIVING',
    intro: 'The last shift vanished after a distress call. The camera system is still active.',
    tune: 'TUNE FREQUENCY',
    offAir: 'NO CARRIER',
    offAirDescription: 'Only static. No one answers on this frequency.',
    transmitting: 'TRANSMISSION ACTIVE',
    artwork: 'STATION / CAM 01',
    footage: 'COAST / CAM 02',
    pause: 'PAUSE',
    resume: 'RESUME',
    soundOn: 'SOUND ON',
    soundOff: 'SOUND OFF',
    soundDisable: 'Mute sound',
    soundEnable: 'Enable sound',
    sceneStatus: 'CURRENT SIGNAL STATE',
    imprint: 'Legal notice',
    privacy: 'Privacy',
    credits: 'Footage: Pexels ↗',
    sourceAria: 'Choose camera',
    topNavAria: 'Information, language and archive',
    info: 'INFO',
    close: 'Close',
    legalNav: 'Legal information and image credits',
    infoDescription: 'North Coast Broadcasting System. The coast is still transmitting.',
    sceneArtworkAria: 'Coastal station camera with a lighthouse, transmitter, fog and interference',
    sceneVideoAria: 'Coastal camera with a rocky shoreline, rolling waves and signal interference',
    examineBottle: 'Inspect the message bottle',
    cameraBlocked: 'Signal lost. Camera 01 remains active.',
    anomalyMeter: 'Anomaly activity in the current camera',
    evidenceLog: 'FILE / 01',
    evidenceLogAria: 'Read the recovered message again',
    scanStatus: 'REMOTE OVERRIDE / SCANNING',
    scanDescription: 'The receiver is tuning itself without input.',
    transmissionStatus: 'VOICE SIGNAL DETECTED',
    transmissionDescription: 'An unidentified transmission was received on 96.4 MHz.',
    transmissionButton: 'AUDIO / 001',
    transmissionButtonAria: 'Inspect incoming voice transmission 001',
    transmissionMeta: 'NCBS / DISTRESS RADIO · NIGHT SHIFT',
    transmissionTitle: 'WE ARE STILL HERE.',
    transmissionFrequency: '96.4 MHz / RECORDING 001',
    transmissionTranscriptLabel: 'TRANSCRIPT / DISTRESS RADIO 001',
    transmissionLine1: 'Hello? Can anybody hear me? This is Alex, night shift at North Coast Station. We are still here.',
    transmissionLine2: 'We sent the distress call, but nobody answered. The direction finder is down.',
    transmissionLine3: 'There are three relay buoys offshore. If their signals are linked again, the coast guard can find us. Please try. We will keep listening.',
    transmissionFooter: 'SENDER ID: NCBS · UNVERIFIED',
    transmissionReceivedAnnouncement: 'New voice transmission received on 96.4 megahertz.',
    transmissionPlayingAnnouncement: 'Voice transmission 001 is playing.',
    transmissionBlockedAnnouncement: 'Playback blocked. Select AUDIO / 001 to start the recording.',
    transmissionErrorAnnouncement: 'Voice recording could not be loaded. Please try again.',
    transmissionFinishedAnnouncement: 'End of voice transmission 001.',
    transmissionPlayAction: 'AUDIO / 001 · PLAY',
    transmissionAudioAria: 'Play and pause received radio recording 001',
    relayButton: 'RELAY / {count}/3',
    relayButtonAria: 'Open the status of the three coastal relays',
    relayLogMeta: 'NCBS / DIRECTION FINDER · STATUS',
    relayLogTitle: 'RELAY LOG',
    relayLogDescription: 'Three signals beyond the station. Their carrier frequencies are missing from the log. Only approximate search bands remain.',
    relayColumn: 'RELAY',
    relayBand: 'SEARCH BAND',
    relayMissing: 'NO LINK',
    relayConnected: 'CONNECTED',
    relayLinkAction: 'LINK',
    relayPingAction: 'SEND',
    relayPingReady: 'READY / CAM 02',
    relayPingCamera: 'SELECT CAM 02',
    relayPingSending: 'PING ACTIVE …',
    relayPingNone: 'NO ECHO',
    relayPingEcho: 'ECHO IN {seconds} s',
    relayPingCarrier: 'CARRIER / {id} · {seconds} s',
    relayCameraRequired: 'CAM 02',
    relayFinished: 'ALL THREE RELAYS CONNECTED. BEARING NOT SYNCHRONIZED.',
    relayUnfinished: 'BEARING INCOMPLETE',
    relayLinkAnnouncement: 'Relay {id} connected. {count} of 3 signals restored.',
    relayDiscovered: 'Relay {id}: carrier signal received. Switch to CAM 02 to establish link.',
    relayBeaconAria: 'Inspect relay buoy {id} in the shoreline camera',
    relaySelectedAnnouncement: 'Relay {id}. Log opened.',
    archiveLabel: 'RECEIVED DATA / ARCHIVE',
    transmission2Button: 'AUDIO / 002',
    transmission2ButtonAria: 'Replay newly received voice transmission 002',
    transmission2Meta: 'NCBS / DISTRESS RADIO · NIGHT SHIFT',
    transmission2Title: 'THE BEARING STILL WON’T HOLD.',
    transmission2Frequency: '96.4 MHz / RECORDING 002',
    transmission2TranscriptLabel: 'TRANSCRIPT / DISTRESS RADIO 002',
    transmission2Line1: '…Alex here. I can see all three buoys again. Good. That’s really good.',
    transmission2Line2: 'But we still have no position. Their timestamps keep slipping. Relay A is our reference.',
    transmission2Line3: 'Bring the other two traces into the same timing. Then we should get a bearing. I’ll stay on this channel.',
    transmission2Footer: 'SENDER ID: NCBS · SOURCE NOT VERIFIED',
    transmission2Announcement: 'New recording 002 received. Signal alignment now available.',
    syncButton: 'SYNC / 3',
    syncButtonAria: 'Open synchronization for all three relays',
    syncMeta: 'NCBS / DIRECTION FINDER · PHASE ALIGNMENT',
    syncTitle: 'SIGNAL ALIGNMENT',
    syncDescription: 'Align the first click of each stored three-click ID with the first click of A. Gaps within the group distinguish real IDs from interference. A remains the reference.',
    syncLabelB: 'RELAY B / TIME OFFSET',
    syncLabelC: 'RELAY C / TIME OFFSET',
    syncGraphAria: 'Three click traces with interference groups. Stored gaps: A 140 and 290, B 430 and 140, C 290 and 430 milliseconds. Identify the real group and align its first click with A.',
    syncPending: 'SIGNATURES OFFSET · COMPARE ECHO GAPS',
    syncAligned: 'SIGNATURES ALIGNED · CALIBRATION AVAILABLE',
    syncComplete: 'BEARING SYNCHRONIZED · RETURN CHANNEL STANDBY',
    syncAction: 'CALIBRATE BEARING',
    syncActionDone: 'SYNCHRONIZED',
    syncAnnouncement: 'All three relays synchronized. Return channel can be prepared.',

    warningRecordingButton: 'AUDIO / 003 · PLAY',
    warningRecordingAria: 'Play disrupted transmission on 102.4 MHz on CAM 01',
    warningTranscriptButton: 'TRANSCRIPT / 003',
    warningTranscriptAria: 'Open transcript of the received signal fragment',
    warningMeta: 'NCBS / UNIDENTIFIED RECEPTION',
    warningTitle: 'INCOMPLETE TRANSMISSION',
    warningFrequency: '102.4 MHz / SIGNAL FRAGMENT 003',
    warningTranscriptLabel: 'TRANSCRIPT / FRAGMENTS ONLY',
    warningLine1: '…[STATIC] …a… trap— …[SIGNAL LOST]…',
    warningLine2: '…we’re… trying… to get out… [INTERFERENCE]…',
    warningLine3: '…don’— …[OVERLAPPING]… activ— …[CONNECTION LOST]…',
    warningFooter: 'UNKNOWN ORIGIN · INCOMPLETE TRANSCRIPT',
    warningReceived: 'Weak voice carrier detected on 102.4 MHz.',
    warningPlaying: 'Fragmented transmission received on 102.4 MHz.',
    warningFinished: 'Signal fragment fully received.',
    warningBlocked: 'Playback blocked. Start the signal manually on 102.4 MHz.',
    decisionMeta: 'NCBS / CONNECTION PROTOCOL',
    decisionEyebrow: 'RETURN CHANNEL / MANUAL AUTHORIZATION',
    decisionTitle: 'WHAT SHOULD I DO?',
    decisionDescription: 'The broken transmission has ended. Alex is still waiting for the return signal.',
    decisionRescueTitle: 'CONTINUE FOLLOWING THE SIGNAL',
    decisionRescueDescription: 'Prepare the return channel for Alex and the missing night shift.',
    decisionIsolateTitle: 'ISOLATE RETURN CHANNEL',
    decisionIsolateDescription: 'Shut down the transmitter and establish no connection.',
    decisionNote: 'THIS DECISION CANNOT BE UNDONE.',
    decisionRescueStatus: 'RETURN CHANNEL AUTHORIZED · PULSE NOT YET SENT',
    decisionIsolateStatus: 'RETURN CHANNEL ISOLATED · NO TRANSMISSION',
    decisionRouteAnnouncement: 'Choice permanently recorded.',
    uplinkMeta: 'NCBS / EMERGENCY · RETURN CHANNEL',
    uplinkDescription: 'Three bearings linked. Phase alignment stable. Location pulse ready to transmit.',
    uplinkAction: 'TRANSMIT RESCUE PULSE',
    uplinkAria: 'Transmit one-time rescue location pulse and start the final sequence',
    uplinkPending: 'RETURN CHANNEL READY · AUTHORIZATION REQUIRED',
    finalLock: 'RETURN CHANNEL ACTIVE · ESTABLISHING CONNECTION',
    finalTriangle: 'THREE BEARINGS ACTIVE · UNKNOWN GEOMETRY',
    finalOpening: 'UNKNOWN SOURCE · SIGNAL EXCEEDS MEASUREMENT RANGE',
    finalOpen: 'CONNECTION OPEN · SOURCE UNKNOWN',
    finalIsolating: 'RETURN CHANNEL DISCONNECTED · RELAYS GOING OFFLINE',
    finalSealed: 'TRANSMITTER SILENT · NO RETURN CARRIER',
    finalLockedCamera: 'Camera switch failed. Shoreline feed forced.',
    finalOpenCaption: 'CONNECTION OPEN',
    finalSealedCaption: 'NO CARRIER',
    finalMonitorLock: 'EMERGENCY SIGNAL ACTIVE',
    finalMonitorOpen: 'UNKNOWN CARRIER',
    finalMonitorSealed: 'TRANSMISSION ENDED',
    finalReceiverOpen: 'INTERFERENCE / MAX',
    finalReceiverSealed: 'NO CARRIER',
    finalStartAnnouncement: 'Rescue pulse transmitted. Camera two now has the feed.',
    finalEndAnnouncement: 'Unknown carrier detected. Connection remains open.',
    finalSealedAnnouncement: 'Return channel isolated. Transmitter is silent.',
    messageMeta: 'RECOVERED OBJECT / 001',
    messageSubtitle: 'RECOVERED / MESSAGE BOTTLE',
    messageTitle: 'ONE MINUTE IS MISSING.',
    messageBody1: 'The recording ends too soon. The tape kept running after the distress call.',
    messageBody2: 'I only heard the rest once. A code was written in the margin of the log: 91 / 3.',
    messageBody3: 'The mast light is not blinking because of a fault. Perhaps it holds an answer to where they went.',
    messageFooter: 'NO DATE · NO SIGNATURE',
    stateDescriptions: {
      stranger: 'A narrow foreign carrier. Breath and mechanical clicks emerge from the static.',
      normal: 'An ordinary coastal feed. The beacon and weather remain stable.',
      interference: 'The transmission loses clarity. Fog and interference increase.',
      unknown: 'An unknown frequency interferes with the transmission. Its origin is unclear.',
      voice: 'An unidentified voice was recorded on this frequency.',
      relayA: 'A weak relay carrier. Position data is not yet verified.',
      relayB: 'A weak relay carrier. Position data is not yet verified.',
      relayC: 'A weak relay carrier. Position data is not yet verified.',
      warning: 'A weak voice signal is bleeding into the station.',
    },
  },
});

const root = document.documentElement;
const coastVideo = document.querySelector('#coast-video');
const stateDescription = document.querySelector('#state-description');
const languageToggle = document.querySelector('#language-toggle');
const pauseButton = document.querySelector('#pause-toggle');
const pauseLabel = document.querySelector('#pause-label');
const soundToggle = document.querySelector('#sound-toggle');
const infoDialog = document.querySelector('#info-dialog');
const introDialog = document.querySelector('#intro-dialog');
const infoToggle = document.querySelector('#info-toggle');
const frequencyInput = document.querySelector('#frequency-tuning');
const messageDialog = document.querySelector('#message-dialog');
const messageClose = document.querySelector('#message-close');
const bottleArtifact = document.querySelector('#bottle-artifact');
const evidenceLog = document.querySelector('#evidence-log');
const cameraBlackout = document.querySelector('#camera-blackout');
const cameraStatus = document.querySelector('#camera-status');
const anomalyMeter = document.querySelector('#anomaly-meter');
const anomalyBars = [...document.querySelectorAll('.readout-bars i')];
const transmissionToggle = document.querySelector('#transmission-toggle');
const transmission2Toggle = document.querySelector('#transmission-2-toggle');
const transmissionDialog = document.querySelector('#transmission-dialog');
const transmissionClose = document.querySelector('#transmission-close');
const transmissionAudio = document.querySelector('#transmission-audio');
const receiverEventStatus = document.querySelector('#receiver-event-status');
const relayToggle = document.querySelector('#relay-toggle');
const relayDialog = document.querySelector('#relay-dialog');
const relayClose = document.querySelector('#relay-close');
const relayLink = document.querySelector('#relay-link');
const relayProbe = document.querySelector('#relay-probe');
const relayPingStatus = document.querySelector('#relay-ping-status');
const relayBeacons = [...document.querySelectorAll('.scene__relay-beacon')];
const syncToggle = document.querySelector('#sync-toggle');
const syncDialog = document.querySelector('#sync-dialog');
const syncClose = document.querySelector('#sync-close');
const syncOffsetB = document.querySelector('#sync-offset-b');
const syncOffsetC = document.querySelector('#sync-offset-c');
const syncCommit = document.querySelector('#sync-commit');
const warningRecordingToggle = document.querySelector('#warning-recording-toggle');
const warningTranscriptToggle = document.querySelector('#warning-transcript-toggle');
const decisionResult = document.querySelector('#decision-result');
const decisionDialog = document.querySelector('#decision-dialog');
const decisionRescue = document.querySelector('#decision-rescue');
const decisionIsolate = document.querySelector('#decision-isolate');
const uplinkPanel = document.querySelector('#uplink-panel');
const uplinkAction = document.querySelector('#uplink-action');
const gateCanvas = document.querySelector('#gate-canvas');
const devConsole = document.querySelector('#dev-console');
const finalCaption = document.querySelector('#final-caption');

/** Laufzeitzustand der Microsite ohne unnötige Persistenz. */
const scene = {
  channel: /** @type {SignalState | null} */ ('normal'),
  frequency: CHANNELS.normal.frequency,
  source: /** @type {SceneSource} */ ('artwork'),
  language: 'de',
  paused: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  soundMuted: false,
  cameraBlackoutTimerId: 0,
  anomaly: {
    activeMs: 0,
    displayedLevel: -1,
    appearanceAtMs: 0,
    morseStartedAtMs: 0,
    windowsStartedAtMs: 0,
    transmissionStartedAtMs: 0,
  },
  autoScan: {
    startedAtMs: 0,
  },
  relays: {
    unlocked: false,
    linked: new Set(),
    ping: {
      timeoutId: 0,
      inFlight: false,
      verifiedId: null,
      result: 'idle',
      responseMs: 0,
      responseId: null,
      receivedAtMs: 0,
    },
  },
  audio: {
    blocked: false,
    resumeAfterPause: false,
    resumeAfterVisibility: false,
    requestId: 0,
    currentRecording: '001',
    secondReceived: false,
    thirdReceived: false,
  },
  sync: { completed: false },
  // choice === null ist der unentdeckte Standardweg (Phase 06: schlechtes Ende).
  // Eine getroffene Entscheidung kann innerhalb der Spielsitzung nicht geändert werden.
  warning: { found: false, choice: null, playbackCompleted: false },
  finale: {
    mode: null,
    phase: 'idle',
    startedAtMs: 0,
    animationFrameId: 0,
    lastFrameAtMs: 0,
  },
  story: {
    stage: /** @type {StoryStage} */ ('routine'),
    elapsedMs: 0,
    lastTick: 0,
    bottleVisible: false,
    bottleOpened: false,
    bottleCollected: false,
    bottleMaterializing: false,
    bottleMaterialized: false,
    clockTimeoutId: 0,
    revealTimeoutId: 0,
  },
};

/** Gemeinsame Hauptuhr: Modale Hinweise halten Ereignisse an. */
function isStoryRunning() {
  return !scene.paused && !document.hidden && !document.querySelector('dialog[open]:not(#ending-dialog)');
}

const investigation = new Investigation({
  scene, root, soundscape, isRunning: isStoryRunning,
  refreshFrequency: () => setFrequency(scene.frequency),
});

const ending = new Ending({
  scene, investigation, soundscape,
  onLanguage: toggleLanguage, onPause: togglePause, onMute: toggleSound,
  onTakeover: () => {
    cancelAnimationFrame(scene.finale.animationFrameId);
    scene.finale.animationFrameId = 0;
    coastVideo.pause();
  },
});

/** Ein gemeinsamer Sprachwechsel für Empfangsgerät und Abschlussansicht. */
function toggleLanguage() {
  const wasPlaying = !transmissionAudio.paused;
  scene.language = scene.language === 'de' ? 'en' : 'de';
  updateTranslations();
  updateSoundLabel();
  ending.render();
  if (scene.relays.unlocked) {
    if (wasPlaying && !ending.active && (scene.audio.currentRecording !== '003' || canReceiveWarning())) {
      void playTransmission({ restart: true });
    } else {
      transmissionAudio.pause();
      transmissionAudio.setAttribute('src', `assets/transmission-${scene.audio.currentRecording}-${scene.language}.mp3`);
      transmissionAudio.load();
    }
  }
}

/** Synchronisiert die übersetzten Texte ohne doppelte Markup-Strukturen. */
function updateTranslations() {
  const texts = TRANSLATIONS[scene.language];
  root.lang = scene.language;

  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.dataset.i18n;
    if (typeof texts[key] === 'string') {
      element.textContent = texts[key];
    }
  });

  document.querySelectorAll('[data-i18n-aria]').forEach(element => {
    const key = element.dataset.i18nAria;
    if (typeof texts[key] === 'string') {
      element.setAttribute('aria-label', texts[key]);
    }
  });

  infoToggle.setAttribute('aria-label', scene.language === 'de' ? 'Informationen und Rechtliches' : 'Information and legal notices');
  infoToggle.title = infoToggle.getAttribute('aria-label');
  stateDescription.textContent = getStateDescription(texts);
  languageToggle.textContent = scene.language === 'de' ? 'EN' : 'DE';
  languageToggle.setAttribute('aria-label', scene.language === 'de' ? 'Switch to English' : 'Zu Deutsch wechseln');
  document.querySelector('#top-nav').setAttribute('aria-label', texts.topNavAria);
  document.querySelector('#source-switch').setAttribute('aria-label', texts.sourceAria);

  bottleArtifact.setAttribute('aria-label', texts.examineBottle);
  evidenceLog.textContent = texts.evidenceLog;
  evidenceLog.setAttribute('aria-label', texts.evidenceLogAria);
  messageClose.setAttribute('aria-label', texts.close);
  anomalyMeter.setAttribute('aria-label', texts.anomalyMeter);
  transmissionToggle.textContent = scene.audio.blocked && scene.audio.currentRecording === '001' ? texts.transmissionPlayAction : texts.transmissionButton;
  transmission2Toggle.textContent = scene.audio.blocked && scene.audio.currentRecording === '002' ? (scene.language === 'de' ? 'AUDIO / 002 · STARTEN' : 'AUDIO / 002 · PLAY') : texts.transmission2Button;
  transmission2Toggle.setAttribute('aria-label', texts.transmission2ButtonAria);
  document.querySelector('#archive-label').textContent = texts.archiveLabel;
  document.querySelector('.receiver__archive').setAttribute('aria-label', texts.archiveLabel);
  transmissionToggle.setAttribute('aria-label', texts.transmissionButtonAria);
  transmissionClose.setAttribute('aria-label', texts.close);
  transmissionAudio.setAttribute('aria-label', texts.transmissionAudioAria);
  relayToggle.setAttribute('aria-label', texts.relayButtonAria);
  relayClose.setAttribute('aria-label', texts.close);
  document.querySelector('#relay-meta').textContent = texts.relayLogMeta;
  document.querySelector('#relay-title').textContent = texts.relayLogTitle;
  document.querySelector('#relay-description').textContent = texts.relayLogDescription;
  document.querySelector('#relay-column-label').textContent = texts.relayColumn;
  document.querySelector('#relay-band-label').textContent = texts.relayBand;
  relayBeacons.forEach(beacon => {
    beacon.setAttribute('aria-label', texts.relayBeaconAria.replace('{id}', beacon.dataset.relay));
  });
  refreshRelayUI();
  renderTransmission();
  updateSyncUI();
  updateWarningUI();
  updateUplinkUI();
  updateFinaleUI();
  document.querySelector('#message-meta').textContent = texts.messageMeta;
  document.querySelector('#message-subtitle').textContent = texts.messageSubtitle;
  document.querySelector('#message-title').textContent = texts.messageTitle;
  document.querySelector('#message-body-1').textContent = texts.messageBody1;
  document.querySelector('#message-body-2').textContent = texts.messageBody2;
  document.querySelector('#message-body-3').textContent = texts.messageBody3;
  document.querySelector('#message-footer').textContent = texts.messageFooter;

  investigation.render();
  updateSourceDescription();
  updatePlaybackLabel();
  const label = scene.story.stage === 'frequency-scan' ? texts.scanStatus : (scene.channel ? CHANNELS[scene.channel].label : texts.offAir);
  frequencyInput.setAttribute('aria-valuetext', `${scene.frequency.toFixed(1)} MHz – ${label}`);
}

/** Liefert zum aktiven Story-Ereignis passende Empfangstexte. */
function getStateDescription(texts) {
  if (scene.finale.mode) {
    return ({ lock: texts.finalLock, triangulation: texts.finalTriangle, opening: texts.finalOpening,
      open: texts.finalOpen, isolating: texts.finalIsolating, sealed: texts.finalSealed,
      'local-ready': investigation.copy.localReady, 'local-view': investigation.copy.localFeed })[scene.finale.phase]
      ?? texts.finalLock;
  }
  if (scene.story.stage === 'frequency-scan') return texts.scanDescription;
  if (investigation.strangerSpent && Math.abs(scene.frequency - 90.2) <= .11) return investigation.copy.sourceLost;
  if (scene.warning.choice === 'isolate') return texts.decisionIsolateStatus;
  if (scene.warning.choice === 'rescue') return texts.decisionRescueStatus;
  if (scene.story.stage === 'transmission-ready' && scene.channel === 'voice') return texts.transmissionDescription;
  return scene.channel ? texts.stateDescriptions[scene.channel] : texts.offAirDescription;
}

/** Ordnet einer manuell gewählten Frequenz höchstens einen tatsächlichen Empfang zu. */
function findChannel(frequency) {
  return Object.keys(CHANNELS).find(channel => {
    // Relaiskennungen dürfen erst nach einer aktiven Ping-Antwort auftauchen.
    const relay = RELAYS.find(entry => entry.channel === channel);
    if (relay && scene.relays.ping.verifiedId !== relay.id) return false;
    return Math.abs(CHANNELS[channel].frequency - frequency)
      <= (['warning', 'stranger'].includes(channel) ? WARNING_TUNING_TOLERANCE : TUNING_TOLERANCE);
  }) ?? null;
}

/** Verhindert, dass spätere Story-Frequenzen vor ihrer Entdeckung verraten werden. */
function isChannelAvailable(channel) {
  if (channel === 'stranger') return !investigation.strangerSpent && !scene.finale.mode;
  if (channel === 'interference') return scene.story.stage !== 'routine';
  if (channel === 'unknown') return ['morse-active', 'windows-event', 'frequency-scan', 'transmission-ready', 'relays-linked'].includes(scene.story.stage);
  if (channel === 'voice') return scene.relays.unlocked || scene.story.stage === 'transmission-ready';
  if (channel === 'warning') return scene.sync.completed;
  if (['relayA', 'relayB', 'relayC'].includes(channel)) return scene.relays.unlocked;
  return true;
}

/** Invalidiert laufende Pings und alte Treffer bei jeder neuen Messposition. */
function resetRelayPing() {
  const ping = scene.relays.ping;
  window.clearTimeout(ping.timeoutId);
  ping.timeoutId = 0;
  ping.inFlight = false;
  ping.verifiedId = null;
  ping.result = 'idle';
  ping.responseMs = 0;
  ping.responseId = null;
  ping.receivedAtMs = 0;
}

/** Nur ein aktiv gepingter Träger darf verbunden werden. */
function getTunedRelay() {
  if (!scene.relays.unlocked || !scene.relays.ping.verifiedId) return null;
  return RELAYS.find(relay => relay.id === scene.relays.ping.verifiedId
    && !scene.relays.linked.has(relay.id)
    && Math.abs(scene.frequency - relay.frequency) <= RELAY_LINK_TOLERANCE) ?? null;
}

/** Eine Messung beantwortet erst nach der tatsächlichen Laufzeit eine Ping-Anfrage.
 * Weit entfernte Frequenzen antworten spät oder überhaupt nicht.
 * Die Kanalnummer wird nicht durch passives Bewegen des Reglers verraten. */
function sendRelayPing() {
  const ping = scene.relays.ping;
  if (!scene.relays.unlocked || scene.relays.linked.size === RELAYS.length
    || scene.source !== 'video' || scene.paused || scene.finale.mode || ping.inFlight) return;

  const frequency = scene.frequency;
  const nearest = RELAYS.filter(relay => !scene.relays.linked.has(relay.id))
    .map(relay => ({ relay, distance: Math.abs(frequency - relay.frequency) }))
    .sort((a, b) => a.distance - b.distance)[0];
  const insideRange = Boolean(nearest && nearest.distance <= RELAY_PING_RANGE_MHZ);
  const responseMs = insideRange
    ? Math.round(RELAY_PING_MIN_MS + smoothStep(nearest.distance / RELAY_PING_RANGE_MHZ)
      * (RELAY_PING_MAX_MS - RELAY_PING_MIN_MS))
    : RELAY_PING_MAX_MS;

  ping.inFlight = true;
  ping.result = 'sending';
  window.dispatchEvent(new CustomEvent('deadair:relayping', { detail: { frequency } }));
  ping.verifiedId = null;
  refreshRelayUI();
  ping.timeoutId = window.setTimeout(() => {
    ping.timeoutId = 0;
    if (scene.finale.mode || scene.paused || document.hidden || scene.source !== 'video'
      || Math.abs(scene.frequency - frequency) >= .05) {
      resetRelayPing();
      refreshRelayUI();
      return;
    }
    ping.inFlight = false;
    ping.responseMs = responseMs;
    ping.receivedAtMs = scene.anomaly.activeMs;
    ping.responseId = insideRange ? nearest.relay.id : null;
    ping.result = insideRange
      ? (nearest.distance <= RELAY_LINK_TOLERANCE ? 'carrier' : 'echo') : 'none';
    ping.verifiedId = ping.result === 'carrier' ? nearest.relay.id : null;
    window.dispatchEvent(new CustomEvent('deadair:relayecho', {
      detail: { frequency, responseMs, result: ping.result, relay: ping.responseId },
    }));
    if (ping.verifiedId) {
      // Freigabe des Kanalnamens erfolgt erst nach der Messung, nicht durch Tuning.
      setFrequency(frequency);
    }
    refreshRelayUI();
    updateAnomalyMeter();
  }, responseMs);
}

/** Synchronisiert alle Relaisanzeigen, ohne eine zweite Spielzustandslogik aufzubauen. */
function refreshRelayUI() {
  const texts = TRANSLATIONS[scene.language];
  const count = scene.relays.linked.size;
  relayToggle.hidden = !scene.relays.unlocked;
  relayToggle.textContent = texts.relayButton.replace('{count}', String(count));
  syncToggle.hidden = count !== RELAYS.length;
  transmission2Toggle.hidden = !scene.audio.secondReceived;
  const ping = scene.relays.ping;
  const tuned = getTunedRelay();
  relayProbe.hidden = !scene.relays.unlocked || count === RELAYS.length || Boolean(scene.finale.mode);
  relayLink.disabled = scene.paused || Boolean(scene.finale.mode) || scene.source !== 'video' || ping.inFlight;
  relayLink.textContent = tuned ? `${texts.relayLinkAction} / ${tuned.id}` : texts.relayPingAction;
  const seconds = (ping.responseMs / 1000).toLocaleString(scene.language === 'de' ? 'de-DE' : 'en-US', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
  relayPingStatus.textContent = scene.source !== 'video' ? texts.relayPingCamera
    : (ping.result === 'sending' ? texts.relayPingSending
      : ping.result === 'none' ? texts.relayPingNone
        : ping.result === 'echo' ? texts.relayPingEcho.replace('{seconds}', seconds)
          : ping.result === 'carrier' ? texts.relayPingCarrier.replace('{id}', ping.responseId)
            .replace('{seconds}', seconds) : texts.relayPingReady);

  relayBeacons.forEach(beacon => {
    const id = beacon.dataset.relay;
    const relay = RELAYS.find(entry => entry.id === id);
    beacon.hidden = !scene.relays.unlocked;
    beacon.dataset.linked = String(scene.relays.linked.has(id));
    beacon.dataset.detected = String(Boolean(tuned && tuned.id === id));
    beacon.setAttribute('aria-label', texts.relayBeaconAria.replace('{id}', id));
    if (relay) beacon.title = `RELAY ${id} · ${relay.band}`;
  });

  RELAYS.forEach(relay => {
    const linked = scene.relays.linked.has(relay.id);
    const line = document.querySelector(`#relay-row-${relay.id.toLowerCase()}`);
    line.dataset.linked = String(linked);
    line.querySelector('.relay-dialog__status').textContent = linked ? texts.relayConnected : texts.relayMissing;
  });
  document.querySelector('#relay-progress').textContent = count !== RELAYS.length
    ? `${texts.relayUnfinished} · ${count}/3`
    : (scene.sync.completed ? texts.syncComplete : texts.relayFinished);
}

/** Verbindet genau einen Träger, wenn Kamera und FM-Empfang übereinstimmen. */
function linkTunedRelay() {
  const relay = getTunedRelay();
  if (!relay || scene.source !== 'video' || scene.paused) return;

  scene.relays.linked.add(relay.id);
  resetRelayPing();
  // Ein verbundener Träger darf nicht als vermeintlich neuer Live-Fund stehen bleiben.
  setFrequency(scene.frequency);
  const count = scene.relays.linked.size;
  investigation.linked(count);
  window.dispatchEvent(new CustomEvent('deadair:relaylinked', {
    detail: { id: relay.id, frequency: relay.frequency, count },
  }));
  receiverEventStatus.textContent = TRANSLATIONS[scene.language].relayLinkAnnouncement
    .replace('{id}', relay.id).replace('{count}', String(count));
  if (count === RELAYS.length) {
    scene.story.stage = 'relays-linked';
    scene.audio.secondReceived = true;
    syncSignalVisuals();
    void playTransmission({ restart: true, recording: '002' });
    receiverEventStatus.textContent = TRANSLATIONS[scene.language].transmission2Announcement;
    window.dispatchEvent(new CustomEvent('deadair:storychanged', { detail: { stage: scene.story.stage } }));
    window.dispatchEvent(new CustomEvent('deadair:relaysrestored', { detail: { total: count } }));
  }
  refreshRelayUI();
  updateAnomalyMeter();
}

/** Öffnet die Relaisakte; Kamera und Frequenz bleiben unverändert. */
function openRelayLog(id = null) {
  if (scene.finale.mode) return;

  if (!relayDialog.open) relayDialog.showModal();
  if (id) {
    const line = document.querySelector(`#relay-row-${id.toLowerCase()}`);
    if (line) line.focus();
  }
}

/** Zeichnet die drei Signalkurven aus den tatsächlichen Reglerwerten. */
function renderSyncWaveforms() {
  const paths = [
    { id: 'a', offset: 0 },
    { id: 'b', offset: Number(syncOffsetB.value) },
    { id: 'c', offset: Number(syncOffsetC.value) },
  ];
  paths.forEach(({ id, offset }) => {
    const points = [];
    for (let x = 0; x <= 480; x += 1) {
      const y = 76 - sampleRelayWave(id.toUpperCase(), x / 480 * 3400, offset);
      points.push(`${x === 0 ? 'M' : 'L'}${x} ${y.toFixed(2)}`);
    }
    document.querySelector(`#sync-path-${id}`).setAttribute('d', points.join(' '));
  });
}

/** Gibt den manuell eingestellten Zeitversatz in Millisekunden aus. */
function formatSyncOffset(value) {
  const number = Number(value);
  return `${number > 0 ? '+' : number < 0 ? '−' : ''}${Math.abs(number)} ms`;
}

/** Synchronisiert Status, Barrierefreiheit und Abschlussschaltfläche der Peilung. */
function updateSyncUI() {
  const texts = TRANSLATIONS[scene.language];
  const aligned = isSignalAligned('B', syncOffsetB.value) && isSignalAligned('C', syncOffsetC.value);
  document.querySelector('#sync-meta').textContent = texts.syncMeta;
  document.querySelector('#sync-title').textContent = texts.syncTitle;
  document.querySelector('#sync-description').textContent = texts.syncDescription;
  document.querySelector('#sync-label-b').textContent = texts.syncLabelB;
  document.querySelector('#sync-label-c').textContent = texts.syncLabelC;
  document.querySelector('#sync-graph').setAttribute('aria-label', texts.syncGraphAria);
  document.querySelector('#sync-value-b').textContent = formatSyncOffset(syncOffsetB.value);
  document.querySelector('#sync-value-c').textContent = formatSyncOffset(syncOffsetC.value);
  document.querySelector('#sync-status').textContent = scene.sync.completed
    ? texts.syncComplete : (aligned ? texts.syncAligned : texts.syncPending);
  syncOffsetB.disabled = scene.sync.completed || scene.paused;
  syncOffsetC.disabled = scene.sync.completed || scene.paused;
  syncCommit.disabled = scene.sync.completed || scene.paused || !aligned;
  syncCommit.textContent = scene.sync.completed ? texts.syncActionDone : texts.syncAction;
  syncToggle.setAttribute('aria-label', texts.syncButtonAria);
  syncToggle.textContent = scene.sync.completed ? texts.syncActionDone : texts.syncButton;
  syncClose.setAttribute('aria-label', texts.close);
  renderSyncWaveforms();
}

/** Öffnet die Kalibrierung erst, nachdem alle drei Relais verbunden wurden. */
function openSyncDialog() {
  if (scene.finale.mode) return;
  if (scene.relays.linked.size !== RELAYS.length) return;

  updateSyncUI();
  if (!syncDialog.open) syncDialog.showModal();
}

/** Speichert den endgültigen Phasenabgleich genau einmal.
 * Danach morst die Station nur eine weitere Empfangsfrequenz, keinen Klartext. */
function commitSignalAlignment() {
  if (scene.sync.completed || scene.paused || scene.relays.linked.size !== RELAYS.length) return;
  if (!isSignalAligned('B', syncOffsetB.value) || !isSignalAligned('C', syncOffsetC.value)) return;
  scene.sync.completed = true;
  scene.story.stage = 'synchronized';
  investigation.record('nameNote');
  investigation.showCaption('nameSignal');
  investigation.record('warningNote');
  scene.anomaly.syncStartedAtMs = scene.anomaly.activeMs;
  syncSignalVisuals();
  refreshRelayUI();
  updateSyncUI();
  updateWarningUI();
  updateAnomalyMeter();
  updateUplinkUI();
  receiverEventStatus.textContent = TRANSLATIONS[scene.language].syncAnnouncement;
  window.dispatchEvent(new CustomEvent('deadair:storychanged', { detail: { stage: scene.story.stage } }));
  window.dispatchEvent(new CustomEvent('deadair:relayaligned', { detail: { relays: ['A', 'B', 'C'] } }));
}

/** Der Warnträger wird nur auf CAM 01 bei exakt eingestellter Frequenz empfangen. */
function canReceiveWarning() {
  return !scene.finale.mode && scene.sync.completed
    && scene.source === 'artwork'
    && scene.channel === 'warning'
    && Math.abs(scene.frequency - CHANNELS.warning.frequency) <= WARNING_TUNING_TOLERANCE;
}

/** Hält die Aufnahme an, sobald der Empfänger oder die Kamera den Träger verlässt. */
function stopWarningAudio() {
  if (scene.audio.currentRecording !== '003') return;
  ++scene.audio.requestId;
  transmissionAudio.pause();
  scene.audio.resumeAfterPause = false;
  scene.audio.resumeAfterVisibility = false;
  scene.audio.blocked = false;
}

/** Das Signal wird bei der ersten korrekten Abstimmung entdeckt und bei späterer
 * erneuter Abstimmung wiederholt. Der Entscheidungsdialog bleibt einmalig. */
function receiveWarningSignal() {
  if (scene.finale.mode) return;
  if (!canReceiveWarning()) return;

  if (!scene.warning.found) {
    scene.warning.found = true;
    scene.audio.thirdReceived = true;
    scene.story.stage = 'warning-received';
    syncSignalVisuals();
    window.dispatchEvent(new CustomEvent('deadair:warningreceived', {
      detail: { recording: '003', frequency: CHANNELS.warning.frequency, camera: 'artwork' },
    }));
    window.dispatchEvent(new CustomEvent('deadair:storychanged', { detail: { stage: scene.story.stage } }));
  }

  receiverEventStatus.textContent = TRANSLATIONS[scene.language].warningReceived;
  void playTransmission({ restart: true, recording: '003' });
  updateWarningUI();
  updateUplinkUI();
  updateAnomalyMeter();
}

/** Aktualisiert nur den Live-Empfang und den endgültigen Rückkanalstatus. */
function updateWarningUI() {
  const texts = TRANSLATIONS[scene.language];
  const receivedHere = canReceiveWarning();
  warningRecordingToggle.hidden = !receivedHere || !scene.audio.blocked || scene.audio.currentRecording !== '003';
  warningRecordingToggle.textContent = texts.warningRecordingButton;
  warningRecordingToggle.setAttribute('aria-label', texts.warningRecordingAria);
  warningTranscriptToggle.hidden = !receivedHere || !scene.warning.found;
  warningTranscriptToggle.textContent = texts.warningTranscriptButton;
  warningTranscriptToggle.setAttribute('aria-label', texts.warningTranscriptAria);

  const chosenText = scene.warning.choice === 'rescue'
    ? texts.decisionRescueStatus
    : (scene.warning.choice === 'isolate' ? texts.decisionIsolateStatus : '');
  decisionResult.hidden = !chosenText;
  decisionResult.textContent = chosenText;

  const decisionLabels = {
    'decision-meta': 'decisionMeta',
    'decision-eyebrow': 'decisionEyebrow',
    'decision-title': 'decisionTitle',
    'decision-description': 'decisionDescription',
    'decision-rescue-title': 'decisionRescueTitle',
    'decision-rescue-description': 'decisionRescueDescription',
    'decision-isolate-title': 'decisionIsolateTitle',
    'decision-isolate-description': 'decisionIsolateDescription',
    'decision-note': 'decisionNote',
  };
  Object.entries(decisionLabels).forEach(([id, key]) => {
    document.getElementById(id).textContent = texts[key];
  });
  decisionRescue.setAttribute('aria-pressed', String(scene.warning.choice === 'rescue'));
  decisionIsolate.setAttribute('aria-pressed', String(scene.warning.choice === 'isolate'));
}

/** Stellt nur am aktiven CAM-01-Träger den unvollständigen Funktext bereit.
 * Die Mitschrift allein trifft keine Entscheidung und startet keine Wiedergabe. */
function openWarningTranscript() {
  if (!canReceiveWarning() || !scene.warning.found) return;

  scene.audio.currentRecording = '003';
  renderTransmission();
  if (!transmissionDialog.open) transmissionDialog.showModal();
}

/** Eine Entscheidung wird nur nach vollständig gehörtem Funkspruch angeboten. */
function openDecisionDialog() {
  if (!scene.warning.playbackCompleted || scene.warning.choice !== null || decisionDialog.open) return;

  updateWarningUI();
  decisionDialog.showModal();
}

/** Legt den Weg endgültig fest. Ohne gefundenen Funkträger bleibt der
 * Standardweg zu Phase 06 erhalten; der rettende Alternativweg bleibt verborgen. */
function chooseRoute(route) {
  if (scene.finale.mode) return;
  if (!scene.warning.found || !scene.warning.playbackCompleted
    || scene.warning.choice !== null || !['rescue', 'isolate'].includes(route)) return;

  scene.warning.choice = route;
  scene.story.stage = route === 'rescue' ? 'rescue-standby' : 'signal-isolated';
  syncSignalVisuals();
  stateDescription.textContent = getStateDescription(TRANSLATIONS[scene.language]);
  updateWarningUI();
  updateAnomalyMeter();
  decisionDialog.close();
  receiverEventStatus.textContent = TRANSLATIONS[scene.language].decisionRouteAnnouncement;
  updateUplinkUI();
  if (route === 'isolate') startIsolationEnding();
  window.dispatchEvent(new CustomEvent('deadair:routechosen', { detail: { route, permanent: true } }));
  window.dispatchEvent(new CustomEvent('deadair:storychanged', { detail: { stage: scene.story.stage } }));
}

/** Der Rettungssender wird nach erfolgreichem Abgleich freigeschaltet.
 * Ein gefundenes, aber nicht zu Ende gehörtes Warnsignal sperrt den Impuls bis zur Entscheidung. */
function updateUplinkUI() {
  const texts = TRANSLATIONS[scene.language];
  const warningPending = scene.warning.found && scene.warning.choice === null;
  uplinkPanel.hidden = !scene.sync.completed || scene.warning.choice === 'isolate'
    || warningPending || Boolean(scene.finale.mode);
  uplinkAction.disabled = scene.paused || Boolean(scene.finale.mode);
  uplinkAction.textContent = texts.uplinkAction;
  uplinkAction.setAttribute('aria-label', texts.uplinkAria);
  document.querySelector('#uplink-meta').textContent = texts.uplinkMeta;
  document.querySelector('#uplink-description').textContent = texts.uplinkDescription;
  document.querySelector('#uplink-status').textContent = texts.uplinkPending;
}

/** Textliche und technische Ausgabe aller Finalphasen, einschließlich Kamera- und Bedienlock. */
function updateFinaleUI() {
  const texts = TRANSLATIONS[scene.language];
  root.dataset.finale = scene.finale.phase;
  const isolated = scene.finale.mode === 'isolate';
  const localReady = ['local-ready', 'local-view'].includes(scene.finale.phase);
  document.querySelector('#local-camera').hidden = !localReady;
  document.querySelector('#local-offline').hidden = !isolated || scene.source === 'local';
  for (const button of document.querySelectorAll('#source-switch button')) button.disabled = isolated;
  if (localReady) document.querySelector('#status-output').textContent = investigation.copy.localReady;
  finalCaption.hidden = !['open', 'sealed'].includes(scene.finale.phase);
  finalCaption.textContent = scene.finale.phase === 'sealed'
    ? texts.finalSealedCaption : texts.finalOpenCaption;
  if (scene.finale.mode) {
    document.querySelector('#monitor-live-status').textContent = scene.finale.mode === 'isolate'
      ? texts.finalMonitorSealed
      : (scene.finale.phase === 'lock' ? texts.finalMonitorLock : texts.finalMonitorOpen);
    document.querySelector('#status-output').textContent = scene.finale.mode === 'isolate'
      ? texts.finalReceiverSealed : texts.finalReceiverOpen;
    document.querySelector('#rx-output').textContent = scene.finale.mode === 'isolate' ? '0%' : '---';
    document.querySelector('#screen-frequency').textContent = scene.finale.mode === 'isolate'
      ? 'NO CARRIER' : '--- MHz';
  }
  if (localReady) {
    document.querySelector('#status-output').textContent = investigation.copy.localReady;
    document.querySelector('#monitor-live-status').textContent = scene.source === 'local' ? 'LOCAL / LIVE' : 'CAM 01 / 02 · OFFLINE';
    if (scene.source === 'local') document.querySelector('#screen-channel').textContent = 'NCBS / LOCAL-03';
  }
  stateDescription.textContent = getStateDescription(texts);
  document.querySelector('#scene-state').textContent = scene.finale.mode
    ? `NCBS / ${scene.finale.phase.toUpperCase()}`
    : document.querySelector('#scene-state').textContent;
}

/** Aktiviert nur tatsächlich vorhandene Endbedingungen, niemals einen bloßen Klick auf den Warnträger. */
function canTransmitRescue() {
  return !scene.paused && !scene.finale.mode && scene.sync.completed
    && scene.relays.linked.size === RELAYS.length
    && (!scene.warning.found || scene.warning.choice === 'rescue');
}

/** Nach dem letzten manuellen Impuls startet der irreversible Küstenfeed. */
function transmitRescuePulse() {
  if (!canTransmitRescue()) return;
  startFinale('breach');
  receiverEventStatus.textContent = TRANSLATIONS[scene.language].finalStartAnnouncement;
  window.dispatchEvent(new CustomEvent('deadair:rescuepulse', {
    detail: { relays: ['A', 'B', 'C'], warningFound: scene.warning.found },
  }));
}

/** Die echte Gegenentscheidung trennt den Rückkanal unmittelbar und ebenfalls irreversibel. */
function startIsolationEnding() {
  if (!scene.warning.found || scene.warning.choice !== 'isolate' || scene.finale.mode) return;
  startFinale('isolate');
}

/** Gemeinsamer Finalstart: eine Quelle, eine Uhr, eine Kamerasperre. */
function startFinale(mode) {
  if (scene.finale.mode || !['breach', 'isolate'].includes(mode)) return;
  resetRelayPing();

  stopWarningAudio();
  transmissionAudio.pause();
  scene.audio.resumeAfterPause = false;
  scene.audio.resumeAfterVisibility = false;
  scene.finale.mode = mode;
  ending.prepare(mode);
  scene.finale.phase = mode === 'breach' ? 'lighthouse' : 'isolating';
  scene.finale.startedAtMs = scene.anomaly.activeMs;
  scene.finale.lastFrameAtMs = 0;
  coastVideo.playbackRate = 1;
  root.dataset.lighthouse = 'present';
  // Für das schlechte Ende bleibt CAM 01 noch kurz sichtbar.
  // Nach der Isolation meldet sich später ein nicht registrierter lokaler Eingang.
  applySource(mode === 'breach' ? 'artwork' : 'video');
  gateCanvas.hidden = true;
  if (mode === 'isolate') {
    document.querySelector('#local-yard').src = 'assets/local-courtyard.webp';
    document.querySelector('#local-swing').src = 'assets/local-swing.webp';
    document.querySelector('#local-offline').hidden = false;
  }
  frequencyInput.disabled = true;
  for (const button of [evidenceLog, transmissionToggle, transmission2Toggle, relayToggle,
    syncToggle, warningRecordingToggle, warningTranscriptToggle, relayLink]) {
    button.disabled = true;
  }
  updateUplinkUI();
  syncSignalVisuals();
  applyInterference(mode === 'breach' ? 95 : 12);
  updateFinaleUI();
  updateAnomalyMeter();
  void syncVideo();
  startGateFrames();
  window.dispatchEvent(new CustomEvent('deadair:finalestarted', { detail: { mode } }));
}

/** Nur der ausdrücklich aktivierte Debug-Modus darf Finalzustände überspringen.
 * Diese Funktion umgeht bewusst die normalen Rätselbedingungen, verändert aber
 * keine regulären Story-Flags und ist im veröffentlichten Spiel unsichtbar. */
function debugJumpToFinal(mode, skipToOpen = false) {
  if (scene.finale.mode && (scene.finale.mode !== mode || !skipToOpen)) return;
  if (scene.paused) {
    scene.paused = false;
    updatePlaybackLabel();
    soundscape.setPaused(false);
  }
  if (!scene.finale.mode) startFinale(mode);
  if (mode === 'breach' && skipToOpen) {
    // Gleiches Finale, gleiche Zeichenlogik – lediglich die aktive Uhr springt vor.
    // Die Kameraquelle und der eingefrorene Videoframe werden von updateFinale gesetzt.
    scene.finale.startedAtMs = scene.anomaly.activeMs
      - FINAL_LIGHTHOUSE_PRELUDE_MS - FINAL_OPEN_END_MS - 1_100;
    updateFinale();
  }
}

/** Die Portal-Zeit beginnt erst nach dem lautlosen Verschwinden des Turms. */
function getGateElapsedMs() {
  const elapsed = scene.anomaly.activeMs - scene.finale.startedAtMs;
  return Math.max(0, elapsed - (scene.finale.mode === 'breach' ? FINAL_LIGHTHOUSE_PRELUDE_MS : 0));
}

/** Die Brandung friert erst ein, wenn die eigentliche Portalöffnung beginnt. */
function isSeaFrozen() {
  return scene.finale.mode === 'breach'
    && ['opening', 'open'].includes(scene.finale.phase);
}

/** Bremst die Brandung bis zum Beginn der Portalöffnung kontinuierlich ab.
 * Der Videoframe steht erst beim Abschluss der Abbremsung endgültig still.
 * Im Gegensatz zu CSS-Filterungen wird die echte Abspielgeschwindigkeit verändert. */
function slowSeaToFreeze(elapsedMs) {
  if (scene.finale.mode !== 'breach' || isSeaFrozen()) return;
  const progress = smoothStep(elapsedMs / FINAL_OPENING_MS);
  const playbackRate = Math.max(0.08, 1 - progress * 0.92);
  if (Math.abs(coastVideo.playbackRate - playbackRate) > 0.015) {
    coastVideo.playbackRate = playbackRate;
  }
}

/** Steigert Szenenlicht und Gehäusereflexe aus derselben pausierbaren Finaluhr.
 * Die Phasenbezeichnungen lösen keine abrupten Farbfilter mehr aus. */
function updateFinaleLighting(elapsedMs) {
  const light = scene.finale.mode === 'breach'
    ? smoothStep((elapsedMs - 1_200) / (FINAL_OPEN_END_MS - 1_200)) : 0;
  const spill = scene.finale.mode === 'breach'
    ? smoothStep((elapsedMs - FINAL_OPENING_MS) / (FINAL_OPEN_END_MS - FINAL_OPENING_MS)) : 0;
  root.style.setProperty('--gate-light', light.toFixed(4));
  root.style.setProperty('--gate-spill', spill.toFixed(4));
}

/** Story-Phasen werden aus aktiver Spielzeit abgeleitet; Pausen verschieben nichts. */
function updateFinale() {
  if (!scene.finale.mode) return;
  const elapsed = scene.anomaly.activeMs - scene.finale.startedAtMs;
  const gateElapsed = getGateElapsedMs();
  updateFinaleLighting(gateElapsed);
  const lastPhase = scene.finale.phase;
  let phase;
  if (scene.finale.mode === 'isolate') {
    phase = investigation.localOpenedAt !== null ? 'local-view'
      : elapsed >= FINAL_ISOLATED_MS + 2700 ? 'local-ready'
        : elapsed >= FINAL_ISOLATED_MS ? 'sealed' : 'isolating';
  } else if (elapsed < FINAL_LIGHTHOUSE_PRELUDE_MS) {
    phase = 'lighthouse';
    // Die Schwarzblende sitzt genau über dem harten Wechsel zur leergeräumten Fotografie.
    // Die dauerhafte Kameraquelle wird in dieser Phase nie geändert.
    root.dataset.lighthouse = elapsed >= FINAL_LIGHTHOUSE_MISSING_MS
      ? 'missing' : (elapsed >= FINAL_LIGHTHOUSE_DARK_MS ? 'dark' : 'present');
    cameraBlackout.classList.toggle('is-active',
      elapsed >= FINAL_LIGHTHOUSE_BLACKOUT_MS && elapsed < FINAL_LIGHTHOUSE_BLACKOUT_END_MS);
  } else if (gateElapsed < FINAL_TRIANGULATION_MS) {
    phase = 'lock';
  } else if (gateElapsed < FINAL_OPENING_MS) {
    phase = 'triangulation';
  } else if (gateElapsed < FINAL_OPEN_END_MS) {
    phase = 'opening';
  } else {
    phase = 'open';
  }
  // Der Seefreeze muss auch innerhalb derselben Phase weiterlaufen.
  // Sonst bleibt das Video bis zur nächsten Phasengrenze auf Normaltempo.
  if (phase !== 'lighthouse') slowSeaToFreeze(gateElapsed);
  if (phase === lastPhase) return;

  if (lastPhase === 'lighthouse') {
    cameraBlackout.classList.remove('is-active');
    applySource('video');
    gateCanvas.hidden = false;
  }

  scene.finale.phase = phase;
  window.dispatchEvent(new CustomEvent('deadair:finalephase', { detail: { phase } }));
  syncSignalVisuals();
  updateFinaleUI();
  if (isSeaFrozen() || phase === 'sealed') coastVideo.pause();
  applyInterference(scene.finale.mode === 'breach' ? 100 : 0);
  updateAnomalyMeter();
  startGateFrames();
  receiverEventStatus.textContent = getStateDescription(TRANSLATIONS[scene.language]);
  if (phase === 'open' || phase === 'sealed') {
    window.dispatchEvent(new CustomEvent('deadair:finalecomplete', {
      detail: { mode: scene.finale.mode, phase },
    }));
  }
}

/** Rendern mit maximal 30 Bildern/Sekunde, nur während aktiver Finaldarstellung. */
function renderGateFrame(timestamp) {
  scene.finale.animationFrameId = 0;
  if (ending.active || scene.finale.mode !== 'breach' || scene.paused || document.hidden || scene.finale.phase === 'lighthouse') return;
  if (!scene.finale.lastFrameAtMs || timestamp - scene.finale.lastFrameAtMs >= 32) {
    drawGate(gateCanvas, getGateElapsedMs(),
      scene.finale.mode, window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    scene.finale.lastFrameAtMs = timestamp;
  }
  const revealPending = scene.finale.mode === 'breach' && getGateElapsedMs() < PORTAL_REVEAL_END_MS;
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches || revealPending) {
    scene.finale.animationFrameId = requestAnimationFrame(renderGateFrame);
  }
}

/** Pausierte oder verdeckte Tabs verbrauchen keine Zeichen- oder Animationszeit. */
function startGateFrames() {
  if (ending.active || scene.finale.mode !== 'breach' || scene.paused || document.hidden || scene.finale.animationFrameId
    || scene.finale.phase === 'lighthouse') return;
  scene.finale.lastFrameAtMs = 0;
  scene.finale.animationFrameId = requestAnimationFrame(renderGateFrame);
}

/** Zeichnet das gemeinsame Audiotranskript abhängig vom archivierten Funkspruch. */
function renderTransmission() {
  const texts = TRANSLATIONS[scene.language];
  const suffix = scene.audio.currentRecording === '003' ? 'Warning' : (scene.audio.currentRecording === '002' ? '2' : '');
  const field = key => suffix === 'Warning' ? texts[`warning${key}`] : texts[`transmission${suffix}${key}`];
  const fields = {
    '#transmission-meta': 'Meta', '#transmission-title': 'Title',
    '#transmission-frequency': 'Frequency', '#transmission-transcript-label': 'TranscriptLabel',
    '#transmission-line-1': 'Line1', '#transmission-line-2': 'Line2',
    '#transmission-line-3': 'Line3', '#transmission-footer': 'Footer',
  };
  Object.entries(fields).forEach(([selector, key]) => {
    document.querySelector(selector).textContent = field(key);
  });
  transmissionAudio.setAttribute('aria-label', `${texts.transmissionAudioAria.replace('001', scene.audio.currentRecording)}`);
}

/** Nur freigeschaltete Story-Ereignisse dürfen die Kameraoptik verändern. */
function syncSignalVisuals() {
  if (scene.finale.mode) {
    root.dataset.story = scene.finale.mode === 'breach' ? 'final-breach' : 'final-isolated';
    root.dataset.state = scene.finale.mode === 'breach' ? 'unknown' : 'offair';
    return;
  }
  const activeStage = scene.story.stage;
  root.dataset.story = activeStage;
  root.dataset.state = activeStage === 'frequency-scan'
    ? 'unknown'
    : (['morse-active', 'windows-event'].includes(activeStage)
      ? (scene.channel ?? 'normal')
      : (activeStage === 'transmission-ready' && scene.channel === 'voice' ? 'interference' : 'normal'));
}

/** Glättet einen Wert zwischen 0 und 1, ohne abrupte Intensitätssprünge. */
function smoothStep(value) {
  const progress = Math.max(0, Math.min(1, value));
  return progress * progress * (3 - 2 * progress);
}

/** Reagiert ausschließlich auf Präsenz im aktuell sichtbaren Kamerabild.
 * Die erreichte Story-Stufe ist nur Voraussetzung für bestimmte Ereignisse,
 * niemals eine dauerhaft erhöhte Anzeige des Spielfortschritts. */
function getAnomalyProfile() {
  if (scene.finale.mode === 'breach') {
    return { level: 1, amplitude: .27, speed: 13 };
  }
  if (scene.finale.mode === 'isolate') {
    const age = scene.anomaly.activeMs - scene.finale.startedAtMs;
    const activity = 1 - smoothStep(age / FINAL_ISOLATED_MS);
    return { level: activity * .35, amplitude: activity * .04, speed: .8 };
  }
  const { stage, elapsedMs, bottleVisible, bottleCollected } = scene.story;

  if (scene.source === 'video') {
    if (!bottleVisible) {
      const approach = smoothStep(elapsedMs / BOTTLE_APPEAR_AFTER_MS);
      return {
        level: 0.04 + approach * 0.55,
        amplitude: 0.015 + approach * 0.1,
        speed: 0.4 + approach * 1.4,
      };
    }

    if (!bottleCollected) {
      const ageMs = Math.max(0, scene.anomaly.activeMs - scene.anomaly.appearanceAtMs);
      const apparition = Math.exp(-ageMs / 3200);
      return {
        level: 0.19 + 0.65 * apparition,
        amplitude: 0.04 + 0.13 * apparition,
        speed: 0.75 + apparition * 2.25,
      };
    }

    // Nur ein aktuell empfangener Träger löst auf CAM 02 eine lokale Anomalie aus.
    if (scene.sync.completed) {
      const ageMs = Math.max(0, scene.anomaly.activeMs - (scene.anomaly.syncStartedAtMs ?? 0));
      const burst = Math.exp(-ageMs / 3200);
      return { level: burst * .71, amplitude: burst * .12, speed: 1.7 + burst * 2 };
    }
    // Die Anomalie wird erst durch einen echten Ping-Echo-Empfang sichtbar.
    const ping = scene.relays.ping;
    if (ping.responseId && ['echo', 'carrier'].includes(ping.result)) {
      const age = scene.anomaly.activeMs - ping.receivedAtMs;
      const pulse = Math.exp(-Math.max(0, age) / 2000);
      return { level: .11 + .55 * pulse, amplitude: .05 + .12 * pulse, speed: 1.2 + 2 * pulse };
    }
    return { level: 0, amplitude: 0, speed: 0 };
  }

  // Das Signal ist nur während der tatsächlich hörbaren Störübertragung präsent.
  if (canReceiveWarning() && scene.audio.currentRecording === '003'
    && !transmissionAudio.paused && !transmissionAudio.ended) {
    const pulse = (1 + Math.sin(scene.anomaly.activeMs / 160)) / 2;
    return { level: .39 + pulse * .37, amplitude: .16, speed: 3.1 };
  }

  if (stage === 'synchronized') {
    const ageMs = Math.max(0, scene.anomaly.activeMs - (scene.anomaly.syncStartedAtMs ?? 0));
    const surge = Math.exp(-ageMs / 4000);
    const periodic = .08 * (1 + Math.sin(scene.anomaly.activeMs / 780)) / 2;
    return { level: .09 + periodic + surge * .76, amplitude: .03 + surge * .13, speed: 1 + surge * 3.1 };
  }

  if (stage === 'morse-active' && scene.channel === 'interference') {
    const time = (scene.anomaly.activeMs - scene.anomaly.morseStartedAtMs) / 1000;
    const pulse = (1 + Math.sin(time * 2.8)) / 2;
    return { level: 0.47 + pulse * 0.26, amplitude: 0.15, speed: 2.4 };
  }

  if (stage === 'frequency-scan') {
    const phase = (scene.anomaly.activeMs - scene.autoScan.startedAtMs) / 1000;
    return { level: 0.66 + (Math.sin(phase * 6) + 1) * .13, amplitude: .12, speed: 3.4 };
  }

  if (stage === 'transmission-ready' && scene.channel === 'voice') {
    const ageMs = Math.max(0, scene.anomaly.activeMs - scene.anomaly.transmissionStartedAtMs);
    const burst = Math.exp(-ageMs / 4500);
    return { level: .2 + .62 * burst, amplitude: .045 + .1 * burst, speed: 1.2 + 1.8 * burst };
  }

  if (stage === 'windows-event') {
    const ageMs = Math.max(0, scene.anomaly.activeMs - scene.anomaly.windowsStartedAtMs);
    const burst = Math.exp(-ageMs / 5500);
    return {
      level: 0.37 + 0.53 * burst,
      amplitude: 0.09 + 0.11 * burst,
      speed: 1.75 + burst * 1.1,
    };
  }

  return { level: 0, amplitude: 0, speed: 0 };
}

/** Zeichnet die Monitorbalken als ruhige oder leicht fluktuierende Anomalieanzeige.
 * Keine Zufallswerte und keine frei laufende CSS-Animation: Pause und verdeckte Tabs
 * halten dadurch sowohl Story-Zeit als auch den visuellen Zustand an. */
function updateAnomalyMeter() {
  if (scene.finale.mode === 'breach') {
    const time = scene.anomaly.activeMs / 1000;
    anomalyBars.forEach((bar, index) => {
      const burst = Math.sin(time * 18 + index * 2.61) * Math.sin(time * 3 + index * .47);
      const clip = Math.sin(time * 1.7 + index * 1.9) > .4;
      bar.style.height = `${clip ? 99 : 55 + Math.max(0, burst) * 44}%`;
    });
    anomalyMeter.setAttribute('aria-valuenow', '100');
    root.dataset.anomaly = 'overload';
    scene.anomaly.displayedLevel = 100;
    return;
  }
  const { level, amplitude, speed } = getAnomalyProfile();
  const time = scene.anomaly.activeMs / 1000;
  const isIdle = level === 0;

  anomalyBars.forEach((bar, index) => {
    const weight = 0.38 + ((index * 7) % 11) / 18;
    const wave = Math.sin(time * speed + index * 0.79) * 0.72
      + Math.sin(time * speed * 0.47 + index * 1.83) * 0.28;
    const activity = Math.max(0, level * weight + amplitude * wave);
    const height = isIdle ? 7 + ((index * 3) % 5) : Math.min(96, 8 + activity * 88);
    bar.style.height = `${height.toFixed(1)}%`;
  });

  const percent = Math.round(level * 100);
  if (scene.anomaly.displayedLevel !== percent) {
    anomalyMeter.setAttribute('aria-valuenow', String(percent));
    root.dataset.anomaly = level >= 0.7 ? 'high' : (level >= 0.28 ? 'active' : 'quiet');
    scene.anomaly.displayedLevel = percent;
  }
}

/** Fortschritt wird durch das gesicherte Fundstück, Kamera und korrekt abgestimmte
 * Frequenz ausgelöst. Die Übergänge sind einmalig und erzwingen keinen Kamerawechsel. */
function progressStory() {
  if (scene.finale.mode) {
    syncSignalVisuals();
    updateAnomalyMeter();
    return;
  }
  const previous = scene.story.stage;
  if (previous === 'message-found' && scene.source === 'artwork' && scene.channel === 'interference') {
    scene.story.stage = 'morse-active';
  } else if (previous === 'morse-active' && scene.source === 'artwork' && scene.channel === 'unknown') {
    scene.story.stage = 'windows-event';
  }
  if (previous !== scene.story.stage) {
    if (scene.story.stage === 'morse-active') {
      scene.anomaly.morseStartedAtMs = scene.anomaly.activeMs;
      investigation.record('morseNote');
    } else if (scene.story.stage === 'windows-event') {
      scene.anomaly.windowsStartedAtMs = scene.anomaly.activeMs;
    }
  }
  syncSignalVisuals();
  updateAnomalyMeter();
  if (previous !== scene.story.stage) {
    window.dispatchEvent(new CustomEvent('deadair:storychanged', { detail: { stage: scene.story.stage } }));
  }
}

/** Leitet die sichtbare Störung ausschließlich aus dem Empfangszustand ab. */
function applyInterference(amount) {
  const strength = Math.max(0, Math.min(100, amount));
  root.style.setProperty('--noise-opacity', String(strength / 260));
  root.style.setProperty('--flicker-opacity', String(strength / 180));
}

/** Aktualisiert Empfänger, Bild und Telemetrie bei jeder Frequenzänderung. */
function setFrequency(value, { automated = false } = {}) {
  if (scene.finale.mode) return;
  if (scene.story.stage === 'frequency-scan' && !automated) return;

  let frequency = Math.round(Math.max(FM_MIN, Math.min(FM_MAX, Number(value))) * 10) / 10;
  if (automated && investigation.strangerSpent && Math.abs(frequency - 90.2) <= .11) {
    frequency = frequency >= scene.frequency ? 90.4 : 90.0;
  }
  if (!Number.isFinite(frequency)) return;
  if (!automated && Math.abs(frequency - scene.frequency) >= .05) resetRelayPing();

  const detectedChannel = (automated && scene.story.stage === 'frequency-scan') ? null : findChannel(frequency);
  const channel = isChannelAvailable(detectedChannel) ? detectedChannel : null;
  const previousChannel = scene.channel;
  const config = channel ? CHANNELS[channel] : null;
  const texts = TRANSLATIONS[scene.language];
  scene.frequency = frequency;
  scene.channel = channel;
  frequencyInput.value = frequency.toFixed(1);
  frequencyInput.style.setProperty('--range-progress', `${(frequency - FM_MIN) / (FM_MAX - FM_MIN) * 100}%`);
  const displayStatus = scene.story.stage === 'frequency-scan'
    ? texts.scanStatus
    : (scene.story.stage === 'transmission-ready' && channel === 'voice' ? texts.transmissionStatus : (config?.label ?? texts.offAir));
  frequencyInput.setAttribute('aria-valuetext', `${frequency.toFixed(1)} MHz – ${displayStatus}`);

  const display = frequency.toFixed(1);
  document.querySelector('#frequency-output').textContent = display;
  document.querySelector('#frequency-unit').textContent = 'MHz';
  document.querySelector('#status-output').textContent = displayStatus;
  document.querySelector('#scene-state').textContent = `${channel?.toUpperCase() ?? 'OFF AIR'} / ${display} MHz`;
  document.querySelector('#screen-frequency').textContent = `${display} MHz`;
  document.querySelector('#screen-channel').textContent = `NCBS / CH-${config?.channel ?? '--'}`;
  document.querySelector('#readout-channel').textContent = `CH–${config?.channel ?? '--'}`;
  document.querySelector('#rx-output').textContent = `${config?.reception ?? 0}%`;
  stateDescription.textContent = getStateDescription(texts);
  if (automated) {
    syncSignalVisuals();
  } else {
    progressStory();
  }
  applyInterference(scene.story.stage === 'frequency-scan'
    ? 75
    : (['routine', 'message-found'].includes(scene.story.stage) ? 0 : (config?.interference ?? 15)));
  if (automated) return;

  investigation.tune(channel);
  refreshRelayUI();
  if (canReceiveWarning()) {
    if (previousChannel !== 'warning') receiveWarningSignal();
  } else {
    stopWarningAudio();
    updateWarningUI();
  }
  updateAnomalyMeter();
  const detail = { frequency, channel, reception: config?.reception ?? 0, interference: config?.interference ?? 91 };
  window.dispatchEvent(new CustomEvent('deadair:frequencychange', { detail }));
  if (channel && channel !== previousChannel) {
    window.dispatchEvent(new CustomEvent('deadair:signalacquired', { detail }));
  }
}

/** Startet die selbstständige Frequenzsuche nach dem ersten Fensterereignis.
 * Drei Richtungswechsel simulieren einen fremden Zugriff auf die Funkkonsole. */
function startAutoScan() {
  if (scene.story.stage !== 'windows-event' || scene.source !== 'artwork' || scene.channel !== 'unknown') return;

  scene.story.stage = 'frequency-scan';
  scene.autoScan.startedAtMs = scene.anomaly.activeMs;
  frequencyInput.disabled = true;
  root.dataset.autoscan = 'active';
  setFrequency(CHANNELS.unknown.frequency, { automated: true });
  updateAnomalyMeter();
  window.dispatchEvent(new CustomEvent('deadair:storychanged', { detail: { stage: scene.story.stage } }));
  window.dispatchEvent(new CustomEvent('deadair:autoscanstarted', {
    detail: { from: CHANNELS.unknown.frequency, target: CHANNELS.voice.frequency },
  }));
}

/** Interpoliert die Frequenz zwischen den vorgegebenen Wendepunkten. */
function getAutoScanFrequency(progress) {
  for (let index = 1; index < AUTO_SCAN_POINTS.length; index += 1) {
    const previous = AUTO_SCAN_POINTS[index - 1];
    const next = AUTO_SCAN_POINTS[index];
    if (progress > next.time) continue;

    const local = smoothStep((progress - previous.time) / (next.time - previous.time));
    return previous.frequency + (next.frequency - previous.frequency) * local;
  }

  return CHANNELS.voice.frequency;
}

/** Beendet die Frequenzübernahme und legt die erste Übertragung zum Abruf bereit. */
function finishAutoScan() {
  if (scene.story.stage !== 'frequency-scan') return;

  scene.story.stage = 'transmission-ready';
  investigation.record('alexNote');
  scene.anomaly.transmissionStartedAtMs = scene.anomaly.activeMs;
  frequencyInput.disabled = false;
  root.dataset.autoscan = 'received';
  setFrequency(CHANNELS.voice.frequency, { automated: true });
  transmissionToggle.hidden = false;
  scene.relays.unlocked = true;
  root.dataset.relays = 'active';
  refreshRelayUI();
  receiverEventStatus.textContent = TRANSLATIONS[scene.language].transmissionReceivedAnnouncement;
  updateAnomalyMeter();

  // Der erste Empfang beginnt automatisch; das Archiv bleibt zum erneuten Hören erhalten.
  void playTransmission({ restart: true });
  window.dispatchEvent(new CustomEvent('deadair:storychanged', { detail: { stage: scene.story.stage } }));
  window.dispatchEvent(new CustomEvent('deadair:transmissionreceived', {
    detail: { frequency: CHANNELS.voice.frequency, recording: '001' },
  }));
}

/** Bewegt den Regler ausschließlich während aktiver Spielzeit. */
function updateAutoScan() {
  if (scene.story.stage !== 'frequency-scan') return;
  const elapsed = scene.anomaly.activeMs - scene.autoScan.startedAtMs;
  const progress = Math.max(0, Math.min(1, elapsed / AUTO_SCAN_DURATION_MS));

  if (progress >= 1 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    finishAutoScan();
    return;
  }

  setFrequency(getAutoScanFrequency(progress), { automated: true });
}

/** Spielt den lokalen Funkmitschnitt ab und fängt Browser-Autoplay-Sperren ab.
 * Der Dialog bleibt beim ersten Empfang geschlossen; die Aufnahme ist dennoch hörbar.
 * Auf erneuten Archivaufruf wird die vorhandene Aufnahme verwendet. */
async function playTransmission({ restart = false, recording = scene.audio.currentRecording } = {}) {
  if (!scene.relays.unlocked || (recording === '002' && !scene.audio.secondReceived)
    || (recording === '003' && (!scene.audio.thirdReceived || !canReceiveWarning()))) return;

  scene.audio.currentRecording = recording;
  renderTransmission();
  const source = `assets/transmission-${recording}-${scene.language}.mp3`;
  if (transmissionAudio.getAttribute('src') !== source) {
    transmissionAudio.setAttribute('src', source);
    transmissionAudio.load();
    restart = true;
  }

  if (restart) transmissionAudio.currentTime = 0;
  if (scene.paused || document.hidden) {
    scene.audio.resumeAfterPause = scene.paused;
    scene.audio.resumeAfterVisibility = document.hidden;
    return;
  }

  const requestId = ++scene.audio.requestId;
  try {
    await transmissionAudio.play();
    if (requestId !== scene.audio.requestId) return;
    scene.audio.blocked = false;
    transmissionToggle.textContent = TRANSLATIONS[scene.language].transmissionButton;
    transmission2Toggle.textContent = TRANSLATIONS[scene.language].transmission2Button;
    warningRecordingToggle.textContent = TRANSLATIONS[scene.language].warningRecordingButton;
    receiverEventStatus.textContent = recording === '003'
      ? TRANSLATIONS[scene.language].warningPlaying
      : TRANSLATIONS[scene.language].transmissionPlayingAnnouncement.replace('001', recording);
    updateWarningUI();
  } catch (error) {
    if (requestId !== scene.audio.requestId) return;
    scene.audio.blocked = true;
    const texts = TRANSLATIONS[scene.language];
    if (recording === '001') transmissionToggle.textContent = texts.transmissionPlayAction;
    else if (recording === '002') transmission2Toggle.textContent = scene.language === 'de' ? 'AUDIO / 002 · STARTEN' : 'AUDIO / 002 · PLAY';
    else warningRecordingToggle.textContent = texts.warningRecordingButton;
    receiverEventStatus.textContent = recording === '003' && error.name === 'NotAllowedError'
      ? texts.warningBlocked
      : (error.name === 'NotAllowedError' ? texts.transmissionBlockedAnnouncement : texts.transmissionErrorAnnouncement);
    updateWarningUI();
  }
}

/** Öffnet das Archiv; wurde die Aufnahme beendet, beginnt sie erneut. */
function openTransmission(recording = '001') {
  if (scene.finale.mode) return;
  if (recording === '002' && !scene.audio.secondReceived) return;
  if (recording === '003') return; // AUDIO / 003 ist nur als Live-Empfang auf CAM 01 hörbar.

  const changed = scene.audio.currentRecording !== recording;
  scene.audio.currentRecording = recording;
  renderTransmission();
  if (!transmissionDialog.open) transmissionDialog.showModal();
  if (changed || transmissionAudio.paused || transmissionAudio.ended) {
    void playTransmission({ restart: true, recording });
  }
}

/** Lädt das reale Video erst bei Auswahl der Kameraquelle. */
async function syncVideo() {
  const shouldPlay = scene.source === 'video' && !scene.paused && !document.hidden
    && !isSeaFrozen() && scene.finale.mode !== 'isolate';
  if (!shouldPlay) {
    coastVideo.pause();
    return;
  }

  try {
    await coastVideo.play();
  } catch {
    // Autoplay kann durch Browserrichtlinien unterbunden sein; der Poster-Fallback bleibt sichtbar.
  }
}

/** Kennzeichnet Bildquelle und Inhalt für Sehende und Assistenztechnologien. */
function updateSourceDescription() {
  const texts = TRANSLATIONS[scene.language];
  document.querySelector('#scene').setAttribute('aria-label', scene.source === 'local' ? investigation.copy.localAria : texts[scene.source === 'artwork' ? 'sceneArtworkAria' : 'sceneVideoAria']);
}

/** Übernimmt die Quellenumschaltung ohne sichtbaren Übergang. */
function applySource(source) {
  const verifiedBeforeSwitch = scene.relays.ping.verifiedId !== null && source !== scene.source;
  if (source !== scene.source) resetRelayPing();
  if (source !== scene.source) void soundscape.play('glitch', .27);
  scene.source = source;
  root.dataset.source = source;
  document.querySelectorAll('[data-source][aria-pressed]').forEach(button => {
    const active = button.dataset.source === source;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  document.querySelector('#monitor-camera-label').textContent = source === 'local' ? 'CAMERA 03 / LOCAL' : (source === 'artwork' ? 'CAMERA 01' : 'CAMERA 02');
  document.querySelector('#screen-location').textContent = source === 'local' ? 'NCBS / LOCAL' : (source === 'artwork' ? 'NORTH COAST / STATION' : 'NORTH COAST / SHORE');
  updateSourceDescription();
  if (verifiedBeforeSwitch) setFrequency(scene.frequency);
  progressStory();
  maybeStartBottleReveal();
  refreshRelayUI();
  if (canReceiveWarning()) {
    receiveWarningSignal();
  } else {
    stopWarningAudio();
    updateWarningUI();
  }
  investigation.render();
  void syncVideo();
}

/** Zeigt bei unterbrochenem CAM-02-Signal kurz ein vollständig schwarzes Bild.
 * Die tatsächliche Bildquelle wird bewusst nicht geändert, damit keine
 * Video-/Artefaktreste entstehen und der Morsecode aktiv bleibt. */
function showBlockedCamera() {
  if (cameraBlackout.classList.contains('is-active')) return;
  void soundscape.play('glitch');

  cameraStatus.textContent = scene.finale.mode
    ? TRANSLATIONS[scene.language].finalLockedCamera
    : TRANSLATIONS[scene.language].cameraBlocked;
  cameraBlackout.classList.add('is-active');
  window.clearTimeout(scene.cameraBlackoutTimerId);
  scene.cameraBlackoutTimerId = window.setTimeout(() => {
    cameraBlackout.classList.remove('is-active');
    scene.cameraBlackoutTimerId = 0;
  }, CAMERA_BLACKOUT_MS);
}

/** Wechselt nur dann die Kamera, wenn die Story das Signal freigibt.
 * Während des aktiven Morsecodes auf 91.3 MHz wird CAM 02 abgefangen. */
function setSource(source) {
  if (source === 'local') {
    if (scene.finale.mode !== 'isolate' || !['local-ready', 'local-view'].includes(scene.finale.phase)) return;
    scene.finale.phase = 'local-view';
    applySource('local');
    document.querySelector('#local-scene').hidden = false;
    investigation.openLocal();
    updateFinaleUI();
    return;
  }
  if (source !== 'artwork' && source !== 'video') return;
  if (scene.finale.mode) {
    if (source !== scene.source) showBlockedCamera();
    return;
  }

  const morseLocksCamera = scene.story.stage === 'morse-active'
    && scene.channel === 'interference'
    && scene.source === 'artwork';

  if (source === 'video' && (morseLocksCamera || scene.story.stage === 'frequency-scan')) {
    showBlockedCamera();
    return;
  }

  if (source === scene.source && root.dataset.source === source) return;
  cameraStatus.textContent = '';
  applySource(source);
}

/** Spiegelt den Wiedergabezustand im Button und für Assistenztechnologien. */
function updatePlaybackLabel() {
  pauseButton.setAttribute('aria-pressed', String(scene.paused));
  pauseLabel.textContent = TRANSLATIONS[scene.language][scene.paused ? 'resume' : 'pause'];
  document.querySelector('#pause-icon').textContent = scene.paused ? '▶' : 'Ⅱ';
  root.dataset.paused = String(scene.paused);
}

/** Schaltet Soundeffekte und Sprachnachrichten gemeinsam stumm. */
function toggleSound() {
  scene.soundMuted = !scene.soundMuted;
  soundscape.setMuted(scene.soundMuted);
  updateSoundLabel();
}

/** Synchronisiert die deutsch/englische Beschriftung des Tonschalters. */
function updateSoundLabel() {
  const texts = TRANSLATIONS[scene.language];
  const label = scene.soundMuted ? texts.soundOff : texts.soundOn;
  soundToggle.textContent = 'SND';
  soundToggle.setAttribute('aria-label', scene.soundMuted ? texts.soundEnable : texts.soundDisable);
  soundToggle.setAttribute('title', label);
  soundToggle.setAttribute('aria-pressed', String(!scene.soundMuted));
}

/** Stoppt beziehungsweise aktiviert die visuellen Bewegungen und das Video. */
function togglePause() {
  scene.paused = !scene.paused;
  soundscape.setPaused(scene.paused);
  scene.story.lastTick = performance.now();
  if (scene.paused) {
    if (scene.relays.ping.inFlight) resetRelayPing();
    scene.audio.resumeAfterPause = !transmissionAudio.paused;
    transmissionAudio.pause();
  } else if (scene.audio.resumeAfterPause) {
    scene.audio.resumeAfterPause = false;
    if (scene.audio.currentRecording !== '003' || canReceiveWarning()) void playTransmission();
  }
  investigation.render();
  updatePlaybackLabel();
  updateAnomalyMeter();
  updateUplinkUI();
  startGateFrames();
  refreshRelayUI();
  updateSyncUI();
  void syncVideo();
}

/** Spiegelt den Fundzustand im DOM, ohne die Kameraquelle umzuschalten. */
function syncStoryState() {
  root.dataset.bottle = !scene.story.bottleVisible
    ? 'hidden'
    : (scene.story.bottleCollected ? 'collected' :
      (scene.story.bottleMaterializing ? 'materializing' :
        (scene.story.bottleOpened ? 'opened' : (scene.story.bottleMaterialized ? 'visible' : 'waiting'))));
}

/** Spielt den kurzen dimensionalen Reveal erst ab, wenn CAM 02 tatsächlich sichtbar ist. */
function maybeStartBottleReveal() {
  if (!scene.story.bottleVisible || scene.story.bottleCollected || scene.story.bottleMaterialized || scene.story.bottleMaterializing || scene.source !== 'video') return;

  scene.story.bottleMaterializing = true;
  bottleArtifact.classList.add('is-materializing');
  syncStoryState();

  window.clearTimeout(scene.story.revealTimeoutId);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  scene.story.revealTimeoutId = window.setTimeout(() => {
    scene.story.bottleMaterializing = false;
    scene.story.bottleMaterialized = true;
    bottleArtifact.classList.remove('is-materializing');
    syncStoryState();
  }, reduceMotion ? 0 : BOTTLE_GLITCH_MS);
}

/** Schaltet die Flaschenpost nach 15 Sekunden aktiver Laufzeit für CAM 02 frei. */
function revealBottle() {
  if (scene.story.bottleVisible) return;

  scene.story.bottleVisible = true;
  scene.anomaly.appearanceAtMs = scene.anomaly.activeMs;
  bottleArtifact.hidden = false;
  syncStoryState();
  maybeStartBottleReveal();

  window.dispatchEvent(new CustomEvent('deadair:bottleappeared', {
    detail: { elapsedMs: scene.story.elapsedMs },
  }));
}

/** Öffnet die Fundnotiz; bereits gesicherte Hinweise bleiben über die Akte lesbar. */
function openBottleMessage() {
  if (scene.finale.mode) return;
  if (!scene.story.bottleVisible || messageDialog.open) return;

  if (scene.story.bottleMaterializing) {
    window.clearTimeout(scene.story.revealTimeoutId);
    scene.story.bottleMaterializing = false;
    scene.story.bottleMaterialized = true;
    bottleArtifact.classList.remove('is-materializing');
    syncStoryState();
  }

  const firstRead = !scene.story.bottleOpened;
  scene.story.bottleOpened = true;

  messageDialog.showModal();

  if (firstRead) {
    window.dispatchEvent(new CustomEvent('deadair:bottleopened', {
      detail: { channel: scene.channel, source: scene.source, frequency: scene.frequency },
    }));
  }
}

/** Der Hinweis wird erst nach dem Schließen des Dialogs als aufgenommen markiert.
 * Dadurch bleibt der Fund beim Lesen im Dialog, verschwindet aber danach
 * vollständig aus CAM 02; über AKTE / 01 ist der Text weiterhin abrufbar. */
function collectBottle() {
  if (!scene.story.bottleOpened || scene.story.bottleCollected) return;

  scene.story.bottleCollected = true;
  scene.story.bottleMaterializing = false;
  scene.story.bottleMaterialized = true;
  window.clearTimeout(scene.story.revealTimeoutId);
  bottleArtifact.classList.remove('is-materializing');
  bottleArtifact.hidden = true;
  evidenceLog.hidden = false;
  syncStoryState();

  if (scene.story.stage === 'routine') {
    scene.story.stage = 'message-found';
    window.dispatchEvent(new CustomEvent('deadair:storychanged', {
      detail: { stage: scene.story.stage },
    }));
  }

  setFrequency(scene.frequency);
  evidenceLog.focus();
  window.dispatchEvent(new CustomEvent('deadair:bottlecollected', {
    detail: { stage: scene.story.stage },
  }));
}

/** Taktet die Story-Uhr und die sichtbare Anomalie sparsam mit 200 ms.
 * Jede Kamera zeigt nur ihre gegenwärtige Aktivität und keine Fortschrittsstufe. */
function runStoryClock() {
  const now = performance.now();
  if (scene.story.lastTick && isStoryRunning()) {
    const deltaMs = Math.max(0, now - scene.story.lastTick);
    scene.anomaly.activeMs += deltaMs;
    if (!scene.story.bottleVisible) {
      scene.story.elapsedMs += deltaMs;
    }
  }
  scene.story.lastTick = now;

  if (!scene.story.bottleVisible && scene.story.elapsedMs >= BOTTLE_APPEAR_AFTER_MS) {
    revealBottle();
  }

  if (isStoryRunning()) {
    if (scene.story.stage === 'windows-event'
      && scene.source === 'artwork'
      && scene.channel === 'unknown'
      && scene.anomaly.activeMs - scene.anomaly.windowsStartedAtMs >= WINDOWS_TO_SCAN_MS) {
      startAutoScan();
    }
    updateAutoScan();
    updateFinale();
  }

  investigation.tick();
  ending.tick();
  updateAnomalyMeter();
  scene.story.clockTimeoutId = window.setTimeout(runStoryClock, 200);
}

/** Zeigt die Einleitung einmal beim Start, passend zum gestapelten CSS-Layout.
 * Der native Dialog übernimmt Tastaturfokus, Escape und die modale Hintergrundsperre. */
function showCompactIntro() {
  if (window.matchMedia('(max-width: 750px), (max-height: 680px), (max-width: 1050px) and (max-height: 750px)').matches) {
    introDialog.showModal();
  }
}

/** Stellt nur bei explizitem Debugaufruf den komplexeren Abgleich bereit. */
function debugInvestigation() {
  if (scene.finale.mode) return;
  if (introDialog.open) introDialog.close();
  scene.relays.unlocked = true;
  scene.audio.secondReceived = true;
  scene.story.stage = 'relays-linked';
  for (const id of ['A', 'B', 'C']) scene.relays.linked.add(id);
  investigation.record('alexNote');
  investigation.record('syncNote');
  investigation.render();
  refreshRelayUI();
  syncSignalVisuals();
  openSyncDialog();
}

/** Bindet schlanke native Controls ohne Fremdbibliotheken. */
function init() {
  introDialog.addEventListener('close', () => {
    scene.story.lastTick = performance.now();
  });
  ending.attach();
  investigation.attach();
  soundscape.attach(transmissionAudio);
  soundscape.setPaused(scene.paused);
  root.dataset.bottle = 'hidden';
  root.dataset.story = 'routine';
  root.dataset.autoscan = 'idle';
  root.dataset.relays = 'inactive';
  root.dataset.finale = 'idle';

  // Sichtbare Debug-Sprünge nur auf ausdrückliche Aktivierung per ?debug=1.
  const debugMode = new URLSearchParams(window.location.search).get('debug') === '1';
  devConsole.hidden = !debugMode;
  if (debugMode) {
    document.querySelector('#dev-ending-dimension').addEventListener('click', () => { debugJumpToFinal('breach', true); ending.start('dimension'); });
    document.querySelector('#dev-ending-swing').addEventListener('click', () => { debugJumpToFinal('isolate'); ending.start('swing'); });
    document.querySelector('#dev-investigation').addEventListener('click', debugInvestigation);
    document.querySelector('#dev-gate-start').addEventListener('click', () => debugJumpToFinal('breach'));
    document.querySelector('#dev-gate-open').addEventListener('click', () => debugJumpToFinal('breach', true));
    document.querySelector('#dev-isolation').addEventListener('click', () => debugJumpToFinal('isolate'));
  }

  frequencyInput.addEventListener('input', () => setFrequency(frequencyInput.value));
  document.querySelectorAll('#source-switch button[data-source], #local-camera').forEach(button => {
    button.addEventListener('click', () => setSource(button.dataset.source));
  });
  languageToggle.addEventListener('click', toggleLanguage);
  pauseButton.addEventListener('click', togglePause);
  soundToggle.addEventListener('click', toggleSound);
  coastVideo.addEventListener('play', () => {
    if (isSeaFrozen() || scene.finale.phase === 'sealed') coastVideo.pause();
  });
  infoToggle.addEventListener('click', () => {

    infoDialog.showModal();
  });
  document.querySelector('#info-close').addEventListener('click', () => infoDialog.close());
  infoDialog.addEventListener('click', event => {
    if (event.target === infoDialog) infoDialog.close();
  });

  bottleArtifact.addEventListener('click', openBottleMessage);
  evidenceLog.addEventListener('click', openBottleMessage);
  messageClose.addEventListener('click', () => messageDialog.close());
  messageDialog.addEventListener('close', collectBottle);
  transmissionToggle.addEventListener('click', () => openTransmission('001'));
  transmission2Toggle.addEventListener('click', () => openTransmission('002'));
  relayToggle.addEventListener('click', () => openRelayLog());
  syncToggle.addEventListener('click', openSyncDialog);
  uplinkAction.addEventListener('click', transmitRescuePulse);
  syncClose.addEventListener('click', () => syncDialog.close());
  syncDialog.addEventListener('click', event => {
    if (event.target === syncDialog) syncDialog.close();
  });
  syncOffsetB.addEventListener('input', updateSyncUI);
  syncOffsetC.addEventListener('input', updateSyncUI);
  syncCommit.addEventListener('click', commitSignalAlignment);
  warningTranscriptToggle.addEventListener('click', openWarningTranscript);
  warningRecordingToggle.addEventListener('click', () => {
    if (canReceiveWarning()) void playTransmission({ recording: '003', restart: true });
  });
  // Erst nach einer Auswahl schließen; Escape darf die einmalige Entscheidung nicht umgehen.
  decisionDialog.addEventListener('cancel', event => event.preventDefault());
  decisionRescue.addEventListener('click', () => chooseRoute('rescue'));
  decisionIsolate.addEventListener('click', () => chooseRoute('isolate'));
  relayClose.addEventListener('click', () => relayDialog.close());
  relayDialog.addEventListener('click', event => {
    if (event.target === relayDialog) relayDialog.close();
  });
  relayLink.addEventListener('click', () => {
    if (getTunedRelay()) linkTunedRelay();
    else sendRelayPing();
  });
  relayBeacons.forEach(beacon => {
    beacon.addEventListener('click', () => openRelayLog(beacon.dataset.relay));
  });
  transmissionAudio.addEventListener('ended', () => {
    scene.audio.resumeAfterPause = false;
    scene.audio.resumeAfterVisibility = false;
    if (scene.audio.currentRecording === '003') {
      if (!canReceiveWarning()) return;
      receiverEventStatus.textContent = TRANSLATIONS[scene.language].warningFinished;
      if (!scene.warning.playbackCompleted) {
        scene.warning.playbackCompleted = true;
        if (transmissionDialog.open) transmissionDialog.close();
        openDecisionDialog();
      }
    } else {
      receiverEventStatus.textContent = TRANSLATIONS[scene.language].transmissionFinishedAnnouncement.replace('001', scene.audio.currentRecording);
    }
  });
  transmissionClose.addEventListener('click', () => transmissionDialog.close());
  transmissionDialog.addEventListener('close', () => {
    transmissionAudio.pause();
    scene.audio.resumeAfterPause = false;
    scene.audio.resumeAfterVisibility = false;
  });
  transmissionDialog.addEventListener('click', event => {
    if (event.target === transmissionDialog) transmissionDialog.close();
  });
  messageDialog.addEventListener('click', event => {
    if (event.target === messageDialog) messageDialog.close();
  });

  document.addEventListener('visibilitychange', () => {
    scene.story.lastTick = performance.now();
    if (document.hidden) {
      if (scene.relays.ping.inFlight) resetRelayPing();
      scene.audio.resumeAfterVisibility = !transmissionAudio.paused;
      transmissionAudio.pause();
    } else if (scene.audio.resumeAfterVisibility && !scene.paused) {
      scene.audio.resumeAfterVisibility = false;
      if (scene.audio.currentRecording !== '003' || canReceiveWarning()) void playTransmission();
    }
    void syncVideo();
    startGateFrames();
  });
  window.addEventListener('pagehide', () => {
    ending.dispose();
    investigation.dispose();
    resetRelayPing();
    coastVideo.pause();
    transmissionAudio.pause();
    window.clearTimeout(scene.story.clockTimeoutId);
    window.clearTimeout(scene.story.revealTimeoutId);
    window.clearTimeout(scene.cameraBlackoutTimerId);
    cancelAnimationFrame(scene.finale.animationFrameId);
  });

  setFrequency(scene.frequency);
  applySource(scene.source);
  updateTranslations();
  updatePlaybackLabel();
  updateSoundLabel();

  syncStoryState();
  updateAnomalyMeter();
  updateSyncUI();
  updateUplinkUI();
  updateFinaleUI();
  showCompactIntro();
  runStoryClock();
}

init();
