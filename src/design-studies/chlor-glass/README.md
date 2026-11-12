# CHLOR / GLASS — Botanical Light Laboratory

[← Study overview](../../../README.md#standalone-design-studies) · [Study path](https://b2folio.de/design-studies/chlor-glass/)

A material and spatial design study about the thin boundary between a living botanical scene and its viewer. Prototype 11 combines a continuous textured glass pane, a fine wire grid and three procedural environments.

The [portfolio license](../../../LICENSE) applies to original contributions. Three.js retains its MIT license and the copyright notices in its existing local distribution.

## Intent and graphic design

The visual question is how much information a surface can conceal while retaining the sense of a tangible space. A sharp, regular grid provides a reference plane. Layered green silhouettes, a warm light source and textured highlights suggest depth behind it. The visual language combines botanical observation with a restrained laboratory interface: compact monospaced labels, numbered arrangements and a typographic signature.

The interface stays at the edges rather than competing with the central material study. Opaque control surfaces preserve text contrast independently of the animated scene. Light/dark themes change both the interface and the greenhouse: muted daylight alternates with a darker forest-green room. A wide, softly illuminated opening replaces the previous bright pinpoint; real directional, point and hemisphere lights share a warm green/olive palette. The dark setting deliberately avoids blue highlights.

## Three arrangements

| Scene | Visual composition | Motion |
| --- | --- | --- |
| Normal | Open upper foliage, a continuous low planted border, warm diffuse light and pale glass | Small independent branch rotations |
| Dense | More branches and leaves, dense ground cover, narrow fern-like forms, deeper greens | Slow, layered plant movement |
| Frog | Vegetation and low ground cover with one blue-violet poison dart frog interpretation | Short forward climbing bouts, long rests, anchored feet and subtle breathing |

The frog is an intentionally stylized poison dart frog interpretation seen from underneath, with a shared procedural blue-violet skin texture with dark spots, articulated limbs and four separated digits per foot. It is not an anatomically exact species reconstruction. The belly, head and joints sit behind the pane; planted adhesive-disc and palm surfaces terminate less than 0.003 world units behind Z = 0. All toes point forward in foot-local space, with the rear toes slightly splayed outward rather than reversed. Hind feet sit higher beside the abdomen instead of trailing below the body. Prototype 10 reduces their lateral spacing, brings the ankles closer to the body and chooses the rear IK solution with a 0.4-unit lateral knee target in body-heading coordinates. Most residual folding occurs in depth. Overlapping ellipsoids replace the rear cylindrical segments and round the joint transitions. In stance, all four palm/sole surfaces flatten near the glass, as do the bases and middle portions of the digits. Prototype 11 widens the finger bases to 0.025 and distal sections to 0.023 world-unit half-widths while retaining a shallow 0.016-unit depth. Both segment endpoints share the toe-disc center depth in stance, so the near-glass strip runs continuously from palm to knuckle to toe pad. A rounded shared-geometry knuckle overlaps the sections. The finger frame keeps its broad transverse axis parallel to the pane even during peeling, avoiding tilted edges piercing the glass. During swing, the palm follows foot lift and the toes peel away in sequence; palms no longer remain 0.18 units behind the contact tips. The elbow/knee bend direction follows body heading. This remains a stylized interpretation rather than an anatomical reconstruction of the tree frogs shown in the references. The shader keeps contact discs clearer than the body. A lifted foot moves away from the pane and becomes softer until it lands again.

Climbing is a deliberately bounded design interpretation, not a biomechanical reconstruction of a named species. The animation follows three short, non-reversing climbing bouts separated by longer, unequal rests. The final position is retained rather than returning backwards along a closed route. The body advances continuously through each bout, aligned with its local forward direction; feet hold their positions during stance. Lower foot lift, a more compact limb posture and slightly staggered toe peeling replace the previous exaggerated hand-like movements. The front limbs retain two-segment inverse kinematics. Each hind limb now includes a separate ankle and elongated tarsal segment: the thigh remains tucked beside the body, the shin folds back in depth to a close ankle and the foot reaches forward beside the abdomen. An anchored ankle offset leaves two fixed-length segments to solve with inverse kinematics. Shared ellipsoid geometry provides thigh volume and rounded rear segments; no new geometry is created per frame. Existing meshes update without per-frame geometry construction. Skin, limb geometry and materials are shared. Pause, hidden-tab suspension and reduced motion freeze the existing scene clock and therefore the frog too.

### Behavioral research and interpretation

- The [National Aquarium's blue poison dart frog account](https://aqua.org/explore/animals/blue-poison-dart-frog) describes daytime foraging around leaf litter and other ground structures, with darker blue limbs/belly and black patches. It does not support an assumption that these frogs only move upward. The violet tint is an artistic choice.
- [Young et al., 2023](https://doi.org/10.1242/jeb.244833) report slower, deliberate vertical climbing with longer relative foot-contact periods in Australian green tree frogs, including pulling forelimbs and pushing hindlimbs. These are tree-frog findings, used here as general movement cues rather than species-specific poison-frog kinematics.
- [Hanna & Barnes, 1991](https://doi.org/10.1242/jeb.155.1.103) document toe-pad peeling during forward ascent and experimentally induced backward descent in tree frogs. Thus backward motion is possible; removing the reverse loop is a presentation decision, not a biological prohibition. Actual contact mechanics can also involve body areas; the model preserves the requested visual separation between clear toe pads and a blurred body.

The chosen bout lengths, pauses and route are authored animation parameters. They are not measurements of captive poison dart frog behavior.

## Interaction and accessibility

- Wallpaper mode hides the entire interface, makes its controls inert and focuses the canvas. A slow autonomous camera drift replaces pointer input while the existing plant sway continues. Escape or a click/tap restores the interface and its focus; any earlier pause is restored. Reduced motion and hidden-tab suspension remain in force. The mode is temporary and is exited after a graphics error.
- The large introductory title becomes a compact wordmark on the first pointer movement or touch. The semantic H1 remains present; reduced motion disables the transition.
- On mobile (up to 760px), settings start collapsed. A native button exposes the expanded state through `aria-expanded`, retains the active scene in its summary and remains usable after graphics errors. Desktop settings stay expanded; breakpoint changes and the skip link preserve access to the controls.
- Three native buttons select scenes and expose their selection with `aria-pressed`.
- Moisture is adjustable from 0–100%, defaulting to 40%. It combines a slow mist veil behind the near/middle foliage, a stationary mottled film and sparse stationary droplets on the inner glass surface. At 0% all three additions are disabled. The mist follows the existing simulation clock, so pause, reduced motion and hidden-tab suspension apply. The native range is labeled in DE/EN and is disabled with other graphics controls after errors.
- Frosting is adjustable from 50–100% of the existing material strength, retaining the 75% default. Both the native range input and renderer enforce these bounds; the fine wire mesh can be disabled independently.
- Pointer movement translates the perspective camera. Near, middle and canopy layers shift at different apparent rates through projection while plants remain anchored to the same ground as the greenhouse. Touch input on the canvas adjusts the same view without preventing normal document scrolling.
- Pause freezes plant, frog and pointer motion; material controls and scene selection remain usable.
- `prefers-reduced-motion` suppresses the animation loop and pointer movement. It is respected on startup and when the preference changes.
- Hidden tabs stop requesting frames. Back/forward cache navigation suspends and resumes the renderer; final navigation releases resources and listeners.
- DE/EN and light/dark use the existing `bp-language` and `bp-theme` browser-storage keys. Storage failure does not block startup.
- Native dialog semantics support Escape, focus containment and return to the information button. A skip link targets scene controls; visible focus styles accompany keyboard controls.
- At narrow widths the controls stack in normal body flow. The canvas remains a fixed background; no global inner scroll container is introduced.
- If WebGL 2 or the renderer cannot start, a translated error appears. Graphic controls are disabled while archive navigation, theme, language, legal links and study information remain available.

No comprehensive WCAG conformance or mobile GPU performance certification is claimed.

## Architecture

| Responsibility | File |
| --- | --- |
| Semantic interface, metadata and study entry | `index.html` |
| Tokens, themes, numbered sections and responsive layout | `styles.css` |
| DOM, preference handling, lifecycle events and translations | `scripts/app.js` |
| Bilingual content, scene presets and seeded random generator | `scripts/content.js` |
| Renderer, camera, render target and frame scheduling | `scripts/experience.js` |
| Three vegetation layers, shared leaf geometries, albedo/relief textures and plant generators | `scripts/plants.js` |
| Greenhouse wall, structural bars, floor, fog and theme-aware lighting | `scripts/environment.js` |
| Frog skin, contact anchors, inverse kinematics and climbing | `scripts/frogs.js` |
| Glass shader and compositing pass | `scripts/glass.js` |
| Original procedural archive illustration | `assets/preview.png` |

New JavaScript files follow the root project's file-header and German JSDoc conventions; CSS follows its author header, table of contents and numbered sections. No inline CSS comments are used. New code has two-space indentation and CRLF line endings according to `.editorconfig`.

### Rendering approach

1. A perspective camera renders the greenhouse, canopy, middle foliage and near foliage into isolated, transparent render targets. The frog receives a separate target; it no longer shares the near-plant texture. The same scene lights remain active in all passes.
2. Targets use up to four hardware multisamples, limited by renderer capabilities, before mipmap generation. This reduces subpixel coverage changes in thin greenhouse frames, stems and toes. Only the frog target resolves a depth texture.
3. Each layer builds its own mipmap pyramid. Color and coverage are filtered together as premultiplied RGBA, preventing a bright background from being baked into foreground edges before blur.
4. A five-sample weighted mip filter uses a stable representative distance for each layer: greenhouse 16, canopy 14, middle 8, near foliage 2.5 and frog 0.55 world units behind the pane. These distances preserve the hierarchy without switching filter widths at raw depth discontinuities. Background frames now receive the same distant diffusion as the rest of the greenhouse, replacing the insufficient fixed eight-pixel background filter from prototype 06.
5. Layers are composed back to front with `foreground.rgb + background.rgb * (1 − foreground.a)`. The frog uses its depth only for a narrow, coverage-weighted contact mask: actual near-glass pixels blend towards the antialiased unblurred frog color, while the body retains a stable soft filter. A lifting toe loses contact clarity as it moves away. Depth no longer changes the blur radius of surrounding plant pixels.
6. A low-frequency two-noise mist veil is composed between canopy and middle foliage. Time advances from the existing simulation clock only. A static, screen-anchored condensation mask perturbs refraction and adds a restrained droplet edge; smooth distance coverage reduces aliasing. A broad stationary film varies surface opacity. These additions share `uMoisture`; they introduce no extra render targets or particle allocations.
7. Glass texture, its fine fixed grid and the final color-space/tone-mapping pass follow composition.

Prototype 06 removed pale outlines by separating color layers, but its per-pixel depth-dependent blur radius could jump at moving silhouettes and the greenhouse background was too sharp. Prototype 07 retains isolated premultiplied composition and replaces those unstable radii with fixed depth strata. This trades within-layer variation for temporal stability; it is deliberately not a continuous optical depth-of-field model. Background rendering uses 50% of the output dimensions, canopy and middle layers 60%, and foreground/frog full output resolution. Scene meshes belong to one pass each. Wallpaper controls and autonomous movement remain unchanged.

This is a depth-layered raster approximation, **not** physically exact volumetric scattering, ray tracing or an actual fluid simulation. Its surface highlight is analytically composed; it does not reflect arbitrary scene objects or the viewer. Background plants remain genuine lit 3D meshes. The canopy lies about 12.5–15.5 world units behind the pane, middle foliage about 6.6–9.6 and near foliage about 1.9–3.3. Each depth layer additionally contains 1.4–3.2-unit-tall ground plants. A stratified horizontal distribution limits bare gaps at the base; a separate seeded generator preserves the existing taller vegetation. Ground leaves reuse the same geometry/material batches, textures and anchored sway. Every plant stem originates at the actual soil plane Y = −5.9; the previous independently hanging branches have been removed. Camera-based parallax replaces vertical translation of individual plant layers, keeping the stems grounded during pointer movement too. Atmospheric fog, greenhouse bars and the floor provide additional spatial cues even at the minimum frosting setting.

Shared leaf geometries, materials and textures keep allocations bounded. Three leaf species with two curvature variants use locally generated 256 × 512 color and relief maps: contrast-separated primary and secondary veins, fine branching, larger pigment patches and microstructure are shared between materials. Colored albedo, vein shadows and stronger vein widths make the texture readable when the pane is clear. Relief drives both bump and roughness; a restrained clearcoat adds a waxy highlight. Leaves are grouped into at most eighteen instanced batches per depth layer instead of individual draw calls; branch-local matrices are updated into those batches during motion. Scene changes dispose their old scene-owned assets. The renderer, isolated render targets and glass pass are reused. Drawing resolution is capped at a 1.5 device pixel ratio and 1800 pixels on the longest edge, with a maximum scheduling rate of 40 frames per second. Actual frame rates depend on device and display refresh. Floating-point targets are used when supported, otherwise byte targets are selected.

### Existing local dependencies

The study imports `../bentendo/vendor/three/three.module.js` and that module's adjacent `three.core.js`. Reusing the already supplied local Three.js copy avoids a second large vendor bundle, an external CDN and changes to the Angular dependency graph. It is an explicit cross-study dependency: if BENTENDO is removed or its vendor is relocated, update the imports and both deploy checks together.

Fonts reuse `../../assets/fonts/inter-variable.woff2` and `jetbrains-mono-variable.woff2`. The Angular asset rule already copies the new directory. No route component or new npm package is necessary. Both deployment scripts validate the new runtime, its preview and these shared resources before upload or file synchronization. The archive entry, its German translation and sitemap entry are included.

## Development and validation

Run the existing portfolio `npm ci` and `npm run build:production`. The resulting entry is `dist/ben-portfolio-experience/browser/design-studies/chlor-glass/index.html`. Serve the full browser build over HTTP so relative module and font dependencies resolve; opening the HTML via `file://` is unsupported.

Targeted Angular checks:

```bash
npm test -- --watch=false --include='src/app/pages/archive-page/archive-page.component.spec.ts' --include='src/app/core/data/portfolio-content.spec.ts'
```

The archive checks cover the new DS/012 entry, both search languages, stable existing identifiers and category integration. The initial archive integration passed all 21 targeted Angular checks. Prototype 02 additionally verifies mobile collapse/expand, the active-scene summary, DE/EN, breakpoint changes, title minimization, scene/theme callbacks and skip-link access against the actual UI module with a mocked renderer. Native OpenGL validation also compiles and renders the glass and background shader cores in both themes at 0% and 100% frosting and checks finite geometry, deterministic plant generation, layer parallax and scene-resource disposal. Prototype 03 additionally checks perspective size reduction, common ground anchors, separation of frog body/contact surfaces and the mipmapped depth-aware shader. Prototype 04 additionally checks a complete 32-second climb loop (1,921 poses), stable planted feet, one lifted foot at a time, delayed body movement, fixed limb lengths, continuous step boundaries, finite transforms, GPU resource disposal and the 50–100% frosting bounds. Prototype 05 additionally samples two minutes of behavior, checking monotonic upward body travel, genuine resting phases, stable stance contacts, low foot lift, continuous bout boundaries and finite transforms. Prototype 06 additionally checks that a dark foreground cannot brighten its background at 100% frosting, render-pass isolation and visibility restoration, autonomous wallpaper drift, reduced-motion scheduling, inert UI controls, Escape/click exit, focus return and restoration of the earlier pause state. Prototype 07 additionally compiles/renders the revised shader in all scenes and themes, checks subpixel silhouette motion across consecutive frames, confirms that empty frog depth cannot affect plant blur or surface frosting, retains the no-bright-halo check, and verifies forward-facing rear toes throughout the existing motion checks. Prototype 08 additionally samples the folded hind limbs over two minutes: fixed thigh, shin and tarsal lengths; knees above ankles; feet ahead of ankles; stable stance contacts; continuous climbing transitions; finite transforms and complete resource disposal. The new hind-leg proportions were inspected in enlarged native shader renders against the supplied underside photographs. No source photograph is bundled. Prototype 09 additionally checks stratified ground coverage in every scene, unchanged tall-plant placement, deterministic regeneration and disposal; the renamed DE/EN scenes; moisture input bounds and renderer synchronization; stationary droplets and continuous mist time, and absence of additional render targets. Native scene renders cover both themes at 50% and 100% frosting with the default moisture. Synthetic GPU checks additionally compare moisture off/on and consecutive mist frames. Prototype 10 additionally samples two minutes of motion with the compact knee limit, fixed rear segment lengths and forward-facing feet. Four resting palm surfaces and sixteen toe discs must remain just behind the pane; lifted palms must recede from it. Existing rest phases, contact anchors, continuous bout boundaries and GPU disposal remain checked. Enlarged native renders inspect the compact silhouette and palm contact, without changing the accepted glass shader. Prototype 11 additionally checks both ends of every finger section throughout stance, minimum finger width, and no glass penetration during peeling. Existing knee limits, palm/toe contacts, rest phases, route continuity and resource disposal pass the same two-minute sampling. Enlarged native rest renders compare finger thickness and continuous contact. This auxiliary renderer is not a substitute for Three.js browser validation: the available browser could not create a WebGL context. Browser inspection verified archive-card integration, language switching, the native information dialog and the graphics-error state. Shader and visual verification require a working graphics context; a successful Angular build alone does not validate WebGL.

## Reference and authorship

The supplied screenshots and [the post shared by @neilsonks on X](https://x.com/neilsonks/status/2118757539957633115) informed the material direction. The original visual creator has not been independently verified; the account is cited as the source of the shared reference, not asserted to be its original author.

All geometry, material code, plant vein texture, interface and archive illustration in this study were created for this implementation. No screenshot, video frame, plant photograph or frog image from the reference is bundled.
