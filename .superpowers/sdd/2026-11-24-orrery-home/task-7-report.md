# Task 7 report: Screenshot pane

Implemented Pane.jsx (drei Html, class orrery-pane; plain img, object-fit cover at 16:10; only the focused body mounts one; hidden <=720px; fades in 300ms after focus; gold hairline frame, glow, rotateY tilt, scanline/gold wash). Pane sits right of the focused planet, offset by its per-frame screen radius. Source: imageKind logo ? thumb : image ?? thumb; none -> no pane. Bodies.jsx/Scene.jsx pass project; check script extended.

## RED (pane code removed, fresh build)
```
PASS pane: none for strong-integrity-guide
FAIL pane: input-leaf shows its thumb
FAIL pane: clear of body, in view ({"n":0})
FAIL pane: maths-website clear of body, in view ({"n":0})
FAIL pane: auto-balancing-drone clear of body, in view ({"n":0})
PASS pane: absent at 390x844
PASS pane: no console errors
```

## GREEN (full check, vite preview :5323, fresh build)
```
PASS orrery ready
PASS focus on hero card after boot skip
PASS debug order exposed
PASS Enter opens 4th project by sortOrder (/work/matrimony-pwa Matrimony PWA)
PASS Esc returns to /
PASS focus back on hero card
PASS home: no console errors
PASS layout: orrery ready
PASS layout 0 presses 1440x900: bodies + labels clear of hero text/card/hint
PASS layout 0 presses 1280x720: bodies + labels clear of hero text/card/hint
PASS layout 3 presses: bodies + labels clear of hero text/card/hint
PASS layout 7 presses: bodies + labels clear of hero text/card/hint
PASS layout 7 presses 1280x720: bodies + labels clear of hero text/card/hint
PASS one label with pointer parked top-left
PASS hover sets canvas cursor state
PASS drone hover continuous across footprint (pointer pointer pointer pointer pointer pointer pointer pointer pointer pointer pointer pointer pointer pointer pointer)
PASS focused body in safe zone for all projects at 1440x900
PASS focused body in safe zone (5 projects) at 1280x720
PASS mash: label agrees with card (Pay Slip Pro vs Pay Slip Pro)
PASS mash: lands on expected project (/work/pay-slip-pro)
PASS layout: no console errors
PASS pane: none for strong-integrity-guide
PASS pane: input-leaf shows its thumb (/assets/input-leaf-hLzOC8Xu.webp)
PASS pane: clear of body, in view ({"n":1,"src":"/assets/input-leaf-hLzOC8Xu.webp","w":298.5748291015625,"hitsBody":false,"inView":true})
PASS pane: maths-website clear of body, in view ({"n":1,"src":"/assets/MathsWebsite-C5zFG_gj.webp","w":284.0498046875,"hitsBody":false,"inView":true})
PASS pane: auto-balancing-drone clear of body, in view ({"n":1,"src":"/assets/AutoBalancingDrone-SeUFYiON.webp","w":285.972412109375,"hitsBody":false,"inView":true})
PASS pane: absent at 390x844
PASS pane: no console errors
PASS deep link: Orrery chunk requested after case title rendered ({"title":180.40000000223517,"req":225.69999999925494})
PASS deep link: orrery ready after Esc
PASS deep link: no console errors
FIN
```

Orrery chunk gzip: 250058 B (244.2 KB; was 251.56 KB). Unit tests 5/5. Lint: 0 errors.

Concerns: pane is a CSS img not a texture, so neighbours are not prefetched and sources are not downscaled to 1024 px (thumbs are 720 px; real screenshots ship as-is). Pane may sit over a drifting neighbour body (cosmetic).
Screenshots: /tmp/p7/green2/pane-*.png

## Fix round 1

1. Downscale: new src/canvas/orrery/paneImage.js. Sources wider than 1024 px are drawn once to a canvas and used as a webp data URL (animated GIFs become a still); cached per URL in a module Map. Check asserts the pane img naturalWidth is > 0 and <= 1024 for maths-website, auto-balancing-drone and matrimony-pwa (the 1836 px GIF): all 1024.
2. Neighbour prefetch: Scene.jsx effect on focusedSlug preloads and pre-downscales the previous and next projects' pane sources in sortOrder. The pane fades in only once its image is ready (and 300 ms have passed).
3. Overlap under the Now-viewing card: root cause is the HUD rect cache in Scene.jsx, refreshed every 15 frames. On a slow-frame machine that is several seconds stale, and the card moves/resizes as focus changes, so a body drifting over it stayed at full opacity. Now refreshed every 100 ms by wall clock. Added cardHits check: samples bodies() 6 times over ~3 s at 0 presses and after 3 presses; fails if any body with opacity > 0.5 intersects .hero-overlay__focus. (I did not capture a RED run for this one; the stale-cache cause is from reading the code and the screenshot, and the new check passes after the fix.)
4. Pane hidden (display none) when its computed width < 200 px; style.width/transform only written when the rounded values change.
Check-script hardening: pane checks wait for a laid-out pane (>= 200 px) and the 390x844 check waits for the pane to disappear (up to 8 s) instead of fixed sleeps, because the swiftshader run is slow; printed src is truncated.

Commands: npm run build; npx vite preview --port 5323 --strictPort; node scripts/orrery-check.mjs http://localhost:5323 /tmp/p7/green8
Result: 37 PASS, 0 FAIL, exit 0. Orrery chunk gzip: 250505 B. Unit tests 5/5. Lint 0 errors.
```
PASS card: no visible body on the Now-viewing card (0 presses)
PASS card: no visible body on the Now-viewing card (3 presses)
PASS pane: none for strong-integrity-guide
PASS pane: input-leaf shows its thumb (/assets/input-leaf-hLzOC8Xu.webp)
PASS pane: clear of body, in view ({"n":1,"src":"/assets/input-leaf-hLzOC8Xu.webp","w":298.574951171875,"hitsBody":false,"inView":true})
PASS pane: maths-website clear of body, in view ({"n":1,"src":"data:image/webp;base64,UklGRjpWAABXRUJQVlA4WAoAAAAgAAAA/wMAA","w":284.16943359375,"hits
PASS pane: maths-website image loaded and <= 1024 px wide (1024)
PASS pane: auto-balancing-drone clear of body, in view ({"n":1,"src":"data:image/webp;base64,UklGRkLaAABXRUJQVlA4WAoAAAAgAAAA/wMAt","w":285.9730224609
PASS pane: auto-balancing-drone image loaded and <= 1024 px wide (1024)
PASS pane: matrimony-pwa clear of body, in view ({"n":1,"src":"data:image/webp;base64,UklGRgAtAQBXRUJQVlA4WAoAAAAgAAAA/wMAC","w":284.16943359375,"hits
PASS pane: matrimony-pwa image loaded and <= 1024 px wide (1024)
PASS pane: absent at 390x844
PASS pane: no console errors
FIN exit=0
```
