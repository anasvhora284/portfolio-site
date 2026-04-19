import { useEffect, useRef, useState } from "react";
import "./CustomCursor.css";

/**
 * Black-hole cursor.
 * - Tiny singularity dot follows the pointer instantly.
 * - A lagging accretion-disk ring trails behind with an easing lerp.
 * - A long gold "orbit" ring expands when hovering interactive elements.
 * - Over text inputs, collapses into a thin caret bar.
 * - Emits a "warp" pulse on click.
 *
 * Disabled on touch devices, coarse pointers, or when the user prefers
 * reduced motion — falls back to the native OS cursor gracefully.
 */
const HOVER_SELECTOR = [
  "a[href]",
  "button",
  '[role="button"]',
  '[data-cursor="hover"]',
  ".cursor-clickable",
  "label.hud-field",
  "summary",
  "select",
].join(",");

const TEXT_SELECTOR = [
  'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"])',
  "textarea",
  '[contenteditable="true"]',
].join(",");

export function CustomCursor() {
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const pulseRef = useRef(null);

  const [enabled, setEnabled] = useState(true);
  const [hover, setHover] = useState(false);
  const [text, setText] = useState(false);
  const [down, setDown] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia(
      "(hover: none), (pointer: coarse), (prefers-reduced-motion: reduce)",
    );
    const onChange = () => setEnabled(!mq.matches);
    onChange();
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      document.body.classList.remove("has-custom-cursor");
      return undefined;
    }
    document.body.classList.add("has-custom-cursor");

    const pos = { x: -100, y: -100, rx: -100, ry: -100, initialized: false };

    const checkHoverState = (target) => {
      let h = false;
      let tx = false;
      if (target?.closest) {
        if (target.closest(TEXT_SELECTOR)) tx = true;
        if (!tx && target.closest(HOVER_SELECTOR)) h = true;
      }
      if (!h && !tx && target) {
        /** Canvas nodes: the canvas sets `data-cursor="pointer"` when hovering a node. */
        if (
          target.classList &&
          target.classList.contains("universe-canvas") &&
          target.dataset &&
          target.dataset.cursor === "pointer"
        ) {
          h = true;
        }
      }
      return { h, tx };
    };

    const onMove = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!pos.initialized) {
        pos.rx = pos.x;
        pos.ry = pos.y;
        pos.initialized = true;
      }
      setHidden(false);
      const { h, tx } = checkHoverState(e.target);
      setHover(h);
      setText(tx);
    };

    const onLeave = () => setHidden(true);
    const onEnter = () => setHidden(false);

    const onDown = (e) => {
      setDown(true);
      if (pulseRef.current) {
        /** Restart the warp-pulse keyframe. */
        pulseRef.current.style.animation = "none";
        pulseRef.current.offsetWidth; /* reflow */
        pulseRef.current.style.animation = "";
        pulseRef.current.dataset.fire = String(Date.now());
      }
      const { h, tx } = checkHoverState(e.target);
      setHover(h);
      setText(tx);
    };
    const onUp = () => setDown(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    window.addEventListener("mouseup", onUp, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    let raf = 0;
    const frame = () => {
      pos.rx += (pos.x - pos.rx) * 0.22;
      pos.ry += (pos.y - pos.ry) * 0.22;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${pos.rx}px, ${pos.ry}px, 0) translate(-50%, -50%)`;
      }
      if (pulseRef.current) {
        pulseRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      cancelAnimationFrame(raf);
      document.body.classList.remove("has-custom-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  const hiddenClass = hidden ? "is-hidden" : "";
  const hoverClass = hover ? "is-hover" : "";
  const textClass = text ? "is-text" : "";
  const downClass = down ? "is-down" : "";

  return (
    <>
      <div
        ref={ringRef}
        className={`cc-ring ${hoverClass} ${textClass} ${downClass} ${hiddenClass}`}
        aria-hidden="true"
      >
        <div className="cc-ring__rotator">
          <svg className="cc-ring__svg" viewBox="0 0 44 44" focusable="false">
            <defs>
              <linearGradient id="cc-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fff4c8" />
                <stop offset="55%" stopColor="#e8c547" />
                <stop offset="100%" stopColor="#9b6d1b" />
              </linearGradient>
            </defs>
            <circle
              cx="22"
              cy="22"
              r="19"
              fill="none"
              stroke="url(#cc-grad)"
              strokeWidth="1"
              strokeDasharray="2 6"
              strokeLinecap="round"
            />
            <circle
              cx="22"
              cy="22"
              r="14"
              fill="none"
              stroke="rgba(255,210,100,0.55)"
              strokeWidth="0.8"
              strokeDasharray="1 4"
            />
          </svg>
        </div>
        <span className="cc-ring__tick cc-ring__tick--t" />
        <span className="cc-ring__tick cc-ring__tick--r" />
        <span className="cc-ring__tick cc-ring__tick--b" />
        <span className="cc-ring__tick cc-ring__tick--l" />
      </div>

      <div
        ref={dotRef}
        className={`cc-dot ${hoverClass} ${textClass} ${downClass} ${hiddenClass}`}
        aria-hidden="true"
      />

      <div
        ref={pulseRef}
        className={`cc-pulse ${down ? "is-fire" : ""} ${hiddenClass}`}
        aria-hidden="true"
      />
    </>
  );
}
