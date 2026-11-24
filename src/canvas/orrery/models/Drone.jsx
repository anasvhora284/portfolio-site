import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Box, Cyl } from "./parts.jsx";

const GOLD = "#e8c547";
const ARMS = [
  Math.PI / 4,
  (3 * Math.PI) / 4,
  (5 * Math.PI) / 4,
  (7 * Math.PI) / 4,
];

// Quadcopter from the workbench spike, scaled to ~0.4 radius. Rotors spin and the LED
// pulses only when motion is allowed.
export function Drone({ motion }) {
  const rot = useRef([]);
  const led = useRef();
  useFrame((s, d) => {
    if (!motion) return;
    rot.current.forEach((r, i) => r && (r.rotation.y += d * (i % 2 ? 9 : -9)));
    if (led.current)
      led.current.material.emissiveIntensity =
        1.2 + Math.sin(s.clock.elapsedTime * 4) * 1.1;
  });
  return (
    <group scale={0.27}>
      {ARMS.map((a, i) => (
        <group key={i} rotation={[0, a, 0]}>
          <Box s={[0.26, 0.08, 1.6]} p={[0, 0.03, 0.8]} c="#3a3f4c" ro={0.5} />
          <Cyl
            r={0.21}
            h={0.24}
            p={[0, 0.14, 1.6]}
            c="#8b93a4"
            m={0.85}
            ro={0.3}
          />
          <Cyl
            r={0.22}
            h={0.04}
            p={[0, 0.02, 1.6]}
            c={i < 2 ? "#ff7a2b" : GOLD}
            m={0.8}
            ro={0.35}
          />
          <group position={[0, 0.3, 1.6]} ref={(r) => (rot.current[i] = r)}>
            <Box s={[1.6, 0.03, 0.17]} c="#c9cdd8" ro={0.5} />
          </group>
          <mesh position={[0, 0.3, 1.6]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.8, 24]} />
            <meshBasicMaterial
              color="#cfd6ff"
              transparent
              opacity={0.1}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
      <Box s={[1.1, 0.1, 1.1]} p={[0, 0.03, 0]} c="#2a2e38" ro={0.5} />
      <Box s={[0.95, 0.06, 0.95]} p={[0, 0.2, 0]} c="#3a4050" ro={0.5} />
      <Box s={[0.6, 0.24, 0.95]} p={[0, 0.36, 0]} c="#4a5a9a" ro={0.5} />
      <Box s={[0.12, 0.26, 0.97]} p={[0, 0.36, 0]} c={GOLD} m={0.7} ro={0.35} />
      <Box s={[0.3, 0.18, 0.22]} p={[0, 0.16, 0.62]} c="#10131a" ro={0.4} />
      <Cyl
        ref={led}
        r={0.07}
        h={0.08}
        p={[0, 0.3, -0.62]}
        c="#35e07a"
        e="#35e07a"
        ro={0.3}
      />
    </group>
  );
}
