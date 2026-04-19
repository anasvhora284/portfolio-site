import { Billboard, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { planetStyleFor } from "../lib/planetStyle.js";

function PlanetNode({ project, index, position, selected, hovered, onSelect, onHover, onLeave }) {
  const group = useRef(null);
  const bodyRef = useRef(null);
  const ringRef = useRef(null);
  const atmosRef = useRef(null);
  const haloRef = useRef(null);

  const style = useMemo(() => planetStyleFor(project.slug, index), [project.slug, index]);
  const active = selected || hovered;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const g = group.current;
    if (g) {
      const targetScale = active ? 1.42 : 1;
      const s = THREE.MathUtils.lerp(g.scale.x, targetScale, 0.08);
      g.scale.setScalar(s);
    }
    if (bodyRef.current) {
      bodyRef.current.rotation.y += style.spinSpeed * 0.02;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = style.ringTilt + Math.sin(t * 0.2 + style.pulseOffset) * 0.05;
    }
    if (atmosRef.current?.material) {
      const base = active ? 0.34 : 0.2;
      atmosRef.current.material.opacity =
        base + 0.04 * Math.sin(t * 1.2 + style.pulseOffset);
    }
    if (haloRef.current?.material) {
      const base = active ? 0.28 : 0.14;
      haloRef.current.material.opacity =
        base + 0.05 * Math.sin(t * 1.8 + style.pulseOffset);
    }
  });

  const p = style.palette;

  return (
    <group ref={group} position={position}>
      {/* outer soft halo (billboard so it always faces camera) */}
      <Billboard>
        <mesh ref={haloRef} renderOrder={0}>
          <circleGeometry args={[style.haloRadius * 2.1, 48]} />
          <meshBasicMaterial
            color={p.halo}
            transparent
            opacity={0.14}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      </Billboard>

      {/* atmosphere shell */}
      <mesh ref={atmosRef} renderOrder={1}>
        <sphereGeometry args={[style.radius * 1.45, 24, 24]} />
        <meshBasicMaterial
          color={p.atmosphere}
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* optional ring */}
      {style.hasRing ? (
        <mesh ref={ringRef} rotation={[Math.PI / 2.4, 0, style.ringTilt]} renderOrder={2}>
          <ringGeometry args={[style.ringInner, style.ringOuter, 64]} />
          <meshBasicMaterial
            color={p.ring}
            side={THREE.DoubleSide}
            transparent
            opacity={0.55}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ) : null}

      {/* planet body */}
      <mesh
        ref={bodyRef}
        renderOrder={3}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(project.slug);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
          onHover(project.slug);
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
          onLeave();
        }}
      >
        <sphereGeometry args={[style.radius, 40, 40]} />
        <meshStandardMaterial
          color={p.core}
          emissive={p.emissive}
          emissiveIntensity={active ? 1.3 : 0.75}
          metalness={0.25}
          roughness={0.42}
        />
      </mesh>

      {/* floating label */}
      <Billboard position={[0, style.radius + 0.42, 0]}>
        <Html center transform={false} occlude={false} pointerEvents="none" zIndexRange={[10, 0]}>
          <div className={`planet-label ${active ? "is-active" : ""}`}>
            <span className="planet-label__name">{project.name}</span>
            <span className="planet-label__meta">
              {project.year ?? ""}{project.year && project.roles?.[0] ? " · " : ""}{project.roles?.[0] ?? ""}
            </span>
          </div>
        </Html>
      </Billboard>
    </group>
  );
}

export function HeroStars({ projects, positions, onSelect, focusedSlug }) {
  const [hovered, setHovered] = useState(null);

  const items = useMemo(() => {
    return projects
      .map((p, i) => {
        const slug = p.slug;
        if (!slug || !positions[slug]) return null;
        return { project: p, index: i, pos: positions[slug] };
      })
      .filter(Boolean);
  }, [projects, positions]);

  return (
    <group>
      {items.map(({ project, index, pos }) => (
        <PlanetNode
          key={project.slug}
          project={project}
          index={index}
          position={pos}
          selected={focusedSlug === project.slug}
          hovered={hovered === project.slug}
          onSelect={onSelect}
          onHover={setHovered}
          onLeave={() => setHovered(null)}
        />
      ))}
    </group>
  );
}
