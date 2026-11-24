import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Vector2, Vector3 } from "three";

const GAP = 28; // px between the planet's screen circle and the pane
const MAX_W = 320;
const MARGIN = 16;
const c = new Vector3();
const e = new Vector3();
const right = new Vector3();
const sz = new Vector2();

const paneSrc = (p) =>
  p?.imageKind === "logo" ? p.thumb : (p?.image ?? p?.thumb);

// Hologram pane: sits right of the focused planet (the side away from the hero overlay), 16:10
// cover-cropped. Only the focused body mounts one, so the browser fetches/decodes just that image.
// ponytail: plain <img>, not a texture; neighbours are not prefetched and the source is not downscaled
// (thumb is 720 px; real screenshots are whatever the manifest ships).
export function Pane({ project, shape }) {
  const src = paneSrc(project);
  const { camera, gl } = useThree();
  const width = useThree((s) => s.size.width);
  const box = useRef();
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 300);
    return () => clearTimeout(t);
  }, []);
  useFrame(() => {
    const el = box.current;
    const m = shape.current;
    if (!el || !m) return;
    // screen radius of the planet incl. the same padding Scene uses for its hit circle
    const { x: w } = gl.getSize(sz);
    camera.updateMatrixWorld();
    m.getWorldPosition(c);
    const rw = (m.userData.r ?? 0.3) * m.getWorldScale(e).x * 1.25;
    right.setFromMatrixColumn(camera.matrixWorld, 0);
    e.copy(c).addScaledVector(right, rw).project(camera);
    c.project(camera);
    const r = Math.abs((e.x - c.x) * 0.5 * w);
    const x = (c.x * 0.5 + 0.5) * w + r + GAP;
    el.style.width = `${Math.max(0, Math.min(MAX_W, w - x - MARGIN))}px`;
    // Html's wrapper is already at the planet centre; shift to the pane's left edge.
    el.style.transform = `translate(${r + GAP}px, -50%)`;
  });
  if (!src || width <= 720) return null;
  return (
    <Html position={[0, 0, 0]} zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
      <div ref={box} className="orrery-pane" data-shown={shown}>
        <div className="orrery-pane__frame">
          <img src={src} alt="" decoding="async" draggable={false} />
        </div>
      </div>
    </Html>
  );
}
