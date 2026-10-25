# Abendwald und zentrale Spielzeit

Stand: 24. Oktober 2026. Ergänzung zum GDD und zu `ostpass-wald.md`.

## Spielzeit

Die Uhr startet um 09:00 Uhr. Eine aktive Spielsekunde entspricht einer Spielminute; ein vollständiger Tag dauert 24 aktive Minuten. Die Phasen sind Morgen (06–09 Uhr), Tag (09–17 Uhr), Abend (17–20 Uhr) und Nacht (20–06 Uhr). Übergänge in Helligkeit sind weich: Abend zwischen 17 und 20 Uhr, Morgendämmerung zwischen 05 und 07 Uhr. Auf der Ortskarte steht der Tagesabschnitt. Es gibt keine zusätzliche dauerhafte Zeitanzeige auf dem LCD.

Dialoge, Inventar, Journal, Karte, Getränkeauswahl, Systempause und ausgeschaltetes Spiel halten die Zeit an. Der vorhandene FrameLoop pausiert im verborgenen Tab; es wird keine Echtzeit nachgeholt. Die Uhr ist unabhängig von der bisherigen Animationszeit `game.time`. Auch in ruhigen Räumen fordert der bestehende Idle-Timer sparsame Aktualisierungen an. Speichern erfolgt unverändert bei Raumwechsel oder manuell mit SELECT, nicht periodisch.

Normales Schlafen im eigenen Bett heilt weiterhin und springt jetzt vorwärts zum nächsten Morgen um 07:00 Uhr. Nach einem Tod bleibt die bestehende Wiederbelebungs- und Beuterückholregel erhalten. Der Ausbau mit NPC-Tagesplänen, ruhenden Haustieren und nächtlich geschlossenen Häusern ist in `tagesablauf-und-nachtruhe.md` dokumentiert. Es gibt keine Questfristen.

## Einmalige Untersuchung der Wurzelpforte

Beim ersten erneuten Untersuchen der Tür nach diesem Patch wird zunächst der vollständige Untersuchungsdialog angezeigt. Seine Seiten bleiben bis zur Bestätigung mit A lesbar. Erst nach dem Schließen der letzten Seite beginnt der Abendübergang. Drei kurze Textschritte dauern jeweils drei Sekunden, insgesamt neun Sekunden; gleichzeitig gleitet die Außenwelt in den Abend. Die Uhr springt auf mindestens 19:00 Uhr. Ist es bereits später, verstreichen stattdessen nur weitere 30 Spielminuten; eine dunkle Nacht wird nicht zurückgedreht.

Bewegung, A, B und Journal bleiben während dieser kurzen Sequenz gesperrt. START pausiert sie weiterhin. Danach erscheint eine getrennte, manuell lesbare Abschlussmeldung über die verstrichenen Stunden und den dunklen Rückweg. Ein einmaliger Metallklang unterstützt das Geräusch hinter dem Stein. Die Tür bleibt verschlossen.

Die Untersuchung setzt `eastDoorStudied` genau einmal. Spielstände von vor der ersten Abendwald-Erweiterung können die Tür erneut untersuchen, um die Sequenz einmal zu sehen. Ist `eastDoorStudied` bereits gesetzt, bleibt die Untersuchung abgeschlossen; die Korrektur setzt weder Uhr noch Quest zurück. Weitere Untersuchungen erzeugen keinen zusätzlichen Zeitsprung. Türbeobachtung und Abendnotiz werden ohne Inventarfach ins Journal aufgenommen. Während des anfänglichen Lesedialogs bleibt die Uhr unverändert. Wird dort gespeichert und später geladen, kann die Tür erneut untersucht werden. Ein während des eigentlichen Abendübergangs gespeicherter Stand enthält bereits den logischen Abend und den Hinweis; beim Laden wird die Darstellung nicht erneut erzwungen.

## Rückweg und Begegnung

Nach der Untersuchung erscheint **Reisender Tamo** am Alten Forstkreuzweg bei (7,10), direkt auf dem durchgehenden Rückweg. Die zweite Wegreihe bleibt zum Vorbeigehen frei. Beim ersten Näherkommen ruft er den Spieler mit einer mindestens zehn Sekunden sichtbaren zweizeiligen Sprechblase an; beim Ansprechen verschwindet diese zugunsten des Dialogs. Verwendet wird die vorhandene NPC-Grafik bei (0,208). Er berichtet von einem Ruf mit seinem Namen aus Richtung der alten Steine und einer abgedeckten Kiste mit Laterne am hellen Tag. Das sind Beobachtungen, keine eindeutige Erklärung des Fremden. Der erste Bericht wird einmalig als `east-traveller` ins Journal übernommen; weitere Gespräche geben einen indirekten Hinweis auf den alten Waldsteig. Er hat eigene kurze Sprechblasen. Es gibt keine zusätzliche Münzbelohnung.

