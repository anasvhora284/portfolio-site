import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CanvasTexture, SRGBColorSpace } from "three";
import { Box, Cyl } from "./parts.jsx";

const LEDS = ["#ff3b3b", "#35e07a", "#ffd23b", "#4aa8ff", "#ff3b3b"];

// Arduino on a breadboard from the workbench spike, scaled to ~0.4 radius. LEDs blink only
// when motion is allowed.
export function Breadboard({ motion }) {
  const leds = useRef([]);
  const holes = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 680;
    c.height = 300;
    const g = c.getContext("2d");
    g.fillStyle = "#e4dfcf";
    g.fillRect(0, 0, 680, 300);
    g.fillStyle = "#3a3a40";
    for (let x = 14; x < 680; x += 17)
      for (let y = 14; y < 300; y += 17)
        if (Math.abs(y - 150) > 12) g.fillRect(x, y, 6, 6);
    g.fillStyle = "#d33";
    g.fillRect(0, 6, 680, 4);
    g.fillStyle = "#35c";
    g.fillRect(0, 290, 680, 4);
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    return t;
  }, []);
  useFrame((s) => {
    if (!motion) return;
    leds.current.forEach((l, i) => {
      if (!l) return;
      const on = Math.sin(s.clock.elapsedTime * 2.2 + i * 1.7) > 0.1 ? 1 : 0.15;
      l.material.emissiveIntensity = on * 2;
    });
  });
  return (
    <group scale={0.23} rotation={[0, 0.75, 0]} position={[-0.1, -0.05, 0.1]}>
      <Box s={[3.4, 0.14, 1.5]} p={[0.9, 0.06, 0.1]} c="#e4dfcf" ro={0.7} />
      <mesh position={[0.9, 0.134, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.3, 1.45]} />
        <meshStandardMaterial map={holes} roughness={0.8} />
      </mesh>
      <Box
        s={[1.9, 0.1, 1.3]}
        p={[-0.95, 0.17, 0.2]}
        c="#14a8b8"
        ro={0.45}
        m={0.2}
      />
      <Box
        s={[0.55, 0.28, 0.5]}
        p={[-1.75, 0.34, -0.1]}
        c="#d0d3da"
        m={0.8}
        ro={0.3}
      />
      <Box s={[1.0, 0.12, 0.3]} p={[-0.8, 0.28, -0.25]} c="#2a2a30" />
      <Box s={[1.4, 0.15, 0.1]} p={[-0.85, 0.3, 0.7]} c="#2c2e36" />
      <Box s={[1.5, 0.12, 0.78]} p={[1.55, 0.18, -0.3]} c="#2a2d38" />
      {LEDS.map((c, i) => (
        <Cyl
          key={i}
          ref={(r) => (leds.current[i] = r)}
          r={0.09}
          h={0.18}
          p={[0.15 + i * 0.4, 0.21, 0.5]}
          c={c}
          e={c}
          ro={0.2}
        />
      ))}
      <Box s={[1.15, 0.03, 0.04]} p={[0.35, 0.3, 0.68]} c="#ffd23b" ro={0.4} />
      <Box s={[1.1, 0.03, 0.04]} p={[0.6, 0.34, 0.58]} c="#35e07a" ro={0.4} />
    </group>
  );
}
