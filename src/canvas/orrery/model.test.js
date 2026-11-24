import test from "node:test";
import assert from "node:assert/strict";
import { ringKeyOf, layoutBodies, frontRotation, clampDelta } from "./model.js";

const TAU = Math.PI * 2;
const mod = (x) => ((x % TAU) + TAU) % TAU;

test("ringKeyOf priority", () => {
  const cases = [
    [["Full-stack", "Odoo"], "Odoo"],
    [["IoT", "Embedded"], "Hardware"],
    [["IoT", "ML"], "Hardware"],
    [["Mobile", "Systems"], "Mobile"],
    [["Systems", "Android"], "Mobile"],
    [["Full-stack", "Mobile"], "Mobile"],
    [["Frontend"], "Web"],
    [[], "Web"],
  ];
  for (const [roles, want] of cases) assert.equal(ringKeyOf(roles), want);
});

test("layoutBodies spacing and determinism", () => {
  const ps = [
    { slug: "a", roles: ["Frontend"], sortOrder: 5 },
    { slug: "b", roles: ["Odoo"], sortOrder: 2 },
    { slug: "c", roles: [], sortOrder: 9 },
    { slug: "d", roles: ["Odoo"], sortOrder: 1 },
    { slug: "e", roles: ["Web"], sortOrder: 3 },
  ];
  const out = layoutBodies(ps);
  assert.deepEqual(out.map((b) => b.slug).sort(), ["a", "b", "c", "d", "e"]);
  for (const ring of ["Web", "Odoo"]) {
    const as = out
      .filter((b) => b.ring === ring)
      .map((b) => b.angle)
      .sort((x, y) => x - y);
    for (let i = 1; i < as.length; i++)
      assert.ok(Math.abs(as[i] - as[i - 1] - TAU / as.length) < 1e-9);
    as.forEach((a) => assert.ok(a >= 0 && a < TAU));
  }
  assert.deepEqual(layoutBodies(ps), out);
});

test("frontRotation", () => {
  assert.ok(Math.abs(frontRotation(0, Math.PI / 2, 0) + Math.PI / 2) < 1e-9);
  assert.ok(
    Math.abs(frontRotation(6 * Math.PI, 0.1, 0) - 6 * Math.PI) <=
      Math.PI + 1e-9,
  );
  for (let i = 0; i < 200; i++) {
    const cur = (Math.random() - 0.5) * 100,
      b = Math.random() * TAU,
      f = Math.random() * TAU;
    const r = frontRotation(cur, b, f);
    assert.ok(Math.abs(r - cur) <= Math.PI + 1e-9);
    const m = mod(b + r - f);
    assert.ok(Math.min(m, TAU - m) < 1e-9);
  }
});

test("clampDelta", () => {
  assert.equal(clampDelta(0.016), 0.016);
  assert.equal(clampDelta(60), 0.05);
});
