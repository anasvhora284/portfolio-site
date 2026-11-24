// Usage: node scripts/orrery-check.mjs <baseUrl> <outDir> [--expect 2d|orrery] [--reduced-motion]
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const [base, outDir, ...rest] = process.argv.slice(2);
const flag = (n) => rest.includes(n);
const expect = rest[rest.indexOf("--expect") + 1] === "2d" ? "2d" : "orrery";
mkdirSync(outDir, { recursive: true });

let failed = 0;
const check = (name, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${extra ? ` (${extra})` : ""}`);
  if (!ok) failed++;
};

const browser = await chromium.launch({
  executablePath: "/usr/bin/google-chrome",
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: flag("--reduced-motion") ? "reduce" : "no-preference",
});

async function open(path) {
  const page = await ctx.newPage();
  const errors = [];
  const requests = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("request", (r) => requests.push(r.url()));
  await page.addInitScript(() => {
    new MutationObserver((_, o) => {
      if (document.getElementById("case-title")) {
        performance.mark("case-title");
        o.disconnect();
      }
    }).observe(document, { childList: true, subtree: true });
  });
  await page.goto(base + path);
  return { page, errors, requests };
}
const ready = (page, ms = 10000) =>
  page.waitForSelector('[data-orrery="ready"]', { timeout: ms }).then(() => true, () => false);
const focusOk = (page) =>
  page.evaluate(() => document.activeElement?.classList.contains("hero-overlay__focus"));
const slugOf = (page) => new URL(page.url()).pathname;

try {
  // --- home ---
  {
    const { page, errors } = await open("/");
    await page.waitForSelector(".boot-skip, .hero-overlay__focus", { timeout: 10000 });
    // reduced-motion visitors skip boot on their own; Enter would then open the hero card.
    if (await page.locator(".boot-skip").count()) await page.keyboard.press("Enter");
    await page.waitForSelector(".hero-overlay__focus", { timeout: 10000 });
    if (expect === "orrery") {
      check("orrery ready", await ready(page));
    } else {
      await page.waitForSelector("canvas", { timeout: 10000 });
      await page.waitForTimeout(1000);
      check("2D canvas, no orrery", (await page.locator("[data-orrery]").count()) === 0);
    }
    await page.screenshot({ path: `${outDir}/home.png` });
    check("focus on hero card after boot skip", await focusOk(page));

    if (expect === "orrery") {
      const order = await page.evaluate(() => window.__ORRERY_DEBUG__?.order);
      check("debug order exposed", Array.isArray(order) && order.length >= 4);
      for (let i = 0; i < 3; i++) await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(500);
      const name = await page.locator(".hero-overlay__focus-name").innerText();
      await page.screenshot({ path: `${outDir}/focus-4th.png` });
      await page.keyboard.press("Enter");
      await page.waitForURL(/\/work\//, { timeout: 5000 }).catch(() => {});
      check("Enter opens 4th project by sortOrder", slugOf(page) === `/work/${order?.[3]}`, `${slugOf(page)} ${name}`);
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${outDir}/case.png` });
      await page.keyboard.press("Escape");
      await page.waitForURL((u) => u.pathname === "/", { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(500);
      check("Esc returns to /", slugOf(page) === "/");
      check("focus back on hero card", await focusOk(page));
    }
    check("home: no console errors", errors.length === 0, errors.join(" | "));
    await page.close();
  }

  // --- deep link ---
  if (expect === "orrery") {
    const { page, errors } = await open("/work/maths-website");
    await page.waitForSelector("#case-title", { state: "visible", timeout: 10000 });
    await page.waitForTimeout(3000); // let the idle load fire
    // in-page clock: when #case-title entered the DOM vs when the Orrery chunk was requested
    const t = await page.evaluate(() => {
      const title = performance.getEntriesByType("mark").find((m) => m.name === "case-title");
      const req = performance.getEntriesByType("resource").find((r) => r.name.includes("Orrery"));
      return { title: title?.startTime, req: req?.startTime };
    });
    check("deep link: Orrery chunk requested after case title rendered", t.title != null && (t.req == null || t.req >= t.title), JSON.stringify(t));
    await page.screenshot({ path: `${outDir}/deeplink.png` });
    await page.keyboard.press("Escape");
    check("deep link: orrery ready after Esc", await ready(page));
    check("deep link: no console errors", errors.length === 0, errors.join(" | "));
    await page.close();
  }
} catch (e) {
  check("script ran to completion", false, String(e));
}
await browser.close();
process.exit(failed ? 1 : 0);
