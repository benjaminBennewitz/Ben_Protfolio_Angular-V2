# BENTENDO™ / DUNGEON WANTED

[← Study overview](../../../README.md#standalone-design-studies) · [View live study](https://b2folio.de/design-studies/bentendo/)

An interactive 3D handheld with a working cartridge and a playable pixel RPG. The device provides the physical stage while DUNGEON WANTED maintains its own game world and state. This is an evolving prototype, not a finished game release.

> [!NOTE]
> This is a non-commercial, experimental design and development study created for personal learning, exploring technologies, and combining visual and interaction techniques. It is not a production product or a commercial service. Accessibility and production readiness are not the primary evaluation goals; support varies, and no comprehensive accessibility audit or WCAG conformance is claimed.

> [!IMPORTANT]
> The source is published for inspection and evaluation only. Public visibility does not grant permission to clone, copy, run, modify, or reuse it. The [portfolio license](../../../LICENSE) applies to original project contributions; third-party components retain their own terms.

## Concept and visual direction

The study connects a nostalgic handheld homage with an explorable adventure world. The shell, power switch, contrast and volume wheels, cartridge, and LCD respond to input. The handheld model was created entirely with Python for this project. Music was created using free tools and AI.

BENTENDO and DUNGEON WANTED are fictional project names. The study is independent of Nintendo; trademarks remain with their respective owners.

## Device and input experiments

- Inspect, turn, insert, and virtually blow into the cartridge; no microphone access is involved.
- Power the device through its switch and reach different shell views through pointer, touch, or the controls panel.
- Use keyboard input, touch controls, or the visible device buttons to interact with the game.
- Arrow keys move the character; A/Space interacts; B opens the backpack or closes dialogs; START/Enter/P pauses; SELECT/S saves.
- Adjust master volume, music, and effects separately, plus display contrast and optional simulated contact issues.
- Inspect rooms or LCD noise through the debugging interface.

The [credits page](credits.html) opens in a separate tab from study navigation, preserving the running session.

## Game world and systems

Bruchstein, with explorable interiors, residents, and animals, is the starting hub. Quests, a journal, inventory, and a map lead into forest areas, a pipe puzzle, and the first combat dungeon. Day/night progression, resident routines, tavern guests, and rest choices extend the world.

Save data, character selection, and audio settings stay in the browser and are bound to its origin. Data is not automatically shared across domains or browsers.

## Architecture

| Area | Responsibility |
| --- | --- |
| [index.html](index.html), `styles/` | Interface controls, device presentation, and dialogs |
| `scripts/core/` | Configuration and orchestration |
| `scripts/device/` | Models, camera, cartridge, and input |
| `scripts/display/` | Canvas LCD and graphic loading |
| `scripts/game/data/` | Rooms, characters, and content definitions |
| `scripts/game/systems/` | Rules, movement, combat, quests, and saves |
| `scripts/game/render/` | World and game interface rendering |
| `scripts/audio/` | Audio management, effects, and authoring utilities |
| `tests/`, `scripts/checks/` | Game tests, integration checks, and structural validation |
| `assets/`, `vendor/` | Models, sprites, media, and local Three.js runtime |
| `docs/` | Existing technical, visual, and game development records |

The device uses Three.js and the game uses a Canvas LCD, coordinated through VanillaJS modules. The import map references locally bundled Three.js files. The game does not instantiate Angular or depend on an iframe.

The learning focus is combining device interaction, 3D presentation, a 2D game renderer, modular game rules, persistent state, and coordinated audio.

## Scope and limitations

The repository contains automated checks for game behavior and portfolio integration, alongside code-structure checks. These do not establish a finished game, comprehensive device support, or full accessibility. Keyboard and touch controls are implemented within the experimental interaction model.

## Portfolio integration and sources

The study is served at `/design-studies/bentendo/`. Angular publishes runtime files while excluding tests, internal documentation, Blender sources, selected authoring utilities, and study package metadata according to `angular.json`. The card uses an SVG handheld composition with an LCD excerpt rendered by the game.

Sources and modifications are recorded in [CREDITS.md](CREDITS.md) and the [public credits](credits.html). The separate GBFX sound effects remain third-party assets under CC BY 4.0. The documented question about distributing the dungeon atlas is independent of the project's Python model and AI-assisted music.

Runtime scripts, tests, and development records stay within this study. The root-level `/scripts/` ignore rule applies only to local portfolio deployment utilities.
