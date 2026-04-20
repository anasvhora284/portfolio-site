import { useUniverseStore } from "../store/universeStore.js";

export function MuteToggle() {
  const muted = useUniverseStore((s) => s.audioMuted);
  const setAudioMuted = useUniverseStore((s) => s.setAudioMuted);
  const stateLabel = muted ? "Audio off" : "Audio on";

  return (
    <button
      type="button"
      className={`hud-nav__link hud-nav__link--audio ${muted ? "is-muted" : "is-live"}`}
      onClick={() => setAudioMuted(!muted)}
      aria-pressed={!muted}
      aria-label={muted ? "Unmute cinematic audio" : "Mute audio"}
    >
      <span className="hud-nav__glyph" aria-hidden>♪</span>
      <span className="hud-nav__label">Audio</span>
      <span className="hud-nav__state">{stateLabel}</span>
    </button>
  );
}
