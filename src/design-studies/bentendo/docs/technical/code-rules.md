# Verbindliche Quelltextregeln

- Projekteeigene Quelldateien höchstens 450 Zeilen einschließlich Kommentaren und Leerzeilen.
- Jede Funktion höchstens 20 Zeilen vom Funktionskopf bis zur schließenden Klammer. JSDoc gehört zusätzlich zur Dateilänge.
- Jede JavaScript-Funktion einschließlich Konstruktor, Getter und Callback erhält einen deutschen JSDoc-Kommentar. Alle übergebenen Parameter werden mit @param dokumentiert.
- Python erhält deutsche Docstrings statt JavaScript-Kommentaren; dort gelten dieselben Längengrenzen.
- Kleinteilige, fachlich benannte Helfer; gemeinsame Kollision, Objektaktionen und Zustandsübergänge werden wiederverwendet.
- Keine parallelen Bewerbungs-/Skill-Systeme, keine versteckten DOM-Globals und keine Erweiterungen von Prototypen.
- Die CSS-Dateien enthalten den ausdrücklich vorgegebenen Kommentarblock unverändert. Darauf folgen Inhaltsverzeichnis und übereinstimmende Abschnittsüberschriften. Der historische Text im vorgegebenen Block beschreibt nicht den tatsächlichen Laufzeitstack dieses Projekts: Dieser bleibt Vanilla JavaScript, CSS und Three.js.
- Unveränderte Drittanbieterbibliotheken in vendor und installierte Entwicklungsabhängigkeiten sind Fremdcode. Sie werden weder künstlich zerlegt noch umkommentiert und sind von den projekteeigenen LOC-/JSDoc-Prüfungen ausgenommen.

`npm run check` prüft JavaScript mit Acorn, einschließlich verschachtelter Funktionen und Parametern, und kontrolliert die CSS-Struktur. `npm run check:python` prüft den Blender-Generator und die Python-Prüfung selbst. Tests werden in dieselben JavaScript-Regeln einbezogen.

Das System bleibt absichtlich klein: App koordiniert, Handheld zeichnet das Gerät, CartridgeState entscheidet über das Modul, Game verwaltet den Durchlauf. Räume sind Daten, die gemeinsame Systeme verarbeiten.
