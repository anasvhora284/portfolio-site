const TAU = Math.PI * 2;

// Inner -> outer.
export const RINGS = [
  { key: "Web", radius: 2.6, color: "#f2d57a" },
  { key: "Odoo", radius: 3.8, color: "#c99bff" },
  { key: "Mobile", radius: 5.0, color: "#6fe0d2" },
  { key: "Hardware", radius: 6.2, color: "#ff9a68" },
];

export function ringKeyOf(roles) {
  if (roles.includes("Odoo")) return "Odoo";
  if (roles.some((r) => ["IoT", "Embedded", "ML"].includes(r))) return "Hardware";
  if (roles.some((r) => ["Mobile", "Android"].includes(r))) return "Mobile";
  return "Web";
}

export function layoutBodies(projects) {
  const sorted = [...projects].sort((a, b) => a.sortOrder - b.sortOrder);
  const groups = new Map(RINGS.map((r) => [r.key, []]));
  for (const p of sorted) groups.get(ringKeyOf(p.roles ?? [])).push(p);
  const out = [];
  RINGS.forEach((r, ri) => {
    const g = groups.get(r.key);
    g.forEach((p, k) =>
      out.push({ slug: p.slug, ring: r.key, angle: (((k / g.length) * TAU + ri * 0.9) % TAU + TAU) % TAU }),
    );
  });
  return out;
}

// Ring rotation that puts the body at frontAngle, shortest way from currentRot.
export function frontRotation(currentRot, bodyAngle, frontAngle) {
  const d = frontAngle - bodyAngle - currentRot;
  return currentRot + (((d + Math.PI) % TAU) + TAU) % TAU - Math.PI;
}

export const clampDelta = (dt) => Math.min(dt, 0.05);
