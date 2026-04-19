import { useEffect, useRef } from "react";
import { useUniverseStore } from "../store/universeStore.js";

/**
 * Layered 2.5D constellation navigator (pure Canvas2D).
 *
 * Layers (back → front):
 *   1. Nebula blooms        — large soft radial gradients, drifting
 *   2. Starfield            — 3 depth classes w/ parallax + twinkle; close stars have a glint cross
 *   3. Perspective grid     — vanishing point near top-center, faint blue lines
 *   4. Constellation nodes  — outline circles + crosshairs; active = gold hexagon + thumbnail card
 *   5. Dust particles       — slow drifting specks that wrap screen edges
 *   + HUD corner brackets
 */

const PALETTE = {
  bg: "#050712",
  grid: "rgba(80,120,200,0.04)",
  bracket: "rgba(255,255,255,0.09)",
  linkLine: "rgba(255,255,255,0.07)",
  linkMid: "rgba(255,255,255,0.18)",
  active: "255,210,100",
};

const NEBULAE = [
  { cxF: 0.28, cyF: 0.38, rxF: 0.55, ryF: 0.42, color: "100,60,180", opacity: 0.07, phase: 0.0, speed: 0.12 },
  { cxF: 0.76, cyF: 0.58, rxF: 0.48, ryF: 0.36, color: "30,80,160", opacity: 0.08, phase: 1.6, speed: 0.09 },
  { cxF: 0.52, cyF: 0.82, rxF: 0.62, ryF: 0.3, color: "160,40,80", opacity: 0.05, phase: 3.0, speed: 0.07 },
];

const CARD_W = 180;
const CARD_H = 110;
const CARD_GAP = 34;
const CARD_W_NARROW = 132;
const CARD_H_NARROW = 84;
const CARD_GAP_NARROW = 20;

function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function generateStars(w, h) {
  const rnd = seeded(0xa5c3);
  const stars = [];
  for (let i = 0; i < 150; i += 1) {
    const roll = rnd();
    let klass;
    if (roll < 0.55) klass = "far";
    else if (roll < 0.8) klass = "mid";
    else klass = "close";
    const r = klass === "far" ? 0.5 : klass === "mid" ? 1 : 1.5;
    const o =
      klass === "far"
        ? 0.15 + rnd() * 0.15
        : klass === "mid"
          ? 0.3 + rnd() * 0.2
          : 0.5 + rnd() * 0.3;
    const parallax = klass === "far" ? 0.1 : klass === "mid" ? 0.3 : 0.6;
    stars.push({
      x: rnd() * w,
      y: rnd() * h,
      r,
      o,
      klass,
      parallax,
      phase: rnd() * Math.PI * 2,
      speed: 0.5 + rnd() * 1.6,
    });
  }
  return stars;
}

function generateDust(w, h) {
  const rnd = seeded(0x51e9);
  const dust = [];
  for (let i = 0; i < 42; i += 1) {
    dust.push({
      x: rnd() * w,
      y: rnd() * h,
      vx: (rnd() - 0.5) * 0.18,
      vy: (rnd() - 0.5) * 0.12,
      r: 0.55 + rnd() * 1.25,
      o: 0.03 + rnd() * 0.12,
    });
  }
  return dust;
}

/**
 * Lay out project nodes to fit any viewport.
 *
 * • Desktop / landscape tablet (≥720px): horizontal arc across 12%–90% width,
 *   ±4.5vh sine wave so labels never stack on the same row.
 * • Portrait phone / narrow (<720px): vertical zig-zag column. Nodes are
 *   distributed top-to-bottom between 16%–84% height, alternating between two
 *   x-columns so the constellation reads naturally on thumb-first layouts and
 *   labels don't collide with the hero overlay.
 */
