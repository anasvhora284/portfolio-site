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
const ready = (page, ms = 20000) =>
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

  // --- layout: bodies / labels vs hero text ---
  if (expect === "orrery") {
    const { page, errors } = await open("/?orrery-test");
    await page.waitForSelector(".boot-skip, .hero-overlay__focus", { timeout: 10000 });
    if (await page.locator(".boot-skip").count()) await page.keyboard.press("Enter");
    await page.waitForSelector(".hero-overlay__focus", { timeout: 10000 });
    check("layout: orrery ready", await ready(page));
    const SELS = [".hero-overlay__name", ".hero-overlay__tagline", ".hero-overlay__focus", ".hero-overlay__hint"];
    const overlaps = () =>
      page.evaluate((sels) => {
        // Every body still visible (opacity > 0.5) must stay off the hero text/card/hint; bodies
        // drifting behind them fade out. Ring arcs under the name/tagline are dimmed by the hero scrim (covered by screenshots).
        const bodies = window.__ORRERY_DEBUG__?.bodies?.();
        if (!bodies?.length) return ["no bodies()"];
        const focused = bodies.filter((b) => b.opacity > 0.5);
        const hits = [];
        for (const sel of sels) {
          const r = document.querySelector(sel)?.getBoundingClientRect();
          if (!r) continue;
          for (const b of focused) {
            const dx = b.x - Math.max(r.left, Math.min(b.x, r.right));
            const dy = b.y - Math.max(r.top, Math.min(b.y, r.bottom));
            if (dx * dx + dy * dy < b.r * b.r) hits.push(`${b.slug}@${Math.round(b.x)},${Math.round(b.y)} on ${sel}`);
          }
          for (const el of document.querySelectorAll(".orrery-label, .orrery-pane")) {
            const l = el.getBoundingClientRect();
            if (l.left < r.right && l.right > r.left && l.top < r.bottom && l.bottom > r.top) hits.push(`${el.className} "${el.textContent}" on ${sel}`);
          }
        }
        return hits;
      }, SELS);
    const verify = async (tag) => {
      const hits = await overlaps();
      check(`layout ${tag}: bodies + labels clear of hero text/card/hint`, !hits.length, hits.join("; "));
    };
    // No visible (opacity > 0.5) body may sit on the "Now viewing" card; sample over ~3 s.
    const cardHits = async (tag) => {
      const bad = [];
      for (let i = 0; i < 6; i++) {
        bad.push(
          ...(await page.evaluate(() => {
            const r = document.querySelector(".hero-overlay__focus")?.getBoundingClientRect();
            if (!r) return [];
            return window.__ORRERY_DEBUG__
              .bodies()
              .filter((b) => b.opacity > 0.5)
              .filter((b) => {
                const dx = b.x - Math.max(r.left, Math.min(b.x, r.right));
                const dy = b.y - Math.max(r.top, Math.min(b.y, r.bottom));
                return dx * dx + dy * dy < b.r * b.r;
              })
              .map((b) => `${b.slug}@${Math.round(b.x)},${Math.round(b.y)} o${b.opacity.toFixed(2)}`);
          })),
        );
        await page.waitForTimeout(500);
      }
      check(`card: no visible body on the Now-viewing card (${tag})`, !bad.length, bad.join("; "));
    };
    const order = await page.evaluate(() => window.__ORRERY_DEBUG__.order);
    // ?orrery-test snaps eases: settled = expected project focused and its screen position unchanged for 8 rendered frames
    // (frames are slow on a loaded machine, and React commits the new focus a frame or two late).
    const settle = async (slug) => {
      let pos = "";
      let since = 0;
      for (let i = 0; i < 400; i++) {
        const st = await page.evaluate(() => {
          const f = window.__ORRERY_DEBUG__.bodies().find((b) => b.focused);
          return { fr: window.__ORRERY_DEBUG__.frames(), slug: f?.slug, pos: `${Math.round(f?.x)},${Math.round(f?.y)}` };
        });
        if (slug && st.slug !== slug) {
          since = 0;
        } else if (st.pos !== pos || !since) {
          pos = st.pos;
          since = st.fr;
        } else if (st.fr >= since + 8) return;
        await page.waitForTimeout(250);
      }
    };
    await settle();
    await page.screenshot({ path: `${outDir}/overview-1440.png` });
    await verify("0 presses 1440x900");
    await cardHits("0 presses");
    await page.setViewportSize({ width: 1280, height: 720 });
    await settle();
    await page.screenshot({ path: `${outDir}/overview-1280.png` });
    await verify("0 presses 1280x720");
    await page.setViewportSize({ width: 1440, height: 900 });
    await settle();
    for (let i = 0; i < 3; i++) await page.keyboard.press("ArrowRight");
    await settle(order[3]);
    await page.screenshot({ path: `${outDir}/after3.png` });
    await verify("3 presses");
    await cardHits("3 presses");
    for (let i = 0; i < 4; i++) await page.keyboard.press("ArrowRight");
    await settle(order[7]);
    await page.screenshot({ path: `${outDir}/after7.png` });
    await verify("7 presses");
    await page.setViewportSize({ width: 1280, height: 720 });
    await settle();
    await page.screenshot({ path: `${outDir}/after7-1280.png` });
    await verify("7 presses 1280x720");
    await page.mouse.move(2, 2);
    await page.waitForTimeout(300);
    check("one label with pointer parked top-left", (await page.locator(".orrery-label").count()) === 1);
    const fb = await page.evaluate(() => window.__ORRERY_DEBUG__.bodies().find((b) => b.focused));
    await page.mouse.move(fb.x, fb.y);
    await page.waitForTimeout(300);
    check("hover sets canvas cursor state", await page.evaluate(() => document.querySelector("canvas").dataset.cursor === "pointer"));
    await page.mouse.move(2, 2);
    await page.waitForTimeout(200);
    // hover must be continuous across the drone's footprint (thin arms/plates must not drop it)
    {
      const droneSlug = "auto-balancing-drone";
      const start = await page.evaluate(() => window.__ORRERY_DEBUG__.bodies().find((b) => b.focused)?.slug);
      for (let i = 0; i < order.length; i++) {
        const cur = await page.evaluate(() => window.__ORRERY_DEBUG__.bodies().find((b) => b.focused)?.slug);
        if (cur === droneSlug) break;
        await page.keyboard.press("ArrowRight");
        await settle(order[(order.indexOf(cur) + 1) % order.length]);
      }
      await settle(droneSlug);
      const d = await page.evaluate(() => window.__ORRERY_DEBUG__.bodies().find((b) => b.focused));
      const cursors = [];
      for (let i = 0; i < 15; i++) {
        await page.mouse.move(d.x + (-0.6 + (1.2 * i) / 14) * d.r, d.y);
        await page.waitForTimeout(120);
        cursors.push(await page.evaluate(() => document.querySelector("canvas").dataset.cursor ?? "-"));
      }
      check("drone hover continuous across footprint", d.slug === droneSlug && cursors.every((c) => c === "pointer"), cursors.join(" "));
      await page.mouse.move(2, 2);
      // put focus back where the zone loop below expects it
      for (let i = 0; i < order.length; i++) {
        const cur = await page.evaluate(() => window.__ORRERY_DEBUG__.bodies().find((b) => b.focused)?.slug);
        if (cur === start) break;
        await page.keyboard.press("ArrowRight");
        await settle(order[(order.indexOf(cur) + 1) % order.length]);
      }
      await page.waitForTimeout(200);
    }
    // every project, focused: fully in view inside the safe zone, clear of card + hint
    const zone = async (tag) => {
      const bad = await page.evaluate(() => {
        const f = window.__ORRERY_DEBUG__.bodies().find((b) => b.focused);
        const W = innerWidth, H = innerHeight;
        const hit = (sel) => {
          const r = document.querySelector(sel)?.getBoundingClientRect();
          if (!r) return false;
          const dx = f.x - Math.max(r.left, Math.min(f.x, r.right));
          const dy = f.y - Math.max(r.top, Math.min(f.y, r.bottom));
          return dx * dx + dy * dy < f.r * f.r;
        };
        const ok = f.x > 0.45 * W && f.x < 0.9 * W && f.y > 0.22 * H && f.y < 0.78 * H && !hit(".hero-overlay__hint") && !hit(".hero-overlay__focus");
        return ok ? null : `${f.slug}@${Math.round(f.x)},${Math.round(f.y)} r${Math.round(f.r)} in ${W}x${H}`;
      });
      return bad && `${tag}: ${bad}`;
    };
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(500);
    const zoneBad = [];
    for (let i = 0; i < order.length; i++) {
      await settle(order[(7 + i) % order.length]);
      const bad = await zone(`#${i}`);
      if (bad) zoneBad.push(bad);
      if (i === 2) await page.screenshot({ path: `${outDir}/zone-2.png` });
      await page.keyboard.press("ArrowRight");
    }
    check("focused body in safe zone for all projects at 1440x900", !zoneBad.length, zoneBad.join("; "));
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);
    const zoneBad2 = [];
    for (let i = 0; i < 5; i++) {
      await settle(order[(7 + i) % order.length]);
      const bad = await zone(`#${i}`);
      if (bad) zoneBad2.push(bad);
      await page.keyboard.press("ArrowRight");
    }
    check("focused body in safe zone (5 projects) at 1280x720", !zoneBad2.length, zoneBad2.join("; "));
    // mash: 10 presses in 1 s after the zone loops (7 + n + 5 presses)
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(1500);
    const card = await page.locator(".hero-overlay__focus-name").innerText();
    const labels = await page.locator(".orrery-label").allInnerTexts();
    check("mash: label agrees with card", labels.length === 1 && labels[0] === card, `${labels} vs ${card}`);
    await page.keyboard.press("Enter");
    await page.waitForURL(/\/work\//, { timeout: 5000 }).catch(() => {});
    check("mash: lands on expected project", slugOf(page) === `/work/${order[(7 + order.length + 5 + 10) % order.length]}`, slugOf(page));
    check("layout: no console errors", errors.length === 0, errors.join(" | "));
    await page.close();
  }

  // --- screenshot pane ---
  if (expect === "orrery") {
    const { page, errors } = await open("/?orrery-test");
    await page.waitForSelector(".boot-skip, .hero-overlay__focus", { timeout: 10000 });
    if (await page.locator(".boot-skip").count()) await page.keyboard.press("Enter");
    await page.waitForSelector(".hero-overlay__focus", { timeout: 10000 });
    await ready(page);
    const focusedSlug = () => page.evaluate(() => window.__ORRERY_DEBUG__.bodies().find((b) => b.focused)?.slug);
    const goTo = async (slug) => {
      for (let i = 0; i < 40 && (await focusedSlug()) !== slug; i++) {
        await page.keyboard.press("ArrowRight");
        await page.waitForTimeout(400);
      }
      await page.waitForTimeout(1500);
      // a loaded machine can still be easing/loading: wait for a laid-out pane (absent for imageless projects)
      await page
        .waitForFunction(() => (document.querySelector(".orrery-pane__frame")?.getBoundingClientRect().width ?? 0) >= 200, null, { timeout: 6000 })
        .catch(() => {});
    };
    const paneInfo = () =>
      page.evaluate(() => {
        const p = document.querySelector(".orrery-pane");
        const f = window.__ORRERY_DEBUG__.bodies().find((b) => b.focused);
        if (!p) return { n: 0 };
        const r = p.querySelector(".orrery-pane__frame").getBoundingClientRect();
        const dx = f.x - Math.max(r.left, Math.min(f.x, r.right));
        const dy = f.y - Math.max(r.top, Math.min(f.y, r.bottom));
        return { n: 1, src: p.querySelector("img")?.getAttribute("src")?.slice(0, 60), w: r.width, hitsBody: dx * dx + dy * dy < f.r * f.r, inView: r.right <= innerWidth && r.left >= 0 && r.top >= 0 && r.bottom <= innerHeight };
      });
    await goTo("strong-integrity-guide");
    check("pane: none for strong-integrity-guide", (await paneInfo()).n === 0);
    await goTo("input-leaf");
    const il = await paneInfo();
    check("pane: input-leaf shows its thumb", il.n === 1 && /input-leaf.*\.webp/.test(il.src ?? ""), il.src);
    await page.screenshot({ path: `${outDir}/pane-input-leaf.png` });
    check("pane: clear of body, in view", il.n === 1 && !il.hitsBody && il.inView, JSON.stringify(il));
    for (const slug of ["maths-website", "auto-balancing-drone", "matrimony-pwa"]) {
      await goTo(slug);
      const pi = await paneInfo();
      check(`pane: ${slug} clear of body, in view`, pi.n === 1 && !pi.hitsBody && pi.inView, JSON.stringify(pi));
      await page.screenshot({ path: `${outDir}/pane-${slug}.png` });
      const nw = await page.evaluate(() => document.querySelector(".orrery-pane img")?.naturalWidth ?? 0);
      check(`pane: ${slug} image loaded and <= 1024 px wide`, nw > 0 && nw <= 1024, String(nw));
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForFunction(() => !document.querySelector(".orrery-pane"), null, { timeout: 8000 }).catch(() => {});
    check("pane: absent at 390x844", (await page.locator(".orrery-pane").count()) === 0);
    check("pane: no console errors", errors.length === 0, errors.join(" | "));
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
