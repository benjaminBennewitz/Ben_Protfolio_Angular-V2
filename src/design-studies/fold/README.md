# FOLD. — There Is Always Another Side

[← Study overview](../../../README.md#standalone-design-studies) · [View live study](https://b2folio.de/design-studies/fold/)

An experimental 3D experience about changing perspectives. Six designed faces form a shared cube that can be explored through scrolling or swiping, then unfolded into a connected net.

> [!NOTE]
> This is a non-commercial, experimental design and development study created for personal learning, exploring technologies, and combining visual and interaction techniques. It is not a production product or a commercial service. Accessibility and production readiness are not the primary evaluation goals; support varies, and no comprehensive accessibility audit or WCAG conformance is claimed.

> [!IMPORTANT]
> The source is published for inspection and evaluation only. Public visibility does not grant permission to clone, copy, run, modify, or reuse it. The [portfolio license](../../../LICENSE) applies to original project contributions; third-party components retain their own terms.

## Concept and visual direction

**THERE IS ALWAYS ANOTHER SIDE.** Paper white and dark ink meet blue, coral, and yellow. Space Grotesk and DM Mono combine oversized statements with technical marginal notes. Changing the viewpoint becomes the narrative: the object remains connected while the camera moves around it.

The six perspectives carry the statements FOLD, LOOK CLOSER, TURN THE WORLD, CHANGE THE ANGLE, SAME PAGE. NEW WORLD, and THE WHOLE PICTURE.

## Interaction experiments

- Desktop document scrolling drives the camera between six cube faces.
- On mobile touch devices, a deliberate vertical swipe advances or returns by one station. A progress indicator accompanies the gesture.
- At the finale, the camera retreats, aligns the object, and opens connected panels along their hinges.
- The unfolded panels link back to their corresponding perspectives.
- Mobile unfolding has its own longer animation phase; a further gesture reaches the regular footer.

## Current technical approach

The active implementation uses **Three.js with CSS3DRenderer** and VanillaJS. Visible faces are HTML elements placed as CSS3D objects in one scene. The camera, quaternions, and nested hinge groups determine their spatial relationships. This is not a WebGL paper-physics simulation.

| Area | File / directory |
| --- | --- |
| Entry, import map, scene mount, and footer | [index.html](index.html) |
| Typography, panels, and responsive states | [style.css](style.css) |
| Active scene, camera path, folding, and touch input | [experience.js](experience.js) |
| Preview and other study assets | `assets/` |

The import map loads Three.js and CSS3DRenderer from a CDN. `script.js` and `paper-three.js` belong to earlier implementations and are not loaded by the current entry page.

The learning focus is spatial HTML composition, quaternion-based camera movement, linked folding geometry, and translating scroll progress into deliberate touch navigation.

## Performance and limitations

CSS3D matrix updates are skipped in resting chapter views, and processing pauses while the tab is hidden. Inactive faces use `inert` and matching ARIA states. Reduced-motion preferences skip scroll tweens and interpolation and disable the floating net motion; spatial navigation still exists.

The folding system uses flat panels and predefined hinges. Elastic paper bending, crumpling, and physical material simulation are outside its scope. Failed module initialization displays a fallback notice. The experiment does not claim complete keyboard, assistive-technology, or reduced-motion equivalence.

## Portfolio integration and sources

The study is served at `/design-studies/fold/` through Angular's asset configuration. Fonts are shared portfolio assets under `/assets/fonts/studies/`. The CDN modules require a network connection.

Original design and implementation are by Benjamin Bennewitz / B². Three.js and the fonts retain their own terms.
