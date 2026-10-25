# Hörbarere Öffnungsklänge und Fundjubel

Die BGM läuft bei gleicher Reglerstellung mit 90 % ihres bisherigen Pegels. Tierlaute erhalten gegenüber dem letzten Patch weitere 20 % Verstärkung: Faktor 4,2 für tonale Laute und 7,2 für das gedämpfte Rauschen. Bootlautstärke und allgemeine Bedienklänge bleiben erhalten. Der gemeinsame Lautstärkeregler und Mute gelten weiterhin für alle Kanäle.

Raumwechsel spielen ein kräftigeres, zweigeteiltes Türprofil mit höherem Frequenzanteil. Truhen besitzen einen eigenen deutlicheren Öffnungsklang. Bei erfolgreichem Truhenfund mit Gegenstand, Münzen oder neuer Notiz folgt nach 340 ms eine kurze aufsteigende Erfolgsmelodie. Der Öffnungsklang endet vorher. Der bisher gleichzeitig gestartete Pickup-Piepser entfällt bei Truhen; Vasen und lose Notizen behalten ihren Fundklang. Leere Truhen erzeugen keinen Jubel; wiederholt angesehene oder wegen vollem Rucksack nicht geöffnete Truhen geben weder Öffnung noch Erfolg erneut aus.

Die Verteilung der Spielklänge liegt jetzt in `scripts/audio/game-cues.js` und wird vom AudioManager aufgerufen. Ist der Browser-Audiokontext noch pausiert, wartet der AudioManager auf dessen Aktivierung, übernimmt den aktuellen Reglerwert und spielt erst dann. Der Klang wird damit nicht mehr allein wegen einer noch laufenden Wiederaufnahme verworfen. Nicht unterstützte oder weiter blockierte Audiokontexte erzeugen weiterhin keine Quellen.

## Prüfung und Installation

51 Node-Tests und die JS-/CSS- sowie Python-Strukturprüfungen bestanden. Geprüft sind unter anderem echte Tür-/Truhenereignisse, Routing an Syntheseprofile, zeitversetzter Fundjubel, Wiederaufnahme vor Klangstart, Musikfaktor 0,9, Regler/Mute und einmalige Beute bei vollem Rucksack. Ein Browser-/Hörtest war hier nicht verfügbar; die wahrgenommene Balance muss im Spiel beurteilt werden.

Dieser Folgepatch setzt `BENTENDO_Interiors_L_Theke_Tierklang_Patch.zip` voraus. Im bestehenden Projektordner entpacken und enthaltene Dateien ersetzen. Er enthält ausschließlich neue oder geänderte Dateien, keine zusätzlichen Assets und keine Löschungen.
