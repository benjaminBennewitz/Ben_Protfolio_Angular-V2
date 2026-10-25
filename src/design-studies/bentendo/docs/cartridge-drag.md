# Cartridge per Ziehen einschieben

Auf der Rückseite lässt sich die teilweise eingesteckte Kassette direkt mit gedrückter linker Maustaste in den Schacht schieben. Die Geste funktioniert auch mit einem Touch-/Stiftzeiger. Nur ein Raycast-Treffer auf dem tatsächlichen Cartridge-Modell startet den Vorschub, nicht ein Klick auf das Gehäuse. Bootvorgang, offene Hilfe, laufende Reglergeste und eine noch nicht fertig gedrehte Rückansicht sperren den Start.

Der Vorschub folgt der projizierten Strecke zwischen den bereits an das Modell angepassten Positionen `partial` und `seated`. Er ist auf diese Strecke begrenzt und verändert während des Ziehens nur die sichtbare Vorschau. Kamerawechsel sind über die vorhandene Gerätesperre blockiert; Pointer-Capture hält die Geste auch außerhalb des Modells fest. Beim Loslassen ab 65 % Vorschub führt der bestehende Cartridge-Controller die Aktion `push` aus: Gerät abschalten, Modul einrasten, bisherigen Klang und Statusmeldung ausgeben. Kürzere oder abgebrochene Züge gleiten in die Ausgangslage zurück. Reduzierte Bewegung übernimmt den Zielzustand unmittelbar.

Ein einfacher Klick bleibt beim bisherigen Betrachten-Verhalten. Pointer-Abbruch, Capture-Verlust, Fenster-Fokusverlust und andere Cartridge-Aktionen räumen Vorschau, Zeigersperre und Cursor auf. Andere Zeiger können die aktive Geste nicht übernehmen. Die automatische Rückseiten-Rückkehr wird nach dem Loslassen neu initialisiert und löst dadurch keine zusätzliche Kamerageste aus.

Der Button „Hineindrücken“ bleibt die tastaturbedienbare Alternative. Herausgenommene Module werden weiterhin über „Zurück in den Schacht“ teilweise eingelegt; danach ist direktes Einschieben möglich. Vollständig eingerastete Module werden durch Ziehen nicht wieder herausgezogen. Die vorhandene Schachtgeometrie und Verdeckung bleiben erhalten.

## Prüfung und Installation

60 Node-Tests sowie JS-/CSS- und Python-Strukturprüfungen bestanden. Vier neue Prüfungen sichern Vorschau, einmaliges Einrasten über den echten Controller, Freigabe des Captures, Abbruch/Fokusverlust, kurze und rückwärts gerichtete Züge, fremde Zeiger, einfachen Klick, erlaubte Startzustände und die Positionsinterpolation. Ein vollständiger Browser-/WebGL-Bedientest war hier nicht verfügbar.

Dieser Folgepatch setzt `BENTENDO_Baumraender_Bewohnersprueche_Meldungen_Patch.zip` voraus. Im bestehenden Projektordner entpacken und enthaltene Dateien ersetzen. Ausschließlich neue oder geänderte Dateien; keine Löschungen und keine zusätzlichen Assets.
