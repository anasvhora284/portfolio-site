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
      <span className="hud-nav__glyph hud-nav__glyph--audio" aria-hidden>
        {muted ? (
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 10v4h4l5 4V6L7 10H3Z" />
            <path d="m17 9 4 6" />
            <path d="m21 9-4 6" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 10v4h4l5 4V6L7 10H3Z" />
            <path d="M16 9.5a4.5 4.5 0 0 1 0 5" />
            <path d="M18.8 7a8 8 0 0 1 0 10" />
          </svg>
        )}
      </span>
      <span className="hud-nav__label">Audio</span>
      <span className="hud-nav__state">{stateLabel}</span>
    </button>
  );
}
