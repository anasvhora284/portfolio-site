# Task 6 report
Implemented models/{parts,Drone,Breadboard}.jsx + models/index.js (HARDWARE_MODELS), Bodies.jsx (model by slug, fade + emissive highlight via per-frame traversal, per-body bounding-sphere radius in shape.userData.r), Scene.jsx (screen radius = bounding sphere * world scale * 1.25, used for fade test and bodies().r; GLOW_R removed; motion passed to Body), Lighting.jsx (ambient 0.55 + directional light).
Rotors/LED blink gated on motion prop. Screenshots (drone/breadboard focused): .superpowers/sdd/2026-11-24-orrery-home/{drone,breadboard}.png (full 1440x900).
Check: `node scripts/orrery-check.mjs http://localhost:5321 /tmp/oc2` (vite preview of fresh build) - all 23 checks PASS (output below).
Orrery chunk: OrreryCanvas 251.49 KB gzip (budget 300). Build: 18 routes prerendered; eslint src/canvas/orrery clean.
Notes: LED halo sprites and jumper-wire lines from the spike dropped (invisible at scale). Breadboard rotated 0.75 rad about y so it reads side-on at the focus position. Dark parts look slightly warm under the gold env lightformer.
First run had one flaky "orrery ready" FAIL (20s timeout, heavy swiftshader load while I took screenshots in parallel); clean rerun all pass.
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
PASS focused body in safe zone for all projects at 1440x900
PASS focused body in safe zone (5 projects) at 1280x720
PASS mash: label agrees with card (Pay Slip Pro vs Pay Slip Pro)
PASS mash: lands on expected project (/work/pay-slip-pro)
PASS layout: no console errors
PASS deep link: Orrery chunk requested after case title rendered ({"title":645.2000000011176,"req":832})
PASS deep link: orrery ready after Esc
PASS deep link: no console errors
done
```

## Fix round 1 (hover continuity)
Added invisible hit-proxy sphere (transparent, opacity 0, depthWrite false, raycastable) to hardware bodies in Bodies.jsx, scaled to the measured bounding radius (excluded from the measurement); stable ref callback via latest-ref; Breadboard texture disposed on unmount. New check in scripts/orrery-check.mjs: focus drone, 15-step sweep over +-0.6 r, require data-cursor=pointer each sample (restores focus afterwards). Chunk 251.56 KB gzip. eslint src/canvas/orrery clean; build 18 routes.
RED (before fix): FAIL drone hover continuous across footprint (- - - - - - pointer - pointer pointer pointer - pointer pointer -)
GREEN: `node scripts/orrery-check.mjs http://localhost:5321 /tmp/oc4`
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
PASS deep link: Orrery chunk requested after case title rendered ({"title":203.59999999962747,"req":280.59999999962747})
PASS deep link: orrery ready after Esc
PASS deep link: no console errors
done
```
