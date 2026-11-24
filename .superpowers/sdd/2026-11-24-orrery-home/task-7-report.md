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
