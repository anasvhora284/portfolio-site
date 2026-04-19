/**
 * Places projects on a **curved arc with real Z depth** so the composition
 * reads as an orbit (left → earlier, right → later in `sortOrder`) instead of
 * a flat row. Height varies on a gentle sine and the end-points sit further
 * from the camera than the center, creating perspective.
 *
 * @param {Array<{ slug?: string, sortOrder?: number }>} projects
 * @param {Record<string, { x: number, y: number, z: number } | undefined>} [overrides]
 * @returns {Record<string, [number, number, number]>}
 */
export function computeStarPositions(projects, overrides = {}) {
  const list = [...projects].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );
  const out = {};
  const n = list.length;
  /** Horizontal sweep. */
  const arc = Math.min(Math.PI * 0.82, Math.PI * 0.22 * Math.max(n, 1));
  /** Radius of the orbit the planets sit on. */
  const R = 3.2;
  /** Center-of-orbit Z (camera looks from +Z). Positive = in front of origin. */
  const z0 = 1.35;

  list.forEach((p, i) => {
    const slug = p.slug || `p-${i}`;
    if (overrides[slug]?.x != null) {
      const o = overrides[slug];
      out[slug] = [o.x, o.y, o.z];
      return;
    }
    const u = n === 1 ? 0.5 : i / (n - 1);
    const angle = (u - 0.5) * arc;
    const x = Math.sin(angle) * R;
    const z = z0 + Math.cos(angle) * R * 0.78;
    const wave = Math.sin(u * Math.PI * 1.5 + i * 0.37);
    const y = 0.1 + wave * 0.42;
    out[slug] = [x, y, z];
  });
  return out;
}
