import { useEffect } from "react";
import { Howl, Howler } from "howler";
import { useUniverseStore } from "../store/universeStore.js";

/**
 * Ambient-only audio engine.
 *
 * Keeps a low, constant humming bed while `audioMuted` is false.
 * All interactive SFX helpers are intentionally no-ops.
 */

const BASE_AMBIENT_VOL = 0.14;

/**
 * Shared audio state. Held at module scope so the hook and the exported
 * play helpers share a single set of Howl instances.
 */
const state = {
  /** @type {Howl | null} */
  ambient: null,
  ambientFailed: false,
  ambientStarted: false,
};
export function playFx() {}
export const playWarp = () => {};
export const playPing = () => {};
export const playClick = () => {};
export const playDoorOpen = () => {};
export const playDoorClose = () => {};
export const playBoot = () => {};
export const playBlackHole = () => {};

/* ------------------------------------------------------------------------ */
/*                           Ambient lifecycle                               */
/* ------------------------------------------------------------------------ */

function ensureAmbient() {
  if (state.ambient || state.ambientFailed) return state.ambient;
  try {
    state.ambient = new Howl({
      src: ["/audio/ambient.wav"],
      format: ["wav"],
      loop: true,
      volume: BASE_AMBIENT_VOL,
      preload: true,
      onloaderror: () => {
        state.ambientFailed = true;
        state.ambient = null;
      },
    });
  } catch {
    state.ambientFailed = true;
    state.ambient = null;
  }
  return state.ambient;
}

function startAmbient() {
  const h = ensureAmbient();
  if (!h) return;
  if (!h.playing()) {
    const play = () => {
      try {
        h.volume(BASE_AMBIENT_VOL);
        h.play();
        state.ambientStarted = true;
      } catch {
        /* ignore */
      }
    };
    if (h.state() === "unloaded") {
      h.once("load", play);
      h.load();
    } else {
      play();
    }
  }
}

function stopAmbient() {
  state.ambientStarted = false;
  const h = state.ambient;
  if (!h) return;
  try {
    h.stop();
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------------ */
/*                                 Hook                                      */
/* ------------------------------------------------------------------------ */

/**
 * Mount once at the root. Owns the ambient track's lifecycle and unlocks
 * Web Audio on the first user gesture. Returns the SFX helpers for
 * convenience, but they are also importable directly as module exports.
 */
export function useCinematicAudio() {
  const muted = useUniverseStore((s) => s.audioMuted);

  /** Unlock WebAudio on the first user gesture (required by all browsers). */
  useEffect(() => {
    let unlocked = false;
    const unlock = () => {
      if (unlocked) return;
      unlocked = true;
      try {
        if (Howler.ctx && Howler.ctx.state === "suspended") {
          Howler.ctx.resume();
        }
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock, { passive: true });
    window.addEventListener("touchstart", unlock, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  /** Ambient start/stop follows the mute flag. */
  useEffect(() => {
    if (muted) {
      stopAmbient();
      return;
    }
    startAmbient();
  }, [muted]);

  return {
    playWarp,
    playPing,
    playClick,
    playDoorOpen,
    playDoorClose,
    playBoot,
    playBlackHole,
    playFx,
  };
}
