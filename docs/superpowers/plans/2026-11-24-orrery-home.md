# Orrery Home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the home page's 2D star-map background with a real-time 3D brass orrery on capable devices, keeping every existing behaviour of the site.

**Architecture:** A new lazily loaded `OrreryCanvas` (react-three-fiber) with the same props as today's `UniverseCanvas`, chosen by `UniverseShell` per `qualityTier`. Pure layout/tier logic lives in plain JS modules tested with `node --test`; visual behaviour is verified by one Playwright check script that drives the real site and asserts on DOM, URL and console.

**Tech Stack:** React 18, Vite 5, three@0.170, @react-three/fiber@8, @react-three/drei@9, @react-three/postprocessing@2 (cinema only), zustand, node:test, playwright-core (dev, uses system Chrome).

**Spec:** `docs/superpowers/specs/2026-11-24-orrery-home-design.md` — read it before every task; it is the authority on behaviour.

**Prior art:** branch `spike/home-3d` — `spike/orrery/main.jsx` (rings, glow sprites, Lightformer environment, camera lerp) and `spike/workbench/main.jsx` (`Drone` at line ~149, `Board` at line ~187, `Box`/`Cyl` helpers at ~78-92). Read with `git show spike/home-3d:<path>`; never check that branch out.

## Global Constraints

- Branch `feature/orrery-home`. Commit as `git -c user.name="Anas Vhora" -c user.email="58170112+anasvhora284@users.noreply.github.com" commit ...`. No AI attribution lines. Never push.
- `*.md` files are globally git-ignored on purpose: add docs with `git add -f`.
- React stays 18 → r3f 8.x, drei 9.x, postprocessing 2.x. three pinned to 0.170.x.
- Palette: navy-black `#07080c` / `#0c0e14`, gold `#e8c547`, text `#f0f1f5`. Fonts: Bodoni Moda (display), DM Sans (body), JetBrains Mono (labels) — already loaded by `src/index.css`.
- Ring priority: Odoo (`Odoo`) > Hardware (`IoT`, `Embedded`, `ML`) > Mobile (`Mobile`, `Android`) > Web (everything else).
- `three`/r3f/drei/postprocessing may only be imported from files under `src/canvas/orrery/` that are reached through `React.lazy`; never from the shell, store or anything `scripts/prerender.mjs` evaluates.
- Budget: Orrery chunks (three + r3f + drei parts + any vendor split) ≤ 300 KB gzipped total; bloom chunk extra and cinema-only.
- Do not change: `/work`, `/about`, `/contact`, case-study screen, HUD, hero overlay, content manifests, keyboard handling in the shell.
- Every task ends with `npm run build` passing (18 prerendered routes) and `npm run lint` passing on touched files.

## Review Focus

1. Window resize or phone rotation mid-session → camera re-frames; no label/pane overlaps the hero name or "Now viewing" card. (Task 5, overlap check at two sizes after resize.)
2. Mashing ArrowRight 10× in one second → the scene settles on the 11th project in sortOrder within ~1.5 s, card and scene agree. (Task 5.)
3. A project with neither `image` nor `thumb` (`strong-integrity-guide`) → no pane, no texture error, everything else normal. (Task 7.)
4. Tab hidden for a minute then shown → no camera/ring jump (frame delta clamped). (Task 5, `clampDelta` unit test.)
5. Deep link `/work/x`, then Esc → Orrery appears once loaded, and the next Enter dives from the focused body (`starScreen` fresh). (Task 3 and Task 9.)

---

### Task 1: Dependencies, test runner and pure orrery model

**Files:**
- Modify: `package.json` (deps + `"test": "node --test src/"` script)
- Create: `src/canvas/orrery/model.js`
- Test: `src/canvas/orrery/model.test.js`

**Interfaces:**
- Produces:
  - `RINGS: Array<{ key: 'Web'|'Odoo'|'Mobile'|'Hardware', radius: number, color: string }>` ordered inner→outer as `Web, Odoo, Mobile, Hardware` (radii and colours are the builder's; start from the spike's 2.6 / 3.8 / 5.0 / 6.2).
  - `ringKeyOf(roles: string[]): RingKey` — the Global Constraints priority.
  - `layoutBodies(projects): Array<{ slug: string, ring: RingKey, angle: number }>` — sorts by `sortOrder`, spaces bodies evenly per ring, angle in radians [0, 2π), deterministic.
  - `frontRotation(currentRot: number, bodyAngle: number, frontAngle: number): number` — the ring rotation that puts the body at `frontAngle`, reached by the shortest path from `currentRot` (result within π of `currentRot`).
  - `clampDelta(dt: number): number` — clamps a frame delta to ≤ 0.05 s.

