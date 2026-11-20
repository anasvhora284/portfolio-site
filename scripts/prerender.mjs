#!/usr/bin/env node
/**
 * Post-build: write dist/<route>/index.html for every route with its own
 * <title>, description, canonical and Open Graph / Twitter tags.
 *
 * The app is an SPA, so link-preview crawlers (LinkedIn, WhatsApp, Slack…)
 * that don't run JS would otherwise see the home page's tags for every link.
 * Netlify serves these static files before the `/* /index.html 200` rewrite.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

// Load content through Vite so asset imports and import.meta.glob resolve.
const vite = await createServer({
  root,
  logLevel: "silent",
  server: { middlewareMode: true },
  appType: "custom",
});
const { projects, siteSettings } = await vite.ssrLoadModule("/src/generated/content.manifest.js");
await vite.close();

const base = (siteSettings?.siteUrl ?? "https://anasvhora.tech").replace(/\/$/, "");
const siteName = siteSettings?.siteTitle ?? "Anas Vhora — Portfolio";
const template = readFileSync(join(dist, "index.html"), "utf8");

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function ogFor(slug) {
  const rel = `/og/${slug}.jpg`;
  return existsSync(join(root, "public", rel)) ? `${base}${rel}` : `${base}/og-image.png`;
}

function render({ path, title, description, image, type = "website" }) {
  const url = `${base}${path}`;
  const t = esc(title);
  const d = esc(description);
  const set = (html, re, value) => {
    if (!re.test(html)) throw new Error(`prerender: pattern not found ${re}`);
    return html.replace(re, value);
  };
  let html = template;
  html = set(html, /<title>[^<]*<\/title>/, `<title>${t}</title>`);
  html = set(html, /(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${d}$2`);
  html = set(html, /(<meta property="og:type" content=")[^"]*(")/, `$1${type}$2`);
  html = set(html, /(<meta property="og:title" content=")[^"]*(")/, `$1${t}$2`);
  html = set(html, /(<meta\s+property="og:description"\s+content=")[^"]*(")/, `$1${d}$2`);
  html = set(html, /(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`);
  html = set(html, /(<meta property="og:image" content=")[^"]*(")/, `$1${image}$2`);
  html = set(html, /(<meta name="twitter:title" content=")[^"]*(")/, `$1${t}$2`);
  html = set(html, /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/, `$1${d}$2`);
  html = set(html, /(<meta name="twitter:image" content=")[^"]*(")/, `$1${image}$2`);
  if (image.endsWith(".jpg")) {
    html = html.replace(
      /<meta property="og:image:type" content="[^"]*" \/>/,
      '<meta property="og:image:type" content="image/jpeg" />',
    );
  }
  html = html.replace("</head>", `    <link rel="canonical" href="${url}" />\n  </head>`);

  const out = join(dist, path, "index.html");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
}

const routes = [
  {
    path: "/work",
    title: `Work · ${siteName}`,
    description:
      "Every project by Anas Vhora — Android tools, Odoo apps, web products and hardware builds.",
    image: `${base}/og-image.png`,
  },
  {
    path: "/about",
    title: `About · ${siteName}`,
    description: "About Anas Vhora — background, experience timeline, and the stack he works in.",
    image: `${base}/og-image.png`,
    type: "profile",
  },
  {
    path: "/contact",
    title: `Contact · ${siteName}`,
    description: "Email, profiles and a direct message form to reach Anas Vhora.",
    image: `${base}/og-image.png`,
  },
  ...projects.map((p) => ({
    path: `/work/${p.slug}`,
    title: `${p.name} · ${siteName}`,
    description: p.tagline || p.description?.slice(0, 180) || "",
    image: ogFor(p.slug),
    type: "article",
  })),
];

routes.forEach(render);
console.log(`[prerender] wrote ${routes.length} routes`);
