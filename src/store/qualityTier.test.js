import test from "node:test";
import assert from "node:assert/strict";
import { resolveQualityTier } from "./qualityTier.js";

const base = { reducedMotion: false, saveData: false, narrow: false, cores: 8 };
test("resolveQualityTier", () => {
  assert.equal(resolveQualityTier({ ...base, reducedMotion: true }), "lite");
  assert.equal(resolveQualityTier({ ...base, saveData: true }), "lite");
  assert.equal(resolveQualityTier({ ...base, narrow: true }), "balanced");
  assert.equal(resolveQualityTier({ ...base, cores: 4 }), "balanced");
  assert.equal(resolveQualityTier({ ...base, noWebgl: true }), "lite");
  assert.equal(resolveQualityTier(base), "cinema");
  assert.equal(resolveQualityTier({ ...base, reducedMotion: true, narrow: true }), "lite");
});