Eda und Mara behalten ihre bestehenden Aufgaben. Der Rückweg setzt keine Kämpfe voraus. Die Stoff-, Schleifspur- und Türbeobachtung können weiterhin unabhängig und in beliebiger Reihenfolge gefunden werden. Eda ordnet alle drei ein, Mara erhält anschließend den Bericht.

## Alter Waldsteig – Lösung

Nach der Türuntersuchung werden im Dornenbogen bei (18,18) **Verkeilte Zweige** sichtbar. Von dieser Seite lassen sie sich mit A lösen. Das setzt `eastShortcutOpen`, trägt den Steig im Journal ein und gibt den vorhandenen kleinen Erfolgsklang wieder.

Der offene Steig führt vom Dornenbogen direkt zur verlassenen Raststelle am Forstkreuzweg (Ankunft 17,17). Die vorherige Raststelle `dead-end` bei (18,18) führt danach zurück zum Dornenbogen (Ankunft 17,18). Beide Ankünfte sind begehbar, die normalen längeren Waldschleifen bleiben erhalten. Das Freilegen vergibt keine wiederholbare Gegenstands- oder Geldbelohnung. Der Durchgang ist ein aktivierbarer Innenpfad; die regulären äußeren Waldwege wechseln weiterhin auch beim Hinauslaufen am Kartenrand.

## Darstellung, Klang und Credits

Nur die Außenwelt wird mit einem zurückhaltenden dunklen Grünton abgetönt. Der maximale Deckungsanteil beträgt 36 Prozent; wichtige Kontraste bleiben erhalten. Dialoge, Sprechblasen, Karte, Rucksack, Lebensanzeigen und Systemmenüs werden danach in unveränderter Helligkeit gezeichnet. Innenräume und Dungeons erhalten keine Tageszeittönung. Bei reduzierter Bewegung entfällt die langsame Helligkeitsanimation, die kurzen Untersuchungstexte bleiben lesbar.

Bei dunkler Außenzeit werden die sitzenden Wald- und Dorfvögel nicht gezeichnet. Nach der Türuntersuchung erklingen im Wald in größeren Abständen kurze Grillenrufe und gelegentliches Rascheln. In Innenräumen, am Tag und während Dialogen oder Menüs verstummen diese geplanten Umgebungsgeräusche. Sie verwenden denselben SFX-Regler und Mute-Pfad wie alle vorhandenen Effekte. Bei Dunkelheit wechseln Wald und Bruchstein auf eigene Nachtstücke. Dorfhäuser verwenden inzwischen ebenfalls die Bruchstein-Nachtmusik; Werkstation und Dungeons behalten ihre eigenen Titel.

Keine neuen externen Assets. Tamo nutzt das vorhandene NPC-Paket von 5yvalia; Zweige und Wald verwenden die bisherigen Weltgrafiken mit den bestehenden Credits. Die drei neuen Geräusche (`forest-crickets`, `forest-rustle`, `forest-metal`) sind prozedurale Web-Audio-Klänge, implementiert mit Codex-Unterstützung im eigenen Projekt, ohne Fremdsamples. Offene Lizenznachweise der bisherigen Creditsliste bleiben bestehen.

## Speicherung und Prüfung

`worldMinutes` wird als optionale, geprüfte endliche Zahl gespeichert. Alte Stände ohne diesen Wert starten bei 09:00 Uhr, behalten aber alle vorhandenen Quests, Funde und Freischaltungen. Ungültige Uhrwerte werden vor jeder Zustandsübernahme zurückgewiesen. Untersuchung, Tamo-Gespräch und Abkürzung verwenden die vorhandenen Flags und Journalnotizen; das Save-Format bleibt Version 1.

211 Tests bestanden. Zusätzlich geprüft sind die frei lesbare Untersuchung vor dem Zeitwechsel, die neun Sekunden Übergangszeit, der Gruß auf dem gemeinsamen Rückweg und die Musikumschaltung. Neue Prüfungen decken einmaligen Zeitwechsel, Eingabesperre, Animationsbedarf, pausierte Uhr, alte und neue Saves, ungültige Uhrwerte, Schlaf bis zum Morgen, Erreichbarkeit der Begegnung, Abkürzung in beiden Richtungen, dauerhafte Freischaltung sowie Umgebungsgeräusche nur in passender aktiver Außenzeit ab. JavaScript- und Python-Konventionsprüfungen bestanden. Neun Ansichten wurden mit dem produktiven Canvas-Renderer geprüft: Tag, Untersuchung, Abenddialog, Reisender bei Abend und Nacht, Nachtgespräch, Ortskarte und geschlossener/offener Steig. Kein vollständiger manueller WebGL-/Mobile- oder abschließender Hörtest.


