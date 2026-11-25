export function resolveQualityTier({ reducedMotion, saveData, narrow, cores, noWebgl }) {
  if (reducedMotion || saveData || noWebgl) return "lite";
  if (narrow || cores <= 4) return "balanced";
  return "cinema";
}
