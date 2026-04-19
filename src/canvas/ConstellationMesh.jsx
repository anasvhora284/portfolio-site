import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * One continuous **path through your work** (same order as `sortOrder` on the arc).
 * Communicates “journey” instead of arbitrary constellations.
 */
export function ConstellationMesh({ projects, positions }) {
  const lineRef = useRef(null);

  const points = useMemo(() => {
    const sorted = [...projects].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    );
    const pts = [];
    sorted.forEach((p) => {
      const slug = p.slug;
      if (!slug) return;
      const pos = positions[slug];
      if (!pos) return;
      pts.push(new THREE.Vector3(pos[0], pos[1], pos[2]));
    });
    return pts.length >= 2 ? pts : [];
  }, [projects, positions]);

  useFrame((state) => {
    const mat = lineRef.current?.material;
    if (!mat || mat.opacity == null) return;
    const t = state.clock.elapsedTime;
    mat.opacity = 0.14 + 0.06 * Math.sin(t * 0.55) + 0.03 * Math.sin(t * 1.4 + 0.7);
  });

  if (points.length < 2) return null;

  return (
    <Line
      ref={lineRef}
      points={points}
      color="#b8c8f0"
      lineWidth={1.75}
      transparent
      opacity={0.18}
      toneMapped={false}
      depthWrite={false}
    />
  );
}
