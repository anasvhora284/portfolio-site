import { create } from "zustand";
import { resolveQualityTier } from "./qualityTier.js";

const STORAGE_AUDIO = "portfolio_audio_muted";

/**
 * Play the cinematic boot on every home-page load — that first-second
 * experience is part of the product. Deep links (/work/…, /about, /contact)
 * and reduced-motion visitors go straight to the content they asked for.
 */
const initialBoot = /** @type {'boot' | 'ready'} */ (
  typeof window !== "undefined" &&
  (window.location.pathname !== "/" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    ? "ready"
    : "boot"
);

// Resolved synchronously so the first client render already knows the tier.
// SSR/prerender (no window) stays 'lite' so it never pulls in 3D.
const initialTier = /** @type {'cinema' | 'balanced' | 'lite'} */ (
  typeof window === "undefined"
    ? "lite"
    : resolveQualityTier({
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        saveData: Boolean(navigator.connection?.saveData),
        narrow: window.matchMedia("(max-width: 768px)").matches,
        cores: navigator.hardwareConcurrency || 8,
        noWebgl: !window.WebGLRenderingContext,
      })
);

export const useUniverseStore = create((set) => ({
  bootPhase: /** @type {'boot' | 'ready'} */ (initialBoot),
  qualityTier: /** @type {'cinema' | 'balanced' | 'lite'} */ (initialTier),
  panel: /** @type {null | 'project' | 'about' | 'contact'} */ (null),
  targetSlug: /** @type {string | null} */ (null),
  /**
   * Audio starts muted by default to avoid a jarring first impression.
   * Persisted values:
   *   "1" => muted
   *   "0" => unmuted
   * Missing key falls back to muted.
   */
  audioMuted:
    typeof window !== "undefined"
      ? window.localStorage.getItem(STORAGE_AUDIO) !== "0"
      : true,
  /** Normalised pointer position [-1, 1] for camera parallax. */
  pointer: /** @type {[number, number]} */ ([0, 0]),
  focusedSlug: /** @type {string | null} */ (null),
  /**
   * Mobile hero compaction flag:
   * false => big cinematic name block
   * true  => compact docked title (frees vertical room for nodes/cards)
   */
  heroDocked:
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 720px)").matches
      : false,

  setQualityTier: (tier) => set({ qualityTier: tier }),

  setAudioMuted: (muted) => {
    try {
      /** "1" = muted, "0" = explicitly unmuted. Absence also means unmuted. */
      window.localStorage.setItem(STORAGE_AUDIO, muted ? "1" : "0");
    } catch {
      /* ignore */
    }
    set({ audioMuted: muted });
  },

  hasSeenBoot: () => false,

  markBootSeen: () => {},

  skipBoot: () => set({ bootPhase: "ready" }),

  finishBoot: () => set({ bootPhase: "ready" }),

  setPanel: (panel, slug = null) => set({ panel, targetSlug: slug }),

  closePanel: () => set({ panel: null, targetSlug: null }),

  setPointer: (x, y) => set({ pointer: [x, y] }),

  setFocusedSlug: (slug) => set({ focusedSlug: slug }),

  setHeroDocked: (v) => set({ heroDocked: Boolean(v) }),
}));

export { STORAGE_AUDIO };

/**
 * Where the "dive into a star" reveal starts, in viewport px. The canvas
 * writes the focused star's screen position every frame (plain mutable
 * object — no React re-renders); a click elsewhere (e.g. the Work index)
 * can set a one-shot override.
 */
export const starScreen = { x: null, y: null };
let diveOverride = null;

export function setDiveOrigin(x, y) {
  diveOverride = { x, y };
}

export function takeDiveOrigin() {
  const o = diveOverride;
  diveOverride = null;
  if (o) return o;
  if (starScreen.x != null) return { x: starScreen.x, y: starScreen.y };
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
}
