import { useMemo, useRef } from "react";
import { ACESFilmicToneMapping } from "three";
import { Canvas } from "@react-three/fiber";
import { Scene } from "./Scene.jsx";

export default function OrreryCanvas({ projects, onStarSelect }) {
  const rootRef = useRef(null);
  const order = useMemo(
    () =>
      [...projects]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((p) => p.slug),
    [projects],
  );

  return (
    <div ref={rootRef} style={{ position: "absolute", inset: 0 }} aria-hidden>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 5, 11], fov: 45 }}
        gl={{
          antialias: true,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        style={{ background: "#07080c" }}
      >
        <Scene
          projects={projects}
          order={order}
          onStarSelect={onStarSelect}
          onFirstFrame={() =>
            rootRef.current?.setAttribute("data-orrery", "ready")
          }
        />
      </Canvas>
    </div>
  );
}
