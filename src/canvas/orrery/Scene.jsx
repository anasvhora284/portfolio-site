import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector2, Vector3 } from "three";
import { starScreen, useUniverseStore } from "../../store/universeStore.js";
import { RINGS, SNAP, clampDelta, layoutBodies } from "./model.js";
import { Lighting } from "./Lighting.jsx";
import { Starfield } from "./Starfield.jsx";
import { Sun } from "./Sun.jsx";
import { Ring } from "./Rings.jsx";
import { Body } from "./Bodies.jsx";
import { Rig } from "./Rig.jsx";
import { loadPaneImage, paneSrc } from "./paneImage.js";

const DRIFT = [0.05, -0.035, 0.027, -0.02]; // rad/s per ring, inner -> outer
const PARALLAX = 0.06; // ~3.5 degrees
const BASE_TILT = 0.42; // orrery plane leans toward the camera
const HIT_PAD = 1.25; // screen hit circle = bounding sphere * this

function useMotionAllowed() {
  const [ok, setOk] = useState(
    () => !matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setOk(!mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return ok;
}

const tmp = new Vector3();
const right = new Vector3();
const sizeVec = new Vector2();
const HUD_SELECTORS = [
  ".hero-overlay__name",
  ".hero-overlay__tagline",
  ".hero-overlay__focus",
  ".hero-overlay__hint",
];
const FADED = 0.12; // opacity of a body drifting behind hero text / card / hint

export function Scene({ projects, order, onStarSelect, onFirstFrame }) {
  const { gl, camera, size } = useThree();
  const focusedSlug = useUniverseStore((s) => s.focusedSlug);
  const bodies = useMemo(() => layoutBodies(projects), [projects]);
  const meshes = useRef({});
  const [hovered, setHovered] = useState(null);
  const first = useRef(true);
  const tilt = useRef();
  const bySlug = useMemo(
    () => Object.fromEntries(projects.map((p) => [p.slug, p])),
    [projects],
  );
  const names = useMemo(
    () => Object.fromEntries(projects.map((p) => [p.slug, p.name])),
    [projects],
  );
  const ringIndex = useMemo(
    () =>
      Object.fromEntries(
        bodies.map((b) => [b.slug, RINGS.findIndex((r) => r.key === b.ring)]),
      ),
    [bodies],
  );
  const focusedBody = bodies.find((b) => b.slug === focusedSlug);
  const motion = useMotionAllowed();
  // preload + pre-downscale the pane images of the neighbours in sortOrder
  useEffect(() => {
    const i = order.indexOf(focusedSlug);
    if (i < 0) return;
    for (const d of [-1, 1]) {
      const slug = order[(i + d + order.length) % order.length];
      loadPaneImage(paneSrc(bySlug[slug]));
    }
  }, [focusedSlug, order, bySlug]);
  const fade = useRef({}); // slug -> current opacity
  const rects = useRef([]);
  const rectsAt = useRef(0);
  useEffect(() => {
    rectsAt.current = 0; // re-read HUD rects after a resize
  }, [size]);

  // Screen-space circle (CSS px, incl. glow) of every body.
  const screenBodies = () => {
    const { x: w, y: h } = gl.getSize(sizeVec);
    camera.updateMatrixWorld();
    right.setFromMatrixColumn(camera.matrixWorld, 0);
    return Object.entries(meshes.current)
      .filter(([, m]) => m)
      .map(([slug, m]) => {
        const c = m.getWorldPosition(new Vector3());
        // bounding-sphere radius of the shape (models included) in world units
        const rw = (m.userData.r ?? 0.3) * m.getWorldScale(tmp).x * HIT_PAD;
        const e = c.clone().addScaledVector(right, rw).project(camera);
        c.project(camera);
        return {
          slug,
          x: (c.x * 0.5 + 0.5) * w,
          y: (1 - (c.y * 0.5 + 0.5)) * h,
          r: Math.abs((e.x - c.x) * 0.5 * w),
        };
      });
  };
  const api = useRef();
  api.current = { screenBodies };

  useEffect(() => {
    Object.defineProperty(window, "__ORRERY_DEBUG__", {
      configurable: true,
      value: {
        order,
        frames: () => gl.info.render.frame,
        bodies: () =>
          api.current.screenBodies().map((b) => ({
            ...b,
            focused: b.slug === useUniverseStore.getState().focusedSlug,
            opacity: fade.current[b.slug] ?? 1,
          })),
        // Projected ring outlines (CSS px), for layout checks against the hero text.
        rings: () => {
          const { x: w, y: h } = gl.getSize(sizeVec);
          camera.updateMatrixWorld();
          return RINGS.flatMap((r) =>
            Array.from({ length: 96 }, (_, i) => {
              const a = (i / 96) * Math.PI * 2;
              const p = new Vector3(
                Math.cos(a) * r.radius,
                0,
                Math.sin(a) * r.radius,
              );
              p.applyMatrix4(tilt.current.matrixWorld).project(camera);
              return {
                x: (p.x * 0.5 + 0.5) * w,
                y: (1 - (p.y * 0.5 + 0.5)) * h,
              };
            }),
          );
        },
        get starScreen() {
          return { x: starScreen.x, y: starScreen.y };
        },
      },
    });
    return () => {
      delete window.__ORRERY_DEBUG__;
    };
  }, [gl, camera, order]);

  // Canvas hover state for the site's custom cursor (see CustomCursor.jsx).
  useEffect(() => {
    const el = gl.domElement;
    el.classList.add("universe-canvas");
    return () => {
      delete el.dataset.cursor;
      el.classList.remove("universe-canvas");
    };
  }, [gl]);
  useEffect(() => {
    if (hovered) gl.domElement.dataset.cursor = "pointer";
    else delete gl.domElement.dataset.cursor;
  }, [gl, hovered]);

  useFrame((_, dt) => {
    const [px, py] = useUniverseStore.getState().pointer;
    const k = 1 - Math.exp(-clampDelta(dt) * 3);
    const t = tilt.current;
    t.rotation.x +=
      (BASE_TILT + (motion ? py * PARALLAX : 0) - t.rotation.x) * k;
    t.rotation.y += ((motion ? px * PARALLAX : 0) - t.rotation.y) * k;
    t.updateMatrixWorld(true);
    const mesh = meshes.current[useUniverseStore.getState().focusedSlug];
    if (mesh) {
      mesh.getWorldPosition(tmp).project(camera);
      starScreen.x = (tmp.x * 0.5 + 0.5) * size.width;
      starScreen.y = (1 - (tmp.y * 0.5 + 0.5)) * size.height;
    }
    // Bodies that drift behind the hero text, card or hint fade out so nothing sits on them.
    // Time-based (not per-frame): frames can be slow, and the card moves/resizes as focus changes.
    const now = performance.now();
    if (now - rectsAt.current > 100) {
      rectsAt.current = now;
      rects.current = HUD_SELECTORS.map((q) =>
        document.querySelector(q)?.getBoundingClientRect(),
      ).filter(Boolean);
    }
    const kf = SNAP ? 1 : 1 - Math.exp(-clampDelta(dt) * 8);
    for (const b of screenBodies()) {
      const hit = rects.current.some((r) => {
        const dx = b.x - Math.max(r.left, Math.min(b.x, r.right));
        const dy = b.y - Math.max(r.top, Math.min(b.y, r.bottom));
        return dx * dx + dy * dy < b.r * b.r;
      });
      const cur = fade.current[b.slug] ?? 1;
      fade.current[b.slug] = cur + ((hit ? FADED : 1) - cur) * kf;
    }
    if (first.current) {
      first.current = false;
      onFirstFrame();
    }
  });

  const click = (slug) => (e) => {
    e.stopPropagation();
    const focused = useUniverseStore.getState().focusedSlug === slug;
    onStarSelect(slug, focused ? { open: true } : undefined);
  };

  return (
    <>
      <Lighting />
      <Starfield motion={motion} />
      <group position={[0, -0.9, -1.2]} scale={0.82}>
        <Rig meshes={meshes} ringIndex={ringIndex} />
        <group ref={tilt} rotation={[BASE_TILT, 0, 0]}>
          <Sun />
          {RINGS.map((r, i) => (
            <Ring
              key={r.key}
              ring={r}
              speed={DRIFT[i]}
              motion={motion}
              target={focusedBody?.ring === r.key ? focusedBody.angle : null}
            >
              {bodies
                .filter((b) => b.ring === r.key)
                .map((b) => (
                  <Body
                    fadeRef={fade}
                    slug={b.slug}
                    project={bySlug[b.slug]}
                    key={b.slug}
                    color={r.color}
                    hardware={r.key === "Hardware"}
                    motion={motion}
                    hovered={hovered === b.slug}
                    focused={focusedSlug === b.slug}
                    label={
                      focusedSlug === b.slug || hovered === b.slug
                        ? names[b.slug]
                        : null
                    }
                    meshRef={(m) => {
                      meshes.current[b.slug] = m;
                    }}
                    position={[
                      Math.cos(b.angle) * r.radius,
                      0,
                      Math.sin(b.angle) * r.radius,
                    ]}
                    onClick={click(b.slug)}
                    onPointerOver={(e) => {
                      e.stopPropagation();
                      setHovered(b.slug);
                    }}
                    onPointerOut={() => {
                      setHovered(null);
                    }}
                  />
                ))}
            </Ring>
          ))}
        </group>
      </group>
    </>
  );
}
