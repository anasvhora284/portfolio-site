/**
 * @deprecated Stack-overlap graph produced messy crossing lines. Layout now uses a
 * single **timeline polyline** in `ConstellationMesh` instead of pairwise edges.
 * Kept for reference if you add explicit `relatedTo` in Sanity later.
 */
export function edgesFromStackOverlap(projects) {
  const edges = [];
  const norm = (s) => (s || "").toLowerCase().trim();
  for (let i = 0; i < projects.length; i += 1) {
    const a = projects[i];
    const sa = a.slug || `a-${i}`;
    const stacksA = new Set((a.stack || []).map(norm).filter(Boolean));
    if (!stacksA.size) continue;
    for (let j = i + 1; j < projects.length; j += 1) {
      const b = projects[j];
      const sb = b.slug || `b-${j}`;
      const stacksB = (b.stack || []).map(norm).filter(Boolean);
      const share = stacksB.some((t) => stacksA.has(t));
      if (share) edges.push([sa, sb]);
    }
  }
  return edges;
}