- [ ] **Step 1:** `npm i three@0.170 @react-three/fiber@8 @react-three/drei@9` and `npm i -D playwright-core`; add the `test` script.
- [ ] **Step 2: Write failing tests** in `model.test.js` (`node:test` + `node:assert/strict`):
  - `ringKeyOf(["Full-stack","Odoo"]) === "Odoo"`, `(["IoT","Embedded"]) === "Hardware"`, `(["IoT","ML"]) === "Hardware"`, `(["Mobile","Systems"]) === "Mobile"`, `(["Systems","Android"]) === "Mobile"`, `(["Full-stack","Mobile"]) === "Mobile"`, `(["Frontend"]) === "Web"`, `([]) === "Web"`.
  - `layoutBodies` on a 5-project fixture (3 Web, 2 Odoo, shuffled sortOrder): every slug once; bodies on one ring are 2π/n apart; calling twice gives identical output.
  - `frontRotation(0, π/2, 0)` ≈ `-π/2`; `frontRotation(6π, 0.1, 0)` is within π of `6π`; for 200 random inputs `|result - currentRot| <= π + 1e-9` and `(bodyAngle + result - frontAngle) mod 2π ≈ 0`.
  - `clampDelta(0.016) === 0.016`, `clampDelta(60) === 0.05`.
