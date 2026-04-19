import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useUniverseStore } from "../store/universeStore.js";

export function CameraRig() {
  const { camera } = useThree();
  const goal = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3(0, 0.32, 2.35));

  useFrame((_, delta) => {
    const st = useUniverseStore.getState();
    const [tx, ty, tz] = st.cameraTarget;
    const [px, py] = st.pointer;

    /** Parallax offset driven by mouse position. */
    const parallaxX = px * 0.55;
    const parallaxY = py * 0.35;

    goal.current.set(tx + parallaxX, ty + parallaxY, tz);
    const smooth = st.warping ? 5.5 : 1.8;
    const t = 1 - Math.exp(-smooth * delta);
    camera.position.lerp(goal.current, t);

    look.current.lerp(new THREE.Vector3(parallaxX * 0.35, 0.32 + parallaxY * 0.2, 2.35), 0.04);
    camera.lookAt(look.current);
  });

  return null;
}
