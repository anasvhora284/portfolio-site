import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, Vector3 } from "three";
import { useUniverseStore } from "../../store/universeStore.js";
import { clampDelta, snapping } from "./model.js";

// Calibration knobs.
const OMEGA = 4.5; // critically damped spring, settles in ~1 s
const DIR = new Vector3(-0.04, 0.3, 1).normalize(); // camera sits this way from the look target
const BASE_DIST = 8.2; // camera distance to the focused body (Web ring)
const DIST_PER_RING = 0.6; // outer rings pull back a little
const WIDE_ASPECT = 1.6; // narrower viewports pull back so the orrery still fits
// Where the focused body lands on screen (NDC): right of centre, a little below the middle,
// i.e. inside the safe zone, clear of the card (bottom-left) and the hint bar (bottom-centre).
const BODY_NDC_X = 0.32;
const BODY_NDC_Y = -0.2;

const RIGHT = new Vector3(DIR.z, 0, -DIR.x).normalize();
const UP = new Vector3().crossVectors(DIR, RIGHT);
const wp = new Vector3();
const off = new Vector3();

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

// Glides the camera toward the focused body. The look target is solved so the body lands at
// (BODY_NDC_X, BODY_NDC_Y) on screen whatever its ring, which keeps it fully in view; the sun
// stays in frame because the camera distance is only a few units.
export function Rig({ meshes, ringIndex }) {
  const { camera } = useThree();
  const started = useRef(false);
  const look = useRef(new Vector3());
  const pv = useRef(new Vector3());
  const lv = useRef(new Vector3());
  const tp = useRef(new Vector3());
  const tl = useRef(new Vector3());

  useFrame((_, dt) => {
    const slug = useUniverseStore.getState().focusedSlug;
    const mesh = meshes.current[slug];
    if (mesh) mesh.getWorldPosition(wp);
    else wp.set(0, 0, 0);
    const ri = ringIndex[slug] ?? 1;
    const dist =
      (BASE_DIST + ri * DIST_PER_RING) /
      Math.min(1, camera.aspect / WIDE_ASPECT);
    const halfH = dist * Math.tan(MathUtils.degToRad(camera.fov / 2));
    off
      .copy(RIGHT)
      .multiplyScalar(BODY_NDC_X * halfH * camera.aspect)
      .addScaledVector(UP, BODY_NDC_Y * halfH);
    tl.current.copy(wp).sub(off);
    tp.current.copy(tl.current).addScaledVector(DIR, dist);
    if (!started.current) {
      started.current = true;
      camera.position.copy(tp.current);
      look.current.copy(tl.current);
    }
    const d = snapping() ? 1e3 : clampDelta(dt);
    damp(camera.position, pv.current, tp.current, d);
    damp(look.current, lv.current, tl.current, d);
    camera.lookAt(look.current);
    camera.updateMatrixWorld();
  });
  return null;
}
