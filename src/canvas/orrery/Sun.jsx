import { AdditiveBlending } from "three";
import { Glow } from "./Glow.jsx";

export function Sun() {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.8, 64, 48]} />
        <meshBasicMaterial color="#ffdc84" toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1, 32, 24]} />
        <meshBasicMaterial
          color="#e8c547"
          transparent
          opacity={0.25}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <Glow color="#ffcf5a" scale={7} opacity={0.6} />
      <Glow color="#ff9a30" scale={15} opacity={0.18} />
      <pointLight color="#ffd890" intensity={60} distance={30} decay={1.6} />
    </group>
  );
}
