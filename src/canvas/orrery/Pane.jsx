import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Vector2, Vector3 } from "three";
import { loadPaneImage, paneSrc, readySrc } from "./paneImage.js";

const GAP = 28; // px between the planet's screen circle and the pane
const MAX_PANE_W = 320;
const MIN_PANE_W = 200;
const MARGIN = 16;
const c = new Vector3();
const e = new Vector3();
const right = new Vector3();
const sz = new Vector2();

// Hologram pane: sits right of the focused planet (the side away from the hero overlay), 16:10
// cover-cropped. Only the focused body mounts one, so the browser fetches/decodes just that image.
// Plain <img> (not a texture); sources wider than 1024 px are downscaled once by paneImage.js.
export function Pane({ project, shape }) {
  const src = paneSrc(project);
  const { camera, gl } = useThree();
  const width = useThree((s) => s.size.width);
  const box = useRef();
  const last = useRef({ w: -1, x: -1 });
  const [url, setUrl] = useState(() => readySrc(src) ?? null);
  const [timer, setTimer] = useState(false);
  useEffect(() => {
    if (width <= 720) return undefined;
    let live = true;
    loadPaneImage(src).then((u) => live && setUrl(u));
    const t = setTimeout(() => setTimer(true), 300);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [src, width]);
  const shown = timer && !!url;
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
    const pw = Math.round(Math.min(MAX_PANE_W, w - x - MARGIN));
    const tx = Math.round(r + GAP);
    const L = last.current;
    if (pw === L.w && tx === L.x) return;
    L.w = pw;
    L.x = tx;
    el.style.display = pw < MIN_PANE_W ? "none" : "";
    el.style.width = `${pw}px`;
    // Html's wrapper is already at the planet centre; shift to the pane's left edge.
    el.style.transform = `translate(${tx}px, -50%)`;
  });
  if (!src || width <= 720) return null;
  return (
    <Html position={[0, 0, 0]} zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
      <div ref={box} className="orrery-pane" data-shown={shown}>
        <div className="orrery-pane__frame">
          {url && <img src={url} alt="" decoding="async" draggable={false} />}
        </div>
      </div>
    </Html>
  );
}
