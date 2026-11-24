import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, DoubleSide, Object3D } from "three";
import { clampDelta } from "./model.js";

const TICKS = 180;

function Ticks({ radius }) {
  const ref = useRef();
  useEffect(() => {
    const d = new Object3D();
    for (let i = 0; i < TICKS; i++) {
      const a = (i / TICKS) * Math.PI * 2;
      d.position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius);
      d.rotation.set(0, -a, 0);
      d.scale.set(1, 1, i % 15 === 0 ? 2.8 : i % 5 === 0 ? 1.8 : 1);
      d.updateMatrix();
      ref.current.setMatrixAt(i, d.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [radius]);
  return (
    <instancedMesh ref={ref} args={[null, null, TICKS]}>
      <boxGeometry args={[0.012, 0.012, 0.07]} />
      <meshStandardMaterial color="#e8c547" metalness={1} roughness={0.25} />
    </instancedMesh>
  );
}

// One brass ring with ticks and a faint tinted band; children (bodies) ride along with the slow drift.
export function Ring({ ring, speed, motion, children }) {
  const group = useRef();
  useFrame((_, dt) => {
    if (motion) group.current.rotation.y -= speed * clampDelta(dt);
  });
  return (
    <group ref={group}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[ring.radius, 0.03, 24, 256]} />
        <meshStandardMaterial
          color="#d9b25a"
          metalness={1}
          roughness={0.18}
          envMapIntensity={1.8}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[ring.radius - 0.16, ring.radius + 0.16, 256, 1]} />
        <meshBasicMaterial
          color={ring.color}
          transparent
          opacity={0.06}
          side={DoubleSide}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
      <Ticks radius={ring.radius + 0.12} />
      {children}
    </group>
  );
}
