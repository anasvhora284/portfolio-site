import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Large soft atmospheric wash behind everything — gives the scene a sense
 * of deep painted space rather than flat black. Two overlapping low-saturation
 * spheres rotating slowly in opposite directions provide subtle depth.
 */
export function NebulaSpheres({ enabled }) {
  const groupA = useRef(null);
  const groupB = useRef(null);

  const matA = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#12214a"),
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
        fog: false,
      }),
    [],
  );
  const matB = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#3a1e4a"),
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        fog: false,
      }),
    [],
  );

  useEffect(() => {
    return () => {
      matA.dispose();
      matB.dispose();
    };
  }, [matA, matB]);

  useFrame((_, delta) => {
    if (!enabled) return;
    if (groupA.current) groupA.current.rotation.y += delta * 0.01;
    if (groupB.current) groupB.current.rotation.y -= delta * 0.014;
  });

  if (!enabled) return null;

  return (
    <>
      <mesh ref={groupA} position={[-6, -0.5, -14]} scale={[22, 13, 18]} material={matA}>
        <sphereGeometry args={[1, 32, 32]} />
      </mesh>
      <mesh ref={groupB} position={[6, 2, -18]} scale={[18, 9, 16]} material={matB}>
        <sphereGeometry args={[1, 28, 28]} />
      </mesh>
    </>
  );
}