- [ ] **Step 3:** Run `npm test` — expect FAIL (module missing).
- [ ] **Step 4:** Implement `model.js` (plain JS, no imports).
- [ ] **Step 5:** `npm test` — PASS (fixtures only; the real manifest imports images and can't load under plain node).
- [ ] **Step 6:** Commit `package.json package-lock.json src/canvas/orrery/model*.js` — "Orrery: pure ring/layout model and deps".

### Task 2: Synchronous quality tier

**Files:**
- Create: `src/store/qualityTier.js`
- Test: `src/store/qualityTier.test.js`
- Modify: `src/store/universeStore.js` (initial `qualityTier`), `src/universe/UniverseShell.jsx` (delete the tier `useEffect`, ~lines 125-135)

**Interfaces:**
- Produces: `resolveQualityTier({ reducedMotion: boolean, saveData: boolean, narrow: boolean, cores: number }): 'cinema'|'balanced'|'lite'` — same rules as today's shell effect: reducedMotion or saveData → `lite`; else narrow (≤768 px) or cores ≤ 4 → `balanced`; else `cinema`.

- [ ] **Step 1: Failing tests:** the four rule cases plus precedence (`reducedMotion` + `narrow` → `lite`; `cores: 4` desktop → `balanced`; `cores: 8` → `cinema`).
- [ ] **Step 2:** `npm test` — FAIL.
- [ ] **Step 3:** Implement; in the store compute the initial value from `window.matchMedia`/`navigator` (guard `typeof window`, SSR default `'lite'` so prerender never pulls 3D); remove the shell effect.
- [ ] **Step 4:** `npm test` PASS; `npm run build` PASS.
- [ ] **Step 5:** Commit — "Resolve quality tier synchronously".

### Task 3: Shell wiring, error boundary, deep-link deferral, minimal Orrery, check script

**Files:**
- Create: `src/canvas/orrery/OrreryCanvas.jsx` (default export), `src/canvas/orrery/Scene.jsx`, `src/canvas/CanvasBoundary.jsx`
- Create: `scripts/orrery-check.mjs`
- Modify: `src/universe/UniverseShell.jsx` (the `LazyCanvas` block only)

**Interfaces:**
- Consumes: `RINGS`, `layoutBodies` (Task 1); `qualityTier` (Task 2).
- Produces:
  - `OrreryCanvas({ projects, onStarSelect })` — reads `focusedSlug`, `pointer`, `qualityTier`, `panel` from `useUniverseStore`; writes `starScreen.x/y` (CSS px) for the focused body every rendered frame; click contract from the spec (unfocused → `onStarSelect(slug)`, focused → `onStarSelect(slug, { open: true })`); canvas wrapper `aria-hidden`; root element has `data-orrery="ready"` once the first frame rendered.
  - `CanvasBoundary({ fallback, children })` — class error boundary; renders `fallback` on error or when `!window.WebGLRenderingContext`.
  - `scripts/orrery-check.mjs <baseUrl> <outDir> [--expect 2d|orrery]` — exits 1 on any failure; reused and extended by later tasks.
- Shell rule: tier `lite` → `LazyCanvas` (2D) exactly as today; otherwise `<CanvasBoundary fallback={<LazyCanvas …/>}><LazyOrrery …/></CanvasBoundary>`. If the initial pathname is not `/`, render nothing for the Orrery until `requestIdleCallback` (fallback `setTimeout(…,1500)`) fires.
- Minimal scene for this task: four flat gold torus rings, an emissive sun sphere, one plain sphere per body at `layoutBodies` positions, camera fixed. Looks come in Task 4.

- [ ] **Step 1: Write the check script** (playwright-core, `executablePath: '/usr/bin/google-chrome'`, args `--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`). Checks, each printing PASS/FAIL:
  - `/` at 1440×900: press Enter (skip boot) → `[data-orrery="ready"]` exists within 10 s (or, with `--expect 2d`, a 2D `canvas` and no `[data-orrery]`); zero console errors/page errors.
  - Focus is on `.hero-overlay__focus` after boot skip; 3× ArrowRight → card name equals the 4th project by sortOrder (read the order from `window.__ORRERY_DEBUG__?.order` or from the screen-reader nav list order, builder's choice); Enter → URL `/work/<that slug>`; Esc → URL `/` and focus back on `.hero-overlay__focus`.
  - Deep link `/work/maths-website`: case study title visible before any request for a chunk whose name contains `Orrery`; after Esc, `[data-orrery="ready"]` appears.
  - Screenshots of each state to `<outDir>`.
- [ ] **Step 2:** Run against `npx vite --port 5310` — expect FAIL (no orrery).
- [ ] **Step 3:** Implement boundary, shell wiring, deferral, minimal Orrery.
- [ ] **Step 4:** Check script PASS. Emulate `prefers-reduced-motion: reduce` in a second run with `--expect 2d` → PASS.
- [ ] **Step 5:** Size check: `npm run build`, then `for f in dist/assets/*.js; do echo "$(gzip -c $f | wc -c) $f"; done | sort -n` — sum of Orrery-related chunks ≤ 300 KB; record the number in the commit message.
- [ ] **Step 6:** Commit — "Orrery: shell wiring, fallback, deep-link deferral, minimal scene".

### Task 4: The look

**Files:** Modify/create under `src/canvas/orrery/` only (`Rings.jsx`, `Sun.jsx`, `Bodies.jsx`, `Starfield.jsx`, `Lighting.jsx` — split as the builder sees fit).

**Interfaces:** Consumes Task 3's `Scene`. Produces nothing new.

Port and improve the spike's look: brass rings (high metalness, low roughness) with fine ticks; `Environment` built from `Lightformer`s (no CDN presets); ACES tone mapping; additive glow sprites (sun + bodies); glossy clearcoat spheres tinted per ring; drei `Stars` with gentle twinkle; slow idle ring drift; pointer parallax tilt of a few degrees from store `pointer`; DPR `[1, 2]`. Stop drift if `prefers-reduced-motion` flips at runtime.

- [ ] **Step 1:** Implement.
- [ ] **Step 2:** Check script PASS; read the 1440×900 and 1280×720 screenshots and compare to `git show spike/home-3d:spike/orrery` screenshots' level (brass reflects, sun glows, nothing reads as default grey). Iterate until it does.
- [ ] **Step 3:** Commit — "Orrery: materials, lighting, stars, idle motion".

### Task 5: Selection motion, camera framing, labels

**Files:** `src/canvas/orrery/Rig.jsx` (camera), `Bodies.jsx`/`Rings.jsx` (rotation, labels); extend `scripts/orrery-check.mjs`.

**Interfaces:** Consumes `frontRotation`, `clampDelta` (Task 1). Labels are drei `<Html>` elements with class `orrery-label` (DOM, so the check script can measure them).

Behaviour per spec: on `focusedSlug` change, the body's ring eases to `frontRotation(...)` (front-right); critically damped camera ease ~0.8–1.2 s; focused body right of centre; sun in frame; minimum camera distance; label only for focused + hovered bodies; hovering a body highlights it and puts the site's custom cursor in its hover state (see how `src/universe/CustomCursor.jsx` detects interactive targets). All per-frame motion uses `clampDelta(delta)`.

- [ ] **Step 1: Extend the check script:** after 0, 3 and 7 ArrowRight presses and after a resize 1440×900 → 1280×720: every `.orrery-label` and `.orrery-pane` bounding rect has zero intersection with `.hero-overlay__name` and `.hero-overlay__focus`; exactly one label visible when the pointer is parked at the top-left corner. Mash test: 10 ArrowRight presses in 1 s, wait 1.5 s, card name equals the 11th project and the visible label text equals it too.
- [ ] **Step 2:** Run — FAIL on the new checks.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** PASS; review screenshots after 3 and 7 presses: camera never fills the screen with one body; part of every ring visible.
- [ ] **Step 5:** Commit — "Orrery: selection, camera framing, labels".

### Task 6: Hardware models

**Files:** `src/canvas/orrery/models/Drone.jsx`, `src/canvas/orrery/models/Breadboard.jsx`, `src/canvas/orrery/models/parts.jsx` (Box/Cyl helpers), `Bodies.jsx` (choose model by slug).

**Interfaces:** Produces `HARDWARE_MODELS: Record<slug, Component>` = `{ 'auto-balancing-drone': Drone, 'gesture-smart-home': Breadboard }`; other Hardware bodies use an octahedron.

Adapt from the workbench spike, scaled to roughly a body's size, simplified for orbit (drop parts invisible at that scale); rotors spin and LEDs blink only in idle motion (off under reduced motion).

- [ ] **Step 1:** Implement.
- [ ] **Step 2:** Check script PASS; screenshot with the drone focused (`/` → arrows until card reads "Auto-Balancing Drone"): it reads as a quadcopter at a glance.
- [ ] **Step 3:** Commit — "Orrery: drone and breadboard bodies".

### Task 7: Screenshot pane

**Files:** `src/canvas/orrery/Pane.jsx`, `Bodies.jsx`.

**Interfaces:** Pane is a drei `<Html>` (class `orrery-pane`) or an in-scene plane plus an invisible `<Html>` marker with that class — builder's choice, but the `.orrery-pane` rect must match what's on screen. Source: `imageKind === "logo" ? thumb : image ?? thumb`; none → no pane. Cover-crop to 16:10; downscale to ≤ 1024 px wide; textures created lazily for the focused body and its two neighbours only. Hidden at viewport width ≤ 720 px. Fades in on selection.

- [ ] **Step 1: Extend the check script:** with focus on `strong-integrity-guide` there is no `.orrery-pane` and no console error; with focus on `input-leaf` the pane's image `src`/texture source is its `thumb`; at 390×844 no `.orrery-pane` is present.
- [ ] **Step 2:** Run — FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** PASS (plus the Task 5 overlap checks still PASS with the pane present).
- [ ] **Step 5:** Commit — "Orrery: screenshot pane".

### Task 8: Bloom (cinema only)

**Files:** `src/canvas/orrery/Bloom.jsx` (lazy-loaded from `Scene.jsx` only when tier is `cinema`).

- [ ] **Step 1:** `npm i @react-three/postprocessing@2`; implement a subtle Bloom (sun and glows only, threshold so brass and text don't smear).
- [ ] **Step 2:** Build; confirm the postprocessing code sits in its own chunk and the Task 3 budget still holds. If the look isn't clearly better than the sprite glow at 1440×900, remove the dependency and this task's file instead (spec allows it) and say so in the commit.
- [ ] **Step 3:** Check script PASS. Commit — "Orrery: cinema bloom" (or "Orrery: keep sprite glow, drop bloom").

### Task 9: Balanced tier, phones, and panel pause

**Files:** `OrreryCanvas.jsx`, `Rig.jsx`, `Starfield.jsx`; extend the check script.

Behaviour per spec: `balanced` → DPR ≤ 1.5, no postprocessing, fewer stars, simpler materials. Portrait phones: camera further back and higher so the whole orrery sits below the docked hero; tap = select/open via the same click contract. Panel open: case study → pause render loop ~600 ms after open; `/work`, `/about`, `/contact` → inspect each panel's backdrop in CSS: fully opaque → pause immediately, see-through → DPR 1 and ~30 fps. On close, resume and refresh `starScreen` before the next dive.

- [ ] **Step 1: Extend the check script:** run at 390×844 with `hasTouch`/`isMobile`: `[data-orrery="ready"]`, no overlap of `.orrery-label` with `.hero-overlay__focus`, swipe up (touch move) changes the card name. Panel pause: open `/work/<slug>` from home, wait 1 s, record `renderer.info.render.frame` via `window.__ORRERY_DEBUG__.frames()` twice 500 ms apart → equal; Esc, wait 500 ms → increasing. Deep-link-then-close (Review Focus 5): `/work/maths-website` → Esc → Enter dives (URL changes) and `starScreen` is within the viewport (expose via the debug hook).
- [ ] **Step 2:** Run — FAIL.
- [ ] **Step 3:** Implement (`window.__ORRERY_DEBUG__` only when `import.meta.env.DEV`).
- [ ] **Step 4:** PASS.
- [ ] **Step 5:** Commit — "Orrery: balanced tier, phone framing, pause behind panels".

### Task 10: Acceptance pass

- [ ] **Step 1:** `npm test`, `npm run lint`, `npm run build` — all pass; 18 routes prerendered; size numbers within budget.
- [ ] **Step 2:** `node scripts/orrery-check.mjs` against `npx vite preview` (production build) at 1440×900, 1280×720, 390×844, plus the reduced-motion `--expect 2d` run — all PASS.
- [ ] **Step 3:** Re-run the 2026-11-24 keyboard walkthrough (boot skip with Enter doesn't open a project; Tab order card → HUD → jump list; Esc in contact textarea only blurs).
- [ ] **Step 4:** Collect the screenshot set (initial, after ArrowRight ×3, hover, dive in progress) for each viewport into `/tmp/orrery-final/` for review.
- [ ] **Step 5:** Commit any fixes — "Orrery: acceptance fixes". Do not push or merge; hand back for user review.