function layoutNodes(projects, w, h) {
  const sorted = [...projects].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );
  const n = sorted.length;
  const isNarrow = w < 720;

  if (isNarrow) {
    /**
     * Vertical layout — each node gets its own row. Start *below* the hero
     * title (~44% down) so the constellation never collides with the big
     * "Anas / Vhora" block at the top of the viewport, and stop above the
     * "NOW VIEWING" card at the bottom (~84%).
     */
    const topF = 0.44;
    const botF = 0.84;
    const leftColF = 0.3;
    const rightColF = 0.7;
    return sorted.map((p, i) => {
      const u = n === 1 ? 0.5 : i / (n - 1);
      const y = (topF + u * (botF - topF)) * h;
      /** Alternate between two columns for a readable zig-zag. */
      const colF = i % 2 === 0 ? leftColF : rightColF;
      /** Small horizontal jitter so odd node counts don't look too grid-y. */
      const jitterF = 0.04 * Math.sin(u * Math.PI * 2.2);
      const x = (colF + jitterF) * w;
      return {
        slug: p.slug,
        project: p,
        x,
        y,
        parallax: 0.5 + (i % 3) * 0.06,
        /** Labels to the side of the node instead of over the top. */
        labelBelow: true,
        narrow: true,
      };
    });
  }

  /** Wide layout — horizontal arc across 12% → 90%. */
  const leftF = 0.12;
  const rightF = 0.9;
  const usablePx = (rightF - leftF) * w;
  const minGap = 180;
  const maxSpan = Math.min(usablePx, Math.max(minGap * (n - 1), usablePx));
  const startX = (w - maxSpan) / 2;

  return sorted.map((p, i) => {
    const u = n === 1 ? 0.5 : i / (n - 1);
    const x = n === 1 ? w / 2 : startX + u * maxSpan;
    /**
     * Arc centred at 60% of viewport height (was 50%) so the active node's
     * thumbnail card — which floats ~125px above the node — clears the hero
     * tagline cleanly on desktop instead of colliding with it.
     */
    const yF = 0.6 + 0.04 * Math.sin(u * Math.PI * 1.8);
    return {
      slug: p.slug,
      project: p,
      x,
      y: yF * h,
      parallax: 0.6 + (i % 3) * 0.08,
      labelBelow: i % 2 === 0,
      narrow: false,
    };
  });
}

