# Scroll-driven split-paper reveal

## Implementation status

The first isolated implementation lives at `src/pages/paper-reveal.astro` on `feature/scroll-paper-reveal-setup`. It is a prototype route; the existing clinic homepage and PageFlip interaction have not been replaced.

## Rendering architecture

- The revealed page is normal responsive HTML underneath the cover.
- `html2canvas` captures the self-contained cover artwork. The capture is split into left and right canvas textures, then mapped onto separate Three.js meshes. The cover intentionally uses no remote image assets, avoiding cross-origin texture failures in this prototype.
- Each paper half uses subdivided `PlaneGeometry`; its vertices are re-mapped along a curved cross-section as scroll progress changes. The two halves move outward independently.
- Each half has a front texture, a pale underside material, an animated inner cut-edge mesh and changing vertex normals. Directional/ambient lighting plus a canvas drop shadow strengthen the paper cues.
- The stage uses CSS `position: sticky` while GSAP `ScrollTrigger` maps the track’s scroll progress to the same animation forward or backward. This avoids injected pin spacing, and it does not add delayed pointer-chasing animation.
- A CSS split-page fallback is prepared for WebGL/capture failure or context loss. It is intentionally simpler than the Three.js paper deformation.
- `prefers-reduced-motion: reduce` disables the transition and exposes the underlying page directly.

## Dependencies

- `three`: WebGL scene, paper meshes, lights and materials.
- `gsap` and `ScrollTrigger`: pinned, scroll-scrubbed reversible timeline.
- `html2canvas`: capture the actual cover DOM into a texture source.
- `@types/three`: TypeScript definitions.
- `page-flip`: retained for the existing homepage until the new behavior is reviewed separately.

## Known constraints to verify visually

- CI confirms Astro/TypeScript diagnostics and the production build; it does not prove visual fidelity, scroll feel or frame rate on a physical phone.
- The fallback uses CSS transforms and does not reproduce full mesh bending.
- If later cover art adds remote images, custom fonts or unsupported CSS, verify texture fidelity again. Prefer same-origin assets; do not silently ship missing or blurry content.
- The animation currently uses a purpose-built prototype cover and hidden-page design, not a screenshot of the existing clinic homepage.

## Acceptance checks

1. The blue cover is seamless before scroll; the center split opens without a flash.
2. Both halves bend independently, reveal the real HTML underneath, expose a light paper edge, and clear the viewport by the end.
3. Slow, fast and reverse scrolling work without laggy scrub interpolation or competing PageFlip touch handlers.
4. The revealed page becomes interactive and accessible at completion.
5. Rotation, mobile viewport resizing, texture capture failure, WebGL failure/context loss and reduced-motion are handled.
6. Visually test at least one desktop browser and an actual Android browser before deciding whether to integrate this into the homepage.
