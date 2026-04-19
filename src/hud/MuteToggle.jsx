import { useUniverseStore } from "../store/universeStore.js";

export function MuteToggle() {
  const muted = useUniverseStore((s) => s.audioMuted);
  const setAudioMuted = useUniverseStore((s) => s.setAudioMuted);

  return (
    <button
      type="button"
      className="hud-nav__link"
      onClick={() => setAudioMuted(!muted)}
      aria-pressed={!muted}
      aria-label={muted ? "Unmute cinematic audio" : "Mute audio"}
    >
      {muted ? "Audio: off" : "Audio: on"}
    </button>
  );
}
