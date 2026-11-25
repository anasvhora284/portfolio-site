// Proof sheets for Orrery. Usage: node scripts/font/proof.mjs <outDir> [fontPath]
// Writes all.png (every glyph big), spec.png (site strings, Bodoni vs Orrery), small.png (24/40px).
import { chromium } from "playwright-core";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const [outDir = "/tmp/font-final", font = path.join(root, "public/fonts/Orrery.woff2")] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const bod = "file://" + path.join(root, "public/fonts/BodoniModa.woff2");
const css = `<style>
@font-face{font-family:Orrery;src:url(file://${font})}
@font-face{font-family:Bodoni;src:url(${bod});font-weight:400 900}
.o{font-family:Orrery}.b{font-family:Bodoni;font-variation-settings:"opsz" 28;font-weight:600}
body{background:#07080c;margin:30px;color:#e8c547;font:12px sans-serif}
.r{line-height:1.15;margin:4px 0;white-space:nowrap}</style>`;
const row = (c, t, s, ls = 0.02) => `<div class="r ${c}" style="font-size:${s}px;letter-spacing:${ls}em">${t}</div>`;
const sets = {
  all: [["o", "ABCDEFGHIJKLM", 130], ["o", "NOPQRSTUVWXYZ", 130], ["o", "abcdefghijklm", 130], ["o", "nopqrstuvwxyz", 130],
    ["o", "0123456789 .,:;!?'\"()", 130], ["o", "/\\&amp;@#*+-–—%·→←↗✦’“”", 130]],
  spec: ["ANAS VHORA", "Anas Vhora", "Pristine Aura", "Strong Integrity Guide", "Maths Website", "E-Waste Facility Locator",
    "Auto-Balancing Drone", "Gesture Smart Home", "0123456789", "“Statistics tables without the tedium.”"]
    .flatMap((t) => [["b", t, 64], ["o", t, 64]]),
  small: ["ANAS VHORA", "Pristine Aura", "Strong Integrity Guide — 2024.", "Statistics tables without the tedium."]
    .flatMap((t) => [["o", t, 24], ["b", t, 24], ["o", t, 40], ["b", t, 40]]),
};
if (process.env.BIG) sets.big = process.env.BIG.split("|").map((t) => ["o", t, 300]);
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const p = await b.newPage({ viewport: { width: 1750, height: 900 } });
for (const [name, rows] of Object.entries(process.env.BIG ? { big: sets.big } : sets)) {
  fs.writeFileSync(`${outDir}/${name}.html`, css + rows.map((r) => row(...r)).join(""));
  await p.goto(`file://${outDir}/${name}.html`); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  await p.screenshot({ path: `${outDir}/${name}.png`, fullPage: true });
}
await b.close();
