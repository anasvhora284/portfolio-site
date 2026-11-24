import { AdditiveBlending } from "three";
import { Glow } from "./Glow.jsx";

export function Body({ color, hardware, hovered, meshRef, ...handlers }) {
  return (
    <group position={handlers.position}>
      <mesh
        ref={meshRef}
        scale={hovered ? 1.3 : 1}
        onClick={handlers.onClick}
        onPointerOver={handlers.onPointerOver}
        onPointerOut={handlers.onPointerOut}
      >
        {hardware ? (
          <octahedronGeometry args={[0.3, 0]} />
        ) : (
          <sphereGeometry args={[0.28, 48, 32]} />
        )}
        <meshPhysicalMaterial
          color={color}
          metalness={hardware ? 0.9 : 0.15}
          roughness={hardware ? 0.18 : 0.04}
          clearcoat={1}
          clearcoatRoughness={0.03}
          envMapIntensity={1.6}
          emissive={color}
          emissiveIntensity={hovered ? 0.25 : 0.04}
          flatShading={hardware}
        />
      </mesh>
      {!hardware && (
        <mesh scale={hovered ? 1.75 : 1.35}>
          <sphereGeometry args={[0.28, 24, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.07}
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </mesh>
      )}
      <Glow
        color={color}
        scale={hovered ? 1.4 : 0.9}
        opacity={hovered ? 0.7 : 0.3}
      />
    </group>
  );
}
