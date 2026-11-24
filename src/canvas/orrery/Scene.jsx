import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { starScreen, useUniverseStore } from "../../store/universeStore.js";
import { RINGS, layoutBodies } from "./model.js";

const tmp = new Vector3();

export function Scene({ projects, order, onStarSelect, onFirstFrame }) {
  const { gl, camera, size } = useThree();
  const bodies = useMemo(() => layoutBodies(projects), [projects]);
  const radius = useMemo(() => Object.fromEntries(RINGS.map((r) => [r.key, r.radius])), []);
  const meshes = useRef({});
  const [hovered, setHovered] = useState(null);
  const first = useRef(true);

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

  useFrame(() => {
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
      <ambientLight intensity={0.6} />
      <pointLight intensity={80} color="#e8c547" />
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#e8c547" />
      </mesh>
      {RINGS.map((r) => (
        <mesh key={r.key} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r.radius, 0.02, 8, 128]} />
          <meshBasicMaterial color="#e8c547" />
        </mesh>
      ))}
      {bodies.map((b) => (
        <mesh
          key={b.slug}
          ref={(m) => {
            meshes.current[b.slug] = m;
          }}
          position={[Math.cos(b.angle) * radius[b.ring], 0, Math.sin(b.angle) * radius[b.ring]]}
          scale={hovered === b.slug ? 1.3 : 1}
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
        >
          <sphereGeometry args={[0.28, 24, 24]} />
          <meshStandardMaterial color="#f0f1f5" />
        </mesh>
      ))}
    </>
  );
}
