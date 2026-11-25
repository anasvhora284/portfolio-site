import { useEffect, useMemo, useRef, useState } from "react";
import { ACESFilmicToneMapping } from "three";
import { Canvas } from "@react-three/fiber";
import { useUniverseStore } from "../../store/universeStore.js";
import { Scene } from "./Scene.jsx";
import { ease } from "./model.js";

// Every panel (work index, about, contact, case study) has a fully opaque backdrop (checked in the
// panels' CSS), so nothing of the Orrery shows behind them: stop rendering. The case study dives
// out of the canvas first, so it keeps rendering for the length of that animation.
const DIVE_MS = 600;

export default function OrreryCanvas({ projects, onStarSelect }) {
  const rootRef = useRef(null);
  const order = useMemo(
    () =>
      [...projects]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((p) => p.slug),
    [projects],
  );

  const tier = useUniverseStore((s) => s.qualityTier);
  const panel = useUniverseStore((s) => s.panel);
  const [started, setStarted] = useState(false); // never pause before the first frame (starScreen needs it)
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (!panel) return setPaused(false);
    const id = setTimeout(() => setPaused(true), panel === "project" ? DIVE_MS : 0);
    return () => clearTimeout(id);
  }, [panel]);

  useEffect(() => {
    if (!paused) ease.hold = 4; // mount + resume: snap the eases (see model.js)
  }, [paused]);

  return (
    <div ref={rootRef} style={{ position: "absolute", inset: 0 }} aria-hidden>
      <Canvas
        dpr={tier === "balanced" ? [1, 1.5] : [1, 2]}
        // layout size, not the bounding rect: a deep-linked panel mounts this inside the scaled "is-diving" wrapper
        resize={{ offsetSize: true }}
        frameloop={started && paused ? "never" : "always"}
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
          onFirstFrame={() => {
            rootRef.current?.setAttribute("data-orrery", "ready");
            setStarted(true);
          }}
        />
      </Canvas>
    </div>
  );
}
