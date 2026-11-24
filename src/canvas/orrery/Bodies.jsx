import { AdditiveBlending } from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import "./orrery.css";
import { Glow } from "./Glow.jsx";

export function Body({
  color,
  hardware,
  slug,
  fadeRef,
  hovered,
  focused,
  label,
  meshRef,
  position,
  ...handlers
}) {
  const group = useRef();
  // fadeRef[slug] (0..1) scales every material's own base opacity.
  useFrame(() => {
    const f = fadeRef.current[slug] ?? 1;
    group.current.traverse((o) => {
      const m = o.material;
      if (!m) return;
      m.userData.base ??= m.opacity;
      m.userData.t ??= m.transparent;
      m.transparent = m.userData.t || f < 1;
      m.opacity = m.userData.base * f;
    });
  });
  return (
    <group ref={group} position={position}>
      <mesh
        ref={meshRef}
        scale={focused ? 1.4 : hovered ? 1.3 : 1}
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
          emissiveIntensity={focused || hovered ? 0.25 : 0.04}
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
        opacity={focused || hovered ? 0.7 : 0.3}
      />
      {label ? (
        <Html
          center
          position={[0, 0.6, 0]}
          zIndexRange={[10, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div className="orrery-label">{label}</div>
        </Html>
      ) : null}
    </group>
  );
}
