# Scroll-driven split-paper reveal: technical setup

## Status
This branch prepares the dependencies for an isolated prototype. It does not replace the existing PageFlip interaction and does not claim the visual effect is implemented.

## Dependencies
- `three`: custom subdivided paper meshes and WebGL rendering.
- `gsap` (including ScrollTrigger): map scroll progress to a reversible, pinned animation timeline.
- `html2canvas`: prototype-only DOM-to-canvas capture experiment. It is not assumed to reproduce every CSS feature or cross-origin image; test it before committing to this texture pipeline.
- `@types/three`: TypeScript definitions for Three.js.
- `page-flip`: retained while the current interaction remains available.

## Architecture
1. Keep the existing website content as normal HTML and keep the next page underneath the cover.
2. Build a temporary WebGL overlay for the moving blue cover only.
3. Split the cover into two meshes along the centre seam. Each mesh needs its own UV mapping, deformation, underside material and dynamic shadow.
4. Pin the stage during the reveal and bind the timeline to scroll progress. Reverse scroll must reverse the same timeline.
5. On completion, remove or disable the overlay and return control to the real HTML page. Provide a reduced-motion/WebGL fallback.

## Texture and asset risk
The current site uses remote imagery. A DOM capture may omit images, fonts, filters or other unsupported content; cross-origin assets may also prevent canvas capture. Prototype this first. If fidelity fails, use same-origin assets or a purpose-built cover texture from the real design. Never silently ship a degraded capture.

## Acceptance checks before integration
- Blue cover looks unchanged before scrolling.
- The centre seam opens gradually, both halves visibly deform and move in opposite directions.
- The underneath page is present from frame zero and is revealed through the opening.
- Fast, slow and reverse scroll all work without delayed input or competing PageFlip gestures.
- No blank frames, missing assets, duplicated active controls or scroll lock.
- Test on a real Android browser, with a reduced-motion fallback.

## Next implementation step
Create a standalone prototype route/component with placeholder cover artwork and a simple hidden page. Prove rendering, texture fidelity and touch-scroll behaviour before integrating the clinic page content.
