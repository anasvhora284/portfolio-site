import { create } from "zustand";
import { OVERVIEW_CAMERA } from "../canvas/dockCamera.js";

const STORAGE_AUDIO = "portfolio_audio_muted";

/**
 * Play the cinematic boot every page load — that first-second experience is
 * part of the product. We intentionally do NOT persist "seen" across reloads.
 */
const initialBoot = /** @type {'boot' | 'ready'} */ ("boot");

export const useUniverseStore = create((set) => ({
  bootPhase: /** @type {'boot' | 'ready'} */ (initialBoot),
  qualityTier: /** @type {'cinema' | 'balanced' | 'lite'} */ ("cinema"),
  panel: /** @type {null | 'project' | 'about' | 'contact'} */ (null),
  targetSlug: /** @type {string | null} */ (null),
  /**
   * Audio is ON by default so the cinematic shuttle-interior bed plays
   * from the first user gesture onward. A persisted `"1"` in localStorage
   * keeps the user's explicit mute choice across visits. Browsers will
   * still hold everything silent until a pointerdown / keydown unlocks
   * Web Audio — see useCinematicAudio.js.
   */
  audioMuted:
    typeof window !== "undefined"
      ? window.localStorage.getItem(STORAGE_AUDIO) === "1"
      : false,
  warping: false,
  /** @type {[number, number, number]} */
  cameraTarget: [...OVERVIEW_CAMERA],
  /** Normalised pointer position [-1, 1] for camera parallax. */
  pointer: /** @type {[number, number]} */ ([0, 0]),
  focusedSlug: /** @type {string | null} */ (null),

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

  setWarping: (v) => set({ warping: v }),

  setCameraTarget: (vec) =>
    set({
      cameraTarget: Array.isArray(vec) ? [...vec] : [vec.x, vec.y, vec.z],
    }),

  setPointer: (x, y) => set({ pointer: [x, y] }),

  setFocusedSlug: (slug) => set({ focusedSlug: slug }),
}));

export { STORAGE_AUDIO };
