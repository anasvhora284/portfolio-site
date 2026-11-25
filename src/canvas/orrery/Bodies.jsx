import { AdditiveBlending, Box3, Color, Matrix4, Sphere } from "three";
import { useCallback, useLayoutEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import "./orrery.css";
import { Glow } from "./Glow.jsx";
import { HARDWARE_MODELS } from "./models/index.js";
import { Pane } from "./Pane.jsx";
import { useUniverseStore } from "../../store/universeStore.js";

const HL = new Color("#e8c547");
const box = new Box3();
const part = new Box3();
const inv = new Matrix4();

export function Body({
  color,
  hardware,
  motion,
  slug,
  fadeRef,
  hovered,
  focused,
  label,
  project,
  meshRef,
  position,
  ...handlers
}) {
  const group = useRef();
  const shape = useRef();
  const proxy = useRef();
  const meshRefLatest = useRef(meshRef);
  meshRefLatest.current = meshRef;
  const setShape = useCallback((g) => {
    shape.current = g;
    meshRefLatest.current(g);
  }, []);
  const balanced = useUniverseStore((s) => s.qualityTier) === "balanced";
  const Model = HARDWARE_MODELS[slug];
  // Bounding-sphere radius of the visible shape in its own (unscaled) space; Scene projects it
  // to screen for the fade test.
  useLayoutEffect(() => {
    const s = shape.current;
    s.updateWorldMatrix(true, true);
    inv.copy(s.matrixWorld).invert();
    box.makeEmpty();
    s.traverse((o) => {
      if (!o.geometry || o === proxy.current) return;
      o.geometry.boundingBox ?? o.geometry.computeBoundingBox();
      box.union(
        part
          .copy(o.geometry.boundingBox)
          .applyMatrix4(o.matrixWorld)
          .applyMatrix4(inv),
      );
    });
    const r = box.getBoundingSphere(new Sphere()).radius;
    s.userData.r = r;
    // hit proxy: solid footprint so hover/click is continuous across thin parts
    proxy.current?.scale.setScalar(r);
  }, [Model]);
  // fadeRef[slug] (0..1) scales every material's own base opacity.
  useFrame(() => {
    const f = fadeRef.current[slug] ?? 1;
    group.current.traverse((o) => {
      const m = o.material;
      if (!m) return;
      m.userData.base ??= m.opacity;
      m.userData.t ??= m.transparent;
      const tr = m.userData.t || f < 1;
      if (m.transparent !== tr) {
        m.transparent = tr;
        m.needsUpdate = true; // the OPAQUE shader define depends on it, else alpha stays 1
      }
      m.opacity = m.userData.base * f;
      if (Model && m.emissive) {
        m.userData.e ??= m.emissive.clone();
        m.emissive.copy(m.userData.e);
        if (focused || hovered) m.emissive.lerp(HL, 0.07);
      }
    });
  });
  return (
    <group ref={group} position={position}>
      <group
        ref={setShape}
        scale={focused ? 1.4 : hovered ? 1.3 : 1}
        onClick={handlers.onClick}
        onPointerOver={handlers.onPointerOver}
        onPointerOut={handlers.onPointerOut}
      >
        {hardware && (
          <mesh ref={proxy}>
            <sphereGeometry args={[1, 12, 8]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        )}
        {Model ? (
          <Model motion={motion} />
        ) : (
          <mesh>
            {hardware ? (
              <octahedronGeometry args={[0.3, 0]} />
            ) : (
              <sphereGeometry args={[0.28, 48, 32]} />
            )}
            {balanced ? (
              <meshStandardMaterial
                color={color}
                metalness={hardware ? 0.9 : 0.15}
                roughness={hardware ? 0.25 : 0.2}
                emissive={color}
                emissiveIntensity={focused || hovered ? 0.25 : 0.04}
                flatShading={hardware}
              />
            ) : (
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
            )}
          </mesh>
        )}
      </group>
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
      {focused && project ? <Pane key={slug} project={project} shape={shape} /> : null}
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
