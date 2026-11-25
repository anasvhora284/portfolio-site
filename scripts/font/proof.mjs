// Renders a specimen of Orrery (and optionally Bodoni) to a PNG. Usage: node scripts/font/proof.mjs out.png [compare]
import { chromium } from "playwright-core";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const [out = "/tmp/font-proto/proof.png", compare] = process.argv.slice(2);
const f = (n) => "file://" + path.join(root, "public/fonts", n);
const row = (fam, t, s) => `<div style="font-family:'${fam}';font-size:${s}px;line-height:1.15;color:#e8c547;letter-spacing:.02em">${t}</div>`;
const html = `<style>
@font-face{font-family:Orrery;src:url(${f("Orrery-Caps.woff2")})}
@font-face{font-family:Bodoni;src:url(${f("BodoniModa.woff2")});font-weight:400 900}
.bod{font-variation-settings:"opsz" 28;font-weight:600}
body{background:#07080c;margin:30px;color:#888;font:12px sans-serif}</style>
${compare ? row("Bodoni", "ANAS VHORA PORTFOLIO", 150).replace("<div ","<div class=bod ") + "<br>" : ""}
${row("Orrery", "ANAS VHORA PORTFOLIO", 150)}
${row("Orrery", "AN SV HO RP TF LI. — -", 150)}
${row("Orrery", "ANAS VHORA — PORTFOLIO.", 40)}
${row("Orrery", "ANAS VHORA — PORTFOLIO.", 18)}
${process.env.BIG ? row("Orrery","ANSVHO",330)+row("Orrery","RPTFLI.",330) : ""}`;
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
const p = await b.newPage({ viewport: { width: 1700, height: process.env.BIG ? 1700 : compare ? 1000 : 800 } });
fs.writeFileSync("/tmp/font-proto/proof.html", html); await p.goto("file:///tmp/font-proto/proof.html"); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
await p.screenshot({ path: out }); await b.close();
