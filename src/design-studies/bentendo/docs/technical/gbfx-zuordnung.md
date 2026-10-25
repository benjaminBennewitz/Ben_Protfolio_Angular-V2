# GBFX-Zuordnung

Patch auf den Stand mit Questbuch und Kartenhinweisen anwenden. ZIP im Projektstamm entpacken und Dateien ersetzen. Bestehende Spielstände bleiben erhalten.

| Ereignis | GBFX |
| --- | --- |
| Menüauswahl / Bestätigung | 00 Beep |
| Zurück / Abbrechen | 01 Beep |
| Herzheilung (Herzdrop, Verband, Bett) | 10 Bling Up |
| Ablehnung (fehlende Münzen, voller Rucksack, bereits volle Herzen beim Verband) | 11 Bling Down |
| Käfer / Schlangen: Treffer | 20 Pitch Up |
| Normaler Gegner besiegt | 21 Pitch Down |
| Spinne: Treffer | 33 Weird Pitch Up |
| Großer Gegner besiegt (vorbereitet) | 23 Pitch Down Echo |
| Bombe (vorbereitet) | 30 Explosion |
| Buff erhalten (vorbereitet) | 35 Pitch Up Echo |
| Buff abgelaufen (vorbereitet) | 36 Pitch Down Echo |

Unter Ton einstellen lässt sich MENÜ-BEEPS mit A umschalten oder mit links/rechts aus-/einschalten. Die Einstellung wird unabhängig vom Spielstand gespeichert; bestehende Einstellungen starten mit eingeschalteten Beeps. Spielrückmeldungen, mechanische Gehäuseklänge und Erfolgsmelodien bleiben unabhängig davon hörbar. Alle WAVs laufen über den vorhandenen Master-/SFX-Ausgang.

Die Klangbank wird nach Audiofreigabe im Hintergrund geladen. Bei noch nicht geladenen oder nicht erreichbaren Dateien spielt unmittelbar das bestehende Synth-Profil als Ersatz; kein Ereignis wird verspätet nachgeholt. Die endgültige Lautstärkebalance bitte im Spiel gegen die BGM beurteilen.

Tür, Truhe, große Erfolgsmelodien, Heldenschaden/-tod und Waffenschwünge bleiben erhalten. Bomben, Buffs und große Gegner sind Klangzuordnungen, keine neuen Spielmechaniken.

GBFX von Yogi (Tronimal), CC BY 4.0; Credits bei den Audiodateien.

Prüfung: npm run check; npm test: 174 erfolgreich.
