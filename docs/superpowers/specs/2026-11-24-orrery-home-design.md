# Orrery home page — design

Date: 2026-11-24 · Status: for approval (builder check done) · Branch: `feature/orrery-home` (from `master`)
Prior art: throwaway prototypes on branch `spike/home-3d` — `spike/orrery/` (chosen direction) and `spike/workbench/` (rejected direction, but its drone and breadboard models are reused).

## Intent

The home page of anasvhora.tech is a 2D canvas "constellation" star map (`src/canvas/UniverseCanvas.jsx`). Anas wants the home page to become a rich, modern 3D experience that feels award-level, without touching the rest of the site.

The chosen concept is **the Orrery**: a brass-and-glass orrery floating in space. Each discipline is an orbital ring and each project is a body on its ring. It is the same "universe" story the site already tells (boot screen "SYS / CONSTELLATION", warp sound, dive-into-a-star transition, gold-on-navy Bodoni identity), given real depth.

Why the Orrery over the Workbench (Anas agreed): it fits the existing identity, looked premium on the first pass, scales as projects are added (new project = new body), and the rings explain at a glance what Anas does.

## Goals

1. On capable devices, the home page background is a real-time 3D orrery (react-three-fiber) instead of the 2D star map.
2. Everything that works today keeps working unchanged: boot sequence, HUD, hero name/tagline/hint, the "Now viewing" card (including its looping shine animation), cinematic audio, keyboard model (arrows / Enter / Esc / Tab), wheel and touch browsing, deep links, case-study dive transition, screen-reader nav, prerendered OG tags.
3. Four rings, one per discipline. Assignment is by the first matching role in this priority: **Odoo** (`Odoo`) > **Hardware** (`IoT`, `Embedded`, `ML`) > **Mobile** (`Mobile`, `Android`) > **Web** (everything else: `Frontend`, `Full-stack`, `UI/UX`, `Systems`, `AI`, `Research`, …).
4. Borrowed from the Workbench: hardware projects are tiny 3D models instead of spheres — the quadcopter (Auto-Balancing Drone) and the breadboard + Arduino (Gesture Smart Home), adapted from `spike/workbench/main.jsx`. Any future hardware project without a model falls back to the octahedron from the orrery spike.
5. Borrowed from the Workbench: the selected body shows its real screenshot (`project.image`, falling back to `thumb`) on a small glowing glass pane floating beside it, fading in on selection.
6. Phones get a version of the Orrery too (see Tiers).

## Non-goals

- No changes to `/work`, `/work/:slug`, `/about`, `/contact`, the case-study screen, or content/manifest data.
- No new copy, no redesign of the HUD or hero overlay.
- The spike's own HTML overlay (title, legend, its "Now viewing" panel) is **not** carried over; the site's existing overlays stay. A small discipline legend may be added if it fits the existing HUD style (builder's call), but nothing may sit over the hero name.

## Anti-goals (failure even if it "works")

- Any label, pane or body drawn over the hero name/tagline or the "Now viewing" card.
- Camera motion that is fast, swoopy or close enough to feel nauseating; the spike's "after 3 arrow presses the camera is in the body's face" is the example of what not to ship.
- A slower first paint than today on any route.
- A generic "three.js demo" look: flat unlit spheres, default grey, primitive-looking shapes.
- Breaking keyboard, deep links, the dive transition, or the prerender build.

## Integration contract (decided)

- New component `src/canvas/OrreryCanvas.jsx` (plus a small folder of parts if needed), default export with the **same props as `UniverseCanvas`**: `({ projects, onStarSelect })`. `UniverseShell.jsx` picks which one to lazy-load. Allowed shell/store changes: that choice, the tier resolution below, the error-boundary fallback, and the deep-link deferral below. Nothing else.
- *Decided by Claude:* `qualityTier` is resolved synchronously as the store's initial value (move the existing media-query logic from the shell's effect into `universeStore.js`), so a reduced-motion or save-data visitor never starts downloading the Orrery chunk.
- *Decided by Claude:* deep links (`/work/x`, `/about`, …) still mount the background canvas as today, but the Orrery's lazy import is deferred to `requestIdleCallback` (fallback `setTimeout` 1500 ms) so it never competes with the panel's first paint. Until it arrives the background is the plain dark backdrop (no 2D canvas swap). On `/` it loads during the boot sequence as before.
- State it reads from `useUniverseStore`: `focusedSlug`, `pointer` (normalised parallax input), `qualityTier`, `panel`.
- It does **not** register its own keyboard, wheel or touch handlers. The shell already turns arrows / wheel / swipes into `focusedSlug` changes; the Orrery only reacts to `focusedSlug`.
- Click / tap on a body: if it isn't the focused one, call `onStarSelect(slug)` (focuses it); if it is, call `onStarSelect(slug, { open: true })` (opens the case study). Hover shows a pointer cursor and a highlight.
- Every frame it writes the focused body's screen position to the exported `starScreen` object (`starScreen.x`, `starScreen.y` in CSS pixels), exactly as `UniverseCanvas` does, so the case-study dive opens from the body.
- Canvas is `aria-hidden`; the screen-reader nav remains the accessible path.
- `three` and friends must only be imported inside the lazily loaded chunk so the prerender step (`scripts/prerender.mjs`, Vite `ssrLoadModule`) never evaluates them.

