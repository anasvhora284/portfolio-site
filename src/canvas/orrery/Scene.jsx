import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { starScreen, useUniverseStore } from "../../store/universeStore.js";
import { RINGS, clampDelta, layoutBodies } from "./model.js";
import { Lighting } from "./Lighting.jsx";
import { Starfield } from "./Starfield.jsx";
import { Sun } from "./Sun.jsx";
import { Ring } from "./Rings.jsx";
import { Body } from "./Bodies.jsx";
import { Rig } from "./Rig.jsx";

const DRIFT = [0.05, -0.035, 0.027, -0.02]; // rad/s per ring, inner -> outer
const PARALLAX = 0.06; // ~3.5 degrees
const BASE_TILT = 0.42; // orrery plane leans toward the camera
const GLOW_R = 0.45; // body + glow radius in orrery units

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

export function Scene({ projects, order, onStarSelect, onFirstFrame }) {
  const { gl, camera, size } = useThree();
  const focusedSlug = useUniverseStore((s) => s.focusedSlug);
  const bodies = useMemo(() => layoutBodies(projects), [projects]);
  const meshes = useRef({});
  const [hovered, setHovered] = useState(null);
  const first = useRef(true);
  const tilt = useRef();
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

  useEffect(() => {
    Object.defineProperty(window, "__ORRERY_DEBUG__", {
      configurable: true,
      value: {
        order,
        frames: () => gl.info.render.frame,
        bodies: () => {
          camera.updateMatrixWorld();
          const right = new Vector3()
            .setFromMatrixColumn(camera.matrixWorld, 0)
            .multiplyScalar(GLOW_R);
          return Object.entries(meshes.current)
            .filter(([, m]) => m)
            .map(([slug, m]) => {
              const c = m.getWorldPosition(new Vector3());
              const e = c.clone().add(right).project(camera);
              c.project(camera);
              return {
                slug,
                focused: slug === useUniverseStore.getState().focusedSlug,
                x: (c.x * 0.5 + 0.5) * size.width,
                y: (1 - (c.y * 0.5 + 0.5)) * size.height,
                r: Math.abs((e.x - c.x) * 0.5 * size.width),
              };
            });
        },
        get starScreen() {
          return { x: starScreen.x, y: starScreen.y };
        },
      },
    });
    return () => {
      delete window.__ORRERY_DEBUG__;
    };
  }, [gl, camera, size, order]);

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
                    key={b.slug}
                    color={r.color}
                    hardware={r.key === "Hardware"}
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
