import { forwardRef } from "react";

// Plain-geometry building blocks for the hardware bodies. Materials are opaque by default;
// Body drives their opacity (fade) and emissive highlight every frame.
export const Box = ({
  s,
  p = [0, 0, 0],
  c = "#222",
  m = 0,
  ro = 0.6,
  e,
  ...x
}) => (
  <mesh position={p} {...x}>
    <boxGeometry args={s} />
    <meshStandardMaterial
      color={c}
      metalness={m}
      roughness={ro}
      emissive={e || "#000"}
    />
  </mesh>
);

export const Cyl = forwardRef(
  (
    {
      r = 0.1,
      h = 0.1,
      p = [0, 0, 0],
      c = "#222",
      m = 0,
      ro = 0.5,
      e,
      seg = 16,
      ...x
    },
    ref,
  ) => (
    <mesh ref={ref} position={p} {...x}>
      <cylinderGeometry args={[r, r, h, seg]} />
      <meshStandardMaterial
        color={c}
        metalness={m}
        roughness={ro}
        emissive={e || "#000"}
      />
    </mesh>
  ),
);
Cyl.displayName = "Cyl";
