import * as THREE from "three";

/**
 * Eye position when focusing a project: slightly above and toward the viewer from the star
 * so the arc still feels grounded in space.
 *
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @returns {[number, number, number]}
 */
export function dockCameraForStar(x, y, z) {
  const star = new THREE.Vector3(x, y, z);
  const offset = new THREE.Vector3(0.15, 0.42, 4.6);
  const eye = star.clone().add(offset);
  return [eye.x, eye.y, eye.z];
}

/** Frames the front arc from a slight elevation. */
export const OVERVIEW_CAMERA = /** @type {[number, number, number]} */ ([0, 2.15, 8.85]);
