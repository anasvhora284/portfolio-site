/**
 * Deterministic "what does this planet look like" from a slug.
 *
 * Returns a stable palette + sizing + ring / atmosphere flags so each project
 * in the constellation reads as a unique world, not a repeated asset.
 */

const PALETTES = [
  {
    name: "amber",
    core: "#1b140a",
    emissive: "#f0c24a",
    halo: "#ffd78a",
    atmosphere: "#ffb74d",
    ring: "#c89a58",
  },
  {
    name: "teal",
    core: "#0a1f22",
    emissive: "#3ad6d0",
    halo: "#9af0ec",
    atmosphere: "#4dd0e1",
    ring: "#5cc8c3",
  },
  {
    name: "magenta",
    core: "#1e0a1a",
    emissive: "#e65bc0",
    halo: "#ffb3e7",
    atmosphere: "#f06292",
    ring: "#c06098",
  },
  {
    name: "azure",
    core: "#0b1224",
    emissive: "#6aa0ff",
    halo: "#b8cfff",
    atmosphere: "#64b5f6",
    ring: "#7290c8",
  },
  {
    name: "emerald",
    core: "#0a1e13",
    emissive: "#66d58a",
    halo: "#b3eec1",
    atmosphere: "#66bb6a",
    ring: "#6aa680",
  },
  {
    name: "violet",
    core: "#120a22",
    emissive: "#a88cff",
    halo: "#d6bfff",
    atmosphere: "#9575cd",
    ring: "#8c7ac0",
  },
];

function hashSlug(slug) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < slug.length; i += 1) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function rand01(seed, salt) {
  const x = Math.sin((seed ^ (salt * 2654435761)) * 0.0001) * 43758.5453;
  return x - Math.floor(x);
}

export function planetStyleFor(slug, index = 0) {
  const seed = slug ? hashSlug(slug) : (index + 1) * 2654435761;
  const palette = PALETTES[seed % PALETTES.length];
  const r1 = rand01(seed, 1);
  const r2 = rand01(seed, 2);
  const r3 = rand01(seed, 3);
  const r4 = rand01(seed, 4);
  return {
    palette,
    radius: 0.11 + r1 * 0.09,
    haloRadius: 0.18 + r1 * 0.14,
    hasRing: r2 > 0.38,
    ringInner: 0.22 + r3 * 0.08,
    ringOuter: 0.34 + r4 * 0.09,
    ringTilt: (r2 - 0.5) * 1.4,
    spinSpeed: 0.15 + r3 * 0.35,
    pulseOffset: r4 * Math.PI * 2,
  };
}
