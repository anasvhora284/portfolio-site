import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * The cinematic anchor: a massive distant ringed gas giant offset to the
 * upper-right, casting a warm atmosphere behind the project arc.
 *
 * Everything is Basic + additive so it never fights the project planets
 * for light — it reads as a "painted sky" element.
 */
export function BackgroundPlanet() {
  const group = useRef(null);
  const ring = useRef(null);

  const matBody = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#1b2a5e"),
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        fog: false,
      }),
    [],
  );
  const matAtmos = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#5c7dd6"),
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        fog: false,
      }),
    [],
  );
  const matRing = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#c89a58"),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        fog: false,
      }),
    [],
  );
  const matGlow = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#f0c24a"),
        transparent: true,
        opacity: 0.1,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        fog: false,
      }),
    [],
  );

  useEffect(() => {
    return () => {
      matBody.dispose();
      matAtmos.dispose();
      matRing.dispose();
      matGlow.dispose();
    };
  }, [matBody, matAtmos, matRing, matGlow]);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.01;
    if (ring.current) ring.current.rotation.z += delta * 0.02;
  });

  return (
    <group ref={group} position={[14, 4.5, -28]}>
      <mesh material={matGlow} renderOrder={-3}>
        <sphereGeometry args={[9.2, 32, 32]} />
      </mesh>
      <mesh material={matAtmos} renderOrder={-2}>
        <sphereGeometry args={[6.4, 48, 48]} />
      </mesh>
      <mesh material={matBody} renderOrder={-1}>
        <sphereGeometry args={[5.6, 64, 64]} />
      </mesh>
      <mesh ref={ring} material={matRing} rotation={[Math.PI / 2.6, 0, 0.15]}>
        <ringGeometry args={[7.2, 10.8, 128]} />
      </mesh>
    </group>
  );
}
