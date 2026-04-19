import { useEffect, useMemo, useRef, useState } from "react";
import { projects, siteSettings } from "../generated/content.manifest.js";
import { useUniverseStore } from "../store/universeStore.js";
import { playBoot, playBlackHole } from "../audio/useCinematicAudio.js";
import "./BootSequence.css";

const DEFAULT_LINES = [
  "INITIALISING UPLINK ............... OK",
  "LOADING STAR CATALOG .............. {count} OBJECTS",
  "DECRYPTING PORTFOLIO STREAM ....... OK",
  "CALIBRATING WARP DRIVE ............ LOCK",
  "READY",
];

const SCRAMBLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#*+-%".split("");

/**
 * Cinematic boot overlay:
 *   1. grid + scanlines flicker in
 *   2. status lines type out one-by-one while a scan bar sweeps
 *   3. scramble reveal of the site title
 *   4. warp fade-out → hands off to the universe
 */
export function BootSequence() {
  const finishBoot = useUniverseStore((s) => s.finishBoot);
  const skipBoot = useUniverseStore((s) => s.skipBoot);
  const bootPhase = useUniverseStore((s) => s.bootPhase);

  const statusLines = useMemo(() => {
    const custom = siteSettings?.bootMessages;
    const base =
      Array.isArray(custom) && custom.length ? custom : DEFAULT_LINES;
    return base.map((l) => l.replace(/\{count\}/g, String(projects.length)));
  }, []);

  const targetTitle = (siteSettings?.siteTitle || "ANAS VHORA — PORTFOLIO").toUpperCase();

  const [lineIndex, setLineIndex] = useState(-1);
  const [charCount, setCharCount] = useState(0);
  const [scan, setScan] = useState(0);
  const [titleScrambled, setTitleScrambled] = useState(() =>
    randomScramble(targetTitle),
  );
  const [revealCount, setRevealCount] = useState(0);
  const [closing, setClosing] = useState(false);
  const rafRef = useRef(0);

  /**
   * Boot-phase SFX choreography:
   *   t=0     → boot chime (system coming online)
   *   t=close → black-hole whoosh as we warp into the universe
   * Both calls are safe no-ops if audio is muted or hasn't been unlocked
   * by a user gesture yet.
   */
  const bootSfxFiredRef = useRef(false);
  const warpSfxFiredRef = useRef(false);
  useEffect(() => {
    if (bootPhase !== "boot" || bootSfxFiredRef.current) return;
    bootSfxFiredRef.current = true;
    playBoot();
  }, [bootPhase]);

  useEffect(() => {
    if (!closing || warpSfxFiredRef.current) return;
    warpSfxFiredRef.current = true;
    playBlackHole();
  }, [closing]);

  useEffect(() => {
    if (bootPhase !== "boot") return undefined;
    const start = performance.now();
    const typeWindow = 1600;
    const scrambleStart = typeWindow;
    const scrambleWindow = 900;
    const hold = 260;
    const total = typeWindow + scrambleWindow + hold;
    const linesTotal = statusLines.reduce((acc, l) => acc + l.length, 0);

    const tick = (now) => {
      const t = now - start;

      const typeProgress = Math.min(1, t / typeWindow);
      setScan(typeProgress);

      const charsTyped = Math.floor(typeProgress * linesTotal);
      let remaining = charsTyped;
      let li = 0;
      let cc = 0;
      for (let i = 0; i < statusLines.length; i += 1) {
        const len = statusLines[i].length;
        if (remaining <= len) {
          li = i;
          cc = remaining;
          break;
        }
        remaining -= len;
        li = i;
        cc = len;
      }
      setLineIndex(li);
      setCharCount(cc);

      if (t >= scrambleStart) {
        const scP = Math.min(1, (t - scrambleStart) / scrambleWindow);
        const revealed = Math.floor(scP * targetTitle.length);
        setRevealCount(revealed);
        setTitleScrambled(
          targetTitle
            .split("")
            .map((ch, i) => {
              if (i < revealed || ch === " " || ch === "—" || ch === "-") return ch;
              return SCRAMBLE[(Math.floor(now / 35) + i * 7) % SCRAMBLE.length];
            })
            .join(""),
        );
      }

      if (t >= total) {
        setRevealCount(targetTitle.length);
        setTitleScrambled(targetTitle);
        setClosing(true);
        window.setTimeout(() => finishBoot(), 620);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [bootPhase, finishBoot, statusLines, targetTitle]);

  if (bootPhase !== "boot") return null;

  const renderedLines = statusLines.map((line, i) => {
    if (i < lineIndex) return { text: line, done: true };
    if (i === lineIndex)
      return { text: line.slice(0, charCount), done: false, cursor: true };
    return { text: "", done: false };
  });

  return (
    <div
      className={`boot-overlay ${closing ? "is-closing" : ""}`}
      role="dialog"
      aria-label="Loading"
      aria-live="polite"
    >
      <div className="boot-grid" aria-hidden />
      <div className="boot-scanlines" aria-hidden />
      <div className="boot-vignette" aria-hidden />

      <button type="button" className="boot-skip" onClick={skipBoot}>
        Skip intro <span aria-hidden>→</span>
      </button>

      <div className="boot-corner boot-corner--tl" aria-hidden />
      <div className="boot-corner boot-corner--tr" aria-hidden />
      <div className="boot-corner boot-corner--bl" aria-hidden />
      <div className="boot-corner boot-corner--br" aria-hidden />

      <div className="boot-top-strip" aria-hidden>
        <span>SYS · ANV-01</span>
        <span className="boot-top-strip__dot" />
        <span>UPLINK ACTIVE</span>
        <span className="boot-top-strip__dot" />
        <span>{new Date().toISOString().slice(0, 10)}</span>
      </div>

      <div className="boot-stage">
        <div className="boot-title-wrap">
          <div className="boot-eyebrow">
            <span className="boot-dot" /> CONSTELLATION NAVIGATOR · v1.0
          </div>
          <h1 className="boot-title">
            <span className="boot-title__ghost" aria-hidden>
              {targetTitle}
            </span>
            <span
              className="boot-title__live"
              aria-label={targetTitle}
              style={{ "--reveal": `${Math.min(100, (revealCount / targetTitle.length) * 100)}%` }}
            >
              {titleScrambled}
            </span>
          </h1>
          <div className="boot-subtitle">{siteSettings?.tagline ?? ""}</div>
        </div>

        <div className="boot-console">
          <div className="boot-console__head">
            <span className="boot-console__hdot boot-console__hdot--r" />
            <span className="boot-console__hdot boot-console__hdot--y" />
            <span className="boot-console__hdot boot-console__hdot--g" />
            <span className="boot-console__label">SYS / BOOT</span>
          </div>
          <pre className="boot-log">
            {renderedLines.map((r, i) => (
              <span key={i} className={`boot-log__row ${r.done ? "is-done" : ""}`}>
                <span className="boot-log__prompt">›</span> {r.text}
                {r.cursor ? <span className="boot-log__caret" /> : null}
                {"\n"}
              </span>
            ))}
          </pre>
          <div className="boot-bar" aria-hidden>
            <div className="boot-bar__track" />
            <div
              className="boot-bar__fill"
              style={{ width: `${Math.round(scan * 100)}%` }}
            />
            <div className="boot-bar__tick" style={{ left: `${Math.round(scan * 100)}%` }} />
          </div>
          <div className="boot-meta">
            <span>OBJECTS · {projects.length}</span>
            <span>{siteSettings?.statusLine ?? "SYS / CONSTELLATION"}</span>
            <span>{Math.round(scan * 100)}%</span>
          </div>
        </div>
      </div>

      <div className="boot-warp" aria-hidden />
    </div>
  );
}

function randomScramble(str) {
  return str
    .split("")
    .map((ch) =>
      ch === " " || ch === "—" || ch === "-"
        ? ch
        : SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)],
    )
    .join("");
}