function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function wrapLines(ctx, text, maxW) {
  const words = (text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxW && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function makeGridPattern() {
  const c = document.createElement("canvas");
  c.width = 18;
  c.height = 18;
  const cx = c.getContext("2d");
  cx.clearRect(0, 0, 18, 18);
  cx.strokeStyle = "rgba(255,255,255,0.03)";
  cx.lineWidth = 1;
  cx.beginPath();
  cx.moveTo(0, 0);
  cx.lineTo(18, 0);
  cx.moveTo(0, 0);
  cx.lineTo(0, 18);
  cx.stroke();
  return c;
}

function drawNebulae(ctx, state, t, offX, offY) {
  const { w, h } = state;
  for (const n of NEBULAE) {
    const driftX = Math.sin(t * n.speed + n.phase) * 28;
    const driftY = Math.cos(t * n.speed * 0.7 + n.phase) * 20;
    const cx = n.cxF * w + driftX + offX * 0.3;
    const cy = n.cyF * h + driftY + offY * 0.3;
    const rx = n.rxF * w;
    const ry = n.ryF * h;
    const R = Math.max(rx, ry);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    g.addColorStop(0, `rgba(${n.color},${n.opacity})`);
    g.addColorStop(0.55, `rgba(${n.color},${n.opacity * 0.45})`);
    g.addColorStop(1, `rgba(${n.color},0)`);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(rx / R, ry / R);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawStars(ctx, stars, t, offX, offY) {
  for (let i = 0; i < stars.length; i += 1) {
    const s = stars[i];
    const twinkle = 0.72 + 0.28 * Math.sin(t * s.speed + s.phase);
    const alpha = Math.max(0, Math.min(1, s.o * twinkle));
    const x = s.x + offX * s.parallax;
    const y = s.y + offY * s.parallax;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, s.r, 0, Math.PI * 2);
    ctx.fill();
    if (s.klass === "close") {
      ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.65})`;
      ctx.lineWidth = 0.5;
      const L = 3.2;
      ctx.beginPath();
      ctx.moveTo(x - L, y);
      ctx.lineTo(x + L, y);
      ctx.moveTo(x, y - L);
      ctx.lineTo(x, y + L);
      ctx.stroke();
    }
  }
}

function drawGrid(ctx, w, h, offX, offY) {
  ctx.save();
  ctx.strokeStyle = PALETTE.grid;
  ctx.lineWidth = 0.5;
  const vx = w / 2 + offX * 0.5;
  const vy = h * 0.28 + offY * 0.5;
  const startY = h * 0.56;
  const rows = 9;
  for (let i = 1; i <= rows; i += 1) {
    const t = i / rows;
    const y = startY + (h - startY) * (t * t);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  const rays = 22;
  for (let i = 0; i <= rays; i += 1) {
    const rx = (i / rays) * w;
    ctx.beginPath();
    ctx.moveTo(vx, vy);
    ctx.lineTo(rx, h);
    ctx.stroke();
  }
  ctx.restore();
}

function drawLinks(ctx, nodes, offX, offY, dashOffset) {
  if (nodes.length < 2) return;
  ctx.save();
  ctx.strokeStyle = PALETTE.linkLine;
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 10]);
  ctx.lineDashOffset = dashOffset;
  for (let i = 0; i < nodes.length - 1; i += 1) {
    const a = nodes[i];
    const b = nodes[i + 1];
    const ax = a.x + offX * a.parallax;
    const ay = a.y + offY * a.parallax;
    const bx = b.x + offX * b.parallax;
    const by = b.y + offY * b.parallax;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
    ctx.save();
    ctx.setLineDash([]);
    ctx.fillStyle = PALETTE.linkMid;
    ctx.beginPath();
    ctx.arc((ax + bx) / 2, (ay + by) / 2, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function drawIdleNode(ctx, x, y, node, hovered) {
  ctx.save();
  const alpha = hovered ? 0.38 : 0.22;
  ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.stroke();

  const L = 18;
  ctx.beginPath();
  ctx.moveTo(x - L, y);
  ctx.lineTo(x - 12, y);
  ctx.moveTo(x + 12, y);
  ctx.lineTo(x + L, y);
  ctx.moveTo(x, y - L);
  ctx.lineTo(x, y - 12);
  ctx.moveTo(x, y + 12);
  ctx.lineTo(x, y + L);
  ctx.stroke();

  ctx.fillStyle = hovered
    ? "rgba(255,255,255,0.65)"
    : "rgba(255,255,255,0.4)";
  ctx.beginPath();
  ctx.arc(x, y, 1.2, 0, Math.PI * 2);
  ctx.fill();

  /** Name only — alternating above/below to avoid collisions. */
  const labelYOffset = 24;
  const labelY = node.labelBelow ? y + labelYOffset : y - labelYOffset;
  ctx.textAlign = "center";
  ctx.textBaseline = node.labelBelow ? "top" : "bottom";
  ctx.font =
    '600 9px "JetBrains Mono","IBM Plex Mono","Fira Code",ui-monospace,monospace';
  ctx.fillStyle = hovered
    ? "rgba(255,255,255,0.6)"
    : "rgba(255,255,255,0.25)";
  ctx.fillText((node.project.name || "").toUpperCase(), x, labelY);
  ctx.restore();
}

function drawActiveNode(ctx, x, y, node, t) {
  ctx.save();
  const gold = PALETTE.active;

  /** Pulsing dashed outer ring. */
  const pulseR = 22 + Math.sin(t * 2.2) * 2.6;
  ctx.strokeStyle = `rgba(${gold},0.55)`;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.lineDashOffset = -t * 6;
  ctx.beginPath();
  ctx.arc(x, y, pulseR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  /** Hexagon body. */
  ctx.strokeStyle = `rgba(${gold},1)`;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    const hx = x + Math.cos(a) * 11;
    const hy = y + Math.sin(a) * 11;
    if (i === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.stroke();

  /** Long crosshair. */
  ctx.strokeStyle = `rgba(${gold},0.7)`;
  const L = 22;
  ctx.beginPath();
  ctx.moveTo(x - L, y);
  ctx.lineTo(x - 14, y);
  ctx.moveTo(x + 14, y);
  ctx.lineTo(x + L, y);
  ctx.moveTo(x, y - L);
  ctx.lineTo(x, y - 14);
  ctx.moveTo(x, y + 14);
  ctx.lineTo(x, y + L);
  ctx.stroke();

  ctx.fillStyle = `rgba(${gold},1)`;
  ctx.beginPath();
  ctx.arc(x, y, 2.1, 0, Math.PI * 2);
  ctx.fill();

  /** Label + description + coord always BELOW node. */
  const labelY = y + 28;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  ctx.font =
    '600 10px "JetBrains Mono","IBM Plex Mono","Fira Code",ui-monospace,monospace';
  ctx.fillStyle = `rgba(${gold},0.98)`;
  const name = (node.project.name || "").toUpperCase();
  ctx.fillText(name, x, labelY);

  let cursorY = labelY + 14;
  const desc = node.project.tagline || node.project.roles?.[0] || "";
  if (desc) {
    ctx.font = '9px "JetBrains Mono",ui-monospace,monospace';
    ctx.fillStyle = "rgba(255,255,255,0.68)";
    const lines = wrapLines(ctx, desc, 220);
    for (let i = 0; i < lines.length && i < 2; i += 1) {
      ctx.fillText(lines[i], x, cursorY);
      cursorY += 12;
    }
    cursorY += 2;
  }

  ctx.font = '9px "JetBrains Mono",ui-monospace,monospace';
  ctx.fillStyle = `rgba(${gold},0.7)`;
  const coord = `[${String(Math.round(x) % 1000).padStart(3, "0")}, ${String(Math.round(y) % 1000).padStart(3, "0")}]`;
  ctx.fillText(coord, x, cursorY);

  ctx.restore();
}

function drawCard(ctx, cx, cy, node, imgCache, gridPattern, w, h) {
  /**
   * On narrow viewports the thumbnail floats to the SIDE of the node (opposite
   * the node's column) so the vertical-zig-zag layout stays readable. On wider
   * viewports it floats directly above, as before.
   */
  const narrow = Boolean(node.narrow);
  const cardW = narrow ? CARD_W_NARROW : CARD_W;
  const cardH = narrow ? CARD_H_NARROW : CARD_H;
  const gap = narrow ? CARD_GAP_NARROW : CARD_GAP;

  let cardX;
  let cardY;
  let anchorX;
  let connectX;
  let connectY;
  let lineEndX;
  let lineEndY;

  if (narrow) {
    /** Opposite-side float: if node is left of center, card goes right, vice versa. */
    const goRight = cx < w / 2;
    if (goRight) {
      cardX = Math.min(w - cardW - 10, cx + gap);
      lineEndX = cx + 16;
    } else {
      cardX = Math.max(10, cx - gap - cardW);
      lineEndX = cx - 16;
    }
    /** Vertically clamp the side-floating card within the viewport. */
    const maxCardY = Math.max(10, (h ?? window.innerHeight) - cardH - 10);
    cardY = Math.max(10, Math.min(cy - cardH / 2, maxCardY));
    anchorX = cardX + cardW / 2;
    connectX = goRight ? cardX : cardX + cardW;
    connectY = cardY + cardH / 2;
    lineEndY = cy;
  } else {
    const halfW = cardW / 2;
    const minCX = halfW + 12;
    const maxCX = w - halfW - 12;
    anchorX = Math.max(minCX, Math.min(maxCX, cx));
    cardY = cy - gap - cardH;
    cardX = anchorX - halfW;
    connectX = anchorX;
    connectY = cardY + cardH;
    lineEndX = cx;
    lineEndY = cy - 18;
  }

  ctx.save();
  ctx.strokeStyle = `rgba(${PALETTE.active},0.35)`;
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(connectX, connectY);
  ctx.lineTo(lineEndX, lineEndY);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  roundRectPath(ctx, cardX, cardY, cardW, cardH, 6);
  ctx.fillStyle = "rgba(10,14,28,0.88)";
  ctx.fill();
  ctx.clip();

  const entry = imgCache[node.slug];
  if (entry && entry.loaded) {
    const img = entry.img;
    const ir = img.width / img.height;
    const cr = cardW / cardH;
    let dw;
    let dh;
    let dx;
    let dy;
    if (ir > cr) {
      dh = cardH;
      dw = dh * ir;
      dx = cardX + (cardW - dw) / 2;
      dy = cardY;
    } else {
      dw = cardW;
      dh = dw / ir;
      dx = cardX;
      dy = cardY + (cardH - dh) / 2;
    }
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.fillStyle = "rgba(5,7,18,0.32)";
    ctx.fillRect(cardX, cardY, cardW, cardH);
  } else {
    if (gridPattern) {
      const pat = ctx.createPattern(gridPattern, "repeat");
      if (pat) {
        ctx.fillStyle = pat;
        ctx.fillRect(cardX, cardY, cardW, cardH);
      }
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font =
      '600 11px "JetBrains Mono","IBM Plex Mono","Fira Code",ui-monospace,monospace';
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    const lines = wrapLines(ctx, (node.project.name || "").toUpperCase(), cardW - 24);
    const lineH = narrow ? 12 : 14;
    const startY = cardY + cardH / 2 - ((lines.length - 1) * lineH) / 2;
    for (let i = 0; i < lines.length; i += 1) {
      ctx.fillText(lines[i], anchorX, startY + i * lineH);
    }
  }
  ctx.restore();

  roundRectPath(ctx, cardX, cardY, cardW, cardH, 6);
  ctx.strokeStyle = `rgba(${PALETTE.active},0.3)`;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawDust(ctx, dust, w, h, offX, offY) {
  for (let i = 0; i < dust.length; i += 1) {
    const p = dust[i];
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < -4) p.x = w + 4;
    else if (p.x > w + 4) p.x = -4;
    if (p.y < -4) p.y = h + 4;
    else if (p.y > h + 4) p.y = -4;
    ctx.fillStyle = `rgba(200,220,255,${p.o})`;
    ctx.beginPath();
    ctx.arc(p.x + offX * 0.4, p.y + offY * 0.4, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBrackets(ctx, w, h) {
  ctx.save();
  ctx.strokeStyle = PALETTE.bracket;
  ctx.lineWidth = 1;
  const L = 14;
  const M = 22;
  ctx.beginPath();
  ctx.moveTo(M, M + L);
  ctx.lineTo(M, M);
  ctx.lineTo(M + L, M);

  ctx.moveTo(w - M - L, M);
  ctx.lineTo(w - M, M);
  ctx.lineTo(w - M, M + L);

  ctx.moveTo(M, h - M - L);
  ctx.lineTo(M, h - M);
  ctx.lineTo(M + L, h - M);

  ctx.moveTo(w - M - L, h - M);
  ctx.lineTo(w - M, h - M);
  ctx.lineTo(w - M, h - M - L);
  ctx.stroke();
  ctx.restore();
}

export default function UniverseCanvas({ projects, onStarSelect }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    ctx: null,
    w: 0,
    h: 0,
    dpr: 1,
    time: 0,
    dashOffset: 0,
    pointer: { x: 0, y: 0 },
    pointerTarget: { x: 0, y: 0 },
    /** Uniform camera pan — docks on the focused node; lerped every frame. */
    cam: { x: 0, y: 0 },
    /** Last applied per-frame offsets, so hit-testing matches what's drawn. */
    lastOffX: 0,
    lastOffY: 0,
    focusedSlug: null,
    hoverSlug: null,
    stars: [],
    dust: [],
    nodes: [],
    card: { x: 0, y: 0, initialized: false },
    images: {},
    gridPattern: null,
    projects,
  });

  /** Preload project screenshots once. */
  useEffect(() => {
    const s = stateRef.current;
    s.images = s.images || {};
    for (const p of projects) {
      if (!p.slug || !p.image) continue;
      if (s.images[p.slug]) continue;
      const entry = { img: new Image(), loaded: false };
      entry.img.onload = () => {
        entry.loaded = true;
      };
      entry.img.onerror = () => {
        entry.loaded = false;
      };
      entry.img.src = p.image;
      s.images[p.slug] = entry;
    }
    if (!s.gridPattern) s.gridPattern = makeGridPattern();
  }, [projects]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d", { alpha: false });
    const s = stateRef.current;
    s.ctx = ctx;
    s.projects = projects;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      s.w = w;
      s.h = h;
      s.dpr = dpr;
      s.stars = generateStars(w, h);
      s.dust = generateDust(w, h);
      s.nodes = layoutNodes(projects, w, h);
      s.card.initialized = false;
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [projects]);

  useEffect(() => {
    const apply = (state) => {
      const s = stateRef.current;
      s.pointerTarget.x = state.pointer?.[0] ?? 0;
      s.pointerTarget.y = state.pointer?.[1] ?? 0;
      s.focusedSlug = state.focusedSlug;
    };
    apply(useUniverseStore.getState());
    return useUniverseStore.subscribe(apply);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const findNode = (cx, cy) => {
      const s = stateRef.current;
      let best = null;
      let bestD = 32 * 32;
      for (let i = 0; i < s.nodes.length; i += 1) {
        const n = s.nodes[i];
        /** Use the same transform the draw loop applies, so the click target
         *  matches exactly where the node was just rendered. */
        const nx = n.x + s.cam.x + s.lastOffX * n.parallax;
        const ny = n.y + s.cam.y + s.lastOffY * n.parallax;
        const dx = cx - nx;
        const dy = cy - ny;
        const d2 = dx * dx + dy * dy;
        if (d2 < bestD) {
          bestD = d2;
          best = n;
        }
      }
      return best;
    };

    const setHover = (on) => {
      /** Data attribute drives both native cursor + our custom cursor.
       *  CSS handles the native pointer; CustomCursor reads the dataset. */
      if (on) {
        canvas.dataset.cursor = "pointer";
      } else {
        delete canvas.dataset.cursor;
      }
    };

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const n = findNode(e.clientX - rect.left, e.clientY - rect.top);
      stateRef.current.hoverSlug = n?.slug ?? null;
      setHover(Boolean(n));
    };
    const onClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const n = findNode(e.clientX - rect.left, e.clientY - rect.top);
      if (n?.slug && onStarSelect) onStarSelect(n.slug);
    };
    const onLeave = () => {
      stateRef.current.hoverSlug = null;
      setHover(false);
    };

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("mouseleave", onLeave);
    return () => {
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, [onStarSelect]);

  useEffect(() => {
    let running = true;
    let last = performance.now();
    const frame = (now) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      tick(dt);
      requestAnimationFrame(frame);
    };

    const tick = (dt) => {
      const s = stateRef.current;
      const { ctx, w, h } = s;
      if (!ctx || !w) return;

      s.time += dt;
      s.dashOffset -= dt * 18;

      s.pointer.x += (s.pointerTarget.x - s.pointer.x) * 0.07;
      s.pointer.y += (s.pointerTarget.y - s.pointer.y) * 0.07;

      /**
       * Camera dock: when a node is focused, pan the scene so that node drifts
       * toward a "hero" spot at (50%, 52%). The cursor then adds lean on top —
       * so looking around feels like piloting the viewport.
       */
      const focused = s.nodes.find((n) => n.slug === s.focusedSlug);
      let camTX = 0;
      let camTY = 0;
      const narrow = w < 720;
      if (focused) {
        const targetX = w / 2;
        /**
         * On narrow viewports, dock the active node into the lower-middle
         * (~62% from top) — well below the hero title and well above the
         * "NOW VIEWING" card. Wide viewports keep the previous 52% dock.
         */
        const targetY = narrow ? h * 0.62 : h * 0.7;
        /** Narrow: weaker X pull (nodes are already centered via columns),
         *  stronger Y pull. Wide: original behaviour. */
        camTX = (targetX - focused.x) * (narrow ? 0.15 : 0.45);
        camTY = (targetY - focused.y) * (narrow ? 0.55 : 0.5);
      }
      s.cam.x += (camTX - s.cam.x) * 0.06;
      s.cam.y += (camTY - s.cam.y) * 0.06;

      /** Pointer-driven parallax base (bumped a touch so cursor feel is real).
       *  Dampened on narrow viewports so finger drag / device tilt doesn't
       *  push nodes offscreen. */
      const pScaleX = narrow ? 0.025 : 0.055;
      const pScaleY = narrow ? 0.02 : 0.045;
      const pOffX = -s.pointer.x * w * pScaleX;
      const pOffY = s.pointer.y * h * pScaleY;
      s.lastOffX = pOffX;
      s.lastOffY = pOffY;

      ctx.fillStyle = PALETTE.bg;
      ctx.fillRect(0, 0, w, h);

      /** Uniform camera translate for the whole scene, then per-object parallax. */
      ctx.save();
      ctx.translate(s.cam.x, s.cam.y);

      drawNebulae(ctx, s, s.time, pOffX, pOffY);
      drawStars(ctx, s.stars, s.time, pOffX, pOffY);
      drawGrid(ctx, w, h, pOffX, pOffY);
      drawLinks(ctx, s.nodes, pOffX, pOffY, s.dashOffset);

      /** Draw idle nodes first, then the active one + its card on top. */
      let activeNode = null;
      let activeX = 0;
      let activeY = 0;
      for (let i = 0; i < s.nodes.length; i += 1) {
        const n = s.nodes[i];
        const nx = n.x + pOffX * n.parallax;
        const ny = n.y + pOffY * n.parallax;
        if (n.slug === s.focusedSlug) {
          activeNode = n;
          /** Active position used below by card drawing — in camera space. */
          activeX = nx;
          activeY = ny;
          continue;
        }
        drawIdleNode(ctx, nx, ny, n, n.slug === s.hoverSlug);
      }

      if (activeNode) {
        /** Smoothly tween the card position toward the active node. */
        if (!s.card.initialized) {
          s.card.x = activeX;
          s.card.y = activeY;
          s.card.initialized = true;
        } else {
          s.card.x += (activeX - s.card.x) * 0.18;
          s.card.y += (activeY - s.card.y) * 0.18;
        }
        drawCard(ctx, s.card.x, s.card.y, activeNode, s.images, s.gridPattern, w, h);
        drawActiveNode(ctx, activeX, activeY, activeNode, s.time);
      }

      drawDust(ctx, s.dust, w, h, pOffX, pOffY);
      ctx.restore();

      /** Corner brackets sit on the viewport, not the camera. */
      drawBrackets(ctx, w, h);
    };

    requestAnimationFrame(frame);
    return () => {
      running = false;
    };
  }, []);

  return <canvas ref={canvasRef} className="universe-canvas" />;
}