## Eigene Nachtmusik

- `forest-night.mp3` – „Zwischen schlafenden Kronen“: 192 Sekunden (3:12), ruhiges Mollmotiv, neuer harmonischer Mittelteil und ausgearbeiteter Höhepunkt mit Gegenmelodie.
- `bruchstein-night.mp3` – „Lichter in Bruchstein“: 192 Sekunden (3:12), warmer Dreiertakt, vertrautes Hauptthema, neue melodische Variationen und Höhepunkt mit voller Begleitung.

Beide Stücke sind eigenständige prozedurale Kompositionen des Projekts mit Codex-Unterstützung, ohne Fremdsamples. Der neue Generator `scripts/audio/tools/build_night_music.py` verwendet die bereits vorhandene Stimm- und Loop-Synthese aus `build_forest_music.py`. Python mit NumPy erzeugt WAV-Dateien; der vorhandene FFmpeg-Workflow exportiert MP3. Es sind keine neuen externen Musikcredits nötig.

Die zentrale Zuordnung `world-music.js` wählt ab 19:00 Uhr bis 06:00 Uhr die Nachtmusik. Dadurch gilt sie bereits für den ersten abendlichen Rückweg. Beim Morgenwechsel, auch nach dem Schlafen, kehrt die bisherige Tagesmusik zurück. Alle sechs Waldgebiete teilen sich denselben Nachttrack; ein Raumwechsel startet ihn nicht erneut. Der bestehende BGM-Regler, Mute-Pfad und die Musikverwaltung bleiben zuständig. Es gibt keinen neuen Musikplayer oder separaten Lautstärkeregler.

### Erweiterte musikalische Form

Die ursprünglichen Melodien, das Tempo und die Klangfarben bleiben erhalten. Beide Stücke umfassen jetzt 96 Takte mit je zwei Sekunden; der Wald behält seinen ruhigen Puls und Bruchstein seinen Dreiertakt. Die Erweiterung wiederholt nicht einfach den alten Export, sondern entwickelt neue Harmoniefolgen, vierteilige Melodievariationen, Bassantworten und eine selbstständige Gegenstimme.

| Zeit | Abschnitt | Entwicklung |
| --- | --- | --- |
| 0:00–0:16 | Einleitung | Wenige Melodietöne, ruhige Begleitung |
| 0:16–0:48 | Hauptthema | Vertraute Melodie mit leichten Antworten |
| 0:48–1:20 | Variation | Neue Harmoniefolge und bewegtere Melodielinien |
| 1:20–1:36 | Ruhepassage | Weniger Stimmen und bewusst mehr Raum |
| 1:36–2:08 | Aufbau | Zunehmende Dynamik, Bassbewegung und Arpeggien |
| 2:08–2:40 | Höhepunkt | Hauptthema mit eigenständiger Gegenmelodie und voller Begleitung |
| 2:40–2:56 | Rückkehr | Bekannte Melodie, weniger Stimmen |
| 2:56–3:12 | Ausklang | Ruhiger Übergang zur Einleitung für den Loop |

Der mittlere Gesamtpegel bleibt bei ungefähr −20,9 dBFS. Die Höhepunkte liegen etwa 7,4 dB (Wald) beziehungsweise 7,8 dB (Bruchstein) über der Ruhepassage. Sie entstehen aus musikalischer Entwicklung und zusätzlicher Stimmführung, nicht nur aus höherer Lautstärke. Die Zuordnung der Stücke und die Regler im Spiel bleiben unverändert.

Die fertigen MP3s wurden vollständig dekodiert: jeweils exakt 192 Sekunden und keine übersteuerten Samples. Peaks etwa 0,631 (Wald) und 0,561 (Bruchstein). Die Amplitudendifferenz am Looprand beträgt etwa 0,00062 beziehungsweise 0,00057. Die drei vorhandenen Tests zur Nachtmusik und die Python-Konventionsprüfung bestanden. Die früheren 211 Spieltests wurden für diese reine Musikrevision nicht vollständig wiederholt. Kein abschließender manueller Hörtest.


## Ausbau am 25. Oktober 2026

Die genaue Spielzeit erscheint auf der Ortskarte. Bewohner versammeln sich abends im Wirtshaus; nachts bleiben dort zwei Gäste beim Wirt. Tagtiere verschwinden, Haustiere schlafen an geschützten Orten, und private Hauseingänge respektieren die Nachtruhe. Alle Details, Ausnahmen und Prüfungen stehen in `tagesablauf-und-nachtruhe.md`.
