import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, DoubleSide, Object3D } from "three";
import { clampDelta, frontRotation, snapping } from "./model.js";

// Where the focused body comes to rest: front of the orrery, a touch to the right.
export const FRONT = Math.PI / 2 - 0.9;

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
// `target` is the focused body's angle on this ring (or null): the ring eases it to FRONT,
// otherwise it drifts.
export function Ring({ ring, speed, motion, target, children }) {
  const group = useRef();
  const rot = useRef(0);
  useFrame((_, dt) => {
    const d = clampDelta(dt);
    if (target != null) {
      rot.current +=
        (frontRotation(rot.current, target, FRONT) - rot.current) *
        (snapping() ? 1 : 1 - Math.exp(-d * 3));
    } else if (motion) {
      rot.current += speed * d;
    }
    group.current.rotation.y = -rot.current;
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
