import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { clampDelta } from "./model.js";

// drei Stars already twinkles through its time uniform; `speed` is zeroed when motion is off.
export function Starfield({ motion }) {
  const ref = useRef();
  useFrame((_, dt) => {
    if (motion && ref.current) ref.current.rotation.y += clampDelta(dt) * 0.004;
  });
  return (
    <group ref={ref}>
      <Stars
        radius={60}
        depth={50}
        count={2500}
        factor={3}
        saturation={0}
        fade
        speed={motion ? 0.6 : 0}
      />
    </group>
  );
}
