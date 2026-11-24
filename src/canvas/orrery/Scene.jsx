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

const DRIFT = [0.05, -0.035, 0.027, -0.02]; // rad/s per ring, inner -> outer
const PARALLAX = 0.06; // ~3.5 degrees

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
  const bodies = useMemo(() => layoutBodies(projects), [projects]);
  const meshes = useRef({});
  const [hovered, setHovered] = useState(null);
  const first = useRef(true);
  const tilt = useRef();
  const motion = useMotionAllowed();

  useEffect(() => {
    Object.defineProperty(window, "__ORRERY_DEBUG__", {
      configurable: true,
      value: {
        order,
        frames: () => gl.info.render.frame,
        get starScreen() {
          return { x: starScreen.x, y: starScreen.y };
        },
      },
    });
    return () => {
      delete window.__ORRERY_DEBUG__;
    };
  }, [gl, order]);

  useFrame((_, dt) => {
    const [px, py] = useUniverseStore.getState().pointer;
    const k = 1 - Math.exp(-clampDelta(dt) * 3);
    const t = tilt.current;
    t.rotation.x += ((motion ? py * PARALLAX : 0) - t.rotation.x) * k;
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
        <group ref={tilt}>
          <Sun />
          {RINGS.map((r, i) => (
            <Ring key={r.key} ring={r} speed={DRIFT[i]} motion={motion}>
              {bodies
                .filter((b) => b.ring === r.key)
                .map((b) => (
                  <Body
                    key={b.slug}
                    color={r.color}
                    hardware={r.key === "Hardware"}
                    hovered={hovered === b.slug}
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
                      document.body.style.cursor = "pointer";
                    }}
                    onPointerOut={() => {
                      setHovered(null);
                      document.body.style.cursor = "";
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
