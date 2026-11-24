import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { useUniverseStore } from "../../store/universeStore.js";
import { clampDelta } from "./model.js";

const OMEGA = 4.5; // critically damped spring, settles in ~1 s
const DIR = new Vector3(-0.04, 0.3, 1).normalize(); // camera sits this way from the look target
const SUN = new Vector3();
const wp = new Vector3();

// Critically damped spring step on one vector (value/velocity are mutated).
function damp(value, vel, target, dt) {
  const x = OMEGA * dt;
  const e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  for (const k of ["x", "y", "z"]) {
    const change = value[k] - target[k];
    const tmp = (vel[k] + OMEGA * change) * dt;
    vel[k] = (vel[k] - OMEGA * tmp) * e;
    value[k] = target[k] + (change + tmp) * e;
  }
}

// Glides the camera toward the focused body: body right of centre, sun kept in frame.
export function Rig({ meshes, ringIndex }) {
  const { camera, size } = useThree();
  const pos = useRef(null);
  const look = useRef(new Vector3());
  const pv = useRef(new Vector3());
  const lv = useRef(new Vector3());
  const tp = useRef(new Vector3());
  const tl = useRef(new Vector3());

  useFrame((_, dt) => {
    const slug = useUniverseStore.getState().focusedSlug;
    const mesh = meshes.current[slug];
    if (mesh) mesh.getWorldPosition(wp);
    else wp.copy(SUN);
    const ri = ringIndex[slug] ?? 1;
    // wider/narrower aspects keep the same vertical framing; portrait pulls back.
    const aspect = Math.min(1, size.width / size.height / 1.6);
    const dist = (8.2 + ri * 0.6) / aspect;
    // look between the body and the sun, then shift left so the body lands right of centre
    tl.current
      .copy(wp)
      .multiplyScalar(0.6)
      .add(new Vector3(-2.2, 0.3, 0));
    tp.current.copy(tl.current).addScaledVector(DIR, dist);
    if (!pos.current) {
      pos.current = camera.position.copy(tp.current);
      look.current.copy(tl.current);
    }
    const d = clampDelta(dt);
    damp(pos.current, pv.current, tp.current, d);
    damp(look.current, lv.current, tl.current, d);
    camera.lookAt(look.current);
    camera.updateMatrixWorld();
  });
  return null;
}
