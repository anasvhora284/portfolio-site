export function resolveQualityTier({ reducedMotion, saveData, narrow, cores }) {
  if (reducedMotion || saveData) return "lite";
  if (narrow || cores <= 4) return "balanced";
  return "cinema";
}