## Behaviour (decided)

- **Selection**: when `focusedSlug` changes, the focused body's ring rotates the shortest way so the body comes to the front-right of the orrery; other rings keep a slow idle drift. Camera eases (critically damped, ~0.8–1.2 s) to a framing where the focused body sits right of centre, the sun stays in frame, and at least part of every ring stays visible. There is a minimum camera distance; it never fills the screen with one body.
- **Labels**: only the focused and the hovered body show a name label. Others are unlabeled (the "Now viewing" card already names the focused project).
- **Screenshot pane**: appears beside the focused body on the side away from the hero overlay; never overlaps the hero name or card. Hidden on narrow screens (≤ 720 px). *Decided by Claude:* screenshots are cover-cropped to a 16:10 pane; projects with `imageKind: "logo"` use their `thumb` instead of the logo; textures are downscaled to ≤ 1024 px wide and created lazily (only for the focused body and its neighbours).
- **Idle**: slow ring drift and a gentle star twinkle. Pointer parallax tilts the whole orrery a few degrees.
- **Panel open** (*decided by Claude*): for the case study, the render loop pauses after the dive (~600 ms). For `/work`, `/about` and `/contact`, the builder checks each panel's backdrop: if it fully covers the canvas, pause immediately; if the canvas shows through, keep rendering but drop DPR to 1 and cap at ~30 fps. Resume full rendering when the panel closes; `starScreen` must be fresh again before the next dive.
- **Reduced motion** (*decided by Claude*): reduced-motion visitors stay in the `lite` tier and keep the 2D map, so the Orrery needs no reduced-motion mode beyond a guard (no idle drift if the media query flips at runtime).

## Tiers and fallbacks (decided)

`qualityTier` is already computed in `UniverseShell.jsx`:

| Tier | Who | Gets |
|---|---|---|
| `cinema` | desktop, >4 cores | Full Orrery: DPR up to 2, environment reflections on brass, real bloom (`@react-three/postprocessing`, in its own lazy chunk loaded only on cinema), screenshot pane |
| `balanced` | phones / ≤4 cores | Orrery-lite: DPR ≤1.5, no postprocessing (additive glow sprites instead), fewer stars, simpler materials; screenshot pane only on wide screens |
| `lite` | reduced motion / save-data | Existing 2D `UniverseCanvas`, unchanged |

Plus: if WebGL is unavailable or the Orrery throws, an error boundary renders the existing 2D canvas.

**Phones (portrait)**: camera pulled back and higher so the whole orrery fits under the docked hero; swipe up/down already changes focus via the shell; tap selects/opens.

## Performance budget

- *Decided by Claude:* the Orrery chunks (three + r3f + the drei parts used, counted in total including any vendor split Vite makes) ≤ 300 KB gzipped; the bloom chunk is extra and cinema-only. Check the size as soon as the skeleton renders. If bloom can't be made to look right cheaply, drop it and use the additive glow sprites on every tier.
- No regression in first paint: the boot sequence covers the chunk load on first visit; deep links never load it until the user goes home.
- Holds ~60 fps on a mid-range laptop at 1440×900 in `cinema`; the `balanced` tier must stay smooth on a mid-range Android phone.

## Done means

- Screenshots reviewed at 1440×900, 1280×720 and 390×844: initial view, after ArrowRight ×3, hovering a body, and the moment after Enter (dive in progress).
- Keyboard-only walk-through from the 2026-11-24 keyboard work still passes (boot skip, arrows, Enter, Esc returns focus to the card, Tab order).
- No console errors; `npm run build` (including prerender, 18 routes) passes.
- `lite` tier and the no-WebGL fallback both show the old 2D map.

## Left to the builder

Ring populations are uneven (today roughly Web 7, Mobile 4, Odoo 2, Hardware 2); that is accepted, and bodies are spaced evenly around their own ring. Exact materials and colours within the site palette (#07080c / #0c0e14 navy-black, gold #e8c547, text #f0f1f5), ring tilt and tick detail, star count, body sizes, ring colours, label styling, the precise camera framing numbers, whether a discipline legend is added, and how the drone/breadboard models are slimmed down for orbit scale.
