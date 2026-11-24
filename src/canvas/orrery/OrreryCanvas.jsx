import { useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useUniverseStore } from "../../store/universeStore.js";
import { Scene } from "./Scene.jsx";

export default function OrreryCanvas({ projects, onStarSelect }) {
  const rootRef = useRef(null);
  const tier = useUniverseStore((s) => s.qualityTier);
  const order = useMemo(
    () => [...projects].sort((a, b) => a.sortOrder - b.sortOrder).map((p) => p.slug),
    [projects],
  );

  return (
    <div ref={rootRef} style={{ position: "absolute", inset: 0 }} aria-hidden>
      <Canvas
        dpr={tier === "cinema" ? [1, 2] : [1, 1.5]}
        camera={{ position: [0, 5, 11], fov: 45 }}
        gl={{ antialias: true }}
        style={{ background: "#07080c" }}
      >
        <Scene
          projects={projects}
          order={order}
          onStarSelect={onStarSelect}
          onFirstFrame={() => rootRef.current?.setAttribute("data-orrery", "ready")}
        />
      </Canvas>
    </div>
  );
}
