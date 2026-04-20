import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { siteSettings, projects } from "../generated/content.manifest.js";
import { useUniverseStore } from "../store/universeStore.js";
import "./HeroOverlay.css";

function splitName(title) {
  if (!title) return ["Anas", "Vhora"];
  const part = title.split(/[—·|\-:]/)[0].trim();
  const tokens = part.split(/\s+/);
  if (tokens.length >= 2) return [tokens[0], tokens.slice(1).join(" ")];
  return [part, ""];
}

export function HeroOverlay() {
  const navigate = useNavigate();
  const panel = useUniverseStore((s) => s.panel);
  const focusedSlug = useUniverseStore((s) => s.focusedSlug);
  const heroDocked = useUniverseStore((s) => s.heroDocked);

  const focused = useMemo(
    () => (focusedSlug ? projects.find((p) => p.slug === focusedSlug) : null),
    [focusedSlug],
  );

  if (panel) return null;

  const [firstName, lastName] = splitName(siteSettings?.siteTitle);

  return (
    <div
      className={`hero-overlay${heroDocked ? " hero-overlay--docked" : ""}`}
      aria-hidden={panel ? "true" : "false"}
    >
      <div className="hero-overlay__eyebrow">
        <span className="hero-overlay__dot" />
        {siteSettings?.availableForWork ? "Available for work, 2026" : "Portfolio, 2026"}
      </div>

      <h1 className="hero-overlay__name">
        <span className="hero-overlay__name-row">{firstName}</span>
        <span className="hero-overlay__name-row hero-overlay__name-row--outline">
          {lastName || "Portfolio"}
        </span>
      </h1>

      <p className="hero-overlay__tagline">
        {siteSettings?.tagline ?? "Full-stack engineer, product mindset."}
      </p>

      <div className="hero-overlay__hint">
        <span className="hero-overlay__hint-key">Scroll</span>
        <span className="hero-overlay__hint-sep">/</span>
        <span className="hero-overlay__hint-key">←</span>
        <span className="hero-overlay__hint-key">→</span>
        <span className="hero-overlay__hint-text">navigate the constellation</span>
      </div>
      <div className="hero-overlay__mobile-hint" aria-hidden>
        Swipe up/down to browse projects
      </div>

      {focused ? (
        <button
          type="button"
          className="hero-overlay__focus"
          key={focused.slug}
          onClick={() => navigate(`/work/${focused.slug}`)}
        >
          <span className="hero-overlay__focus-label">NOW VIEWING</span>
          <span className="hero-overlay__focus-name">{focused.name}</span>
          {focused.tagline ? (
            <span className="hero-overlay__focus-tagline">{focused.tagline}</span>
          ) : null}
          <span className="hero-overlay__focus-open">
            Open project <span aria-hidden>→</span>
          </span>
        </button>
      ) : null}
    </div>
  );
}
